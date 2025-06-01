import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconBoardgame from "../assets/marker-boardgame.png";
import iconComputer from "../assets/marker-computer.png";
import iconPhysical from "../assets/marker-physical.png";
import iconOther from "../assets/marker-other.png";
import UserProfile from "./UserProfile";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const API_URL = "https://gramytu.onrender.com";

const icons = {
  planszowka: L.icon({ iconUrl: iconBoardgame, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  komputerowa: L.icon({ iconUrl: iconComputer, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  fizyczna: L.icon({ iconUrl: iconPhysical, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  inne: L.icon({ iconUrl: iconOther, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
};

export default function LandingMap({ events, user, setEvents }) {
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [organizerNames, setOrganizerNames] = useState({});
  const [commentsModalEvent, setCommentsModalEvent] = useState(null);

  // Funkcja do pobierania nicku organizatora po hostId
  const getOrganizerName = async (hostId, fallback) => {
    if (!hostId) return fallback || "Nieznany";
    if (organizerNames[hostId]) return organizerNames[hostId];
    try {
      const res = await fetch(`${API_URL}/users/${hostId}`);
      const user = await res.json();
      setOrganizerNames(names => ({ ...names, [hostId]: user.username }));
      return user.username;
    } catch {
      return fallback || "Nieznany";
    }
  };

  // Funkcja do usuwania eventu z listy (po stronie frontu)
  const handleDeleteEvent = (eventId) => {
    if (setEvents) {
      setEvents(prev => prev.filter(ev => ev._id !== eventId));
    }
  };

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden shadow-xl mb-4">
      <MapContainer
        center={[52.2297, 21.0122]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup chunkedLoading>
          {events.map(ev => (
            <Marker
              key={ev._id || ev.id}
              position={[
                ev.location ? ev.location.lat : ev.lat,
                ev.location ? ev.location.lng : ev.lng
              ]}
              icon={icons[ev.type] || icons.inne}
            >
              <Popup>
                <div className="flex flex-row gap-3 min-w-[320px] max-w-[400px] items-start">
                  {/* LEWO: ZDJĘCIE */}
                  {ev.image && (
                    <img
                      src={ev.image}
                      alt="Zdjęcie wydarzenia"
                      className="rounded-lg shadow w-24 h-24 object-cover flex-shrink-0"
                      style={{ minWidth: 96, minHeight: 96, maxWidth: 96, maxHeight: 96 }}
                    />
                  )}
                  {/* PRAWO: INFO */}
                  <div className="flex-1 flex flex-col">
                    <div className="font-bold text-indigo-700 text-base mb-1">{ev.title}</div>
                    <div className="text-xs text-gray-500 mb-2">
                      {ev.date?.slice(0, 10)} • {ev.location?.name}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">{ev.description}</div>
                    {ev.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {ev.tags.slice(0, 4).map(tag => (
                          <span key={tag} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                        ))}
                        {ev.tags.length > 4 && (
                          <span className="text-xs text-gray-400 ml-1">+{ev.tags.length - 4}</span>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      Organizator:{" "}
                      <OrganizerNameButton
                        hostId={ev.hostId}
                        fallback={ev.host}
                        setProfileUser={setProfileUser}
                        setShowProfile={setShowProfile}
                      />
                      {ev.contact && (
                        <>
                          <br />
                          Kontakt: <span className="text-gray-600">{ev.contact}</span>
                        </>
                      )}
                    </div>
                    {/* --- OPŁATA ZA UDZIAŁ --- */}
                    {ev.paid && (
                      <div className="text-xs text-indigo-700 font-semibold mb-1">
                        Opłata za udział: {ev.price} zł
                      </div>
                    )}
                    {/* Liczba miejsc */}
                    <div className="text-xs text-gray-600 mb-2">
                      Zapisani: {(ev.participants?.length || 0)}/{ev.maxParticipants}
                    </div>
                    {/* Like i przycisk do komentarzy */}
                    <div className="flex items-center gap-2 mt-2">
                      <LikeButton eventId={ev._id} user={user} />
                      <button
                        onClick={() => setCommentsModalEvent(ev._id)}
                        className="text-indigo-600 underline text-xs hover:text-indigo-800"
                      >
                        Komentarze
                      </button>
                    </div>
                    {/* --- DOŁĄCZANIE I PŁATNOŚĆ --- */}
                    {(ev.participants?.length || 0) < ev.maxParticipants ? (
                      <button
                        onClick={async () => {
                          if (ev.paid) {
                            alert(`Przekierowanie do płatności (mock): ${ev.price} zł`);
                            return;
                          }
                          const res = await fetch(`${API_URL}/events/${ev._id}/join`, {
                            method: "POST",
                            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                          });
                          if (res.ok) alert("Dołączono do wydarzenia!");
                          else alert("Nie udało się dołączyć.");
                        }}
                        className="bg-indigo-600 text-white px-4 py-1 rounded mt-2"
                      >
                        {ev.paid ? `Opłać udział (${ev.price} zł)` : "Dołącz"}
                      </button>
                    ) : (
                      <div className="text-red-500 font-semibold mt-2">Brak wolnych miejsc</div>
                    )}
                    {/* --- USUWANIE EVENTU --- */}
                    {user && ev.hostId === user._id && (
                      <button
                        onClick={async () => {
                          if (!window.confirm("Na pewno usunąć to wydarzenie?")) return;
                          const res = await fetch(
                            `${API_URL}/events/${ev._id}`,
                            {
                              method: "DELETE",
                              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                            }
                          );
                          if (res.ok) {
                            handleDeleteEvent(ev._id);
                            alert("Wydarzenie usunięte!");
                          } else {
                            alert("Nie udało się usunąć wydarzenia");
                          }
                        }}
                        className="bg-red-600 text-white px-4 py-1 rounded mt-2"
                      >
                        Usuń wydarzenie
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* MODAL PROFILU */}
      {showProfile && profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <UserProfile user={profileUser} onClose={() => setShowProfile(false)} />
        </div>
      )}

      {/* MODAL KOMENTARZY */}
      {commentsModalEvent && (
        <Modal onClose={() => setCommentsModalEvent(null)}>
          <CommentsSection eventId={commentsModalEvent} user={user} />
        </Modal>
      )}
    </div>
  );
}

// --- MODAL ---
function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          aria-label="Zamknij"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

// --- LIKE BUTTON ---
function LikeButton({ eventId, user }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/events/${eventId}`)
      .then(res => {
        if (!res.ok) {
          console.error("Błąd pobierania eventu (GET /events/:id):", res.status);
          return { likes: [] };
        }
        return res.json();
      })
      .then(ev => setLikes(ev.likes || []))
      .catch(err => {
        console.error("Błąd fetch likes:", err);
        setLikes([]);
      });
  }, [eventId]);

  const liked = user && likes.some(id => id === user._id || id?._id === user._id);

  const handleLike = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await fetch(
        `${API_URL}/events/${eventId}/${liked ? "unlike" : "like"}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      const res2 = await fetch(`${API_URL}/events/${eventId}`);
      if (!res2.ok) {
        setLikes([]);
        setLoading(false);
        return;
      }
      const ev = await res2.json();
      setLikes(ev.likes || []);
    } catch (err) {
      console.error("Błąd handleLike:", err);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      disabled={!user || loading}
      className="flex items-center gap-1 text-sm mb-2"
      title={user ? (liked ? "Cofnij polubienie" : "Polub") : "Zaloguj się, by polubić"}
    >
      {liked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
      <span>{likes.length}</span>
    </button>
  );
}

// --- KOMENTARZE ---
function CommentsSection({ eventId, user }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/events/${eventId}`)
      .then(res => {
        if (!res.ok) {
          console.error("Błąd pobierania eventu (GET /events/:id):", res.status);
          return { comments: [] };
        }
        return res.json();
      })
      .then(ev => setComments(ev.comments || []))
      .catch(err => {
        console.error("Błąd fetch comments:", err);
        setComments([]);
      });
  }, [eventId]);

  const handleAddComment = async () => {
    if (!user || !text.trim()) return;
    try {
      await fetch(`${API_URL}/events/${eventId}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ text })
      });
      const res = await fetch(`${API_URL}/events/${eventId}`);
      if (!res.ok) {
        setComments([]);
        return;
      }
      const ev = await res.json();
      setComments(ev.comments || []);
      setText("");
    } catch (err) {
      console.error("Błąd handleAddComment:", err);
    }
  };

  return (
    <div>
      <div className="font-semibold text-xs text-indigo-700 mb-3">Komentarze:</div>
      <ul className="mb-2 max-h-56 overflow-y-auto text-xs">
        {comments.map((c, i) => (
          <li key={i} className="mb-2 border-b pb-1">
            <b>{c.username}:</b> {c.text}
          </li>
        ))}
      </ul>
      {user && (
        <div className="flex gap-1 mt-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Dodaj komentarz..."
            className="border rounded px-2 py-1 flex-1 text-xs"
          />
          <button
            onClick={handleAddComment}
            className="bg-indigo-600 text-white px-2 rounded text-xs"
          >
            Dodaj
          </button>
        </div>
      )}
    </div>
  );
}

// --- ORGANIZATOR ---
function OrganizerNameButton({ hostId, fallback, setProfileUser, setShowProfile }) {
  const [name, setName] = useState(fallback);

  useEffect(() => {
    if (!hostId) return;
    fetch(`${API_URL}/users/${hostId}`)
      .then(res => res.json())
      .then(user => setName(user.username))
      .catch(() => setName(fallback));
  }, [hostId, fallback]);

  return (
    <button
      className="text-indigo-600 underline hover:text-indigo-800"
      type="button"
      onClick={async () => {
        if (hostId) {
          try {
            const res = await fetch(`${API_URL}/users/${hostId}`);
            const user = await res.json();
            setProfileUser(user);
          } catch {
            setProfileUser({ username: fallback, _id: hostId });
          }
        } else {
          setProfileUser({ username: fallback, _id: hostId });
        }
        setShowProfile(true);
      }}
    >
      {name}
    </button>
  );
}
