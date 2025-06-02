import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://gramytu.onrender.com";
const API_URL = "https://gramytu.onrender.com";

// Formatowanie daty
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

  // Pobierz historię czatu przy każdym wejściu na czat!
  useEffect(() => {
    if (!eventId) {
      setMessages([]);
      return;
    }
    fetch(`${API_URL}/events/${eventId}/chat`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => setMessages([]));
  }, [eventId]);

  // Połącz z socket.io i nasłuchuj nowych wiadomości
  useEffect(() => {
    if (!eventId) return;
    socketRef.current = io(SOCKET_URL, { transports: ["websocket", "polling"] });

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

  // Usuwanie wiadomości po prawym kliknięciu na własny dymek
  const handleRightClick = (e, msg) => {
    e.preventDefault();
    if (window.confirm("Usunąć tę wiadomość?")) {
      fetch(`${API_URL}/events/${eventId}/chat/${msg._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(res => {
        if (res.ok) {
          setMessages(prev => prev.filter(m => m._id !== msg._id));
          socketRef.current.emit("deleteMessage", msg._id);
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-96">
      <div className="font-semibold mb-2">Czat grupowy wydarzenia</div>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2 mb-2">
        {(!messages || messages.length === 0) && (
          <div className="text-gray-400 italic">Brak wiadomości w czacie.</div>
        )}
        {Array.isArray(messages) && messages.map((msg, i) => {
          const isMine = user && (msg.userId === user._id || msg.userId?._id === user._id);
          return (
            <div
              key={msg._id || i}
              className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
              onContextMenu={isMine ? (e) => handleRightClick(e, msg) : undefined}
              title={isMine ? "Prawy klik by usunąć" : undefined}
              style={{ userSelect: "text" }}
            >
              <div
                className={`max-w-[70%] rounded-xl px-3 py-2 shadow 
                  ${isMine
                    ? "bg-indigo-100 text-indigo-900 rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border"}
                  relative group`}
                style={{
                  cursor: isMine ? "context-menu" : "default",
                  border: isMine ? "none" : "1px solid #e5e7eb"
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs text-gray-600">{msg.username}</span>
                  <span className="text-[10px] text-gray-400">{formatDate(msg.createdAt)}</span>
                </div>
                <div className="break-words">{msg.text}</div>
                {isMine && (
                  <span className="hidden group-hover:inline absolute right-2 bottom-1 text-xs text-red-400">
                    (usuń)
                  </span>
                )}
              </div>
            </div>
          );
        })}
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
