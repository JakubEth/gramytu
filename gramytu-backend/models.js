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
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  image: {
    type: String,
    default: function() {
      const defaults = {
        planszowka: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        komputerowa: 'https://images.unsplash.com/photo-1511512578047-dfb367046420',
        fizyczna: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        inne: 'https://images.unsplash.com/photo-1503676382389-4809596d5290'
      };
      return defaults[this.type];
    }
  },
  maxParticipants: { type: Number, required: true }, // LIMIT MIEJSC
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // ZAPISANI UCZESTNICY
  paid: { type: Boolean, default: false }, // CZY PŁATNE
  price: { type: Number, default: 0 } // kwota w złotych
});

// MODEL WIADOMOŚCI CZATU GRUPOWEGO
const ChatMessageSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Event: mongoose.model('Event', EventSchema),
  ChatMessage: mongoose.model('ChatMessage', ChatMessageSchema)
};
