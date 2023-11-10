// Consts

const LANGUAGE_EN: iLanguage = {
  key: 'en',
  name: 'English',
  'flagCountryCode': 'GB'
}

const LANGUAGE_FR: iLanguage = {
  key: 'fr',
  name: 'Français',
  'flagCountryCode': 'FR'
}

const SUPPORTED_LANGUAGES: iLanguage[] = [
  LANGUAGE_EN,
  LANGUAGE_FR,
]

const DEFAULT_LANGUAGE = LANGUAGE_EN;

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE }