import { useEffect, useState } from "react";

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");

  // Pobierz eventy z API przy starcie
  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);
  }, []);

  // Filtrowanie
  useEffect(() => {
    let data = [...events];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(ev =>
        ev.title.toLowerCase().includes(s) ||
        ev.description?.toLowerCase().includes(s) ||
        ev.location?.name?.toLowerCase().includes(s) ||
        ev.host?.toLowerCase().includes(s)
      );
    }
    if (type) {
      data = data.filter(ev => ev.type === type);
    }
    if (date) {
      data = data.filter(ev => ev.date?.slice(0, 10) === date);
    }
    setFiltered(data);
  }, [events, search, type, date]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold text-indigo-700 mb-4">Przeglądaj wydarzenia</h1>
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          className="px-4 py-2 rounded-lg border border-gray-300 outline-none"
          placeholder="Szukaj po tytule, miejscu, opisie, organizatorze..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="px-4 py-2 rounded-lg border border-gray-300 outline-none"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <option value="">Wszystkie typy</option>
          <option value="planszowka">Planszówka</option>
          <option value="komputerowa">Gra komputerowa</option>
          <option value="fizyczna">Gra fizyczna</option>
          <option value="inne">Coś innego</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 rounded-lg border border-gray-300 outline-none"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
        <button
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
          onClick={() => { setSearch(""); setType(""); setDate(""); }}
        >
          Wyczyść filtry
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {filtered.length === 0 && (
          <div className="text-gray-500 text-center py-12">Brak wydarzeń spełniających kryteria.</div>
        )}
        {filtered.map(ev => (
          <div
            key={ev._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-2 border-l-4 border-indigo-200"
          >
            <div className="flex-1">
              <div className="font-bold text-lg text-indigo-700">{ev.title}</div>
              <div className="text-sm text-gray-500 mb-1">
                {ev.date?.slice(0, 10)} • {ev.location?.name}
              </div>
              <div className="text-sm text-gray-700 mb-1">{ev.description}</div>
              <div className="text-xs text-gray-400">
                Organizator: <b>{ev.host}</b>
              </div>
              {ev.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {ev.tags.map(tag => (
                    <span key={tag} className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 min-w-[120px]">
              <a
                href={`mailto:${ev.contact}`}
                className="text-indigo-600 hover:underline text-sm"
              >
                {ev.contact}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
