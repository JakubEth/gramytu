import React, { useEffect, useState } from "react";
import LandingMap from "./LandingMap";
import "leaflet/dist/leaflet.css";

const API_URL = "https://gramytu.onrender.com";

// Funkcja do generowania domyślnego awatara (identycznie jak w UserProfilePageView)
const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

export default function EventsList({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        height: "calc(100vh - 120px)",
        width: "100vw",
        display: "flex",
        flexDirection: "row",
        background: "#f1f5f9",
        overflow: "hidden"
      }}
    >
      {/* Lewa kolumna z listą eventów */}
      <div
        style={{
          width: "min(320px, 16.66vw)",
          minWidth: 240,
          maxWidth: 400,
          background: "#fff",
          borderRight: "1px solid #e5e7eb",
          overflowY: "auto",
          height: "100%",
          boxShadow: "2px 0 8px #0001",
          zIndex: 2
        }}
      >
        <div style={{ padding: "16px", fontWeight: 700, fontSize: "1.1rem", borderBottom: "1px solid #e5e7eb" }}>
          Wydarzenia
        </div>
        {loading ? (
          <div className="text-gray-400 text-center p-4">Ładowanie...</div>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {events.length === 0 && (
              <li className="text-gray-400 text-center p-4">Brak wydarzeń</li>
            )}
            {events.map(ev => (
              <li
                key={ev._id}
                style={{
                  borderBottom: "1px solid #f1f5f9",
                  padding: "16px 12px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "background 0.2s"
                }}
                className="hover:bg-indigo-50"
              >
                {/* Zdjęcie wydarzenia */}
                <img
                  src={ev.image}
                  alt={ev.title}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 8,
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "1px solid #e5e7eb",
                    background: "#f1f5f9"
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Tytuł i kategoria */}
                  <div style={{ fontWeight: 600, color: "#3730a3", fontSize: 16 }}>
                    {ev.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                    Kategoria: <span style={{ color: "#2563eb" }}>{ev.type}</span>
                  </div>
                  {/* Organizator */}
                  <div style={{ display: "flex", alignItems: "center", marginTop: 4, fontSize: 13, color: "#555" }}>
                  <img
  src={ev.hostId?.avatar || defaultAvatar(ev.hostId?.username || ev.host)}
  alt={ev.hostId?.username || ev.host}
  style={{
    width: 22,
    height: 22,
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e0e7ff",
    marginRight: 6
  }}
/>
{ev.hostId?.username || ev.host}
                  </div>
                  {/* Liczba uczestników */}
                  <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                    Uczestnicy: {ev.participants?.length || 0}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Prawa kolumna z mapą */}
      <div style={{ flex: 1, height: "100%" }}>
        <LandingMap
          events={events}
          user={user}
          setEvents={setEvents}
          height="100%"
        />
      </div>
    </div>
  );
}
