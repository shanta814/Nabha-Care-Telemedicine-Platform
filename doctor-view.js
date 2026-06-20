import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import DoctorLogin from '../components/DoctorLogin';

const commonMeds = [
  { name: 'Paracetamol 500mg', dosage: '1 tablet SOS for fever/pain' },
  { name: 'Ibuprofen 400mg', dosage: '1 tablet BD after food' },
  { name: 'Cetirizine 10mg', dosage: '1 tablet OD at night' },
  { name: 'Amoxicillin 500mg', dosage: '1 capsule TDS for 5 days' },
];
const labTests = ['Complete Blood Count (CBC)', 'Lipid Profile', 'Thyroid Function Test (TFT)', 'Blood Sugar (Fasting & PP)', 'Urine Routine & Microscopy'];
const specialities = ['Cardiology', 'Neurology', 'Orthopedics', 'Gastroenterology', 'Dermatology', 'Emergency Medicine'];

export default function DoctorView() {
  const router = useRouter();
  const signatureUploadRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorSignature, setDoctorSignature] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [isPatientFileOpen, setPatientFileOpen] = useState(false);

  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [prescriptionText, setPrescriptionText] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [vitals, setVitals] = useState({ bp: '', temp: '', hr: '' });
  const [followUpDate, setFollowUpDate] = useState('');
  const [orderedLabs, setOrderedLabs] = useState(new Set());
  const [referral, setReferral] = useState({ to: '', reason: '' });
  
  const [symptoms, setSymptoms] = useState('');
  const [recommendationResult, setRecommendationResult] = useState({ recommendations: [], differentialDiagnosis: [], redFlagWarning: null, lab_recommendations: [] });
  const [isGenerating, setIsGenerating] = useState(false);

  const [patientFileData, setPatientFileData] = useState({ prescriptions: [], appointments: [], trackerEntries: [], documents: [] });
  const [currentPatientName, setCurrentPatientName] = useState('');
  const [isLoadingPatientFile, setIsLoadingPatientFile] = useState(false);
  const [patientFileTab, setPatientFileTab] = useState('history');

  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [completedAppointments, setCompletedAppointments] = useState(new Set());
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    // Load initial data only if authenticated
    if (isAuthenticated) {
      try {
        // Load templates and completed appointments
        const savedTemplates = JSON.parse(localStorage.getItem('prescriptionTemplates') || '[]');
        setTemplates(savedTemplates);
        const savedCompleted = JSON.parse(localStorage.getItem('completedAppointments') || '[]');
        setCompletedAppointments(new Set(savedCompleted));
        
        // Get logged-in doctor data from localStorage with detailed error checking
        const rawDoctorData = localStorage.getItem('doctorData');
        console.log('Raw doctor data:', rawDoctorData); // Debug log

        if (!rawDoctorData) {
          console.log('No doctor data found in localStorage');
          setIsAuthenticated(false);
          return;
        }

        const doctorData = JSON.parse(rawDoctorData);
        console.log('Parsed doctor data:', doctorData); // Debug log

        if (doctorData && doctorData.name) {
          setSelectedDoctor(doctorData.name);
          setDoctors([doctorData]); // Set doctors array to only contain the logged-in doctor
        } else {
          console.log('Invalid doctor data format:', doctorData);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error processing doctor data:', error);
        setIsAuthenticated(false);
      }
    }
  }, [isAuthenticated]);

  const fetchAppointments = async () => {
    if (!selectedDoctor || !isAuthenticated) return;
    
    try {
      const res = await fetch('/api/appointments');
      
      if (!res.ok) {
        throw new Error('Failed to fetch appointments');
      }
      
      const data = await res.json();
      // Filter appointments for the logged-in doctor
      const doctorAppointments = (data.appointments || []).filter(apt => apt.doctor === selectedDoctor);
      setAppointments(doctorAppointments);
      
      // Load doctor's signature
      const savedSignature = localStorage.getItem(`signature_${selectedDoctor}`);
      setDoctorSignature(savedSignature || null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setAppointments([]);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctor, isAuthenticated]);

  const handleSignatureUpload = (e) => {
    const file = e.target.files[0];
    if (file && selectedDoctor) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        localStorage.setItem(`signature_${selectedDoctor}`, base64String);
        setDoctorSignature(base64String);
        alert('Signature saved successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const openPrescriptionModal = (apt) => {
    setCurrentAppointment(apt);
    setPrescriptionModalOpen(true);
    setSymptoms('');
    setRecommendationResult({ recommendations: [], differentialDiagnosis: [], redFlagWarning: null, lab_recommendations: [] });
    setPrescriptionText('');
    setClinicalNotes('');
    setVitals({ bp: '', temp: '', hr: '' });
    setFollowUpDate('');
    setOrderedLabs(new Set());
    setReferral({ to: '', reason: '' });
  };

  const handleViewPatientFile = async (patientName) => {
    setCurrentPatientName(patientName);
    setPatientFileOpen(true);
    setIsLoadingPatientFile(true);
    setPatientFileTab('history');
    try {
      const [prescriptionsRes, appointmentsRes, trackerRes, documentsRes] = await Promise.all([
        fetch(`/api/prescriptions?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/appointments?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/tracker?patientName=${encodeURIComponent(patientName)}`),
        fetch(`/api/documents?patientName=${encodeURIComponent(patientName)}`)
      ]);
      const prescriptions = await prescriptionsRes.json();
      const appointments = await appointmentsRes.json();
      const trackerEntries = await trackerRes.json();
      const documents = await documentsRes.json();
      setPatientFileData({
        prescriptions: prescriptions.sort((a, b) => new Date(b.date) - new Date(a.date)),
        appointments: appointments.sort((a, b) => new Date(a.date) - new Date(b.date)),
        trackerEntries: trackerEntries.sort((a, b) => new Date(b.date) - new Date(a.date)),
        documents: documents.sort((a, b) => new Date(b.date) - new Date(a.date))
      });
    } catch (error) {
      console.error("Failed to fetch patient file", error);
      setPatientFileData({ prescriptions: [], appointments: [], trackerEntries: [], documents: [] });
    }
    setIsLoadingPatientFile(false);
  };

  const handleSendPrescription = async () => {
    if (!currentAppointment) return;
    const medicines = prescriptionText.split('\n').filter(line => line.trim() && !line.startsWith('(')).map(line => {
      const [name, dosage] = line.split('-').map(s => s.trim());
      return { name, dosage: dosage || 'As directed' };
    });

    await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientName: currentAppointment.patientName,
        token: currentAppointment.token,
        doctor: currentAppointment.doctor,
        medicines,
        notes: clinicalNotes,
        vitals: vitals,
        labOrders: Array.from(orderedLabs),
        referral: referral.to && referral.reason ? referral : null,
        signature: doctorSignature,
      }),
    });

    if (followUpDate) {
      await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: currentAppointment.patientName,
          doctor: currentAppointment.doctor,
          date: followUpDate,
          time: '10:00 AM',
          token: `TKN${Date.now()}`
        })
      });
      fetchAppointments();
    }

    alert('Clinical actions recorded successfully!');
    setPrescriptionModalOpen(false);
  };

  const handlePrintPrescription = () => {
    const medicines = prescriptionText.split('\n').filter(line => line.trim() && !line.startsWith('(')).map(line => {
      const [name, dosage] = line.split('-').map(s => s.trim());
      return { name, dosage: dosage || 'As directed' };
    });
    const data = {
      patientName: currentAppointment.patientName,
      doctor: currentAppointment.doctor,
      date: new Date().toISOString(),
      medicines,
      notes: clinicalNotes,
      vitals,
      labOrders: Array.from(orderedLabs),
      referral: referral.to && referral.reason ? referral : null,
      signature: doctorSignature,
    };
    window.open(`/print-prescription?data=${encodeURIComponent(JSON.stringify(data))}`, '_blank');
  };

  const handleGetRecommendations = async () => {
    if (!symptoms) return;
    setIsGenerating(true);
    setRecommendationResult({ recommendations: [], differentialDiagnosis: [], redFlagWarning: null, lab_recommendations: [] });
    
    // Mock patient context - in a real app, this would come from the patient's file
    const patientContext = {
        conditions: ['hypertension'] // Example
    };

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, patientContext }),
      });
      if (!res.ok) throw new Error('Failed to get recommendations');
      const data = await res.json();
      setRecommendationResult(data);
    } catch (error) {
      console.error(error);
      alert('Could not fetch AI recommendations.');
    }
    setIsGenerating(false);
  };

  const addMedicineToPrescription = (rec) => {
    const newText = `${prescriptionText}\n${rec.name} - ${rec.dosage || ''}`;
    setPrescriptionText(newText.trim());
  };
  
  const addReferral = (rec) => {
    setReferral({ to: rec.specialty, reason: rec.reason });
  };

  const addLabToOrders = (lab) => {
    const newLabs = new Set(orderedLabs);
    newLabs.add(lab);
    setOrderedLabs(newLabs);
  };

  const markAsComplete = (id) => {
    const newCompleted = new Set(completedAppointments);
    newCompleted.add(id);
    setCompletedAppointments(newCompleted);
    localStorage.setItem('completedAppointments', JSON.stringify(Array.from(newCompleted)));
  };

  const saveTemplate = () => {
    const name = prompt("Enter a name for this template:");
    if (name) {
      const newTemplate = { name, prescription: prescriptionText, notes: clinicalNotes };
      const updatedTemplates = [...templates, newTemplate];
      setTemplates(updatedTemplates);
      localStorage.setItem('prescriptionTemplates', JSON.stringify(updatedTemplates));
      alert(`Template "${name}" saved!`);
    }
  };

  const loadTemplate = (template) => {
    setPrescriptionText(template.prescription);
    setClinicalNotes(template.notes);
  };

  const toggleLabOrder = (lab) => {
    const newLabs = new Set(orderedLabs);
    if (newLabs.has(lab)) {
      newLabs.delete(lab);
    } else {
      newLabs.add(lab);
    }
    setOrderedLabs(newLabs);
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = dateFilter ? apt.date === dateFilter : true;
    return matchesSearch && matchesDate;
  });

  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(apt => apt.date === today).length;

  // Login handling is now moved to DoctorLogin component

  // Check for authentication status on component mount
  useEffect(() => {
    try {
      const doctorData = localStorage.getItem('doctorData');
      if (doctorData) {
        const doctor = JSON.parse(doctorData);
        if (doctor && doctor.name) {
          setIsAuthenticated(true);
          setSelectedDoctor(doctor.name);
        } else {
          localStorage.removeItem('doctorData');
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      localStorage.removeItem('doctorData');
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '30px', background: '#f9fafb', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ color: '#111827', fontSize: '32px' }}>Doctor's Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isAuthenticated && (
            <button 
              onClick={() => {
                localStorage.removeItem('doctorToken');
                localStorage.removeItem('doctorData');
                setIsAuthenticated(false);
              }} 
              style={{ padding: '10px 20px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
            >
              Logout
            </button>
          )}
          <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>Home</button>
        </div>
      </header>
      
      {isAuthenticated ? (
        <main>
          <div>
        <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div>
            <h3 style={{ fontWeight: 'bold' }}>Dr. {selectedDoctor}</h3>
          </div>
          <div>
            <input type="file" accept="image/*" ref={signatureUploadRef} onChange={handleSignatureUpload} style={{ display: 'none' }} />
            <button onClick={() => signatureUploadRef.current.click()} style={{ padding: '8px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '6px' }}>Manage Signature</button>
            {doctorSignature && <img src={doctorSignature} alt="Signature Preview" style={{ height: '30px', marginLeft: '10px', border: '1px solid #ccc' }} />}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '200px' }}>
            <h3 style={{ margin: 0, color: '#4b5563' }}>Total Appointments</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', margin: '10px 0 0 0' }}>{appointments.length}</p>
          </div>
          <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', minWidth: '200px' }}>
            <h3 style={{ margin: 0, color: '#4b5563' }}>Appointments Today</h3>
            <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937', margin: '10px 0 0 0' }}>{todaysAppointments}</p>
          </div>
        </div>

        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#1f2937' }}>Find Appointments</h3>
          <input type="text" placeholder="Search by patient name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '10px', flex: 1 }} />
          <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ padding: '10px' }} />
          <button onClick={() => { setSearchTerm(''); setDateFilter(''); }} style={{ padding: '10px', background: '#d1d5db', border: 'none', borderRadius: '6px' }}>Clear</button>
        </div>

        <h2 style={{ color: '#1f2937', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginTop: '30px' }}>Appointments for {selectedDoctor}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredAppointments.map(apt => (
          <div key={apt.id} style={{ background: completedAppointments.has(apt.id) ? '#e5e7eb' : 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', opacity: completedAppointments.has(apt.id) ? 0.6 : 1 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#3b82f6', fontSize: '18px' }}>Patient: {apt.patientName}</p>
              <p style={{ margin: '5px 0', color: '#6b7280' }}>Token: {apt.token}</p>
              <p style={{ margin: '5px 0' }}><strong>Date:</strong> {new Date(apt.date).toLocaleDateString()} at {apt.time}</p>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button onClick={() => router.push(`/video-consultation?token=${apt.token}&name=${encodeURIComponent(apt.doctor)}`)} style={{ flex: 1, padding: '10px', background: '#0e7490', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Join Call</button>
              <button onClick={() => openPrescriptionModal(apt)} style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Actions</button>
              <button onClick={() => handleViewPatientFile(apt.patientName)} style={{ flexBasis: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View Patient File</button>
              {!completedAppointments.has(apt.id) && <button onClick={() => markAsComplete(apt.id)} style={{ flexBasis: '100%', padding: '10px', background: '#4b5563', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Mark as Complete</button>}
            </div>
          </div>
        ))}
      </div>

      {isPrescriptionModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '1200px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div>
              <h3 style={{ marginTop: 0 }}>AI Recommendation Engine</h3>
              <input type="text" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Enter symptoms (e.g., fever, chest pain)" style={{ width: '100%', padding: '10px', marginBottom: '10px' }} />
              <button onClick={handleGetRecommendations} disabled={isGenerating} style={{ width: '100%', padding: '10px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px' }}>{isGenerating ? 'Generating...' : 'Get Recommendations'}</button>
              <div style={{ marginTop: '20px', maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>
                {recommendationResult.redFlagWarning && (
                  <div style={{ background: '#fecaca', border: '1px solid #f87171', padding: '15px', borderRadius: '6px', marginBottom: '15px', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#b91c1c', fontSize: '18px' }}>RED FLAG WARNING</p>
                    <p style={{ margin: '5px 0 0 0', color: '#b91c1c' }}>{recommendationResult.redFlagWarning}</p>
                  </div>
                )}
                {recommendationResult.differentialDiagnosis?.length > 0 && (
                  <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Differential Diagnosis:</p>
                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px' }}>
                      {recommendationResult.differentialDiagnosis.map((diag, i) => (
                        <li key={i}>{diag.name} ({diag.confidence}% confidence)</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recommendationResult.lab_recommendations?.length > 0 && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Recommended Labs:</p>
                    {recommendationResult.lab_recommendations.map((lab, i) => (
                      <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px'}}>
                        <span>{lab}</span>
                        <button onClick={() => addLabToOrders(lab)} style={{ fontSize: '12px', padding: '2px 6px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '4px' }}>+ Add</button>
                      </div>
                    ))}
                  </div>
                )}
                {recommendationResult.recommendations.map((rec, i) => (
                  <div key={i} style={{ background: rec.isReferral ? '#fff1f2' : (rec.isContraindicated ? '#fee2e2' : '#f3f4f6'), padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{rec.medicine}</p>
                    <p style={{ fontSize: '14px', margin: '5px 0' }}>{rec.guideline}</p>
                    {rec.isContraindicated && <p style={{color: '#ef4444', fontSize: '12px', fontWeight: 'bold', margin: '5px 0'}}>CONTRAINDICATED</p>}
                    <button onClick={() => rec.isReferral ? addReferral(rec) : addMedicineToPrescription({name: rec.medicine, dosage: ''})} disabled={rec.isContraindicated} style={{ fontSize: '12px', padding: '4px 8px', background: rec.isReferral ? '#f43f5e' : '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: rec.isContraindicated ? 'not-allowed' : 'pointer' }}>+ Add</button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>Prescription & Notes</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <button onClick={saveTemplate} style={{ flex: 1, padding: '8px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px' }}>Save as Template</button>
                <select onChange={(e) => loadTemplate(JSON.parse(e.target.value))} style={{ flex: 1, padding: '8px' }}>
                  <option value="">Load Template</option>
                  {templates.map(t => <option key={t.name} value={JSON.stringify(t)}>{t.name}</option>)}
                </select>
              </div>
              <textarea value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)} placeholder="Paracetamol - 1 tablet twice a day" style={{ width: '100%', height: '100px', padding: '10px', marginBottom: '10px' }} />
              <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Quick Add Common Medicines</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                {commonMeds.map(med => <button key={med.name} onClick={() => addMedicineToPrescription(med)} style={{ padding: '5px 10px', fontSize: '12px', background: '#e0e7ff', border: '1px solid #c7d2fe', borderRadius: '12px' }}>{med.name}</button>)}
              </div>
              <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Patient Vitals</h4>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input value={vitals.bp} onChange={e => setVitals({...vitals, bp: e.target.value})} placeholder="BP (e.g., 120/80)" style={{ flex: 1, padding: '8px' }} />
                <input value={vitals.temp} onChange={e => setVitals({...vitals, temp: e.target.value})} placeholder="Temp (°C)" style={{ flex: 1, padding: '8px' }} />
                <input value={vitals.hr} onChange={e => setVitals({...vitals, hr: e.target.value})} placeholder="HR (bpm)" style={{ flex: 1, padding: '8px' }} />
              </div>
              <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Clinical Notes (Private)</h4>
              <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Patient reported symptoms started 2 days ago..." style={{ width: '100%', height: '60px', padding: '10px' }} />
            </div>
            <div>
              <h3 style={{ marginTop: 0 }}>Clinical Actions</h3>
              <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Order Lab Tests</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                {labTests.map(lab => <label key={lab}><input type="checkbox" checked={orderedLabs.has(lab)} onChange={() => toggleLabOrder(lab)} /> {lab}</label>)}
              </div>
              <h4 style={{ marginTop: '10px', marginBottom: '5px' }}>Create Referral</h4>
              <select value={referral.to} onChange={e => setReferral({...referral, to: e.target.value})} style={{ width: '100%', padding: '8px', marginBottom: '5px' }}>
                <option value="">Refer to...</option>
                {specialities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea value={referral.reason} onChange={e => setReferral({...referral, reason: e.target.value})} placeholder="Reason for referral..." style={{ width: '100%', height: '60px', padding: '10px' }} />
              <h4 style={{ marginTop: '15px', marginBottom: '5px' }}>Schedule Follow-up</h4>
              <input type="date" value={followUpDate} onChange={e => setFollowUpDate(e.target.value)} style={{ width: '100%', padding: '8px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', position: 'absolute', bottom: '30px', right: '30px', width: 'calc(100% - 60px)' }}>
                <button onClick={() => setPrescriptionModalOpen(false)} style={{ padding: '10px 20px', background: '#d1d5db', border: 'none', borderRadius: '6px' }}>Cancel</button>
                <div>
                  <button onClick={handlePrintPrescription} style={{ padding: '10px 20px', background: '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', marginRight: '10px' }}>Print</button>
                  <button onClick={handleSendPrescription} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px' }}>Save & Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPatientFileOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 101 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '800px', maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, flexShrink: 0 }}>Patient File for {currentPatientName}</h3>
            <div style={{ borderBottom: '1px solid #ccc', marginBottom: '15px', flexShrink: 0 }}>
              <button onClick={() => setPatientFileTab('history')} style={{ padding: '10px', border: 'none', background: patientFileTab === 'history' ? '#e0e7ff' : 'transparent' }}>Consultation History</button>
              <button onClick={() => setPatientFileTab('tracker')} style={{ padding: '10px', border: 'none', background: patientFileTab === 'tracker' ? '#e0e7ff' : 'transparent' }}>Health Tracker</button>
              <button onClick={() => setPatientFileTab('documents')} style={{ padding: '10px', border: 'none', background: patientFileTab === 'documents' ? '#e0e7ff' : 'transparent' }}>Documents</button>
            </div>
            {isLoadingPatientFile ? <p>Loading file...</p> : (
              <div style={{ overflowY: 'auto', flexGrow: 1 }}>
                {patientFileTab === 'history' && (
                  <div>
                    <h4>Upcoming Appointments</h4>
                    {patientFileData.appointments.filter(a => new Date(a.date) >= new Date(today)).length > 0 ? patientFileData.appointments.filter(a => new Date(a.date) >= new Date(today)).map(a => (
                      <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}><p><strong>Date:</strong> {new Date(a.date).toLocaleDateString()} at {a.time} with Dr. {a.doctor}</p></div>
                    )) : <p>No upcoming appointments.</p>}
                    <h4>Consultation History</h4>
                    {patientFileData.prescriptions.length > 0 ? patientFileData.prescriptions.map(p => (
                      <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '15px', marginBottom: '15px' }}>
                        <p><strong>Date:</strong> {new Date(p.date).toLocaleString()}</p>
                        <p><strong>Doctor:</strong> {p.doctor}</p>
                        {p.vitals && (p.vitals.bp || p.vitals.temp || p.vitals.hr) && <p><strong>Vitals:</strong> BP: {p.vitals.bp || 'N/A'}, Temp: {p.vitals.temp || 'N/A'}, HR: {p.vitals.hr || 'N/A'}</p>}
                        {p.medicines?.length > 0 && <><strong>Medicines:</strong><ul>{p.medicines.map((m, i) => <li key={i}>{m.name} - {m.dosage}</li>)}</ul></>}
                        {p.labOrders?.length > 0 && <><strong>Lab Orders:</strong><ul>{p.labOrders.map((l, i) => <li key={i}>{l}</li>)}</ul></>}
                        {p.referral && <p><strong>Referral:</strong> To {p.referral.to} for: {p.referral.reason}</p>}
                        {p.notes && <p><strong>Notes:</strong> {p.notes}</p>}
                      </div>
                    )) : <p>No history found for this patient.</p>}
                  </div>
                )}
                {patientFileTab === 'tracker' && (
                  <div>
                    <h4>Patient-Logged Health Data</h4>
                    {patientFileData.trackerEntries.length > 0 ? patientFileData.trackerEntries.map(entry => (
                       <div key={entry.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
                        <p><strong>{new Date(entry.date).toLocaleString()}:</strong> {entry.vitalType} - <strong>{entry.value}</strong></p>
                        {entry.notes && <p style={{color: '#6b7280'}}>Notes: {entry.notes}</p>}
                      </div>
                    )) : <p>No health data logged by the patient.</p>}
                  </div>
                )}
                {patientFileTab === 'documents' && (
                  <div>
                    <h4>Patient-Uploaded Documents</h4>
                    {patientFileData.documents.length > 0 ? patientFileData.documents.map(doc => (
                       <div key={doc.id} style={{ border: '1px solid #e5e7eb', borderRadius: '6px', padding: '10px', marginBottom: '10px' }}>
                        <p><strong>{doc.fileName}</strong> (Uploaded on {new Date(doc.date).toLocaleDateString()})</p>
                        <a href={doc.fileData} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>View Document</a>
                      </div>
                    )) : <p>No documents uploaded by the patient.</p>}
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setPatientFileOpen(false)} style={{ marginTop: '20px', padding: '10px 20px', background: '#d1d5db', border: 'none', borderRadius: '6px', flexShrink: 0 }}>Close</button>
          </div>
        </div>
      )}
          </div>
        </main>
      ) : (
        <DoctorLogin 
          onLogin={(doctor) => {
            setIsAuthenticated(true);
            setSelectedDoctor(doctor.name);
          }}
        />
      )}
    </div>
  );
}
