import { useState } from 'react';

export default function HelpdeskChat() {
  const [messages, setMessages] = useState([
    { bot: "Hello! I am your virtual assistant. You can ask about bed availability or appointments." }
  ]);
  const [input, setInput] = useState('');

  async function handleSend() {
    let reply = "Sorry, I didn't understand.";
    if (/bed/i.test(input)) {
      const res = await fetch('/api/bed-availability');
      const beds = await res.json();
      reply = beds.map(b => `${b.hospital}: ${b.available} beds available`).join('\n');
    } else if (/appointment/i.test(input)) {
      const res = await fetch('/api/appointments');
      const appointments = await res.json();
      reply = appointments.map(a => `${a.patient} with ${a.doctor} at ${a.time}`).join('\n');
    }
    setMessages([...messages, { user: input }, { bot: reply }]);
    setInput('');
  }

  return (
    <div>
      <div style={{ border: '1px solid #ccc', padding: 16, height: 200, overflowY: 'auto', marginBottom: 8 }}>
        {messages.map((msg, i) =>
          msg.user ? <div key={i}><b>You:</b> {msg.user}</div> :
          <div key={i}><b>Bot:</b> {msg.bot}</div>
        )}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Ask about beds or appointments"
        style={{ width: '80%', marginRight: 8 }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}
