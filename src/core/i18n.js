/**
 * @constructor
 */
var I18n = function() {};

/**
 * Dictionary.
 * Contains key-value pairs. Key is English phrase, value is phrase
 * in current language.
 * @private
 */
I18n.phrases = {};

/**
 * Adds phrases to the dictionary.
 * Messages can be grouped like:
 * {
 *    firstGroup:{
 *        message1: 'This is message 1 in first group',
 *        message2: 'This is message 2 in first group'
 *    },
 *    secondGroup:{
 *        message1: 'This is message 1 in second group',
 *        message2: 'This is message 2 in second group'
 *    }
 * }
 * Messages can be accessed using zapatecTranslate('firstGroup.message1');
 * It will return 'This is message 1 in first group'
 *
 * @param {object} oDict Key-value pairs.
 * Key is English phrase, value is phrase in current language.
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
 * Returns translation of English phrase. If there is no translation, returns
 * phrase itself.
 *
 * <pre>
 * This function overwrites {@link I18n#translate}.
 * </pre>
 *
 * @param {string} sPhrase English phrase
 * @return Translation into current language or undefined in case of invalid
 * arguments
 * @type string
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

_t = function() {
    return I18n.translate.apply(I18n, [].slice.call(arguments, 0));
};

