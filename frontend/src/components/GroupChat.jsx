import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import "./GroupChat.css";

const SOCKET_URL = "https://gramytu.onrender.com";
const API_URL = "https://gramytu.onrender.com";

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

  // Przewijaj tylko przy NOWEJ wiadomości (nie po wejściu w czat)
  const prevLastMsgId = useRef();

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg &&
      lastMsg._id !== prevLastMsgId.current &&
      prevLastMsgId.current !== undefined // nie przewijaj przy pierwszym renderze
    ) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
    prevLastMsgId.current = lastMsg ? lastMsg._id : undefined;
  }, [messages, eventId]);

  const handleSend = () => {
    if (!text.trim()) return;
    socketRef.current.emit("eventMessage", {
      eventId,
      text,
    });
    setText("");
  };

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
    <div className="flex flex-col h-full relative">
      <div className="font-semibold mb-2">Czat grupowy wydarzenia</div>
      {/* Kontener na wiadomości, z padding-bottom na input */}
      <div
        className="chatbox-messages overflow-y-auto flex-1 pr-1"
        style={{ overflowAnchor: "none", paddingBottom: 64 }}
      >
        {(!messages || messages.length === 0) && (
          <div className="text-gray-400 italic">Brak wiadomości w czacie.</div>
        )}
        {Array.isArray(messages) && messages.map((msg, i) => {
          const isMine = user && (msg.userId === user._id || msg.userId?._id === user._id);
          return (
            <div
              key={msg._id || i}
              className={`chatbox-row ${isMine ? "me" : "other"}`}
              onContextMenu={isMine ? (e) => handleRightClick(e, msg) : undefined}
              title={isMine ? "Prawy klik by usunąć" : undefined}
              style={{ userSelect: "text" }}
            >
              <div className={`chatbox-bubble${isMine ? " me" : ""}`}>
                <div className="chatbox-meta">
                  <span>{msg.username}</span>
                  <span>{formatDate(msg.createdAt)}</span>
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input przyklejony na samym dole */}
      <div className="absolute left-0 right-0 bottom-0 bg-white border-t flex gap-2 p-2 z-10">
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
