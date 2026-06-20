import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    const data = JSON.parse(fileData);
    if (!data.hospitals) data.hospitals = [];
    return data;
  } catch (error) {
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [], hospitals: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  const db = readDb();

  switch (req.method) {
    case 'GET':
      res.status(200).json(db.hospitals);
      break;

    case 'POST':
      try {
        const newHospital = { id: Date.now(), bedsAvailable: 0, facilities: '', ...req.body };
        db.hospitals.push(newHospital);
        writeDb(db);
        res.status(201).json(newHospital);
      } catch (error) {
        res.status(500).json({ message: 'Error adding hospital' });
      }
      break;

    case 'PUT':
      try {
        const { id, bedsAvailable, facilities } = req.body;
        const hospitalIndex = db.hospitals.findIndex((h) => h.id === id);
        if (hospitalIndex > -1) {
          if (bedsAvailable !== undefined) {
            db.hospitals[hospitalIndex].bedsAvailable = parseInt(bedsAvailable, 10);
          }
          if (facilities !== undefined) {
            db.hospitals[hospitalIndex].facilities = facilities;
          }
          writeDb(db);
          res.status(200).json(db.hospitals[hospitalIndex]);
        } else {
          res.status(404).json({ message: 'Hospital not found' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Error updating hospital' });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.body;
        db.hospitals = db.hospitals.filter((h) => h.id !== id);
        writeDb(db);
        res.status(200).json({ message: 'Hospital removed successfully' });
      } catch (error) {
        res.status(500).json({ message: 'Error removing hospital' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
