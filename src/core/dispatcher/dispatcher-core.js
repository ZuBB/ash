/**
 * Dispatcher class
 *
 * Manages process of script run
 *
 * Most public methods of this class are called automatically.
 * If your target is a 'quick start' - {@link Dispatcher#registerNewTask}
 * is single method, which you should pay attention for.
 *
 * @singleton
 * @class
 */
Dispatcher = (function() {
    var that = this;

    /**
     * @property {Array} preProcessMethods
     * @private
     *
     * Holds time when script started to execute
     */
    var preProcessMethods = [];

    /**
     * @property {Array} postProcessMethods
     * @private
     *
     * Holds time when script started to execute
     */
    var postProcessMethods = [];

    /**
     * @property {{name: Task}} tasksHash = {}
     * @private
     *
     * A dictionary that holds key/value pairs of task name/task instance
     *
     * Each `key` is a internal name of task.
     * Each `value` paired to corresponding key is a task instance
     */
    var tasksHash = {};

    //DEBUG_START
    // Amount of spaces that will be added after task name in log
    var padLen = 40;
    //DEBUG_STOP

    /**
     * Registers new task with dictionary of options passed as parameter
     *
     * @param {Object} taskOpts A dictionary with options that
     *  will be used for creation instance of Task class
     * @return {Boolean} result of the operation
     *
     * See short example below on how to use this method
     *
     * ```
     * Dispatcher.registerNewTask({
     *     specName: 'my_task',
     *     axisName: 'cm',
     *     viewIndex: 'view:1',
     *     setLimits: true,
     *     minLimit: 0,
     *     maxLimit: 5.0,
     *     calc_data: function() {
     *         this.addDataSet({
     *             x: [0, 5, 15, 20],
     *             y: [0, 2,  2,  0],
     *             color: [0xB00000, 0x008000, 0x0000B0, 0x000000]
     *         });
     *     }
     * });
     * ```
     *
     * All subparams that can be used inside `taskOpts` object is listed in
     * {@link Task#constructor annotation of Task class}
     *
     * Each definition like above should reside in separate file in
     * `src/tasks` directory. Build system concatenates all files including
     * files with tasks into single file. This allows `Dispatcher` class
     * automatically register every task that was included into result file.
     * Since tasks may depend on each other, order of inclusion **does
     * matters**. That order is same as order of files in `src/tasks`
     * directory sorted alphabetically. Make sure you name files with
     * tasks properly.
     *
     * Sometimes we call *task* as *spec*.
     */
    this.registerNewTask = function(taskOpts) {
        //DEBUG_START
        if (!taskOpts || taskOpts.constructor !== Object) {
            _e('Can not register task with empty graphic specs object!');
            return false;
        }
        //DEBUG_STOP

        var taskObj = new Task(taskOpts);
        var taskName = taskObj.getTaskName();

        //DEBUG_START
        if (isTaskNameValid(taskName) === false) {
            return false;
        }
        //DEBUG_STOP

        tasksHash[taskName] = taskObj;
        taskOpts = null;
        taskObj = null;

        //DEBUG_START
        _d(taskName, 'next graphic has been successfully registered');
        //DEBUG_STOP
        return true;
    };

    /**
     * Returns a flag which indicates if script is allowed to run
     *
     * Purpose of this function is to define if this particular instance
     * of script is allowed to run (in some particular environment)
     * It is OK for developer to redefine this function for his needs
     *
     * @return {Boolean} value of permition to run script
     */
    this.isScriptAllowedToRun = function() {
        return true;
    };

    /**
     * Runs all top-level tasks of Dispatcher. Best annotation here it to see
     * a source code.
     */
    this.process = function() {
        runPreProcessMethods();

        if (this.isScriptAllowedToRun() && Input.createConfiguration()) {
            //DEBUG_START
            logIncomingParams();
            //DEBUG_STOP
            runRegisteredTasks();
        }

        runPostProcessMethods();
    };

    //DEBUG_START
    /**
     * Logs any data that has been entered by user
     *
     * @private
     */
    var logIncomingParams = function() {
        _p('');
        _d(Host.CurPath, 'current dir');
        _d(Host.CurFileName, 'current data file');
        _d(Host.Frequency, 'frequency');
        _d(Host.NumberOfSamples, 'samples');
        _d(Host.NumberOfSamples.posToSec(), 'duration');
        _d(Host.SelBegin.posToSec(), 'Selection Begin');
        _d(Host.SelEnd.posToSec(), 'Selection End');

        Input.getFilledInputs().forEach(function(input) {
            _d(Input.getValue(input), input);
        });
    };

    /**
     * Checks if task's name is valid
     *
     * @param {String} specName A user defined name of task/spec
     * @return {Boolean} result of the check
     *
     * @private
     */
    var isTaskNameValid = function(specName) {
        if (!specName) {
            _e('Passed spec misses name');
            return false;
        }

        if (specName.indexOf(':') > -1) {
            _e('Passed spec\'s name can not contain \':\'!');
            return false;
        }

        if (tasksHash.hasOwnProperty(specName)) {
            _e(specName, 'spec name duplication');
            return false;
        }

        return true;
    };
    //DEBUG_STOP

    /**
     * Runs all tasks that has been successfully registered
     *
     * @private
     */
    var runRegisteredTasks = function() {
        Profiler.start('main');
        var specNames = Object.keys(tasksHash);
        var length = specNames.length;

        //DEBUG_START
        if (length === 0) {
            _w('No registered tasks found');
            return;
        }

        var count  = length.toString();
        var specs  = Object.keys(tasksHash);
        var sortFn = function(a, b) { return a.length - b.length; };
        padLen = Math.ceil(specs.sort(sortFn).last().length * 1.4);

        // TODO would be nice to get rid of `-1` here
        var stopAfter = (Input.isInputNameKnown('stop_after') ?
            Input.getValue('stop_after') : 0) - 1;

        var preProcess = function(ii, specName) {
            var outputStr = [
                '>'.repeat(15), ' Processing next (',
                (ii + 1).toString().lpad(count.length),
                '/', count, ') spec: ',
                specName.rpad(padLen)
            ];

            _d('\n'.repeat(4));
            _rw(outputStr.join(''));

            Profiler.start(specName);
        };

        var postProcess = function(specName, taskStatus) {
            var message = taskStatus ? '+' : '-';
            var color = taskStatus ? 0x44DD44 : 0xDD4444;
            var profilerString = [
                '<'.repeat(5),
                specName.rpad(padLen),
                Profiler.stop(specName).toString(),
                'ms passed'
            ];

            _rc(message, {lfAfter: true, reportOnly: true, colors: [0, color]});
            _i(profilerString.join(' '));
        };

        _rl('');
        //DEBUG_STOP

        for (var ii = 0, specObj, specName; ii < length; ii++) {
            specObj = tasksHash[specNames[ii]];
            specName = specObj.getTaskName();

            if (typeof that.stepProgressIn === 'function') {
                that.stepProgressIn(_t('core.status.message', ii));
            }

            //DEBUG_START
            preProcess(ii, specName);
            //DEBUG_STOP

            specObj.process();

            //DEBUG_START
            postProcess(specName, specObj.getTaskStatus());
            //DEBUG_STOP

            if (typeof that.stepProgressOut === 'function') {
                that.stepProgressOut(ii);
            }

            //DEBUG_START
            if (stopAfter === ii) {
                _rl('tasks queue terminated', {colors: [0, 0xFFAD00]});
                break;
            }
            //DEBUG_STOP
        }
    };

    /**
     * Searches for task in `tasksHash` by its name. Returns task instance
     * or `null` in case wrong name.
     *
     * **NOTE**: Usually you do not need to use this method directly.
     * However if you do, there should be strong reason for that.
     *
     * @param {String} name A task name
     * @return {Task|null} result
     */
    this.getTaskObject = function(name) {
        //DEBUG_START
        if (typeof name !== 'string' || name.length === 0) {
            _e(name, 'spec name has wrong type or zero length');
            return null;
        }
        //DEBUG_STOP

        if (tasksHash.hasOwnProperty(name)) {
            return tasksHash[name];
        }

        //DEBUG_START
        _e(name, 'attemp to access spec by invalid name');
        //DEBUG_STOP
        return null;
    };

    /**
     * Searches for task in `tasksHash` by its name and positive status.
     * Returns task instance if found or null in other cases.
     *
     * **NOTE**: Usually you do not need to use this method directly.
     * However if you do, there should be strong reason for that.
     *
     * @param {String} name A task name
     * @return {Task|null} result
     */
    this.getValidTaskObject = function(name) {
        var taskObj = this.getTaskObject(name);

        if (taskObj && taskObj.getTaskStatus()) {
            return taskObj;
        } else {
            return null;
        }
    };

    /**
     * Returns list of the tasks that have been registered
     *
     * @return {Array} list of registered task names
     */
    this.listRegisteredTasks = function() {
        return Object.keys(tasksHash);
    };

    /**
     * Run methods of Dispatcher object that were requested for running
     * after butch run of tasks
     */
    var runPostProcessMethods = function() {
        Profiler.stop('main');
        runSchedulledMethods(postProcessMethods);

        //DEBUG_START
        Logger.close();
        //DEBUG_STOP
    };

    /**
     * Run methods of Dispatcher object that were requested for running
     * before butch run of tasks
     */
    var runPreProcessMethods = function() {
        //DEBUG_START
        Logger.init();
        //DEBUG_STOP

        Profiler.start('main');
        runSchedulledMethods(preProcessMethods);
    };

    /**
     * Run methods of Dispatcher object that were requested via params
     *
     * @param {Array} schedulledMethods - An array with names of task for run
     */
    var runSchedulledMethods = function(schedulledMethods) {
        schedulledMethods
            .filter(function(item) {
                // passed object is not a object
                if (typeof item !== 'object') {
                    return false;
                }

                // passed object is not a hash/map
                if (item.constructor !== Object) {
                    return false;
                }

                // index is not found or is not a number
                if (typeof item['index'] !== 'number') {
                    return false;
                }

                // method name is not found or is not a string
                if (typeof item['method'] !== 'string') {
                    return false;
                }

                // property with this key in current scope is not found
                // or it does not point to the method
                if (typeof this[item['method']] !== 'function') {
                    return false;
                }

                return true;
            }, that)
            .sort(function(itemA, itemB) {
                return itemA['index'] - itemB['index'];
            })
            .forEach(function(item) {
                Dispatcher[item['method']].apply(this, item['params'] || []);
            }, that);
    };

    /**
     * Schedule method for running before butch run of tasks
     */
    this.schedulePostProcessMethod = function(item) {
        postProcessMethods.push(item);
    };

    /**
     * Schedule method for running after butch run of tasks
     */
    this.schedulePreProcessMethod = function(item) {
        preProcessMethods.push(item);
    };

    return this;
}).apply({});

