import { useState, useRef, useEffect } from "react";
import { FaCamera, FaInstagram, FaFacebook, FaDiscord } from "react-icons/fa";

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

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
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0e7ff 0%, #fff 50%, #ede9fe 100%)",
      display: "flex",
      justifyContent: "center",
      padding: "48px 8px"
    }}>
      {/* LEWY BANER */}
      <div style={{ width: 160, display: "flex", flexDirection: "column", alignItems: "center", margin: "32px 0" }}>
  <div style={{
    width: 160,
    height: 600,
    background: "#000",
    border: "2px solid #d1d5db",
    borderRadius: 24,
    boxShadow: "0 8px 32px #0002",
    overflow: "hidden",
    position: "relative"
  }}>
    <div id="Video98811972Container" style={{ width: "100%", height: "100%" }}>
      <video
        id="Video_98811972"
        preload="none"
        poster="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/14May25-May_BHW_160_600.png"
        width="100%"
        height="100%"
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
      >
        <source src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/14May25-May_BHW_160_600.mp4" type="video/mp4" />
        <p>
          <a
            href="http://dotcomconsultancy.advertserve.com/servlet/click/zone?zid=8&cid=1756&mid=4073&pid=0&sid=13&uuid=bb552a497cffc0161b11a3d58f697df0&consent=true&ip=45.134.212.84&default=false&random=98811972&timestamp=20250602212241&test=false&resolution=1440x785&referrer=https%3A%2F%2Fblackhatworld.com%2F&redirect=https%3A%2F%2Fdolphin-anty.com%2F%3Futm_source%3Dmedia%26utm_medium%3Dpartners%26utm_campaign%3Dbhw20%26utm_content%3Dbanner"
            target="_blank"
            rel="nofollow"
          >
            <img
              src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/14May25-May_BHW_160_600.png"
              border="0"
              width="160"
              height="600"
              alt=""
              style={{ display: "block" }}
            />
          </a>
        </p>
      </video>
    </div>
  </div>
</div>


      {/* KARTA PROFILU */}
      <div style={{
        flex: 1,
        background: "rgba(255,255,255,0.9)",
        borderRadius: 32,
        boxShadow: "0 8px 32px #0002",
        padding: 40,
        maxWidth: 800,
        margin: "0 32px",
        display: "flex",
        flexDirection: "column",
        gap: 40
      }}>
        <div style={{ display: "flex", flexDirection: "row", gap: 40, alignItems: "flex-start" }}>
          {/* Avatar i upload */}
          <div style={{ position: "relative" }}>
            <img
              src={avatarPreview || defaultAvatar(user?.username)}
              alt="Profil"
              style={{
                width: 160,
                height: 160,
                borderRadius: "50%",
                border: "8px solid #e0e7ff",
                objectFit: "cover",
                boxShadow: "0 4px 16px #0002",
                transition: "transform .3s"
              }}
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
                  style={{
                    position: "absolute",
                    bottom: 8,
                    right: 8,
                    background: "#4f46e5",
                    color: "#fff",
                    borderRadius: "50%",
                    padding: 12,
                    boxShadow: "0 2px 8px #0002",
                    opacity: 0.9,
                    border: "none",
                    cursor: "pointer"
                  }}
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
              <span style={{
                background: "#e0e7ff",
                color: "#3730a3",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 12
              }}>ID: {user?._id}</span>
            </div>
            <p style={{ color: "#52525b", fontSize: 18 }}>
              Email: <span style={{ fontWeight: 500 }}>{user?.email || <span style={{ color: "#a1a1aa" }}>Nie podano</span>}</span>
            </p>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: "#3730a3" }}>Typ osobowości MBTI: </span>
              <span style={{ fontWeight: 500 }}>
                {user?.mbtiType
                  ? user.mbtiType
                  : <span style={{ color: "#a1a1aa" }}>Nie uzupełniono</span>}
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 24, marginTop: 8 }}>
              <a href={user.instagram || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#e1306c" }}><FaInstagram /></a>
              <a href={user.facebook || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#1877f2" }}><FaFacebook /></a>
              <a href={user.discord || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#5865f2" }}><FaDiscord /></a>
            </div>
            <div style={{ marginTop: 16 }}>
              <button
                style={{
                  background: "linear-gradient(to right, #4f46e5, #3730a3)",
                  color: "#fff",
                  fontWeight: 700,
                  padding: "12px 32px",
                  borderRadius: 16,
                  boxShadow: "0 2px 8px #0002",
                  fontSize: 18,
                  cursor: "pointer"
                }}
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
        {/* ...tu możesz dodać resztę sekcji profilu... */}
        <div style={{ color: "#a1a1aa", fontSize: 12, textAlign: "center" }}>
          &copy; {new Date().getFullYear()} GramyTu. Design na miarę startupu 2025 🚀
        </div>
      </div>

      {/* PRAWY BANER */}
      <div style={{ width: 160, display: "flex", flexDirection: "column", alignItems: "center", margin: "32px 0" }}>
  <div style={{
    width: 160,
    height: 600,
    background: "#000",
    border: "2px solid #d1d5db",
    borderRadius: 24,
    boxShadow: "0 8px 32px #0002",
    overflow: "hidden",
    position: "relative"
  }}>
    <div id="Video22477047Container" style={{ width: "100%", height: "100%" }}>
      <video
        id="Video_22477047"
        preload="none"
        poster="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.png"
        width="100%"
        height="100%"
        autoPlay
        loop
        muted
        playsInline
        webkit-playsinline="true"
        style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
      >
        <source src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.mp4" type="video/mp4" />
        <p>
          <a
            href="http://dotcomconsultancy.advertserve.com/servlet/click/zone?zid=7&cid=1768&mid=4086&pid=0&sid=13&uuid=bb552a497cffc0161b11a3d58f697df0&consent=true&ip=45.134.212.84&default=false&random=22477047&timestamp=20250602212241&test=false&resolution=1440x785&referrer=https%3A%2F%2Fblackhatworld.com%2F&redirect=https%3A%2F%2Fproxidize.com%2Fproxy-server%2Fmobile-proxies%2F%3Futm_source%3Dblackhatworld.com%26utm_medium%3Dbanner%26utm_campaign%3DBHW%2BBanner%2B6B%26utm_id%3Dblackhatworld.com"
            target="_blank"
            rel="nofollow"
          >
            <img
              src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.png"
              border="0"
              width="160"
              height="600"
              alt=""
              style={{ display: "block" }}
            />
          </a>
        </p>
      </video>
    </div>
  </div>
</div>


    </div>
  );
}
