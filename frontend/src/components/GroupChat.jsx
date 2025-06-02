import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://gramytu.onrender.com";
const API_URL = "https://gramytu.onrender.com";

export default function GroupChat({ eventId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Funkcja do pobrania historii czatu
  const fetchHistory = () => {
    fetch(`${API_URL}/events/${eventId}/chat`)
      .then(res => res.json())
      .then(data => setMessages(data || []));
  };

  // Pobierz historię przy wejściu na czat
  useEffect(() => {
    fetchHistory();
  }, [eventId]);

  // Połącz z socket.io i nasłuchuj nowych wiadomości
  useEffect(() => {
    socketRef.current = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current.emit("joinEventChat", {
      eventId,
      token: localStorage.getItem("token"),
    });
    socketRef.current.on("eventMessage", () => {
      // Po każdej nowej wiadomości odśwież całą historię z bazy!
      fetchHistory();
    });
    return () => {
      socketRef.current.disconnect();
    };
    // eslint-disable-next-line
  }, [eventId]);

  // Auto-scroll na dół po każdej nowej wiadomości
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
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
        {messages.map((msg, i) => (
          <div key={i} className="mb-1">
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
