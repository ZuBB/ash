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
 * function that ...
 *
 * @method getDefaultValue
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
 * function that ...
 *
 * @method createConfiguration
 */
Input.createConfiguration = function(items, possibleInputs) {
    if (Array.isArray(items) === false || items.length < 1) {
        //DEBUG_START
        _e('Can not create configuration(s). Check options you passed');
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
 * function that ...
 *
 * @method getInputI18Name
 */
Input.getInputI18Name = function(name) {
    return this.possible_fields[name].hasOwnProperty('name') ?
        this.possible_fields[name].name : _t('inputs.' + name + '.name');
};

/**
 * function that ...
 *
 * @method isInputNameKnown
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
 * function that ...
 *
 * @method getRawValue
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
        _w(name, 'attempt to get a value that is not inited yet');
        //DEBUG_STOP
        return null;
    }

    return this.dialogs[index].GetValue(this.getInputI18Name(name));
};

/**
 * function that ...
 *
 * @method getValue
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

