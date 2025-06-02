import { useState } from "react";
import { FaComments } from "react-icons/fa";
import GroupChat from "./GroupChat";

// Przekazujesz user i events (wszystkie eventy z backendu)
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
    <div className="flex w-full h-[600px] bg-gray-100 rounded-xl overflow-hidden shadow-lg">
      {/* LEWA KOLUMNA */}
      <div className="w-1/4 bg-white border-r flex flex-col overflow-y-auto">
        <div className="p-3 font-bold text-lg border-b bg-gray-50">Moje wydarzenia</div>
        <div className="p-2 text-xs text-gray-400">Stworzone przeze mnie</div>
        {createdEvents.length === 0 && (
          <div className="text-gray-400 italic px-4 pb-2">Brak</div>
        )}
        {createdEvents.map(ev => (
          <button
            key={ev._id}
            onClick={() => setSelectedEventId(ev._id)}
            className={`flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-indigo-50 ${
              selectedEventId === ev._id ? "bg-indigo-100" : ""
            }`}
          >
            <img
              src={ev.image}
              alt=""
              className="w-10 h-10 object-cover rounded-lg border"
            />
            <div>
              <div className="font-semibold text-sm">{ev.title}</div>
              <div className="text-xs text-gray-400">{ev.date?.slice(0, 16).replace("T", " ")}</div>
            </div>
          </button>
        ))}
        <div className="p-2 text-xs text-gray-400 mt-2">Do których dołączyłem</div>
        {joinedEvents.length === 0 && (
          <div className="text-gray-400 italic px-4 pb-2">Brak</div>
        )}
        {joinedEvents.map(ev => (
          <button
            key={ev._id}
            onClick={() => setSelectedEventId(ev._id)}
            className={`flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-indigo-50 ${
              selectedEventId === ev._id ? "bg-indigo-100" : ""
            }`}
          >
            <img
              src={ev.image}
              alt=""
              className="w-10 h-10 object-cover rounded-lg border"
            />
            <div>
              <div className="font-semibold text-sm">{ev.title}</div>
              <div className="text-xs text-gray-400">{ev.date?.slice(0, 16).replace("T", " ")}</div>
            </div>
          </button>
        ))}
      </div>
      {/* ŚRODKOWA KOLUMNA: CZAT */}
      <div className="w-2/4 bg-white flex flex-col border-r">
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50 font-semibold">
          <FaComments className="text-indigo-500" /> Czat grupowy
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {/* Tu wstaw swój komponent czatu, np.: */}
          {/* <GroupChat eventId={selectedEvent?._id} user={user} /> */}
          {selectedEvent && (
  <GroupChat eventId={selectedEvent._id} user={user} />
)}

        </div>
      </div>
      {/* PRAWA KOLUMNA: INFO */}
      <div className="w-1/4 bg-gray-50 flex flex-col">
        <div className="p-3 font-bold text-lg border-b bg-gray-100">Szczegóły wydarzenia</div>
        {selectedEvent ? (
          <div className="p-4">
            <img
              src={selectedEvent.image}
              alt=""
              className="w-full h-32 object-cover rounded-lg mb-3"
            />
            <div className="font-semibold text-base mb-1">{selectedEvent.title}</div>
            <div className="text-xs text-gray-500 mb-2">{selectedEvent.date?.slice(0, 16).replace("T", " ")}</div>
            <div className="mb-2">{selectedEvent.description}</div>
            <div className="text-xs text-gray-400">Organizator: {selectedEvent.host}</div>
            <div className="text-xs text-gray-400">Lokalizacja: {selectedEvent.location?.name}</div>
            <div className="text-xs text-gray-400">Typ: {selectedEvent.type}</div>
            <div className="text-xs text-gray-400">Uczestnicy: {selectedEvent.participants?.length}</div>
          </div>
        ) : (
          <div className="p-4 text-gray-400 italic">Wybierz wydarzenie z listy</div>
        )}
      </div>
    </div>
  );
}
