import { useState, useRef, useEffect } from "react";
import { FaCamera, FaCheckCircle, FaInstagram, FaFacebook, FaDiscord, FaTrophy, FaTimes } from "react-icons/fa";

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

// Przykładowe dane – w realu pobierz z backendu
const sampleAchievements = [
  { icon: <FaTrophy className="text-yellow-500" />, label: "Super Organizator" },
  { icon: <FaTrophy className="text-green-500" />, label: "Aktywny Gracz" },
  { icon: <FaTrophy className="text-blue-500" />, label: "Nowy Użytkownik" },
];
const sampleActivities = [
  "Dołączył do wydarzenia „Planszówkowy Piątek”",
  "Polubił wydarzenie „Turniej FIFA”",
  "Skomentował: „Świetna atmosfera!”",
];
const sampleRecommendations = [
  "Hackathon 2025",
  "Meetup planszówkowy",
  "LAN Party Kraków",
];

export default function UserProfilePage({ user, onUpdate }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    password: "",
    bio: user?.bio || "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || defaultAvatar(user?.username));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Upload avatara do backendu (Cloudinary)
  const handleAvatarUpload = async (file) => {
    setLoading(true);
    setMsg("");
    const formData = new FormData();
    formData.append("avatar", file);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://gramytu.onrender.com/users/${user._id}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok && data.avatar) {
        setAvatarPreview(data.avatar);
        setMsg("Zmieniono zdjęcie!");
        setSuccess(true);
        onUpdate && onUpdate({ ...user, avatar: data.avatar });
      } else {
        setMsg(data.error || "Błąd uploadu");
      }
    } catch (e) {
      setLoading(false);
      setMsg("Błąd sieci podczas uploadu");
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    handleAvatarUpload(file);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setSuccess(false);
    try {
      const res = await fetch(`https://gramytu.onrender.com/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password || undefined,
          bio: form.bio,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg("Zapisano zmiany!");
        setSuccess(true);
        setEdit(false);
        onUpdate && onUpdate({ ...user, ...data });
      } else {
        setMsg(data.error || "Błąd zapisu");
      }
    } catch (err) {
      setLoading(false);
      setMsg("Błąd sieci");
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-indigo-100 min-h-screen flex flex-col items-center py-12 px-2">
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 w-full max-w-5xl flex flex-col gap-10 animate-fade-in">
        {/* Górny pasek: avatar, dane, social */}
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
          {/* Avatar i upload */}
          <div className="relative group">
            <img
              src={avatarPreview || defaultAvatar(user?.username)}
              alt="Profil"
              className="w-40 h-40 rounded-full border-8 border-indigo-100 object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            {edit && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 shadow-lg opacity-90 hover:opacity-100 transition"
                  aria-label="Zmień zdjęcie profilowe"
                  disabled={loading}
                >
                  <FaCamera size={20} />
                </button>
              </>
            )}
          </div>
          {/* Dane i social */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">{user?.username || "Użytkownik"}</h1>
              <span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full">ID: {user?._id}</span>
            </div>
            <p className="text-gray-600 text-lg">Email: <span className="font-medium">{user?.email}</span></p>
            <div className="flex gap-3 mt-2 text-2xl">
              <a href={user.instagram || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-pink-500"><FaInstagram /></a>
              <a href={user.facebook || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600"><FaFacebook /></a>
              <a href={user.discord || "#"} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500"><FaDiscord /></a>
            </div>
            <div className="mt-4">
              <button
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-2 px-8 rounded-xl shadow-lg transition text-lg"
                onClick={() => setEdit(true)}
                disabled={edit}
              >
                Edytuj profil
              </button>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-lg text-indigo-700">O mnie</h3>
              <p className="text-gray-600">{user.bio || "Jeszcze nie uzupełniono opisu."}</p>
            </div>
          </div>
        </div>

        {/* Grid: statystyki, osiągnięcia, aktywności, rekomendacje, ustawienia */}
        <div className="grid md:grid-cols-3 gap-8 w-full">
          {/* Statystyki */}
          <div className="bg-indigo-50 rounded-xl p-6 shadow-inner flex flex-col gap-4 items-center">
            <h3 className="font-bold text-lg mb-2 text-indigo-700">Statystyki</h3>
            <div className="flex gap-8">
              <div>
                <div className="text-3xl font-extrabold text-indigo-700">{user.eventsCount || 7}</div>
                <div className="text-xs text-gray-500">Wydarzenia</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-indigo-700">{user.commentsCount || 16}</div>
                <div className="text-xs text-gray-500">Komentarze</div>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-4">Konto aktywne od: <span className="font-semibold">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "brak danych"}</span></div>
          </div>
          {/* Osiągnięcia */}
          <div className="bg-white rounded-xl p-6 shadow-inner flex flex-col gap-4 items-center">
            <h3 className="font-bold text-lg mb-2 text-indigo-700">Osiągnięcia</h3>
            <div className="flex gap-3 flex-wrap justify-center">
              {sampleAchievements.map(a => (
                <span key={a.label} className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold shadow">
                  {a.icon} {a.label}
                </span>
              ))}
            </div>
          </div>
          {/* Ostatnie aktywności */}
          <div className="bg-white rounded-xl p-6 shadow-inner flex flex-col gap-4">
            <h3 className="font-bold text-lg mb-2 text-indigo-700">Ostatnie aktywności</h3>
            <ul className="text-sm text-gray-600 list-disc pl-5">
              {sampleActivities.map((act, i) => <li key={i}>{act}</li>)}
            </ul>
          </div>
        </div>

        {/* Dolny grid: rekomendacje, ustawienia */}
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Rekomendacje */}
          <div className="bg-white rounded-xl p-6 shadow-inner">
            <h3 className="font-bold text-lg mb-2 text-indigo-700">Polecane wydarzenia</h3>
            <ul className="text-sm text-indigo-700 list-disc pl-5">
              {sampleRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
          {/* Ustawienia */}
          <div className="bg-white rounded-xl p-6 shadow-inner">
            <h3 className="font-bold text-lg mb-2 text-indigo-700">Ustawienia</h3>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" className="accent-indigo-600" defaultChecked />
              Prywatny profil
            </label>
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" className="accent-indigo-600" />
              Powiadomienia e-mail
            </label>
            <button className="mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded transition text-xs">
              Zmień motyw
            </button>
          </div>
        </div>

        {/* Edycja profilu (modalowa sekcja, ale na stronie) */}
        {edit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
            <form
              onSubmit={handleSubmit}
              className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 flex flex-col gap-6 animate-slide-up"
            >
              <button
                type="button"
                onClick={() => setEdit(false)}
                aria-label="Zamknij"
                className="absolute top-4 right-4 text-gray-400 hover:text-indigo-700 text-2xl"
              >
                <FaTimes />
              </button>
              <h2 className="text-2xl font-bold text-indigo-700 text-center mb-2">Edytuj profil</h2>
              <label className="flex flex-col gap-1 font-medium text-gray-700">
                Nick
                <input
                  name="username"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  required
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none bg-indigo-50/40 transition"
                />
              </label>
              <label className="flex flex-col gap-1 font-medium text-gray-700">
                O mnie
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  rows={3}
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none bg-indigo-50/40 transition"
                  placeholder="Opowiedz coś o sobie..."
                />
              </label>
              <label className="flex flex-col gap-1 font-medium text-gray-700">
                Nowe hasło
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Zostaw puste, by nie zmieniać"
                  className="px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none bg-indigo-50/40 transition"
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-2 px-4 rounded-lg transition text-lg shadow"
              >
                {loading ? "Zapisuję..." : "Zapisz zmiany"}
              </button>
              {msg && !success && <p className="text-red-600 font-semibold">{msg}</p>}
              {success && <p className="text-green-600 font-semibold flex items-center gap-2"><FaCheckCircle /> {msg}</p>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
