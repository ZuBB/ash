/**
 * helper function that creates data set stub
 *
 * @method createDataSetStub
 * @member Utils
 * @ignore
 */
Utils.createDataSetStub = function(keys) {
    var result = {};

    if (!Array.isArray(keys) || keys.empty()) {
        keys = Script.defaultKeys;
    }

    keys.forEach(function(item) {
        result[item.toString()] = [];
    });

    return result;
};

/**
 * helper function that creates random color
 * http://devcheater.com/
 *
 * @method sleep
 * @member Utils
 * @ignore
 */
Utils.sleep = function(milliSeconds) {
    // get the current time
    var startTime = new Date().getTime();
    // hog cpu
    while (new Date().getTime() < startTime + milliSeconds) {}
};

/**
 * helper function that creates random color
 *
 * @method createRandomColor
 * @member Utils
 * @ignore
 */
Utils.createRandomColor = function() {
    return parseInt(Math.floor(Math.random()*16777215).toString(16), 16);
};

/**
 * helper function that ...
 *
 * @member Utils
 * @ignore
 */
Utils.isNumberInvalid = function(number) {
    return isNaN(parseFloat(number)) || !isFinite(number);
};

/**
 * helper function that clones hash
 *
 * @member Utils
 * @ignore
 * @method configureObj
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 */
Utils.configureObj = function(_this, params) {
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            if (key in _this) {
                _this[key] = params[key];
            } else {
                //DEBUG_START
                _e(key, 'unknown property has been assigned');
                //DEBUG_STOP
            }
        }
    }
};

/**
 * helper function that ...
 *
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 *
 * @method prepareParams
 * @member Utils
 * @ignore
 */
Utils.prepareParams = function() {
    var _arguments = [].slice.call(arguments, 0);
    var params = [].slice.call(_arguments[0], 0);

    params.unshift(Boolean(_arguments[1]));
    params.unshift(Boolean(_arguments[2]));
    params.push(Boolean(_arguments[3]));

    return params;
};

/**
 * Recursively merge properties of two objects
 *
 * @method mergeRecursive
 * @member Utils
 * @ignore
 */
Utils.mergeRecursive = function(obj1, obj2) {
    for (var p in obj2) {
        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor === Object) {
                obj1[p] = Utils.mergeRecursive(obj1[p], obj2[p]);
            } else if (obj2[p] instanceof Array && obj1[p] instanceof Array) {
                obj1[p] = obj1[p].concat(obj2[p]);
            } else {
                obj1[p] = obj2[p];
            }
        } catch(e) {
            // Property in destination object not set;
            // create it and set its value.
            obj1[p] = obj2[p];
        }
    }

    return obj1;
};

/**
 * helper function that creates string that will send
 * to output (its a common name; indeed it can be different devices)
 *
 * @method createOutputStr
 * @member Utils
 * @ignore
 *
 * @param {boolean} b_lf - indicates if we need to insert '\n' at start
 * @param {boolean} a_lf - indicates if we need to append '\n' at end
 * @param {any type} value - entity itself
 * @param {String, optional} description - string that will be print before value
 */
Utils.createOutputStr = function(b_lf, a_lf, value, description) {
    var outputItems = '';

    if (b_lf) {
        outputItems += '\n';
    }

    if (description && typeof description === 'string') {
        outputItems += description + ': ';
    }

    if (value === null) {
        outputItems += 'null';
    } else if (typeof value === 'undefined') {
        outputItems += 'undefined';
    } else if (typeof value === 'object' && Array.isArray(value) === false) {
        if (typeof JSON !== 'undefined') {
            outputItems += JSON.stringify(value, null, 4);
        } else {
            // for some reason JSON is not supported
            outputItems += value.toString();
        }
    } else {
        try {
            outputItems += value.toString();
        } catch (e) {
            Host.ReportOut('==== <<<<<<<< EXCEPTION >>>>>>>> ====\n');
            Host.ReportOut(e.message + '\n');
            return null;
        }
    }

    if (a_lf) {
        outputItems += '\n';
    }

    return outputItems;
};

/**
 * function that ... http://bit.ly/17CTRQX
 *
 * @method getColorForPercentage
 * @member Utils
 * @ignore
 */
Utils.getColorForPercentage = function(percentColors, pct) {
    var lower = percentColors[0];
    var upper = percentColors.slice(-1)[0];

    if (pct < lower.pct) {
        return 'rgb(' +
                [ lower.color.r, lower.color.g, lower.color.b].join(', ') + ')';
    }

    if (pct > upper.pct) {
        return 'rgb(' +
                [ upper.color.r, upper.color.g, upper.color.b].join(', ') + ')';
    }

    for (var ii = 1; ii < percentColors.length; ii++) {
        if (pct > percentColors[ii - 1].pct && pct <= percentColors[ii].pct) {
            lower = percentColors[ii - 1];
            upper = percentColors[ii];

            var pctUpper = (pct - lower.pct) / (upper.pct - lower.pct);
            var pctLower = 1 - pctUpper;

            var color = {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };

            return 'rgb(' + [color.r, color.g, color.b].join(', ') + ')';
        }
    }
};

/**
 * function that ...
 * https://github.com/jashkenas/underscore/blob/master/underscore.js#L570
 *
 * @method range
 * @member Utils
 * @ignore
 */
Utils.range = function(start, stop, step) {
    if (arguments.length <= 1) {
        stop = start || 0;
        start = 0;
    }

    step = arguments[2] || 1;
    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = new Array(length);
    var idx = 0;

    while (idx < length) {
        range[idx++] = start;
        start += step;
    }

    return range;
};
