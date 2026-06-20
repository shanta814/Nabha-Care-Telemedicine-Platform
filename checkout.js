import fs from 'fs';
import path from 'path';

const inventoryFilePath = path.join(process.cwd(), 'pharmacy-inventory.json');

function readInventory() {
  try {
    const fileContent = fs.readFileSync(inventoryFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return [];
  }
}

function writeInventory(data) {
  fs.writeFileSync(inventoryFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { cart } = req.body;
  if (!cart || cart.length === 0) {
    return res.status(400).json({ message: 'Cart is empty' });
  }

  const inventory = readInventory();
  let error = false;

  cart.forEach(cartItem => {
    const itemIndex = inventory.findIndex(invItem => invItem.id === cartItem.id);
    if (itemIndex !== -1) {
      if (inventory[itemIndex].stock >= cartItem.quantity) {
        inventory[itemIndex].stock -= cartItem.quantity;
      } else {
        error = true;
      }
    } else {
      error = true;
    }
  });

  if (error) {
    return res.status(400).json({ message: 'Not enough stock for one or more items.' });
  }

  writeInventory(inventory);
  res.status(200).json({ message: 'Order placed and stock updated successfully!' });
}
