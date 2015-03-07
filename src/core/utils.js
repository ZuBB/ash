/**
 * helper function that simulates wait
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
 * helper function that ...
 *
 * @member Utils
 * @ignore
 */
Utils.isNumberInvalid = function(number) {
    //DEBUG_START
    _e('`Utils.isNumberInvalid()` is deprecated. ' +
            'Use `Number.isInvalid()` instead');
    //DEBUG_STOP
    return Number.isInvalid(number);
};

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

    params.unshift(_arguments[1]);
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

/**
 * Function that creates html markup for table cell accordingly to passed
 * params
 *
 * @param {Object} [params] A hash with set of params
 * @param {String} [params.className] - classname
 * @param {Number} [params.level] - indetation level
 * @param {Number} [params.trim] - number of digits after decimal point
 * @param {String} [params.units] - name of units to append
 * @param {String} [params.text] - text
 *
 * @member Utils
 * @method createHTMLTableCell
 * @ignore
 */
Utils.createHTMLTableCell = function(params) {
    var className = '';
    var innerText = '';
    var padding = '';

    if (typeof params.text === 'number') {
        innerText = params.text.toFixed(params.trim || 2);
    } else {
        innerText = (params.text || '&nbsp;').toString();
    }

    if (params.units) {
        innerText += ' ' + params.units;
    }

    if (params.level) {
        padding = '  '.repeat(params.level);
    }

    if (params.className) {
        className = ' class="' + params.className + '"';
    } else if (params.hasOwnProperty(className) === false) {
        className = ' class="dataCell"';
    }

    return [padding, '<td', className, '>', innerText, '<\/td>'].join('');
};

/**
 * helper function that ...
 *
 * @member Utils
 * @ignore
 */
Utils.parseNaturalNumber = function(number) {
    return parseInt(number, 10) || 0;
};

/**
 * helper function that ...
 *
 * @member Utils
 * @ignore
 */
Utils.parseIntegerNumber = function(number) {
    return Math.abs(Utils.parseNaturalNumber(number));
};

