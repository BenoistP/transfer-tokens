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

const LANGUAGE_ES: iLanguage = {
  key: 'es',
  name: 'Español',
  'flagCountryCode': 'ES'
}

const SUPPORTED_LANGUAGES: iLanguage[] = [
  LANGUAGE_EN,
  LANGUAGE_FR,
  LANGUAGE_ES
]

const DEFAULT_LANGUAGE = LANGUAGE_EN;

export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE }