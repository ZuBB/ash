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
     * Dumps data of the tasks to the disk that were allowed to export it
     *
     * @private
     */
    this.dumpTasks2Disk = function() {
        // TODO temporary add this 'if'
        if (Script.dumpTasksData !== true) {
            return;
        }

        var fileOptions = {
            filedir:  Host.CurPath,
            filename: 'data.txt'
        };

        var tasks2Save = this.listRegisteredTasks().filter(function(item) {
            return this.getTaskObject(item).isSavingRequired();
        }, this);

        this.dumpData2Disk({
            'fileOptions': fileOptions,
            'tasks2Save': tasks2Save,
            'taskProps2Save': {
                'data': 'getDataSets',
                'status': 'getTaskStatuses'
            }
        });
    };

    // schedule method in parenthes to be run
    this.schedulePostProcessMethod({
        'index':  80,
        'method': 'dumpTasks2Disk'
    });

    return this;
}).apply(Dispatcher);

