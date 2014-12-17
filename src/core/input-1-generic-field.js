/**
 * Input module.
 */
InputField = function() {
    var fieldType = null;
    var fieldName = null;
    var idxDialog = null;

    /**
     * Returns localized name of the input by its internal name
     *
     * @return {String} localized name
     */
    this.getI18Name = function() {
        return _t('inputs.' + fieldName + '.name');
    };

    /**
     * Returns default value for input
     */
    this.getDefaultValue = function() {
        throw 'getDefaultValue should not be called';
    };

    /**
     * Returns initial value for input
     */
    this.getInitialValue = function() {
        throw 'getInitialValue should not be called';
    };

    /**
     * Returns runtime value for input
     * @param {Object} [dialog] ...
     * @return {Object} result
     */
    this.getRuntimeValue = function(dialog) {
        if (idxDialog === null) {
            //DEBUG_START
            _d(fieldName, 'getting value of input that was not inited');
            //DEBUG_STOP
            return this.getDefaultValue();
        }

        return dialogs[idxDialog].GetValue(this.getI18Name(fieldName));
    };

    return this;
})();

