import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";

const DEFAULT_IMAGES = {
  planszowka: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  komputerowa: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=600&q=80",
  fizyczna: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80",
  inne: "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80"
};

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

export default function EventForm({ onAdd, user }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    locationName: "",
    contact: "",
    type: "",
  });
  const [position, setPosition] = useState([52.2297, 21.0122]);
  const [date, setDate] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [image, setImage] = useState(null);

  const [maxParticipants, setMaxParticipants] = useState(10);
  const [paid, setPaid] = useState(false);
  const [price, setPrice] = useState(0);

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

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
    }
  };

  const isFormValid =
    form.title.trim() &&
    form.description.trim() &&
    form.locationName.trim() &&
    form.type.trim() &&
    date &&
    user?.username &&
    user?._id &&
    maxParticipants > 0 &&
    (!paid || price > 0);

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
      host: user.username,
      hostId: user._id,
      type: form.type,
      tags,
      image: image || DEFAULT_IMAGES[form.type] || DEFAULT_IMAGES.inne,
      maxParticipants,
      paid,
      price: paid ? price : 0
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
      contact: "",
      type: ""
    });
    setDate(null);
    setTags([]);
    setTagInput("");
    setImage(null);
    setPosition([52.2297, 21.0122]);
    setMaxParticipants(10);
    setPaid(false);
    setPrice(0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: 640,
        maxWidth: 1000,
        margin: "0 auto",
        background: "none"
      }}
    >
      {/* FORMULARZ */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        gap: 16,
        padding: 0,
        height: "100%"
      }}>
        <h2 className="text-2xl font-extrabold text-indigo-800 mb-2 text-left tracking-tight">Nowe wydarzenie</h2>
        <input
          name="title"
          placeholder="Tytuł"
          value={form.title}
          onChange={handleChange}
          required
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50 font-semibold"
        />
        <textarea
          name="description"
          placeholder="Opis"
          value={form.description}
          onChange={handleChange}
          required
          rows={6}
          className="px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50 resize-none"
          style={{ minHeight: 120, maxHeight: 180 }}
        />
        <div className="flex gap-2">
          <input
            name="locationName"
            placeholder="Miejsce (np. Planszówkowo)"
            value={form.locationName}
            onChange={handleChange}
            required
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50"
          />
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            required
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50"
          >
            <option value="">Typ wydarzenia...</option>
            <option value="planszowka">Planszówka</option>
            <option value="komputerowa">Gra komputerowa</option>
            <option value="fizyczna">Gra fizyczna</option>
            <option value="inne">Coś innego</option>
          </select>
        </div>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={pl}>
          <DatePicker
            label="Data wydarzenia"
            value={date}
            onChange={setDate}
            slotProps={{
              textField: {
                required: true,
                fullWidth: true,
                className: "w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50"
              }
            }}
          />
        </LocalizationProvider>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={100}
            value={maxParticipants}
            onChange={e => setMaxParticipants(Number(e.target.value))}
            required
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50"
            placeholder="Liczba miejsc"
          />
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={paid}
              onChange={e => setPaid(e.target.checked)}
              className="accent-indigo-600"
            />
            Płatne
          </label>
          {paid && (
            <input
              type="number"
              min={1}
              step={1}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              required
              className="w-24 px-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 outline-none text-base bg-gray-50"
              placeholder="Kwota PLN"
            />
          )}
        </div>
        <div>
          <div className="flex flex-wrap gap-2 mb-1">
            {tags.map((tag, idx) => (
              <span
                key={tag}
                className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs flex items-center gap-1 font-semibold"
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
              placeholder={tags.length >= MAX_TAGS ? "Limit tagów" : "Dodaj tag"}
              className="px-2 py-1 border rounded-full text-xs focus:border-indigo-400 outline-none bg-white"
              style={{ minWidth: 60, maxWidth: 120 }}
              disabled={tags.length >= MAX_TAGS}
            />
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {SUGGESTED_TAGS.map(tag => (
              <button
                type="button"
                key={tag}
                className={`px-2 py-0.5 rounded-full border text-xs transition-all duration-100 ${
                  tags.includes(tag)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-100 text-gray-600 border-gray-300 hover:bg-indigo-50"
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
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <button
          type="submit"
          className={`bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl transition mt-2 w-full shadow-md ${!isFormValid ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"}`}
          disabled={!isFormValid}
          style={{ letterSpacing: ".02em", fontSize: 16 }}
        >
          Dodaj wydarzenie
        </button>
      </div>
      {/* MAPA */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        height: "100%"
      }}>
        <label className="block font-semibold mb-2 text-xs text-center text-indigo-800">Lokalizacja</label>
        <div
          style={{
            width: "100%",
            height: "calc(100% - 24px)",
            borderRadius: "1rem",
            overflow: "hidden",
            boxShadow: "0 2px 12px 0 rgb(0 0 0 / 0.05)",
            background: "#f1f5f9",
            minHeight: 340
          }}
        >
          <MapContainer
            center={position}
            zoom={13}
            style={{ width: "100%", height: "100%", borderRadius: "1rem", zIndex: 30 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          <span className="bg-white/80 px-2 py-0.5 rounded-full shadow-sm border border-gray-200">
            {position[0].toFixed(5)}, {position[1].toFixed(5)}
          </span>
        </div>
      </div>
    </form>
  );
}
