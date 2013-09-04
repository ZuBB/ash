// AHF is namespace for Autoscope Helper Functions

AHF.aveValueAt = function(channel, samples, mergeFirst, skipTrailing) {
    var result = { 'dataX': [], 'dataY': [] };
    // we need `ceil` here because `for`s condition we use strict checking
    // we need ' - 1' here to have fall back in case of leaveFirst is true
    var length = Math.ceil((Host.NumberOfSamples - 1) / samples);
    var fstVal = Number(!Boolean(mergeFirst));
    var _shift = Math.floor(samples / 2);

    for (var ii = 0, aveVal, position; ii < length; ii++) {
        position = fstVal + (samples * ii) + _shift;
        aveVal = Host.AveValueAt(channel, position, samples);
        result.dataX.push(position / Host.Frequency);
        result.dataY.push(aveVal);

        if (!Host.CanContinue()) {
            //DEBUG_START
            _f('Host.CanContinue() said we need to stop');
            //DEBUG_STOP
            break;
        }
    }

    if (!mergeFirst) {
        result.dataX.unshift(0);
        result.dataY.unshift(Host.ValueAt(channel, 0));
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

