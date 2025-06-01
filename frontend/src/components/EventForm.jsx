import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationSelector({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const { lat, lng } = marker.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    />
  ) : null;
}

export default function EventForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    locationName: "",
    host: ""
  });
  const [position, setPosition] = useState([52.2297, 21.0122]); // domyślna lokalizacja

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const event = {
      title: form.title,
      description: form.description,
      date: form.date,
      location: {
        name: form.locationName,
        lat: position[0],
        lng: position[1]
      },
      host: form.host
    };
    const res = await fetch("https://gramytu.onrender.com/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event)
    });
    const data = await res.json();
    onAdd(data);
    setForm({
      title: "",
      description: "",
      date: "",
      locationName: "",
      host: ""
    });
    setPosition([52.2297, 21.0122]);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg grid grid-cols-1 gap-4 mb-2">
      <h2 className="text-xl font-bold text-indigo-700">Dodaj wydarzenie</h2>
      <input name="title" placeholder="Tytuł" value={form.title} onChange={handleChange} required className="input" />
      <input name="description" placeholder="Opis" value={form.description} onChange={handleChange} required className="input" />
      <input name="date" placeholder="Data i godzina" value={form.date} onChange={handleChange} required className="input" />
      <input name="locationName" placeholder="Miejsce (np. Planszówkowo)" value={form.locationName} onChange={handleChange} required className="input" />
      <input name="host" placeholder="Organizator" value={form.host} onChange={handleChange} required className="input" />
      <div>
        <label className="block font-semibold mb-1">Wybierz lokalizację na mapie:</label>
        <MapContainer
          center={position}
          zoom={13}
          style={{ width: "100%", height: 220, borderRadius: "0.75rem", marginBottom: "1rem", zIndex: 30 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationSelector position={position} setPosition={setPosition} />
        </MapContainer>
        <div className="text-sm text-gray-500 mt-2">
          Wybrana lokalizacja: <b>{position[0].toFixed(5)}, {position[1].toFixed(5)}</b>
        </div>
      </div>
      <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition">Dodaj</button>
    </form>
  );
}
