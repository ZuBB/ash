//DEBUG_START
/**
 * **Logger** library. Inspired from Ruby's one
 *
 * Logging is an alternative way to do debugging instead of constant playing
 * with breakpoints, stepping into/over/out and inspecting variables you
 * interested in with help of your favourite IDE.
 *
 * Its possible to print to log object of any type
 *
 * ```
 * _d(true);
 * ```
 *
 * or content of any variable
 *
 * ```
 * var a = [1, 4, 'hi'];
 * _d(a);
 * ```
 *
 * For your convience you may pretend those value with some descriptive text
 * message
 *
 * ```
 * _d(a, 'my custom array');
 * ```
 *
 * You may want to distinguish log messages with some importance level.
 * To help you with this task we have next log levels
 *
 * - `debug` - used to print debug messages; shortcut function - `_d()`
 * - `info`  - used to print inforational messages; shortcut function - `_i()`
 * - `warn`  - used to print warning messages; shortcut function - `_w()`
 * - `error` - used to print error messages; shortcut function - `_e()`
 * - `fatal` - used to print fatal error messages; shortcut function - `_f()`
 *
 * To help you to track state of your log file we print amount of *warn*,
 * *error* and *fatal* messages in report tab after all text you print there.
 *
 * Logging is quite useful in development mode, however its absolutely useless
 * in production version of script. Adding (and further removing) log
 * expressions in your files is not a deal. We have really nice solution for
 * this issue. You need to wrap your log commangs with special type of
 * comments and they will be stripped from final version of script if you
 * build it using release target. Format of that magic comments is next
 *
 * ```
 * // DEBUG_START
 * _d('I want to have this message only in development mode');
 * // DEBUG_STOP
 * ```
 *
 * You can do logging at any place you want and any amount you need. Single
 * limit here is a free space on your hard drive
 *
 * There are 3 notes on usage of those comments
 *
 * - there **should not** be a space between `//` and `D` letter
 * - make sure every `DEBUG_START` comment has its own `DEBUG_STOP` pair.
 *   Missing one of them causes absolutely weird bugs that are very hard to fix
 * - make sure context of two pairs of DEBUG_{START,STOP} is not intersected.
 *   This also causes absolutely weird bugs that are very hard to resolve
 *
 * There are couple of edge cases where Logger fails to inspect passed values:
 *
 * - MVC/C objects that are not from JavaScript world. Under this you should
 * understant objects that are created by functions like
 * `Host.CreateGraphic` or `Host.CreateGraphicView`
 * - Array with items that are not simple JavaScript objects.
 *   Here is an example
 *
 * ```
 * _d([{a: 1}, {b: 'hi'}])
 * ```
 *
 * In log file you will get somethig like this
 *
 * ```
 * DEBUG [[Object object], [Object object]]
 * ```
 *
 * If you really need to solve this puzzle there is a workaround to do that
 *
 * ```
 * _d(JSON.stringify([{a: 1}, {b: 'hi'}], null, 4));
 * ```
 *
 * Location of the log file is hardcoded. There are two options where it can
 * be located.
 *
 * - if script that is run is located in `build/output` dir of project where
 *   development of script is done, log file will appears at root dir (`./`)
 *   of the project and will have `NAME_OF_YOUR_SCRIPT-last-log.txt` name.
 *   Log files will be rotated to `./logs` dir
 * - in all other cases log file will be within same dir as script does.
 *   Log files will be rotated to `./NAME_OF_YOUR_SCRIPT-logs` dir
 */
Logger = (function() {
    var buffer = [];
    var module = {};
    var fileHandler = null;
    var currentLogLevel = null;
    var levels = ['DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'];
    var stats = {
        'WARN ': {count: 0, symbol: '.', color: 0xFF9100},
        'ERROR': {count: 0, symbol: '*', color: 0xFF0000},
        'FATAL': {count: 0, symbol: '@', color: 0xD900FF}
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method init
     */
    module.init = function() {
        module.setLogLevel();

        if (initFSHandler()) {
            while (Array.isArray(buffer) && buffer.length) {
                module.log(buffer.shift());
            }
        }

        buffer = null;
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method setLogLevel
     */
    module.setLogLevel = function() {
        currentLogLevel = parseInt(Script.logLevel, 10) || 0;
    };

    /**
     * function that ...
     *
     * @private
     */
    var initFSHandler = function() {
        var logPath     = IO.getSafeNeighbourPath();
        var result      = false;

        var fileHandlerOptions = {
            filedir: [Host.CurPath, logPath],
            filename: Script.name + '-last-log.txt',
            backupDir: [Host.CurPath, logPath, 'logs'],
            backupName: function(FSObject, filePath) {
                var backTimeStr = FSObject.GetFile(filePath).DateLastModified;
                var backname = new Date(Date.parse(backTimeStr));

                backname =
                    backname.getFullYear() + '.' +
                    (backname.getMonth() + 1).toString().lpad(2, '0') + '.' +
                    backname.getDate().toString().lpad(2, '0') + '_' +
                    backname.getHours().toString().lpad(2, '0') + '-' +
                    backname.getMinutes().toString().lpad(2, '0') + '-' +
                    backname.getSeconds().toString().lpad(2, '0');

                return filePath.replace(/last/, backname);
            }
        };

        if ((fileHandler = IO.createFile(fileHandlerOptions)) !== null) {
            var message = '';
            message += 'File: \'' + fileHandler.getFilePath();
            message += '\' will be used for external logging';
            _rp(message);
            result = true;
            _i('');
        } else {
            module.close();
        }

        return result;
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method log
     */
    module.log = function(lfBefore, level, value, desc) {
        var outputStr = createOutputStr(lfBefore, level, value, desc);

        if (!outputStr) {
            return;
        }

        if (currentLogLevel > level) {
            return;
        }

        if (buffer && fileHandler === null) {
            buffer.push(outputStr);
            return;
        }

        // no need to do logging if it is disabled for some reason
        if (fileHandler === null) {
            return;
        }

        if (fileHandler.writeln(outputStr) === false) {
            module.close();
        }
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method createOutputStr
     * @private
     */
    var createOutputStr = function(lfBefore, level, value, desc) {
        if (typeof lfBefore === 'string') {
            return lfBefore;
        }

        // increase number of logged messages of current log level
        if (stats.hasOwnProperty([levels[level]])) {
            stats[levels[level]].count++;
        }

        var result =  Utils.createOutputStr(lfBefore, true, value, desc);

        // a quircky way to check where to append log level string
        if ((/^\n[^\n]/).test(result) && result.length > 1) {
            result = result.replace(/^(\n)?/, '$1' + levels[level] + ' ');
        } else {
            result = levels[level] + ' ' + result;
        }

        return result.replace(/\n$/, '');
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method close
     */
    module.close = function() {
        if (fileHandler !== null) {
            if (fileHandler.getSize() > Math.pow(2, 30)) {
                fileHandler.close();
            } else {
                fileHandler.resaveInUTF();
            }

            fileHandler = null;
        }

        buffer = null;
        printLogStats();
    };

    /**
     * function that ...
     *
     * @private
     */
    var printLogStats = function() {
        _rl('');

        for (var level in stats) {
            var count = stats[level].count.toString().lpad(3);
            _rw(level + ': ' + count + ' ');
            var bar = ''.rpad(stats[level].count, stats[level].symbol);
            if (bar.length > 0) {
                _rw(bar, {colors: [0, stats[level].color]});
            } else {
                _rw('');
            }

            _rl('', {colors: [0, 0xFFFFFF]});
        }
    };

    return module;
})();

// ==========================================

/**
 * Writes log message with `debug` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_d = function() {
    Logger.log.apply(null, Utils.prepareParams(arguments, 0));
};

/**
 * Writes log message with `info` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_i = function() {
    Logger.log.apply(null, Utils.prepareParams(arguments, 1));
};

/**
 * Writes log message with `info` log level into log file. Additionally
 * newline symbol will be inserted before this line
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_p = function() {
    Logger.log.apply(null, Utils.prepareParams(arguments, 1, true));
};

/**
 * Writes log message with `warn` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_w = function() {
    Logger.log.apply(null, Utils.prepareParams(arguments, 2));
};

/**
 * Writes log message with `error` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_e = function() {
    Logger.log.apply(null, Utils.prepareParams(arguments, 3));
};

/**
 * Writes log message with `fatal` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_f = function() {
    Logger.log.apply(null, Utils.prepareParams(arguments, 4));
};
//DEBUG_STOP

