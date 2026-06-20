import { useTranslation } from '../context/i18n';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  const handleLanguageChange = (e) => {
    setLocale(e.target.value);
  };

  const style = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: 'white',
    fontSize: '16px',
    cursor: 'pointer',
    minWidth: '120px'
  };

  return (
    <select onChange={handleLanguageChange} value={locale} style={style}>
      <option value="en">English</option>
      <option value="hi">हिन्दी</option>
      <option value="pa">ਪੰਜਾਬੀ</option>
    </select>
  );
}
