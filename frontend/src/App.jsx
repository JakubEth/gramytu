import { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import EventForm from "./components/EventForm";
import Landing2025 from "./components/Landing2025";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import UserProfilePage from "./components/UserProfilePage";
import EventsTinder from "./components/EventsTinder";
import ProtectedRoute from "./components/ProtectedRoute";
import MyEventsPanel from "./components/MyEventsPanel";
import OnboardingQuiz from "./components/OnboardingQuiz";
import UserProfilePageView from "./components/UserProfilePageView";
import EventsList from "./components/EventsList";
import SearchResults from "./components/SearchResults";
import { jwtDecode } from "jwt-decode";

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
  const [loadingUser, setLoadingUser] = useState(true);
  const [flash, setFlash] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  // Ukryj header/footer na /onboarding
  const hideHeaderFooter = location.pathname === "/onboarding";

  // KLUCZOWA FUNKCJA!
  async function refreshUser() {
    
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const res = await fetch(`https://gramytu.onrender.com/users/${decoded.userId}`);
        const userFromDb = await res.json();
        setUser({
          _id: userFromDb._id,
          username: userFromDb.username,
          avatar: userFromDb.avatar,
          email: userFromDb.email,         // <-- DODAJ TO!
          mbtiType: userFromDb.mbtiType    // (możesz dodać inne pola też)
        });
        
      } catch {
        setUser(null);
        localStorage.removeItem("token");
      }
    } else {
      setUser(null);
    }
  }
  useEffect(() => {
    if (flash) {
      const timer = setTimeout(() => setFlash(""), 2500);
      return () => clearTimeout(timer);
    }
  }),
  useEffect(() => {
    setLoadingUser(true);
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);

    // Początkowe pobranie usera
    refreshUser().then(() => setLoadingUser(false));
  }, []);

  // Ochrona trasy /onboarding (przekieruj na /login jeśli nie ma tokena)
  useEffect(() => {
    if (
      location.pathname === "/onboarding" &&
      !localStorage.getItem("token")
    ) {
      navigate("/login", { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleAdd = event => {
    setEvents(e => [...e, event]);
    setShowModal(false);
    setSuccessEvent(event);
  };


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setFlash("Wylogowano pomyślnie!");
    navigate("/"); // przekieruj na home
  };
  
  const handleProfile = () => setShowProfile(true);
  const handleSettings = () => alert("Ustawienia (do zaimplementowania)");
  const openLoginModal = () => setShowLogIn(true);

  if (loadingUser) {
    return <div className="w-full h-screen flex items-center justify-center">Ładowanie...</div>;
  }

  return (
    <>
      {!hideHeaderFooter && (
        <Header
          onOpenAddEvent={() => setShowModal(true)}
          onOpenSignUp={() => setShowSignUp(true)}
          onOpenLogIn={() => setShowLogIn(true)}
          user={user}
          onLogout={handleLogout}
          onProfile={handleProfile}
          onSettings={handleSettings}
        />
      )}
{flash && (
  <div style={{
    position: "fixed",
    top: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#4f46e5",
    color: "#fff",
    padding: "14px 32px",
    borderRadius: 16,
    fontWeight: 700,
    fontSize: 18,
    zIndex: 9999,
    boxShadow: "0 2px 16px #0002",
    letterSpacing: 1
  }}>
    {flash}
  </div>
)}

      <Routes>
        <Route path="/" element={<Landing2025 events={events} user={user}/>} />
        <Route path="/events" element={<EventsList />} />

        <Route
          path="/events/swipe"
          element={
            <ProtectedRoute user={user} onRequireLogin={openLoginModal}>
              <EventsTinder />
            </ProtectedRoute>
          }
        />
        <Route path="/my-events" element={<MyEventsPanel user={user} events={events} />} />
        <Route
          path="/profile"
          element={
            <UserProfilePage
              user={user}
              onUpdate={updatedUser => {
                setUser(updatedUser);
                localStorage.setItem("user", JSON.stringify(updatedUser));
              }}
            />
          }
        />
        <Route path="/onboarding" element={
          <OnboardingQuiz onUserUpdate={refreshUser} />
        } />
        <Route path="/user/:id" element={<UserProfilePageView />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>

      {!hideHeaderFooter && <Footer />}

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
        <RegisterForm
          onSuccess={data => {
            if (data && data.token && data.user) {
              localStorage.setItem("token", data.token);
              setUser(data.user);
            }
            setShowSignUp(false);
          }}
          onClose={() => setShowSignUp(false)}
        />
      )}

      {/* MODAL LOGOWANIA */}
      {!loadingUser && showLogIn && (
        <LoginForm
          onSuccess={data => {
            if (data && data.token && data.user) {
              localStorage.setItem("token", data.token);
              setUser(data.user);
            }
            setShowLogIn(false);
          }}
          onClose={() => setShowLogIn(false)}
        />
      )}

      {/* GLOBALNY PLUS */}
      <button
        onClick={() => {
          if (user) {
            setShowModal(true);
          } else {
            setShowLogIn(true);
          }
        }}
        className="fixed bottom-8 right-8 z-[100] bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl transition"
        aria-label="Dodaj wydarzenie"
      >
        +
      </button>
    </>
  );
}
