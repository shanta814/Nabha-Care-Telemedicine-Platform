import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'db.json');
function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { appointments: {} };
  }
}
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  const { name, contact, date, timeSlot, doctor, hospital } = req.body;
  if (!name || !contact || !date || !timeSlot || !doctor || !hospital) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const db = readDb();
  const appointmentsForDay = db.appointments[date] || [];
  const token = appointmentsForDay.length + 1;
  const newAppointment = { name, contact, date, timeSlot, token, doctor, hospital };
  db.appointments[date] = [...appointmentsForDay, newAppointment];
  writeDb(db);
  // Pass nested object properties to query params for easier use on confirmation page
  const responsePayload = {
    ...newAppointment,
    doctorName: doctor.name,
    doctorSpecialty: doctor.specialty,
    hospitalName: hospital.name,
    hospitalLocation: hospital.location,
  };
  delete responsePayload.doctor;
  delete responsePayload.hospital;
  res.status(201).json(responsePayload);
}
