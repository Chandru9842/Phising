import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { translations, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from './translations';
import { setApiLanguage } from '../services/api';

const STORAGE_KEY = 'phishshield_language';

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: () => '',
  languages: SUPPORTED_LANGUAGES,
  localizeVerdict: (v) => v,
  localizeDirective: (d) => d,
  localizeRecommendation: (t, c) => t,
  localizeReason: (r) => r
});

/**
 * Resolves a dot-notated key path within an object
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Pattern-based reason localizer for common backend risk engine strings
 */
function translateReasonPattern(reason, language, t) {
  if (!reason || typeof reason !== 'string') return reason;

  // 1. Zero-Trust Verified
  if (reason.includes('Zero-Trust Verified') || reason.includes('authenticated canonical domain')) {
    if (language === 'ta') return 'ஜீரோ-டிரஸ்ட் சரிபார்க்கப்பட்டது: அங்கீகரிக்கப்பட்ட அதிகாரப்பூர்ವ வங்கி டொமைனுடன் பொருந்துகிறது.';
    if (language === 'te') return 'జీరో-ట్రస్ట్ ధృవీకరించబడింది: ప్రామాణీకరించబడిన అధికారిక బ్యాంక్ డొమైన్‌తో సరిపోలుతుంది.';
    if (language === 'kn') return 'ಝೀರೋ-ಟ್ರಸ್ಟ್ ಪರಿಶೀಲಿಸಲಾಗಿದೆ: ದೃಢೀಕರಿಸಲ್ಪಟ್ಟ ಅಧಿಕೃತ ಬ್ಯಾಂಕ್ ಡೊಮೇನ್‌ಗೆ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ.';
    if (language === 'ml') return 'സീറോ-ട്രസ്റ്റ് സ്ഥിരീകരിച്ചു: അംഗീകൃത ഔദ്യോഗിക ബാങ്ക് ഡൊമെയ്‌നുമായി പൊരുത്തപ്പെടുന്നു.';
  }

  // 2. Registered in RBI / Indian Banking Registry
  if (reason.includes('Reserve Bank of India') || reason.includes('Indian Banking Registry')) {
    if (language === 'ta') return 'டொமைன் இந்திய ரிசர்வ் வங்கி / இந்திய வங்கிப் பதிவேட்டில் பதிவு செய்யப்பட்டுள்ளது.';
    if (language === 'te') return 'డొమైన్ రిజర్వ్ బ్యాంక్ ఆఫ్ ఇండియా / ఇండియన్ బ్యాంకింగ్ రిజిస్ట్రీలో నమోదు చేయబడింది.';
    if (language === 'kn') return 'ಡೊಮೇನ್ ಭಾರತೀಯ ರಿಸರ್ವ್ ಬ್ಯಾಂಕ್ / ಭಾರತೀಯ ಬ್ಯಾಂಕಿಂಗ್ ರಿಜಿಸ್ಟ್ರಿಯಲ್ಲಿ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದೆ.';
    if (language === 'ml') return 'ഡൊമെയ്ൻ റിസർവ് ബാങ്ക് ഓഫ് ഇന്ത്യ / ഇന്ത്യൻ ബാങ്കിംഗ് രജിസ്ട്രിയിൽ രേഖപ്പെടുത്തിയിട്ടുണ്ട്.';
  }

  // 3. Severe Brand Impersonation
  if (reason.includes('Severe Brand Impersonation') || reason.includes('spoofing')) {
    if (language === 'ta') return 'கடுமையான பிராண்ட் ஆள்மாறாட்டம்: நம்பகமற்ற டொமைன் மூலம் வங்கியை போலியாக நகலெடுக்கிறது.';
    if (language === 'te') return 'తీవ్రమైన బ్రాండ్ అనుకరణ: నమ్మదగని డొమైన్ ద్వారా బ్యాంక్ బ్రాండ్‌ను మోసపూరితంగా వాడుతోంది.';
    if (language === 'kn') return 'ತೀವ್ರ ಬ್ರ್ಯಾಂಡ್ ಸೋಗು: ನಂಬಲರ್ಹವಲ್ಲದ ಡೊಮೇನ್ ಮೂಲಕ ಅಧಿಕೃತ ಬ್ಯಾಂಕನ್ನು ವಂಚಿಸುತ್ತಿದೆ.';
    if (language === 'ml') return 'ഗുരുതരമായ ബ്രാൻഡ് വ്യാജപതിപ്പ്: സുരക്ഷിതമല്ലാത്ത ഡൊമെയ്ൻ വഴി ബാങ്കിന്റെ പേര് വ്യാജമായി ഉപയോഗിക്കുന്നു.';
  }

  // 4. Classified as low risk
  if (reason.includes('low risk') || reason.includes('Low risk')) {
    if (language === 'ta') return 'ரேண்டம் ஃபாரஸ்ட் வகைப்படுத்தியால் குறைந்த ஆபத்து என மதிப்பிடப்பட்டுள்ளது.';
    if (language === 'te') return 'రాండమ్ ఫారెస్ట్ క్లాసిఫైయర్ ద్వారా తక్కువ ప్రమాదంగా వర్గీకరించబడింది.';
    if (language === 'kn') return 'ರಾಂಡಮ್ ಫಾರೆಸ್ಟ್ ವರ್ಗೀಕರಣದಿಂದ ಕಡಿಮೆ ಅಪಾಯವೆಂದು ನಿರ್ಣಯಿಸಲಾಗಿದೆ.';
    if (language === 'ml') return 'റാൻഡം ഫോറസ്റ്റ് തരംതിരിവിലൂടെ കുറഞ്ഞ അപകടസാധ്യതയുള്ളതായി കണ്ടെത്തി.';
  }

  // 5. Critical phishing probability
  if (reason.includes('Critical phishing probability') || reason.includes('high phishing risk')) {
    if (language === 'ta') return 'கட்டமைப்பு அம்சங்கள் முழுவதும் தீவிர ஃபிஷிங் நிகழ்தகவு கண்டறியப்பட்டது.';
    if (language === 'te') return 'నిర్మాణ లక్షణాల ఆధారంగా తీవ్రమైన ఫిషింగ్ ముప్పు సంభావ్యత గుర్తించబడింది.';
    if (language === 'kn') return 'ರಚನಾತ್ಮಕ ವೈಶಿಷ್ಟ್ಯಗಳಾದ್ಯಂತ ತೀವ್ರ ಫಿಶಿಂಗ್ ಅಪಾಯದ ಸಂಭವನೀಯತೆ ಪತ್ತೆಯಾಗಿದೆ.';
    if (language === 'ml') return 'ഘടനാപരമായ സവിശേഷതകളിലൂടെ ഗുരുതരമായ ഫിഷിംഗ് സാധ്യത കണ്ടെത്തി.';
  }

  // 6. Direct IP address
  if (reason.includes('Direct IP address') || reason.includes('hostname')) {
    if (language === 'ta') return 'URL-ல் நேரடி ஐபி முகவரி பயன்படுத்தப்பட்டுள்ளது: இது மோசடி வலைத்தளங்களின் பொதுவான அறிகுறியாகும்.';
    if (language === 'te') return 'URL హోస్ట్‌నేమ్‌లో ప్రత్యక్ష IP చిరునామా: ఫిషింగ్ సైట్లకు ఇది ఒక సాధారణ లక్షణం.';
    if (language === 'kn') return 'URL ಹೋಸ್ಟ್‌ನೇಮ್‌ನಲ್ಲಿ ನೇರ IP ವಿಳಾಸ: ಫಿಶಿಂಗ್ ಸೈಟ್‌ಗಳಲ್ಲಿ ಇದು ಸಾಮಾನ್ಯವಾಗಿದೆ.';
    if (language === 'ml') return 'URL ഹോസ്റ്റ്‌നെയിമിൽ നേരിട്ടുള്ള IP വിലാസം: ഫിഷിംഗ് സൈറ്റുകളുടെ സാധാരണ സ്വഭാവമാണിത്.';
  }

  return reason;
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved;
      }
    } catch (e) {
      console.warn('Unable to access localStorage for language:', e);
    }
    return DEFAULT_LANGUAGE;
  });

  const setLanguage = useCallback((newLang) => {
    if (!SUPPORTED_LANGUAGES.some((l) => l.code === newLang)) {
      console.warn(`Unsupported language code: ${newLang}`);
      return;
    }
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Unable to persist language to localStorage:', e);
    }
    // Set document lang attribute for accessibility and screen readers
    document.documentElement.lang = newLang;
    // Update API client Accept-Language header
    setApiLanguage(newLang);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    setApiLanguage(language);
  }, [language]);

  const t = useCallback(
    (keyPath, params = {}, defaultText = '') => {
      // 1. Try selected language
      let val = getNestedValue(translations[language], keyPath);
      // 2. Fall back to English
      if (val === undefined && language !== DEFAULT_LANGUAGE) {
        val = getNestedValue(translations[DEFAULT_LANGUAGE], keyPath);
      }
      // 3. Fall back to defaultText or keyPath
      if (val === undefined) {
        val = defaultText || keyPath;
      }

      if (typeof val !== 'string') return val;

      // Parameter interpolation: {paramName}
      let result = val;
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([k, v]) => {
          result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
        });
      }
      return result;
    },
    [language]
  );

  const localizeVerdict = useCallback(
    (verdict) => {
      if (!verdict) return '';
      const v = String(verdict).toUpperCase();
      switch (v) {
        case 'SAFE':
        case 'LEGITIMATE':
          return t('verdicts.safe');
        case 'LOW':
          return t('verdicts.low');
        case 'MEDIUM':
          return t('verdicts.medium');
        case 'HIGH':
          return t('verdicts.high');
        case 'CRITICAL':
        case 'DANGEROUS':
          return t('verdicts.critical');
        case 'SUSPICIOUS':
          return t('verdicts.suspicious');
        case 'PHISHING':
          return t('verdicts.phishing');
        case 'OFFICIAL':
          return t('verdicts.official');
        case 'IMPERSONATION':
          return t('verdicts.impersonation');
        default:
          return verdict;
      }
    },
    [t]
  );

  const localizeDirective = useCallback(
    (directiveCode) => {
      if (!directiveCode) return '';
      const norm = String(directiveCode).toUpperCase().replace(/[\s-]/g, '_');
      if (norm.includes('BLOCK')) return t('directives.blockAndReport');
      if (norm.includes('CREDENTIAL') || norm.includes('NO_CREDS')) return t('directives.doNotEnterCredentials');
      if (norm.includes('CAUTION')) return t('directives.proceedWithCaution');
      if (norm.includes('SAFE')) return t('directives.safeToProceed');
      return `DIRECTIVE: ${directiveCode.replace(/_/g, ' ')}`;
    },
    [t]
  );

  const localizeRecommendation = useCallback(
    (recText, recCode) => {
      if (language === 'en' && recText) return recText;

      const norm = (recCode || '').toUpperCase();
      if (norm.includes('BLOCK') || norm.includes('CRITICAL')) {
        return `${t('safety.impersonationAlert')} ${t('safety.noOtp')} ${t('safety.noUpiPin')} ${t('safety.cybercrimeHelpline')}`;
      }
      if (norm.includes('CREDENTIAL') || norm.includes('NO_CREDS') || norm.includes('HIGH')) {
        return `${t('safety.impersonationAlert')} ${t('safety.noPasswordShare')} ${t('safety.verifyOfficial')}`;
      }
      if (norm.includes('CAUTION') || norm.includes('MEDIUM')) {
        return `${t('safety.verifyOfficial')} ${t('safety.verifyDomain')} ${t('safety.noApk')}`;
      }
      if (norm.includes('SAFE') || norm.includes('LOW')) {
        return `${t('safety.verifyOfficial')} ${t('common.safeVerifiedSub')}.`;
      }
      return recText || t('safety.verifyOfficial');
    },
    [language, t]
  );

  const localizeReason = useCallback(
    (reason) => {
      return translateReasonPattern(reason, language, t);
    },
    [language, t]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      languages: SUPPORTED_LANGUAGES,
      localizeVerdict,
      localizeDirective,
      localizeRecommendation,
      localizeReason
    }),
    [language, setLanguage, t, localizeVerdict, localizeDirective, localizeRecommendation, localizeReason]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  return useContext(LanguageContext);
}
