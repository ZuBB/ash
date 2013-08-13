/**
 * helper function that ...
 *
 * @method _clone_hash
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 */
if (!String.prototype.rpad) {
    String.prototype.rpad = function(padString, length) {
        var str = this;
        while (str.length < length) {
            str = str + padString;
        }

        return str;
    };
}

/**
 * helper function that ...
 *
 * @method _clone_hash
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 */
if (!String.prototype.lpad) {
    String.prototype.lpad = function(padString, length) {
        var str = this;
        while (str.length < length) {
            str = padString + str;
        }

        return str;
    };
}

/**
 * helper function that ...
 *
 * @method _clone_hash
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 * http://stackoverflow.com/questions/202605/repeat-string-javascript
 */
if (!String.prototype.repeat) {
    String.prototype.repeat = function(count) {
        return new Array(count + 1).join(this);
    };
}

