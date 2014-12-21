/**
 * Input module.
 */
var StringInputField = (function() {
    var str = function(name, options) {
        options = options || {};
        options = options.type || 'STRING';

        InputField.apply(this, arguments);
        return this;
    };

    str.prototype = new InputField();

    /**
     * Returns default value for input
     */
    str.prototype.getDefaultValue = function() {
        var usersValue = this.options.value;
        return (typeof usersValue === 'undefined' ? '' : usersValue);
    };

    /**
     * Returns initial value for input
     *
     * @return {String|Number|null} initial value for input name we passed
     */
    str.prototype.getInitialValue = this.getDefaultValue;

    /**
     * Returns runtime value for input
     *
     * @param {String} [name] Internal name of the input
     * @param {String|Number} [value] raw value of the input
     *
     * @return {Object} result
     */
    str.prototype.getRuntimeValue = function() {
        var result = InputField.prototype.getRuntimeValue.apply(this);
        return result !== null ? result.toString() : result;
    };

    return str;
})();

Input.registerFieldType('STRING', StringInputField);

