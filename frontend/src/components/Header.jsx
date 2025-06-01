import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/react.png";

// Funkcja generująca domyślny avatar na podstawie nicku
const getDefaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

export default function Header({
  onOpenAddEvent,
  onOpenSignUp,
  onOpenLogIn,
  user,
  onLogout,
  onProfile,
  onSettings
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const avatarRef = useRef();
  const navigate = useNavigate();

  // Zamykaj dropdown po kliknięciu poza
  useEffect(() => {
    if (!menuOpen) return;
    const handler = e => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Wybierz avatar: jeśli user.avatar istnieje, użyj go, inaczej domyślny
  const avatarUrl = user?.avatar
    ? user.avatar
    : getDefaultAvatar(user?.username);

  return (
    <header className="w-full bg-white/90 backdrop-blur shadow flex items-center justify-between px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Gramytu logo" className="w-10 h-10" />
        <span className="font-bold text-2xl text-indigo-700">GramyTu</span>
      </div>
      <nav className="flex gap-6 items-center">
        <button
          type="button"
          className="hover:text-indigo-700 font-medium transition bg-transparent border-none outline-none cursor-pointer"
          onClick={() => {
            if (user) {
              onOpenAddEvent();
            } else {
              onOpenLogIn();
            }
          }}
        >
          Dodaj wydarzenie
        </button>
        <Link to="/events" className="hover:text-indigo-700 font-medium transition">
          Przeglądaj wydarzenia
        </Link>
        <button
          type="button"
          className="hover:text-indigo-700 font-medium transition bg-transparent border-none outline-none cursor-pointer"
          onClick={() => {
            if (user) {
              navigate("/events/swipe");
            } else {
              onOpenLogIn();
            }
          }}
        >
          Swipe'uj wydarzenia
        </button>
        <a href="#about" className="hover:text-indigo-700 font-medium transition">
          O nas
        </a>
        {!user ? (
          <>
            <button
              type="button"
              onClick={onOpenLogIn}
              className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 rounded transition"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={onOpenSignUp}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded transition"
            >
              Sign Up
            </button>
          </>
        ) : (
          <div className="relative" ref={avatarRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(o => !o)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-200 bg-indigo-50 flex items-center justify-center focus:outline-none"
              aria-label="Profil"
            >
              <img
                src={avatarUrl}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-indigo-100 py-2 z-50 animate-fade-in">
                <button
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => { setMenuOpen(false); onProfile && onProfile(); }}
                >
                  Profil
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => { setMenuOpen(false); onSettings && onSettings(); }}
                >
                  Ustawienia
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600"
                  onClick={() => { setMenuOpen(false); onLogout && onLogout(); }}
                >
                  Wyloguj
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
