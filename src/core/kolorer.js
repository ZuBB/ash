/**
 * Color helper class
 *
 * @class
 * @ignore
 */
Colorer = (function() {

    /**
     * Function that creates random color
     *
     * @return {Number} 10-based number representing color
     */
    var createRandomColor = function() {
        //turn parseInt(Math.floor(Math.random()*16777215).toString(16), 16);
        return Math.floor(Math.random()*16777215);
    };

    /**
     * Function that creates random color
     *
     * @return {Number} 10-based number representing color
     * @ignore
     */
    var color2RGB = function(color) {
        return {
            'r': (color >> 16) & 0xFF,
            'g': (color >>  8) & 0xFF,
            'b': (color >>  0) & 0xFF
        };
    };

    /**
     * Function that creates random color
     *
     * @return {Number} 10-based number representing color
     * @ignore
     */
    var rgb2CSS = function(r, g, b) {
        //_d(r)
        if (r && typeof g === 'undefined' && typeof b === 'undefined') {
            g = r.g;
            b = r.b;
            r = r.r;
        }
        //_d(r)
        //_d(g)
        //_d(b)

        return 'rgb(' + [r, g, b].join(', ') + ')';
    };

    /**
     * Function that creates random color
     *
     * @method createRandomColor
     * @return {Number} 10-based number representing color
     * @ignore
     */
    var rgb2HEX = function(r, g, b) {
        if (r && typeof g === 'undefined' && typeof b === 'undefined') {
            g = r.g;
            b = r.b;
            r = r.r;
        }

        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    /**
     * Function that creates random color
     * // http://stackoverflow.com/a/17243070
     *
     * @method createRandomColor
     * @return {Number} 10-based number representing color
     * @ignore
     */
    var convertHSV2RGB = function(h, s, v) {
        var r, g, b, i, f, p, q, t;
        if (h && s === undefined && v === undefined) {
            s = h.s;
            v = h.v;
            h = h.h;
        }
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }

        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    };

    /**
     * function that ... http://bit.ly/17CTRQX
     *
     * @ignore
     */
    var getColorByPercent = function(colorsDef, pct) {
        var length = colorsDef.length;

        for (var ii = 0; ii < length; ii++) {
            if (typeof colorsDef[ii].color === 'number') {
                colorsDef[ii].color = color2RGB(colorsDef[ii].color);
            } else if (colorsDef[ii].constructor === Object) {
                continue;
            } else {
                return null;
            }
        }

        if (pct < colorsDef[0].pct) {
            return colorsDef[0].color;
        } else if (pct > colorsDef[length - 1].pct) {
            return colorsDef[length - 1].color;
        }

        for (ii = 1; ii < length; ii++) {
            if (pct < colorsDef[ii - 1].pct || pct > colorsDef[ii].pct) {
                continue;
            }

            var lower = colorsDef[ii - 1];
            var upper = colorsDef[ii];
            var pctUpper = (pct - lower.pct) / (upper.pct - lower.pct);
            var pctLower = 1 - pctUpper;

            return {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };
        }
    };

    /**
     * Generates graphic color based on its index from passed color range
     *
     * @param {Object} [colorDef] object that defines color(s)
     * @param {Number} [index] zero-based index of the graphic
     * @param {Number} [total] amount of graphics in particular task
     *
     * @return {Number} graphic color
     * @private
     */
    var getGraphicPercentColor = function(colorDef, index, total) {
        var colorSpecs = Object
            .keys(colorDef)
            .map(function(item) {
                var percent = parseFloat(item);
                return isNaN(percent) ? null : percent;
            })
            .filter(function(item) { return item !== null; })
            .sort(function(a, b) { return a - b; })
            .map(function(item) {
                return {
                    'color': colorDef[item.toString()],
                    'pct': item
                };
            });

        return getColorByPercent(colorSpecs, (total - index) / total);
    };

    /**
     * Calculates color for specific graphic
     *
     * @param {Object} [colorDef] object that defines color(s)
     * @param {Number} [index] zero-based index of the graphic
     * @param {Number} [total] amount of graphics in particular task
     *
     * @return {Number} graphic color
     */
    var getGraphicColor = function(colorDef, index, total) {
        var graphicColor = null;

        switch (true) {
            case colorDef === null:
            case typeof colorDef === 'undefined':
                //DEBUG_START
                _d('random color will be used for graphic');
                //DEBUG_STOP
                graphicColor = createRandomColor();
                break;
            case typeof colorDef === 'string':
                graphicColor = parseInt(colorDef) || createRandomColor();
                break;
            case typeof colorDef === 'number':
                graphicColor = colorDef;
                break;
            case Array.isArray(colorDef):
                graphicColor = colorDef[index];
                break;
            case typeof colorDef === 'function':
                graphicColor = colorDef(index, total);
                break;
            case colorDef.constructor === Object:
                graphicColor = getGraphicPercentColor(colorDef, index, total);
                break;
            default:
                // TODO
                //DEBUG_START
                _d('random color was used for graphic');
                //DEBUG_STOP
                graphicColor = createRandomColor();
        }

        return graphicColor;
    };

    return {
        'getColorByPercent': getColorByPercent,
        'createRandomColor': createRandomColor,
        'getGraphicColor':   getGraphicColor,
        'convertHSV2RGB':    convertHSV2RGB,
        'rgb2CSS':           rgb2CSS,
        'rgb2HEX':           rgb2HEX
    };
})();
