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
    // Sprawdź, czy już oceniałeś tego usera (opcjonalnie)
    const existing = await UserReview.findOne({ user: req.params.id, author: req.user._id });
    if (existing) {
      return res.status(400).json({ error: "Już dodałeś opinię o tym użytkowniku" });
    }
    const review = new UserReview({
      user: req.params.id,
      author: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });
    await review.save();

    // Dodaj wpis do dziennika aktywności ocenianego i autora
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

// --- DZIENNIK AKTYWNOŚCI UŻYTKOWNIKA ---
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
    const user = await User.findById(req.params.id);
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
      preferredMode: user.preferredMode || null
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
    console.error("Błąd rejestracji:", error);
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
    console.error("Błąd logowania:", error);
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
  if (event.hostId.toString() === req.user._id.toString()) {
    return res.status(400).json({ error: "Organizator już jest uczestnikiem" });
  }
  if (event.participants.length >= event.maxParticipants)
    return res.status(400).json({ error: "Brak wolnych miejsc" });
  if (event.participants.map(id => id.toString()).includes(req.user._id.toString()))
    return res.status(400).json({ error: "Już jesteś zapisany" });
  event.participants.push(req.user._id);
  await event.save();

  // Logowanie aktywności
  await UserActivity.create({
    user: req.user._id,
    type: "joined_event",
    event: event._id,
    eventTitle: event.title,
    date: new Date(),
    details: `Dołączył do wydarzenia: ${event.title}`
  });

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

  // Logowanie aktywności
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
    console.error("Błąd w /events/:id/chat:", error);
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

// --- SOCKET.IO CZAT GRUPOWY DLA EVENTÓW ---
io.on('connection', (socket) => {
  socket.on('joinEventChat', ({ eventId, token }) => {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(eventId);
      socket.user = user;
      socket.eventId = eventId;
      console.log("Socket.io: user joined event chat", eventId, user.username);
    } catch (e) {
      console.error("Socket.io: joinEventChat error", e);
    }
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
      readBy: [socket.user.userId] // autor od razu ma przeczytane
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
    console.log("Socket.io: eventMessage sent and saved", msg);
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

  socket.on('disconnect', () => {
    console.log("Socket.io: user disconnected");
  });

  // READ RECEIPTS
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
    } catch (e) {
      console.error("readMessages error", e);
    }
  });
});

// --- GIPHY PROXY ENDPOINT Z DEBUGIEM ---
console.log("DEBUG: process.env.GIPHY_API_KEY =", process.env.GIPHY_API_KEY);

app.get('/giphy/search', async (req, res) => {
  const q = req.query.q || "";
  if (!q) return res.json([]);
  if (!process.env.GIPHY_API_KEY) {
    console.error("Brak klucza GIPHY_API_KEY w backendzie!");
    return res.status(500).json({ error: "Brak klucza GIPHY_API_KEY w backendzie!" });
  }
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${process.env.GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=12&rating=pg`;
  try {
    const r = await fetch(url);
    const data = await r.json();
    if (!data.data) {
      console.error("Giphy response error:", data);
      return res.status(500).json({ error: "Giphy error", details: data });
    }
    res.json(data.data);
  } catch (e) {
    console.error("Giphy proxy error:", e);
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
    console.error("Błąd PATCH /users/:id/preferences:", err);
    res.status(500).json({ error: "Błąd serwera", details: err.message });
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
