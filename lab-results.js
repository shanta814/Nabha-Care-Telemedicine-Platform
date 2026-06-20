import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileData);
    if (!data.lab_results) data.lab_results = [];
    return data;
  } catch (error) {
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [], hospitals: [], trackerEntries: [], documents: [], lab_results: [] };
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
      const patientResults = db.lab_results.filter(r => r.patientName === patientName);
      res.status(200).json(patientResults);
    } else {
      res.status(400).json({ message: 'Patient name is required.' });
    }
  } else if (req.method === 'POST') {
    const { patientName, testName, value, units, range } = req.body;
    if (!patientName || !testName || !value) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const newResult = {
      id: Date.now(),
      patientName,
      testName,
      value,
      units,
      range,
      reportedDate: new Date().toISOString(),
    };
    db.lab_results.push(newResult);
    writeDb(db);
    res.status(201).json(newResult);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
