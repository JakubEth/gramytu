const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { Event, User } = require('./models');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpointy dla eventów
app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post('/events', async (req, res) => {
  const event = new Event({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    host: req.body.host,
    contact: req.body.contact,
    type: req.body.type,
    tags: req.body.tags,
    likes: req.body.likes || [],
    comments: req.body.comments || []
  });
  await event.save();
  res.json(event);
});

// Nowa rejestracja użytkownika
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
    const newUser = new User({ 
      username, 
      password: hashedPassword 
    });
    
    await newUser.save();
    res.status(201).json({ 
      _id: newUser._id,
      username: newUser.username
    });

  } catch (error) {
    console.error("Błąd rejestracji:", error);
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
