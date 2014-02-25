/**
 * Input module.
 *
 * Allows nice handling of tasks related to inputs, dialog
 * and stuff related to it
 *
 * If script needs from user any external data it needs to show dialog(s)
 * with input fields in it.
 *
 * By default inputs script does not know any inputs (see
 * {@link Script#inputFields} property) and content of dialogs is also not set
 * (see {@link Script#dialogsContent} property))
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
 *         type: 'int'
 *     },
 *     'input2': {
 *         type: 'float'
 *     },
 *     'input3': {
 *         type: 'string'
 *     },
 *     'input4': {
 *         type: 'combobox',
 *         value: ['inputs.combo.no', 'inputs.combo.yes']
 *     },
 *     'input5': {
 *         value: function() {
 *             return 'a' + 'b';
 *         }
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
 * - internal name (key of dictionary) of input should be unique
 * - dictionary which defines attributes of input should have at least of next
 *   keys:
 *
 *      - `value` - default value
 *      - `type` - default type
 *
 * For inputs you can specify one of 4 available data types:
 *
 * - `int` - integer numbers
 * - `float` - number with floating poing
 * - `string` - string
 * - `combobox` - means this input will have form of dropdown with items that
 *   **must** be specified as `value` property
 *
 * As for values here you have even more freedom:
 *
 * - `Number` - any of integer of floaft numbers
 * - `String` - any string
 * - `Array` - as we alread said its for combobox
 * - `Function` - allows define default value that will be dynamically
 *   calculated
 * - **CONSTANT**s. You can even set default value to previously defined
 *   constant from `src/app/constants.js` file (that's a user defined constants)
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
 *     Input.separator,
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
Input = {
    dialogIndex:   0,
    input2dialogMap: {},
    createdInputs: [],
    dialogs: []
};

// shorthand for separator
Input.separator = 'SEPARATOR';
// default values
Input.DEFAULT_VALUE = {
    // we use any negative value for sending signal that
    // current option should not be used at all
    'int': -1,
    // we forced to append a fractional part to have possibility
    // to pass fractional values into graph scripts
    'float': -1.1,
    // string
    'string': ''
};

/**
 * Returns default value for input
 *
 * @param {String} name Internal name of the input
 * @return {String} default value for input name we passed
 *
 * @member Input
 * @private
 */
Input.getDefaultValue = function(name) {
    if ('value' in this.possible_fields[name]) {
        if (typeof this.possible_fields[name].value === 'function') {
            return this.possible_fields[name].value();
        } else if (Array.isArray(this.possible_fields[name].value)) {
            var comboItems = [];
            var length = this.possible_fields[name].value.length;

            for (var ii = 0; ii < length; ii++) {
                comboItems.push(_t(this.possible_fields[name].value[ii]));
            }

            return comboItems.join('\n');
        } else {
            return this.possible_fields[name].value;
        }
    }

    var type = this.possible_fields[name].type;
    if (type && typeof Input.DEFAULT_VALUE[type] !== 'undefined') {
        return Input.DEFAULT_VALUE[type];
    }

    //DEBUG_START
    _w(name, 'Next config option needs love');
    //DEBUG_STOP
    return -1;
};

/**
 * Creates dialog window(s), and shows them.
 * Content of dialog(s) based on content of `Script.dialogsContent` variable
 * Specs of input field(s) are taken from `Script.inputFields` variable
 *
 * @member Input
 * @private
 */
Input.createConfiguration = function() {
    var items = Script.dialogsContent;
    var possibleInputs = Script.inputFields;

    if (Array.isArray(items) === false) {
        //DEBUG_START
        _w("Can't create configuration. Options is not an array");
        //DEBUG_STOP
        return;
    }

    var currentDialog = Host.CreateConfigure('Dialog' + this.dialogIndex);
    this.possible_fields = possibleInputs;
    var internal_name = null;
    var dialogItems = 0;

    while (items.length) {
        if (typeof (internal_name = items.shift()) === 'function') {
            items = internal_name().concat(items);
            continue;
        }

        if (internal_name !== Input.separator) {
            if (this.isInputNameKnown(internal_name)) {
                this.input2dialogMap[internal_name] = this.dialogIndex;
                var i18n_name = this.getInputI18Name(internal_name);
                var value = this.getDefaultValue(internal_name);
                currentDialog.AddItem(i18n_name, value);
                this.createdInputs.push(internal_name);
                dialogItems++;
            } else {
                //DEBUG_START
                _e(internal_name, 'Next input field is not known');
                //DEBUG_STOP
            }
        } else {
            dialogItems = dialogItems === 0 ? 0 : 7;
        }

        if (dialogItems === 7) {
            dialogItems = 0;
            this.dialogIndex++;
            currentDialog.Configure();
            this.dialogs.push(currentDialog);
            currentDialog = Host.CreateConfigure('Dialog' + this.dialogIndex);
        }
    }

    if (dialogItems > 0) {
        currentDialog.Configure();
        this.dialogs.push(currentDialog);
    }

    currentDialog = null;
};

/**
 * Returns localized name of the input by its internal name
 *
 * @param {String} name Internal name of the input
 * @return {String} localized name
 *
 * @member Input
 * @private
 */
Input.getInputI18Name = function(name) {
    return this.possible_fields[name].hasOwnProperty('name') ?
        this.possible_fields[name].name : _t('inputs.' + name + '.name');
};

/**
 * Checks if given input is known for this script
 *
 * @param {String} name Internal name of the input
 * @return {Boolean} localized name
 *
 * @member Input
 * @private
 */
Input.isInputNameKnown = function(name) {
    if (!name) {
        return false;
    }

    if (typeof this.possible_fields[name] === 'undefined') {
        return false;
    }

    if (!(this.possible_fields[name].type ||
                this.possible_fields[name].value)) {
        return false;
    }

    return true;
};

/**
 * Returns raw value that was entered by user by given input name
 * That value is not casted to type that was defined on input creation
 *
 * @param {String} name Internal name of the input
 * @return {Object} result
 *
 * @member Input
 * @private
 */
Input.getRawValue = function(name) {
    if (!this.isInputNameKnown(name)) {
        //DEBUG_START
        _e(name, 'Input: attempt to access value with nonexistent name');
        //DEBUG_STOP
        return []._undefined;
    }

    var index = this.input2dialogMap[name];

    if (typeof(index) === 'undefined') {
        if (this.possible_fields[name].type === 'combobox') {
            return 0;
        }

        //DEBUG_START
        _i(name, 'attempt to get a value that is not inited yet');
        //DEBUG_STOP
        return null;
    }

    return this.dialogs[index].GetValue(this.getInputI18Name(name));
};

/**
 * Returns value that was entered by user by given input name
 * That value is additionally casted to type that was defined on input creation
 *
 * @param {String} name Internal name of the input
 * @return {Object} result
 *
 * @member Input
 */
Input.getValue = function(name) {
    var raw_value = this.getRawValue(name);
    var parsedValue = null;

    if (typeof raw_value === 'undefined') {
        return raw_value;
    }

    if (this.possible_fields[name].type === 'int') {
        parsedValue = parseInt(raw_value, 10);
        return isNaN(parsedValue) ? raw_value : parsedValue;
    }

    if (this.possible_fields[name].type === 'float') {
        parsedValue = parseFloat(raw_value);
        return isNaN(parsedValue) ? raw_value : parsedValue;
    }

    return raw_value;
};

