// AHF is namespace for Autoscope Helper Functions

AHF.aveValueAt = function(channel, samples, mergeFirst, skipTrailing) {
    // TODO restore zero point at another place
    var result = { 'dataX': [], 'dataY': [] };

    if (!mergeFirst) {
        result.dataX.unshift(1 / Host.Frequency);
        result.dataY.unshift(Host.ValueAt(channel, 0));
    }

    var _shift = Math.floor(samples / 2);
    var fstVal = Number(!Boolean(mergeFirst));
    // we need `ceil` here because `for`s condition we use strict checking
    var length = Math.ceil((Host.NumberOfSamples - fstVal) / samples);

    for (var ii = 0, aveVal, position; ii < length; ii++) {
        position = fstVal + (samples * ii) + _shift;
        aveVal = Host.AveValueAt(channel, position, samples);
        // 2 is because this first value calculated in loop
        // will be 2nd real value in sample
        result.dataX.push((position + 2) / Host.Frequency);
        result.dataY.push(aveVal);

        if (!Host.CanContinue()) {
            //DEBUG_START
            _f('Host.CanContinue() said we need to stop');
            //DEBUG_STOP
            break;
        }
    }

    if (skipTrailing) {
        aveVal    = (Host.NumberOfSamples - 1) % samples;
        position  = Math.floor((Host.NumberOfSamples - 1) / samples);
        position += Math.floor(aveVal / 2);
        result.dataX.push(Host.NumberOfSamples / Host.Frequency);
        result.dataY.push(Host.AveValueAt(channel, position, aveVal));
    }

    return result;
};

