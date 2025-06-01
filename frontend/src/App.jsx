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
      <MapView events={events} onAddEvent={handleAdd} />
      <Landing2025 />
      <Footer />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg relative">
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
    </div>
  );
}
