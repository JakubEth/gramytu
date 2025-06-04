import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState({ events: [], users: [], places: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/search?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">
        Wyniki wyszukiwania dla: <span className="text-indigo-600">{query}</span>
      </h2>
      {loading && <div>Ładowanie...</div>}

      <section className="mb-8">
        <div className="font-bold text-lg mb-2">Wydarzenia</div>
        {results.events.length === 0 && <div className="text-gray-500">Brak wydarzeń.</div>}
        <ul className="space-y-3">
          {results.events.map(ev => (
            <li key={ev._id} className="bg-white rounded-xl shadow p-4 border border-indigo-50">
              <Link to={`/events/${ev._id}`} className="font-bold text-indigo-700 text-lg hover:underline">{ev.title}</Link>
              <div className="text-sm text-gray-500 mb-1">{ev.date?.slice(0,10)} • {ev.location?.name}</div>
              <div className="text-gray-700">{ev.description}</div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <div className="font-bold text-lg mb-2">Użytkownicy</div>
        {results.users.length === 0 && <div className="text-gray-500">Brak użytkowników.</div>}
        <ul className="space-y-3">
          {results.users.map(u => (
            <li key={u._id} className="flex items-center gap-3 bg-white rounded-xl shadow p-4 border border-indigo-50">
              <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover" />
              <Link to={`/user/${u._id}`} className="font-bold text-indigo-700 hover:underline">{u.username}</Link>
              <span className="text-gray-500 text-sm">{u.bio}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="font-bold text-lg mb-2">Miejsca</div>
        {results.places.length === 0 && <div className="text-gray-500">Brak miejsc.</div>}
        <ul className="space-y-3">
          {results.places.map((p, idx) => (
            <li key={p.name + idx} className="bg-white rounded-xl shadow p-4 border border-indigo-50">
              <span className="font-bold text-indigo-700">{p.name}</span>
              {p.lat && p.lng && (
                <span className="ml-2 text-gray-500 text-xs">
                  [{p.lat.toFixed(4)}, {p.lng.toFixed(4)}]
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
