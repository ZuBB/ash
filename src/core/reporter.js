/*
 * Reporter lib. Inspired from Ruby's one
 */
Reporter = {};

/**
 * function that ...
 *
 * seems that printing in _Report_ tab is slow
 * need to reduce number of messages that is being printed there
 *
 *
 * @method report
 */
Reporter.report = function(b_lf, a_lf, value, description, controlChars) {
    var rawString = null;
    var string = null;

    if (description && description.constructor === Object) {
        controlChars = description;
        description = null;
    }

    if (typeof controlChars === 'undefined') {
        controlChars = {};
    }

    rawString = Utils.createOutputStr(b_lf, a_lf, value, description);
    string = rawString;

    string = this._insertColorsMark(string, controlChars.colors);
    string = this._insertLink2Notation(string, controlChars.notation);
    string = this._insertLink2OSCGRM(string, controlChars.oscillogram);

    if (rawString) {
        Host.ReportOut(string);
//DEBUG_START
        if (Logger._buffering) {
            _i(rawString);
        }
//DEBUG_STOP
    }
};

/**
 * function that makes text in report tab colorful
 *
 * raw example: ReportOut("<ta=FFFFFF,0000FF [ Blue ]>");
 * lib example: _rl(_t('core.graphic.error1'), {colors: [0xFFFFFF, 0xFF0000]});
 *
 * @method report
 */
Reporter._insertColorsMark = function(string, colors) {
    function dumbColor(color) {
        return ('00000' + color.toString(16)).substr(-6).toUpperCase();
    }

    if (!string || !(colors && Array.isArray(colors))) {
        return string;
    }

    var textColor = dumbColor(colors[0] || 0x000000);
    var backColor = dumbColor(colors[1] || 0xFFFFFF);
    var colourStr = '<ta=' + textColor + ',' + backColor;

    return (
        // take case about '\n' at start in case of '_rp' call
        (/^\n/.test(string) ? '\n' : '') +
        // colour string
        colourStr +
        // text and end stuff
        (
            /\n$/.test(string) ?
                // strip newline at stast in any way
                ('>' + string.replace(/^\n/, '')) :
                (' ' + string.replace(/^\n/, '') + '>')
        )
    );
};

/**
 * function that converts text in report tab into link that
 * shows view YYY, and activate graphic comment ZZZ
 *
 * example: ReportOut('<sg=1,2 Activate Graphic>\n')
 *
 * @method _insertLink2Notation
 */
Reporter._insertLink2Notation = function(string, notation) {
    if (!string || !(notation && Array.isArray(notation))) {
        return string;
    }

    if (notation.length !== 2) {
        return string;
    }

    return (string
        .replace(/^(\n)?/, '$1<sg=' + notation[0] + ',' + notation[1] + ' ')
        .replace(/(\n)?$/, '>$1')
    );
};

/**
 * function that converts text in report tab in to link that
 * shows oscillogram position at ZZZ
 *
 * example: ReportOut("\n<sp=0 Open oscillogram>\n");
 *
 * @method _insertLink2OSCGRM
 */
Reporter._insertLink2OSCGRM = function(string, oscillogram) {
    if (!string || !(oscillogram && Array.isArray(oscillogram))) {
        return string;
    }

    if (oscillogram.length < 1) {
        return string;
    }

    return (string
        .replace(/^(\n)?/, '$1<sp=' + oscillogram[0] + ' ')
        .replace(/(\n)?$/, '>$1')
    );
};

// ==========================================

_rh = function() {
    Reporter.report.apply(Reporter,
        Utils.prepareParams(arguments, false, false));
};

_rl = function() {
    Reporter.report.apply(Reporter,
        Utils.prepareParams(arguments, true, false));
};

_rp = function() {
    Reporter.report.apply(Reporter,
        Utils.prepareParams(arguments, true, true));
};

