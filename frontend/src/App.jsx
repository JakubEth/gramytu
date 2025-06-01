import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import MapView from "./components/MapView";
import EventForm from "./components/EventForm";
import Landing2025 from "./components/Landing2025";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import UserProfilePage from "./components/UserProfilePage";
import EventsTinder from "./components/EventsTinder";
import ProtectedRoute from "./components/ProtectedRoute";
import { jwtDecode } from "jwt-decode";

// KOMPONENT LISTY EVENTÓW
function EventsList() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);
  }, []);

  useEffect(() => {
    let data = [...events];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(ev =>
        ev.title.toLowerCase().includes(s) ||
        ev.description?.toLowerCase().includes(s) ||
        ev.location?.name?.toLowerCase().includes(s) ||
        ev.host?.toLowerCase().includes(s)
      );
    }
    if (type) {
      data = data.filter(ev => ev.type === type);
    }
    if (date) {
      data = data.filter(ev => ev.date?.slice(0, 10) === date);
    }
    setFiltered(data);
  }, [events, search, type, date]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">Przeglądaj wydarzenia</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          className="px-4 py-2 rounded-lg border border-gray-300 outline-none"
          placeholder="Szukaj po tytule, miejscu, opisie, organizatorze..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 outline-none"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="">Wszystkie typy</option>
          <option value="planszowka">Planszówka</option>
          <option value="komputerowa">Gra komputerowa</option>
          <option value="fizyczna">Gra fizyczna</option>
          <option value="inne">Coś innego</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 rounded-lg border border-gray-300 outline-none"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
          onClick={() => { setSearch(""); setType(""); setDate(""); }}
        >
          Wyczyść filtry
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-gray-500 text-center py-12">Brak wydarzeń spełniających kryteria.</div>
        )}
        {filtered.map(ev => (
          <div
            key={ev._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-2 border-l-4 border-indigo-200"
          >
            <div className="flex-1">
              <div className="font-bold text-lg text-indigo-700">{ev.title}</div>
              <div className="text-sm text-gray-500 mb-1">
                {ev.date?.slice(0, 10)} • {ev.location?.name}
              </div>
              <div className="text-sm text-gray-700 mb-1">{ev.description}</div>
              <div className="text-xs text-gray-400">
                Organizator: <b>{ev.host}</b>
              </div>
              {ev.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {ev.tags.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <a
                href={`mailto:${ev.contact}`}
                className="text-indigo-600 hover:underline text-sm"
              >
                {ev.contact}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessIcon() {
  return (
    <svg className="w-14 h-14 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="#e6fbe6"/>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 13l3 3 7-7" />
    </svg>
  );
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [successEvent, setSuccessEvent] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogIn, setShowLogIn] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        fetch(`https://gramytu.onrender.com/users/${decoded.userId}`)
          .then(res => res.json())
          .then(userFromDb => {
            setUser({
              _id: userFromDb._id,
              username: userFromDb.username,
              avatar: userFromDb.avatar
            });
          })
          .catch(() => {
            setUser(null);
            localStorage.removeItem("token");
          });
      } catch {
        setUser(null);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleAdd = event => {
    setEvents(e => [...e, event]);
    setShowModal(false);
    setSuccessEvent(event);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };
  const handleProfile = () => setShowProfile(true);
  const handleSettings = () => alert("Ustawienia (do zaimplementowania)");

  // Funkcja do otwierania modala logowania
  const openLoginModal = () => setShowLogIn(true);

  return (
    <>
      <Header
        onOpenAddEvent={() => setShowModal(true)}
        onOpenSignUp={() => setShowSignUp(true)}
        onOpenLogIn={() => setShowLogIn(true)}
        user={user}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />
      <Routes>
        <Route path="/" element={<Landing2025 events={events} />} />
        <Route path="/events" element={<EventsList />} />
        <Route
          path="/events/swipe"
          element={
            <ProtectedRoute user={user} onRequireLogin={openLoginModal}>
              <EventsTinder />
            </ProtectedRoute>
          }
        />
      </Routes>
      <Footer />

      {/* MODAL PROFILU */}
      {showProfile && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <UserProfilePage
            user={user}
            onClose={() => setShowProfile(false)}
            onUpdate={updatedUser => {
              setUser(updatedUser);
              fetch("https://gramytu.onrender.com/events")
                .then(res => res.json())
                .then(setEvents);
            }}
          />
        </div>
      )}

      {/* MODAL Z FORMULARZEM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full"
            style={{
              maxWidth: "1000px",
              width: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Zamknij"
            >
              ×
            </button>
            <EventForm
              onAdd={handleAdd}
              user={user}
            />
          </div>
        </div>
      )}

      {/* MODAL SUKCESU */}
      {successEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-2xl p-8 w-full flex flex-col items-center"
            style={{
              maxWidth: "420px",
              width: "90vw",
              position: "relative"
            }}
          >
            <button
              onClick={() => setSuccessEvent(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Zamknij"
            >
              ×
            </button>
            <SuccessIcon />
            <div className="text-green-600 font-bold text-xl mb-2 text-center">Wydarzenie dodane!</div>
            <div className="text-gray-700 text-center mb-4">
              <b>{successEvent.title}</b><br />
              {successEvent.date?.slice(0, 10)} • {successEvent.location?.name}<br />
              {successEvent.description}
            </div>
            <button
              onClick={() => setSuccessEvent(null)}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full mt-2 transition"
            >
              Zamknij
            </button>
          </div>
        </div>
      )}

      {/* MODAL REJESTRACJI */}
      {showSignUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs relative">
            <button
              onClick={() => setShowSignUp(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Zamknij"
            >
              ×
            </button>
            <RegisterForm onSuccess={data => {
              if (data && data.token && data.user) {
                localStorage.setItem("token", data.token);
                setUser(data.user);
              }
              setShowSignUp(false);
            }} />
          </div>
        </div>
      )}

      {/* MODAL LOGOWANIA */}
      {showLogIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs relative">
            <button
              onClick={() => setShowLogIn(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Zamknij"
            >
              ×
            </button>
            <LoginForm onSuccess={data => {
              if (data && data.token && data.user) {
                localStorage.setItem("token", data.token);
                setUser(data.user);
              }
              setShowLogIn(false);
            }} />
          </div>
        </div>
      )}

      {/* GLOBALNY PLUS */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 z-[100] bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl transition"
        aria-label="Dodaj wydarzenie"
      >
        +
      </button>
    </>
  );
}
