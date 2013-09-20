// AHF is namespace for Autoscope Helper Functions

AHF.aveValueAt = function(channel, samples2avg, interval) {
    // TODO restore zero point at another place
    var result = {
        'dataX': [1 / Host.Frequency],
        'dataY': [Host.ValueAt(channel, 0)]
    };

    // interval in samples
    var interval2 = interval * Host.Frequency;
    // we need `ceil` here because `for`s condition we use strict checking
    var length = Math.ceil((Host.NumberOfSamples - 1) / interval2);

    for (var ii = 0, aveVal, position; ii < length; ii++) {
        position = 1 + (interval2 * ii);
        aveVal = Host.AveValueAt(channel, position, samples2avg);
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

    /*
    aveVal    = (Host.NumberOfSamples - 1) % samples2avg;
    position  = Math.floor((Host.NumberOfSamples - 1) / samples2avg);
    position += Math.floor(aveVal / 2);
    result.dataX.push(Host.NumberOfSamples / Host.Frequency);
    result.dataY.push(Host.AveValueAt(channel, position, aveVal));
    */

    return result;
};

