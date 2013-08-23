/**
 * helper function that creates random color
 *
 * @method createRandomColor
 */
Utils.createRandomColor = function() {
    return parseInt(Math.floor(Math.random()*16777215).toString(16), 16);
};

/**
 * helper function that ...
 */
Utils.isNumberInvalid = function(number) {
    return isNaN(parseFloat(number)) || !isFinite(number);
};

/**
 * helper function that clones hash
 *
 * @method _clone_hash
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
 * @method _clone_hash
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 */
Utils.prepareParams = function(orig_params, param1, param2) {
    var params = [].slice.call(orig_params, 0);

    params.unshift(param1);
    params.unshift(Boolean(param2));

    return params;
};

/**
 * function that ...
 *
 * @method checkChannel
 */
Utils.checkChannel = function(dataSource) {
    return (
        (typeof (dataSource) === 'number') &&
        !isNaN(dataSource) &&
        (dataSource > 0) &&
        (dataSource <= Host.Channels)
    );
};

/**
 * function that ...
 *
 * @method checkChannelsList
 */
Utils.checkChannelsList = function(dataSource) {
    // TODO replace 8 with some constant
    // TODO rework
    return (/^[1-8](\s,\s[1-8])?$/).test(dataSource);
};

/**
 * function that ...
 *
 * @method getDataFolderListing
 */
Utils.getDataFolderListing = function(dataFolder) {
    var temp = null;
    var result = [''];
    dataFolder = dataFolder || 'data';
    dataFolder = Host.CurPath + dataFolder;
    var FSObject = new ActiveXObject('Scripting.FileSystemObject');

    if (!FSObject.FolderExists(dataFolder)) {
        FSObject.CreateFolder(dataFolder);
    }

    var objFolder = FSObject.GetFolder(dataFolder);
    var filesCollection = new Enumerator(objFolder.files);
    for (; !filesCollection.atEnd(); filesCollection.moveNext()) {
        temp = filesCollection.item().name;
        if (temp.indexOf('.json.txt') > 0) {
            result.push(temp.replace(/\.json\.txt$/, ''));
        }
    }

    return result;
};

/*
* Recursively merge properties of two objects
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
    } else if (typeof value === 'object' && !(value instanceof Array)) {
        if (typeof JSON !== 'undefined') {
            outputItems += JSON.stringify(value, null, 4);
        }
    } else {
        try {
            outputItems += value.toString();
        } catch (e) {
            ReportOut('==== <<<<<<<< EXCEPTION >>>>>>>> ====\n');
            ReportOut(e.message + '\n');
            return null;
        }
    }

    if (a_lf) {
        outputItems += '\n';
    }

    return outputItems;
};

/**
 * function that ...
 *
 * @method convertReportMessage2Obj
 */
Utils.convertReportMessage2Obj = function(message) {
    if (typeof message === 'string' && message.length > 0 ) {
        message = [message];
    }

    if (message instanceof Array) {
        message = {'message': message};
    }

    if (!message || message.constructor !== Object) {
        //DEBUG_START
        _e(message, 'convertReportMessage2Obj got invalid value');
        //DEBUG_STOP
        return null;
    }

    return message;
};

/**
 * function that ...
 *
 * @method convertReportMessage2Obj
 *         // http://bit.ly/17CTRQX
 */
Utils.getColorForPercentage = function(percentColors, pct) {
    var lower = percentColors[0];
    var upper = percentColors.slice(-1);

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

