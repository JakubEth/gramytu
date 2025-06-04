import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

// Backend API
const API_URL = "https://gramytu.onrender.com";

// Chłodne pastelowe kolory
const cold = {
  event: "#e0edfa",
  user: "#e0f2fe",
  place: "#ede9fe",
  border: "#dbeafe",
  shadow: "0 8px 32px 0 #64748b22",
  accent: "#2563eb",
  accent2: "#6366f1",
  bg: "linear-gradient(135deg, #e0e7ef 0%, #f1f5f9 60%, #e0e7ff 100%)"
};

function SectionHeader({ icon, label, count }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-2xl">{icon}</span>
      <span className="font-bold text-xl tracking-tight text-slate-800">{label}</span>
      <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">{count}</span>
    </div>
  );
}

function EmptyState({ icon, label, cta, onClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-80 animate-fade-in">
      <span className="text-5xl mb-2">{icon}</span>
      <div className="text-lg font-semibold text-gray-400 mb-2">{label}</div>
      {cta && (
        <button
          className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition"
          onClick={onClick}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query") || "";
  const [results, setResults] = useState({ events: [], users: [], places: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(setResults)
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start"
      style={{
        background: cold.bg,
        paddingBottom: 40,
        minHeight: "100vh"
      }}
    >
      <div className="w-full max-w-6xl px-4 pt-12 flex flex-col items-center">
        <h2
          className="text-4xl font-black mb-10 tracking-tight text-center drop-shadow"
          style={{ color: cold.accent2, letterSpacing: "-0.01em" }}
        >
          Wyniki wyszukiwania dla:{" "}
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-xl">{query}</span>
        </h2>
        <div
          className="w-full grid grid-cols-1 md:grid-cols-3 gap-10"
          style={{
            minHeight: "65vh",
            alignItems: "stretch"
          }}
        >
          {/* Wydarzenia */}
          <section
            className="flex flex-col bg-white/90 rounded-3xl shadow-lg border"
            style={{
              borderColor: cold.border,
              minHeight: 480,
              padding: 36,
              background: cold.event,
              boxShadow: cold.shadow,
              animation: "fadeIn 0.8s"
            }}
          >
            <SectionHeader icon="🎲" label="Wydarzenia" count={results.events.length} />
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-lg animate-pulse">Ładowanie...</div>
            ) : results.events.length === 0 ? (
              <EmptyState
                icon="🕵️‍♂️"
                label="Brak wydarzeń."
                cta="Dodaj wydarzenie"
                onClick={() => navigate("/events/add")}
              />
            ) : (
              <ul className="flex-1 flex flex-col gap-4">
                {results.events.map(ev => (
                  <li
                    key={ev._id}
                    className="bg-white rounded-xl shadow border border-blue-50 flex flex-col gap-1 px-4 py-3 hover:scale-[1.025] hover:shadow-xl transition cursor-pointer animate-fade-in"
                    style={{ borderColor: cold.border }}
                  >
                    <Link to={`/events/${ev._id}`} className="flex items-center gap-2 group">
                      <span className="font-bold text-blue-700 text-lg group-hover:underline">{ev.title}</span>
                      {ev.type && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">{ev.type}</span>
                      )}
                    </Link>
                    <div className="flex items-center text-xs text-gray-500 gap-2">
                      <span>{ev.date?.slice(0,10)}</span>
                      {ev.location?.name && <span>• {ev.location.name}</span>}
                    </div>
                    <div className="text-gray-700 text-sm line-clamp-2">{ev.description}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={ev.hostId?.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(ev.hostId?.username || "U")}
                        alt={ev.hostId?.username}
                        className="w-7 h-7 rounded-full border border-blue-100 object-cover"
                      />
                      <span className="text-xs text-gray-500">{ev.hostId?.username}</span>
                      <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                        👍 {ev.likes?.length || 0}
                        <span className="ml-2">👥 {ev.participants?.length || 0}</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Użytkownicy */}
          <section
            className="flex flex-col bg-white/90 rounded-3xl shadow-lg border"
            style={{
              borderColor: cold.border,
              minHeight: 480,
              padding: 36,
              background: cold.user,
              boxShadow: cold.shadow,
              animation: "fadeIn 1s"
            }}
          >
            <SectionHeader icon="🧑‍💻" label="Użytkownicy" count={results.users.length} />
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-lg animate-pulse">Ładowanie...</div>
            ) : results.users.length === 0 ? (
              <EmptyState
                icon="🤷‍♂️"
                label="Brak użytkowników."
                cta="Zarejestruj się"
                onClick={() => navigate("/register")}
              />
            ) : (
              <ul className="flex-1 flex flex-col gap-4">
                {results.users.map(u => (
                  <li
                    key={u._id}
                    className="flex items-center gap-3 bg-white rounded-xl shadow border border-blue-50 px-4 py-3 hover:scale-[1.025] hover:shadow-xl transition animate-fade-in"
                    style={{ borderColor: cold.border }}
                  >
                    <img src={u.avatar} alt={u.username} className="w-10 h-10 rounded-full object-cover border border-blue-100" />
                    <div className="flex-1">
                      <Link to={`/user/${u._id}`} className="font-bold text-blue-700 hover:underline text-base">{u.username}</Link>
                      <div className="text-gray-500 text-xs">{u.bio}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Miejsca */}
          <section
            className="flex flex-col bg-white/90 rounded-3xl shadow-lg border"
            style={{
              borderColor: cold.border,
              minHeight: 480,
              padding: 36,
              background: cold.place,
              boxShadow: cold.shadow,
              animation: "fadeIn 1.2s"
            }}
          >
            <SectionHeader icon="📍" label="Miejsca" count={results.places.length} />
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-lg animate-pulse">Ładowanie...</div>
            ) : results.places.length === 0 ? (
              <EmptyState
                icon="🗺️"
                label="Brak miejsc."
                cta="Przeglądaj mapę"
                onClick={() => navigate("/events")}
              />
            ) : (
              <ul className="flex-1 flex flex-col gap-4">
                {results.places.map((p, idx) => (
                  <li
                    key={p.name + idx}
                    className="bg-white rounded-xl shadow border border-blue-50 px-4 py-3 flex flex-col hover:scale-[1.025] hover:shadow-xl transition animate-fade-in"
                    style={{ borderColor: cold.border }}
                  >
                    <span className="font-bold text-blue-700 text-base">{p.name}</span>
                    {p.lat && p.lng && (
                      <span className="text-xs text-gray-500 mt-1">
                        [{p.lat.toFixed(4)}, {p.lng.toFixed(4)}]
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in { animation: fadeIn 0.6s; }
      `}</style>
    </div>
  );
}
