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
        var fileHandler = null;
        var taskNameMapper = params.taskNameMapper || function(taskName) {
            return taskName;
        };
        var data2Save = {
            'data': {},
            'metadata': {
                'timestamp': new Date().toUTCString()
            }
        };

        if (params.tasks2Save.length === 0) {
            return false;
        }

        if ((fileHandler = IO.createFile(params.fileOptions)) === null) {
            return false;
        }

        //DEBUG_START
        _p(fileHandler.getFilePath(), 'Next file will be used to write data');
        //DEBUG_STOP

        params.tasks2Save.forEach(function(taskName) {
            var taskObj = this.getTaskObject(taskName);

            if ((taskObj instanceof Task) === false) {
                return false;
            }

            taskName = taskNameMapper(taskName);

            data2Save['data'][taskName] = {};
            Object.keys(params.taskProps2Save).forEach(function(key) {
                data2Save['data'][taskName][key] =
                    taskObj[params.taskProps2Save[key]]();
            });
        }, this);

        if (params.metadata && Object.keys(params.metadata).length > 0) {
            for (var key in params.metadata) {
                if (data2Save['metadata'].hasOwnProperty(key) === false) {
                    data2Save['metadata'][key] = params.metadata[key];
                }
            }
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
