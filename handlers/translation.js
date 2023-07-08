const color = require("../functions/colorCodes")
class TranslationHandler {
    constructor(languages) {

        this.availableLanguages = languages ?? [
            'en_EN',
            // 'es_ES',
            // 'ar_AR',
            // 'pt_BR',
            //'sk_SK',
        ];

        this.translations = {};

        for (const l of this.availableLanguages) {
            const data = require(`../languages/${l}.json`);
            this.initLanguage(l, data);
        }

        console.log(color("%", `%b[Translation_Handler]%7 :: Loaded %e${this.availableLanguages.length} %7languages`));
    }

    initLanguage(key, language) {
        this.translations[key] = language;
    }

    checkRegex(value) {
        return /^[a-z]{2}_[A-Z]{2}$/.test(value);
    }

    getLanguage(language) {
        if (!this.checkRegex(language)) return this.translations['en_EN'];
        return this.translations[language];
    }

    addLanguage(language) {
        if (!this.checkRegex(language)) {
            throw new Error('Invalid language format. Example: en_EN');
        }

        this.availableLanguages.push(language);
    }

    reload() {
        this.translations = {};
        for (const l of this.availableLanguages) {
            try {
                const d = require(`../languages/${l}.json`);

                if (!d) continue;

                this.initLanguage(l, d);
                return "Success"
            } catch (e) {
                return e.message;
            }
        }
    }

    get(language, path, data = {}) {
        if (!language) language = 'en_EN';
        const l = this.getLanguage(language);
        const p = path.split('.');
        let c = null;

        if (p.length > 0) {
            for (const i of p) {
                try {
                    if (!c) {
                        if (!l.hasOwnProperty(i)) break;
                        c = l[i];
                    } else {
                        if (!c.hasOwnProperty(i)) break;
                        c = c[i];
                    }
                } catch (err) {
                    break;
                }
            }
        } else {
            return `Unknown translation: ${language} | ${path}`;;
        }

        if (!c) return `Unknown translation: ${language} | ${path}`;;

        if (data) {
            try {
                return c.replace(/{(\w+)}/g, (match, key) => data[key] ?? match);
            } catch (e) {
                return `Unknown translation: ${language} | ${path}`;
            }
        }

        return c;
    }
};

module.exports = TranslationHandler;