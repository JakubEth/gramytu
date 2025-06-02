import { useState, useEffect, useRef } from "react";
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
import { io } from "socket.io-client";

const API_URL = "https://gramytu.onrender.com";
const SOCKET_URL = API_URL;

const icons = {
  planszowka: L.icon({ iconUrl: iconBoardgame, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  komputerowa: L.icon({ iconUrl: iconComputer, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  fizyczna: L.icon({ iconUrl: iconPhysical, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  inne: L.icon({ iconUrl: iconOther, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
};

function timeToEvent(eventDate) {
  if (!eventDate) return "";
  const now = new Date();
  const date = new Date(eventDate);
  const diffMs = date - now;
  if (diffMs <= 0) return "Wydarzenie już się odbyło";
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
  if (diffDays > 0) return `za ${diffDays} dni${diffHours > 0 ? `, ${diffHours}h` : ""}`;
  if (diffHours > 0) return `za ${diffHours}h${diffMinutes > 0 ? `, ${diffMinutes}min` : ""}`;
  return `za ${diffMinutes}min`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return (
    d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) +
    ", " +
    d.toLocaleDateString("pl-PL")
  );
}

function GroupChat({ eventId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!eventId) return;
    fetch(`${API_URL}/events/${eventId}/chat`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;
    socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socketRef.current.emit("joinEventChat", {
      eventId,
      token: localStorage.getItem("token"),
    });

    socketRef.current.on("eventMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on("deleteMessage", (msgId) => {
      setMessages(prev => prev.filter(m => m._id !== msgId));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [eventId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const close = () => setMenu(m => m.visible ? { ...m, visible: false } : m);
    if (menu.visible) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu.visible]);

  const handleSend = () => {
    if (!text.trim()) return;
    socketRef.current.emit("eventMessage", {
      eventId,
      text,
    });
    setText("");
  };

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    setMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      msg,
    });
  };

  const handleDelete = () => {
    const msg = menu.msg;
    fetch(`${API_URL}/events/${eventId}/chat/${msg._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => {
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== msg._id));
        socketRef.current.emit("deleteMessage", msg._id);
        setMenu({ visible: false, x: 0, y: 0, msg: null });
      }
    });
  };

  return (
    <div className="flex flex-col h-96 relative">
      <div className="font-semibold mb-2">Czat grupowy wydarzenia</div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2">
        {(!messages || messages.length === 0) && (
          <div className="text-gray-400 italic">Brak wiadomości w czacie.</div>
        )}
        {Array.isArray(messages) && messages.map((msg, i) => {
          const isMine = user && (msg.userId === user._id || msg.userId?._id === user._id);
          return (
            <div
              key={msg._id || i}
              className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
              onContextMenu={isMine ? (e) => handleContextMenu(e, msg) : undefined}
              style={{ userSelect: "text" }}
            >
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl shadow relative group
                ${isMine
                  ? "bg-indigo-100 text-indigo-900 rounded-br-sm"
                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"}
                `}
                style={{ cursor: isMine ? "context-menu" : "default" }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs text-gray-600">{msg.username}</span>
                  <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
                </div>
                <div className="break-words whitespace-pre-wrap">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2 mt-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="border rounded px-2 py-1 flex-1 text-sm"
          placeholder="Napisz wiadomość..."
          onKeyDown={e => e.key === "Enter" ? handleSend() : null}
        />
        <button
          className="bg-indigo-600 text-white px-3 rounded"
          onClick={handleSend}
        >
          Wyślij
        </button>
      </div>
      {menu.visible && (
        <div
          className="fixed z-50 bg-white border rounded shadow-lg py-1 px-2 text-sm"
          style={{
            top: menu.y,
            left: menu.x,
            minWidth: 120,
          }}
        >
          <button
            className="w-full text-left px-2 py-1 hover:bg-red-50 hover:text-red-600 rounded"
            onClick={handleDelete}
          >
            Usuń wiadomość
          </button>
        </div>
      )}
    </div>
  );
}

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

function ParticipantsList({ eventId }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/events/${eventId}/participants`)
      .then(res => res.json())
      .then(data => {
        setParticipants(data);
        setLoading(false);
      });
  }, [eventId]);

  if (loading) return <div>Ładowanie...</div>;

  return (
    <div>
      <div className="font-semibold text-lg mb-3">Uczestnicy wydarzenia</div>
      {participants.length === 0 && <div className="text-gray-500">Brak zapisanych osób.</div>}
      <ul className="space-y-2">
        {participants.map(u => (
          <li key={u._id} className="flex items-center gap-2">
            {u.avatar && (
              <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full object-cover" />
            )}
            <span className="font-medium">{u.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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

export default function LandingMap({ events, user, setEvents }) {
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [organizerNames, setOrganizerNames] = useState({});
  const [commentsModalEvent, setCommentsModalEvent] = useState(null);
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [chatModalEvent, setChatModalEvent] = useState(null);
  const [flash, setFlash] = useState("");
  const [participantsMap, setParticipantsMap] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current.on("participantsUpdate", ({ eventId, participants }) => {
      setParticipantsMap(prev => ({ ...prev, [eventId]: participants }));
    });
    return () => socketRef.current.disconnect();
  }, []);

  const fetchParticipants = async (eventId) => {
    const res = await fetch(`${API_URL}/events/${eventId}/participants`);
    const data = await res.json();
    setParticipantsMap(prev => ({ ...prev, [eventId]: data }));
  };

  const handleJoin = async (eventId) => {
    const res = await fetch(`${API_URL}/events/${eventId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      setFlash("Dołączono do wydarzenia!");
      await fetchParticipants(eventId);
      socketRef.current.emit("participantsUpdate", { eventId });
      setTimeout(() => setFlash(""), 2000);
    }
  };

  const handleLeave = async (eventId) => {
    const res = await fetch(`${API_URL}/events/${eventId}/leave`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    if (res.ok) {
      setFlash("Opuściłeś wydarzenie!");
      await fetchParticipants(eventId);
      socketRef.current.emit("participantsUpdate", { eventId });
      setTimeout(() => setFlash(""), 2000);
    }
  };

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

  const handleDeleteEvent = (eventId) => {
    if (setEvents) {
      setEvents(prev => prev.filter(ev => ev._id !== eventId));
    }
  };

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden shadow-xl mb-4">
      {flash && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow z-50">
          {flash}
        </div>
      )}
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
          {events.map(ev => {
            const participants = participantsMap[ev._id] || ev.participants || [];
            const isUserParticipant = user && participants.some(p => p._id === user._id || p === user._id);
            return (
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
                    {ev.image && (
                      <img
                        src={ev.image}
                        alt="Zdjęcie wydarzenia"
                        className="rounded-lg shadow w-24 h-24 object-cover flex-shrink-0"
                        style={{ minWidth: 96, minHeight: 96, maxWidth: 96, maxHeight: 96 }}
                      />
                    )}
                    <div className="flex-1 flex flex-col">
                      <div className="font-bold text-indigo-700 text-base mb-1">{ev.title}</div>
                      <div className="text-xs text-gray-500 mb-2">
                        {timeToEvent(ev.date)} • {ev.location?.name}
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
                      </div>
                      {ev.paid && (
                        <div className="text-xs text-indigo-700 font-semibold mb-1">
                          Opłata za udział: {ev.price} zł
                        </div>
                      )}
                      <button
                        className="text-xs text-indigo-700 underline mb-2 text-left"
                        style={{ cursor: "pointer" }}
                        onClick={() => setParticipantsModalEvent(ev._id)}
                      >
                        Zapisani: {participants.length}/{ev.maxParticipants}
                      </button>
                      <div className="flex items-center gap-2 mt-2">
                        <LikeButton eventId={ev._id} user={user} />
                        <button
                          onClick={() => setCommentsModalEvent(ev._id)}
                          className="text-indigo-600 underline text-xs hover:text-indigo-800"
                        >
                          Komentarze
                        </button>
                      </div>
                      {(participants.length < ev.maxParticipants) && !isUserParticipant && (
                        <button
                          onClick={async () => {
                            if (ev.paid) {
                              alert(`Przekierowanie do płatności (mock): ${ev.price} zł`);
                              return;
                            }
                            await handleJoin(ev._id);
                          }}
                          className="bg-indigo-600 text-white px-4 py-1 rounded mt-2"
                        >
                          {ev.paid ? `Opłać udział (${ev.price} zł)` : "Dołącz"}
                        </button>
                      )}
                      {isUserParticipant && (
                        <>
                          <button
                            onClick={async () => await handleLeave(ev._id)}
                            className="bg-red-600 text-white px-4 py-1 rounded mt-2"
                          >
                            Opuść wydarzenie
                          </button>
                          <button
                            className="bg-indigo-700 text-white px-3 py-1 rounded mb-2 mt-2"
                            onClick={() => setChatModalEvent(ev._id)}
                          >
                            Dołącz do czatu grupowego
                          </button>
                        </>
                      )}
                      {(participants.length >= ev.maxParticipants) && !isUserParticipant && (
                        <div className="text-red-500 font-semibold mt-2">Brak wolnych miejsc</div>
                      )}
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
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      {showProfile && profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <UserProfile user={profileUser} onClose={() => setShowProfile(false)} />
        </div>
      )}
      {commentsModalEvent && (
        <Modal onClose={() => setCommentsModalEvent(null)}>
          <CommentsSection eventId={commentsModalEvent} user={user} />
        </Modal>
      )}
      {participantsModalEvent && (
        <Modal onClose={() => setParticipantsModalEvent(null)}>
          <ParticipantsList eventId={participantsModalEvent} />
        </Modal>
      )}
      {chatModalEvent && (
        <Modal onClose={() => setChatModalEvent(null)}>
          <GroupChat eventId={chatModalEvent} user={user} />
        </Modal>
      )}
    </div>
  );
}
