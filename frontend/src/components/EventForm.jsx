import { useState } from "react";

export default function EventForm({ onAdd }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    locationName: "",
    lat: "",
    lng: "",
    host: ""
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const event = {
      title: form.title,
      description: form.description,
      date: form.date,
      location: {
        name: form.locationName,
        lat: Number(form.lat),
        lng: Number(form.lng)
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
      lat: "",
      lng: "",
      host: ""
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-lg grid grid-cols-1 gap-4 mb-2">
      <h2 className="text-xl font-bold text-indigo-700">Dodaj wydarzenie</h2>
      <input name="title" placeholder="Tytuł" value={form.title} onChange={handleChange} required className="input" />
      <input name="description" placeholder="Opis" value={form.description} onChange={handleChange} required className="input" />
      <input name="date" placeholder="Data i godzina" value={form.date} onChange={handleChange} required className="input" />
      <input name="locationName" placeholder="Miejsce (np. Planszówkowo)" value={form.locationName} onChange={handleChange} required className="input" />
      <div className="flex gap-2">
        <input name="lat" placeholder="Szerokość (lat)" value={form.lat} onChange={handleChange} required className="input flex-1" />
        <input name="lng" placeholder="Długość (lng)" value={form.lng} onChange={handleChange} required className="input flex-1" />
      </div>
      <input name="host" placeholder="Organizator" value={form.host} onChange={handleChange} required className="input" />
      <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-4 rounded hover:bg-indigo-700 transition">Dodaj</button>
    </form>
  );
}
