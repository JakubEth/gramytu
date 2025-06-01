import React, { useState } from 'react';
function EventForm({ onNewEvent }) {
  const [form, setForm] = useState({
    title: '', description: '', date: '', locationName: '', lat: '', lng: '', host: ''
  });
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:4000/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        date: form.date,
        location: { name: form.locationName, lat: Number(form.lat), lng: Number(form.lng) },
        host: form.host
      })
    });
    const data = await res.json();
    onNewEvent(data);
    setForm({ title: '', description: '', date: '', locationName: '', lat: '', lng: '', host: '' });
  };
  return (
    <form onSubmit={handleSubmit} style={{ margin: 16 }}>
      <input name="title" placeholder="Tytuł" value={form.title} onChange={handleChange} required />
      <input name="description" placeholder="Opis" value={form.description} onChange={handleChange} required />
      <input name="date" placeholder="Data i godzina" value={form.date} onChange={handleChange} required />
      <input name="locationName" placeholder="Miejsce" value={form.locationName} onChange={handleChange} required />
      <input name="lat" placeholder="Lat" value={form.lat} onChange={handleChange} required />
      <input name="lng" placeholder="Lng" value={form.lng} onChange={handleChange} required />
      <input name="host" placeholder="Host" value={form.host} onChange={handleChange} required />
      <button type="submit">Dodaj wydarzenie</button>
    </form>
  );
}
export default EventForm;
