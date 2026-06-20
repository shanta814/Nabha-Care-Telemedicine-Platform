import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');

  const fetchDoctors = async () => {
    const res = await fetch('/api/doctors');
    setDoctors(await res.json());
  };

  useEffect(() => { fetchDoctors(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, specialty }),
    });
    setName('');
    setSpecialty('');
    fetchDoctors();
  };

  const handleRemove = async (id) => {
    await fetch('/api/doctors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchDoctors();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
      <div>
        <h3>Add Doctor</h3>
        <form onSubmit={handleAdd}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Specialty" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px' }}>Add Doctor</button>
        </form>
      </div>
      <div>
        <h3>Current Doctors</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {doctors.map(doc => (
            <li key={doc.id} style={{ background: '#f9fafb', padding: '10px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
              <span>{doc.name} - {doc.specialty}</span>
              <button onClick={() => handleRemove(doc.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Remove</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ManageHospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [editingHospitals, setEditingHospitals] = useState({});

  const fetchHospitals = async () => {
    const res = await fetch('/api/hospitals');
    const data = await res.json();
    setHospitals(data);
    const initialEditingState = data.reduce((acc, h) => {
      acc[h.id] = { bedsAvailable: h.bedsAvailable || 0, facilities: h.facilities || '' };
      return acc;
    }, {});
    setEditingHospitals(initialEditingState);
  };

  useEffect(() => { fetchHospitals(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/hospitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, address }),
    });
    setName('');
    setAddress('');
    fetchHospitals();
  };

  const handleRemove = async (id) => {
    await fetch('/api/hospitals', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchHospitals();
  };

  const handleHospitalChange = (id, field, value) => {
    setEditingHospitals(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleUpdateHospital = async (id) => {
    const hospitalData = editingHospitals[id];
    const bedsAvailable = parseInt(hospitalData.bedsAvailable, 10);
    if (isNaN(bedsAvailable)) {
      alert('Please enter a valid number for beds.');
      return;
    }
    await fetch('/api/hospitals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, bedsAvailable, facilities: hospitalData.facilities }),
    });
    alert('Hospital details updated successfully!');
    fetchHospitals();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
      <div>
        <h3>Add Hospital</h3>
        <form onSubmit={handleAdd}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Hospital Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px' }}>Add Hospital</button>
        </form>
      </div>
      <div>
        <h3>Current Hospitals</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {hospitals.map(h => (
            <li key={h.id} style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{h.name} - {h.address}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={editingHospitals[h.id]?.bedsAvailable || ''}
                  onChange={(e) => handleHospitalChange(h.id, 'bedsAvailable', e.target.value)}
                  style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Beds"
                />
                <input
                  type="text"
                  value={editingHospitals[h.id]?.facilities || ''}
                  onChange={(e) => handleHospitalChange(h.id, 'facilities', e.target.value)}
                  style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  placeholder="Facilities (e.g., ICU, Emergency)"
                />
                <button onClick={() => handleUpdateHospital(h.id)} style={{ background: '#dbeafe', color: '#1e40af', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                <button onClick={() => handleRemove(h.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '8px 12px', borderRadius: '4px' }}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [editingApt, setEditingApt] = useState(null);

  const fetchData = async () => {
    const [aptRes, docRes] = await Promise.all([fetch('/api/appointments'), fetch('/api/doctors')]);
    setAppointments(await aptRes.json());
    setDoctors(await docRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleCancel = async (id) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      await fetch('/api/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchData();
    }
  };

  const handleEdit = (appointment) => {
    setEditingApt({ ...appointment });
  };

  const handleSave = async () => {
    if (!editingApt) return;
    await fetch('/api/appointments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingApt),
    });
    setEditingApt(null);
    fetchData();
  };

  const handleFieldChange = (e) => {
    setEditingApt({ ...editingApt, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h3>All Appointments</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {appointments.map(apt => (
          <li key={apt.id} style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            {editingApt && editingApt.id === apt.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
                  <input type="date" name="date" value={editingApt.date} onChange={handleFieldChange} style={{ padding: '8px' }} />
                  <input type="time" name="time" value={editingApt.time} onChange={handleFieldChange} style={{ padding: '8px' }} />
                  <select name="doctor" value={editingApt.doctor} onChange={handleFieldChange} style={{ padding: '8px' }}>
                    {doctors.map(doc => <option key={doc.id} value={doc.name}>{doc.name}</option>)}
                  </select>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <button onClick={() => setEditingApt(null)} style={{ marginRight: '10px', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px' }}>Cancel</button>
                  <button onClick={handleSave} style={{ padding: '8px 12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px' }}>Save Changes</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: 0 }}><strong>Patient:</strong> {apt.patientName} (Token: {apt.token})</p>
                  <p style={{ margin: '5px 0 0' }}><strong>With:</strong> {apt.doctor} on {apt.date} at {apt.time}</p>
                </div>
                <div>
                  <button onClick={() => handleEdit(apt)} style={{ marginRight: '10px', background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Edit / Reschedule</button>
                  <button onClick={() => handleCancel(apt.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Cancel</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function SuperAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('doctors');
  const tabStyle = { padding: '10px 20px', cursor: 'pointer', borderBottom: '2px solid transparent' };
  const activeTabStyle = { ...tabStyle, borderBottom: '2px solid #dc2626', fontWeight: 'bold' };

  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#dc2626', fontSize: '24px', margin: 0 }}>Super Admin Dashboard</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Home</button>
      </header>
      <main style={{ padding: '40px', maxWidth: '1000px', margin: '40px auto' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '30px' }}>
          <nav style={{ display: 'flex' }}>
            <div onClick={() => setActiveTab('doctors')} style={activeTab === 'doctors' ? activeTabStyle : tabStyle}>Manage Doctors</div>
            <div onClick={() => setActiveTab('hospitals')} style={activeTab === 'hospitals' ? activeTabStyle : tabStyle}>Manage Hospitals</div>
            <div onClick={() => setActiveTab('appointments')} style={activeTab === 'appointments' ? activeTabStyle : tabStyle}>Manage Appointments</div>
          </nav>
        </div>
        <div>
          {activeTab === 'doctors' && <ManageDoctors />}
          {activeTab === 'hospitals' && <ManageHospitals />}
          {activeTab === 'appointments' && <ManageAppointments />}
        </div>
      </main>
    </div>
  );
}
