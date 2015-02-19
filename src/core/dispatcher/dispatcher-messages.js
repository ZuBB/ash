/**
 * Dispatcher class
 *
 * Manages process of script run
 *
 * Most public methods of this class are called automatically.
 * if your target is a 'quick start' {@link Dispatcher#registerNewTask}
 * is single method, which you should pay attention for.
 *
 * @singleton
 * @class
 */
Dispatcher = (function() {
    /**
     * @property {Object} messageTypes = null
     * @private
     *
     * A dictionary for all type of messages that will be collected during
     * script execution. For details see
     * {@Dispatcher#createMessageStorage} method
     */
    var messageTypes = null;

    /**
     * Creates storage for different types of messages listed in
     * {@link Script#messagePrintProps} property.
     *
     * @private
     */
    this.createMessageStorage = function() {
        messageTypes = JSON.parse(JSON.stringify(Script.messagePrintProps));

        for (var item in messageTypes) {
            if (messageTypes.hasOwnProperty(item)) {
                messageTypes[item].messages = [];
            }
        }
    };

    /**
     * Lists verified message types
     *
     * @return {Array} known and verified message types
     */
    this.listMessageTypes = function() {
        return Object.keys(messageTypes);
    };

    /**
     * Method that stores all type of messages that are being produced
     * by tasks
     *
     * Message types are defined in {@link Script#messagePrintProps property}.
     *
     * @param {String} [messageType] name of the message type
     * @param {String|Array|Object} [message] message that should be printed.
     * Can be passed in 3 acceptable types
     *
     * @return {Boolean} result of the action execution
     */
    this.addMessage = function(messageType, message) {
        if (typeof messageType !== 'string' || messageType.length === 0) {
            //DEBUG_START
            _e('[Dispatcher::addMessage]: invalid message type');
            //DEBUG_STOP
            return false;
        }

        if (messageTypes.hasOwnProperty(messageType) === false) {
            //DEBUG_START
            _e('[Dispatcher::addMessage]: unknown message type');
            //DEBUG_STOP
            return false;
        }

        messageTypes[messageType].messages.push(message);
        return true;
    };

    /**
     * Prints all messages for all type of messages that were collected during
     * script execution
     *
     * Short note on localization of messages and headers describing their
     * types
     *
     * Each header is automatically translated by this function. To get this
     * working you need to have next line in localization resource file
     * for each type of message
     *
     * ```
     * report.messages.MY_MESSAGE_TYPE = Сообщения
     * ```
     *
     * Each message can be also automatically translated by this function.
     * To get this working you need to have line with key you passed
     * as 2nd param in * {@link Dispatcher#addMessage} method in your
     * localization resource file. See next example
     *
     * ```
     * ...
     * // somewhere in your task
     * this.addSuccess('my.super.key');
     * ...
     * ```
     *
     * To get it automatically translated before printing you need to add next
     * line to localization resource file
     *
     * ```
     * # line with exactly that key
     * my.super.key = Измерения были успешно завершены
     * ```
     *
     * @private
     */
    this.printMessages = function() {
        var onetimeMessages = [];
        var printMessageFunc = function(item) {
            var message = item.skipTranslation ?
                item.message : _t.apply(null, item.message);
            var controlChars = item.controlChars ||
                messageTypes[type].messageControlChars;

            if (item.phrase === true) {
                _rw(message, controlChars);
            } else {
                _rl(message, controlChars);
            }
        };
        var filterMessagesFunc = function(item) {
            if (item.message[0] === '') {
                return true;
            }

            if (item['onetime'] !== true) {
                return true;
            }

            if (onetimeMessages.indexOf(item.message[0]) > -1) {
                return false;
            }

            onetimeMessages.push(item.message[0]);
            return true;
        };

        for (var type in messageTypes) {
            if (messageTypes.hasOwnProperty(type)) {
                if (messageTypes[type].messages.length === 0) {
                    continue;
                }

                if ((messageTypes[type].skipHeader === true) === false) {
                    _rp(_t('report.messages.' + type),
                            messageTypes[type].headerControlChars);
                }

                messageTypes[type].messages
                    .filter(filterMessagesFunc)
                    .forEach(printMessageFunc);
            }
        }
    };

    // schedule method in parenthes to be run
    this.schedulePreProcessMethod({
        'index':  0,
        'method': 'createMessageStorage'
    });

    // schedule method in parenthes to be run
    this.schedulePostProcessMethod({
        'index':  90,
        'method': 'printMessages'
    });

    return this;
}).apply(Dispatcher);

