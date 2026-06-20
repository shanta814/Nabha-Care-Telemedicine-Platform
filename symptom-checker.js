const translations = {
  cardiac: {
    en: { title: 'Analysis Result', condition_label: 'Possible Condition', urgency_label: 'Urgency', recommendation_label: 'Recommendation', medicine_label: 'Medicine Note', condition: 'Potential Cardiac Event', urgency: 'High', urgency_level: 'High', recommendation: 'This is a medical emergency. Please call your local emergency number or go to the nearest hospital immediately.', medicine: 'Aspirin may be recommended by emergency services. Do not self-medicate.' },
    hi: { title: 'विश्लेषण परिणाम', condition_label: 'संभावित स्थिति', urgency_label: 'तत्काल आवश्यकता', recommendation_label: 'सिफारिश', medicine_label: 'दवा नोट', condition: 'संभावित कार्डियक घटना', urgency: 'उच्च', urgency_level: 'High', recommendation: 'यह एक मेडिकल इमरजेंसी है। कृपया तुरंत अपने स्थानीय आपातकालीन नंबर पर कॉल करें या नजदीकी अस्पताल जाएं।', medicine: 'आपातकालीन सेवाएं एस्पिरिन की सिफारिश कर सकती हैं। खुद से दवा न लें।' },
    pa: { title: 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ', condition_label: 'ਸੰਭਾਵੀ ਸਥਿਤੀ', urgency_label: 'ਤੁਰੰਤ ਲੋੜ', recommendation_label: 'ਸਿਫਾਰਸ਼', medicine_label: 'ਦਵਾਈ ਨੋਟ', condition: 'ਸੰਭਾਵੀ ਦਿਲ ਦੀ ਘਟਨਾ', urgency: 'ਉੱਚ', urgency_level: 'High', recommendation: 'ਇਹ ਇੱਕ ਮੈਡੀਕਲ ਐਮਰਜੈਂਸੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਤੁਰੰਤ ਆਪਣੇ ਸਥਾਨਕ ਐਮਰਜੈਂਸੀ ਨੰਬਰ \'ਤੇ ਕਾਲ ਕਰੋ ਜਾਂ ਨਜ਼ਦੀਕੀ ਹਸਪਤਾਲ ਜਾਓ।', medicine: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਦੁਆਰਾ ਐਸਪਰੀਨ ਦੀ ਸਿਫਾਰਸ਼ ਕੀਤੀ ਜਾ ਸਕਦੀ ਹੈ। ਆਪਣੇ ਆਪ ਦਵਾਈ ਨਾ ਲਓ।' }
  },
  viral: {
    en: { title: 'Analysis Result', condition_label: 'Possible Condition', urgency_label: 'Urgency', recommendation_label: 'Recommendation', medicine_label: 'Suggested Medicine', condition: 'Possible Viral Infection (e.g., Flu)', urgency: 'Medium', urgency_level: 'Medium', recommendation: 'Rest, drink fluids, and monitor symptoms. Consider a telehealth appointment if symptoms worsen.', medicine: 'Paracetamol or Ibuprofen for fever and pain, as per package instructions. Consult a doctor for cough syrup.' },
    hi: { title: 'विश्लेषण परिणाम', condition_label: 'संभावित स्थिति', urgency_label: 'तत्काल आवश्यकता', recommendation_label: 'सिफारिश', medicine_label: 'सुझाई गई दवा', condition: 'संभावित वायरल संक्रमण (जैसे, फ्लू)', urgency: 'मध्यम', urgency_level: 'Medium', recommendation: 'आराम करें, तरल पदार्थ पिएं, और लक्षणों की निगरानी करें। यदि लक्षण बिगड़ते हैं तो डॉक्टर से सलाह लें।', medicine: 'बुखार और दर्द के लिए पैरासिटामोल या इबुप्रोफेन। खांसी की दवाई के लिए डॉक्टर से सलाह लें।' },
    pa: { title: 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ', condition_label: 'ਸੰਭਾਵੀ ਸਥਿਤੀ', urgency_label: 'ਤੁਰੰਤ ਲੋੜ', recommendation_label: 'ਸਿਫਾਰਸ਼', medicine_label: 'ਸੁਝਾਈ ਗਈ ਦਵਾਈ', condition: 'ਸੰਭਾਵੀ ਵਾਇਰਲ ਇਨਫੈਕਸ਼ਨ (ਜਿਵੇਂ, ਫਲੂ)', urgency: 'ਦਰਮਿਆਨਾ', urgency_level: 'Medium', recommendation: 'ਆਰਾਮ ਕਰੋ, ਤਰਲ ਪਦਾਰਥ ਪੀਓ, ਅਤੇ ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ। ਜੇ ਲੱਛਣ ਵਿਗੜਦੇ ਹਨ ਤਾਂ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।', medicine: 'ਬੁਖਾਰ ਅਤੇ ਦਰਦ ਲਈ ਪੈਰਾਸੀਟਾਮੋਲ ਜਾਂ ਆਈਬਿਊਪਰੋਫ਼ੈਨ। ਖੰਘ ਦੇ ਸ਼ਰਬਤ ਲਈ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਕਰੋ।' }
  },
  general: {
    en: { title: 'Analysis Result', condition_label: 'Possible Condition', urgency_label: 'Urgency', recommendation_label: 'Recommendation', medicine_label: 'Suggested Medicine', condition: 'General Symptoms', urgency: 'Low', urgency_level: 'Low', recommendation: 'Monitor your symptoms. If they persist or worsen, consider booking a non-urgent appointment with a doctor.', medicine: 'No specific medicine recommended without a diagnosis. Avoid self-medication.' },
    hi: { title: 'विश्लेषण परिणाम', condition_label: 'संभावित स्थिति', urgency_label: 'तत्काल आवश्यकता', recommendation_label: 'सिफारिश', medicine_label: 'सुझाई गई दवा', condition: 'सामान्य लक्षण', urgency: 'कम', urgency_level: 'Low', recommendation: 'अपने लक्षणों की निगरानी करें। यदि वे बने रहते हैं, तो डॉक्टर से अपॉइंटमेंट बुक करने पर विचार करें।', medicine: 'निदान के बिना कोई विशिष्ट दवा की सिफारिश नहीं की जाती है। स्व-दवा से बचें।' },
    pa: { title: 'ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜਾ', condition_label: 'ਸੰਭਾਵੀ ਸਥਿਤੀ', urgency_label: 'ਤੁਰੰਤ ਲੋੜ', recommendation_label: 'ਸਿਫਾਰਸ਼', medicine_label: 'ਸੁਝਾਈ ਗਈ ਦਵਾਈ', condition: 'ਆਮ ਲੱਛਣ', urgency: 'ਘੱਟ', urgency_level: 'Low', recommendation: 'ਆਪਣੇ ਲੱਛਣਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ। ਜੇ ਉਹ ਬਣੇ ਰਹਿੰਦੇ ਹਨ, ਤਾਂ ਡਾਕਟਰ ਨਾਲ ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰਨ ਬਾਰੇ ਵਿਚਾਰ ਕਰੋ।', medicine: 'ਨਿਦਾਨ ਤੋਂ ਬਿਨਾਂ ਕੋਈ ਖਾਸ ਦਵਾਈ ਦੀ ਸਿਫਾਰਸ਼ ਨਹੀਂ ਕੀਤੀ ਜਾਂਦੀ। ਸਵੈ-ਦਵਾਈ ਤੋਂ ਬਚੋ।' }
  }
};
export default function handler(req, res) {
  if (req.method !== 'POST') { return res.status(405).json({ message: 'Method not allowed' }); }
  const { symptoms, language = 'en' } = req.body;
  let conditionKey;
  if (symptoms.toLowerCase().includes('chest pain')) { conditionKey = 'cardiac'; }
  else if (symptoms.toLowerCase().includes('fever') && symptoms.toLowerCase().includes('cough')) { conditionKey = 'viral'; }
  else { conditionKey = 'general'; }
  const response = translations[conditionKey][language] || translations[conditionKey]['en'];
  setTimeout(() => { res.status(200).json(response); }, 1000);
}
