const mongoose = require('mongoose');

// --- Opinia/ocena użytkownika ---
const UserReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Oceniany
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kto wystawia
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

// --- Dziennik aktywności użytkownika ---
const UserActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ["created_event", "joined_event", "left_event", "commented", "rated", "other"], 
    required: true 
  },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  eventTitle: String,
  date: { type: Date, default: Date.now },
  details: String // np. tekst komentarza, dodatkowe info
});

// --- Użytkownik ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, minlength: 3, maxlength: 24, trim: true },
  email:    { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { type: String, required: true, minlength: 8 },
  avatar:   String,
  bio:      String,
  gender:   { type: String, enum: ["Kobieta", "Mężczyzna", "Nie chcę podawać", "Inna"], default: "Nie chcę podawać" },
  createdAt: { type: Date, default: Date.now },
  // Preferencje i profil
  isAdult: { type: Boolean, default: null }, // pełnoletni
  favoriteEventType: [String],
  preferredEventSize: String,
  preferredCategories: [String],
  preferredTags: [String],
  preferredMode: String,
  mbtiType: String,
  // Aktywność i analityka
  activityLog: [UserActivitySchema], // dziennik aktywności (opcjonalnie, można trzymać osobno)
  lastActiveAt: Date,
  lastLoginAt: Date,
  registeredAt: { type: Date, default: Date.now },
  // Uprawnienia i status
  status: { type: String, enum: ["active", "banned", "deleted"], default: "active" },
  role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
  // Zgody i kontekst
  marketingConsents: { type: Boolean, default: false },
  registrationSource: String,
  deviceInfo: String,
  // Sieć społecznościowa
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// --- Wydarzenie ---
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
  maxParticipants: { type: Number, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  paid: { type: Boolean, default: false },
  price: { type: Number, default: 0 }
});

// --- Wiadomość czatu grupowego ---
const ChatMessageSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
});

module.exports = {
  User: mongoose.model('User', UserSchema),
  Event: mongoose.model('Event', EventSchema),
  ChatMessage: mongoose.model('ChatMessage', ChatMessageSchema),
  UserReview: mongoose.model('UserReview', UserReviewSchema),
  UserActivity: mongoose.model('UserActivity', UserActivitySchema)
};
