/**
 * helper function that ...
 * http://bit.ly/xneK4g
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.unique) {
    Array.prototype.unique = function() {
        var u = {}, a = [];
        for (var i = 0, l = this.length; i < l; ++i) {
            if (u.hasOwnProperty(this[i])) {
                continue;
            }
            a.push(this[i]);
            u[this[i]] = 1;
        }
        return a;
    };
}

/**
 * helper function that ...
 *
 * @method _clone_hash
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(obj, start) {
        for (var ii = (start || 0); ii < this.length; ii++) {
            if (this[ii] === obj) {
                return ii;
            }
        }
        return -1;
    };
}

/**
 * helper function that ...
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.sum) {
    Array.prototype.sum = function(ignoreSign) {
        var sum = 0;
        var sumABS = 0;

        for (var ii = 0; ii < this.length; ii++) {
            sum += this[ii];
            sumABS += Math.abs(this[ii]);
        }

        return ignoreSign ? sumABS : sum;
    };
}

/**
 * helper function that ...
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.avg) {
    Array.prototype.avg = function(ignoreSign) {
        return this.sum(ignoreSign) / (this.length || 1);
    };
}

/**
 * helper function that ...
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.max) {
    Array.prototype.max = function() {
        return Math.max.apply(null, this);
    };
}

/**
 * helper function that ...
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.min) {
    Array.prototype.min = function() {
        return Math.min.apply(null, this);
    };
}

/**
 * function that finds positions of numbers that are 'neighbors'
 *  passed value
 *
 * @method getValueNeighboursPositions
 * @param {Object} graphicObj - value itself
 */
if (!Array.prototype.getValueNeighboursPositions) {
    Array.prototype.getValueNeighboursPositions = function(value, startPos) {
        var length = this.length;
        var ii     = startPos || 0;

        // target value is less (or equal) compared to 1st item
        if (value <= this[0]) {
            return [0];
        }

        // target value is bigger (or equal) compared to last item
        if (value >= this[length - 1]) {
            return [length - 1];
        }

        for ( ; ii < length && CanContinue(); ii++) {
            if (typeof this[ii + 1] === 'undefined') {
                return [];
            }

            if (this[ii] < value && this[ii + 1] > value) {
                return [ii, ii + 1];
            }

            if (value === this[ii]) {
                return [ii];
            }

            if (value === this[ii + 1]) {
                return [ii + 1];
            }
        }

        return [];
    };
}

/**
 * helper function that ...
 * http://goo.gl/kHr0L
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.mode) {
    Array.prototype.mode = function(mapFunction, itemIndex) {
        if (this.length === 0) {
            // original source used null here
            return 0;
        }

        if (typeof mapFunction === 'function') {
            // noop
        } else if (!Utils.isNumberInvalid(mapFunction)) {
            itemIndex = parseInt(mapFunction, 10);
            mapFunction = function(a) { return a; };
        } else {
            mapFunction = function(a) { return a; };
        }

        if (Utils.isNumberInvalid(itemIndex)) {
            itemIndex = 1;
        }

        var modeMap = {};
        var maxCount = 1;
        var modes = [mapFunction(this[0])];

        for (var ii = 0; ii < this.length; ii++) {
            var el = mapFunction(this[ii]);

            if (modeMap[el] === null) {
                modeMap[el] = 1;
            } else {
                modeMap[el]++;
            }

            if (modeMap[el] > maxCount) {
                modes = [el];
                maxCount = modeMap[el];
            } else if (modeMap[el] === maxCount) {
                modes.push(el);
                maxCount = modeMap[el];
            }
        }

        return itemIndex > 0 ? modes[itemIndex - 1] : modes;
    };
}

/**
 * function that finds average absolute deviation
 *
 * http://en.wikipedia.org/wiki/Absolute_deviation
 */
if (!Array.prototype.aad) {
    Array.prototype.aad = function(stopFunc) {
        if (typeof stopFunc !== 'function') {
            stopFunc = function() { return false; };
        }

        for (var ii = 0; ii < this.length; ii++) {
            if (stopFunc(this[ii])) {
                break;
            }
        }

        var avgVal = this.slice(0, ii).avg();
        var diffs  = [];
        var result = {
            trimmed: ii !== this.length,
            length: ii
        };

        for (ii -= 1; ii >= 0; ii--) {
            diffs.push(this[ii] - avgVal);
        }

        result.avgDiff = diffs.avg(true);
        return result;
    };
}

