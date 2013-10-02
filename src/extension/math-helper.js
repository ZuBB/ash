/**
 * function that ...
 *
 * @method get_middle_val
 * @param {Object} graphicObj - value itself
 */
MathHelper.get_middle_val = function(dataObj, valueX, ii) {
    var result  = null;
    var new_val = null;
    var neighbors = null;

    // target value is less than 1st item
    if (valueX < dataObj.dataX[0]) {
        //      new pos <-> old pos
        // (r)  new val <-> old val
        new_val = valueX * dataObj.dataY[0] / dataObj.dataX[0];
        // TODO: we have fixed tricky case here. now its just plain copy
        result = [dataObj.dataY[0], 0];
    // target value is bigger than last item
    } else if (valueX > dataObj.dataX[dataObj.dataX.length - 1]) {
        //      new pos <-> old pos
        // (r)  new val <-> old val
        var old_pos = dataObj.dataX.length - 1;
        new_val = valueX * dataObj.dataY[old_pos] / dataObj.dataX[old_pos];
        result = [new_val, old_pos];
    // target value is inside data array
    } else {
        neighbors = dataObj.dataX.getNeigborsIndexes(valueX, ii);

        if (neighbors.length === 1) {
            result = [dataObj.dataY[neighbors[0]], neighbors[0]];
        } else if (neighbors.length === 2) {
            new_val = dataObj.dataY[neighbors[0]] +
                (dataObj.dataY[neighbors[1]] - dataObj.dataY[neighbors[0]]) /
                (dataObj.dataX[neighbors[1]] - dataObj.dataX[neighbors[0]]) *
                (valueX - dataObj.dataX[neighbors[0]]);

            result = [new_val, neighbors[0]];
        } else {
            // TODO what is the best value to return?
            result = [null, 0];
        }
    }

    return result;
};

/**
 * function that ...
 *
 * @method avgXPointsTo1
 * @param {Object} graphicObj - value itself
 * @param {number} aveItems - кількість точок для усереднення із кожного боку
 */
MathHelper.avgXPointsTo1 = function(dataObj, aveItems) {
    if (dataObj.dataY.length !== dataObj.dataX.length) {
        //DEBUG_START
        _e('got data object with different length of X and Y');
        //DEBUG_STOP
        return null;
    }

    aveItems = parseInt(aveItems, 10) || 1;

    if (aveItems < 2) {
        return dataObj;
    }

    var time   = null;
    var odd    = Boolean(aveItems % 2);
    var length = dataObj.dataY.length;
    var result = { 'dataY': [], 'dataX': [] };

    for (var ii = 0; ii < length && Host.CanContinue(); ii += aveItems) {
        var end = Math.min(ii + aveItems, length);

        if (ii + aveItems > length) {
            time = dataObj.dataX[length - 1];
        } else{
            if (odd) {
                time = dataObj.dataX[ii + Math.ceil(aveItems / 2)];
            } else {
                time = dataObj.dataX.slice(ii, end).avg();
            }
        }

        result.dataY.push(dataObj.dataY.slice(ii, end).avg());
        result.dataX.push(time);
    }

    return result;
};

/**
 * function that ...
 *
 * @method changeDataTimeline
 * @param {Object} graphicObj - value itself
 * @param {number} aveItems - кількість точок для усереднення із кожного боку
 */
MathHelper.changeDataTimeline = function(srcXObj, srcYObj) {
    var result = [];
    var dstObj = { 'dataY': [], 'dataX': [] };

    for (var ii = 0; ii < srcXObj.dataX.length && Host.CanContinue(); ii++) {
        result = MathHelper.get_middle_val(srcYObj, srcXObj.dataX[ii], result[1]);

        dstObj.dataX.push(srcXObj.dataX[ii]);
        dstObj.dataY.push(result[0]);
    }

    return dstObj;
};

/**
 * function that ...
 *
 * @method smoothData
 * @param {Object} graphicObj - value itself
 * @param {number} aveItems - кількість точок для усереднення із кожного боку
 */
MathHelper.smoothData = function(srcObj, passCount, returnAll) {
    passCount = parseInt(passCount, 10) || 1;
    var dataObj = Utils.mergeRecursive({}, srcObj);
    var timeObj = { 'dataX': [], 'dataY': [] };
    var tmpObj1 = null;
    var results = [];

    for (var ii = 1; ii < srcObj.dataX.length && Host.CanContinue(); ii++) {
        timeObj.dataX.push((srcObj.dataX[ii] + srcObj.dataX[ii - 1]) / 2);
    }

    for (ii = 0; ii < passCount; ii++) {
        tmpObj1 = MathHelper.changeDataTimeline(timeObj, dataObj);
        dataObj = MathHelper.changeDataTimeline(dataObj, tmpObj1);

        if (returnAll) {
            results.push(dataObj);
        }
    }

    if (returnAll) {
        return results;
    } else {
        srcObj.dataX = dataObj.dataX;
        srcObj.dataY = dataObj.dataY;
        return srcObj;
    }
};

/**
 * function that ...
 *
 */
MathHelper.percentDiff = function(a, b, digitsAfterPoint) {
    digitsAfterPoint = digitsAfterPoint || 2;
    return parseFloat((100 - (b * 100 / a)).toFixed(digitsAfterPoint));
};

