import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileData);
    if (!data.doctors) data.doctors = [];
    return data;
  } catch (error) {
    console.error("Error reading or parsing db.json:", error);
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  const db = readDb();

  switch (req.method) {
    case 'GET':
      res.status(200).json(db.doctors);
      break;

    case 'POST':
      try {
        const newDoctor = { id: Date.now(), ...req.body };
        db.doctors.push(newDoctor);
        writeDb(db);
        res.status(201).json(newDoctor);
      } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).json({ message: 'Error adding doctor' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ message: 'Doctor ID is required' });
        }
        const initialLength = db.doctors.length;
        db.doctors = db.doctors.filter((doc) => doc.id !== id);
        if (db.doctors.length === initialLength) {
          return res.status(404).json({ message: 'Doctor not found' });
        }
        writeDb(db);
        res.status(200).json({ message: 'Doctor removed successfully' });
      } catch (error) {
        console.error('Error removing doctor:', error);
        res.status(500).json({ message: 'Error removing doctor' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
