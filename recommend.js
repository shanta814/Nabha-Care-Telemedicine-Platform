import guidelines from '../../local-guidelines.json';
import fs from 'fs';
import path from 'path';

function readJsonData(fileName) {
  try {
    const jsonPath = path.join(process.cwd(), fileName);
    const fileContent = fs.readFileSync(jsonPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Could not read or parse ${fileName}:`, error);
    return [];
  }
}

function getLocalRecommendations(symptoms, patientContext = {}) {
  const hospitals = readJsonData('hospitals.json');
  const doctors = readJsonData('doctors.json');
  const input = symptoms.toLowerCase();
  const query = input.toLowerCase();

  if (doctors.length > 0 && (query.includes('doctor') || query.includes('specialist'))) {
    const specialtyQuery = doctors.find(d => query.includes(d.specialty.toLowerCase()));
    if (specialtyQuery) {
      const doctorNames = doctors.filter(d => d.specialty.toLowerCase() === specialtyQuery.specialty.toLowerCase()).map(d => d.name).join(', ');
      return { answer: `Our ${specialtyQuery.specialty}(s) are: ${doctorNames}.` };
    }
    const doctorNames = doctors.map(d => `${d.name} (${d.specialty})`).join(', ');
    return { answer: `Our current doctors are: ${doctorNames}.` };
  }

  if (hospitals.length > 0) {
    const isGeneralHospitalQuery = query.includes('hospital') && !hospitals.some(h => query.includes(h.name.toLowerCase().split(' ')[0]));
    const isGeneralBedsQuery = (query.includes('beds') || query.includes('bed')) && query.includes('available') && !hospitals.some(h => query.includes(h.name.toLowerCase().split(' ')[0]));

    if (query.includes('hospitals connected') || isGeneralHospitalQuery) {
        const hospitalNames = hospitals.map(h => h.name).join(', ');
        return { answer: `The hospitals currently connected with our app are: ${hospitalNames}.` };
    }
    if (isGeneralBedsQuery) {
        const totalBeds = hospitals.reduce((sum, h) => sum + parseInt(h.beds, 10), 0);
        return { answer: `Across all our connected hospitals, there are a total of ${totalBeds} beds available.` };
    }
    
    const foundHospital = hospitals.find(h => query.includes(h.name.toLowerCase().split(' ')[0]));
    if (foundHospital) {
      let response = '';
      if (query.includes('bed') || query.includes('availability')) {
        response = `At ${foundHospital.name}, there are ${foundHospital.beds} beds available.`;
      } else if (query.includes('department') || query.includes('specialty')) {
        response = `The departments at ${foundHospital.name} are: ${foundHospital.departments}.`;
      } else if (query.includes('address') || query.includes('where')) {
        response = `${foundHospital.name} is located at ${foundHospital.address}.`;
      } else {
        response = `${foundHospital.name} provides the following departments: ${foundHospital.departments}. There are ${foundHospital.beds} beds available, and the hospital is located at ${foundHospital.address}.`;
      }
      return { answer: response };
    }
  }

  const inputKeywords = new Set(input.split(/[\s,]+/).filter(Boolean));
  const patientConditions = new Set(patientContext.conditions || []);
  let scoredConditions = [];
  let redFlagWarning = null;

  for (const condition in guidelines) {
    const { red_flags = [] } = guidelines[condition] || {};
    const foundRedFlag = red_flags.find(rf => inputKeywords.has(rf.keyword));
    if (foundRedFlag) {
      redFlagWarning = foundRedFlag.alert;
      break;
    }
  }

  for (const condition in guidelines) {
    const { keywords, negative_keywords = [], related_conditions = [] } = guidelines[condition] || {};
    if (!keywords || keywords.length === 0) continue;
    if (negative_keywords.some(k => inputKeywords.has(k))) continue;
    let matchScore = keywords.reduce((score, k) => inputKeywords.has(k) ? score + 1 : score, 0);
    if (related_conditions.some(rc => patientConditions.has(rc))) matchScore += 2;
    if (matchScore > 0) {
      const confidence = Math.min(100, Math.round((matchScore / keywords.length) * 100));
      scoredConditions.push({ condition, score: matchScore, confidence, data: guidelines[condition] });
    }
  }

  if (scoredConditions.length === 0) {
    return { answer: "I'm not sure how to help with that. You can ask about doctors, hospitals, or describe clinical symptoms." };
  }

  scoredConditions.sort((a, b) => b.score - a.score);
  let foundRecs = [];
  let labRecs = new Set();
  const addedMedicines = new Set();
  const addedReferrals = new Set();

  scoredConditions.forEach(({ data }) => {
    if (!data) return;
    if (data.recommendations) {
      data.recommendations.forEach(rec => {
        const isContraindicated = rec.contraindications && rec.contraindications.some(ci => patientConditions.has(ci));
        if (!addedMedicines.has(rec.medicine)) {
          foundRecs.push({ ...rec, isReferral: false, isContraindicated });
          addedMedicines.add(rec.medicine);
        }
      });
    }
    if (data.lab_recommendations) data.lab_recommendations.forEach(lab => labRecs.add(lab));
    const referral = data.referral;
    if (referral && !addedReferrals.has(referral.specialty)) {
      foundRecs.push({ isReferral: true, medicine: `Refer to ${referral.specialty}`, guideline: referral.reason, specialty: referral.specialty, reason: referral.reason });
      addedReferrals.add(referral.specialty);
    }
  });
  
  foundRecs.sort((a, b) => (a.isReferral === b.isReferral) ? 0 : a.isReferral ? 1 : -1);
  const differentialDiagnosis = scoredConditions.slice(0, 3).map(sc => ({ name: sc.condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), confidence: sc.confidence }));

  return {
    recommendations: foundRecs.slice(0, 5),
    lab_recommendations: Array.from(labRecs),
    differentialDiagnosis: differentialDiagnosis,
    redFlagWarning: redFlagWarning,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  const { symptoms, patientContext } = req.body;
  if (!symptoms) return res.status(400).json({ message: 'Symptoms are required' });
  try {
    const result = getLocalRecommendations(symptoms, patientContext);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in recommendation handler:', error);
    res.status(500).json({ message: 'Failed to get recommendations.' });
  }
}
