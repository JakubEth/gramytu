import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://gramytu.onrender.com";
const API_URL = "https://gramytu.onrender.com";

export default function GroupChat({ eventId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // DEBUG: sprawdź eventId
  useEffect(() => {
    console.log("GroupChat: eventId =", eventId);
  }, [eventId]);

  // Pobierz historię czatu PRZY KAŻDYM WEJŚCIU na czat
  useEffect(() => {
    if (!eventId) {
      console.warn("Brak eventId, nie pobieram historii czatu");
      return;
    }
    console.log("fetchHistory: eventId =", eventId);
    fetch(`${API_URL}/events/${eventId}/chat`)
      .then(res => {
        if (!res.ok) throw new Error("Błąd HTTP: " + res.status);
        return res.json();
      })
      .then(data => {
        console.log("HISTORIA CZATU:", data);
        setMessages(data || []);
      })
      .catch(err => {
        console.error("Błąd pobierania historii czatu:", err);
      });
  }, [eventId]);

  // Połącz z socket.io i nasłuchuj nowych wiadomości
  useEffect(() => {
    if (!eventId) {
      console.warn("Brak eventId, nie łączę z socket.io");
      return;
    }
    socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socketRef.current.on("connect", () => {
      console.log("Socket.io connected:", socketRef.current.id);
    });
    socketRef.current.on("connect_error", (err) => {
      console.error("Socket.IO connect_error:", err.message, err);
    });
    socketRef.current.on("disconnect", (reason) => {
      console.warn("Socket.IO disconnected:", reason);
    });

    socketRef.current.emit("joinEventChat", {
      eventId,
      token: localStorage.getItem("token"),
    });

    socketRef.current.on("eventMessage", (msg) => {
      console.log("ODEBRANO eventMessage z socket.io:", msg);
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [eventId]);

  // Auto-scroll na dół po każdej nowej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log("Aktualne wiadomości:", messages);
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    if (!eventId) {
      alert("Brak eventId, nie można wysłać wiadomości!");
      return;
    }
    socketRef.current.emit("eventMessage", {
      eventId,
      text,
    });
    setText("");
  };

  return (
    <div className="flex flex-col h-96">
      <div className="font-semibold mb-2">Czat grupowy wydarzenia</div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2">
        {messages.length === 0 && (
          <div className="text-gray-400 italic">Brak wiadomości w czacie.</div>
        )}
        {messages.map((msg, i) => (
          <div key={msg._id || i} className="mb-1">
            <b>{msg.username}:</b> {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="border rounded px-2 py-1 flex-1 text-sm"
          placeholder="Napisz wiadomość..."
          onKeyDown={e => e.key === "Enter" ? handleSend() : null}
        />
        <button
          className="bg-indigo-600 text-white px-3 rounded"
          onClick={handleSend}
        >
          Wyślij
        </button>
      </div>
    </div>
  );
}
