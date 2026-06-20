import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PrintSummary() {
  const router = useRouter();
  const { data } = router.query;
  let summaryData = null;

  try {
    if (data) {
      summaryData = JSON.parse(decodeURIComponent(data));
    }
  } catch (e) {
    console.error("Failed to parse summary data", e);
  }

  useEffect(() => {
    if (summaryData) {
      setTimeout(() => window.print(), 500);
    }
  }, [summaryData]);

  if (!summaryData) {
    return <div style={{ fontFamily: 'sans-serif', padding: '40px' }}>Loading summary... If printing does not start automatically, please refresh.</div>;
  }

  const { patientName, appointments, medications, labResults, generatedDate } = summaryData;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', color: '#333' }}>
      <h1 style={{ textAlign: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' }}>Health Summary</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <p><strong>Patient:</strong> {patientName}</p>
        <p><strong>Generated on:</strong> {new Date(generatedDate).toLocaleDateString()}</p>
      </div>

      <section>
        <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Active Medications</h2>
        {medications && medications.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Medication</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Dosage</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((med, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{med.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{med.dosage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No active medications listed.</p>}
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Recent Lab Results</h2>
        {labResults && labResults.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Test</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Result</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Range</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left', background: '#f2f2f2' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {labResults.map((res, i) => (
                <tr key={i}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{res.testName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{res.value} {res.units}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{res.range || 'N/A'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(res.reportedDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No recent lab results found.</p>}
      </section>

      <section style={{ marginTop: '30px' }}>
        <h2 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Upcoming Appointments</h2>
        {appointments && appointments.length > 0 ? (
          <ul>
            {appointments.map((apt, i) => (
              <li key={i} style={{ marginBottom: '10px' }}>
                <strong>{new Date(apt.date).toLocaleDateString()} at {apt.time}</strong> with Dr. {apt.doctor}
              </li>
            ))}
          </ul>
        ) : <p>No upcoming appointments scheduled.</p>}
      </section>
    </div>
  );
}
