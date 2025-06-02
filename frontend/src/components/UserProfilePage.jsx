import { useState, useRef } from "react";

// Domyślne zdjęcie profilowe (możesz podmienić na własne lub dodać upload na backend)
const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

export default function UserProfilePage({ user, onClose, onUpdate }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    username: user?.username || "",
    password: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || defaultAvatar(user?.username));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const fileInputRef = useRef();

  // Upload avatara do backendu (Cloudinary)
  const handleAvatarUpload = async (file) => {
    setLoading(true);
    setMsg("");
    const formData = new FormData();
    formData.append("avatar", file);
    const token = localStorage.getItem("token");
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
      onUpdate && onUpdate({ ...user, avatar: data.avatar });
    } else {
      setMsg(data.error || "Błąd uploadu");
    }
  };

  // Obsługa wyboru pliku
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    handleAvatarUpload(file);
  };

  // Edycja nicku/hasła (bez avatara!)
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const res = await fetch(`https://gramytu.onrender.com/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password || undefined,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg("Zapisano zmiany!");
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
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
        aria-label="Zamknij"
      >
        ×
      </button>
      <div className="mb-4 relative">
        <img
          src={avatarPreview || defaultAvatar(user?.username)}
          alt="Profil"
          className="w-24 h-24 rounded-full border-4 border-indigo-100 object-cover"
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
              className="absolute bottom-0 right-0 bg-indigo-600 text-white rounded-full p-2 text-xs shadow"
              disabled={loading}
            >
              {loading ? "..." : "Zmień"}
            </button>
          </>
        )}
      </div>
      {!edit ? (
        <>
          <div className="font-bold text-xl text-indigo-800 mb-2">{user?.username || "Użytkownik"}</div>
          <div className="text-sm text-gray-500 mb-4">ID: {user?._id}</div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition mb-2"
            onClick={() => setEdit(true)}
          >
            Edytuj profil
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
          <label className="text-xs font-semibold text-gray-700">Nazwa użytkownika</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none"
            value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
            required
          />
          <label className="text-xs font-semibold text-gray-700">Nowe hasło</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 outline-none"
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            placeholder="Zostaw puste, by nie zmieniać"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg transition mt-2"
          >
            {loading ? "Zapisuję..." : "Zapisz zmiany"}
          </button>
          <button
            type="button"
            onClick={() => setEdit(false)}
            className="text-gray-500 hover:text-indigo-600 text-xs mt-1"
          >
            Anuluj
          </button>
          {msg && <div className="text-xs text-center text-green-600 mt-1">{msg}</div>}
        </form>
      )}
    </div>
  );
}
