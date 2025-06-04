const express = require('express');
const mongoose = require('mongoose');
const { Types } = mongoose;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 256, height: 256, crop: "fill" }]
  }
});
const upload = multer({ storage });

const { Event, User, ChatMessage, UserReview, UserActivity } = require('./models');
const Notification = mongoose.model('Notification', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  text: String,
  link: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server, { 
  cors: { origin: '*', methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling']
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- UNIWERSALNE WYSZUKIWANIE: eventy, użytkownicy, miejsca ---
app.get('/search', async (req, res) => {
  const query = (req.query.query || "").trim();
  if (!query) return res.json({ events: [], users: [], places: [] });

  try {
    const events = await Event.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $elemMatch: { $regex: query, $options: "i" } } },
        { "location.name": { $regex: query, $options: "i" } }
      ]
    })
      .limit(10)
      .populate('hostId', 'username avatar');

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    })
      .limit(10)
      .select("_id username avatar bio");

    const placesAgg = await Event.aggregate([
      { $match: { "location.name": { $regex: query, $options: "i" } } },
      { $group: { _id: "$location.name", lat: { $first: "$location.lat" }, lng: { $first: "$location.lng" } } },
      { $limit: 10 }
    ]);
    const places = placesAgg.map(p => ({
      name: p._id,
      lat: p.lat,
      lng: p.lng
    }));

    res.json({ events, users, places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd wyszukiwania" });
  }
});

// --- PODPOWIEDZI LIVE (AUTOCOMPLETE) ---
app.get('/autocomplete', async (req, res) => {
  const query = (req.query.query || "").trim();
  if (!query) return res.json({ events: [], users: [], places: [] });

  try {
    const events = await Event.find({
      title: { $regex: query, $options: "i" }
    }).limit(5).select("title");

    const users = await User.find({
      username: { $regex: query, $options: "i" }
    }).limit(5).select("username avatar");

    const placesAgg = await Event.aggregate([
      { $match: { "location.name": { $regex: query, $options: "i" } } },
      { $group: { _id: "$location.name" } },
      { $limit: 5 }
    ]);
    const places = placesAgg.map(p => ({ name: p._id }));

    res.json({ events, users, places });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd autocomplete" });
  }
});


app.get('/', (req, res) => {
  res.sendStatus(200);
});

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

// --- ENDPOINTY NOTYFIKACJI ---

app.get('/notifications', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/notifications/mark-read', auth, async (req, res) => {
  try {
    const ids = req.body.ids || [];
    await Notification.updateMany(
      { user: req.user._id, _id: { $in: ids } },
      { $set: { read: true } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/notifications', async (req, res) => {
  try {
    const { user, type, text, link } = req.body;
    if (!user || !type) return res.status(400).json({ error: "Brak danych" });
    const notif = await Notification.create({ user, type, text, link });
    io.to(user.toString()).emit("notification", notif);
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// --- ENDPOINTY EVENTÓW, USERÓW, CZATU, ETC. ---

app.get('/events', async (req, res) => {
  const events = await Event.find().populate('hostId', 'username avatar');
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
  let participants = req.body.participants || [];
  if (!participants.map(id => id.toString()).includes(req.body.hostId)) {
    participants = [req.body.hostId, ...participants];
  }
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
    participants
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

// --- API DO OPINII I OCEN UŻYTKOWNIKA ---
app.post('/users/:id/reviews', auth, async (req, res) => {
  try {
    if (!req.body.rating || !req.body.comment) {
      return res.status(400).json({ error: "Ocena i komentarz są wymagane" });
    }
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ error: "Nie możesz ocenić samego siebie" });
    }
    const review = new UserReview({
      user: req.params.id,
      author: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });
    await review.save();

    await UserActivity.create([
      {
        user: req.params.id,
        type: "rated",
        date: new Date(),
        details: `Otrzymał ocenę ${req.body.rating} od ${req.user.username}`
      },
      {
        user: req.user._id,
        type: "rated",
        date: new Date(),
        details: `Wystawił ocenę ${req.body.rating} użytkownikowi ${req.params.id}`
      }
    ]);

    // POWIADOMIENIE O OTRZYMANIU OPINII
    const notif = await Notification.create({
      user: req.params.id,
      type: "review",
      text: `Otrzymałeś nową opinię od użytkownika ${req.user.username}: "${req.body.comment}"`,
      link: `/user/${req.user._id}`
    });
    io.to(req.params.id.toString()).emit("notification", notif);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get('/users/:id/reviews', async (req, res) => {
  try {
    const reviews = await UserReview.find({ user: req.params.id })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    const avg =
      reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
        : null;
    res.json({ avgRating: avg, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get('/users/:id/activity', async (req, res) => {
  try {
    const activities = await UserActivity.find({ user: req.params.id })
      .sort({ date: -1 })
      .limit(100);
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', '_id')
      .populate('following', '_id');
    if (!user) return res.status(404).json({ error: "Nie znaleziono użytkownika" });
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || null,
      createdAt: user.createdAt,
      gender: user.gender,
      mbtiType: user.mbtiType || null,
      isAdult: user.isAdult ?? null,
      favoriteEventType: user.favoriteEventType || null,
      preferredEventSize: user.preferredEventSize || null,
      preferredCategories: user.preferredCategories || [],
      preferredTags: user.preferredTags || [],
      preferredMode: user.preferredMode || null,
      followers: user.followers ? user.followers.map(f => f._id?.toString?.() || f.toString()) : [],
      following: user.following ? user.following.map(f => f._id?.toString?.() || f.toString()) : []
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});


app.post('/users/:id/avatar', auth, upload.single('avatar'), async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ error: "Brak uprawnień" });
  }
  const avatarUrl = req.file.path;
  await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
  res.json({ avatar: avatarUrl });
});

app.post('/register', async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Nick, e-mail i hasło są wymagane" });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: "Nick jest już zajęty" });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Ten e-mail jest już zarejestrowany" });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, gender });
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt,
        gender: newUser.gender
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.findOne(
      username
        ? { username }
        : email
        ? { email }
        : null
    );
    if (!user) {
      return res.status(401).json({ error: "Nieprawidłowy nick/e-mail lub hasło" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Nieprawidłowy nick/e-mail lub hasło" });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.json({
      ok: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        gender: user.gender
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.patch('/users/:id', async (req, res) => {
  try {
    const { username, password, avatar, gender } = req.body;
    const update = {};
    if (username) update.username = username;
    if (avatar) update.avatar = avatar;
    if (gender) update.gender = gender;
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
    res.json({ _id: user._id, username: user.username, avatar: user.avatar, gender: user.gender });
  } catch (error) {
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
  if (event.hostId.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "Organizator już jest uczestnikiem" });
  }
  if (event.participants.length >= event.maxParticipants)
    return res.status(400).json({ error: "Brak wolnych miejsc" });
  if (event.participants.map(id => id.toString()).includes(req.user._id.toString()))
    return res.status(400).json({ error: "Już jesteś zapisany" });
  event.participants.push(req.user._id);
  await event.save();

  await UserActivity.create({
    user: req.user._id,
    type: "joined_event",
    event: event._id,
    eventTitle: event.title,
    date: new Date(),
    details: `Dołączył do wydarzenia: ${event.title}`
  });

  if (event.hostId.toString() !== req.user._id.toString()) {
    const notif = await Notification.create({
      user: event.hostId,
      type: "event_join",
      text: `${req.user.username} dołączył do Twojego wydarzenia "${event.title}"`,
      link: `/event/${event._id}`
    });
    io.to(event.hostId.toString()).emit("notification", notif);
  }

  res.json({ ok: true });
});

app.post('/events/:id/leave', auth, async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ error: "Nie znaleziono wydarzenia" });
  if (event.hostId.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "Organizator nie może opuścić wydarzenia" });
  }
  event.participants = event.participants.filter(id => id.toString() !== req.user._id.toString());
  await event.save();

  await UserActivity.create({
    user: req.user._id,
    type: "left_event",
    event: event._id,
    eventTitle: event.title,
    date: new Date(),
    details: `Opuścił wydarzenie: ${event.title}`
  });

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

app.get('/events/:id/chat', async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: "Nieprawidłowy format eventId" });
    }
    const eventObjectId = new Types.ObjectId(eventId);

    const messages = await ChatMessage.find({ eventId: eventObjectId })
      .sort({ createdAt: 1 })
      .select('username text createdAt userId readBy');

    const userIds = [...new Set(messages.map(m => m.userId.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select('_id avatar');
    const avatarMap = {};
    users.forEach(u => { avatarMap[u._id.toString()] = u.avatar; });

    const messagesWithAvatar = messages.map(m => ({
      _id: m._id,
      username: m.username,
      userId: m.userId,
      text: m.text,
      createdAt: m.createdAt,
      avatar: avatarMap[m.userId.toString()] || null,
      readBy: m.readBy
    }));
    res.json(messagesWithAvatar);
  } catch (error) {
    res.status(500).json({ error: "Wewnętrzny błąd serwera" });
  }
});

app.delete('/events/:eventId/chat/:msgId', async (req, res) => {
  try {
    const { eventId, msgId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Brak tokenu" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const msg = await ChatMessage.findById(msgId);
    if (!msg) return res.status(404).json({ error: "Nie znaleziono wiadomości" });
    if (msg.userId.toString() !== decoded.userId) {
      return res.status(403).json({ error: "Brak uprawnień" });
    }
    await ChatMessage.findByIdAndDelete(msgId);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// --- SOCKET.IO CZAT GRUPOWY DLA EVENTÓW + NOTYFIKACJE ---
io.on('connection', (socket) => {
  socket.on("auth", ({ token }) => {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      if (user && user.userId) {
        socket.join(user.userId.toString());
      }
    } catch {}
  });

  socket.on('joinEventChat', ({ eventId, token }) => {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(eventId);
      socket.user = user;
      socket.eventId = eventId;
    } catch (e) {}
  });

  socket.on('eventMessage', async ({ eventId, text }) => {
    if (!socket.user || !eventId || !text?.trim()) return;
    const userDoc = await User.findById(socket.user.userId).select('avatar');
    const avatar = userDoc?.avatar || null;

    const msg = await ChatMessage.create({
      eventId,
      userId: socket.user.userId,
      username: socket.user.username,
      text,
      readBy: [socket.user.userId]
    });
    io.to(eventId).emit('eventMessage', {
      _id: msg._id,
      username: msg.username,
      userId: msg.userId,
      text: msg.text,
      createdAt: msg.createdAt,
      avatar,
      readBy: msg.readBy
    });
  });

  socket.on('deleteMessage', (msgId) => {
    if (socket.eventId) {
      socket.to(socket.eventId).emit('deleteMessage', msgId);
    }
  });

  socket.on("participantsUpdate", async ({ eventId }) => {
    const event = await Event.findById(eventId).populate('participants', 'username avatar _id');
    io.emit("participantsUpdate", { eventId, participants: event.participants });
  });

  socket.on('readMessages', async ({ eventId, userId, lastReadMessageId }) => {
    try {
      const messagesToUpdate = await ChatMessage.find({
        eventId,
        _id: { $lte: lastReadMessageId }
      });
      for (const msg of messagesToUpdate) {
        if (!msg.readBy.map(id => id.toString()).includes(userId)) {
          msg.readBy.push(userId);
          await msg.save();
        }
      }
      const user = await User.findById(userId).select('username avatar');
      io.to(eventId.toString()).emit('messagesRead', {
        user: { _id: user._id, username: user.username, avatar: user.avatar },
        lastReadMessageId
      });
    } catch (e) {}
  });

  socket.on("eventJoined", async ({ eventId, userId }) => {
    const event = await Event.findById(eventId);
    if (!event) return;
    if (event.hostId.toString() !== userId) {
      const joiningUser = await User.findById(userId);
      const notif = await Notification.create({
        user: event.hostId,
        type: "event_join",
        text: `${joiningUser.username} dołączył do Twojego wydarzenia "${event.title}"`,
        link: `/event/${eventId}`
      });
      io.to(event.hostId.toString()).emit("notification", notif);
    }
  });

  socket.on('disconnect', () => {});
});

app.get('/giphy/search', async (req, res) => {
  const q = req.query.q || "";
  if (!q) return res.json([]);
  if (!process.env.GIPHY_API_KEY) {
    return res.status(500).json({ error: "Brak klucza GIPHY_API_KEY w backendzie!" });
  }
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=12&rating=pg`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.data) {
      return res.status(500).json({ error: "Giphy error", details: data });
    }
    res.json(data.data);
  } catch (e) {
    res.status(500).json({ error: "Giphy error", details: e.message });
  }
});

app.patch('/users/:id/preferences', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Brak uprawnień" });
    }
    const update = {};
    if (typeof req.body.isAdult === "boolean") update.isAdult = req.body.isAdult;
    if (req.body.favoriteEventType) update.favoriteEventType = req.body.favoriteEventType;
    if (req.body.preferredEventSize) update.preferredEventSize = req.body.preferredEventSize;
    if (Array.isArray(req.body.preferredCategories)) update.preferredCategories = req.body.preferredCategories;
    if (Array.isArray(req.body.preferredTags)) update.preferredTags = req.body.preferredTags;
    if (req.body.preferredMode) update.preferredMode = req.body.preferredMode;
    if (req.body.mbtiType) update.mbtiType = req.body.mbtiType;
    if (req.body.gender) update.gender = req.body.gender;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!user) return res.status(404).json({ error: "Nie znaleziono użytkownika" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Błąd serwera", details: err.message });
  }
});

// Obserwuj użytkownika
app.post('/users/:id/follow', auth, async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({ error: "Nie możesz obserwować samego siebie" });
  }
  const userToFollow = await User.findById(req.params.id);
  if (!userToFollow) return res.status(404).json({ error: "Nie znaleziono użytkownika" });

  // Sprawdź, czy już obserwujesz (czy jesteś w followers)
  const alreadyFollowing = userToFollow.followers.map(f => f.toString()).includes(req.user._id.toString());

  // Dodaj do following i followers tylko jeśli jeszcze nie istnieje
  if (!req.user.following.includes(userToFollow._id)) {
    req.user.following.push(userToFollow._id);
    await req.user.save();
  }
  if (!userToFollow.followers.includes(req.user._id)) {
    userToFollow.followers.push(req.user._id);
    await userToFollow.save();
  }

  // Powiadomienie TYLKO jeśli to pierwszy raz
  if (!alreadyFollowing) {
    const notif = await Notification.create({
      user: userToFollow._id,
      type: "follow",
      text: `${req.user.username} zaczął Cię obserwować!`,
      link: `/user/${req.user._id}`
    });
    io.to(userToFollow._id.toString()).emit("notification", notif);
  }

  res.json({ ok: true });
});


// Przestań obserwować użytkownika
app.post('/users/:id/unfollow', auth, async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    return res.status(400).json({ error: "Nie możesz przestać obserwować samego siebie" });
  }
  const userToUnfollow = await User.findById(req.params.id);
  if (!userToUnfollow) return res.status(404).json({ error: "Nie znaleziono użytkownika" });

  req.user.following = req.user.following.filter(id => id.toString() !== userToUnfollow._id.toString());
  await req.user.save();

  userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== req.user._id.toString());
  await userToUnfollow.save();

  res.json({ ok: true });
});

// --- USUWANIE UŻYTKOWNIKA I POWIĄZANYCH DANYCH ---
app.delete('/users/:id', async (req, res) => {
  const userId = req.params.id;

  // Autoryzacja: tylko właściciel lub admin
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Brak tokenu" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== userId) {
      return res.status(403).json({ error: "Brak uprawnień" });
    }
  } catch (err) {
    return res.status(401).json({ error: "Nieprawidłowy token" });
  }

  try {
    // 1. Usuń UserReview (opinie o nim i przez niego)
    await mongoose.model('UserReview').deleteMany({ $or: [{ user: userId }, { author: userId }] });

    // 2. Usuń UserActivity, także z activityLog innych userów
    await mongoose.model('UserActivity').deleteMany({ user: userId });
    await mongoose.model('User').updateMany(
      { "activityLog.user": userId },
      { $pull: { activityLog: { user: userId } } }
    );

    // 3. Usuń powiadomienia, gdzie user jest odbiorcą
    await mongoose.model('Notification').deleteMany({ user: userId });

    // 4. Usuń usera z followers/following/friends innych userów
    await mongoose.model('User').updateMany(
      { followers: userId },
      { $pull: { followers: userId } }
    );
    await mongoose.model('User').updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    await mongoose.model('User').updateMany(
      { friends: userId },
      { $pull: { friends: userId } }
    );

    // 5. Usuń usera z uczestników eventów
    await mongoose.model('Event').updateMany(
      { participants: userId },
      { $pull: { participants: userId } }
    );

    // 6. Usuń usera z lajków eventów
    await mongoose.model('Event').updateMany(
      { likes: userId },
      { $pull: { likes: userId } }
    );

    // 7. Usuń komentarze usera z eventów
    await mongoose.model('Event').updateMany(
      { "comments.user": userId },
      { $pull: { comments: { user: userId } } }
    );

    // 8. Usuń wiadomości czatu usera
    await mongoose.model('ChatMessage').deleteMany({ userId });

    // 9. (Opcjonalnie) Usuń eventy, których był hostem
    await mongoose.model('Event').deleteMany({ hostId: userId });

    // 10. Usuń konto usera
    await mongoose.model('User').findByIdAndDelete(userId);

    res.json({ ok: true, message: "Konto i wszystkie powiązane dane usunięte." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Błąd usuwania konta" });
  }
});



const PORT = process.env.PORT || 10000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, '0.0.0.0', () => console.log(`API działa na porcie ${PORT}`));
    console.log("Połączono z MongoDB");
  })
  .catch(err => {
    console.error("Błąd połączenia z MongoDB:", err);
    process.exit(1);
  });
