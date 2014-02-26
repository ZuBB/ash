/**
 * I18n library
 *
 * This library provides simple interface for translating messages.
 *
 * All you need is next two things
 *
 * - store you messages resource localization files. name and location of the
 *   files matter format is following
 *
 * ```
 * src/resources/lang-LANG_NAME.LANG_CODE.properties
 * ```
 *
 * Here is an example for english language
 *
 * ```
 * src/resources/lang-en.1033.properties
 *
 * ```
 *
 * Format of the file is also important. Its well known and quite simple
 * [Java properties file](http://en.wikipedia.org/wiki/.properties)
 * Single improvement over it is a support of nested keys
 *
 * ```
 * key[.subkey1[.subkey2...]] = translated message
 * ```
 *
 * - get translated string by its key via helper function `_t()` in next way
 *
 * ```
 * _t('key.subkey1.subkey2')
 * ```
 *
 * Converting Java properties file to JSON that is required for `I18n.set`
 * method is being done by build system automatically each time you run
 * a build.
 */
var I18n = function() {};

/**
 * Dictionary.
 * Contains key-value pairs. Key is used to get a value; value is phrase
 * in current language.
 *
 * @member I18n
 * @private
 */
I18n.phrases = {};

/**
 * Adds phrases to the dictionary.
 * Messages are grouped like this:
 *
 * ```
 * {
 *    message1: 'This is message 1',
 *    message2: 'This is message 2'
 * }
 * ```
 *
 * Messages can be accessed using `_t('message1')`
 * It will return 'This is message 1'
 *
 * @param {Number} langCode Code of the language for messages that are passing
 * as 2nd parameter
 * @param {Object} oDict Key-value pairs.
 *
 * Key is used to access to localized phrase, value is phrase in current
 * language.
 *
 * @member I18n
 * @private
 */
I18n.set = function(langCode, oDict) {
    var aPhrases = I18n.phrases;

    // convert nested messages into dot-separated string
    function fFlatten(prefix, values) {
        if (typeof values === 'string') {
            aPhrases[prefix] = values;
            return;
        }

        if(prefix !== ''){
            prefix += '.';
        }

        for (var sKey in values) {
            if (values.hasOwnProperty(sKey)) {
                fFlatten(prefix + sKey, values[sKey]);
            }
        }
    }

    fFlatten(langCode, oDict);
};

/**
 * Returns localized string that is on other side of localization key.
 * Optionally any amount of additional params may be passed. If localized
 * string has '%x' marks they will be replaced with indexes in order they
 * come. If string does not have marks, additional params will be ignored.
 *
 * On attempt to translate nonexistent key nothing happeng, ie original key
 * will be returned.
 *
 * Call of build in function `Host.GetCurLanguage()` returns code of the
 * current language. That code is added to localization key as prefix. This
 * allows to get localized strings for language that is currently active
 *
 * @param {String} key Localization key that points to localization string
 * @param {Object} [arguments=undefined] List (**not an array**) of optional
 * params that may be used for substituion
 * @return {String} translated string
 *
 * @member I18n
 * @private
 */
I18n.translate = function(sPhrase) {
    // Translate
    var oPhrases = I18n.phrases;
    var langCode = parseInt(Host.GetCurLanguage(), 10).toString();
    sPhrase = langCode + '.' + sPhrase;

    if (typeof oPhrases[sPhrase] === 'string') {
        sPhrase = oPhrases[sPhrase];
        if(sPhrase.charAt(0) === '@'){
            sPhrase = I18n.translate(sPhrase.substr(1));
        } else if (sPhrase.charAt(0) === '\\' &&
                sPhrase.substr(0, 2) !== '\\@'){
            sPhrase = I18n.translate(sPhrase.substr(1));
        }
    }
    // make substitutions if more then one argument is passed.
    // replace %1, %2..., %N with corresponding argument
    if(arguments.length > 1 && typeof(sPhrase) === 'string'){
        for(var ii = 1; ii < arguments.length; ii++){
            var re = new RegExp('(^|([^\\\\]))%'+ii, 'g');

            sPhrase = sPhrase.replace(re, '$2' + arguments[ii]);
        }
    }

    if (sPhrase.indexOf(langCode) === 0) {
        sPhrase = sPhrase.slice(langCode.length + 1);
    }

    return sPhrase;
};

/**
 * Returns localized string by localization key that is passed as mandatory
 * parameter
 *
 * For parameters that can be accepted by this function see annotation of
 * {link I18n#translate} method
 *
 * @member I18n
 * @method _t
 */
_t = function() {
    return I18n.translate.apply(I18n, [].slice.call(arguments, 0));
};

