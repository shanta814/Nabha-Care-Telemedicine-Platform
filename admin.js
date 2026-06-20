import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const ManageInventory = () => {
  const [medicines, setMedicines] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingStocks, setEditingStocks] = useState({});

  const fetchMedicines = async () => {
    const res = await fetch('/api/pharmacy');
    const data = await res.json();
    setMedicines(data.medicines);
    const stockState = data.medicines.reduce((acc, med) => {
      acc[med.id] = med.stock;
      return acc;
    }, {});
    setEditingStocks(stockState);
  };

  useEffect(() => { fetchMedicines(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await fetch('/api/pharmacy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: parseFloat(price), stock: parseInt(stock) }),
    });
    setName(''); setPrice(''); setStock('');
    fetchMedicines();
  };

  const handleRemove = async (id) => {
    await fetch('/api/pharmacy', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchMedicines();
  };

  const handleStockChange = (id, value) => {
    setEditingStocks(prev => ({ ...prev, [id]: value }));
  };

  const handleUpdateStock = async (id) => {
    const newStock = editingStocks[id];
    const stockValue = parseInt(newStock, 10);
    if (isNaN(stockValue) || stockValue < 0) {
      alert("Please enter a valid stock number.");
      return;
    }
    await fetch('/api/pharmacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock: stockValue }),
    });
    alert('Stock updated successfully!');
    fetchMedicines();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px' }}>
      <div>
        <h3>Add Medicine</h3>
        <form onSubmit={handleAdd}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Medicine Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="Stock Quantity" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#1f2937', color: 'white', border: 'none', borderRadius: '6px' }}>Add to Inventory</button>
        </form>
      </div>
      <div>
        <h3>Current Inventory</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {medicines.map(med => (
            <li key={med.id} style={{ background: '#f9fafb', padding: '10px', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{med.name} - ₹{med.price}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '14px', color: '#4b5563' }}>Stock:</label>
                <input
                  type="number"
                  value={editingStocks[med.id] || ''}
                  onChange={(e) => handleStockChange(med.id, e.target.value)}
                  style={{ width: '70px', padding: '5px', textAlign: 'center', borderRadius: '4px', border: '1px solid #ccc' }}
                />
                <button onClick={() => handleUpdateStock(med.id)} style={{ background: '#dbeafe', color: '#1e40af', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Update</button>
                <button onClick={() => handleRemove(med.id)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '5px 10px', borderRadius: '4px' }}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const ViewPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/pharmacy');
      const data = await res.json();
      setPrescriptions(data.prescriptions);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h3>Incoming Prescriptions</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {prescriptions.map(p => (
          <li key={p.id} style={{ background: '#f9fafb', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <p style={{ margin: 0 }}><strong>Patient:</strong> {p.patientName} (Token: {p.token})</p>
            <p style={{ margin: '5px 0' }}><strong>Doctor:</strong> {p.doctor}</p>
            <p style={{ margin: '5px 0' }}><strong>Date:</strong> {p.date}</p>
            <ul style={{ paddingLeft: '20px', margin: '10px 0 0' }}>
              {p.medicines.map((med, i) => <li key={i}>{med.name} - {med.dosage}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function PharmacyAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('inventory');
  const tabStyle = { padding: '10px 20px', cursor: 'pointer', borderBottom: '2px solid transparent' };
  const activeTabStyle = { ...tabStyle, borderBottom: '2px solid #1f2937', fontWeight: 'bold' };

  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#1f2937', fontSize: '24px', margin: 0 }}>Pharmacy Admin</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Home</button>
      </header>
      <main style={{ padding: '40px', maxWidth: '1000px', margin: '40px auto' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '30px' }}>
          <nav style={{ display: 'flex' }}>
            <div onClick={() => setActiveTab('inventory')} style={activeTab === 'inventory' ? activeTabStyle : tabStyle}>Manage Inventory</div>
            <div onClick={() => setActiveTab('prescriptions')} style={activeTab === 'prescriptions' ? activeTabStyle : tabStyle}>View Prescriptions</div>
          </nav>
        </div>
        <div>
          {activeTab === 'inventory' && <ManageInventory />}
          {activeTab === 'prescriptions' && <ViewPrescriptions />}
        </div>
      </main>
    </div>
  );
}
