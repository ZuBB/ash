/**
 * Dispatcher class
 *
 * Manages process of script run
 *
 * All methods except {@link Dispatcher#registerNewTask} of this class
 * are called automatically. Its single method which really require
 * your attention at start.
 *
 * @class
 */
Dispatcher = (function() {
    /**
     * @property {Array} sortableProps = ['area', 'graphic', 'graphicex']
     * @private
     *
     * List of props that need to be handled in special way
     */
    var sortableProps = ['area', 'graphic', 'graphicex'];

    /**
     * @property {Date} startTime = new Date()
     * @private
     *
     * Holds time when script started to execute
     */
    var startTime = new Date();

    /**
     * @property {Array} drownGraphics = []
     * @private
     *
     * An array that holds real graphic objects
     */
    var drownGraphics = [];

    /**
     * @property {Array} confirmedViews = []
     * @private
     *
     * An array that holds names of views that has been confirmed to be drown
     */
    var confirmedViews = [];

    /**
     * @property {{name: Object}} graphicsViews = {}
     * @private
     *
     * A dictionary that holds key/value pairs related to real graphic views
     * Each `key` is a internam name of view.
     * Each `value` paired to corresponding key is real view object
     */
    var graphicsViews = {};

    /**
     * @property {{name: Object}} viewsProps = {}
     * @private
     *
     * A dictionary that holds key/value pairs related to graphic views names
     * and props that should be applied to them
     *
     * Each `key` is a internam name of view.
     * Each `value` paired to corresponding key is a dictionary with props
     * that should be applied to it
     */
    var viewsProps = {};

    /**
     * @property {Object} messageTypes = null
     * @private
     *
     * A dictionary for all type of messages will be collected during
     * script execution. For details see
     * {@Dispatcher#createMessageStorage} method
     */
    var messageTypes = null;

    /**
     * @property {{name: Task}} tasksHash = {}
     * @private
     *
     * A dictionary that holds key/value pairs of task name/task instance
     *
     * Each `key` is a internam name of task.
     * Each `value` paired to corresponding key is a task instance
     */
    var tasksHash = {};

    /**
     * @property {Array} specs2Save4Compare = []
     * @private
     *
     * An array that holds names of tasks that should be save for future
     * compare feature
     */
    var specs2Save4Compare = [];

    /**
     * @property {{name: Array}} data4Compare = null
     * @private
     *
     * An hash/dict that holds key/value pairs of task names and theirs data
     * for compare feature
     */
    var data4Compare = null;

    /**
     * Registers new task with dictionary of options passed as parameter
     *
     * @param {Object} taskOpts A dictionary with options for new Task instance
     * @return {Boolean} result of the operation
     *
     * See short example below on how to use this method
     *
     * ```
     * Dispatcher.registerNewTask({
     *     specName: 'my_task',
     *     axisName: 'cm',
     *     viewIndex: 'view:1',
     *     graphicType: 'multicolor',
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
     * All subparams that an be used inside `taskOpts` object is listed in
     * {@link Task#constructor annotation of Task class}
     *
     * Each definition like above should reside in separate file in
     * `src/tasks` directory. Build system concatenates all files including
     * files with tasks into single file. This allows `Dispatcher` class
     * automatically register all tasks that were included into result file.
     * Since tasks may depend on each other order of register **do matters**.
     * That order is same as order of files with tasks in `src/tasks`
     * directory sorted alphabetically. Make sure you name files with
     * tasks properly.
     *
     * Sometimes we call *task* as *spec*.
     */
    var registerNewTask = function(taskOpts) {
        if (!taskOpts) {
            //DEBUG_START
            _e('can not register empty graphic specs object!');
            //DEBUG_STOP
            return false;
        }

        var taskObj = new Task(taskOpts);
        var graphicFullName = taskObj.getTaskName();

        if (!graphicFullName || graphicFullName.indexOf(':') > -1) {
            //DEBUG_START
            _e('passed spec misses name or name contains \':\'!');
            //DEBUG_STOP
            return false;
        }

        if (graphicFullName in tasksHash) {
            //DEBUG_START
            _e(graphicFullName, 'spec name duplication');
            //DEBUG_STOP
            return false;
        }

        tasksHash[graphicFullName] = taskObj;
        taskOpts = null;
        taskObj = null;

        //DEBUG_START
        _d(graphicFullName, 'next graphic has been successfully registered');
        //DEBUG_STOP
        return true;
    };

    /**
     * Runs all top-level tasks of Dispatcher. Best annotation here it to see
     * a source code.
     *
     * @private
     */
    var process = function() {
        //DEBUG_START
        Logger.init();
        //DEBUG_STOP

        announce();
        Profiler.start('main');
        createMessageStorage();
        startProgressBar();

        if (isScriptAllowedToRun()) {
            if (Input.createConfiguration()) {
                //DEBUG_START
                logIncomingParams();
                //DEBUG_STOP
                Profiler.start('main');
                runRegisteredTasks();
                createGraphicViews();
                sortGraphicsByIndexes();
                applyPropsToGraphicViews();
                saveTasks4Compare();
            }
        }

        printMessages();
        stopProgressBar();
        Profiler.stop('main');
        _rp(_t('report.done', Profiler.get_HRF_time('main')));

        //DEBUG_START
        dumpTasks2Disk();
        Logger.close();
        //DEBUG_STOP
    };

    /**
     * Prints announce messages at start of script execution
     *
     * @private
     */
    var announce = function() {
        var message = null;
        var scriptName =  Script.name.toUpperCase();
        var fixedbuildTime = new Date(Script.buildTimestamp);
        // Ant's tstamp task returns month that starts from 1
        // since JavaScript treats month as zero-based number
        // we have to 'go' one month back
        // TODO possbily this work buggy with dates > 27th
        fixedbuildTime.setMonth(Script.buildTimestamp.getMonth() - 1);

        if (Script.version.indexOf('VERSION') < 0) {
            message = _t('report.version.rel', scriptName, Script.version);
        } else if (Script.buildID.indexOf('BUILD_ID') < 0) {
            message = _t('report.version.vcs_dev', scriptName,
                    Script.buildID, fixedbuildTime.toLocaleString());
        } else {
            message = _t('report.version.dev', scriptName,
                    fixedbuildTime.toLocaleString());
        }

        _rp(message);
        //DEBUG_START
        _rp(_t('report.date', startTime.toLocaleString()));
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
            return;
        }

        var specs  = Object.keys(tasksHash);
        var sortFn = function(a, b) { return a.length - b.length; };
        var padLen = Math.ceil(specs.sort(sortFn).last().length * 1.4);
        var count  = length.toString();

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

        for (var ii = 0, specObj; ii < length && Host.CanContinue(); ii++) {
            Host.SetStatusText(_t('core.status.message', ii));
            specObj = tasksHash[specNames[ii]];

            //DEBUG_START
            preProcess(specObj, ii);
            //DEBUG_STOP

            specObj.process();
            Host.SetProgress(ii);

            //DEBUG_START
            postProcess(specObj);

            if (Script.stopAfterTask === specNames[ii]) {
                _rl('tasks queue terminated', {colors: [0, 0xFFAD00]});
                break;
            }
            //DEBUG_STOP
        }
    };

    /**
     * Creates storage different kind of messages listed in
     * {@link Script#messagePrintProps} property.
     *
     * @private
     */
    var createMessageStorage = function() {
        messageTypes = JSON.parse(JSON.stringify(Script.messagePrintProps));

        for (var item in messageTypes) {
            if (messageTypes.hasOwnProperty(item)) {
                messageTypes[item].messages = [];
            }
        }
    };

    /**
     * Lists verified message types
     *
     * @return {Array} known and verified message types
     */
    var listMessageTypes = function() {
        return Object.keys(messageTypes);
    };

    /**
     * Method that stores all type of messages that are being produced
     * by tasks
     *
     * Message types are defined in {@link Script#messagePrintProps property}.
     *
     * @param {String} [messageType] name of the message type
     * @param {String|Array|Object} [message] message that should be printed.
     * Can be passed in 3 acceptable types
     *
     * @return {Boolean} result of the action execution
     */
    var addMessage = function(messageType, message) {
        if (typeof messageType !== 'string' || messageType.length === 0) {
            //DEBUG_START
            _e('[Dispatcher::addMessage]: invalid message type');
            //DEBUG_STOP
            return false;
        }

        if (messageTypes.hasOwnProperty(messageType) === false) {
            //DEBUG_START
            _e('[Dispatcher::addMessage]: unknown message type');
            //DEBUG_STOP
            return false;
        }

        messageTypes[messageType].messages.push(message);
        return true;
    };

    /**
     * Prints all messages for all type of messages that were collected during
     * script execution
     *
     * Short note on localization of messages and headers describing their
     * types
     *
     * Each header is automatically translated by this function. To get this
     * working you need to have next line in localization resource file
     * for each type of message
     *
     * ```
     * report.messages.MY_MESSAGE_TYPE = Сообщения
     * ```
     *
     * Each message can be also automatically translated by this function.
     * To get this working you need to have line with key you passed
     * as 2nd param in * {@link Dispatcher#addMessage} method in your
     * localization resource file. See next example
     *
     * ```
     * ...
     * // somewhere in your task
     * this.addSuccess('my.super.key');
     * ...
     * ```
     *
     * To get it automatically translated before printing you need to add next
     * line to localization resource file
     *
     * ```
     * # line with exactly that key
     * my.super.key = Измерения были успешно завершены
     * ```
     *
     * @private
     */
    var printMessages = function() {
        var uniqueMessages = null;
        var printMessageFunc = function(item) {
            var message = _t.apply(null, item.message);
            var controlChars = item.controlChars ||
                messageTypes[type].messageControlChars;

            if (item.phrase === true) {
                _rw(message, controlChars);
            } else {
                _rl(message, controlChars);
            }
        };
        var filterMessagesFunc = function(item) {
            if (uniqueMessages.indexOf(item.message[0]) > -1) {
                return false;
            }

            uniqueMessages.push(item.message[0]);
            return true;
        };

        for (var type in messageTypes) {
            if (messageTypes.hasOwnProperty(type)) {
                if (messageTypes[type].messages.length === 0) {
                    continue;
                }

                if ((messageTypes[type].skipHeader === true) === false) {
                    _rp(_t('report.messages.' + type),
                            messageTypes[type].headerControlChars);
                }

                uniqueMessages = [];
                messageTypes[type].messages
                    .filter(filterMessagesFunc)
                    .forEach(printMessageFunc);

                _rl('');
            }
        }

        // TODO: make this optional
        Host.ShowReport();
    };

    /**
     * Creates all graphic views that were confirmed for creation
     *
     * @private
     */
    var createGraphicViews = function() {
        //DEBUG_START
        _p('in `createGraphicViews`');
        var viewIndexes = [];
        //DEBUG_STOP

        confirmedViews
            .map(function(view) { return view.split(':'); })
            .sort(function(a, b) { return a[1] - b[1]; })
            .forEach(function(view) {
                //DEBUG_START
                _d(view, 'Processing next view');
                if (viewIndexes.indexOf(view[1]) > -1) {
                    _e('Duplication of index');
                    return;
                }

                if (graphicsViews.hasOwnProperty([view[0]])) {
                    _e('Next view has been already created');
                    return;
                }

                viewIndexes.push(view[1]);
                //DEBUG_STOP

                // by default Cartesian coordinate system will be used
                // http://en.wikipedia.org/wiki/Cartesian_coordinate_system
                var type = view[0].split('@')[1] || 0;
                var viewName = view[0].split('@')[0];
                var title = _t('views.' +  viewName + '.name');
                var viewObj = Host.CreateGraphicViewEx(title, type);
                graphicsViews[viewName] = viewObj;
            });

        return true;
    };

    /**
     * Sort all king of graphics to get order they were requested to be
     * appeard in views they were addressed
     *
     * @private
     */
    var sortGraphicsByIndexes = function() {
        var mapFunc  = function(item) { return item.slice(1); };
        var sortFunc = function(a, b) {
            // try to sort by view index
            if (a[0] < b[0]) { return -1; }
            if (a[0] > b[0]) { return  1; }
            // if still same - sort by index in global array
            return a[1] - b[1];
        };

        Object.keys(viewsProps).forEach(function(ii) {
            sortableProps.forEach(function(key) {
                if (Array.isArray(viewsProps[ii][key])) {
                    viewsProps[ii][key] =
                        viewsProps[ii][key].sort(sortFunc).map(mapFunc);
                }
            });
        });

        return true;
    };

    /**
     * Applies all king of props to corresponding views
     *
     * @private
     */
    var applyPropsToGraphicViews = function() {
        //DEBUG_START
        _p('in `applyPropsToGraphicViews`');
        _d('');
        _d(viewsProps, 'all props');
        _d('');
        //DEBUG_STOP

        Object.keys(graphicsViews).forEach(function(view) {
            Object.keys(viewsProps[view]).forEach(function(key) {
                applyMethodToView(view, key, viewsProps[view][key]);
            });

            graphicsViews[view].Update();
        });
    };

    /**
     * Apply any  particular prop to specified view
     *
     * @param {String} view A key that points to real view object in
     * `graphicsViews` dictionary
     * @param {String} key A human readable name of prop that will be set.
     * All possible props a mentioned in {@link Task#addProp4Views} method
     * @param {Array} instancesParams An array of multiple instances of params
     * for particular prop that are going to be set.
     *
     * @private
     */
    var applyMethodToView = function(view, key, instancesParams) {
        var propsHash = {
            'area':        'AddArea',
            'comment':     'AddComment',
            'description': 'SetDescription',
            'graphic':     'AddGraphic',
            'graphicex':   'AddGraphicEx',
            'limits':      'SetLimits',
            'notation':    'AddNotation',
            'scale':       'SetScale',
            'set':         'SetGraphic',
            'zoom':        'ZoomToValues'
        };

        var method      = propsHash[key] || key;
        var viewObject  = graphicsViews[view];

        //DEBUG_START
        var dumpInfoFunc = function(errorMessage, args) {
            _i('%'.repeat(40));
            _e(errorMessage);
            _d(view, 'view');
            _d(method, 'method');
            _d(args.length, 'amount of params');
            _d(args, 'params');
        }
        //DEBUG_STOP

        instancesParams.forEach(function(args) {
            var len  = args.length;
            var arg1 = null;

            arg1 = sortableProps.indexOf(key) < 0 ?
                args[0] : drownGraphics[args[0]];

            // very sad piece of code ... :(
            try {
                if (len === 1) {
                    viewObject[method](arg1);
                } else if (len === 2) {
                    viewObject[method](arg1, args[1]);
                } else if (len === 3) {
                    viewObject[method](arg1, args[1], args[2]);
                } else if (len === 4) {
                    viewObject[method](arg1, args[1], args[2], args[3]);
                } else if (len === 5) {
                    viewObject[method](arg1, args[1], args[2], args[3], args[4]);
                } else if (len === 6) {
                    viewObject[method](arg1, args[1], args[2], args[3], args[4], args[5]);
                } else {
                    //DEBUG_START
                    dumpInfoFunc('This amount of params is not handled yet', args);
                    //DEBUG_STOP
                }
            } catch (e) {
                //DEBUG_START
                dumpInfoFunc('Next error occured on processing this item: ' +
                        e.message, args);
                //DEBUG_STOP
            }
        });
    };

    /**
     * Starts visualisation on application's progress bar
     *
     * @private
     */
    var startProgressBar = function() {
        var taskTotal = Object.keys(tasksHash).length + 1;
        Host.ShowProgress(_t('core.status.start'), taskTotal);
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
    var getTaskObject = function(name) {
        if (typeof name !== 'string' || name.length === 0) {
            //DEBUG_START
            _e(name, 'spec name has wrong type or zero length');
            //DEBUG_STOP
            return null;
        }

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
    var getValidTaskObject = function(name) {
        var taskObj = getTaskObject(name);

        if (taskObj && taskObj.getTaskStatus()) {
            return taskObj;
        } else {
            return null;
        }
    };

    /**
     * Stores props of the views that should be set after views will be
     * created into {@link Dispatcher#viewsProps} property
     *
     * **NOTE**: Usually you do not need to use this method directly.
     * Its utilization is being done automatically. However if you do,
     * there should be strong reason for that.
     *
     * @param {Object} viewsProps A dictionary with views and theirs
     * properties
     */
    var storeViewsProps = function(newViewsProps) {
        viewsProps = Utils.mergeRecursive(viewsProps, newViewsProps);
    };

    /**
     * Stores view that is confirmed for creation into
     * {@link Dispatcher#confirmedViews} property
     *
     * **NOTE**: Usually you do not need to use this method directly.
     * Its utilization is being done automatically. However if you do,
     * there should be strong reason for that.
     *
     * @param {String} view Name of view
     *
     */
    var storeConfirmedView = function(view) {
        if (view) {
            confirmedViews.push(view);
        }
    };

    /**
     * Stores real graphic object into {@link Dispatcher#drownGraphics}
     * property
     *
     * **NOTE**: Usually you do not need to use this method directly.
     * Its utilization is being done automatically. However if you do,
     * there should be strong reason for that.
     *
     * @param {Object} graphicObj Real graphic object
     */
    var storeGraphicObject = function(graphicObj) {
        if (graphicObj) {
            return drownGraphics.push(graphicObj);
        } else {
            // TODO what is best value here?
            return null;
        }
    };

    /**
     * Returns data for task
     *
     * @param {String} [specName] name of the task
     * @return {Object|Null} data for the specified task
     */
    var requestTaskData = function(specName) {
        if (data4Compare) {
            if (data4Compare['data'].hasOwnProperty(specName)) {
                return data4Compare['data'][specName];
            } else {
                //DEBUG_START
                var message = 'external file does not contain data for ' +
                   'specified task. format version mismatch?'
                _e(specName, message);
                //DEBUG_STOP
                return false;
            }
        }

        return null;
    };

    /**
     * Reads data for this task from file
     *
     * @param {String} [filename] variable with filename to read data from
     * @return {Boolena} result of the load operation
     */
    var loadExternalData = function(filename) {
        var result = 0;

        if (IO.isFileExist(filename)) {
            //DEBUG_START
            _d(filename, 'will try to load external data in next file');
            //DEBUG_STOP

            try {
                data4Compare = JSON.parse(IO.readFileContent(filename));
                result = 1;
                //DEBUG_START
                _d('all is OK');
                //DEBUG_STOP
            } catch(e) {
                //DEBUG_START
                _e('smth went wrong');
                _d(e.message, 'error message');
                //DEBUG_STOP
            }
            //DEBUG_START
        } else {
            _d(filename, 'Can not find next file');
            //DEBUG_STOP
        }

        // if format is not the same
        if (data4Compare && data4Compare.format !== Script.dumpFormat) {
            result = 0.5;
        }

        return result;
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
    var addSpec4Saving = function(specName) {
        if (specName) {
            return specs2Save4Compare.push(specName);
        }
    };

    /**
     * Dumps data of the tasks to the disk for future compare feature
     *
     * @private
     */
    var saveTasks4Compare = function() {
        //DEBUG_START
        _p('in `saveTasks4Compare`');
        _d('');
        //DEBUG_STOP

        // lets check if number of specs for saving is bigger than 0
        if (specs2Save4Compare.empty()) {
            //DEBUG_START
            _d('did not find specs to save');
            //DEBUG_STOP
            return true;
        }

        //DEBUG_START
        _d(specs2Save4Compare, 'list of specs for saving');
        //DEBUG_STOP

        var fileHandler = null;
        var fileOptopns = {
            noutf:    true,
            filedir:  [Host.CurPath, IO.getSafeNeighbourPath(), 'data'],
            filename: Host.CurFileName.replace(/\.mwf$/, '') + '.json.txt'
        };

        if ((fileHandler = IO.createFile(fileOptopns)) === null) {
            return false;
        }

        //DEBUG_START
        _p(fileHandler.getFilePath(), 'Next file will be used for writing data');
        //DEBUG_STOP

        var data2Save = {
            'timestamp': startTime.toUTCString(),
            'format'   : Script.dumpFormat,
            'data'     : {},
        };

        specs2Save4Compare.forEach(function(item) {
            data2Save.specs2compare[item + '_external'] =
                getTaskObject(item).getDataSets();
        });

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

    //DEBUG_START
    /**
     * Dumps data of the tasks to the disk that were allowed to export it
     *
     * @private
     */
    var dumpTasks2Disk = function() {
        if (Script.dumpTasksData !== true) {
            return;
        }

        var fh = null;
        var fileOptopns = {
            filename: Host.CurPath + '\\' + 'data.txt'
        };

        if ((fh = IO.createFile(fileOptopns)) === null) {
            return false;
        }

        Object.keys(tasksHash).forEach(function(item) {
            var taskObj = getTaskObject(item);

            if (taskObj.isSavingRequired() === false) {
                return false;
            }

            fh.writeln(item);
            fh.writeln(taskObj.getTaskStatuses());
            fh.writeln(JSON.stringify(taskObj.getDataSets(), null, 4));
            fh.writeln('');
        });

        fh.close();
    };
    //DEBUG_STOP

    return {
        'addMessage':          addMessage,
        'addSpec4Saving':      addSpec4Saving,
        'getTaskObject':       getTaskObject,
        'getValidTaskObject':  getValidTaskObject,
        'listMessageTypes':    listMessageTypes,
        'loadExternalData':    loadExternalData,
        'process':             process,
        'registerNewTask':     registerNewTask,
        'requestTaskData':     requestTaskData,
        'storeConfirmedView':  storeConfirmedView,
        'storeGraphicObject':  storeGraphicObject,
        'storeViewsProps':     storeViewsProps
    };
})();
