/**
 * Input module.
 */
var ChannelInputField = (function() {
    var channel = function(name, options) {
        options           = options || {};
        options.type      = options.type || 'CHANNEL';
        options.doI18n    = false;

        DropdownInputField.apply(this, arguments);
        return this;
    };

    channel.prototype = new DropdownInputField();

    /**
     * Returns default value for this typeof input
     */
    channel.prototype.getDefaultValue = function() {
        return null;
    };

    /**
     * Returns initial value for input
     *
     * @return {String|Number|null} initial value for input name we passed
     */
    channel.prototype.getInitialValue = function() {
        var items = null;

        items = Utils.range(Host.Channels + 1);
        items.splice(0, 1, _t('inputs.combo.nothing'));

        return this._getDropDownContent(items);
    };

    return channel;
})();

Input.registerFieldType('CHANNEL', ChannelInputField);

