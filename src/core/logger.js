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
 * You may want to divorce log message with some importance level. To help you
 * with this task we have different log levels
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
 * //DEBUG_START
 * _d('I want to have this message only in development mode');
 * //DEBUG_ST0P
 * ```
 *
 * You can do logging at any place you want and any amount you need. Single
 * limit here is a free space on your hard drive
 *
 * There are 4 notes on usage of those comments
 *
 * - `DEBUG_STOP` must written with 'O'. In example above we have to do
 *   a little cheat to actually pass a fake DEBUG_STOP pair to this strict
 *   system
 * - there **should not** be a space between `//` and `D` letter
 * - make sure every `DEBUG_START` comment has its own `DEBUG_STOP` pair.
 * Missing one of them causes absolutely weird bugs that are very hard to
 * discover
 * - make sure context of two pairs of DEBUG_{START,STOP} is not intersect.
 *   This also causes absolutely weird bugs that are very hard to discover
 *
 * There are couple of edge cases where logger powerless to inspect passed value
 *
 * - MVC/C objects that are not from JavaScript world. Under this you should
 * understant a objects that are created by functions like
 * `Host.CreateGraphic` or `Host.CreateGraphicView`
 * - Array with items that are not simple JavaScript objects. Here is an example
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
 *   and will have `NAME_OF_YOUR_SCRIPT-last-log.txt` name. Log files will be
 *   rotated to `./logs` dir
 * - if script is not located in `build/output` dir, then log file will be
 *   within same dir as script does. Log files will be rotated to
 *   `./NAME_OF_YOUR_SCRIPT-logs` dir
 */
Logger = (function() {
    var fileHandler = null;
    var useUTF16 = true;
    var FSObject = null;
    var filePath = null;
    var levels = ['DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'];
    var stats = {'WARN ': 0, 'ERROR': 0, 'FATAL': 0};
    var buffer = [];
    var module = {};

    /**
     * function that ...
     *
     * @member Logger
     * @method init
     */
    module.init = function() {
        if (initFSHandler()) {
            while (buffer.length) {
                module.log(buffer.shift());
            }
        }

        buffer = null;
    };

    /**
     * function that ...
     *
     * @private
     */
    var initFSHandler = function() {
        var commonPath = null;
        var result = false;
        var fileDir = null;
        var logPath = '';

        try {
            if ((/\\build\\output\\$/).test(Host.CurPath)) {
                logPath = '..\\..\\';
            }

            var logDir = logPath === '' ? Script.name + '_logs' : 'logs';
            var fileName = Script.name + '-last-log.txt';

            FSObject = new ActiveXObject('Scripting.FileSystemObject');
            commonPath = FSObject.BuildPath(Host.CurPath, logPath);
            commonPath = FSObject.GetAbsolutePathName(commonPath);

            filePath   = FSObject.BuildPath(commonPath, fileName);
            logDirPath = FSObject.BuildPath(commonPath, logDir);

            backupPrevFile(filePath, logDirPath);

            if (useUTF16) {
                fileHandler = FSObject.CreateTextFile(filePath, true, true);
            } else {
                // http://goo.gl/J8OH5J
                fileHandler = new ActiveXObject("ADODB.Stream");
                fileHandler.Charset = "utf-8";
                fileHandler.Open();
            }

            _rp('File: \'' + filePath + '\' will be used for external logging');
            result = true;
            _i('');
        } catch(e) {
            _rl('Failed to create external log file due to next message');
            _rp(e.message);
            module.close();
        }

        return result;
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method backupPrevFile
     * @private
     */
    var backupPrevFile = function(filePath, logDirPath) {
        if (FSObject.FileExists(filePath) === false) {
            return;
        }

        if (FSObject.FolderExists(logDirPath) === false) {
            FSObject.CreateFolder(logDirPath);
        }

        var backTimeStr = FSObject.GetFile(filePath).DateLastModified;
        var backname = new Date(Date.parse(backTimeStr));

        backname =
            backname.getFullYear() + '.' +
            (backname.getMonth() + 1).toString().lpad('0', 2) + '.' +
            backname.getDate().toString().lpad('0', 2) + '_' +
            backname.getHours().toString().lpad('0', 2) + '-' +
            backname.getMinutes().toString().lpad('0', 2) + '-' +
            backname.getSeconds().toString().lpad('0', 2);

        backname = filePath.replace(/last/, backname);

        FSObject.MoveFile(filePath, backname);
        FSObject.MoveFile(backname, logDirPath + '\\');
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

        if (buffer && fileHandler === null) {
            buffer.push(outputStr);
            return;
        }

        // no need to do logging if it is disabled for some reason
        if (fileHandler === null) {
            return;
        }

        try {
            if (useUTF16) {
                fileHandler.Write(outputStr);
            } else {
                fileHandler.WriteText(outputStr);
            }
        } catch (e) {
            module.close();
            _rl('Logger faced with next runtime IO error');
            _rp(e.message);
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
        stats[levels[level]]++;

        var result =  Utils.createOutputStr(lfBefore, true, value, desc);

        // a quircky way to check where to append log level string
        if ((/^\n[^\n]/).test(result) && result.length > 1) {
            result = result.replace(/^(\n)?/, '$1' + levels[level] + ' ');
        } else {
            result = levels[level] + ' ' + result;
        }

        // TODO platform specific code
        return result.replace(/(\n)$/gm, '\r$1');
    };

    /**
     * function that ...
     *
     * @member Logger
     * @method close
     */
    module.close = function() {
        try {
            printLogStats();

            if (fileHandler !== null) {
                if (useUTF16) {
                    fileHandler.Close();
                } else {
                    fileHandler.SaveToFile(filePath, 2);
                }
            }

            fileHandler = null;
            FSObject = null;
            buffer = null;
        } catch(e) {
            _rl('Failed to save logger file due to next error');
            _rp(e.message);
        }
    };

    /**
     * function that ...
     *
     * @private
     */
    var printLogStats = function() {
        if (stats[levels[2]] || stats[levels[3]] || stats[levels[4]]) {
            _rl('');
            _rl('WARN : ' + stats[levels[2]]);
            _rl('ERROR: ' + stats[levels[3]]);
            _rl('FATAL: ' + stats[levels[4]]);
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

