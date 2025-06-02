import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import logo from "../assets/react.png";

export default function RegisterForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    accept: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const userRef = useRef(null);

  const navigate = useNavigate();

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

  const handleCapsLock = e => setCapsLock(e.getModifierState && e.getModifierState("CapsLock"));

  // prosta walidacja e-maila
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  // prosta walidacja nicku
  const usernameValid = form.username.length >= 3 && form.username.length <= 24;

  // silne hasło
  const passwordValid =
    form.password.length >= 8 &&
    /[A-Z]/.test(form.password) &&
    /[a-z]/.test(form.password) &&
    /\d/.test(form.password);

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    if (!form.accept)
      return setError("Musisz zaakceptować regulamin i politykę prywatności.");
    if (!usernameValid)
      return setError("Nick musi mieć 3-24 znaki.");
    if (!emailValid)
      return setError("Podaj poprawny adres e-mail.");
    if (!passwordValid)
      return setError("Hasło min. 8 znaków, 1 duża litera, 1 mała litera, 1 cyfra.");
    setLoading(true);
    try {
      const res = await fetch("https://gramytu.onrender.com/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data && data.token && data.user) {
        localStorage.setItem("token", data.token);
        // Zamknij modal rejestracji
        onClose && onClose();
        // Przekieruj na onboarding quiz, przekazując usera i token
        navigate("/onboarding", { state: { user: data.user, token: data.token } });
      } else {
        setError(data.error || "Błąd rejestracji");
      }
    } catch {
      setLoading(false);
      setError("Brak połączenia z serwerem");
    }
  };

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
          <h2 className="text-2xl font-bold text-indigo-700 text-center">Rejestracja</h2>
          <p className="text-gray-500 text-sm text-center">Załóż konto w GramyTu</p>
        </div>
        <label className="flex flex-col gap-1 font-medium text-gray-700">
          Nick
          <input
            ref={userRef}
            name="username"
            autoFocus
            autoComplete="username"
            placeholder="Twój nick"
            value={form.username}
            onChange={handleChange}
            required
            minLength={3}
            maxLength={24}
            className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 font-medium text-gray-700">
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Twój e-mail"
            value={form.email}
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
              autoComplete="new-password"
              placeholder="Hasło"
              value={form.password}
              onChange={handleChange}
              onKeyUp={handleCapsLock}
              required
              minLength={8}
              aria-describedby="caps-lock pass-req"
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
          <span
            id="pass-req"
            className={`text-xs mt-1 ${
              !passwordValid && form.password
                ? "text-red-500"
                : "text-gray-400"
            }`}
          >
            Min. 8 znaków, 1 duża litera, 1 mała litera, 1 cyfra
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="accept"
            checked={form.accept}
            onChange={handleChange}
            className="accent-indigo-600"
            required
          />
          Akceptuję{" "}
          <a href="/privacy" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">
            regulamin i politykę prywatności
          </a>
        </label>
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
          {loading ? "Rejestruję..." : "Zarejestruj się"}
        </button>
        <div className="flex flex-col items-center gap-1 mt-2">
          <span className="text-xs text-gray-500">
            Masz już konto?{" "}
            <a href="/login" className="text-indigo-600 hover:underline font-semibold">
              Zaloguj się
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
