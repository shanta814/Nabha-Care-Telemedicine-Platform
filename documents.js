import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileData);
    // Ensure documents array exists
    if (!data.documents) {
      data.documents = [];
    }
    return data;
  } catch (error) {
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [], hospitals: [], trackerEntries: [], documents: [] };
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
      const patientDocs = db.documents.filter(d => d.patientName === patientName);
      res.status(200).json(patientDocs);
    } else {
      res.status(400).json({ message: 'Patient name is required.' });
    }
  } else if (req.method === 'POST') {
    const { patientName, fileName, fileData } = req.body;
    if (!patientName || !fileName || !fileData) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const newDocument = {
      id: Date.now(),
      date: new Date().toISOString(),
      patientName,
      fileName,
      fileData, // Storing as base64
    };
    db.documents.push(newDocument);
    writeDb(db);
    res.status(201).json(newDocument);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
