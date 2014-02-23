//DEBUG_START
/*
 * Logger lib. Inspired from Ruby's one
 */
Logger = {
    _buffer: [],
    _buffering: true,
    _backDirName: 'C:\\$SCRIPT_FILENAME$_logs\\',
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
 * @method init
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
 * @method log
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
 * @method close
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
 * @method _initFSHandler
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
 * @method createOutputStr
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
 * @method _stopBuffering
 */
Logger._stopBuffering = function() {
    this.dump2FS      = false;
    this._buffer      = null;
    this._buffering   = false;
    this._fileHandler = null;
};

// ==========================================

_d = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 0));
};

_i = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 1));
};

_p = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 1, true));
};

_w = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 2));
};

_e = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 3));
};

_f = function() {
    Logger.log.apply(Logger, Utils.prepareParams(arguments, 4));
};
//DEBUG_STOP

