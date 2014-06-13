/**
 * Converts integer (preferably) number that represents position
 *  in oscillogram to timeline measured in seconds
 *
 */
if (!Number.prototype.toSeconds) {
    Number.prototype.toSeconds = function() {
        //DEBUG_START
        if (this % 1 !== 0) {
            _w('Number.prototype.toSeconds: float value was rounded to int');
            return Math.round(this) / Host.Frequency;
        }
        //DEBUG_STOP

        return this / Host.Frequency;
    };
}

