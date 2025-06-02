import { useState } from "react";
import { FaComments } from "react-icons/fa";
import GroupChat from "./GroupChat";

export default function MyEventsPanel({ user, events }) {
  const createdEvents = events.filter(ev => ev.hostId === user._id);
  const joinedEvents = events.filter(
    ev => ev.hostId !== user._id && ev.participants?.some(p => p === user._id || p._id === user._id)
  );

  const [selectedEventId, setSelectedEventId] = useState(
    createdEvents.length > 0 ? createdEvents[0]._id : joinedEvents[0]?._id
  );
  const selectedEvent =
    createdEvents.concat(joinedEvents).find(ev => ev._id === selectedEventId);

  return (
    <div className="w-full min-h-[600px] bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-indigo-100 h-[600px]">
      {/* LEWA KOLUMNA */}
      <div className="md:w-1/4 w-full bg-white border-r border-indigo-100 flex flex-col overflow-y-auto">
        <div className="p-4 font-extrabold text-lg border-b border-indigo-50 bg-indigo-50 text-indigo-700 tracking-tight">
          Moje wydarzenia
        </div>
        <div className="p-3 text-xs text-gray-400 font-semibold">Stworzone przeze mnie</div>
        {createdEvents.length === 0 && (
          <div className="text-gray-400 italic px-4 pb-2">Brak</div>
        )}
        {createdEvents.map(ev => (
          <button
            key={ev._id}
            onClick={() => setSelectedEventId(ev._id)}
            className={`flex items-center gap-3 px-4 py-2 w-full text-left rounded-xl mb-1 transition
              ${selectedEventId === ev._id ? "bg-indigo-100 ring-2 ring-indigo-200" : "hover:bg-indigo-50"}
            `}
          >
            <img
              src={ev.image}
              alt=""
              className="w-10 h-10 object-cover rounded-lg border border-indigo-100 shadow-sm"
            />
            <div>
              <div className="font-semibold text-sm text-indigo-800">{ev.title}</div>
              <div className="text-xs text-gray-400">{ev.date?.slice(0, 16).replace("T", " ")}</div>
            </div>
          </button>
        ))}
        <div className="p-3 text-xs text-gray-400 font-semibold mt-2">Do których dołączyłem</div>
        {joinedEvents.length === 0 && (
          <div className="text-gray-400 italic px-4 pb-2">Brak</div>
        )}
        {joinedEvents.map(ev => (
          <button
            key={ev._id}
            onClick={() => setSelectedEventId(ev._id)}
            className={`flex items-center gap-3 px-4 py-2 w-full text-left rounded-xl mb-1 transition
              ${selectedEventId === ev._id ? "bg-indigo-100 ring-2 ring-indigo-200" : "hover:bg-indigo-50"}
            `}
          >
            <img
              src={ev.image}
              alt=""
              className="w-10 h-10 object-cover rounded-lg border border-indigo-100 shadow-sm"
            />
            <div>
              <div className="font-semibold text-sm text-indigo-800">{ev.title}</div>
              <div className="text-xs text-gray-400">{ev.date?.slice(0, 16).replace("T", " ")}</div>
            </div>
          </button>
        ))}
      </div>
      {/* ŚRODKOWA KOLUMNA: CZAT */}
      <div className="md:w-2/4 w-full bg-white flex flex-col border-r border-indigo-100 h-full min-h-0">
        <div className="flex items-center gap-2 p-4 border-b border-indigo-50 bg-indigo-50 font-semibold text-indigo-700 text-lg tracking-tight shadow-sm">
          <FaComments className="text-indigo-500" /> Czat grupowy
        </div>
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {selectedEvent && (
            <GroupChat
              eventId={selectedEvent._id}
              user={user}
              eventName={selectedEvent.title}
              participants={selectedEvent.participants || []}
            />
          )}
        </div>
      </div>
      {/* PRAWA KOLUMNA: INFO */}
      <div className="md:w-1/4 w-full bg-indigo-50 flex flex-col">
        <div className="p-4 font-extrabold text-lg border-b border-indigo-100 bg-indigo-50 text-indigo-700 tracking-tight">
          Szczegóły wydarzenia
        </div>
        {selectedEvent ? (
          <div className="p-4">
            <img
              src={selectedEvent.image}
              alt=""
              className="w-full h-32 object-cover rounded-xl mb-3 border border-indigo-100 shadow-sm"
            />
            <div className="font-bold text-base mb-1 text-indigo-800">{selectedEvent.title}</div>
            <div className="text-xs text-gray-500 mb-2">{selectedEvent.date?.slice(0, 16).replace("T", " ")}</div>
            <div className="mb-2 text-gray-700">{selectedEvent.description}</div>
            <div className="text-xs text-gray-400 mb-1">Organizator: <span className="font-semibold text-indigo-700">{selectedEvent.host}</span></div>
            <div className="text-xs text-gray-400 mb-1">Lokalizacja: {selectedEvent.location?.name}</div>
            <div className="text-xs text-gray-400 mb-1">Typ: {selectedEvent.type}</div>
            <div className="text-xs text-gray-400 mb-2">Uczestnicy: {selectedEvent.participants?.length}</div>
            {/* Mini awatary uczestników */}
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedEvent.participants?.slice(0, 8).map(u => (
                <img
                  key={u._id || u}
                  src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || u)}`}
                  alt=""
                  className="w-7 h-7 rounded-full border border-indigo-100 bg-white"
                  title={u.username}
                />
              ))}
              {selectedEvent.participants?.length > 8 && (
                <span className="text-xs text-indigo-500 ml-2 font-semibold">+{selectedEvent.participants.length - 8}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 text-gray-400 italic">Wybierz wydarzenie z listy</div>
        )}
      </div>
    </div>
  );
}
