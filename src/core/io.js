/**
 * **IO** library. Inspired from Ruby's one
 *
 * @class
 * @ignore
 */
IO = (function() {
    // http://msdn.microsoft.com/en-us/library/hww8txat(v=vs.84).aspx
    var FSObject = new ActiveXObject('Scripting.FileSystemObject');
    var module = {};

    var FileHandler = function(params) {
        if (!params || params.constructor !== Object) {
            return null;
        }

        var safeExecute = function(params) {
            if (!params.allowBrokenHandler && fileHandler === null) {
                return false;
            }

            var result;

            try {
                result = params.tryFunc(fileHandler);
                if (result === void(0)) {
                    result = true;
                }
            } catch (e) {
                var message = params.failureMessage ||
                    'Next error occured during executing of IO function';

                _rl(message);
                _rp(e.message);

                if (typeof params.catchFunc === 'function') {
                    return params.catchFunc(fileHandler);
                }

                result = params.hasOwnProperty('failureResult') ?
                    params.failureResult : false;
            }

            return result;
        };

        var param2Path = function(pathParts) {
            if (typeof pathParts === 'string') {
                return pathParts;
            }

            if (typeof pathParts === 'function') {
                return pathParts(FSObject, filename);
            }

            if (Array.isArray(pathParts) === false || pathParts.empty()) {
                return pathParts;
            }

            var commonPath = pathParts.shift();

            while (pathParts.length) {
                commonPath = FSObject.BuildPath(commonPath, pathParts.shift());
            }

            return commonPath;
        };

        var filename = function() {
            var commonPath = null;
            var filename = null;
            var filepath = null;

            if (Array.isArray(params.filename)) {
                filename = params.filename.join('');
            } else {
                filename = params.filename;
            }

            if (Array.isArray(params.filedir)) {
                commonPath = param2Path(params.filedir);
            } else {
                commonPath = params.filedir;
            }

            if (commonPath) {
                filepath = FSObject.BuildPath(commonPath, filename);
                filepath = FSObject.GetAbsolutePathName(filepath);
            }

            return filepath;
        }();

        var backupPrevFile = function() {
            var backname = null;

            // if backupName was passed process it
            if (params.hasOwnProperty('backupName')) {
                backname = param2Path(params.backupName);
                FSObject.MoveFile(filename, backname);
            }

            // if backupDir was passed lets continue
            if (params.hasOwnProperty('backupDir')) {
                move2BackupDir(backname || filename);
            }
        };

        var move2BackupDir = function(backname) {
            var commonPath = null;

            // backupDir is an array, create a path from it
            // else just use it
            if (Array.isArray(params.backupDir)) {
                commonPath = param2Path(params.backupDir);
            } else {
                commonPath = params.backupDir;
            }

            // make an absolute path from it
            commonPath = FSObject.GetAbsolutePathName(commonPath);

            // if path does not exists create it
            if (FSObject.FolderExists(commonPath) === false) {
                FSObject.CreateFolder(commonPath);
            }

            // move renamed file to new location
            FSObject.MoveFile(backname, commonPath + '\\');
        };

        var createFileHandlerFunction = function() {
            if (FSObject.FileExists(filename)) {
                if (params.backupName || params.backupDir) {
                    backupPrevFile();
                }
            }

            if (params.utf16 || params.safe) {
                return FSObject.CreateTextFile(filename, true, true);
            }

            var handler = null;
            // http://goo.gl/J8OH5J (msdn)
            handler = new ActiveXObject("ADODB.Stream");
            handler.Charset = "utf-8";
            handler.Open();

            return handler;
        };

        var fileHandler = safeExecute({
            failureMessage: 'Failed to create handler due to next error',
            tryFunc: createFileHandlerFunction,
            allowBrokenHandler: true,
            failureResult: null
        });

        this.write = function(outputStr) {
            var writeToFileFunction = function(fileHandler) {
                outputStr = outputStr.toString();

                if (params.utf16 || params.safe) {
                    fileHandler.Write(outputStr);
                } else {
                    fileHandler.WriteText(outputStr);
                }
            };

            safeExecute({
                failureMessage: 'Failed to write data due to next error',
                tryFunc: writeToFileFunction,
                catchFunc: this.close
            });
        };

        this.writeln = function(outputStr) {
            // TODO platform dependent code
            return this.write(outputStr.toString() + '\n');
        };

        this.close = function() {
            return safeExecute({
                failureMessage: 'Failed to (save&)close file due to next error',
                tryFunc: function(fileHandler) {
                    if (!fileHandler) {
                        return true;
                    }

                    if (!params.utf16 && !params.safe) {
                        fileHandler.SaveToFile(filename, 2);
                    }

                    fileHandler.Close();
                    fileHandler = null;
                }
            });
        };

        this.getFilePath = function() {
            return filename;
        };
    };

    module.createFile = function(params) {
        return new FileHandler(params);
    };

    return module;
})();

