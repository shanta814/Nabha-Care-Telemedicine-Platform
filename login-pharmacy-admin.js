import { useState } from 'react';

export default function LoginPharmacyAdmin() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    if (user === 'pharmacyadmin' && pass === 'password') {
      window.location.href = '/pharmacy-admin';
    } else {
      setError('Invalid credentials');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e3f2fd' }}>
      <form onSubmit={handleLogin} style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 12px #1976d220', minWidth: 320 }}>
        <h2 style={{ color: '#0d47a1', marginBottom: 24 }}>Pharmacy Admin Login</h2>
        <input placeholder="Username" value={user} onChange={e => setUser(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8 }} />
        <input type="password" placeholder="Password" value={pass} onChange={e => setPass(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8 }} />
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>Login</button>
        {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      </form>
    </div>
  );
}
