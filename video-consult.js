import { useState, useRef, useEffect } from 'react';

export default function VideoConsult() {
  const [name, setName] = useState('');
  const [doctor, setDoctor] = useState('');
  const [room, setRoom] = useState('');
  const [showJitsi, setShowJitsi] = useState(false);
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    if (showJitsi && room) {
      const script = document.createElement('script');
      script.src = 'https://8x8.vc/vpaas-magic-cookie-d1d2b926fd5d45dfbe0868b335e7ec2d/external_api.js';
      script.async = true;
      script.onload = () => {
        const api = new window.JitsiMeetExternalAPI("8x8.vc", {
          roomName: `vpaas-magic-cookie-d1d2b926fd5d45dfbe0868b335e7ec2d/${room}`,
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: name || "Guest"
          }
        });
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
        if (jitsiContainerRef.current) jitsiContainerRef.current.innerHTML = '';
      };
    }
  }, [showJitsi, room, name]);

  function handleJoin(e) {
    e.preventDefault();
    if (name && doctor && room) {
      setShowJitsi(true);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {!showJitsi ? (
        <form
          onSubmit={handleJoin}
          style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 2px 16px rgba(0,0,0,0.10)',
            padding: 40,
            minWidth: 350,
            maxWidth: 400,
            width: '100%',
            textAlign: 'center'
          }}
        >
          <h1 style={{ color: '#23235b', marginBottom: 8 }}>Video Consultation</h1>
          <p style={{ color: '#555', marginBottom: 24 }}>Fill in the details below to start or join a call.</p>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
            required
          />
          <input
            type="text"
            placeholder="Doctor's Name"
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: 16,
              borderRadius: 8,
              border: '1px solid #ddd',
              fontSize: '1rem'
            }}
            required
          />
          <input
            type="text"
            placeholder="Enter Topic or Room Name"
            value={room}
            onChange={e => setRoom(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: 24,
              borderRadius: 8,
              border: room ? '1px solid #ddd' : '2px solid #e53935',
              fontSize: '1rem'
            }}
            required
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              background: 'linear-gradient(90deg,#5f2eea,#38b6ff)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Join Call
          </button>
        </form>
      ) : (
        <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
          <div ref={jitsiContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
}
