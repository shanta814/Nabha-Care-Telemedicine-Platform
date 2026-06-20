import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileData);
    // Ensure trackerEntries array exists
    if (!data.trackerEntries) {
      data.trackerEntries = [];
    }
    return data;
  } catch (error) {
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [], hospitals: [], trackerEntries: [] };
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
      const patientEntries = db.trackerEntries.filter(p => p.patientName === patientName);
      res.status(200).json(patientEntries);
    } else {
      res.status(400).json({ message: 'Patient name is required.' });
    }
  } else if (req.method === 'POST') {
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      ...req.body,
    };
    db.trackerEntries.push(newEntry);
    writeDb(db);
    res.status(201).json(newEntry);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
