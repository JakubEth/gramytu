const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { Event, User } = require('./models');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Pobierz wszystkie eventy
app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Utwórz event (host i hostId MUSZĄ być przekazane z frontu)
app.post('/events', async (req, res) => {
  const event = new Event({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    host: req.body.host,         // <-- nick organizatora
    hostId: req.body.hostId,     // <-- ID organizatora
    contact: req.body.contact,
    type: req.body.type,
    tags: req.body.tags,
    likes: req.body.likes || [],
    comments: req.body.comments || []
  });
  await event.save();
  res.json(event);
});

// Pobierz usera po ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    res.json({ 
      _id: user._id,
      username: user.username,
      avatar: user.avatar || null
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Rejestracja
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Nick i hasło są wymagane" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Nick jest już zajęty" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({ 
      token,
      user: { _id: newUser._id, username: newUser.username }
    });
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Logowanie
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowy nick lub hasło" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Nieprawidłowy nick lub hasło" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({ 
      ok: true,
      token,
      user: { _id: user._id, username: user.username }
    });
  } catch (error) {
    console.error("Błąd logowania:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// PATCH: zmiana nicku i update nicku w eventach
app.patch('/users/:id', async (req, res) => {
  try {
    const { username, password, avatar } = req.body;
    const update = {};
    if (username) update.username = username;
    if (avatar) update.avatar = avatar;
    if (password) update.password = await bcrypt.hash(password, 10);

    // Pobierz starego usera
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    // Jeśli zmieniono nick, zaktualizuj we wszystkich eventach
    if (username && username !== oldUser.username) {
      await Event.updateMany(
        { hostId: oldUser._id },
        { $set: { host: username } }
      );
    }

    // Zaktualizuj usera
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ _id: user._id, username: user.username, avatar: user.avatar });
  } catch (error) {
    console.error("Błąd aktualizacji użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API działa na porcie ${PORT}`));
    console.log("Połączono z MongoDB");
  })
  .catch(err => {
    console.error("Błąd połączenia z MongoDB:", err);
    process.exit(1);
  });
