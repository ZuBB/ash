/**
 * **IO** library
 *
 * @class
 * @ignore
 */
IO = (function() {
    if (typeof ActiveXObject === 'undefined') {
        return null;
    }

    // http://msdn.microsoft.com/en-us/library/hww8txat(v=vs.84).aspx
    var FSObject = new ActiveXObject('Scripting.FileSystemObject');
    var safeExecute = function(params) {
        var result;
        var reportOptions = {
            reportOnly: true,
            lfAfter: true
        };

        try {
            result = params.tryFunc();
            result = typeof result === 'undefined' ? true : result;
        } catch (e) {
            //DEBUG_START
            var message = params.failureMessage ||
                'Next error occured during executing of IO function';

            typeof _rc !== 'undefined' && _rc(message, reportOptions);
            typeof _rc !== 'undefined' && _rc(e.message, reportOptions);
            //DEBUG_STOP

            if (typeof params.catchFunc === 'function') {
                return params.catchFunc();
            }

            result = params.hasOwnProperty('failureResult') ?
                params.failureResult : false;
        }

        return result;
    };

    var FileHandler = function(params) {
        if (!params || params.constructor !== Object) {
            return null;
        }

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

            return buildPath(pathParts);
        };

        var filename = function() {
            var filename = null;
            var filepath = null;

            if (Array.isArray(params.filename)) {
                filename = params.filename.join('');
            } else {
                filename = params.filename;
            }

            if (Array.isArray(params.filedir)) {
                filepath = param2Path(params.filedir);
            } else {
                filepath = params.filedir;
            }

            return buildPath(filepath, filename);
        }();

        if (FSObject.FileExists(filename)) {
            var backname = null;
            // if backupName was passed process it
            if (params.hasOwnProperty('backupName')) {
                backname = param2Path(params.backupName);

                safeExecute({
                    tryFunc: function() {
                        return function() {
                            FSObject.MoveFile(filename, backname);
                        }();
                    }
                });
            }

            // if backupDir was passed lets continue
            if (params.hasOwnProperty('backupDir')) {
                var commonPath = null;

                // backupDir is an array, create a path from it
                // else just use it
                if (Array.isArray(params.backupDir)) {
                    commonPath = param2Path(params.backupDir);
                } else {
                    commonPath = params.backupDir;
                }

                // make an absolute path from it
                commonPath = buildPath(commonPath);
                var oldname = backname || filename;

                // move renamed file to new location
                safeExecute({
                    tryFunc: function() {
                        return function() {
                            // if path does not exists create it
                            if (FSObject.FolderExists(commonPath) === false) {
                                FSObject.CreateFolder(commonPath);
                            }

                            FSObject.MoveFile(oldname, commonPath + '\\');
                        }();
                    }
                });
            }
        }

        var fileHandler = safeExecute({
            failureMessage: 'Failed to create handler due to next error',
            tryFunc: function() {
                return function() {
                    return FSObject.CreateTextFile(filename, true, true);
                }();
            },
            failureResult: null
        });

        this.write = function(outputStr) {
            if (fileHandler === null) {
                return false;
            }

            var self = this;
            return safeExecute({
                catchFunc: function() {
                    return function() {
                        self.close();
                    }();
                },
                failureMessage: 'Failed to write data due to next error',
                tryFunc: function() {
                    return function() {
                        fileHandler.Write(outputStr.toString());
                    }();
                }
            });
        };

        this.writeln = function(outputStr) {
            if (fileHandler === null) {
                return false;
            }

            return this.write(outputStr.toString() + '\n');
        };

        this.close = function() {
            if (!fileHandler) {
                return true;
            }

            return safeExecute({
                failureMessage: 'Failed to (save&)close file due to next error',
                tryFunc: function() {
                    return function() {
                        fileHandler.Close();
                        fileHandler = null;
                    }();
                }
            });
        };

        this.getFilePath = function() {
            return filename;
        };

        this.getSize = function() {
            return fileHandler ? fileHandler.size : 0;
        };

        this.resaveInUTF = function() {
            var result = this.close();

            if (result !== true) {
                return result;
            }

            return safeExecute({
                failureMessage: 'Failed to resave in utf8',
                tryFunc: function() {
                    return function() {
                        var objStream1 = null;
                        var objStream2 = null;
                        var fileContent = null;

                        // http://goo.gl/J8OH5J (msdn)
                        objStream1 = new ActiveXObject("ADODB.Stream");
                        objStream1.Charset = "Unicode";
                        objStream1.Open();
                        objStream1.LoadFromFile(filename);

                        fileContent = objStream1.ReadText();
                        objStream1.Close();
                        FSObject.DeleteFile(filename);

                        objStream2 = new ActiveXObject("ADODB.Stream");
                        objStream2.Open();
                        objStream2.Charset = "utf-8";
                        objStream2.WriteText(fileContent);
                        objStream2.SaveToFile(filename, 2);
                        objStream2.Close();

                        objStream1 = null;
                        objStream2 = null;
                        fileContent = null;
                    }();
                }
            });
        };
    };

    var createFile = function(params) {
        return new FileHandler(params);
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var buildPath = function() {
        var pathParts = [].slice.call(arguments, 0);

        if (pathParts.length === 1 && Array.isArray(pathParts[0])) {
            pathParts = pathParts[0];
        }

        var finalPath = pathParts.shift();
        var currPart  = null;

        while (pathParts.length) {
            currPart = pathParts.shift();

            if (typeof currPart === 'string' && currPart.length > 0) {
                finalPath = FSObject.BuildPath(finalPath, currPart);
            }
        }

        return FSObject.GetAbsolutePathName(finalPath);
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var isFileExist = function() {
        var params = [].slice.call(arguments, 0);

        return params.length > 0 && FSObject.FileExists(buildPath(params));
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var readFileContent = function(filepath) {
        return safeExecute({
            failureResult: null,
            tryFunc: function() {
                return function() {
                    var fileHandler = FSObject.OpenTextFile(filepath, 1, false, -1);
                    var fileContent = fileHandler.ReadAll();
                    fileHandler.Close();
                    return fileContent;
                }();
            }
        });
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var getSafeNeighbourPath = function() {
        return (/\\build\\output\\$/).test(Host.CurPath) ? '..\\..\\' : '';
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var isPathAbsolute = function(path) {
        return /^[a-z]:\\/i.test(path);
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var getSafeDirPath = function(path) {
        var dirPath = null;

        if (isPathAbsolute(path) === false) {
            dirPath = buildPath(Host.CurPath, getSafeNeighbourPath(), path);
        } else {
            dirPath = path;
        }

        return dirPath;
    };

    /**
     * function that ...
     *
     * @ignore
     */
    var getDirFiles = function(path) {
        var dataPath = getSafeDirPath(path || 'data');

        if (FSObject.FolderExists(dataPath) === false) {
            safeExecute({
                tryFunc: function() {
                    return function() {
                        FSObject.CreateFolder(dataPath);
                    }();
                }
            });
            return [];
        }

        var result = [];
        var objFolder = FSObject.GetFolder(dataPath);
        var filesCollection = new Enumerator(objFolder.files);

        for ( ; !filesCollection.atEnd(); filesCollection.moveNext()) {
            result.push(filesCollection.item().name);
        }

        return result;
    };

    var getTempFolderPath = function() {
        return FSObject.GetSpecialFolder(2).path;
    };

    return {
        'buildPath'           : buildPath,
        'createFile'          : createFile,
        'getDirFiles'         : getDirFiles,
        'getSafeDirPath'      : getSafeDirPath,
        'getSafeNeighbourPath': getSafeNeighbourPath,
        'getTempFolderPath'   : getTempFolderPath,
        'isFileExist'         : isFileExist,
        'isPathAbsolute'      : isPathAbsolute,
        'readFileContent'     : readFileContent
    };

})();

