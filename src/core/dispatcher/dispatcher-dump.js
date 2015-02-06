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
     * Write data of the tasks to the disk
     *
     * @private
     */
    this.dumpData2Disk = function(params) {
        var condition1  = Array.isArray(params.tasks2Save) === false;
        var condition2  = params.tasks2Save.length < 1;
        var data2Save   = {'data': {}};
        var fileHandler = null;

        if (condition1 || condition2 ||
            (fileHandler = IO.createFile(params.fileOptions)) === null) {
                return false;
        }

        //DEBUG_START
        _p(fileHandler.getFilePath(), 'Next file will be used to write data');
        //DEBUG_STOP

        params.tasks2Save.forEach(function(item) {
            var taskObj = this.getTaskObject(item);

            if ((taskObj instanceof Task) === false) {
                return false;
            }

            var taskName = taskObj.getTaskName();

            data2Save['data'][taskName] = {};
            Object.keys(params.taskProps2Save).forEach(function(key) {
                data2Save['data'][taskName][key] =
                    taskObj[params.taskProps2Save[key]]();
            });
        }, this);

        if (params.metadata && Object.keys(params.metadata).length > 0) {
            data2Save['metadata'] = params.metadata;
        }

        //DEBUG_START
        if (/VERSION/.test(Script.version)) {
            var data2write = JSON.stringify(data2Save, null, 4);
            _i(fileHandler.writeln(data2write), 'write successful');
            _i(fileHandler.close(), 'close successful');
        } else {
        //DEBUG_STOP
            fileHandler.writeln(JSON.stringify(data2Save));
            fileHandler.close();
        //DEBUG_START
        }
        //DEBUG_STOP
    };

    return this;
}).apply(Dispatcher);
