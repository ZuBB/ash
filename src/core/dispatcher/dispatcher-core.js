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
     * @param {Object} [taskOpts] A dictionary with options that
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
        if (!taskOpts) {
            _e('can not register empty graphic specs object!');
            return false;
        }
        //DEBUG_STOP

        var taskObj = new Task(taskOpts);
        var graphicFullName = taskObj.getTaskName();

        //DEBUG_START
        if (taskObj.isTaskNameValid() === false) {
            return false;
        }

        if (graphicFullName in tasksHash) {
            _e(graphicFullName, 'spec name duplication');
            return false;
        }
        //DEBUG_STOP

        tasksHash[graphicFullName] = taskObj;
        taskOpts = null;
        taskObj = null;

        //DEBUG_START
        _d(graphicFullName, 'next graphic has been successfully registered');
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
     *
     * @private
     */
    this.process = function() {
        runPreProcessMethods();

        if (this.isScriptAllowedToRun() && Input.createConfiguration()) {
            //DEBUG_START
            logIncomingParams();
            //DEBUG_STOP
            Profiler.start('main');
            runRegisteredTasks();
        }

        runPostProcessMethods();
    };

    /**
     * Prints announce messages at start of script execution
     *
     * @private
     */
    var announce = function() {
        var params = null;

        if (Script.version.indexOf('VERSION') < 0) {
            params = ['report.version.rel', Script.name, Script.version];
        } else if (Script.buildID.indexOf('BUILD_ID') < 0) {
            params = ['report.version.vcs_dev', Script.name,
                Script.buildTimestamp.toLocaleString(), Script.buildID];
        } else {
            params = ['report.version.dev', Script.name,
                Script.buildTimestamp.toLocaleString()];
        }

        _rp(_t.apply(null, params));
        //DEBUG_START
        _rp(_t('report.date', new Date().toLocaleString()));
        //DEBUG_STOP
    };

    //DEBUG_START
    /**
     * Logs any data that has been entered by user
     *
     * @private
     */
    var logIncomingParams = function() {
        _p('');
        _d(Host.CurFileName, 'current file');
        _d(Host.Frequency, 'frequency');
        _d(Host.NumberOfSamples, 'samples');
        _d(Host.NumberOfSamples.posToSec(), 'duration');
        _d(Host.SelBegin.posToSec(), 'Selection Begin');
        _d(Host.SelEnd.posToSec(), 'Selection End');

        Input.getFilledInputs().forEach(function(input) {
            _d(Input.getValue(input), input);
        });
    };
    //DEBUG_STOP

    /**
     * Runs all tasks that has been successfully registered
     *
     * @private
     */
    var runRegisteredTasks = function() {
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

        var stopAfter = (Input.isInputNameKnown('stop_after') ?
            Input.getValue('stop_after') : 0) - 1;

        var preProcess = function(specObj, ii) {
            var specName = specObj.getTaskName();
            var outputStr = [];

            Profiler.start(specName);

            outputStr.push('>'.repeat(15), ' Processing next (');
                    outputStr.push((ii + 1).toString().lpad(' ', count.length));
                    outputStr.push('/' + count + ') spec: ');
            outputStr.push(specName.rpad(' ', padLen));

            _d('\n'.repeat(4));
            _rw(outputStr.join(''));
        };

        var postProcess = function(specObj) {
            var taskStatus = specObj.getTaskStatus();
            var specName = specObj.getTaskName();

            var message = taskStatus ? '+' : '-';
            var color = taskStatus ? 0x44DD44 : 0xDD4444;

            var profilerString = '';
            var profileTime = Profiler.stop(specName);
            profilerString += '<'.repeat(5) + ' ';
            profilerString += specName.rpad(' ', padLen);
            profilerString += ' ' + profileTime.toString();
            profilerString += ' ms passed';

            _rl(message, {colors: [0, color]});
            _i(profilerString);
        };

        _rl('');
        //DEBUG_STOP

        for (var ii = 0, specObj; ii < length && $H_CC_inline; ii++) {
            Host.SetStatusText(_t('core.status.message', ii));
            specObj = tasksHash[specNames[ii]];

            //DEBUG_START
            preProcess(specObj, ii);
            //DEBUG_STOP

            specObj.process();
            Host.SetProgress(ii);

            //DEBUG_START
            postProcess(specObj);

            if (stopAfter > -1 && stopAfter === ii) {
                _rl('tasks queue terminated', {colors: [0, 0xFFAD00]});
                break;
            }
            //DEBUG_STOP
        }
    };

    /**
     * Starts visualisation on application's progress bar
     *
     * @private
     */
    var startProgressBar = function() {
        // all tasks + pre process tasks (1 step) + post process tasks (1 step)
        var stepsTotal = Object.keys(tasksHash).length + 1 + 1;
        Host.ShowProgress(_t('core.status.start'), stepsTotal);
    };

    /**
     * Stops visualisation on application's progress bar
     *
     * @private
     */
    var stopProgressBar = function() {
        Host.HideProgress();
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
     * **NOTE**: This method is stripped from production code
     *
     * @return {Array} list of registered tasks
     */
    this.listRegisteredTasks = function() {
        return Object.keys(tasksHash);
    };

    /**
     * ...
     */
    var runPostProcessMethods = function() {
        runSchedulledMethods(postProcessMethods);

        Profiler.stop('main');
        _rp(_t('report.done', Profiler.get_HRF_time('main')));

        Host.ShowReport();
        stopProgressBar();

        //DEBUG_START
        _i('<<<<< ' + 'GRAND_TOTAL'.rpad(' ', padLen) +
                Profiler.get_ms_time('main') + ' ms passed');
        Logger.close();
        //DEBUG_STOP
    };

    /**
     * ...
     */
    var runPreProcessMethods = function() {
        Profiler.start('main');
        startProgressBar();

        //DEBUG_START
        Logger.init();
        //DEBUG_STOP

        runSchedulledMethods(preProcessMethods);

        announce();
        Host.SetProgress(0);
    };

    /**
     * ...
     */
    var runSchedulledMethods = function(schedulledMethods) {
        schedulledMethods
            .filter(function(item) {
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
            .forEach(function(item) { this[item['method']](); }, that);
    };

    /**
     * ...
     */
    this.schedulePostProcessMethod = function(item) {
        if (item) {
            postProcessMethods.push(item);
        }
    };

    /**
     * ...
     */
    this.schedulePreProcessMethod = function(item) {
        if (item) {
            preProcessMethods.push(item);
        }
    };

    return this;
}).apply({});
