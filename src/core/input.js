/**
 * Input module.
 *
 * Allows nice handling of tasks related to inputs, dialog
 * and stuff related to it
 *
 * If script needs from user any external data it needs to show dialog(s)
 * with input fields in it.
 *
 * By default neither (see {@link Script#inputFields} property) nor content
 * of dialogs (see {@link Script#dialogsContent} property) are defined.
 *
 * To change that you need to define value of `Script.inputFields` property
 * in next file
 *
 * ```
 * src/app/input_fields.js
 * ```
 *
 * This file may looks like this
 *
 * ```
 * // A hash with all possible input fields that will ever will be used
 * // in dialog(s) for this script
 * Script.inputFields = {
 *     'input1': {
 *         type: 'INT'
 *     },
 *     'input2': {
 *         type: 'FLOAT'
 *     },
 *     'input3': {
 *         type: 'STRING'
 *     },
 *     'input4': {
 *         type: 'DROPDOWN',
 *         value: ['inputs.dropdown.no', 'inputs.dropdown.yes']
 *     }
 * };
 * ```
 *
 * As you can see its a dictionary with key/value pairs
 *
 * Each key is an internal name of the input that is used everywhere in script.
 * Even if this is not stated directly you need to keep in mind that.
 *
 * While specifying inputs you need to follow 2 simple rules:
 *
 * - internal name (key of dictionary) of the input should be unique
 * - dictionary which defines attributes of input should have at least one
 *   of the next keys:
 *
 *      - `value` - default value
 *      - `type` - default type
 *
 * For inputs you can specify one of these data types:
 *
 * - `INT`
 * - `FLOAT`
 * - `STRING`
 * - `DROPDOWN` this type of input will have form of dropdown with items that
 *   **must** be specified as `value` property
 * - `CHANNEL` also will look like dropdown. Content of it is created
 *   automatically. passed `value` property of this input will be ignored
 * - `CHANNELS` same as *channel*. Channel numbers should be separated with
 *   comma (`,`)
 * - `FILESCOMBO` produces dropdown list with files from specified directory as items
 *
 * As for values here you have next options:
 *
 * - `Number` - any of integer of float numbers
 * - `String` - any string
 * - `Array` - as we already said this is for dropdown
 *
 *
 * Content of dialogs may be (re)defined as value of `Script.dialogsContent`
 * variable in next file
 *
 * ```
 * src/app/dialogs.js
 * ```
 *
 * Here is an example of possible content for that file
 *
 * ```
 * Script.dialogsContent = [
 *     'input1',
 *     'SEPARATOR',
 *     'input2',
 *     'input3',
 *     'input4',
 *     'input5',
 *     'input6',
 *     'input7',
 *     function(){
 *         return Input.getValue('input1') === 'I want more!' ? [] : [
 *             'input8',
 *             'input9',
 *         ];
 *     },
 *     'input0'
 * ];
 * ```
 *
 * As you can see 3 types of items are supported here:
 *
 * - name of the input
 * - `Input.separator` This an alias to item that does next trick: adding it
 *   to dialog is a tricky way to say "*its enough for this dialog to have
 *   inputs, lets push next items into new dialog*". Also it causes current
 *   dialog window to be shown and wait for user's input
 * - anonymous function that should return an array. When
 *   {@link Input#createConfiguration} meets function, it evaluates it and
 *   replaces it with result that function returned. This allows dynamically
 *   create dialog(s) content
 *
 * Dialog(s) are created and processed automatically if both
 * {@link Script#dialogsContent} and {@link Script#inputFields} properties
 * are not empty and have valid content
 *
 * To have inputs in dialogs automatically translated you need to add to
 * resource localization file line like next for each input you have defined
 * in your `src/app/input_fields.js` file
 *
 * ```
 * inputs.YOUR_INPUT_INTERNAL_NAME.name = Введиде пожалуйста число
 * ```
 *
 * @class
 */
Input = (function() {
    // shorthand for separator
    var SEPARATOR = 'SEPARATOR';
    // defaults
    var DATATYPE = {
        'INT': {
            'initialValue': function(value) {
                return typeof value === 'undefined' ?
                    DATATYPE.INT.defaultValue() : value;
            },
            'defaultValue': function(value) {
                return typeof value === 'undefined' ? 0 : value;
            },
            'runtimeValue': function(rawValue) {
                var parsedValue = parseInt(rawValue, 10);
                return Utils.isNumberInvalid(parsedValue) ?
                    DATATYPE.INT.defaultValue() : parsedValue;
            }
        },
        'FLOAT': {
            'initialValue': function(value) {
                return typeof value === 'undefined' ?
                    DATATYPE.FLOAT.defaultValue() : value;
            },
            'defaultValue': function(value) {
                return typeof value === 'undefined' ? 0 : value;
            },
            'runtimeValue': function(rawValue) {
                var parsedValue = parseFloat(rawValue);
                return Utils.isNumberInvalid(parsedValue) ?
                    DATATYPE.FLOAT.defaultValue() : parsedValue;
            }
        },
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
        },
        'DROPDOWN': {
            'initialValue': function(index, name) {
                return getDropDownContent(inputFields[name].items, index);
            },
            'defaultValue': function() {
                return 0;
            },
            'runtimeValue': function(value, name) {
                var isItemAllowedToReturn = function(name) {
                    if (inputFields[name].hasOwnProperty('items') === false) {
                        return false;
                    }

                    return !inputFields[name].items.every(function(item) {
                        return typeof item === 'string';
                    });
                };

                if (inputFields[name].hasOwnProperty('values')) {
                    return inputFields[name].values[value];
                } else if (isItemAllowedToReturn(name)) {
                    return inputFields[name].items[value];
                } else {
                    return value;
                }
            }
        },
        'CHANNEL': {
            'initialValue': function(index) {
                var items = Utils.range(Host.Channels + 1);
                items.splice(0, 1, '---');
                return getDropDownContent(items, index);
            },
            'defaultValue': function() {
                // if input with type channel was not inited,
                // than we need to do a direct reply with most strict answer
                return null;
            },
            'runtimeValue': function(rawValue) {
                var channel = parseInt(rawValue, 10);
                var checks = [
                    function(channel) { return typeof channel === 'number'; },
                    function(channel) { return channel <= Host.Channels; },
                    function(channel) { return !isNaN(channel); },
                    function(channel) { return channel > 0; }
                ];

                var result = checks.every(function(f) { return f(channel); });
                return result ? channel : null;                
            }
        },
        'CHANNELS': {
            'initialValue': function(value) {
                return value || DATATYPE.channel.defaultValue();
            },
            'defaultValue': function() {
                return '1, ';
            },
            'runtimeValue': function(rawValue) {
                return rawValue.split(/\s?,\s?/)
                    .map(function(item) {
                        return DATATYPE.channel.runtimeValue(item);
                    })
                    .filter(function(item) { return item !== null; });
            }
        },
        'FILESDROPDOWN': {
            'initialValue': function(index, name) {
                var path = inputFields[name].path;
                var items = [].concat('', IO.getDirFiles(path));

                if (inputFields[name].stripText) {
                    items = items.map(function(item) {
                        return item.replace(inputFields[name].stripText, '');
                    });
                }

                return getDropDownContent(items, index);
            },
            'defaultValue': function() {
                return null;
            },
            'runtimeValue': function(value, name) {
                var path = IO.getSafeDirPath(inputFields[name].path);
                // we need '-1' here because by default filesdropdown gets blank
                // item as 1st item of dropdown so indexed are shifted a bit
                return IO.buildPath(path, IO.getDirFiles(path)[value - 1]);
            }
        },
        'TOGGLE': {
            'initialValue': function(index, name) {
                return getDropDownContent(inputFields[name].items, index);
            },
            'defaultValue': function() {
                return null;
            },
            'runtimeValue': function(value) {
                return value === 1;
            }
        }
    };

    // for copy
    var inputFields = null;
    var dialogsContent = null;

    // internal
    //var fileDescriptor = Host.GetFileVD();
    var input2dialogMap = {};
    var dialogs = [];

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
     * Returns content ready to be set as dropdown items
     *
     * @param {Array} items List of dropdown items
     * @return {String} stringified dropdown content
     *
     * @private
     */
    var getDropDownContent = function(items/*, selectedIndex*/) {
        // TODO take into account previously selected item
        if (items && Array.isArray(items) && items.length > 1) {
            var func = function(item) { return _t(item.toString()); };
            return items.map(func).join('\n');
        } else {
            return '\n';
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
     * Checks if given input is known for this script
     *
     * @param {String} name Internal name of the input
     * @return {Boolean} localized name
     *
     * @private
     */
    var isInputNameKnown = function(name) {
        if (typeof name !== 'string' || name.length === 0) {
            return false;
        }

        if (inputFields.hasOwnProperty(name) === false) {
            return false;
        }

        if (inputFields[name].hasOwnProperty('type') === false) {
            return false;
        }

        if (DATATYPE.hasOwnProperty(inputFields[name].type) === false) {
            return false;
        }

        return true;
    };

    /**
     * Returns localized name of the input by its internal name
     *
     * @param {String} name Internal name of the input
     * @return {String} localized name
     *
     * @private
     */
    var getInputI18Name = function(name) {
        var key = 'inputs.' + name + '.name';
        var translation = _t(key);

        if (translation === key) {
            translation = Script.inputFields[name].name;
        }

        return translation || key;
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

        inputFields = JSON.parse(JSON.stringify(Script.inputFields));
        dialogsContent = Script.dialogsContent.slice(0);

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
                var i18nName = getInputI18Name(inputName);
                var value = getInitialValue(inputName);

                input2dialogMap[inputName] = dialogIndex;
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
                currentDialog.Configure();
                dialogs.push(currentDialog);
                currentDialog = createDialog(++dialogIndex);
            }
        }

        if (dialogItems > 0) {
            currentDialog.Configure();
            dialogs.push(currentDialog);
        }

        currentDialog = null;
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
            _i(name, 'getting value of input that was not inited');
            //DEBUG_STOP
            return _getDefaultValue(name);
        }

        var rawValue = dialogs[index].GetValue(getInputI18Name(name));
        return getRuntimeValue(name, rawValue);
    };

    /**
     * Returns names of inputs that were shown to user
     *
     * @return {Array} set of internal names of inputs
     */
    var getFilledInputs = function() {
        return Object.keys(input2dialogMap);
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

    return {
        'createConfiguration': createConfiguration,
        'getDefaultValue':     getDefaultValue,
        'getFilledInputs':     getFilledInputs,
        'getValue':            getValue
    };

})();

