// AHF is namespace for Autoscope Helper Functions

/**
 * params
 *  samples2Average, one of [samples2Average, interval*] should be passed
 *  intervalTime, one of [samples2Average, interval*] should be passed
 *  intervalSamples, one of [samples2Average, interval*] should be passed
 *  mergeFirst, optional
 *  skipTrailing, optional
 */
AHF.aveValueAt = function(channel, params) {
    if (typeof params !== 'object') {
        return null;
    }

    var keys = ['samples2Average', 'intervalTime', 'intervalSamples'];
    if (keys.some(function(key) { return key in params; }) === false) {
        return null;
    }

    var result  = Utils.createDataSetStub();
    var length1 = parseInt(params.samples2Average, 10) || 0;
    var length2 = parseInt(params.intervalSamples, 10) || 0;
    var length3 = Host.Frequency * (parseFloat(params.intervalTime) || 0);

    if (length1 === 0 && length2 === 0 && length3 === 0) {
        //DEBUG_START
        _d('AHF.aveValueAt: all of params are invalid (casted to 0)');
        //DEBUG_STOP
        return result;
    }

    if (Boolean(params.mergeFirst) !== false) {
        result.dataX.unshift(1 / Host.Frequency);
        result.dataY.unshift(Host.ValueAt(channel, 0));
    }

    var samples  = length1 || (length2 || length3);
    var interval = (length3 || length2) || length1;
    var fstVal   = Number(!Boolean(params.mergeFirst));
    var length   = Math.floor((Host.NumberOfSamples - fstVal) / interval);

    for (var ii = 0, position; ii < length; ii++) {
        // we need to add some explanation here
        // since we need to loop length times, we start with 0
        // but due to this 1st slice may be out of left 'border'
        // to prevent this we need to add '1' here
        position = fstVal + ((interval + 1) * ii);
        // here we also need to add some notes
        // for '1' explanation is same
        // fstVal should talk aon itself
        result.dataX.push((position + 1 + fstVal) / Host.Frequency);
        result.dataY.push(Host.AveValueAt(channel, position, samples));

        if (!Host.CanContinue()) {
            //DEBUG_START
            _f('Host.CanContinue() said we need to stop');
            //DEBUG_STOP
            break;
        }
    }

    if (Boolean(params.skipTrailing) !== true) {
        position  = Math.floor((Host.NumberOfSamples - fstVal) / interval);
        position += Math.floor(((Host.NumberOfSamples - fstVal) % interval) / 2);
        result.dataX.push(Host.NumberOfSamples / Host.Frequency);
        result.dataY.push(Host.AveValueAt(channel, position, samples));
    }

    return result;
};

