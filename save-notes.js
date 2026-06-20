import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { patientForms: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token, notes } = req.body;

  if (!token || notes === undefined) {
    return res.status(400).json({ message: 'Token and notes are required.' });
  }

  const db = readDb();
  const formIndex = db.patientForms.findIndex(form => form.token === token);

  if (formIndex === -1) {
    return res.status(404).json({ message: 'Patient form not found.' });
  }

  db.patientForms[formIndex].doctorNotes = notes;
  writeDb(db);

  res.status(200).json({ message: 'Notes saved successfully.' });
}
