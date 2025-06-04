import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/react.png";
import NotificationsBell from "./NotificationsBell";

const API_URL = "https://gramytu.onrender.com"; // <-- podmień na swój backend

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
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ events: [], users: [], places: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const avatarRef = useRef();
  const searchInputRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (!menuOpen) return;
    const handler = e => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  // Autocomplete suggestions
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions({ events: [], users: [], places: [] });
      setShowSuggestions(false);
      return;
    }
    const controller = new AbortController();
    fetch(`${API_URL}/autocomplete?query=${encodeURIComponent(searchQuery)}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        setSuggestions(data);
        setShowSuggestions(
          (data.events && data.events.length > 0) ||
          (data.users && data.users.length > 0) ||
          (data.places && data.places.length > 0)
        );
      })
      .catch(() => {});
    return () => controller.abort();
  }, [searchQuery]);

  // Zamykaj podpowiedzi po kliknięciu poza
  useEffect(() => {
    if (!showSuggestions) return;
    const handler = e => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSuggestions]);

  const avatarUrl = user?.avatar
    ? user.avatar
    : getDefaultAvatar(user?.username);

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      setShowSuggestions(false);
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSuggestionClick = (value) => {
    setSearchQuery(value);
    setShowSuggestions(false);
    navigate(`/search?query=${encodeURIComponent(value)}`);
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur shadow flex items-center justify-between px-8 py-4 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <img src={logo} alt="Gramytu logo" className="w-10 h-10" />
        <Link to={"/"} className="font-bold text-2xl text-indigo-700">GramyTu</Link>
        {/* Pole wyszukiwania z podpowiedziami */}
        <div
          ref={searchInputRef}
          style={{ marginLeft: 32, minWidth: 320, width: 400, maxWidth: 480, position: "relative" }}
        >
          <span
            style={{
              position: "absolute",
              left: 18,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
              fontSize: 22,
              pointerEvents: "none",
              zIndex: 2
            }}
          >
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2"/><path stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" d="M21 21l-3.5-3.5"/></svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Wyszukaj wydarzenie, miejsce lub użytkownika..."
            className="pl-12 pr-4 py-2 w-full text-lg rounded-2xl border border-indigo-200 bg-indigo-50 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 shadow transition outline-none placeholder:text-sm"
            style={{
              fontWeight: 500,
              color: "#1e293b",
              boxShadow: "0 2px 16px #6366f111",
              background: "#f1f5fe",
              border: "1.5px solid #c7d2fe",
              minWidth: 320,
              maxWidth: 480
            }}
            aria-label="Szukaj"
            autoComplete="off"
            onFocus={() => {
              if (
                (suggestions.events && suggestions.events.length > 0) ||
                (suggestions.users && suggestions.users.length > 0) ||
                (suggestions.places && suggestions.places.length > 0)
              ) setShowSuggestions(true);
            }}
          />
          <style>
            {`
              input::placeholder {
                font-size: 14px !important;
              }
            `}
          </style>
          {/* Podpowiedzi live */}
          {showSuggestions && (
            <div
              className="absolute left-0 right-0 bg-white rounded-xl shadow border mt-1 z-50"
              style={{ maxHeight: 340, overflowY: "auto" }}
            >
              {suggestions.events && suggestions.events.length > 0 && (
                <>
                  <div className="px-4 pt-2 pb-1 text-xs text-gray-400 font-semibold uppercase">Wydarzenia</div>
                  {suggestions.events.map(ev => (
                    <div
                      key={ev._id || ev.title}
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-indigo-700"
                      onClick={() => handleSuggestionClick(ev.title)}
                    >
                      <span className="font-semibold">{ev.title}</span>
                    </div>
                  ))}
                </>
              )}
              {suggestions.users && suggestions.users.length > 0 && (
                <>
                  <div className="px-4 pt-2 pb-1 text-xs text-gray-400 font-semibold uppercase">Użytkownicy</div>
                  {suggestions.users.map(u => (
                    <div
                      key={u._id || u.username}
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-indigo-700 flex items-center gap-2"
                      onClick={() => handleSuggestionClick(u.username)}
                    >
                      <img src={u.avatar} alt={u.username} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-semibold">{u.username}</span>
                    </div>
                  ))}
                </>
              )}
              {suggestions.places && suggestions.places.length > 0 && (
                <>
                  <div className="px-4 pt-2 pb-1 text-xs text-gray-400 font-semibold uppercase">Miejsca</div>
                  {suggestions.places.map((p, idx) => (
                    <div
                      key={p.name + idx}
                      className="px-4 py-2 cursor-pointer hover:bg-indigo-50 text-indigo-700"
                      onClick={() => handleSuggestionClick(p.name)}
                    >
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  ))}
                </>
              )}
              {(!suggestions.events.length && !suggestions.users.length && !suggestions.places.length) && (
                <div className="px-4 py-3 text-gray-400 text-sm">Brak podpowiedzi</div>
              )}
            </div>
          )}
        </div>
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
        {user && user._id && (
          <NotificationsBell user={user} />
        )}
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
                <Link
                  to="/profile"
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-700 block"
                  onClick={() => setMenuOpen(false)}
                >
                  Mój profil
                </Link>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => { setMenuOpen(false); onSettings && onSettings(); }}
                >
                  Ustawienia
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/my-events");
                  }}
                >
                  Moje wydarzenia
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
