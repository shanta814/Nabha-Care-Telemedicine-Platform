import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/PharmacyAdmin.module.css';

const PharmacyAdmin = () => {
  const [inventory, setInventory] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', stock: '', price: '' });
  const [updateStock, setUpdateStock] = useState({});

  const fetchInventory = async () => {
    const res = await fetch('/api/pharmacy');
    const data = await res.json();
    setInventory(data);
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem({ ...newItem, [name]: value });
  };

  const handleUpdateStockChange = (id, value) => {
    setUpdateStock({ ...updateStock, [id]: value });
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.stock || !newItem.price) return;
    await fetch('/api/pharmacy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    setNewItem({ name: '', stock: '', price: '' });
    fetchInventory();
  };

  const handleUpdateItem = async (id) => {
    const stock = updateStock[id];
    if (stock === '' || stock === undefined || stock < 0) return;
    await fetch('/api/pharmacy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, stock }),
    });
    setUpdateStock({ ...updateStock, [id]: '' });
    fetchInventory();
  };

  const handleDeleteItem = async (id) => {
    await fetch('/api/pharmacy', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchInventory();
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Pharmacy Admin - NabhaCare</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Pharmacy Inventory Management</h1>
        
        <div className={styles.card}>
          <h2 className={styles.subtitle}>Add New Medicine</h2>
          <form onSubmit={handleAddItem} className={styles.form}>
            <input type="text" name="name" value={newItem.name} onChange={handleInputChange} placeholder="Medicine Name" required />
            <input type="number" name="stock" value={newItem.stock} onChange={handleInputChange} placeholder="Stock Quantity" required />
            <input type="number" step="0.01" name="price" value={newItem.price} onChange={handleInputChange} placeholder="Price" required />
            <button type="submit">Add Item</button>
          </form>
        </div>

        <div className={styles.card}>
          <h2 className={styles.subtitle}>Current Inventory</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Current Stock</th>
                <th>Price</th>
                <th>Update Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.stock}</td>
                  <td>₹{Number(item.price).toFixed(2)}</td>
                  <td className={styles.updateCell}>
                    <input 
                      type="number" 
                      value={updateStock[item.id] || ''}
                      onChange={(e) => handleUpdateStockChange(item.id, e.target.value)}
                      placeholder="New Qty" 
                    />
                    <button onClick={() => handleUpdateItem(item.id)} className={styles.updateButton}>Update</button>
                  </td>
                  <td>
                    <button onClick={() => handleDeleteItem(item.id)} className={styles.deleteButton}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default PharmacyAdmin;
