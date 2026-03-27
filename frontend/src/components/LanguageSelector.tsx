import React from 'react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'zh-Hant', label: '繁體中文', flag: '🇹🇼' },
  { code: 'zh-Hans', label: '简体中文', flag: '🇨🇳' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
  { code: 'el', label: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'hr', label: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', label: 'Српски', flag: '🇷🇸' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'cs', label: 'Čeština', flag: '🇨🇿' },
  { code: 'sk', label: 'Slovenčina', flag: '🇸🇰' },
  { code: 'hu', label: 'Magyar', flag: '🇭🇺' },
  { code: 'bg', label: 'Български', flag: '🇧🇬' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ur', label: 'اردو', flag: '🇵🇰' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'no', label: 'Norsk', flag: '🇳🇴' },
  { code: 'da', label: 'Dansk', flag: '🇩🇰' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', label: 'Suomi', flag: '🇫🇮' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'sq', label: 'Shqip', flag: '🇦🇱' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' }
];

export default function LanguageSelector({ onChange }: { onChange?: (lang: string) => void }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    if (onChange) onChange(lang);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, minWidth: 210 }}>
      <label htmlFor="lang-select" style={{ fontWeight: 600, marginBottom: 4, fontSize: '1rem', color: '#a7f3d0', textShadow: '0 0 10px rgba(74, 222, 128, 0.3)' }}>
        🌐 Language
      </label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
        <span style={{ fontSize: 24, marginRight: 2, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}>{current.flag}</span>
        <span style={{ fontWeight: 600, fontSize: '1.08rem', color: '#fff', letterSpacing: 0.5 }}>{current.label}</span>
      </div>
      <div style={{ position: 'relative', width: '100%' }}>
        <select
          id="lang-select"
          value={currentLang}
          onChange={handleChange}
          style={{
            fontSize: '1.1rem',
            padding: '0.5rem 2.5rem 0.5rem 1.5rem',
            borderRadius: 14,
            border: '1.5px solid rgba(255,255,255,0.2)',
            background: 'rgba(0,0,0,0.3)',
            boxShadow: '0 4px 24px 0 rgba(0, 0, 0, 0.2)',
            minWidth: 180,
            fontFamily: 'inherit',
            appearance: 'none',
            cursor: 'pointer',
            outline: 'none',
            transition: 'border 0.25s, box-shadow 0.25s, background 0.25s',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            color: '#fff',
            fontWeight: 500,
          }}
          onFocus={e => {
            e.target.style.border = '1.5px solid #4ade80';
            e.target.style.background = 'rgba(0,0,0,0.5)';
          }}
          onBlur={e => {
            e.target.style.border = '1.5px solid rgba(255,255,255,0.2)';
            e.target.style.background = 'rgba(0,0,0,0.3)';
          }}
          aria-label="Select language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code} style={{ fontSize: '1.1rem', color: '#333' }}>
              {l.flag} {l.label}
            </option>
          ))}
        </select>
        {/* Custom dropdown arrow */}
        <span style={{
          position: 'absolute',
          right: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          fontSize: 14,
          color: '#4ade80',
          textShadow: '0 2px 8px #22d3ee33',
        }}>
          ▼
        </span>
      </div>
    </div>
  );
} 