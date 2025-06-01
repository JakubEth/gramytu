import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import logo from "../assets/logo.svg";

// Fix ikon Leaflet w Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function MapView({ events = [] }) {
  return (
    <section className="relative w-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 pb-12">
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-indigo-200 mt-8"
           style={{ height: 420 }}>
        <MapContainer center={[52.2297, 21.0122]} zoom={12} style={{ width: "100%", height: 420 }}>
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
      <div className="absolute left-1/2 -translate-x-1/2 top-12 bg-white/80 backdrop-blur-lg px-6 py-3 rounded-full shadow-lg flex items-center gap-4">
        <img src={logo} alt="logo" className="w-8 h-8" />
        <span className="font-bold text-lg text-indigo-700">Odkrywaj planszówkowe eventy w Twojej okolicy!</span>
      </div>
    </section>
  );
}
