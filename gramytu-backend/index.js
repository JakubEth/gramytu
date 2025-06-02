const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

const { Event, User, ChatMessage } = require('./models');
const app = express();
const server = http.createServer(app);

// --- SOCKET.IO SETUP ---
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- MIDDLEWARE AUTORYZACJI ---
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Brak tokenu autoryzacyjnego" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ error: "Nieprawidłowy token" });
    next();
  } catch (error) {
    res.status(401).json({ error: "Nieprawidłowy token" });
  }
};

// --- ENDPOINTY EVENTÓW ---

app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.get('/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/events', async (req, res) => {
  const event = new Event({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    host: req.body.host,
    hostId: req.body.hostId,
    type: req.body.type,
    tags: req.body.tags,
    likes: req.body.likes || [],
    comments: req.body.comments || [],
    image: req.body.image,
    maxParticipants: req.body.maxParticipants,
    paid: req.body.paid,
    price: req.body.price,
    participants: req.body.participants || []
  });
  await event.save();
  res.json(event);
});

app.post('/events/:id/like', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
    if (!event.likes.map(id => id.toString()).includes(req.user._id.toString())) {
      event.likes.push(req.user._id);
      await event.save();
    }
    res.json({ likes: event.likes.length });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/events/:id/unlike', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
    event.likes = event.likes.filter(id => id.toString() !== req.user._id.toString());
    await event.save();
    res.json({ likes: event.likes.length });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/events/:id/comment', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "Komentarz nie może być pusty" });

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });

    const comment = {
      user: req.user._id,
      username: req.user.username,
      text: text.trim(),
      createdAt: new Date()
    };
    event.comments.push(comment);
    await event.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

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

app.patch('/users/:id', async (req, res) => {
  try {
    const { username, password, avatar } = req.body;
    const update = {};
    if (username) update.username = username;
    if (avatar) update.avatar = avatar;
    if (password) update.password = await bcrypt.hash(password, 10);

    const oldUser = await User.findById(req.params.id);
    if (!oldUser) return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    if (username && username !== oldUser.username) {
      await Event.updateMany(
        { hostId: oldUser._id },
        { $set: { host: username } }
      );
      await Event.updateMany(
        { "comments.user": oldUser._id },
        { $set: { "comments.$[elem].username": username } },
        { arrayFilters: [{ "elem.user": oldUser._id }] }
      );
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ _id: user._id, username: user.username, avatar: user.avatar });
  } catch (error) {
    console.error("Błąd aktualizacji użytkownika:", error);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete('/events/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
    if (event.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Brak uprawnień do usunięcia tego wydarzenia" });
    }
    await Event.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/events/:id/join', auth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
  if (event.participants.length >= event.maxParticipants)
    return res.status(400).json({ error: "Brak wolnych miejsc" });
  if (event.participants.includes(req.user._id))
    return res.status(400).json({ error: "Już jesteś zapisany" });
  event.participants.push(req.user._id);
  await event.save();
  res.json({ ok: true });
});

app.get('/events/:id/participants', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('participants', 'username avatar');
    if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
    res.json(event.participants);
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// --- TRWAŁY CZAT GRUPOWY ---
// Pobierz historię czatu dla eventu
app.get('/events/:id/chat', async (req, res) => {
  const messages = await ChatMessage.find({ eventId: req.params.id })
    .sort({ createdAt: 1 })
    .select('username text createdAt userId');
  res.json(messages);
});

// --- SOCKET.IO CZAT GRUPOWY DLA EVENTÓW ---
io.on('connection', (socket) => {
  socket.on('joinEventChat', ({ eventId, token }) => {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(eventId);
      socket.user = user;
      socket.eventId = eventId;
    } catch (e) {
      // Nieprawidłowy token
    }
  });

  socket.on('eventMessage', async ({ eventId, text }) => {
    if (!socket.user || !eventId || !text?.trim()) return;
    // ZAPISZ WIADOMOŚĆ DO BAZY
    const msg = await ChatMessage.create({
      eventId,
      userId: socket.user.userId,
      username: socket.user.username,
      text,
    });
    io.to(eventId).emit('eventMessage', {
      username: msg.username,
      userId: msg.userId,
      text: msg.text,
      createdAt: msg.createdAt
    });
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`API działa na porcie ${PORT}`));
    console.log("Połączono z MongoDB");
  })
  .catch(err => {
    console.error("Błąd połączenia z MongoDB:", err);
    process.exit(1);
  });
