const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: String
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
  host: String,
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact: String,
  type: {
    type: String,
    enum: ['planszowka', 'komputerowa', 'fizyczna', 'inne'],
    default: 'inne'
  },
  tags: [String],
  likes: [String],
  comments: [{ user: String, text: String }],
  image: {
    type: String,
    default: function() {
      const defaults = {
        planszowka: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        komputerowa: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        fizyczna: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        inne: 'https://images.unsplash.com/photo-1503676382389-4809596d5290'
      };
      return defaults[this.type];
    }
  }
});


module.exports = {
  User: mongoose.model('User', UserSchema),
  Event: mongoose.model('Event', EventSchema),
};
