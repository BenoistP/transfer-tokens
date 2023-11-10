// Consts

const LANGUAGE_EN: iLanguage = {
  key: 'en',
  name: 'English',
  // flagIconCountryCode: 'gb',
  'flagCountryCode': 'GB'
}

const LANGUAGE_FR: iLanguage = {
  key: 'fr',
  name: 'Français',
  // flagIconCountryCode: 'fr',
  'flagCountryCode': 'FR'
}

const SUPPORTED_LANGUAGES: iLanguage[] = [
  LANGUAGE_EN,
  LANGUAGE_FR,
]

const DEFAULT_LANGUAGE = LANGUAGE_EN;

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE }