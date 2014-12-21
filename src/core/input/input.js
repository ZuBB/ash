/**
 */
Input = (function() {
    // shorthand for separator
    var SEPARATOR = 'SEPARATOR';
    // defaults

    // for copy
    var inputFields = {};
    var dialogsContent = null;

    // internal
    //var fileDescriptor = Host.GetFileVD();
    var dialogs = [];
    var filledInputs = [];
    var typeHandlers = {};

    /**
     * Returns dialog/configuration object
     *
     * @param {Number} index internal index of configuration
     * @return {Object} real configuration object
     *
     * @private
     */
    var createDialog = function(index) {
        return Host.CreateConfigure('Dialog' + index);
    };

    /**
     * Checks if given input is known for this script
     *
     * @param {String} [name] Internal name of the input
     * @return {Boolean} result of the check
     */
    var isInputNameKnown = function(name) {
        if (typeof name !== 'string' || name.length === 0) {
            return false;
        }

        if (inputFields.hasOwnProperty(name) === false) {
            return false;
        }

        /*if (inputFields[name].hasOwnProperty('type') === false) {
            return false;
        }*/

        /*if (DATATYPE.hasOwnProperty(inputFields[name].type) === false) {
            return false;
        }*/

        return true;
    };

    //DEBUG_START
    /**
     * Returns localized name of the input by its internal name
     *
     * @private
     */
    var injectStopAfterInput = function() {
        if (Script.showStopAfterInput === false) {
            return true;
        }

        Script.dialogsContent.unshift('stop_after');
        Script.inputFields['stop_after'] = {
            i18n:  false,
            type:  'DROPDOWN',
            items: [].concat('', Dispatcher.listRegisteredTasks())
        };
    };
    //DEBUG_STOP

    var makeOOPInputs = function() {
        var inputFieldSpecs = JSON.parse(JSON.stringify(Script.inputFields));

        Object.keys(inputFieldSpecs).forEach(function(inputFieldName) {
            var specs = inputFieldSpecs[inputFieldName];

            if (typeHandlers.hasOwnProperty(specs.type) === false) {
                //DEBUG_START
                _e(specs.type, 'input `'+ inputFieldName + '` has unknown type');
                //DEBUG_STOP
                return false;
            }

            var _class = typeHandlers[specs.type];
            inputFields[inputFieldName] = new _class(inputFieldName, specs);
        });
        //DEBUG_START
        _d(Object.keys(StringInputField.prototype));
        //DEBUG_STOP
    };

    /**
     * Creates dialog window(s), and shows them.
     * Content of the dialogs is based on content of
     * {@link Script#dialogsContent} property. Specs of input fields are
     * taken from {@link Script#inputFields} property
     */
    var createConfiguration = function() {
        //DEBUG_START
        _p('');
        //DEBUG_STOP

        if (Array.isArray(Script.dialogsContent) === false) {
            //DEBUG_START
            _w("Can't create configuration. Options is not an array");
            //DEBUG_STOP
            return false;
        }

        //DEBUG_START
        injectStopAfterInput();
        makeOOPInputs();
        //DEBUG_STOP

        dialogsContent = Script.dialogsContent.slice(0);

        var result = true;
        var dialogIndex = 0;
        var dialogItems = 0;
        var inputName = null;
        var currentDialog = createDialog(dialogIndex);

        while (dialogsContent.length) {
            // lets retrieve first element
            inputName = dialogsContent.shift();

            // it its a function
            if (typeof inputName === 'function') {
                // execute it
                inputName = inputName();

                // convert to array if its not
                if (Array.isArray(inputName) === false) {
                    inputName = [inputName.toString()];
                }

                // append result at start
                dialogsContent = inputName.concat(dialogsContent);
                continue;
            }

            if (inputName === SEPARATOR) {
                dialogItems = dialogItems === 0 ? 0 : 7;
            } else if (isInputNameKnown(inputName)) {
                var inputField = inputFields[inputName];

                //DEBUG_START
                _d('*'.repeat(10))
                _d(inputName)
                _d(inputField)
                //DEBUG_STOP

                var i18nName = inputField.getI18Name();
                var value = inputField.getInitialValue();
                inputField.setDialogIndex(dialogIndex);

                filledInputs.push(inputName);
                currentDialog.AddItemEx(i18nName, inputName, value);
                dialogItems++;
            } else {
                //DEBUG_START
                _e(inputName, 'Next input field is not known');
                //DEBUG_STOP
                continue;
            }

            if (dialogItems === 7) {
                dialogItems = 0;

                if (currentDialog.Configure() === false) {
                    result = false;
                    break;
                }

                dialogs.push(currentDialog);
                currentDialog = createDialog(++dialogIndex);
            }
        }

        if (dialogItems > 0) {
            result = currentDialog.Configure();

            if (result) {
                dialogs.push(currentDialog);
            }
        }

        currentDialog = null;
        return result;
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

        return inputFields[name].getRuntimeValue();
    };

    //DEBUG_START
    //DEBUG_STOP
    /**
     * Returns names of inputs that were shown to user
     *
     * @return {Array} set of internal names of inputs
     */
    var getFilledInputs = function() {
        return filledInputs;
    };

    /**
     * Returns default value for input. Wrapper for private API call
     *
     * @param {String} [name] Internal name of the input
     * @return {String|Number|null} default value for input name we passed
     */
    var getDefaultValue = function(name) {
        return inputFields[name].getDefaultValue();
    };

    var getRawFieldValue = function(index, i18name) {
        return dialogs[index] ? dialogs[index].GetValue(i18name) : null;
    };

    var registerFieldType = function(typeName, _class) {
        if (!typeHandlers[typeName]) {
            typeHandlers[typeName]  = _class;
        }
    };

    return {
        'createConfiguration': createConfiguration,
        'getDefaultValue':     getDefaultValue,
        'getFilledInputs':     getFilledInputs,
        'getValue':            getValue,
      //'isInputNameKnown':    isInputNameKnown,

        'registerFieldType':   registerFieldType,
        'getRawFieldValue':    getRawFieldValue
    };

})();

