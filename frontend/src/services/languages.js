// Maps the language labels used in App.jsx's <select> to API codes and speech locales.
export const LANGUAGES = {
  English: { code: 'en', speech: 'en-IN' },
  'हिन्दी': { code: 'hi', speech: 'hi-IN' },
  'ಕನ್ನಡ': { code: 'kn', speech: 'kn-IN' },
  'தமிழ்': { code: 'ta', speech: 'ta-IN' },
  'తెలుగు': { code: 'te', speech: 'te-IN' },
  'বাংলা': { code: 'bn', speech: 'bn-IN' },
}

export const langInfo = (label) => LANGUAGES[label] || LANGUAGES.English

// Pick a speech locale from the script of the text itself, so a reply that came back in
// Hindi is read with a Hindi voice even if the UI is set to English.
const SCRIPTS = [
  [/[\u0900-\u097F]/, 'hi-IN'],
  [/[\u0980-\u09FF]/, 'bn-IN'],
  [/[\u0B80-\u0BFF]/, 'ta-IN'],
  [/[\u0C00-\u0C7F]/, 'te-IN'],
  [/[\u0C80-\u0CFF]/, 'kn-IN'],
]

export function detectSpeechLang(text, fallback = 'en-IN') {
  for (const [re, lang] of SCRIPTS) if (re.test(text)) return lang
  return fallback
}
