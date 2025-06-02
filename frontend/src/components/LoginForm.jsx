import { useState, useRef, useEffect } from "react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import logo from "../assets/react.png";

export default function LoginModal({ onSuccess, onClose }) {
  const [form, setForm] = useState({ username: "", password: "", remember: true });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const userRef = useRef(null);

  useEffect(() => {
    userRef.current?.focus();
    const esc = (e) => e.key === "Escape" && onClose && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://gramytu.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.ok && data.token && data.user) {
        if (form.remember) localStorage.setItem("rememberMe", "1");
        else localStorage.removeItem("rememberMe");
        onSuccess && onSuccess(data);
      } else {
        setError(data.error || "Błąd logowania");
      }
    } catch {
      setLoading(false);
      setError("Brak połączenia z serwerem");
    }
  };

  const handleCapsLock = e => setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-5 animate-slide-up"
        aria-modal="true"
        role="dialog"
        onKeyDown={handleCapsLock}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zamknij"
          className="absolute top-4 right-4 text-gray-400 hover:text-indigo-700 text-2xl"
        >
          <FaTimes />
        </button>
        <div className="flex flex-col items-center mb-2">
          <img src={logo} alt="GramyTu" className="w-12 h-12 mb-2" />
          <h2 className="text-2xl font-bold text-indigo-700 text-center">Logowanie</h2>
          <p className="text-gray-500 text-sm text-center">Zaloguj się do GramyTu</p>
        </div>
        <label className="flex flex-col gap-1 font-medium text-gray-700">
          Nick lub e-mail
          <input
            ref={userRef}
            name="username"
            autoFocus
            autoComplete="username"
            placeholder="Twój nick lub e-mail"
            value={form.username}
            onChange={handleChange}
            required
            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 font-medium text-gray-700 relative">
          Hasło
          <div className="relative">
            <input
              name="password"
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Hasło"
              value={form.password}
              onChange={handleChange}
              onKeyUp={handleCapsLock}
              required
              aria-describedby="caps-lock"
              className="px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none w-full"
            />
            <button
              type="button"
              tabIndex={-1}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-700"
              onClick={() => setShowPass(s => !s)}
              aria-label={showPass ? "Ukryj hasło" : "Pokaż hasło"}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {capsLock && (
            <span id="caps-lock" className="text-xs text-yellow-600 mt-1">
              Uwaga: Caps Lock jest włączony!
            </span>
          )}
        </label>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="accent-indigo-600"
            />
            Zapamiętaj mnie
          </label>
          <a
            href="/reset"
            className="text-xs text-indigo-600 hover:underline"
            tabIndex={0}
          >
            Zapomniałeś hasła?
          </a>
        </div>
        {error && (
          <div className="text-red-500 text-sm text-center rounded bg-red-50 px-2 py-1 border border-red-100">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-2 px-4 rounded-lg transition text-lg shadow"
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-xs text-gray-500">
            Nie masz konta?{" "}
            <a href="/register" className="text-indigo-600 hover:underline font-semibold">
              Zarejestruj się
            </a>
          </span>
          <span className="text-[10px] text-gray-400">
            Kontynuując, akceptujesz{" "}
            <a href="/privacy" className="hover:underline text-indigo-600">
              politykę prywatności
            </a>
            .
          </span>
        </div>
      </form>
    </div>
  );
}
