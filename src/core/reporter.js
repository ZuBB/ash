/**
 * Reporter library.
 *
 * [USB Oscilloscope](http://injectorservice.com.ua/home.php) application has
 * ability to print messages into Report tab via built-in function
 * `Host.ReportOut()`. This library provides 3 handy wrapper functions on top
 * of that function. They are:
 *
 * - `_rw()` - prints passed string as it would be a words (no newlines
 *   appended)
 * - `_rl()` - prints passed string as it would be a sentence at the end of
 *   paragraph (newline at the end appended)
 * - `_rp()` - prints passed string as it would be a paragraph with single
 *   sentence in it (newline at both sides appended)
 *
 * Each of these functions accepts next params
 *
 * @param {String} message Text that need to be printed
 * @param {Object} [controlChars] A dictionary with different types of options
 * that will turn plain text message into link to various resources of
 * Oscilloscope app
 * @param {Array} [controlChars.colors] An array with 1-2 numbers that
 * represent colors:
 *
 * - 1st - color of the text
 * - 2nd - background color
 *
 * For example see annotation of {@link Reporter#_insertColorsMark} method
 *
 * @param {Array} [controlChars.notation] An array with 2 numbers that
 * represent 'address' of the graphic that should be pointed to
 *
 * - 1st - index of view
 * - 2nd - index of graphic
 *
 * For example see annotation of {@link Reporter#_insertLink2Notation} method
 *
 * @param {Array} [controlChars.oscillogram] An array with 1 number that
 * represent position at oscillogram that should be shown
 *
 * For example see annotation of {@link Reporter#_insertLink2OSCGRM} method
 *
 */
Reporter = {};

/**
 * Function that actually does printing of messages in report tab. It is
 * recommended to use wrapper functions (`_rw()`, `_rl()`, `_rp()`) instead
 * of this one, but we can not forbid to use it. In that case you have to deal
 * with set of all params for it
 *
 * @param {Boolean} b_lf Flag that indicates if newline symbols should be
 * appended at start of message
 * @param {Boolean} a_lf Flag that indicates if newline symbols should be
 * appended at end message
 * @param {String} value Item that should be printed
 * @param {String} [description] Optional description of the value. This param
 * is **deprecated** and with be removed in next versions
 * @param {Object} [controlChars] Dictionary with control chars. See detailed
 * description in Class annotation
 *
 *
 * @member Reporter
 * @private
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

    if (typeof rawString === 'string') {
        Host.ReportOut(string);
//DEBUG_START
        // 2nd condition: no need to log status of specs
        if (Logger._buffering && !(/[\+\-]{1}\n/).test(rawString)) {
            rawString = rawString.replace(/^\n/, '');
            rawString = rawString.replace(/\n$/, '');
            _i(rawString);
        }
//DEBUG_STOP
    }
};

/**
 * Makes text in report tab colorful
 *
 * See example:
 *
 * ```
 * // raw example
 * ReportOut("<ta=FFFFFF,0000FF Blue>");
 * // example with help of wrapper function
 * _rw('Blue', {colors: [0xFFFFFF, 0xFF0000]});
 * ```
 *
 * @param {String} string Text that should be coloured
 * @param {Array} colors An array of colors
 * @return {string} crafted string with appended color pseudocodes
 *
 * @member Reporter
 * @private
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
 * Converts text in report tab into link that shows view YYY, and activate
 * graphic comment ZZZ
 *
 * See example:
 *
 * ```
 * // raw example
 * ReportOut('<sg=1,2 Activate Graphic>\n')
 * // example with help of wrapper function
 * _rl('Activate Graphic', {notation: [1, 2]});
 * ```
 *
 * @param {String} string Text that should be coloured
 * @param {Array} notation An array of notation options
 * @return {string} crafted string with appended notation pseudocodes
 *
 * @member Reporter
 * @private
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
 * Converts text in report tab in to link that shows oscillogram at position X
 *
 * See example:
 *
 * ```
 * // raw example
 * ReportOut("\n<sp=0 Open oscillogram>\n");
 * // example with help of wrapper function
 * _rp('Open oscillogram', {oscillogram: [0]});
 * ```
 *
 * @param {String} string Text that should be coloured
 * @param {Array} oscillogram An array of oscillogram options
 * @return {string} crafted string with appended oscillogram pseudocodes
 *
 * @member Reporter
 * @private
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

/**
 * Prints message to report tab. Any newline symbols will not be appended
 *
 * @member Reporter
 * method _rp
 */
_rw = function() {
    Reporter.report.apply(Reporter,
        Utils.prepareParams(arguments, false, false));
};

/**
 * Prints message to report tab. To the end of message newline symbol will be
 * appended
 *
 * @member Reporter
 * method _rl
 */
_rl = function() {
    Reporter.report.apply(Reporter,
        Utils.prepareParams(arguments, true, false));
};

/**
 * Prints message to report tab. To the end of message newline symbol will be
 * appended. Also newline symbol will be inserted before message
 *
 * @member Reporter
 * @method _rp
 */
_rp = function() {
    Reporter.report.apply(Reporter,
        Utils.prepareParams(arguments, true, true));
};

