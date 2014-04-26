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

    var _1axis = Script.defaultKeys[0];
    var _2axis = Script.defaultKeys[1];
    var result  = Utils.createDataSetStub();
    var length1 = parseInt(params.samples2Average, 10) || 0;
    var length2 = parseInt(params.intervalSamples, 10) || 0;
    var length3 = Host.Frequency * (parseFloat(params.intervalTime) || 0);

    if (length1 === 0 && length2 === 0 && length3 === 0) {
        //DEBUG_START
        _e('AHF.aveValueAt: all of params are invalid (casted to 0)');
        //DEBUG_STOP
        return result;
    }

    if (Boolean(params.mergeFirst) !== false) {
        result[_1axis].unshift(1 / Host.Frequency);
        result[_2axis].unshift(Host.ValueAt(channel, 0));
    }

    var interval = (length3 || length2) || length1;
    var samples  = length1 || (length2 || length3);
    var fstVal   = Number(!Boolean(params.mergeFirst));
    var length   = Math.floor((Host.NumberOfSamples - fstVal) / interval);
    var shift    = null;

    shift = Math.floor(samples / 2);
    // in case interval is bigger than samples shift should be zero
    shift = ((interval - 1) / 2) > shift ? 0 : shift;

    for (var ii = 0, position; ii < length; ii++) {
        position = fstVal + (interval * ii) + shift;
        result[_1axis].push(position / Host.Frequency);
        result[_2axis].push(Host.AveValueAt(channel, position, samples));

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
        result[_1axis].push(Host.NumberOfSamples / Host.Frequency);
        result[_2axis].push(Host.AveValueAt(channel, position, samples));
    }

    return result;
};

