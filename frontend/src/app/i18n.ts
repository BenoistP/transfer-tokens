const i18nConfig = {
  // This is the list of languages your application supports
  supportedLngs: ["en", "fr"],
  // This is the language you want to use in case
  // if the user language is not in the supportedLngs
  fallbackLng: "en",
  // The default namespace of i18next is "translation", but you can customize it here
  defaultNS: "common",
  // Disabling suspense is recommended
  nonExplicitSupportedLngs: true, //support language variation
  keySeparator: '.', // allow nested translation
  react: { 
    useSuspense: false
  },
};

export default i18nConfig;