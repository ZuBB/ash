/**
 * Input module.
 */
var IntegerInputField = (function() {
    var integer = function(name, options) {
        StringInputField.apply(this, arguments);
        return this;
    };

    integer.prototype = new StringInputField();

    /**
     * Returns default value for input
     */
    integer.prototype.getDefaultValue = function() {
        var usersValue = this.options.value;
        return (typeof usersValue === 'undefined' ? 1 : usersValue);
    };

    /**
     * Returns runtime value for input
     *
     * @param {String} [name] Internal name of the input
     * @param {String|Number} [value] raw value of the input
     *
     * @return {Object} result
     */
    integer.prototype.getRuntimeValue = function() {
        var result = StringInputField.prototype.getRuntimeValue.apply(this);
        return result !== null ? parseInt(result, 10) : result;
    };

    return integer;
})();

Input.registerFieldType('INT', IntegerInputField);

