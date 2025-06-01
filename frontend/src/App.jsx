import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import EventForm from "./components/EventForm";
import Landing2025 from "./components/Landing2025";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);
  }, []);

  const handleAdd = event => setEvents(e => [...e, event]);

  return (
    <div>
      <Header onOpenAddEvent={() => setShowModal(true)} />
      <Landing2025 events={events} />
      <Footer />

      {/* MODAL Z FORMULARZEM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-full"
            style={{
              maxWidth: "1000px",
              width: "90vw",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative"
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              aria-label="Zamknij"
            >
              ×
            </button>
            <EventForm
              onAdd={event => {
                handleAdd(event);
                setShowModal(false);
              }}
            />
          </div>
        </div>
      )}

      {/* GLOBALNY PLUS */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-8 right-8 z-[100] bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-4xl transition"
        aria-label="Dodaj wydarzenie"
      >
        +
      </button>
    </div>
  );
}
