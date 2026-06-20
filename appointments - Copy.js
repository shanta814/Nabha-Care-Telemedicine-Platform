import fs from 'fs';
import path from 'path';


const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    return { doctors: [], pharmacy: [], prescriptions: [], appointments: [], hospitals: [] };
  }
}

function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default async function handler(req, res) {
  // Read database
  const db = readDb();

  if (req.method === 'GET') {
    const { patientName } = req.query;
    // Get appointments based on query
    const appointments = patientName 
      ? db.appointments.filter(a => a.patientName === patientName)
      : db.appointments;

    res.status(200).json({
      success: true,
      appointments
    });

  } else if (req.method === 'POST') {
    const newAppointment = {
      id: Date.now(),
      ...req.body,
      doctor: decodedToken.name // Ensure appointment is created for authenticated doctor
    };
    
    db.appointments.push(newAppointment);
    writeDb(db);
    
    res.status(201).json({
      success: true,
      appointment: newAppointment
    });
    
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      message: `Method ${req.method} Not Allowed`
    });
  }
}
