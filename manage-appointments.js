import fs from 'fs';
import path from 'path';
const dbPath = path.resolve(process.cwd(), 'db.json');
function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    const data = JSON.parse(fileContent);
    if (!data.appointments) data.appointments = {};
    return data;
  } catch (error) {
    return { appointments: {} };
  }
}
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}
export default function handler(req, res) {
  const db = readDb();
  switch (req.method) {
    case 'GET':
      const allAppointments = Object.keys(db.appointments).reduce((acc, date) => {
        return acc.concat(db.appointments[date]);
      }, []);
      res.status(200).json(allAppointments);
      break;
    case 'PUT': // Reschedule
      const { originalDate, token, newDate, newTimeSlot } = req.body;
      let appointmentToMove;
      let found = false;
      if (db.appointments[originalDate]) {
        const index = db.appointments[originalDate].findIndex(appt => appt.token === token);
        if (index > -1) {
          [appointmentToMove] = db.appointments[originalDate].splice(index, 1);
          found = true;
        }
      }
      if (found && appointmentToMove) {
        appointmentToMove.date = newDate;
        appointmentToMove.timeSlot = newTimeSlot;
        if (!db.appointments[newDate]) {
          db.appointments[newDate] = [];
        }
        db.appointments[newDate].push(appointmentToMove);
        if (db.appointments[originalDate].length === 0) {
          delete db.appointments[originalDate];
        }
        writeDb(db);
        res.status(200).json(appointmentToMove);
      } else {
        res.status(404).json({ message: 'Appointment not found on the original date.' });
      }
      break;
    case 'DELETE': // Cancel
      const { date, token: tokenToCancel } = req.body;
      if (db.appointments[date]) {
        const originalLength = db.appointments[date].length;
        db.appointments[date] = db.appointments[date].filter(appt => appt.token !== tokenToCancel);
        if (db.appointments[date].length < originalLength) {
          if (db.appointments[date].length === 0) {
            delete db.appointments[date];
          }
          writeDb(db);
          res.status(200).json({ message: 'Appointment cancelled' });
        } else {
          res.status(404).json({ message: 'Appointment token not found on this date' });
        }
      } else {
        res.status(404).json({ message: 'No appointments for this date' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
