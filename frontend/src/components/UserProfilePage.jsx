import { useState, useRef, useEffect } from "react";
import { FaCamera, FaCheckCircle, FaInstagram, FaFacebook, FaDiscord, FaTrophy, FaTimes } from "react-icons/fa";

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #e0e7ff 0%, #fff 50%, #ede9fe 100%)", display: "flex", justifyContent: "center", padding: "48px 8px" }}>
      {/* LEWY BANER */}
      <div style={{ width: 160, display: "flex", flexDirection: "column", alignItems: "center", marginRight: 32 }}>
        <div style={{ background: "#000", border: "2px solid #d1d5db", borderRadius: 24, boxShadow: "0 8px 32px #0002", height: 600, width: 144, margin: "32px 0", overflow: "hidden", position: "relative" }}>
          <a href="https://worldoftanks.eu/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 0, width: "100%", height: "100%", transition: "transform .2s" }}>
            <img
              src="https://media1.tenor.com/m/W9HhgbYoHpMAAAAd/world-of-tanks.gif"
              alt="World of Tanks"
              style={{ width: "100%", height: 240, objectFit: "cover" }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: 8 }}>
              <span style={{ fontWeight: 800, color: "#fde047", fontSize: 20, textAlign: "center", textShadow: "0 2px 8px #0008", animation: "pulse 1s infinite" }}>World of Tanks</span>
              <span style={{ fontSize: 12, color: "#e5e7eb", marginTop: 4, textAlign: "center" }}>Zagraj za darmo! <br /> Czołgi, wybuchy, akcja!</span>
              <button style={{ marginTop: 12, background: "#fde047", color: "#000", fontWeight: 700, padding: "4px 16px", borderRadius: 8, boxShadow: "0 2px 8px #0002", animation: "bounce 1s infinite" }}>
                ZAGRAJ
              </button>
            </div>
          </a>
          <span style={{ position: "absolute", top: 8, right: 8, background: "#dc2626", color: "#fff", fontSize: 12, padding: "2px 8px", borderRadius: 8, animation: "pulse 1s infinite", zIndex: 10 }}>REKLAMA</span>
        </div>
      </div>

      {/* KARTA PROFILU */}
      <div style={{ flex: 1, background: "rgba(255,255,255,0.9)", borderRadius: 32, boxShadow: "0 8px 32px #0002", padding: 40, maxWidth: 800, margin: "0 32px", display: "flex", flexDirection: "column", gap: 40 }}>
        {/* ...cała zawartość profilu jak wcześniej... */}
        <div style={{ display: "flex", flexDirection: "row", gap: 40, alignItems: "flex-start" }}>
          {/* Avatar i upload */}
          <div style={{ position: "relative" }}>
            <img
              src={avatarPreview || defaultAvatar(user?.username)}
              alt="Profil"
              style={{ width: 160, height: 160, borderRadius: "50%", border: "8px solid #e0e7ff", objectFit: "cover", boxShadow: "0 4px 16px #0002", transition: "transform .3s" }}
            />
            {edit && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  style={{ position: "absolute", bottom: 8, right: 8, background: "#4f46e5", color: "#fff", borderRadius: "50%", padding: 12, boxShadow: "0 2px 8px #0002", opacity: 0.9, border: "none", cursor: "pointer" }}
                  aria-label="Zmień zdjęcie profilowe"
                  disabled={loading}
                >
                  <FaCamera size={20} />
                </button>
              </>
            )}
          </div>
          {/* Dane i social */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#3730a3" }}>{user?.username || "Użytkownik"}</h1>
              <span style={{ background: "#e0e7ff", color: "#3730a3", fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 12 }}>ID: {user?._id}</span>
            </div>
            <p style={{ color: "#52525b", fontSize: 18 }}>Email: <span style={{ fontWeight: 500 }}>{user?.email}</span></p>
            <div style={{ display: "flex", gap: 12, fontSize: 24, marginTop: 8 }}>
              <a href={user.instagram || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#e1306c" }}><FaInstagram /></a>
              <a href={user.facebook || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#1877f2" }}><FaFacebook /></a>
              <a href={user.discord || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#5865f2" }}><FaDiscord /></a>
            </div>
            <div style={{ marginTop: 16 }}>
              <button
                style={{ background: "linear-gradient(to right, #4f46e5, #3730a3)", color: "#fff", fontWeight: 700, padding: "12px 32px", borderRadius: 16, boxShadow: "0 2px 8px #0002", fontSize: 18, cursor: "pointer" }}
                onClick={() => setEdit(true)}
                disabled={edit}
              >
                Edytuj profil
              </button>
            </div>
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: "#3730a3" }}>O mnie</h3>
              <p style={{ color: "#52525b" }}>{user.bio || "Jeszcze nie uzupełniono opisu."}</p>
            </div>
          </div>
        </div>
        {/* Statystyki, osiągnięcia, aktywności, rekomendacje, ustawienia */}
        {/* ...tu możesz wkleić resztę swoich sekcji jak w poprzednich kodach... */}
      </div>

      {/* PRAWY BANER */}
      <div style={{ width: 160, display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 32 }}>
        <div style={{ background: "#fff", border: "2px solid #d1d5db", borderRadius: 24, boxShadow: "0 8px 32px #0002", height: 600, width: 144, margin: "32px 0", overflow: "hidden", position: "relative" }}>
          <a href="https://worldoftanks.eu/" target="_blank" rel="noopener noreferrer" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 0, width: "100%", height: "100%", transition: "transform .2s" }}>
            <img
              src="https://media.giphy.com/media/3o6Zt6ML6BklcajjsA/giphy.gif"
              alt="World of Tanks Banner"
              style={{ width: "100%", height: 240, objectFit: "cover" }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", padding: 8 }}>
              <span style={{ fontWeight: 800, color: "#3730a3", fontSize: 20, textAlign: "center", textShadow: "0 2px 8px #0008", animation: "pulse 1s infinite" }}>Dołącz do bitwy!</span>
              <span style={{ fontSize: 12, color: "#52525b", marginTop: 4, textAlign: "center" }}>Nowe czołgi, nowe mapy, darmowe nagrody!</span>
              <button style={{ marginTop: 12, background: "#3730a3", color: "#fff", fontWeight: 700, padding: "4px 16px", borderRadius: 8, boxShadow: "0 2px 8px #0002", animation: "bounce 1s infinite" }}>
                ZAREJESTRUJ SIĘ
              </button>
            </div>
          </a>
          <span style={{ position: "absolute", top: 8, right: 8, background: "#dc2626", color: "#fff", fontSize: 12, padding: "2px 8px", borderRadius: 8, animation: "pulse 1s infinite", zIndex: 10 }}>REKLAMA</span>
        </div>
      </div>
    </div>
  );
}
