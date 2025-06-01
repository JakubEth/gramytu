const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String // jeśli chcesz obsługę avatara
});

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  location: {
    lat: Number,
    lng: Number,
    name: String,
  },
  host: String, // nazwa organizatora (nick)
  hostId: {     // ID organizatora (referencja)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contact: String,
  type: String,
  tags: [String],
  likes: [String],
  comments: [{ user: String, text: String }]
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Event: mongoose.model('Event', EventSchema),
};
