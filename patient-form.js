import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
export default function PatientForm() {
  const router = useRouter();
  const { name, date, token } = router.query;
  const [formData, setFormData] = useState({ age: '', problem: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!name || !date || !token) {
      const timer = setTimeout(() => {
        if (!router.query.name) router.push('/');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [name, date, token, router]);
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    const submissionData = { ...formData, name, date, token };
    const response = await fetch('/api/submit-form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    });
    setIsLoading(false);
    if (response.ok) {
      setMessage('Form submitted successfully! You can now close this page.');
    } else {
      setMessage('Submission failed. Please try again.');
    }
  };
  if (!name) return <p>Loading...</p>;
  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#d97706', fontSize: '24px', margin: 0 }}>Patient Intake Form</h1>
      </header>
      <main style={{ padding: '40px', maxWidth: '700px', margin: '40px auto', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <div style={{ padding: '20px', background: '#eef2ff', borderRadius: '8px', marginBottom: '30px' }}>
          <p style={{ margin: 0 }}><strong>Name:</strong> {name}</p>
          <p style={{ margin: '5px 0 0 0' }}><strong>Appointment Date:</strong> {new Date(date).toLocaleDateString('en-GB')}</p>
          <p style={{ margin: '5px 0 0 0' }}><strong>Token:</strong> {token}</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}><label htmlFor="age" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Age</label><input type="number" id="age" value={formData.age} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
          <div style={{ marginBottom: '30px' }}><label htmlFor="problem" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Describe Your Medical Problem</label><textarea id="problem" value={formData.problem} onChange={handleChange} required rows="6" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
          {message && <p style={{ textAlign: 'center', color: message.includes('failed') ? 'red' : 'green', marginBottom: '20px' }}>{message}</p>}
          <button type="submit" disabled={isLoading || message.includes('successfully')} style={{ width: '100%', padding: '15px', background: isLoading ? '#9ca3af' : '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>{isLoading ? 'Submitting...' : 'Submit Form'}</button>
        </form>
      </main>
    </div>
  );
}
