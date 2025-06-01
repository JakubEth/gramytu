const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { Event, User } = require('./models');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/events', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

app.post('/events', async (req, res) => {
  const event = new Event(req.body);
  await event.save();
  res.json(event);
});

app.post('/users', async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(4000, () => console.log('API on 4000')))
  .catch(console.error);
