/**
 * Input module.
 */
var DropdownInputField = (function() {
    var dropdown = function(name, options) {
        options           = options || {};
        options.type      = options.type || 'DROPDOWN';
        options.doI18n    = options.doI18n || true;

        InputField.apply(this, arguments);
        return this;
    };

    /**
     * Returns default value for this typeof input
     */
    dropdown.prototype.getDefaultValue = function() {
        return 0;
    };

    /**
     * Returns initial value for input
     *
     * @return {String|Number|null} initial value for input name we passed
     */
    dropdown.prototype.getInitialValue = function(/* index */) {
        return this._getDropDownContent(this.options.items);
    };

    /**
     * Returns runtime value for input
     *
     * @return {Object} result
     */
    dropdown.prototype.getRuntimeValue = function() {
        var value = InputField.prototype.getRawFieldValue.apply(this);
        var that = this;

        var canWeUseDataFromItems = function() {
            if (that.options.hasOwnProperty('items') === false) {
                return false;
            }

            return !that.options.items.every(function(item) {
                return typeof item === 'string';
            });
        };

        if (this.options.values && Array.isArray(this.options.values)) {
            return this.options.values[value];
        } else if (canWeUseDataFromItems()) {
            return this.options.items[value];
        } else {
            return value;
        }
    };

    dropdown.prototype._getDropDownContent = function(items) {
        if ((items && Array.isArray(items) && items.length > 1) === false) {
            return '\n';
        }

        return items
            .map(function(item) {
                var result = item.toString();

                result = item.indexOf('.') === 0 ?
                        ('inputs.' + this.name + item) : item;

                if (this.doI18n === true) {
                    result = _t(result);
                }

                return result;
            })
            .join('\n');
    };

    return dropdown;
})();

Input.registerFieldType('DROPDOWN', DropdownInputField);

