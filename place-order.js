import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(fileData);
    const cartItems = req.body;

    if (!cartItems || !Array.isArray(cartItems)) {
      return res.status(400).json({ message: 'Invalid cart data' });
    }

    cartItems.forEach(cartItem => {
      const dbItem = db.pharmacy.find(p => p.name === cartItem.name);
      if (dbItem) {
        dbItem.quantity -= cartItem.orderQuantity;
        if (dbItem.quantity < 0) {
          dbItem.quantity = 0; 
        }
      }
    });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    res.status(200).json({ message: 'Order placed and stock updated successfully' });

  } catch (error) {
    console.error('Error processing order:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
