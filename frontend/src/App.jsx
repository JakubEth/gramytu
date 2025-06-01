import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import EventForm from "./components/EventForm";
import Landing2025 from "./components/Landing2025";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import jwtDecode from "jwt-decode"; // npm install jwt-decode

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

  // Przy starcie aplikacji sprawdź token w localStorage
  useEffect(() => {
    // Pobierz eventy
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);

    // Sprawdź token JWT
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ _id: decoded.userId, username: decoded.username });
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

  // Wylogowanie
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };
  const handleProfile = () => alert("Profil (do zaimplementowania)");
  const handleSettings = () => alert("Ustawienia (do zaimplementowania)");

  return (
    <div>
      <Header
        onOpenAddEvent={() => setShowModal(true)}
        onOpenSignUp={() => setShowSignUp(true)}
        onOpenLogIn={() => setShowLogIn(true)}
        user={user}
        onLogout={handleLogout}
        onProfile={handleProfile}
        onSettings={handleSettings}
      />
      <Landing2025 events={events} />
      <Footer />

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
    </div>
  );
}
