/**
 * Reporter library.
 *
 * This file contains implementation of platform specific methods of Reporter
 * library for USB Oscilloscope application.
 */
Reporter = (function() {
    this.NEWLINE_SYMBOL = '\n';

    /**
     * Helper function that creates string that will be sent to output
     *
     * @param {String} [text] string that need to be adjusted
     * @param {Boolean} lfBefore - indicates if we need to append newline at end
     * @param {Boolean} lfAfter - indicates if we need to append newline at start
     * @return {String} text with adjusted newlines if need
     */
    this.createOutputString = function(text, options) {
        return '' +
            (options.lfBefore ? this.NEWLINE_SYMBOL : '') +
            text +
            (options.lfAfter ? this.NEWLINE_SYMBOL : '');
    };

    /**
     * Prints text in report tab
     *
     * @param {String} [text] any text that going to be printed
     */
    this.printReportMessage = function(text) {
        // ` + ''` is a trick that allows to convert things to String type
        Host.ReportOut(text + '');
    };

    /**
     * Wraps text with attributes that does colorifying
     *
     * See example:
     *
     * ```
     * // raw example
     * Host.ReportOut("<ta=0000FF,FFFFFF Blue text>");
     *
     * // example with help of wrapper function
     * _rw('Blue text', {colors: {text: 0x0000FF, background: 0xFFFFFF}});
     * ```
     *
     * @param {String} [string] Text that should be coloured
     * @param {Object} [colors] A hash/map/array of colors
     * @return {String} crafted string with appended color pseudocodes
     */
    this.appendColors = function(string, colors) {
        function dumbColor(color) {
            return ('00000' + color.toString(16)).substr(-6).toUpperCase();
        }

        if (!colors) {
            return string;
        }

        // TODO deprecate at some time array
        var textColor = dumbColor(colors.text       || colors[0] || 0x000000);
        var backColor = dumbColor(colors.background || colors[1] || 0xFFFFFF);
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
     * Wraps text with links to different type of resources
     *
     * @param {String} [string] Text that should be coloured
     * @param {Object} [options] A hash/map/array with linkifying options
     * @return {String} crafted string with appended pseudocodes
     */
    this.makeLink = function(string, options) {
        if (options.oscillogram) {
            return insertLink2OSCGRM(string, options.oscillogram);
        }

        if (options.notation) {
            return insertLink2Notation(string, options.notation);
        }

        return string;
    };

    /**
     * Converts text in report tab into link that shows view YYY, and
     * activate graphic comment ZZZ
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
     * @private
     */
    function insertLink2Notation(string, notation) {
        if (!(string && Array.isArray(notation) && notation.length > 1)) {
            return string;
        }

        string = string.replace(/^(\n)?/, '$1<si=' + notation.join(',') + ' ');
        string = string.replace(/(\n)?$/, '>$1');
        return string;
    }

    /**
     * Converts text in report tab in to link that shows oscillogram at
     * position X
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
     * @private
     */
    function insertLink2OSCGRM(string, oscillogram) {
        if (!(string && Array.isArray(oscillogram) && oscillogram.length > 0)) {
            return string;
        }

        string = string.replace(/^(\n)?/, '$1<sp=' + oscillogram[0]);
        string = string.replace(/(\n)?$/, ' >$1');
        return string;
    }

    return this;
}).apply(Reporter);

