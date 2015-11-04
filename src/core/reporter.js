/**
 * Reporter library.
 *
 * One of the available outputs for scripts that is running in
 * [USB Oscilloscope](http://injectorservice.com.ua/home.php) application
 * is a Report tab. That tab is designed to show short information on script
 * and results of its work. This library provides couple of handy
 * wrapper functions that allow to print messages to Report tab in same time
 * omitting implementation details of that tab for particular platform.
 *
 * Each of these functions (`_rw`, `_rl`, `_rp`, `_rc`) accepts next params
 *
 * @param {String} message Text that need to be printed
 * @param {Object} [options] A dictionary with different types of options
 * that will turn plain text message into link to various resources of
 * Oscilloscope app
 * @param {Object} [options.colors] An array with 1-2 numbers or map with
 * _text_ and _background_ keys that hold colors:
 *
 * - 1st - color of the text
 * - 2nd - background color
 *
 * Color **must be** specified as 6 hex numbers. For example see annotation
 * of {@link Reporter#appendColors} method
 *
 * @param {Array} [options.notation] An array with 2 numbers that
 * represent 'address' of the graphic that should be pointed to
 *
 * - 1st - index of view
 * - 2nd - index of graphic
 *
 * For example see annotation of {@link Reporter#insertLink2Notation} method
 *
 * @param {Array} [options.oscillogram] An array with 1 number that
 * represent position at oscillogram that should be shown
 *
 * For example see annotation of {@link Reporter#makeLink} method
 */
Reporter = (function() {
    var that = this;

    /**
     * Provides high level interface for message printing in report tab.
     * It is recommended to use wrapper functions instead of this one.
     * But in case when you need to control everything youself you may use it.
     *
     * @param {String} phrase Text that should be printed
     * @param {Object} [options] Dictionary with various options.
     * See detailed description in Class annotation
     */
    this.report = function(phrase, options) {
        options = options || {};

        var rawString = that.createOutputString(phrase, options);
        var string = rawString.slice(0);

        string = that.appendColors(string, options.colors);
        string = that.makeLink(string, options);

        that.printReportMessage(string);

        //DEBUG_START
        if (options.reportOnly !== true) {
            _i(phrase);
        }
        //DEBUG_STOP
    };

    /**
     * Prints message to report tab. No newline symbols is appended
     */
    this.reportWord = function(phrase, options) {
        options = options || {};
        options.lfBefore = false;
        options.lfAfter = false;

        that.report(phrase, options);
    };

    /**
     * Prints message to report tab. Newline symbol is appended
     * to the end of message
     */
    this.reportLine = function(phrase, options) {
        options = options || {};
        options.lfBefore = false;
        options.lfAfter = true;

        that.report(phrase, options);
    };

    /**
     * Prints message to report tab. Newline symbol is appended
     * to the both ends of message
     */
    this.reportParagraph = function(phrase, options) {
        options = options || {};
        options.lfBefore = true;
        options.lfAfter = true;

        that.report(phrase, options);
    };

    return this;
}).apply({});

// ==========================================

/**
 * Prints message to report tab. No newline symbols is appended
 */
_rw = Reporter.reportWord;

/**
 * Prints message to report tab. Newline symbol is appended
 * to the end of message
 */
_rl = Reporter.reportLine;

/**
 * Prints message to report tab. Newline symbol is appended
 * to the both ends of message
 */
_rp = Reporter.reportParagraph;

/**
 * Prints message to report tab. Allows to control all options manually
 */
_rc = Reporter.report;

