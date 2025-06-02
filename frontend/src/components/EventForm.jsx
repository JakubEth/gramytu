import { useState, useRef, useEffect } from "react";
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
  const [imagePreview, setImagePreview] = useState(null);
  const containerRef = useRef(null);
  const [mapSize, setMapSize] = useState(420);

  // NOWE STANY:
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [paid, setPaid] = useState(false);
  const [price, setPrice] = useState(0);

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

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        setImage(ev.target.result);
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    if (!image && form.type) {
      setImagePreview(DEFAULT_IMAGES[form.type] || DEFAULT_IMAGES.inne);
    }
  }, [form.type, image]);

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
    setImagePreview(null);
    setPosition([52.2297, 21.0122]);
    setMaxParticipants(10);
    setPaid(false);
    setPrice(0);
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
              <div className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-indigo-700 font-semibold select-none cursor-not-allowed">
                {user?.username || "Nieznany"}
              </div>
            </div>
          </div>
          <div className="mb-2">
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700">Typ wydarzenia</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
            >
              <option value="">Wybierz typ...</option>
              <option value="planszowka">Planszówka</option>
              <option value="komputerowa">Gra komputerowa</option>
              <option value="fizyczna">Gra fizyczna</option>
              <option value="inne">Coś innego</option>
            </select>
          </div>
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700"></label>
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
          {/* NOWE POLE: liczba miejsc */}
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700">Liczba miejsc</label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxParticipants}
              onChange={e => setMaxParticipants(Number(e.target.value))}
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
            />
          </div>
          {/* NOWE POLE: płatność */}
          <div className="mb-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="paid"
              checked={paid}
              onChange={e => setPaid(e.target.checked)}
            />
            <label htmlFor="paid" className="text-sm">Uczestnictwo płatne</label>
          </div>
          {paid && (
            <div className="mb-2">
              <label className="block mb-1 text-sm font-semibold text-gray-700">Kwota do zapłaty (PLN)</label>
              <input
                type="number"
                min={1}
                step={1}
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition text-base"
              />
            </div>
          )}
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
          <div className="mb-2">
            <label className="block mb-1 text-sm font-semibold text-gray-700">Zdjęcie wydarzenia</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
            <div className="mt-2">
              <img
                src={imagePreview || DEFAULT_IMAGES[form.type] || DEFAULT_IMAGES.inne}
                alt="Podgląd zdjęcia"
                className="rounded-lg shadow w-full max-w-xs object-cover"
                style={{ maxHeight: 180 }}
              />
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Jeśli nie dodasz własnego zdjęcia, zostanie wybrane domyślne dla kategorii.
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
      {/* PRAWA KOLUMNA: MAPA */}
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
