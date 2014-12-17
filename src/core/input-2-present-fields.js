/**
 * Input module.
 */
var StringInputField = function() {
    // defaults
    var DATATYPE = {
        'STRING': {
            'initialValue': function(value) {
                // maybe check for 'undefined' will be better here
                return value === null ? DATATYPE.STRING.defaultValue() : value;
            },
            'defaultValue': function(value) {
                return typeof value === 'undefined' ? '' : value;
            },
            'runtimeValue': function(rawValue) {
                return rawValue.toString();
            }
        }
    };

    /**
     * Returns initial value for input
     *
     * @param {String} [name] Internal name of the input
     * @return {String|Number|null} initial value for input name we passed
     *
     * @private
     */
    var getInitialValue = function(name) {
        var inputType = inputFields[name].type;
        var value = inputFields[name].value;

        //value = DATATYPE[inputType].defaultValue(value);
        //value = fileDescriptor.GetVariable(name, value);
        value = DATATYPE[inputType].initialValue(value, name);

        return value;
    };

    /**
     * Returns default value for input
     *
     * @param {String} [name] Internal name of the input
     * @return {String|Number|null} default value for input name we passed
     *
     * @private
     */
    var _getDefaultValue = function(name) {
        var value = inputFields[name].value;
        var inputType = inputFields[name].type;
        return DATATYPE[inputType].defaultValue(value, name);
    };

    /**
     * Returns runtime value for input
     *
     * @param {String} [name] Internal name of the input
     * @param {String|Number} [value] raw value of the input
     * @return {String|Number|Boolean} runtime value for input name we passed
     *
     * @private
     */
    var getRuntimeValue = function(name, value) {
        //fileDescriptor.SetVariable(name, value);
        var inputType = inputFields[name].type;
        return DATATYPE[inputType].runtimeValue(value, name);
    };

    /**
     * Returns value that was entered by user by given input name
     * That value is additionally casted to type that was defined on input creation
     *
     * @param {String} name Internal name of the input
     * @return {Object} result
     */
    var getValue = function(name) {
        if (!isInputNameKnown(name)) {
            //DEBUG_START
            _e(name, 'Input: attempt to access value with nonexistent name');
            //DEBUG_STOP
            return void(0);
        }

        var index = input2dialogMap[name];

        if (typeof(index) === 'undefined') {
            //DEBUG_START
            _d(name, 'getting value of input that was not inited');
            //DEBUG_STOP
            return _getDefaultValue(name);
        }

        var rawValue = dialogs[index].GetValue(getInputI18Name(name));
        return getRuntimeValue(name, rawValue);
    };

    /**
     * Returns default value for input. Wrapper for private API call
     *
     * @param {String} [name] Internal name of the input
     * @return {String|Number|null} default value for input name we passed
     */
    var getDefaultValue = function(name) {
        return _getDefaultValue(name);
    };

})();

Input.registerFieldType('string', StringInputField);
