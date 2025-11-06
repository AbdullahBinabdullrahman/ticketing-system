import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files
import enCommon from "../../public/locales/en/common.json";
import arCommon from "../../public/locales/ar/common.json";

const resources = {
  en: {
    common: enCommon,
  },
  ar: {
    common: arCommon,
  },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "ar",
  debug: false,

  interpolation: {
    escapeValue: false, // React already does escaping
  },

  detection: {
    order: ["localStorage", "navigator", "htmlTag"],
    caches: ["localStorage"],
  },

  react: {
    useSuspense: false,
  },
});

export default i18n;
