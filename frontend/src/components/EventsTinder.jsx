import { useEffect, useState } from "react";
import TinderCard from "react-tinder-card";

// Funkcja licząca dystans w km na podstawie współrzędnych
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function EventsTinder() {
  const [events, setEvents] = useState([]);
  const [lastDirection, setLastDirection] = useState(null);
  const [userPosition, setUserPosition] = useState(null);

  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
        err => setUserPosition(null)
      );
    }
  }, []);

  const onSwipe = (direction, eventTitle) => {
    setLastDirection(direction);
    // Możesz tu dodać logikę np. polubienia/odrzucenia eventu
  };

  const onCardLeftScreen = (title) => {
    // Możesz tu dodać np. usuwanie karty z listy
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 pt-8">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">Swipe'uj wydarzenia!</h1>
      <div className="relative w-[340px] h-[480px]">
        {events.map((ev, idx) => (
          <TinderCard
            key={ev._id}
            onSwipe={(dir) => onSwipe(dir, ev.title)}
            onCardLeftScreen={() => onCardLeftScreen(ev.title)}
            preventSwipe={["up", "down"]}
          >
            <div
              className="absolute w-[320px] h-[460px] bg-white rounded-2xl shadow-xl flex flex-col justify-between p-6"
              style={{
                top: 0,
                left: 0,
                backgroundImage: "linear-gradient(135deg, #e0e7ff 0%, #fff 100%)",
              }}
            >
              {/* ZDJĘCIE WYDARZENIA */}
              {ev.image && (
                <img
                  src={ev.image}
                  alt="Zdjęcie wydarzenia"
                  className="mb-3 rounded-lg shadow w-full object-cover"
                  style={{ maxHeight: 160, minHeight: 120 }}
                />
              )}
              <div>
                <div className="font-bold text-xl text-indigo-700 mb-1">{ev.title}</div>
                {/* DYSTANS */}
                {userPosition && ev.location && (
                  <div className="text-xs text-gray-500 mb-1">
                    {(() => {
                      const dist = getDistanceFromLatLonInKm(
                        userPosition[0],
                        userPosition[1],
                        ev.location.lat,
                        ev.location.lng
                      );
                      return `~${Math.round(dist)} km od Ciebie`;
                    })()}
                  </div>
                )}
                <div className="text-xs text-gray-500 mb-2">
                  {ev.date?.slice(0, 10)} • {ev.location?.name}
                </div>
                <div className="text-sm text-gray-700 mb-2">{ev.description}</div>
                {ev.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ev.tags.map(tag => (
                      <span key={tag} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-xs text-gray-400">
                  Organizator: <b>{ev.host}</b>
                </div>
                <div className="text-xs text-gray-400">
                  Kontakt: <span className="text-gray-600">{ev.contact}</span>
                </div>
              </div>
            </div>
          </TinderCard>
        ))}
      </div>
      {lastDirection && (
        <div className="mt-4 text-gray-500">
          Ostatni swipe: <b>{lastDirection}</b>
        </div>
      )}
    </div>
  );
}
