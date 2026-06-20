import fs from 'fs';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'db.json');

function readDb() {
  try {
    const fileContent = fs.readFileSync(dbPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return { patientForms: [] };
  }
}

export default function handler(req, res) {
  const { token } = req.query;
  const db = readDb();
  const forms = db.patientForms || [];

  if (token) {
    // Find a single record by token
    const record = forms.find(form => form.token === token);
    if (record) {
      res.status(200).json(record);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } else {
    // Return all forms if no token is provided
    res.status(200).json(forms);
  }
}
