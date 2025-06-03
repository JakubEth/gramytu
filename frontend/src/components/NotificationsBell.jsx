import { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const API_URL = "https://gramytu.onrender.com";
const SOCKET_URL = API_URL;

export default function NotificationsBell({ user }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef();
  const navigate = useNavigate();

  // Pobierz powiadomienia
  useEffect(() => {
    if (!user?._id) return;
    fetch(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(setNotifications);
  }, [user?._id]);

  // Socket.io – real-time powiadomienia
  useEffect(() => {
    if (!user?._id) return;
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.emit("auth", { token: localStorage.getItem("token") });
    socket.on("notification", notif => {
      setNotifications(prev => [notif, ...prev]);
    });
    return () => socket.disconnect();
  }, [user?._id]);

  // Zamykaj dropdown po kliknięciu poza
  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const unread = notifications.filter(n => !n.read);

  const handleMarkAllRead = async () => {
    setLoading(true);
    const ids = notifications.filter(n => !n.read).map(n => n._id);
    await fetch(`${API_URL}/notifications/mark-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ ids })
    });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    setLoading(false);
  };

  const handleNotificationClick = async notif => {
    if (!notif.read) {
      await fetch(`${API_URL}/notifications/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ ids: [notif._id] })
      });
      setNotifications(notifications.map(n => n._id === notif._id ? { ...n, read: true } : n));
    }
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={bellRef}>
      <button
        className="relative p-2 rounded-full hover:bg-indigo-100 transition"
        onClick={() => setOpen(o => !o)}
        aria-label="Powiadomienia"
      >
        <FaBell className="text-2xl text-indigo-700" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 font-bold">
            {unread.length}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[96vw] bg-white rounded-2xl shadow-2xl border border-indigo-100 z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-bold text-indigo-700">Powiadomienia</span>
            <button
              className="text-xs text-indigo-600 hover:underline"
              onClick={handleMarkAllRead}
              disabled={loading || unread.length === 0}
            >
              Oznacz wszystkie jako przeczytane
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-gray-400 text-center">Brak powiadomień</div>
            )}
            {notifications.map(notif => (
              <button
                key={notif._id}
                onClick={() => handleNotificationClick(notif)}
                className={`block w-full text-left px-4 py-3 border-b last:border-b-0 transition
                  ${notif.read ? "bg-white text-gray-700" : "bg-indigo-50 font-semibold text-indigo-800"}
                  hover:bg-indigo-100`}
              >
                <div>{notif.text}</div>
                <div className="text-xs text-gray-400">{new Date(notif.createdAt).toLocaleString("pl-PL")}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
