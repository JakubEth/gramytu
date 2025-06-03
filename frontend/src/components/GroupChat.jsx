import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "https://gramytu.onrender.com";
const API_URL = "https://gramytu.onrender.com";

// Funkcja separatora dnia
function formatDaySeparator(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) return "Dzisiaj";
  if (isYesterday) return "Wczoraj";

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

const defaultAvatar = username =>
  "https://ui-avatars.com/api/?name=" +
  encodeURIComponent(username || "U") +
  "&background=E0E7FF&color=3730A3&bold=true";

function isFirstInGroup(messages, idx) {
  if (idx === 0) return true;
  const prev = messages[idx - 1];
  const curr = messages[idx];
  const sameUser =
    prev.userId === curr.userId ||
    (prev.userId?._id && prev.userId?._id === curr.userId?._id);
  const prevTime = new Date(prev.createdAt).getTime();
  const currTime = new Date(curr.createdAt).getTime();
  const closeInTime = Math.abs(currTime - prevTime) < 2 * 60 * 1000;
  return !(sameUser && closeInTime);
}

function isLastInGroup(messages, idx) {
  if (idx === messages.length - 1) return true;
  const curr = messages[idx];
  const next = messages[idx + 1];
  const sameUser =
    curr.userId === next.userId ||
    (curr.userId?._id && curr.userId?._id === next.userId?._id);
  const currTime = new Date(curr.createdAt).getTime();
  const nextTime = new Date(next.createdAt).getTime();
  const closeInTime = Math.abs(nextTime - currTime) < 2 * 60 * 1000;
  return !(sameUser && closeInTime);
}

export default function GroupChat({ eventId, user, eventName = "Wydarzenie", participants = [] }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showGiphy, setShowGiphy] = useState(false);
  const [gifs, setGifs] = useState([]);
  const [gifSearch, setGifSearch] = useState("");
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, msg: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, msg: null });
  const [selectedMsgId, setSelectedMsgId] = useState(null);
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

  useEffect(() => {
    if (!contextMenu.visible) return;
    const close = () => {
      setContextMenu({ ...contextMenu, visible: false });
      setSelectedMsgId(null);
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [contextMenu.visible]);

  const fetchGifs = async (query) => {
    if (!query) return setGifs([]);
    try {
      const res = await fetch(
        `${API_URL}/giphy/search?q=${encodeURIComponent(query)}`
      );
      if (!res.ok) {
        setGifs([]);
        return;
      }
      const data = await res.json();
      setGifs(data || []);
    } catch (e) {
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

  function handleCopyText(msg) {
    navigator.clipboard.writeText(
      msg.text.startsWith("<GIF>") ? "" : msg.text
    );
  }

  function handleReply(msg) {
    alert("Odpowiedz na: " + (msg.text.startsWith("<GIF>") ? "[GIF]" : msg.text));
  }

  function handleEdit(msg) {
    alert("Edytuj (do zaimplementowania)");
  }

  function handlePin(msg) {
    alert("Przypnij (do zaimplementowania)");
  }

  function handleDelete(msg) {
    setDeleteModal({ open: true, msg });
  }

  function confirmDelete() {
    if (!deleteModal.msg) return;
    fetch(`${API_URL}/events/${eventId}/chat/${deleteModal.msg._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => {
      if (res.ok) {
        setMessages(prev => prev.filter(m => m._id !== deleteModal.msg._id));
        socketRef.current.emit("deleteMessage", deleteModal.msg._id);
      }
      setDeleteModal({ open: false, msg: null });
    });
  }

  return (
    <div className="flex flex-col h-full relative">
      <div
        className="overflow-y-auto flex-1 pr-1 scrollbar-none"
        style={{
          overflowAnchor: "none",
          scrollbarWidth: "none",
          msOverflowStyle: "none"
        }}
      >
        {(!messages || messages.length === 0) ? (
          <div className="text-center text-gray-400 italic mt-10 select-none">
            To początek konwersacji. Przywitaj się 👋
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMine = user && (msg.userId === user._id || msg.userId?._id === user._id);
            const avatarUrl = msg.avatar || defaultAvatar(msg.username);
            const msgId = msg._id || i;
            const firstInGroup = isFirstInGroup(messages, i);
            const lastInGroup = isLastInGroup(messages, i);

            // Separator dnia
            const prevMsg = messages[i - 1];
            const isNewDay =
              i === 0 ||
              new Date(msg.createdAt).toDateString() !== new Date(prevMsg.createdAt).toDateString();

            return (
              <div key={msgId + "-wrapper"}>
                {/* SEPARATOR DNIA */}
                {isNewDay && (
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-indigo-100" />
                    <span className="mx-4 px-3 py-1 rounded-full bg-white border border-indigo-100 shadow text-xs font-semibold text-indigo-400 select-none">
                      {formatDaySeparator(msg.createdAt)}
                    </span>
                    <div className="flex-1 h-px bg-indigo-100" />
                  </div>
                )}
                <div
                  className={`flex items-end mb-1 ${isMine ? "justify-end" : ""}
                    ${selectedMsgId === msgId ? "bg-indigo-100/80 ring-2 ring-indigo-400/70 rounded-2xl transition-all duration-150" : ""}
                  `}
                  onContextMenu={isMine ? (e) => {
                    e.preventDefault();
                    setSelectedMsgId(msgId);
                    setContextMenu({
                      visible: true,
                      x: e.clientX,
                      y: e.clientY,
                      msg
                    });
                  } : undefined}
                >
                  {/* Stała kolumna na avatar po lewej */}
                  <div className="w-9 mr-2 flex-shrink-0 flex justify-center">
                    {!isMine && lastInGroup ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover bg-indigo-100"
                      />
                    ) : (
                      <div className="w-9 h-9" />
                    )}
                  </div>
                  <div className="flex flex-col max-w-[60%]">
                    {/* Nick i godzina tylko przy pierwszej z serii */}
                    {firstInGroup && (
                      <div className={`flex items-center gap-2 mb-1 ${isMine ? "justify-end" : ""}`}>
                        <span className="font-bold text-indigo-800 text-xs">{msg.username}</span>
                        <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-2 shadow
                      ${isMine
                        ? "bg-blue-100 text-right self-end"
                        : "bg-indigo-100 text-left self-start"
                      }
                      break-words
                    `}>
                      {renderMessage(msg)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Dropdown menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44"
          style={{ top: contextMenu.y, left: contextMenu.x, minWidth: 160 }}
          onContextMenu={e => e.preventDefault()}
        >
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50"
            onClick={() => { handleReply(contextMenu.msg); setContextMenu({ ...contextMenu, visible: false }); }}>
            Odpowiedz
          </button>
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50"
            onClick={() => { handleCopyText(contextMenu.msg); setContextMenu({ ...contextMenu, visible: false }); }}>
            Kopiuj tekst
          </button>
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50"
            onClick={() => { handleEdit(contextMenu.msg); setContextMenu({ ...contextMenu, visible: false }); }}>
            Edytuj
          </button>
          <button className="block w-full text-left px-4 py-2 text-sm hover:bg-indigo-50"
            onClick={() => { handlePin(contextMenu.msg); setContextMenu({ ...contextMenu, visible: false }); }}>
            Przypnij
          </button>
          <button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            onClick={() => { handleDelete(contextMenu.msg); setContextMenu({ ...contextMenu, visible: false }); }}>
            Usuń
          </button>
        </div>
      )}
      {/* Modal potwierdzający usunięcie */}
      {deleteModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-xs w-full flex flex-col items-center">
            <div className="text-red-600 text-3xl mb-2">🗑️</div>
            <div className="font-bold text-lg mb-2 text-gray-800 text-center">
              Usunąć tę wiadomość?
            </div>
            <div className="text-gray-500 text-center mb-4 text-sm break-words max-w-full">
              {deleteModal.msg?.text?.startsWith("<GIF>")
                ? "[GIF]"
                : deleteModal.msg?.text}
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                onClick={() => setDeleteModal({ open: false, msg: null })}
              >
                Anuluj
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                onClick={confirmDelete}
              >
                Usuń
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Input na dole – sticky! */}
      <div className="sticky bottom-0 left-0 right-0 z-10 bg-white border-t border-indigo-100 px-4 py-3 flex items-center gap-2" style={{boxShadow: "0 0 24px 0 rgba(99,102,241,0.06)"}}>
        <button
          className="flex items-center justify-center w-12 h-10 rounded-full bg-indigo-50 text-indigo-500 font-bold text-base hover:bg-indigo-100 transition"
          onClick={() => setShowGiphy((v) => !v)}
          title="Wyślij GIF"
          type="button"
          tabIndex={-1}
        >
          GIF
        </button>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          className="flex-1 h-10 rounded-full border border-indigo-100 bg-white px-4 text-base placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition shadow-sm"
          placeholder="Napisz wiadomość..."
          onKeyDown={e => e.key === "Enter" ? handleSend() : null}
          autoComplete="off"
          spellCheck={true}
          maxLength={1000}
        />
        <button
          className="h-10 px-6 rounded-full font-bold text-white bg-gradient-to-br from-indigo-400 to-indigo-500 shadow-sm hover:from-indigo-500 hover:to-indigo-600 transition"
          onClick={handleSend}
          disabled={!text.trim()}
          type="button"
        >
          Wyślij
        </button>
      </div>
      {/* Popup z wyszukiwarką GIFów */}
      {showGiphy && (
        <div className="absolute left-0 right-0 bottom-14 bg-white border-t border-indigo-100 shadow-2xl rounded-b-2xl p-4 z-20">
          <div className="flex gap-2 mb-2">
            <input
              value={gifSearch}
              onChange={e => {
                setGifSearch(e.target.value);
                fetchGifs(e.target.value);
              }}
              className="border border-indigo-100 rounded-full px-4 py-2 flex-1 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400"
              placeholder="Szukaj GIFa…"
              autoFocus
            />
            <button
              className="text-red-600 font-bold px-4 py-2 rounded-full bg-red-50 hover:bg-red-100 transition"
              onClick={() => setShowGiphy(false)}
              type="button"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {gifs.map(gif => (
              <img
                key={gif.id}
                src={gif.images.fixed_height_small.url}
                alt={gif.title}
                className="w-24 h-24 object-cover rounded-xl cursor-pointer border border-indigo-100 hover:border-indigo-400 shadow transition"
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
