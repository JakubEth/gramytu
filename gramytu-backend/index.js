const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { Event, User } = require('./models');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    type: req.body.type,   // <-- dodane
    tags: req.body.tags,
    likes: req.body.likes || [],
    comments: req.body.comments || []
  });
  await event.save();
  res.json(event);
});

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API on ${PORT}`)))
  .catch(console.error);
