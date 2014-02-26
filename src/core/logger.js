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
 * There is two notes on usage of those comments
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
 * In log file will get somethig like this
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
 * - Location of log file for now is hardcoded. As a rule its located in
 * `C:\report-last.log`. This happens when your user on PC has a write access
 * to root of disk `C`. By default it has under MS Windows XP. Quite possible
 * same will be on later MS OSes (7, 8, 8.1) that has been installed from
 * tweaked CD/DVDs. Otherwise it ought to be in next location
 * `C:\Users\YOUR_USER_NAME\AppData\Local\VirtualStore\report-last.log`
 *
 * On consequent run on your script log file is being rotated to dir that
 * belongs to your script. This one should be constant (`C:\YOUR_SCRIPT_NAME`)
 *
 */
Logger = {
    _buffer: [],
    _buffering: true,
    _backDirName: 'C:\\$SCRIPT$_logs\\',
    _fileHandler: null,
    _filename: 'C:\\report-last.log',
    _levels: ['DEBUG', 'INFO ', 'WARN ', 'ERROR', 'FATAL'],
    _stats: {'WARN ': 0, 'ERROR': 0, 'FATAL': 0},
    dump2FS: true,
    level: 0
};

/**
 * function that ...
 *
 * @member Logger
 * @method init
 * @private
 */
Logger.init = function() {
    if (this.dump2FS && this._initFSHandler()) {
        while (this._buffer.length) {
            this.log(this._buffer.shift());
        }
    } else {
        this._stopBuffering();
    }
};

/**
 * function that ...
 *
 * @member Logger
 * @method log
 * @private
 */
Logger.log = function(b_lf, level, value, desc) {
    var output_str = this._createOutputStr(b_lf, level, value, desc);

    if (!output_str) {
        return;
    }

    if (this._buffering && (!this.dump2FS || !this._fileHandler)) {
        this._buffer.push(output_str);
        return;
    }

    // no need to do logging if it is disabled for some reason
    if (this.dump2FS === false && this._fileHandler === null) {
        return;
    }

    try {
        this._fileHandler.Write(output_str);
    } catch (e) {
        this._stopBuffering();
        _rl('Logger faced with next runtime IO error');
        _rp(e.message);
    }
};

/**
 * function that ...
 *
 * @member Logger
 * @method close
 * @private
 */
Logger.close = function() {
    if (this.dump2FS && this._fileHandler) {
        try {
            this._fileHandler.Close();
            this.dump2FS = false;
        } catch(e) {
            _rl('Failed to save logger file due to next error');
            _rp(e.message);
        } finally {
            _rl('');
            _rl(this._stats[this._levels[2]], 'WARN ');
            _rl(this._stats[this._levels[3]], 'ERROR');
            _rl(this._stats[this._levels[4]], 'FATAL');
        }
    }
};

/**
 * function that ...
 *
 * @member Logger
 * @method _initFSHandler
 * @private
 */
Logger._initFSHandler = function() {
    this.dump2FS = false;

    try {
        var backname = null;
        var FileObj  = new ActiveXObject('Scripting.FileSystemObject');

        if (FileObj.FileExists(this._filename)) {
            if (!FileObj.FolderExists(this._backDirName)) {
                FileObj.CreateFolder(this._backDirName);
            }

            backname = FileObj.GetFile(this._filename).DateLastModified;
            backname = new Date(Date.parse(backname));

            backname =
                backname.getFullYear() + '.' +
                (backname.getMonth() + 1).toString().lpad('0', 2) + '.' +
                backname.getDate().toString().lpad('0', 2) + '_' +
                backname.getHours().toString().lpad('0', 2) + '-' +
                backname.getMinutes().toString().lpad('0', 2) + '-' +
                backname.getSeconds().toString().lpad('0', 2);

            backname = this._filename.replace(/last/, backname);

            FileObj.MoveFile(this._filename, backname);
            FileObj.MoveFile(backname, this._backDirName);
        }

        this._fileHandler = FileObj.CreateTextFile(this._filename, true, true);
        _rp('File: \'' + this._filename + '\' will be used for external logging');
        this.dump2FS = true;
    } catch(e) {
        this._stopBuffering();
        _rl('Failed to create external file for logging due to next message');
        _rp(e.message);
    }

    return this.dump2FS;
};

/**
 * function that ...
 *
 * @member Logger
 * @method createOutputStr
 * @private
 */
Logger._createOutputStr = function(b_lf, level, value, desc) {
    if (typeof b_lf === 'string') {
        return b_lf;
    }

    if (level < this.level) {
        return;
    }

    // increase number of logged messages of current log level
    this._stats[this._levels[level]]++;

    return Utils.createOutputStr(b_lf, true, value, desc)
        .replace(/^(\n)?/, '$1' + this._levels[level] + ' ')
        // TODO platform specific code
        .replace(/(\n)$/gm, '\r$1');
};

/**
 * function that ...
 *
 * @member Logger
 * @method _stopBuffering
 * @private
 */
Logger._stopBuffering = function() {
    this.dump2FS      = false;
    this._buffer      = null;
    this._buffering   = false;
    this._fileHandler = null;
};

// ==========================================

/**
 * Writes log message with `debug` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_d = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 0));
};

/**
 * Writes log message with `info` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_i = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 1));
};

/**
 * Writes log message with `info` log level into log file. Additionally
 * newline symbol will be inserted before this line
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_p = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 1, true));
};

/**
 * Writes log message with `warn` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_w = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 2));
};

/**
 * Writes log message with `error` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_e = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 3));
};

/**
 * Writes log message with `fatal` log level into log file
 *
 * @param {Object} value Item that should be logged
 * @param {String} [description] Text that describes value
 */
_f = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 4));
};
//DEBUG_STOP

