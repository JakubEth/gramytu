import { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";

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

const SUGGESTED_TAGS = [
  "turniej", "spotkanie", "familijne", "strategiczne", "karcianki", "RPG", "nowość", "klasyk"
];

const MAX_TAGS = 6;

export default function EventForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    locationName: "",
    host: "",
    contact: ""
  });
  const [position, setPosition] = useState([52.2297, 21.0122]);
  const [date, setDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const containerRef = useRef(null);
  const [mapSize, setMapSize] = useState(420);

  useEffect(() => {
    function resize() {
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        setMapSize(Math.max(Math.min(height, 520), 340));
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleTagKeyDown = e => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim() !== "") {
      e.preventDefault();
      if (
        !tags.includes(tagInput.trim()) &&
        tags.length < MAX_TAGS
      ) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const handleAddSuggestedTag = tag => {
    if (!tags.includes(tag) && tags.length < MAX_TAGS) {
      setTags([...tags, tag]);
    }
  };

  // WALIDACJA: wszystkie wymagane pola muszą być wypełnione
  const isFormValid =
    form.title.trim() &&
    form.description.trim() &&
    form.locationName.trim() &&
    form.host.trim() &&
    form.contact.trim() &&
    date;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isFormValid) return;
    const event = {
      title: form.title,
      description: form.description,
      date: date.toISOString(),
      location: {
        name: form.locationName,
        lat: position[0],
        lng: position[1]
      },
      host: form.host,
      contact: form.contact,
      tags
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
      locationName: "",
      host: "",
      contact: ""
    });
    setDate(null);
    setTags([]);
    setTagInput("");
    setPosition([52.2297, 21.0122]);
  };

  return (
    <form
      ref={containerRef}
      onSubmit={handleSubmit}
      className="w-full max-w-[1000px] bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row gap-10 p-6 md:p-10"
      style={{ minHeight: 420, maxHeight: 700, overflowY: "auto" }}
    >
      {/* LEWA KOLUMNA: INPUTY */}
      <div className="flex-1 flex flex-col gap-4 justify-between min-w-[320px] max-w-[500px]">
        <div>
          <h2 className="text-2xl font-bold text-indigo-700 mb-4">Dodaj wydarzenie</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Tytuł</label>
              <input
                name="title"
                placeholder="Tytuł"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Opis</label>
              <input
                name="description"
                placeholder="Opis"
                value={form.description}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Miejsce</label>
              <input
                name="locationName"
                placeholder="Np. Planszówkowo"
                value={form.locationName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold text-gray-700">Organizator</label>
              <input
                name="host"
                placeholder="Organizator"
                value={form.host}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
              />
            </div>
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700">Kontakt do organizatora</label>
            <input
              name="contact"
              placeholder="E-mail lub telefon"
              value={form.contact}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
            />
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700">Data wydarzenia</label>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
              <DatePicker
                label="Data wydarzenia"
                value={date}
                onChange={setDate}
                slotProps={{
                  textField: {
                    required: true,
                    fullWidth: true,
                    className: "w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
                  }
                }}
              />
            </LocalizationProvider>
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700">
              Tagi: <span className="text-gray-400 text-xs">(max {MAX_TAGS})</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, idx) => (
                <span
                  key={tag}
                  className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    className="ml-1 text-indigo-700 hover:text-red-500"
                    onClick={() => setTags(tags.filter((t, i) => i !== idx))}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder={tags.length >= MAX_TAGS ? "Limit tagów" : "Dodaj tag i Enter"}
                className="px-3 py-1 border rounded-full text-sm focus:border-indigo-500 outline-none"
                style={{ minWidth: 80, maxWidth: 150 }}
                disabled={tags.length >= MAX_TAGS}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {SUGGESTED_TAGS.map(tag => (
                <button
                  type="button"
                  key={tag}
                  className={`px-3 py-1 rounded-full border text-sm ${
                    tags.includes(tag)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-gray-100 text-gray-600 border-gray-300"
                  }`}
                  onClick={() => handleAddSuggestedTag(tag)}
                  disabled={tags.includes(tag) || tags.length >= MAX_TAGS}
                  style={tags.length >= MAX_TAGS && !tags.includes(tag) ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className={`bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg transition mt-4 w-full ${!isFormValid ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
          disabled={!isFormValid}
        >
          Dodaj
        </button>
      </div>

      {/* PRAWA KOLUMNA: MAPA KWADRATOWA */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-[340px]">
        <label className="block font-semibold mb-2 text-center">Wybierz lokalizację na mapie:</label>
        <div
          style={{
            width: mapSize,
            height: mapSize,
            maxWidth: "100%",
            borderRadius: "0.75rem",
            overflow: "hidden",
            boxShadow: "0 2px 12px 0 rgb(0 0 0 / 0.07)"
          }}
          className="bg-gray-100"
        >
          <MapContainer
            center={position}
            zoom={13}
            style={{ width: "100%", height: "100%", borderRadius: "0.75rem", zIndex: 30 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <div className="text-sm text-gray-500 mt-2 text-center">
          Wybrana lokalizacja: <b>{position[0].toFixed(5)}, {position[1].toFixed(5)}</b>
        </div>
      </div>
    </form>
  );
}
