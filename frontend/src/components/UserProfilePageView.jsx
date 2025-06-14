import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaInstagram, FaFacebook, FaDiscord, FaStar, FaUserPlus, FaUserCheck } from "react-icons/fa";

const API_URL = "https://gramytu.onrender.com";

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

function StarRating({ value = 0, max = 5 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {Array.from({ length: max }).map((_, i) =>
        <FaStar key={i} size={16} color={i < value ? "#facc15" : "#e5e7eb"} />
      )}
    </span>
  );
}

export default function UserProfilePageView() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Opinie - input i obsługa
  const [reviewForm, setReviewForm] = useState({ rating: 0, comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  // Follow system
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
      });
    fetch(`${API_URL}/users/${id}/reviews`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating);
        setReviewCount(data.count || 0);
      });
    fetch(`${API_URL}/users/${id}/activity`)
      .then(res => res.json())
      .then(setActivity)
      .finally(() => setLoading(false));
  }, [id]);

  // Id zalogowanego użytkownika
  const myId = (localStorage.getItem("userId") || "").toString();
  const isOwnProfile = (user?._id || "").toString() === myId;

  useEffect(() => {
    if (!user || !Array.isArray(user.followers)) return;
    const followersStr = user.followers.map(f => f.toString());
    setIsFollowing(followersStr.includes(myId.toString()));
  }, [user, myId]);

  const handleReviewSubmit = async e => {
    e.preventDefault();
    setReviewMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/users/${id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewMsg("Opinia dodana!");
        setReviewForm({ rating: 0, comment: "" });
        fetch(`${API_URL}/users/${id}/reviews`)
          .then(res => res.json())
          .then(data => {
            setReviews(data.reviews || []);
            setAvgRating(data.avgRating);
            setReviewCount(data.count || 0);
          });
      } else {
        setReviewMsg(data.error || "Błąd dodawania opinii");
      }
    } catch {
      setReviewMsg("Błąd sieci");
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    const token = localStorage.getItem("token");
    if (isFollowing) {
      await fetch(`${API_URL}/users/${id}/unfollow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } else {
      await fetch(`${API_URL}/users/${id}/follow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    fetch(`${API_URL}/users/${id}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
      });
    setFollowLoading(false);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Ładowanie profilu...</div>;
  if (!user) return <div className="p-8 text-center text-red-500">Nie znaleziono użytkownika.</div>;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #e0e7ef 0%, #f1f5f9 60%, #e0e7ff 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      padding: "48px 0"
    }}>
      {/* LEWA REKLAMA */}
      <div style={{
        width: 160,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "32px 0"
      }}>
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
          <video
            preload="none"
            poster="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/14May25-May_BHW_160_600.png"
            width="100%"
            height="100%"
            autoPlay
            loop
            muted
            playsInline
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/14May25-May_BHW_160_600.mp4" type="video/mp4" />
            <p>
              <a
                href="https://dolphin-anty.com/"
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

      {/* ŚRODKOWY PROFIL */}
      <div style={{
        flex: 1,
        background: "rgba(255,255,255,0.95)",
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
          <img
            src={user.avatar || defaultAvatar(user.username)}
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
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#3730a3" }}>{user.username || "Użytkownik"}</h1>
              <span style={{
                background: "#e0e7ff",
                color: "#3730a3",
                fontSize: 12,
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 12
              }}>ID: {user._id}</span>
            </div>
            <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8 }}>
              <span style={{ fontWeight: 600, color: "#3730a3" }}>
                <b>{followers.length}</b> obserwujących
              </span>
              <span style={{ fontWeight: 600, color: "#3730a3" }}>
                <b>{following.length}</b> obserwowanych
              </span>
              {!isOwnProfile && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  style={{
                    marginLeft: 12,
                    background: isFollowing ? "#fff" : "#3730a3",
                    color: isFollowing ? "#3730a3" : "#fff",
                    border: isFollowing ? "2px solid #3730a3" : "none",
                    fontWeight: 700,
                    padding: "10px 28px",
                    borderRadius: 24,
                    fontSize: 18,
                    boxShadow: "0 2px 8px #0001",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "all .15s"
                  }}
                >
                  {isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                  {isFollowing ? "Odobserwuj" : "Obserwuj"}
                </button>
              )}
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: "#3730a3" }}>Typ osobowości: </span>
              <span style={{ fontWeight: 500 }}>
                {user.mbtiType
                  ? user.mbtiType
                  : <span style={{ color: "#a1a1aa" }}>Nie uzupełniono</span>}
              </span>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ fontWeight: 700, color: "#3730a3" }}>Płeć: </span>
              <span style={{ fontWeight: 500 }}>
                {user.gender
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
          {!isOwnProfile && (
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
                  background: "linear-gradient(to right, #3730a3, #6366f1)",
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
          )}
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
      </div>

      {/* PRAWA REKLAMA */}
      <div style={{
        width: 160,
        minWidth: 120,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        margin: "32px 0"
      }}>
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
          <video
            preload="none"
            poster="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.png"
            width="100%"
            height="100%"
            autoPlay
            loop
            muted
            playsInline
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          >
            <source src="https://videos.advertserve.com/7ea0b05c7869582dc6039aa619dc080f/30May25-160x600-BHW_6B.mp4" type="video/mp4" />
            <p>
              <a
                href="https://proxidize.com/proxy-server/mobile-proxies/"
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
  );
}
