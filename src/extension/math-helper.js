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
    var data1axis = dataObj[Script.defaultKeys[0]];
    var data2axis = dataObj[Script.defaultKeys[1]];

    // target value is less than 1st item
    if (valueX < data1axis[0]) {
        //      new pos <-> old pos
        // (r)  new val <-> old val
        new_val = valueX * data2axis[0] / data1axis[0];
        // TODO: we have fixed tricky case here. now its just plain copy
        result = [data2axis[0], 0];
    // target value is bigger than last item
    } else if (valueX > data1axis.last()) {
        //      new pos <-> old pos
        // (r)  new val <-> old val
        new_val = valueX * data2axis.last() / data1axis.last();
        result = [new_val, data1axis.length - 1];
    // target value is inside data array
    } else {
        neighbors = data1axis.getNeigborsIndexes(valueX, ii);

        if (neighbors.length === 1) {
            result = [data2axis[neighbors[0]], neighbors[0]];
        } else if (neighbors.length === 2) {
            new_val = data2axis[neighbors[0]] +
                (data2axis[neighbors[1]] - data2axis[neighbors[0]]) /
                (data1axis[neighbors[1]] - data1axis[neighbors[0]]) *
                (valueX - data1axis[neighbors[0]]);

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
    var _1axis = Script.defaultKeys[0];
    var _2axis = Script.defaultKeys[1];

    if (dataObj[_2axis].length !== dataObj[_1axis].length) {
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
    var length = dataObj[_2axis].length;
    var result = Utils.createDataSetStub();

    for (var ii = 0; ii < length && $H_CC_inline; ii += aveItems) {
        var end = Math.min(ii + aveItems, length);

        if (ii + aveItems > length) {
            time = dataObj[_1axis][length - 1];
        } else{
            if (odd) {
                time = dataObj[_1axis][ii + Math.ceil(aveItems / 2)];
            } else {
                time = dataObj[_1axis].slice(ii, end).avg();
            }
        }

        result[_2axis].push(dataObj[_2axis].slice(ii, end).avg());
        result[_1axis].push(time);
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
    var dstObj = Utils.createDataSetStub();
    var _1axis = Script.defaultKeys[0];
    var _2axis = Script.defaultKeys[1];

    for (var ii = 0; ii < srcXObj[_1axis].length && $H_CC_inline; ii++) {
        result = MathHelper.get_middle_val(srcYObj, srcXObj[_1axis][ii], result[1]);

        dstObj[_1axis].push(srcXObj[_1axis][ii]);
        dstObj[_2axis].push(result[0]);
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
    var timeObj = Utils.createDataSetStub();
    var _1axis = Script.defaultKeys[0];
    //var _2axis = Script.defaultKeys[1];
    var tmpObj1 = null;
    var results = [];

    for (var ii = 1; ii < srcObj[_1axis].length && $H_CC_inline; ii++) {
        timeObj[_1axis].push((srcObj[_1axis][ii] + srcObj[_1axis][ii - 1]) / 2);
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
        // TODO find better solution for this
        //srcObj[_1axis] = dataObj[_1axis];
        //srcObj[_2axis] = dataObj[_2axis];
        //return srcObj;
        return dataObj;
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

