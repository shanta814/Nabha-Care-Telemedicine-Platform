import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const vitalTypes = ['Blood Pressure (mmHg)', 'Blood Sugar (mg/dL)', 'Weight (kg)', 'Temperature (°C)'];

export default function PatientView() {
  const router = useRouter();
  const fileUploadRef = useRef(null);
  const [patientNameInput, setPatientNameInput] = useState('');
  const [loggedInPatient, setLoggedInPatient] = useState(null);
  const [patientData, setPatientData] = useState({ appointments: [], prescriptions: [], trackerEntries: [], documents: [], labResults: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tracker');

  const [trackerVital, setTrackerVital] = useState(vitalTypes[0]);
  const [trackerValue, setTrackerValue] = useState('');
  const [trackerNotes, setTrackerNotes] = useState('');
  const [isSubmittingTracker, setIsSubmittingTracker] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [symptomInput, setSymptomInput] = useState('');
  const [symptomResult, setSymptomResult] = useState(null);
  const [isCheckingSymptoms, setIsCheckingSymptoms] = useState(false);

  const fetchData = async (patientName) => {
    try {
      const [appointmentsRes, prescriptionsRes, trackerRes, documentsRes, labResultsRes] = await Promise.all([
        fetch(`/api/appointments?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/prescriptions?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/tracker?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/documents?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/lab-results?patientName=${encodeURIComponent(patientName)}`)
      ]);

      if (!appointmentsRes.ok || !prescriptionsRes.ok || !trackerRes.ok || !documentsRes.ok || !labResultsRes.ok) {
        throw new Error('Could not fetch all patient data.');
      }

      const appointments = await appointmentsRes.json();
      const prescriptions = await prescriptionsRes.json();
      const trackerEntries = await trackerRes.json();
      const documents = await documentsRes.json();
      const labResults = await labResultsRes.json();

      if (appointments.length === 0 && prescriptions.length === 0 && documents.length === 0) {
        setError('No records found for this name. Please check the name and try again.');
        setLoggedInPatient(patientName); // Log in even if no records, to allow using symptom checker
        setPatientData({ appointments: [], prescriptions: [], trackerEntries: [], documents: [], labResults: [] });
        return true;
      }

      setPatientData({
        appointments: appointments.sort((a, b) => new Date(a.date) - new Date(b.date)),
        prescriptions: prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date)),
        trackerEntries: trackerEntries.sort((a, b) => new Date(b.date) - new Date(a.date)),
        documents: documents.sort((a, b) => new Date(b.date) - new Date(a.date)),
        labResults: labResults.sort((a, b) => new Date(b.reportedDate) - new Date(a.reportedDate))
      });
      setLoggedInPatient(patientName);
      return true;

    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!patientNameInput) { setError('Please enter your full name.'); return; }
    setIsLoading(true);
    setError('');
    await fetchData(patientNameInput);
    setIsLoading(false);
  };

  const handleAddTrackerEntry = async (e) => {
    e.preventDefault();
    if (!trackerValue) { alert('Please enter a value for the vital.'); return; }
    setIsSubmittingTracker(true);
    await fetch('/api/tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientName: loggedInPatient, vitalType: trackerVital, value: trackerValue, notes: trackerNotes }),
    });
    setTrackerValue('');
    setTrackerNotes('');
    await fetchData(loggedInPatient);
    setIsSubmittingTracker(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploadingDoc(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientName: loggedInPatient, fileName: file.name, fileData: base64String }),
      });
      await fetchData(loggedInPatient);
      setIsUploadingDoc(false);
      fileUploadRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleCheckSymptoms = async () => {
    if (!symptomInput) {
      alert('Please describe your symptoms.');
      return;
    }
    setIsCheckingSymptoms(true);
    setSymptomResult(null);

    const conditions = new Set();
    if (patientData.prescriptions) {
        patientData.prescriptions.forEach(p => {
            if (p.notes && p.notes.toLowerCase().includes('hypertension')) conditions.add('hypertension');
            if (p.notes && p.notes.toLowerCase().includes('diabetes')) conditions.add('diabetes');
        });
    }

    try {
        const res = await fetch('/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                symptoms: symptomInput,
                patientContext: { conditions: Array.from(conditions) }
            }),
        });
        if (!res.ok) throw new Error('Failed to get a response from the symptom checker.');
        const data = await res.json();
        setSymptomResult(data);
    } catch (error) {
        console.error("Symptom checker error:", error);
        setSymptomResult({ error: 'Could not analyze symptoms at this time. Please try again later.' });
    }
    setIsCheckingSymptoms(false);
  };

  const handlePrintPrescription = (p) => { window.open(`/print-prescription?data=${encodeURIComponent(JSON.stringify(p))}`, '_blank'); };
  const handleLogout = () => { setLoggedInPatient(null); setPatientNameInput(''); setPatientData({ appointments: [], prescriptions: [], trackerEntries: [], documents: [], labResults: [] }); };

  const handlePrintSummary = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const upcomingAppointments = patientData.appointments.filter(a => new Date(a.date) >= today);
    const latestPrescription = patientData.prescriptions && patientData.prescriptions[0];

    const data = {
      patientName: loggedInPatient,
      appointments: upcomingAppointments,
      medications: latestPrescription ? latestPrescription.medicines : [],
      labResults: patientData.labResults ? patientData.labResults.slice(0, 10) : [],
      generatedDate: new Date().toISOString(),
    };
    window.open(`/print-summary?data=${encodeURIComponent(JSON.stringify(data))}`, '_blank');
  };

  const getStatusPill = (status) => {
    const styles = {
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white',
    };
    if (status === 'Filled') {
      return <span style={{ ...styles, background: '#16a34a' }}>Filled</span>;
    }
    return <span style={{ ...styles, background: '#f59e0b' }}>Pending</span>;
  };

  if (!loggedInPatient) {
    return (
      <div style={{ fontFamily: 'sans-serif', background: '#f9fafb', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ textAlign: 'center', color: '#111827', marginBottom: '30px' }}>Patient Portal</h1>
          <form onSubmit={handleLogin}>
            <input type="text" value={patientNameInput} onChange={(e) => setPatientNameInput(e.target.value)} placeholder="Enter Your Full Name" style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
            <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px' }}>{isLoading ? 'Loading...' : 'Access My Records'}</button>
            {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '15px' }}>{error}</p>}
          </form>
        </div>
        <button onClick={() => router.push('/')} style={{ marginTop: '20px', padding: '10px 20px', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer' }}>Back to Home</button>
      </div>
    );
  }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const upcomingAppointments = patientData.appointments ? patientData.appointments.filter(a => new Date(a.date) >= today) : [];
  
  const allOrderedLabs = patientData.prescriptions ? patientData.prescriptions.flatMap(p => p.labOrders || []) : [];
  const completedLabNames = new Set(patientData.labResults ? patientData.labResults.map(r => r.testName) : []);
  const pendingLabs = allOrderedLabs.filter(lab => !completedLabNames.has(lab));
  const latestPrescription = patientData.prescriptions && patientData.prescriptions[0];

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px', background: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#111827', fontSize: '32px' }}>Welcome, {loggedInPatient}</h1>
        <div>
          <button onClick={handlePrintSummary} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', marginRight: '10px' }}>Download Summary</button>
          <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div>
          <div style={{ borderBottom: '1px solid #ccc', marginBottom: '15px' }}>
            <button onClick={() => setActiveTab('tracker')} style={{ padding: '10px 15px', border: 'none', background: activeTab === 'tracker' ? '#e0e7ff' : 'transparent', borderRadius: '6px 6px 0 0' }}>My Health Tracker</button>
            <button onClick={() => setActiveTab('symptom_checker')} style={{ padding: '10px 15px', border: 'none', background: activeTab === 'symptom_checker' ? '#e0e7ff' : 'transparent', borderRadius: '6px 6px 0 0' }}>Symptom Checker</button>
            <button onClick={() => setActiveTab('medications')} style={{ padding: '10px 15px', border: 'none', background: activeTab === 'medications' ? '#e0e7ff' : 'transparent', borderRadius: '6px 6px 0 0' }}>My Medications</button>
            <button onClick={() => setActiveTab('labs')} style={{ padding: '10px 15px', border: 'none', background: activeTab === 'labs' ? '#e0e7ff' : 'transparent', borderRadius: '6px 6px 0 0' }}>Lab Results</button>
            <button onClick={() => setActiveTab('documents')} style={{ padding: '10px 15px', border: 'none', background: activeTab === 'documents' ? '#e0e7ff' : 'transparent', borderRadius: '6px 6px 0 0' }}>My Documents</button>
          </div>
          
          {activeTab === 'tracker' && (
            <div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <form onSubmit={handleAddTrackerEntry} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}><label>Vital</label><select value={trackerVital} onChange={e => setTrackerVital(e.target.value)} style={{ width: '100%', padding: '10px', marginTop: '5px' }}><option disabled>Select Vital</option>{vitalTypes.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                  <div style={{ flex: 1 }}><label>Value</label><input type="text" value={trackerValue} onChange={e => setTrackerValue(e.target.value)} placeholder="e.g. 120/80" style={{ width: '100%', padding: '10px', marginTop: '5px' }} /></div>
                  <div style={{ flex: 2 }}><label>Notes (Optional)</label><input type="text" value={trackerNotes} onChange={e => setTrackerNotes(e.target.value)} placeholder="e.g. Feeling dizzy" style={{ width: '100%', padding: '10px', marginTop: '5px' }} /></div>
                  <button type="submit" disabled={isSubmittingTracker} style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px' }}>{isSubmittingTracker ? 'Adding...' : 'Add'}</button>
                </form>
              </div>
              {patientData.trackerEntries && patientData.trackerEntries.map(entry => (
                <div key={entry.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '10px' }}>
                  <p style={{ margin: 0 }}><strong>{new Date(entry.date).toLocaleString()}:</strong> {entry.vitalType} - <strong>{entry.value}</strong></p>
                  {entry.notes && <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Notes: {entry.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'symptom_checker' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{marginTop: 0}}>AI-Powered Symptom Checker</h3>
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '15px', borderRadius: '6px', marginBottom: '20px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#b45309' }}>Disclaimer</p>
                    <p style={{ margin: '5px 0 0 0', color: '#b45309', fontSize: '14px' }}>This tool is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
                </div>
                <textarea
                    value={symptomInput}
                    onChange={e => setSymptomInput(e.target.value)}
                    placeholder="Describe your symptoms here (e.g., 'I have a sore throat and a slight fever')"
                    style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '10px' }}
                />
                <button onClick={handleCheckSymptoms} disabled={isCheckingSymptoms} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px' }}>
                    {isCheckingSymptoms ? 'Analyzing...' : 'Check Symptoms'}
                </button>

                {isCheckingSymptoms && <p style={{textAlign: 'center', marginTop: '20px'}}>Analyzing your symptoms...</p>}

                {symptomResult && (
                    <div style={{marginTop: '25px'}}>
                        <h4 style={{borderBottom: '1px solid #e5e7eb', paddingBottom: '10px'}}>Analysis Results</h4>
                        {symptomResult.redFlagWarning && (
                            <div style={{ background: '#fecaca', border: '1px solid #f87171', padding: '15px', borderRadius: '6px', marginBottom: '15px' }}>
                                <p style={{ margin: 0, fontWeight: 'bold', color: '#b91c1c', fontSize: '18px' }}>! IMPORTANT WARNING</p>
                                <p style={{ margin: '5px 0 0 0', color: '#b91c1c' }}>{symptomResult.redFlagWarning} Please seek immediate medical attention.</p>
                            </div>
                        )}
                        {symptomResult.differentialDiagnosis?.length > 0 && (
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>Potential Related Conditions:</p>
                                <p style={{fontSize: '14px', color: '#6b7280'}}>This is not a diagnosis. It is for informational purposes only.</p>
                                <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                                    {symptomResult.differentialDiagnosis.map((diag, i) => (
                                        <li key={i}>{diag.name}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {symptomResult.recommendations?.length > 0 && (
                            <div>
                                <p style={{ margin: 0, fontWeight: 'bold' }}>General Suggestions:</p>
                                <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                                    {symptomResult.recommendations.filter(r => !r.isReferral && !r.isContraindicated).map((rec, i) => (
                                        <li key={i}>{rec.guideline}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {symptomResult.error && <p style={{color: '#ef4444'}}>{symptomResult.error}</p>}
                    </div>
                )}
            </div>
          )}

          {activeTab === 'medications' && (
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{marginTop: 0}}>Current Medication Schedule</h3>
              <p style={{color: '#6b7280'}}>Based on your last prescription from {latestPrescription ? new Date(latestPrescription.date).toLocaleDateString() : 'N/A'}.</p>
              {latestPrescription && latestPrescription.medicines.length > 0 ? (
                <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '15px'}}>
                  <thead><tr><th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left', background: '#f3f4f6'}}>Medication</th><th style={{border: '1px solid #ddd', padding: '10px', textAlign: 'left', background: '#f3f4f6'}}>Instructions</th></tr></thead>
                  <tbody>{latestPrescription.medicines.map((med, i) => (<tr key={i}><td style={{border: '1px solid #ddd', padding: '10px'}}>{med.name}</td><td style={{border: '1px solid #ddd', padding: '10px'}}>{med.dosage}</td></tr>))}</tbody>
                </table>
              ) : <p>No active medications found in your latest prescription.</p>}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <h3 style={{marginTop: 0}}>Upload New Document</h3>
                <input type="file" ref={fileUploadRef} onChange={handleFileUpload} style={{display: 'none'}} />
                <button onClick={() => fileUploadRef.current.click()} disabled={isUploadingDoc} style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>{isUploadingDoc ? 'Uploading...' : 'Choose File'}</button>
              </div>
              {patientData.documents && patientData.documents.map(doc => (
                <div key={doc.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><p style={{ margin: 0, fontWeight: 'bold' }}>{doc.fileName}</p><p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Uploaded on {new Date(doc.date).toLocaleDateString()}</p></div>
                  <a href={doc.fileData} target="_blank" rel="noopener noreferrer" style={{ padding: '8px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', textDecoration: 'none' }}>View</a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'labs' && (
            <div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '20px' }}>
                <h3 style={{marginTop: 0}}>Pending Tests</h3>
                {pendingLabs.length > 0 ? (<ul style={{margin: 0, paddingLeft: '20px'}}>{[...new Set(pendingLabs)].map((lab, i) => <li key={i}>{lab}</li>)}</ul>) : <p>No pending lab tests.</p>}
              </div>
              <h3 style={{marginTop: 0}}>Completed Results</h3>
              {patientData.labResults && patientData.labResults.map(res => (
                <div key={res.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '10px' }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{res.testName}</p>
                  <p style={{ margin: '5px 0', fontSize: '18px' }}>Result: <strong>{res.value}</strong> {res.units}</p>
                  {res.range && <p style={{ margin: '5px 0', color: '#6b7280' }}>Standard Range: {res.range}</p>}
                  <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '14px' }}>Reported on {new Date(res.reportedDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 style={{ color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px' }}>Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (upcomingAppointments.map(apt => (
            <div key={apt.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
              <p style={{ margin: '5px 0' }}>at {apt.time} with Dr. {apt.doctor}</p>
              <button onClick={() => router.push(`/video-consultation?token=${apt.token}&name=${encodeURIComponent(loggedInPatient)}`)} style={{ marginTop: '10px', padding: '8px 12px', background: '#0e7490', color: 'white', border: 'none', borderRadius: '6px' }}>Join Call</button>
            </div>
          ))) : <p>No upcoming appointments.</p>}
          
          <h2 style={{ color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginTop: '30px' }}>Consultation History</h2>
          {patientData.prescriptions && patientData.prescriptions.length > 0 ? (patientData.prescriptions.map(p => (
            <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{new Date(p.date).toLocaleDateString()} with Dr. {p.doctor}</p>
                  <div style={{marginTop: '5px'}}>{getStatusPill(p.status)}</div>
                </div>
                <button onClick={() => handlePrintPrescription(p)} style={{ padding: '8px 12px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px' }}>Print</button>
              </div>
            </div>
          ))) : <p>No past consultations.</p>}
        </div>
      </div>
    </div>
  );
}
