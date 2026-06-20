import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
const dictionary = {
  fever: { hi: 'बुखार', pa: 'ਬੁਖਾਰ' },
  cough: { hi: 'खांसी', pa: 'ਖੰਘ' },
  headache: { hi: 'सिरदर्द', pa: 'ਸਿਰ ਦਰਦ' },
  pain: { hi: 'दर्द', pa: 'ਦਰਦ' },
  chest: { hi: 'छाती', pa: 'ਛਾਤੀ' },
  sore: { hi: 'खराश', pa: 'ਖਰਾਸ਼' },
  throat: { hi: 'गला', pa: 'ਗਲਾ' },
};
const translateInput = (text, lang) => {
  if (lang === 'en' || !text) return text;
  let translatedText = text;
  for (const word in dictionary) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (dictionary[word][lang]) {
      translatedText = translatedText.replace(regex, `${word} (${dictionary[word][lang]})`);
    }
  }
  return translatedText;
};
export default function Checker() {
  const [symptoms, setSymptoms] = useState('');
  const [translatedSymptoms, setTranslatedSymptoms] = useState('');
  const [language, setLanguage] = useState('en');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const translated = translateInput(symptoms, language);
    setTranslatedSymptoms(translated);
  }, [symptoms, language]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    const response = await fetch('/api/symptom-checker', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symptoms, language }) });
    const data = await response.json();
    setResult(data);
    setIsLoading(false);
  };
  const langButtonStyle = (lang) => ({ padding: '10px 20px', fontSize: '16px', cursor: 'pointer', border: '1px solid #d1d5db', background: language === lang ? '#4f46e5' : 'white', color: language === lang ? 'white' : 'black' });
  return (
    <div>
      <header style={{ background: 'white', padding: '15px 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#4f46e5', fontSize: '24px', margin: 0 }}>AI Symptom Checker</h1>
        <button onClick={() => router.push('/')} style={{ padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Back to Home</button>
      </header>
      <main style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ fontSize: '18px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>Choose Response Language</label>
            <div style={{ display: 'flex' }}>
              <button type="button" onClick={() => setLanguage('en')} style={{ ...langButtonStyle('en'), borderRadius: '6px 0 0 6px' }}>English</button>
              <button type="button" onClick={() => setLanguage('hi')} style={{ ...langButtonStyle('hi'), borderLeft: 0, borderRight: 0 }}>हिन्दी</button>
              <button type="button" onClick={() => setLanguage('pa')} style={{ ...langButtonStyle('pa'), borderRadius: '0 6px 6px 0' }}>ਪੰਜਾਬੀ</button>
            </div>
          </div>
          <label htmlFor="symptoms" style={{ fontSize: '18px', fontWeight: '600', display: 'block', marginBottom: '10px' }}>Describe your symptoms below</label>
          <textarea id="symptoms" value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Type in English... e.g., 'I have a high fever and a bad cough.'" required style={{ width: '100%', minHeight: '120px', padding: '15px', border: '1px solid #d1d5db', borderRadius: '8px 8px 0 0', fontSize: '16px', boxSizing: 'border-box', marginBottom: 0 }} />
          {language !== 'en' && (
            <div style={{ padding: '15px', background: '#f9fafb', border: '1px solid #d1d5db', borderTop: 'none', borderRadius: '0 0 8px 8px', color: '#6b7280', fontSize: '16px', lineHeight: '1.5', minHeight: '60px', boxSizing: 'border-box' }}>
              {translatedSymptoms || 'Translation will appear here...'}
            </div>
          )}
          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '15px', background: isLoading ? '#9ca3af' : '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}>{isLoading ? 'Analyzing...' : 'Analyze My Symptoms'}</button>
        </form>
        {result && (
          <div style={{ marginTop: '40px', padding: '30px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px' }}>{result.title}</h2>
            <div style={{ marginBottom: '15px' }}><strong style={{ display: 'block', marginBottom: '5px' }}>{result.condition_label}:</strong><span style={{ fontSize: '18px', color: '#4f46e5' }}>{result.condition}</span></div>
            <div style={{ marginBottom: '15px' }}><strong style={{ display: 'block', marginBottom: '5px' }}>{result.urgency_label}:</strong><span style={{ padding: '5px 10px', borderRadius: '6px', background: result.urgency_level === 'High' ? '#fee2e2' : '#ecfdf5', color: result.urgency_level === 'High' ? '#991b1b' : '#065f46' }}>{result.urgency}</span></div>
            <div style={{ marginBottom: '20px' }}><strong style={{ display: 'block', marginBottom: '5px' }}>{result.recommendation_label}:</strong><p style={{ margin: 0, lineHeight: '1.6' }}>{result.recommendation}</p></div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
              <strong style={{ display: 'block', marginBottom: '5px' }}>{result.medicine_label}:</strong>
              <p style={{ margin: 0, lineHeight: '1.6' }}>{result.medicine}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
