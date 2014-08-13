/**
 * Converts integer (preferably) number that represents position
 *  in oscillogram to timeline measured in seconds
 *
 */
if (!Number.prototype.posToSec) {
    Number.prototype.posToSec = function() {
        return Math.round(this) / Host.Frequency;
    };
}

/**
 * Converts integer (preferably) number that represents position
 *  in oscillogram to timeline measured in milliseconds
 *
 */
if (!Number.prototype.posToMsec) {
    Number.prototype.posToMsec = function() {
        return this.posToSec() * 1000;
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
