import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function PrintPrescription() {
  const router = useRouter();
  const { data } = router.query;
  let prescription = null;

  if (data) {
    try {
      prescription = JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse prescription data", e);
    }
  }

  useEffect(() => {
    if (prescription) {
      setTimeout(() => window.print(), 1000);
    }
  }, [prescription]);

  if (!prescription) {
    return <div>Loading prescription... If this page does not print, please close it and try again.</div>;
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'serif', color: 'black', background: 'white' }}>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      <h1 style={{ textAlign: 'center', margin: 0 }}>Consultation Record</h1>
      <p style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '15px' }}>Dr. {prescription.doctor}</p>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <div><strong>Patient:</strong> {prescription.patientName}</div>
        <div><strong>Date:</strong> {new Date(prescription.date).toLocaleDateString()}</div>
      </div>

      <div style={{ marginTop: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
        <strong>Vitals:</strong>
        <span style={{ marginLeft: '20px' }}>BP: {prescription.vitals?.bp || 'N/A'}</span>
        <span style={{ marginLeft: '20px' }}>Temp: {prescription.vitals?.temp ? `${prescription.vitals.temp}°C` : 'N/A'}</span>
        <span style={{ marginLeft: '20px' }}>Heart Rate: {prescription.vitals?.hr ? `${prescription.vitals.hr} bpm` : 'N/A'}</span>
      </div>

      {prescription.medicines?.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '10px' }}>Rx (Prescription)</h2>
          <div>
            {prescription.medicines.map((med, i) => (
              <div key={i} style={{ borderBottom: '1px dashed #eee', padding: '10px 0' }}>
                <p style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{med.name}</p>
                <p style={{ margin: '5px 0 0 20px' }}>{med.dosage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {prescription.labOrders?.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '10px' }}>Lab Investigations</h2>
          <ul>
            {prescription.labOrders.map((lab, i) => <li key={i} style={{ fontSize: '16px', margin: '5px 0' }}>{lab}</li>)}
          </ul>
        </div>
      )}

      {prescription.referral && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ marginBottom: '10px' }}>Referral</h2>
          <p>Patient is referred to <strong>{prescription.referral.to}</strong>.</p>
          <p><strong>Reason:</strong> {prescription.referral.reason}</p>
        </div>
      )}

      {prescription.notes && (
        <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <strong>Doctor's Notes:</strong>
          <p>{prescription.notes}</p>
        </div>
      )}

      <div style={{ marginTop: '100px', textAlign: 'right' }}>
        {prescription.signature ? (
          <img src={prescription.signature} alt="Doctor's Signature" style={{ maxWidth: '200px', maxHeight: '80px', display: 'block', marginLeft: 'auto' }} />
        ) : (
          <div style={{ height: '80px' }}></div>
        )}
        <p style={{ borderTop: '1px solid black', paddingTop: '5px', margin: 0 }}>Signature, Dr. {prescription.doctor}</p>
      </div>
      <button className="no-print" onClick={() => window.print()} style={{ position: 'fixed', top: '20px', right: '20px', padding: '10px' }}>Print</button>
    </div>
  );
}
