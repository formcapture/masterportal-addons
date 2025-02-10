import component from "./components/Embedit.vue";
import embeditStore from "./store/index";
import deLocale from "./locales/de/additional.json";
import enLocale from "./locales/en/additional.json";

export default {
    component: component,
    store: embeditStore,
    locales: {
        de: deLocale,
        en: enLocale
    }
};
