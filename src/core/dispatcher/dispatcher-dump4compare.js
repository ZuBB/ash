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
     * @property {{name: Array}} data4Compare = null
     * @private
     *
     * An hash/dict that holds key/value pairs of task names and theirs data
     * for compare feature
     */
    var data4Compare = null;

    /**
     * @property {Object} data4Save = {}
     * @private
     *
     * An hash/dict that holds key/value pairs of task names and theirs data
     * for compare feature
     */
    var data4Save = {};

    /**
     * @property {Object} metadata = {}
     * @private
     *
     * Hash with params that will be stored alongside task data
     * in 'compare' feature;
     */
    var metadata = {};

    /**
     * @property {Array} tasks2Save = []
     * @private
     *
     * An array that holds names of tasks that should be save for future
     * compare feature
     */
    var tasks2Save = [];

    /**
     * Stores additional params of metadata for 'compare' feature.
     *
     * @param {Object} [params] A dictionary with param names and theirs
     * values
     */
    this.addParamsToMetadata = function(params) {
        if (params && params.constructor === Object) {
            metadata = Utils.mergeRecursive(metadata, params);
            return true;
        }

        return false;
    };

    /**
     * Returns data for task
     *
     * @param {String} [specName] name of the task
     * @return {Array|Boolean} 'data' for the specified task
     */
    this.requestTaskData = function(specName) {
        if (data4Compare === null) {
            return 1;
        }

        if (data4Compare['data'].constructor !== Object) {
            return 2;
        }

        if (data4Compare['data'].hasOwnProperty(specName) === false) {
            return 3;
        }

        if (data4Compare['data'][specName].constructor !== Object) {
            return 4;
        }

        if (Array.isArray(data4Compare['data'][specName]['data']) === false) {
            return 5;
        }

        return data4Compare['data'][specName]['data'];
    };

    /**
     * Reads data for this task from file
     *
     * @param {String} [filename] variable with filename to read data from
     * @return {Boolean} result of the load operation
     */
    this.loadExternalData = function(filename) {
        if (IO.isFileExist(filename) === false) {
            //DEBUG_START
            _e(filename, 'Can not find next file');
            //DEBUG_STOP
            return 1;
        }

        //DEBUG_START
        _d(filename, 'will try to load external data in next file');
        //DEBUG_STOP
        var result = null;

        try {
            result = 2;
            data4Compare = IO.readFileContent(filename);
            result = 3;
            data4Compare = JSON.parse(data4Compare);
            //DEBUG_START
            _d('all is OK');
            //DEBUG_STOP
            result = 0;
        } catch(e) {
            //DEBUG_START
            _e('smth went wrong');
            _d(e.message, 'error message');
            //DEBUG_STOP
            return result;
        }

        return data4Compare['metadata'] || 4;
    };

    /**
     * Remebers task name for future store and compare
     * property
     *
     * **NOTE**: Usually you do not need to use this method directly.
     * Its utilization is being done automatically. However if you do,
     * there should be strong reason for that.
     *
     * @param {String} specName name of the task
     */
    this.addSpec4Saving = function(specName) {
        if (specName) {
            return tasks2Save.push(specName);
        }
    };

    /**
     * Dumps data of the tasks to the disk for future compare feature
     *
     * @private
     */
    this.saveTasks4Compare = function() {
        var fileOptions = {
            noutf:    true,
            filedir:  [Host.CurPath, IO.getSafeNeighbourPath(), 'data'],
            filename: Host.CurFileName.replace(/\.mwf$/, '') + '.json.txt'
        };

        this.dumpData2Disk({
            'fileOptions': fileOptions,
            'metadata': metadata,
            'taskProps2Save': {'data': 'getDataSets'},
            'tasks2Save': tasks2Save,
            'taskNameMapper': function(taskName) {
                return taskName + '_external';
            }
        });
    };

    // schedule method in parenthes to be run
    this.schedulePostProcessMethod({
        'index':  81,
        'method': 'saveTasks4Compare'
    });

    return this;
}).apply(Dispatcher);
