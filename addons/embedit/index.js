import component from './components/Embedit.vue';
import deLocale from './locales/de/additional.json';
import enLocale from './locales/en/additional.json';
import embeditStore from './store/index';

export default {
    component: component,
    store: embeditStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
