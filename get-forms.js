import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'db.json');
function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { appointments: {}, patientForms: [] };
  }
}
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const db = readDb();
  res.status(200).json(db.patientForms || []);
}
