import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'db.json');
function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (!Array.isArray(data.patientForms)) {
      data.patientForms = [];
    }
    return data;
  } catch (error) {
    return { appointments: {}, patientForms: [] };
  }
}
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const db = readDb();
  const newForm = req.body;
  db.patientForms.push(newForm);
  writeDb(db);
  res.status(201).json({ message: 'Form submitted successfully' });
}
