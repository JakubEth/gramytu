import { useState, useRef, useEffect } from "react";
import { FaCamera, FaInstagram, FaFacebook, FaDiscord, FaStar } from "react-icons/fa";

// Komponent do wyświetlania gwiazdek oceny
function StarRating({ value = 0, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) =>
        <FaStar key={i} size={16} color={i < value ? "#facc15" : "#e5e7eb"} />
      )}
    </span>
  );
}

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

  // Opinie
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");
  const [activity, setActivity] = useState([]);

  // Pobieranie opinii i aktywności
  useEffect(() => {
    if (!user?._id) return;
    fetch(`https://gramytu.onrender.com/users/${user._id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating);
        setReviewCount(data.count || 0);
        const myId = localStorage.getItem("userId");
        setMyReview(data.reviews?.find(r => r.author?._id === myId));
      });
    fetch(`https://gramytu.onrender.com/users/${user._id}/activity`)
      .then(res => res.json())
      .then(setActivity);
  }, [user?._id, success]);

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

  // Dodawanie opinii
  const handleReviewSubmit = async e => {
    e.preventDefault();
    setReviewMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://gramytu.onrender.com/users/${user._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMsg("Opinia dodana!");
        setReviewForm({ rating: 0, comment: "" });
        setSuccess(true);
      } else {
        setReviewMsg(data.error || "Błąd dodawania opinii");
      }
    } catch {
      setReviewMsg("Błąd sieci");
    }
  };

  // Id zalogowanego użytkownika
  const myId = localStorage.getItem("userId");
  const isOwnProfile = user?._id === myId;

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
        {/* ...baner lewy jak wcześniej... */}
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
              <span style={{ fontWeight: 700, color: "#3730a3" }}>Typ osobowości: </span>
              <span style={{ fontWeight: 500 }}>
                {user?.mbtiType
                  ? user.mbtiType
                  : <span style={{ color: "#a1a1aa" }}>Nie uzupełniono</span>}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: "#3730a3" }}>Płeć: </span>
              <span style={{ fontWeight: 500 }}>
                {user?.gender
                  ? user.gender
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

        {/* OPINIE I OCENY */}
        <section style={{ background: "#f1f5f9", borderRadius: 24, padding: 32, boxShadow: "0 2px 8px #0001" }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: "#3730a3", marginBottom: 12 }}>Opinie i oceny</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <StarRating value={Math.round(avgRating)} />
            <span style={{ fontWeight: 700, fontSize: 18, color: "#3730a3" }}>
              {avgRating ? Number(avgRating).toFixed(2) : "-"}
            </span>
            <span style={{ color: "#a1a1aa", fontSize: 14 }}>
              ({reviewCount} opinii)
            </span>
          </div>
          {!isOwnProfile && !myReview ? (
            <form onSubmit={handleReviewSubmit} style={{ marginBottom: 16, display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ fontWeight: 600, color: "#3730a3" }}>Twoja ocena:</label>
              <div style={{ display: "flex", gap: 4 }}>
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setReviewForm(f => ({ ...f, rating: i }))}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: reviewForm.rating >= i ? "#facc15" : "#e5e7eb"
                    }}
                  >
                    <FaStar size={24} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                placeholder="Napisz opinię..."
                rows={2}
                style={{
                  borderRadius: 12,
                  border: "1px solid #e0e7ff",
                  padding: 8,
                  fontSize: 16,
                  resize: "vertical"
                }}
                required
              />
              <button
                type="submit"
                style={{
                  background: "linear-gradient(to right, #4f46e5, #3730a3)",
                  color: "#fff",
                  fontWeight: 700,
                  padding: "8px 24px",
                  borderRadius: 12,
                  fontSize: 16,
                  cursor: "pointer",
                  marginTop: 4
                }}
                disabled={reviewForm.rating === 0 || !reviewForm.comment.trim()}
              >
                Dodaj opinię
              </button>
              <div style={{ color: "#16a34a", fontWeight: 600 }}>{reviewMsg}</div>
            </form>
          ) : isOwnProfile ? (
            <div style={{ color: "#a1a1aa", fontStyle: "italic" }}>
              Nie możesz ocenić samego siebie.
            </div>
          ) : myReview ? (
            <div style={{ color: "#16a34a", fontWeight: 600, marginBottom: 8 }}>
              Dziękujemy za Twoją opinię!
            </div>
          ) : null}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {reviews.length === 0 && (
              <div style={{ color: "#a1a1aa", fontStyle: "italic" }}>Brak opinii</div>
            )}
            {reviews.map(r => (
              <div key={r._id} style={{ background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 1px 4px #0001", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <img
                  src={r.author?.avatar || defaultAvatar(r.author?.username)}
                  alt={r.author?.username}
                  style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", border: "2px solid #e0e7ff" }}
                />
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 700, color: "#3730a3" }}>{r.author?.username}</span>
                    <StarRating value={r.rating} />
                  </div>
                  <div style={{ color: "#52525b", marginTop: 4 }}>{r.comment}</div>
                  <div style={{ color: "#a1a1aa", fontSize: 12, marginTop: 2 }}>{new Date(r.createdAt).toLocaleString("pl-PL")}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DZIENNIK AKTYWNOŚCI */}
        <section style={{ background: "#f1f5f9", borderRadius: 24, padding: 32, boxShadow: "0 2px 8px #0001" }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: "#3730a3", marginBottom: 12 }}>Dziennik aktywności</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {activity.length === 0 && (
              <div style={{ color: "#a1a1aa", fontStyle: "italic" }}>Brak aktywności</div>
            )}
            {activity.map((a, idx) => (
              <div key={a._id || idx} style={{ background: "#fff", borderRadius: 12, padding: 12, color: "#52525b", fontSize: 15, boxShadow: "0 1px 4px #0001" }}>
                <span style={{ fontWeight: 600, color: "#3730a3" }}>{new Date(a.date).toLocaleString("pl-PL")}</span>
                <span style={{ marginLeft: 8 }}>{a.details || a.type}</span>
                {a.eventTitle && <span style={{ marginLeft: 8, color: "#6366f1" }}>({a.eventTitle})</span>}
              </div>
            ))}
          </div>
        </section>

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
