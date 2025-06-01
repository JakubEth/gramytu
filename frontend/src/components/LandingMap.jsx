import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function LandingMap({ events }) {
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
          >
            <Popup>
              <div className="font-bold">{ev.title}</div>
              <div className="text-sm">
                {ev.date} • {ev.location ? ev.location.name : ev.place}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
