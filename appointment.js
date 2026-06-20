import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Appointment() {
  const [patientName, setPatientName] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/doctors')
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          setDoctors(data);
          setSelectedDoctor(data[0].name);
        }
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) {
      setMessage('Please select a doctor.');
      return;
    }
    setMessage('');
    setBookedAppointment(null);

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName, doctor: selectedDoctor, date, time }),
    });

    if (res.ok) {
      const newAppointment = await res.json();
      setMessage(`Appointment booked successfully! Your token is: ${newAppointment.token}`);
      setBookedAppointment(newAppointment);
      setPatientName('');
      setDate('');
      setTime('');
    } else {
      setMessage('Failed to book appointment. Please try again.');
    }
  };

  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#059669', fontSize: '24px', margin: 0 }}>Book an Appointment</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Home</button>
      </header>
      <main style={{ padding: '40px', maxWidth: '700px', margin: '40px auto' }}>
        <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Patient Name</label>
              <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Doctor</label>
              <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white' }}>
                {doctors.length === 0 ? (
                  <option disabled>No doctors available</option>
                ) : (
                  doctors.map(doc => <option key={doc.id} value={doc.name}>{doc.name}</option>)
                )}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Time</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
            </div>
            <button type="submit" style={{ width: '100%', background: '#059669', color: 'white', border: 'none', padding: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>Book Now</button>
          </form>
          {message && <p style={{ marginTop: '20px', textAlign: 'center', padding: '10px', background: bookedAppointment ? '#d1fae5' : '#fee2e2', color: bookedAppointment ? '#065f46' : '#991b1b', borderRadius: '8px', fontWeight: 'bold' }}>{message}</p>}
          {bookedAppointment && (
            <div style={{marginTop: '20px', textAlign: 'center'}}>
              <button onClick={() => router.push('/patient-view')} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Go to Your Patient Dashboard</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
