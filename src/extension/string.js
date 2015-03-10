/**
 * helper function that ...
 *
 * @method _clone_hash
 * @param {any type} value - value itself
 * @param {String} descr - string that will be print before value
 */
if (!String.prototype.rpad) {
    String.prototype.rpad = function(length, padString) {
        padString = padString || ' ';
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
    String.prototype.lpad = function(length, padString) {
        padString = padString || ' ';
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

/**
 * helper function that ...
 *
 * http://goo.gl/e5KUpq
 */
if (!String.prototype.capitalize) {
    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
}

