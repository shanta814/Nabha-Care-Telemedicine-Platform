import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'db.json');
function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (!data.pharmacyStock) data.pharmacyStock = [];
    return data;
  } catch (error) {
    return { appointments: {}, patientForms: [], pharmacyStock: [] };
  }
}
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { name, price, stock } = req.body;
  if (!name || !price || !stock) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const db = readDb();
  const itemIndex = db.pharmacyStock.findIndex(item => item.name.toLowerCase() === name.toLowerCase());
  if (itemIndex > -1) {
    db.pharmacyStock[itemIndex].price = parseFloat(price);
    db.pharmacyStock[itemIndex].stock = parseInt(stock, 10);
  } else {
    db.pharmacyStock.push({
      name,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
    });
  }
  writeDb(db);
  res.status(200).json({ message: 'Stock updated successfully' });
}
