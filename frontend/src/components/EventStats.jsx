import { useMemo } from "react";

export default function EventStats({ events }) {
  const total = events.length;
  const uniquePlaces = useMemo(
    () => new Set(events.map(e => e.location?.name?.toLowerCase() || "")).size,
    [events]
  );
  const uniqueHosts = useMemo(
    () => new Set(events.map(e => e.host?.toLowerCase() || "")).size,
    [events]
  );
  const allTags = events.flatMap(e => e.tags || []);
  const uniqueTags = [...new Set(allTags.map(t => t.toLowerCase()))];
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const mostPopularTag = uniqueTags.sort((a, b) => (tagCounts[b] || 0) - (tagCounts[a] || 0))[0];
  const now = new Date();
  const upcoming = events
    .map(e => ({ ...e, dateObj: new Date(e.date) }))
    .filter(e => e.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0];

  return (
    <div className="w-full max-w-md mx-auto grid grid-cols-3 gap-3 mt-3 mb-2">
      <Stat label="Wydarzenia" value={total} />
      <Stat label="Miejscówki" value={uniquePlaces} />
      <Stat label="Organizatorzy" value={uniqueHosts} />
      <Stat label="Tagi" value={uniqueTags.length} />
      <Stat label="Popularny tag" value={mostPopularTag || "-"} />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70px] min-w-[90px] bg-white/90 border border-indigo-100 rounded-lg px-2 py-3">
      <span className="text-lg font-semibold text-indigo-700 leading-tight">{value}</span>
      <span className="text-xs text-gray-400 mt-1 text-center leading-tight">{label}</span>
    </div>
  );
}
