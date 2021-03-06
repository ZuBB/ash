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
 */
if (!Array.prototype.empty) {
    Array.prototype.empty = function() {
        return this.length === 0;
    };
}

/**
 * helper function that ...
 */
if (!Array.prototype.sortAsc) {
    Array.prototype.sortAsc = function() {
        return this.sort(function(a, b) { return a - b; });
    };
}

/**
 * helper function that ...
 * http://goo.gl/M6YTsf
 */
if (!Array.prototype.last) {
    Array.prototype.last = function() {
        return this.length ? this[this.length - 1] : null;
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
        //turn this.maxWithIndex()[0];
    };

    // most fast way to search for a min/max values
    // is to do an old plain loop
    // http://blogs.msdn.com/b/oldnewthing/archive/2014/05/26/10528351.aspx
    Array.prototype.maxWithIndex = function() {
        var index = 0;
        var max = this[index];

        for (var ii = 1; ii < this.length; ii++) {
            if (this[ii] > max) {
                max = this[ii];
                index = ii;
            }
        }

        return [max, ii];
    };

    Array.prototype.maxIndex = function() {
        return this.maxWithIndex()[1];
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
        //turn this.minWithIndex()[0];
    };

    // most fast way to search for a min/max values
    // is to do an old plain loop
    // http://blogs.msdn.com/b/oldnewthing/archive/2014/05/26/10528351.aspx
    Array.prototype.minWithIndex = function() {
        var index = 0;
        var min = this[index];

        for (var ii = 1; ii < this.length; ii++) {
            if (this[ii] < min) {
                min = this[ii];
                index = ii;
            }
        }

        return [min, ii];
    };

    Array.prototype.minIndex = function() {
        return this.minWithIndex()[1];
    };
}

/**
 * function that finds positions of numbers that are 'neighbors'
 *  passed value
 *
 * @method getNeigborsIndexes
 * @param {Object} graphicObj - value itself
 */
if (!Array.prototype.getNeigborsIndexes) {
    Array.prototype.getNeigborsIndexes = function(value, start/*, direction*/) {
        // NOTE: this only works if numbers in array are growing
        var ii = start || 0;

        // target value is less (or equal) compared to 1st item
        if (value <= this[0]) {
            return [0];
        }

        // target value is bigger (or equal) compared to last item
        if (value > this.last()) {
            return [this.length - 1];
        }

        for ( ; ii < this.length; ii++) {
            if (value === this[ii]) {
                return [ii];
            }

            if (this[ii] < value && this[ii + 1] > value) {
                return [ii, ii + 1];
            }
        }

        return [];
    };
}

/**
 * helper function that finds value in set that is most spread in it
 * http://goo.gl/TA8i8T
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
        } else if (!Number.isInvalid(mapFunction)) {
            itemIndex = parseInt(mapFunction, 10);
            mapFunction = function(a) { return a; };
        } else {
            mapFunction = function(a) { return a; };
        }

        if (Number.isInvalid(itemIndex)) {
            itemIndex = 1;
        }

        var modeMap = {};
        var maxCount = 1;
        var modes = [mapFunction(this[0])];

        for (var ii = 0; ii < this.length; ii++) {
            var el = mapFunction(this[ii]);

            if (modeMap.hasOwnProperty(el)) {
                modeMap[el]++;
            } else {
                modeMap[el] = 1;
            }

            if (modeMap[el] > maxCount) {
                modes = [el];
                maxCount = modeMap[el];
            } else if (modeMap[el] === maxCount) {
                modes.push(el);
            }
        }

        return itemIndex > 0 ? modes[itemIndex - 1] : modes;
    };
}

/**
 * helper function that finds value in set that is most spread in it
 * http://goo.gl/TA8i8T
 *
 * @method getUnique
 * @param {Float} raw_value - value itself
 */
if (!Array.prototype.mode2) {
    Array.prototype.mode2 = function() {
        if (this.length === 0) {
            // original source used null here
            return 0;
        }

        var modeMap = {};
        var maxCount = 1;
        var modes = this[0];

        for (var ii = 0; ii < this.length; ii++) {
            var el = this[ii];

            if (modeMap.hasOwnProperty(el)) {
                modeMap[el]++;
            } else {
                modeMap[el] = 1;
            }

            if (modeMap[el] > maxCount) {
                modes = el;
                maxCount = modeMap[el];
            }
        }

        return modes;
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
            avgVal:  avgVal,
            length:  ii
        };

        for (ii -= 1; ii >= 0; ii--) {
            diffs.push(this[ii] - avgVal);
        }

        result.avgDiff = diffs.avg(true);
        return result;
    };
}

