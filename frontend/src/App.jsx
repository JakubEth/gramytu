import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import EventForm from "./components/EventForm";
import Landing2025 from "./components/Landing2025";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("https://gramytu.onrender.com/events")
      .then(res => res.json())
      .then(setEvents);
  }, []);

  const handleAdd = event => setEvents(e => [...e, event]);

  return (
    <div>
      <Header />
      <MapView events={events} onAddEvent={handleAdd} />
      <Landing2025 />
      <Footer />
    </div>
  );
}
