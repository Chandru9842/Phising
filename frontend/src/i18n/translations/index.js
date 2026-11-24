import en from './en';
import ta from './ta';
import te from './te';
import kn from './kn';
import ml from './ml';

export const translations = {
  en,
  ta,
  te,
  kn,
  ml
};

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' }
];

export const DEFAULT_LANGUAGE = 'en';
