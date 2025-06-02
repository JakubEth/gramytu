import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://gramytu.onrender.com";
const API_URL = "https://gramytu.onrender.com";

// Funkcja do formatowania daty
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return (
    d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" }) +
    ", " +
    d.toLocaleDateString("pl-PL")
  );
}

export default function GroupChat({ eventId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Pobierz historię czatu PRZY KAŻDYM WEJŚCIU na czat
  useEffect(() => {
    if (!eventId) {
      setMessages([]);
      return;
    }
    fetch(`${API_URL}/events/${eventId}/chat`)
      .then(res => {
        if (!res.ok) throw new Error("Błąd HTTP: " + res.status);
        return res.json();
      })
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        setMessages([]);
      });
  }, [eventId]);

  // Połącz z socket.io i nasłuchuj nowych wiadomości
  useEffect(() => {
    if (!eventId) return;
    socketRef.current = io(SOCKET_URL, { 
      transports: ["websocket", "polling"], 
      withCredentials: true, 
      secure: true 
    });

    socketRef.current.emit("joinEventChat", {
      eventId,
      token: localStorage.getItem("token"),
    });

    socketRef.current.on("eventMessage", (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socketRef.current.on("deleteMessage", (msgId) => {
      setMessages(prev => prev.filter(m => m._id !== msgId));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [eventId]);

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

  // Usuwanie wiadomości
  const handleDelete = async (msgId) => {
    try {
      const res = await fetch(
        `${API_URL}/events/${eventId}/chat/${msgId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== msgId));
        // Emituj do innych
        socketRef.current.emit("deleteMessage", msgId);
      }
    } catch (e) {
      alert("Nie udało się usunąć wiadomości");
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="font-semibold mb-2">Czat grupowy wydarzenia</div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2">
        {(!messages || messages.length === 0) && (
          <div className="text-gray-400 italic">Brak wiadomości w czacie.</div>
        )}
        {Array.isArray(messages) && messages.map((msg, i) => (
          <div key={msg._id || i} className="mb-1 flex items-center group">
            <div className="flex-1">
              <b>{msg.username}:</b> {msg.text}
              <span className="ml-2 text-xs text-gray-400">{formatDate(msg.createdAt)}</span>
            </div>
            {user && msg.userId === user._id && (
              <button
                onClick={() => handleDelete(msg._id)}
                className="ml-2 text-xs text-red-500 opacity-70 group-hover:opacity-100 hover:underline"
                title="Usuń wiadomość"
              >
                Usuń
              </button>
            )}
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
