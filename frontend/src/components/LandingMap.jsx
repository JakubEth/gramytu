import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaHeart, FaSignInAlt, FaSignOutAlt, FaComments, FaTrash, FaUsers } from "react-icons/fa";
import { io } from "socket.io-client";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "https://gramytu.onrender.com";
const SOCKET_URL = API_URL;

// Oryginalne ikony pinów
const icons = {
  planszowka: L.icon({ iconUrl: "../marker-boardgame.png", iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  komputerowa: L.icon({ iconUrl: "/marker-computer.png", iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  fizyczna: L.icon({ iconUrl: "/marker-physical.png", iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  inne: L.icon({ iconUrl: "/marker-other.png", iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
};

// DivIcon z subtelną kropką z avatarem NAD pinem (tylko dla własnych eventów)
function getUserPinIconWithAvatarDot({ type, avatarUrl }) {
  const baseIcon = icons[type] || icons.inne;

  return L.divIcon({
    className: "",
    iconAnchor: baseIcon.options.iconAnchor,
    popupAnchor: baseIcon.options.popupAnchor,
    html: `
      <div style="position: relative; display: inline-block;">
        <div style="
          position: absolute;
          top: -16px;
          left: 50%;
          transform: translateX(-50%);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px solid #fff;
          box-shadow: 0 0 4px rgba(0,0,0,0.15);
          background: #fff;
          overflow: hidden;
          z-index: 2;
        ">
          <img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
        </div>
        <img src="${baseIcon.options.iconUrl}" style="width: 32px; height: 38px; display: block; position: relative; z-index: 1;" />
      </div>
    `,
  });
}

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

function LikeButton({ eventId, user }) {
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/events/${eventId}`)
      .then(res => res.json())
      .then(ev => setLikes(ev.likes || []))
      .catch(() => setLikes([]));
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
      const ev = await res2.json();
      setLikes(ev.likes || []);
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={handleLike}
      className={`flex flex-col items-center ${liked ? "text-red-600" : "text-gray-400"} hover:text-red-800`}
      title={liked ? "Cofnij polubienie" : "Polub"}
      disabled={!user || loading}
    >
      <FaHeart size={22} />
      <span className="text-xs font-bold">{likes.length}</span>
    </button>
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
      <div className="flex items-center gap-2 font-semibold text-lg mb-3">
        <FaUsers className="text-indigo-600" /> Lista uczestników
      </div>
      {participants.length === 0 && <div className="text-gray-500">Brak zapisanych osób.</div>}
      <ul className="space-y-2">
        {participants.map(u => (
          <li key={u._id} className="flex items-center gap-2">
            <Link to={`/user/${u._id}`} className="flex items-center gap-2 hover:bg-indigo-50 px-2 py-1 rounded transition">
              <img
                src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=E0E7FF&color=3730A3&bold=true`}
                alt={u.username}
                className="w-8 h-8 rounded-full object-cover border border-indigo-100"
              />
              <span className="font-medium text-indigo-800">{u.username}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LandingMap({ events, user, setEvents }) {
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [flash, setFlash] = useState("");
  const [participantsMap, setParticipantsMap] = useState({});
  const socketRef = useRef(null);
  const navigate = useNavigate();

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
            const isOrganizer = user && ev.hostId === user._id;
            const isUserParticipant = user && participants.some(p => p._id === user._id || p === user._id);

            const avatarUrl =
              user && ev.hostId === user._id
                ? (user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=E0E7FF&color=3730A3&bold=true`)
                : "";

            const markerIcon =
              user && ev.hostId === user._id
                ? getUserPinIconWithAvatarDot({
                    type: ev.type,
                    avatarUrl
                  })
                : icons[ev.type] || icons.inne;

            return (
              <Marker
                key={ev._id || ev.id}
                position={[
                  ev.location ? ev.location.lat : ev.lat,
                  ev.location ? ev.location.lng : ev.lng
                ]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="flex flex-row gap-3 min-w-[340px] max-w-[440px] items-start">
                    {ev.image && (
                      <img
                        src={ev.image}
                        alt="Zdjęcie wydarzenia"
                        className="rounded-lg shadow w-24 h-24 object-cover flex-shrink-0"
                        style={{ minWidth: 96, minHeight: 96, maxWidth: 96, maxHeight: 96 }}
                      />
                    )}
                    <div className="flex-1 flex flex-col">
                      <div className="font-bold text-indigo-700 text-lg mb-1">{ev.title}</div>
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
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 mb-1">
                        <span>Organizator:</span>
                        <Link
                          to={`/user/${ev.hostId}`}
                          className="flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded transition"
                        >
                          <img
                            src={ev.hostAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(ev.host)}&background=E0E7FF&color=3730A3&bold=true`}
                            alt={ev.host}
                            className="w-7 h-7 rounded-full object-cover border border-indigo-100"
                          />
                          <span className="font-semibold text-indigo-800">{ev.host}</span>
                        </Link>
                      </div>
                      {ev.paid && (
                        <div className="text-xs text-indigo-700 font-semibold mb-1">
                          Opłata za udział: {ev.price} zł
                        </div>
                      )}
                      <button
                        className="flex items-center gap-2 text-xs text-indigo-700 underline mb-2 text-left hover:text-indigo-900 transition"
                        style={{ cursor: "pointer" }}
                        onClick={() => setParticipantsModalEvent(ev._id)}
                      >
                        <FaUsers className="text-indigo-500" /> Lista uczestników: {participants.length}/{ev.maxParticipants}
                      </button>
                      <div className="flex items-center gap-3 mt-3">
                        <LikeButton eventId={ev._id} user={user} />
                        <button
                          onClick={() => navigate("/my-events")}
                          className="flex flex-col items-center text-indigo-700 hover:text-indigo-900 transition"
                          title="Czat grupowy"
                        >
                          <FaComments size={22} />
                          <span className="text-xs">Czat</span>
                        </button>
                        {!isOrganizer && (participants.length < ev.maxParticipants) && !isUserParticipant && (
                          <button
                            onClick={async () => {
                              if (ev.paid) {
                                alert(`Przekierowanie do płatności (mock): ${ev.price} zł`);
                                return;
                              }
                              await handleJoin(ev._id);
                            }}
                            className="flex flex-col items-center text-indigo-600 hover:text-indigo-900"
                            title="Dołącz"
                          >
                            <FaSignInAlt size={22} />
                            <span className="text-xs">Dołącz</span>
                          </button>
                        )}
                        {!isOrganizer && isUserParticipant && (
                          <button
                            onClick={async () => await handleLeave(ev._id)}
                            className="flex flex-col items-center text-red-600 hover:text-red-900"
                            title="Opuść wydarzenie"
                          >
                            <FaSignOutAlt size={22} />
                            <span className="text-xs">Opuść</span>
                          </button>
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
                            className="flex flex-col items-center text-gray-400 hover:text-red-700"
                            title="Usuń wydarzenie"
                          >
                            <FaTrash size={22} />
                            <span className="text-xs">Usuń</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
      {participantsModalEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setParticipantsModalEvent(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Zamknij"
            >
              ×
            </button>
            <ParticipantsList eventId={participantsModalEvent} />
          </div>
        </div>
      )}
    </div>
  );
}
