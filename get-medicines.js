import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'db.json');
function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.pharmacyStock || [];
  } catch (error) {
    return [];
  }
}
export default function handler(req, res) {
  if (req.method === 'GET') {
    const medicines = readDb();
    res.status(200).json(medicines);
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
