import { useState } from 'react';

export default function HospitalChat() {
  const [messages, setMessages] = useState([
    { bot: "Hello! You can ask about bed booking, visiting hours, appointment scheduling, or available medicines." }
  ]);
  const [input, setInput] = useState('');
  const [bookingStep, setBookingStep] = useState(null);
  const [bookingData, setBookingData] = useState({});
  const [appointmentStep, setAppointmentStep] = useState(null);
  const [appointmentData, setAppointmentData] = useState({});

  async function handleSend() {
    let reply = "Sorry, I didn't understand. You can ask about bed booking, visiting hours, appointment scheduling, or available medicines.";

    // Bed booking flow
    if (bookingStep) {
      if (bookingStep === 1) {
        setBookingData({ ...bookingData, name: input });
        setBookingStep(2);
        reply = "Which hospital do you want to book a bed in?";
      } else if (bookingStep === 2) {
        setBookingData({ ...bookingData, hospital: input });
        setBookingStep(null);
        reply = `Bed booked for ${bookingData.name || "your name"} at ${input}. Confirmation sent!`;
      }
      setMessages([...messages, { user: input }, { bot: reply }]);
      setInput('');
      return;
    }

    // Appointment scheduling flow
    if (appointmentStep) {
      if (appointmentStep === 1) {
        setAppointmentData({ ...appointmentData, name: input });
        setAppointmentStep(2);
        reply = "Which doctor do you want to see?";
      } else if (appointmentStep === 2) {
        setAppointmentData({ ...appointmentData, doctor: input });
        setAppointmentStep(3);
        reply = "What time slot do you prefer?";
      } else if (appointmentStep === 3) {
        setAppointmentData({ ...appointmentData, time: input });
        setAppointmentStep(null);
        reply = `Appointment scheduled for ${appointmentData.name || "your name"} with ${appointmentData.doctor || "doctor"} at ${input}. Confirmation sent!`;
      }
      setMessages([...messages, { user: input }, { bot: reply }]);
      setInput('');
      return;
    }

    // Main triggers
    if (/bed book/i.test(input)) {
      setBookingStep(1);
      reply = "Please provide your name for bed booking.";
    } else if (/appointment/i.test(input)) {
      setAppointmentStep(1);
      reply = "Please provide your name for appointment scheduling.";
    } else if (/bed/i.test(input)) {
      const res = await fetch('/api/hospital-info');
      const data = await res.json();
      reply = "Available beds:\n" + data.beds.map(b => `${b.hospital}: ${b.available}`).join(', ');
    } else if (/visiting hour/i.test(input)) {
      const res = await fetch('/api/hospital-info');
      const data = await res.json();
      reply = `Hospital visiting hours are ${data.visitingHours}.`;
    } else if (/medicine|available medicine/i.test(input)) {
      const res = await fetch('/api/medicine');
      const meds = await res.json();
      reply = "Available medicines:\n" + meds.map(m => `${m.name} (${m.stock})`).join(', ');
    }
    setMessages([...messages, { user: input }, { bot: reply }]);
    setInput('');
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: '#f5faff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        width: '100%',
        maxWidth: 700,
        height: '95vh',
        background: '#fff',
        boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
        padding: 32,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        border: 'none'
      }}>
        <h2 style={{ color: '#1976d2', marginBottom: 16, textAlign: 'center' }}>Hospital Support</h2>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          background: '#f5faff',
          borderRadius: 12,
          border: 'none',
          padding: 16,
          marginBottom: 16
        }}>
          {messages.map((msg, i) =>
            msg.user ? (
              <div key={i} style={{ textAlign: 'right', margin: '8px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#1976d2',
                  color: '#fff',
                  borderRadius: 16,
                  padding: '8px 16px',
                  fontWeight: 500
                }}>{msg.user}</span>
              </div>
            ) : (
              <div key={i} style={{ textAlign: 'left', margin: '8px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: '#e3f2fd',
                  color: '#0d47a1',
                  borderRadius: 16,
                  padding: '8px 16px',
                  whiteSpace: 'pre-line',
                  fontWeight: 500
                }}>{msg.bot}</span>
              </div>
            )
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 16px',
              borderRadius: 6,
              border: '2px solid #1976d2',
              fontSize: '1rem',
              outline: 'none'
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          />
          <button
            onClick={handleSend}
            style={{
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0 24px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
