var currentLocale = null;

switch (Host.GetCurLanguage()) {
    // https://technet.microsoft.com/en-us/library/ms143508(v=sql.90).aspx
    case 1049: currentLocale = 'ru'; break;
    case 1033: currentLocale = 'en'; break;
    default:
        //DEBUG_START
        _e(currentLangCode, 'Next locale code is not supported yet');
        //DEBUG_STOP
}

i18n.init({
    lng: currentLocale,
    //DEBUG_START
    sendMissing: true,
    missingKeyHandler: function(lng, ns, key) {
        _e('Key that does not have translation was used! Detail below');
        _d(lng, 'language');
        _d(ns, 'namespace');
        _d(key, 'translation key');
    },
    //DEBUG_STOP
    resStore: {},
    useCookie: false,
    fallbackLng: false
});

_t = i18n.translate;

