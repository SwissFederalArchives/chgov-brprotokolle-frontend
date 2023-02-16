import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import languageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import moment from "moment";
require('moment/locale/de');
require('moment/locale/fr');
require('moment/locale/it');

export default function InitI18n() {
    const i18nOptions = {
        debug: false,
        fallbackLng: 'de',
        supportedLngs: ['de', 'fr', 'it', 'en'],
        interpolation: { 
            escapeValue: false 
        },
        backend: {
            loadPath: `/locales/{{lng}}/common.json`,
        },
        detection: {
            // The order how the language gets detected. First entry has the highest precedence.
            order: ['querystring', 'localStorage', 'navigator'],
            // Store the selected language in the local storage
            caches: ['localStorage'],
        },
        react: {
            useSuspense: true,
        }
    };

    i18n
        .use(initReactI18next) // passes i18n down to react-i18next
        .use(HttpBackend) // Load translations from HTTP Backend
        .use(languageDetector) // Automatically detect language
        .init(i18nOptions)
        .then(() => {
            moment.locale(i18n.language);
            
            i18n.on('languageChanged', () => {
                moment.locale(i18n.language);
            })
        });
}
