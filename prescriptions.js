import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    // If the file doesn't exist or is empty, return a default structure
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [], hospitals: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  const db = readDb();

  if (req.method === 'GET') {
    const { patientName } = req.query;
    if (patientName) {
      const patientPrescriptions = db.prescriptions.filter(p => p.patientName === patientName);
      res.status(200).json(patientPrescriptions);
    } else {
      res.status(200).json(db.prescriptions);
    }
  } else if (req.method === 'POST') {
    const newPrescription = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...req.body,
    };
    db.prescriptions.push(newPrescription);
    writeDb(db);
    res.status(201).json(newPrescription);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
