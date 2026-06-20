import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function VideoConsultation() {
  const router = useRouter();
  const { token, name: queryName } = router.query;

  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [onCall, setOnCall] = useState(false);
  const [isAppointmentCall, setIsAppointmentCall] = useState(false);

  useEffect(() => {
    if (token && queryName) {
      setIsAppointmentCall(true);
      setOnCall(true);
    }
  }, [token, queryName]);

  const handleJoin = () => {
    if (roomName && userName) {
      setOnCall(true);
    } else {
      alert('Please enter your name and a room name.');
    }
  };

  const handleLeave = () => {
    if (isAppointmentCall) {
      router.back();
    } else {
      setOnCall(false);
      setRoomName('');
      setUserName('');
    }
  };

  const getRoom = () => (isAppointmentCall ? token : roomName);
  const getName = () => (isAppointmentCall ? queryName : userName);

  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', height: '100vh', background: '#f0f4f8' }}>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', margin: 0 }}>Video Consultation</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Home</button>
      </header>

      {onCall ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <iframe
            src={`https://meet.jit.si/${getRoom()}#userInfo.displayName="${getName()}"`}
            style={{ flex: 1, border: 0 }}
            allow="camera; microphone; fullscreen; display-capture"
          ></iframe>
          <button 
            onClick={handleLeave} 
            style={{ padding: '15px', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}
          >
            Leave Call
          </button>
        </div>
      ) : (
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '30px', color: '#111827' }}>Join a Consultation Room</h2>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <input
              type="text"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value.replace(/\s/g, ''))}
              style={{ width: '100%', padding: '12px', marginBottom: '25px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
            <button 
              onClick={handleJoin} 
              style={{ width: '100%', padding: '15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '18px' }}
            >
              Join Call
            </button>
          </div>
        </main>
      )}
    </div>
  );
}
