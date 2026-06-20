import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileData = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error("Error reading db.json:", error);
    return { doctors: [], hospitals: [] };
  }
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { message } = req.body;
  const lowerCaseMessage = message.toLowerCase();
  const db = readDb();

  let reply = "I'm sorry, I can only answer questions about doctor availability, bed availability, hospital facilities, and hospital locations. How can I help?";

  if (lowerCaseMessage.includes('doctor') || lowerCaseMessage.includes('doctors')) {
    const doctors = db.doctors || [];
    if (doctors.length > 0) {
      const doctorList = doctors.map(doc => `${doc.name} (${doc.specialty})`).join(', ');
      reply = `We have the following doctors available: ${doctorList}.`;
    } else {
      reply = "We currently do not have any doctors listed as available.";
    }
  } else if (lowerCaseMessage.includes('bed') || lowerCaseMessage.includes('beds')) {
    const hospitals = db.hospitals || [];
    if (hospitals.length > 0) {
      const bedList = hospitals.map(h => `${h.name}: ${h.bedsAvailable || 0} beds available`).join('; ');
      reply = `Here is the current bed availability: ${bedList}.`;
    } else {
      reply = "I could not find any information about hospital bed availability.";
    }
  } else if (lowerCaseMessage.includes('facility') || lowerCaseMessage.includes('facilities')) {
    const hospitals = db.hospitals || [];
    if (hospitals.length > 0) {
      const facilityList = hospitals.map(h => `${h.name} offers facilities like: ${h.facilities || 'General Care, Emergency Services'}`).join('. ');
      reply = `Here are the facilities at our hospitals: ${facilityList}.`;
    } else {
      reply = "I could not find any information about hospital facilities.";
    }
  } else if (lowerCaseMessage.includes('location of') || lowerCaseMessage.includes('address of')) {
    const hospitals = db.hospitals || [];
    let hospitalFound = false;
    hospitals.forEach(hospital => {
        if (lowerCaseMessage.includes(hospital.name.toLowerCase())) {
            reply = `The address of ${hospital.name} is: ${hospital.address}.`;
            hospitalFound = true;
        }
    });
    if (!hospitalFound) {
        reply = "I couldn't find that specific hospital. You can ask for a list of all available hospitals.";
    }
  } else if (lowerCaseMessage.includes('hospital') || lowerCaseMessage.includes('hospitals')) {
    const hospitals = db.hospitals || [];
    if (hospitals.length > 0) {
        const hospitalList = hospitals.map(h => `${h.name} (located at ${h.address})`).join('; ');
        reply = `We have the following hospitals available: ${hospitalList}. You can ask for the location of a specific hospital.`;
    } else {
        reply = "There are currently no hospitals listed in our system.";
    }
  }

  res.status(200).json({ reply });
}
