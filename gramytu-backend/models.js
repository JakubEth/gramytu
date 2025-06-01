const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: String,
  location: {
    lat: Number,
    lng: Number,
    name: String,
  },
  host: String,
  contact: String,
  type: String,        // <-- dodane pole typu
  tags: [String],
  likes: [String],
  comments: [{ user: String, text: String }]
});

const UserSchema = new mongoose.Schema({
  name: String,
});

module.exports = {
  Event: mongoose.model('Event', EventSchema),
  User: mongoose.model('User', UserSchema),
};
