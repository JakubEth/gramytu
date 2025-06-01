import React from 'react';
function EventCard({ event }) {
  return (
    <div style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      <p><strong>Kiedy:</strong> {event.date}</p>
      <p><strong>Gdzie:</strong> {event.location.name}</p>
      <p><strong>Host:</strong> {event.host}</p>
    </div>
  );
}
export default EventCard;
