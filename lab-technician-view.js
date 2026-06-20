import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const LabResultInput = ({ order, onResultSubmit }) => {
  const [value, setValue] = useState('');
  const [units, setUnits] = useState('');
  const [range, setRange] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value) {
      alert('Please enter a result value.');
      return;
    }
    setIsSubmitting(true);
    await onResultSubmit({ ...order, value, units, range });
    setIsSubmitting(false);
    setValue('');
    setUnits('');
    setRange('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#f9fafb', padding: '10px', borderRadius: '6px' }}>
      <div style={{ fontWeight: 'bold', flex: 2 }}>{order.testName}</div>
      <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="Result Value" style={{ flex: 1, padding: '8px' }} required />
      <input type="text" value={units} onChange={e => setUnits(e.target.value)} placeholder="Units (e.g., mg/dL)" style={{ flex: 1, padding: '8px' }} />
      <input type="text" value={range} onChange={e => setRange(e.target.value)} placeholder="Normal Range" style={{ flex: 1, padding: '8px' }} />
      <button type="submit" disabled={isSubmitting} style={{ padding: '8px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px' }}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default function LabTechnicianView() {
  const router = useRouter();
  const [pendingOrders, setPendingOrders] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingOrders = async () => {
    setIsLoading(true);
    try {
      const [prescriptionsRes, resultsRes] = await Promise.all([
        fetch('/api/prescriptions'),
        fetch('/api/lab-results?patientName=__all__') // A way to get all results, though our API doesn't support this, so we'll fetch all prescriptions and filter client-side
      ]);
      
      const allPrescriptions = await prescriptionsRes.json();
      
      // In a real app, you'd fetch all results. Here we simulate by fetching all prescriptions and assuming we need to get results for all patients found.
      const patientNames = [...new Set(allPrescriptions.map(p => p.patientName))];
      const allResultsPromises = patientNames.map(name => fetch(`/api/lab-results?patientName=${encodeURIComponent(name)}`).then(res => res.json()));
      const allResultsNested = await Promise.all(allResultsPromises);
      const allResults = allResultsNested.flat();

      const submittedTests = new Set(allResults.map(r => `${r.patientName}-${r.testName}`));

      const orders = {};
      allPrescriptions.forEach(p => {
        if (p.labOrders && p.labOrders.length > 0) {
          p.labOrders.forEach(testName => {
            if (!submittedTests.has(`${p.patientName}-${testName}`)) {
              if (!orders[p.patientName]) {
                orders[p.patientName] = [];
              }
              // Avoid duplicate orders for the same patient/test
              if (!orders[p.patientName].some(o => o.testName === testName)) {
                orders[p.patientName].push({ patientName: p.patientName, testName });
              }
            }
          });
        }
      });
      setPendingOrders(orders);
    } catch (error) {
      console.error("Failed to fetch pending lab orders:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleResultSubmit = async (resultData) => {
    await fetch('/api/lab-results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData),
    });
    // Refresh the list after submission
    fetchPendingOrders();
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px', background: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#111827', fontSize: '32px' }}>Lab Technician Portal</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Home</button>
      </header>

      {isLoading ? <p>Loading pending orders...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {Object.keys(pendingOrders).length > 0 ? Object.entries(pendingOrders).map(([patientName, tests]) => (
            <div key={patientName} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h2 style={{ marginTop: 0, color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Patient: {patientName}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {tests.map((order, index) => (
                  <LabResultInput key={index} order={order} onResultSubmit={handleResultSubmit} />
                ))}
              </div>
            </div>
          )) : <p>No pending lab orders found.</p>}
        </div>
      )}
    </div>
  );
}
