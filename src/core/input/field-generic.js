/**
 * Input module.
 */
var InputField = (function() {
    var input = function(name, options) {
        this.dialogIndex = null;
        this.options = null;
        this.name = null;

        if (typeof name === 'string' && name.length > 0) {
            this.name = name;
        }

        if (typeof options !== 'undefined') {
            this.options = options;
        }
    };

    /**
     * Returns localized name of the input by its internal name
     *
     * @return {String} localized name
     */
    input.prototype.getI18Name = function() {
        return _t('inputs.' + this.name + '.name');
    };

    /**
     * ...
     */
    input.prototype.setDialogIndex = function(index) {
        if (index === 'number' && index > -1) {
            this.dialogIndex = index;
        }
    };

    /**
     * Returns default value for input
     */
    input.prototype.getDefaultValue = function() {
        throw 'getDefaultValue should not be called';
    };

    /**
     * Returns initial value for input
     */
    input.prototype.getInitialValue = function() {
        throw 'getInitialValue should not be called';
    };

    /**
     * Returns runtime value for input
     * @param {Object} [dialog] ...
     * @return {Object} result
     */
    input.prototype.getRuntimeValue = function() {
        if (this.dialogIndex === null) {
            //DEBUG_START
            _d(this.name, 'getting value of input that was not inited');
            //DEBUG_STOP
            return this.getDefaultValue();
        }

        return Input.getRawFieldValue(this.dialogIndex, this.getI18Name());
    };

    return input;
})();

