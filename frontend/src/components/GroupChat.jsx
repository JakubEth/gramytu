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
  const [showGiphy, setShowGiphy] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifSearch, setGifSearch] = useState("");
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

  // Scroll tylko przy nowej wiadomości
  const prevLastMsgId = useRef();
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (
      lastMsg &&
      lastMsg._id !== prevLastMsgId.current &&
      prevLastMsgId.current !== undefined
    ) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    }
    prevLastMsgId.current = lastMsg ? lastMsg._id : undefined;
  }, [messages, eventId]);

  // GIPHY obsługa przez backend proxy
  const fetchGifs = async (query) => {
    if (!query) return setGifs([]);
    try {
      const res = await fetch(
        `${API_URL}/giphy/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) {
        console.error("Giphy proxy API error:", res.status, await res.text());
        setGifs([]);
        return;
      }
      const data = await res.json();
      setGifs(data || []);
    } catch (e) {
      console.error("Giphy fetch error:", e);
      setGifs([]);
    }
  };

  const handleSend = () => {
    if (!text.trim()) return;
    socketRef.current.emit("eventMessage", {
      eventId,
      text,
    });
    setText("");
  };

  const handleSendGif = (gifUrl) => {
    socketRef.current.emit("eventMessage", {
      eventId,
      text: `<GIF>${gifUrl}`,
    });
    setShowGiphy(false);
    setGifSearch("");
    setGifs([]);
  };

  function renderMessage(msg) {
    if (msg.text.startsWith("<GIF>")) {
      const url = msg.text.replace("<GIF>", "");
      return (
        <img
          src={url}
          alt="GIF"
          className="max-w-[200px] max-h-[200px] rounded shadow"
          style={{ display: "block" }}
        />
      );
    }
    return <div>{msg.text}</div>;
  }

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
                {renderMessage(msg)}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {/* Input na dole */}
      <div className="absolute left-0 right-0 bottom-0 bg-white border-t flex gap-2 p-2 z-10">
        <button
          className="bg-indigo-100 text-indigo-700 px-2 rounded font-bold"
          onClick={() => setShowGiphy((v) => !v)}
          title="Wyślij GIF"
        >
          GIF
        </button>
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
      {/* Popup z wyszukiwarką GIFów */}
      {showGiphy && (
        <div className="absolute left-0 right-0 bottom-14 bg-white border-t shadow-lg p-4 z-20">
          <div className="flex gap-2 mb-2">
            <input
              value={gifSearch}
              onChange={e => {
                setGifSearch(e.target.value);
                fetchGifs(e.target.value);
              }}
              className="border rounded px-2 py-1 flex-1 text-sm"
              placeholder="Szukaj GIFa..."
              autoFocus
            />
            <button
              className="text-red-600 font-bold px-2"
              onClick={() => setShowGiphy(false)}
            >
              X
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {gifs.map(gif => (
              <img
                key={gif.id}
                src={gif.images.fixed_height_small.url}
                alt={gif.title}
                className="w-24 h-24 object-cover rounded cursor-pointer border hover:border-indigo-500"
                onClick={() => handleSendGif(gif.images.fixed_height.url)}
              />
            ))}
            {gifs.length === 0 && <div className="text-gray-400">Brak wyników</div>}
          </div>
        </div>
      )}
    </div>
  );
}
