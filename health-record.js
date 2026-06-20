import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HealthRecord() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [foundPrescription, setFoundPrescription] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/prescriptions')
      .then(res => res.json())
      .then(data => setPrescriptions(data));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const prescription = prescriptions.find(p => p.patientName.toLowerCase() === patientName.toLowerCase());
    if (prescription) {
      setFoundPrescription(prescription);
      setMessage('');
    } else {
      setFoundPrescription(null);
      setMessage('No prescription found for this name.');
    }
  };

  const handleAddToCart = () => {
    if (!foundPrescription) return;
    const medicines = foundPrescription.medicines.map(m => m.name).join(',');
    const quantities = foundPrescription.medicines.map(m => m.quantity).join(',');
    router.push(`/pharmacy?add=${medicines}&qt=${quantities}`);
  };

  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#7c2d12', fontSize: '24px', margin: 0 }}>Your Health Record</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Home</button>
      </header>
      <main style={{ padding: '40px', maxWidth: '900px', margin: '40px auto' }}>
        <div style={{ background: '#f9fafb', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Enter your full name to find prescription" style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            <button type="submit" style={{ background: '#f97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Search</button>
          </form>
          {message && <p style={{ textAlign: 'center', color: '#991b1b' }}>{message}</p>}
          {foundPrescription && (
            <div>
              <h2 style={{ borderBottom: '2px solid #f97316', paddingBottom: '10px' }}>Prescription for {foundPrescription.patientName}</h2>
              <p><strong>Date:</strong> {new Date(foundPrescription.id).toLocaleDateString()}</p>
              <h3 style={{ marginTop: '20px' }}>Suggested Medicines:</h3>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {foundPrescription.medicines.map(med => (
                  <li key={med.name} style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{med.name}</span>
                    <strong>Quantity: {med.quantity}</strong>
                  </li>
                ))}
              </ul>
              <button onClick={handleAddToCart} style={{ width: '100%', background: '#16a34a', color: 'white', border: 'none', padding: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', marginTop: '20px' }}>Add All to Cart & Go to Pharmacy</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
