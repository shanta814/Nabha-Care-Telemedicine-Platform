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
  if (req.method === 'GET') {
    const inventory = readInventory();
    res.status(200).json(inventory);
  } else if (req.method === 'POST') {
    const inventory = readInventory();
    const newItem = { 
      id: Date.now(), 
      name: req.body.name,
      stock: parseInt(req.body.stock, 10),
      price: parseFloat(req.body.price)
    };
    inventory.push(newItem);
    writeInventory(inventory);
    res.status(201).json(newItem);
  } else if (req.method === 'PUT') {
    const inventory = readInventory();
    const { id, stock } = req.body;
    const itemIndex = inventory.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found' });
    }
    inventory[itemIndex].stock = parseInt(stock, 10);
    writeInventory(inventory);
    res.status(200).json(inventory[itemIndex]);
  } else if (req.method === 'DELETE') {
    let inventory = readInventory();
    const { id } = req.body;
    const newInventory = inventory.filter((item) => item.id !== id);
    if (inventory.length === newInventory.length) {
      return res.status(404).json({ message: 'Item not found' });
    }
    writeInventory(newInventory);
    res.status(200).json({ message: 'Item deleted successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
