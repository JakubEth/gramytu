import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconBoardgame from "../assets/marker-boardgame.png";
import iconComputer from "../assets/marker-computer.png";
import iconPhysical from "../assets/marker-physical.png";
import iconOther from "../assets/marker-other.png";
import UserProfile from "./UserProfile";

const icons = {
  planszowka: L.icon({ iconUrl: iconBoardgame, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  komputerowa: L.icon({ iconUrl: iconComputer, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  fizyczna: L.icon({ iconUrl: iconPhysical, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
  inne: L.icon({ iconUrl: iconOther, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -38] }),
};

export default function LandingMap({ events }) {
    console.log(events);
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [organizerNames, setOrganizerNames] = useState({});

  // Funkcja do pobierania nicku organizatora po hostId
  const getOrganizerName = async (hostId, fallback) => {
    if (!hostId) return fallback || "Nieznany";
    if (organizerNames[hostId]) return organizerNames[hostId];
    try {
      const res = await fetch(`https://gramytu.onrender.com/users/${hostId}`);
      const user = await res.json();
      setOrganizerNames(names => ({ ...names, [hostId]: user.username }));
      return user.username;
    } catch {
      return fallback || "Nieznany";
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
              <div className="min-w-[210px] max-w-[260px] p-2">
                {/* ZDJĘCIE WYDARZENIA */}
                {ev.image && (
                  <img
                    src={ev.image}
                    alt="Zdjęcie wydarzenia"
                    className="mb-2 rounded-lg shadow w-full object-cover"
                    style={{ maxHeight: 120 }}
                  />
                )}
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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* MODAL PROFILU */}
      {showProfile && profileUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <UserProfile user={profileUser} onClose={() => setShowProfile(false)} />
        </div>
      )}
    </div>
  );
}

// Komponent do asynchronicznego pobierania nicku organizatora
function OrganizerNameButton({ hostId, fallback, setProfileUser, setShowProfile }) {
  const [name, setName] = useState(fallback);

  useEffect(() => {
    if (!hostId) return;
    fetch(`https://gramytu.onrender.com/users/${hostId}`)
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
            const res = await fetch(`https://gramytu.onrender.com/users/${hostId}`);
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
