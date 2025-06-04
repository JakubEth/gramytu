import React, { useEffect, useState } from "react";
import LandingMap from "./LandingMap";
import "leaflet/dist/leaflet.css";

const API_URL = "https://gramytu.onrender.com";

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

export default function EventsList({ user }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' or 'mine'

  useEffect(() => {
    fetch(`${API_URL}/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      });
  }, []);

  const sidebarWidth = 320;
  const HEADER_HEIGHT = 120; // px
  const BUTTON_SIZE = 48;

  // Debug: pokaż user i hostId w konsoli
  useEffect(() => {
    if (user) {
      console.log("user._id:", user._id);
    }
    if (events.length) {
      console.log(
        "hostId types:",
        events.map(ev => ev.hostId)
      );
    }
  }, [user, events]);

  // Najbezpieczniejsze filtrowanie własnych wydarzeń
  const myEvents = user && user._id
    ? events.filter(ev => {
        const host = ev.hostId;
        if (!host || (typeof host === "object" && Object.keys(host).length === 0)) {
          return false;
        }
        const userId = String(user._id);
        if (typeof host === "object" && host._id) {
          return String(host._id) === userId;
        }
        return String(host) === userId;
      })
    : [];

  const displayedEvents = activeTab === "mine" ? myEvents : events;

  // Pozycja i styl przycisku
  const buttonLeft = (sidebarOpen ? sidebarWidth : 0) - BUTTON_SIZE / 2 + 23;
  const buttonRadius = "0 24px 24px 0";
  const buttonIcon = sidebarOpen ? "←" : "→";

  return (
    <div
      style={{
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        width: "100vw",
        background: "#f1f5f9",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "row"
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? sidebarWidth : 0,
          minWidth: sidebarOpen ? 240 : 0,
          maxWidth: sidebarOpen ? 400 : 0,
          background: "#fff",
          borderRight: sidebarOpen ? "1px solid #e5e7eb" : "none",
          overflowY: "auto",
          height: "100%",
          boxShadow: sidebarOpen ? "2px 0 8px #0001" : "none",
          transition: "width 0.3s cubic-bezier(.4,2,.6,1), min-width 0.3s cubic-bezier(.4,2,.6,1), max-width 0.3s cubic-bezier(.4,2,.6,1)",
          position: "relative"
        }}
      >
        {sidebarOpen && (
          <>
            {/* Zakładki */}
            <div style={{ display: "flex", padding: 16, borderBottom: "1px solid #e5e7eb" }}>
              <button
                onClick={() => setActiveTab("all")}
                style={{
                  flex: 1,
                  fontWeight: activeTab === "all" ? "700" : "400",
                  fontSize: "1.1rem",
                  borderBottom: activeTab === "all" ? "3px solid #2563eb" : "none",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: activeTab === "all" ? "#2563eb" : "#555"
                }}
              >
                Wydarzenia
              </button>
              <button
                onClick={() => user && user._id && setActiveTab("mine")}
                style={{
                  flex: 1,
                  fontWeight: activeTab === "mine" ? "700" : "400",
                  fontSize: "1.1rem",
                  borderBottom: activeTab === "mine" ? "3px solid #2563eb" : "none",
                  background: "none",
                  border: "none",
                  cursor: user && user._id ? "pointer" : "not-allowed",
                  color: activeTab === "mine" ? "#2563eb" : "#555",
                  opacity: user && user._id ? 1 : 0.5
                }}
                title={!user || !user._id ? "Zaloguj się, by zobaczyć swoje wydarzenia" : undefined}
              >
                Moje Wydarzenia
              </button>
            </div>
            {loading ? (
              <div className="text-gray-400 text-center p-4">Ładowanie...</div>
            ) : (
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {displayedEvents.length === 0 && (
                  <li className="text-gray-400 text-center p-4">Brak wydarzeń</li>
                )}
                {displayedEvents.map(ev => (
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
                      <div style={{ fontWeight: 600, color: "#3730a3", fontSize: 16 }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>
                        Kategoria: <span style={{ color: "#2563eb" }}>{ev.type}</span>
                      </div>
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
                      <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>
                        Uczestnicy: {ev.participants?.length || 0}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      {/* Półkolisty przycisk na granicy sidebar/mapa */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          left: buttonLeft,
          bottom: 32,
          zIndex: 2000,
          width: BUTTON_SIZE,
          height: BUTTON_SIZE,
          borderRadius: buttonRadius,
          background: "#fff",
          border: "2px solid #e0e7ff",
          borderLeft: "none",
          color: "#2563eb",
          fontSize: 28,
          fontWeight: 700,
          boxShadow: "0 2px 8px #0002",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "left 0.3s cubic-bezier(.4,2,.6,1)"
        }}
        title={sidebarOpen ? "Schowaj listę wydarzeń" : "Pokaż listę wydarzeń"}
      >
        {buttonIcon}
      </button>

      {/* Mapa */}
      <div style={{
        flex: 1,
        height: "100%",
        transition: "margin-left 0.3s cubic-bezier(.4,2,.6,1)"
      }}>
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
