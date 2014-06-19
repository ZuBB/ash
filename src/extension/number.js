/**
 * Converts integer (preferably) number that represents position
 *  in oscillogram to timeline measured in seconds
 *
 */
if (!Number.prototype.posToSec) {
    Number.prototype.posToSec = function() {
        //DEBUG_START
        if (this % 1 !== 0) {
            _w('Number.prototype.toSeconds: float value was rounded to int');
            return Math.round(this) / Host.Frequency;
        }
        //DEBUG_STOP

        return this / Host.Frequency;
    };
}

/**
 * Converts number that represents milliseconds to amount of position
 */
if (!Number.prototype.msToPos) {
    Number.prototype.msToPos = function() {
        return Math.round(this / 1000 * Host.Frequency);
    };
}
