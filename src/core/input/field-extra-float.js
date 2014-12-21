/**
 * Input module.
 */
var FloatInputField = (function() {
    var real = function(name, options) {
        StringInputField.apply(this, arguments);
        return this;
    };

    real.prototype = new StringInputField();

    /**
     * Returns default value for input
     */
    real.prototype.getDefaultValue = function() {
        var usersValue = this.options.value;
        return (typeof usersValue === 'undefined' ? 1.0 : usersValue);
    };

    /**
     * Returns runtime value for input
     *
     * @param {String} [name] Internal name of the input
     * @param {String|Number} [value] raw value of the input
     *
     * @return {Object} result
     */
    real.prototype.getRuntimeValue = function() {
        var result = StringInputField.prototype.getRuntimeValue.apply(this);
        return result !== null ? parseFloat(result) : result;
    };

    return real;
})();

Input.registerFieldType('FLOAT', FloatInputField);

