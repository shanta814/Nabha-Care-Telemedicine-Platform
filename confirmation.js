import { useRouter } from 'next/router';
export default function Confirmation() {
  const router = useRouter();
  const { name, contact, date, timeSlot, token, doctorName, doctorSpecialty, hospitalName, hospitalLocation } = router.query;
  if (!name) { return <div style={{ padding: '50px', textAlign: 'center' }}><h1>Loading Confirmation...</h1></div>; }
  
  const proceedToForm = () => {
    router.push({ pathname: '/patient-form', query: { name, date, token } });
  };

  const joinVideoCall = () => {
    router.push(`/video-call/${token}`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
      <div style={{ color: '#059669', fontSize: '80px' }}>✓</div>
      <h1 style={{ color: '#059669', fontSize: '36px', marginBottom: '20px' }}>Appointment Confirmed!</h1>
      <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '30px', textAlign: 'left', display: 'inline-block', minWidth: '400px' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Your Token Number is:</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '48px', fontWeight: 'bold', color: '#059669' }}>{token}</p>
        </div>
        <p style={{ margin: '0 0 15px 0' }}><strong>Name:</strong> {name}</p>
        <p style={{ margin: '0 0 15px 0' }}><strong>Contact:</strong> {contact}</p>
        <p style={{ margin: '0 0 15px 0' }}><strong>Doctor:</strong> {doctorName} ({doctorSpecialty})</p>
        <p style={{ margin: '0 0 15px 0' }}><strong>Hospital:</strong> {hospitalName} ({hospitalLocation})</p>
        <p style={{ margin: '0 0 15px 0' }}><strong>Date:</strong> {new Date(date).toLocaleDateString('en-GB')}</p>
        <p style={{ margin: 0 }}><strong>Time:</strong> {timeSlot}</p>
      </div>
      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <button onClick={proceedToForm} style={{ padding: '15px 30px', background: '#d97706', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
          Fill Patient Form
        </button>
        <button onClick={joinVideoCall} style={{ padding: '15px 30px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
          Join Video Call
        </button>
      </div>
    </div>
  );
}
