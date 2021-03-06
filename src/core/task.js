/**
 * Task Class
 *
 * Running script in general solves some huge task. But that huge task usually
 * consists of dozens of javascript expressions. Group of expressions
 * that solves single logical task should be organized in task. This can look
 * in following way
 *
 * ```
 * Dispatcher.registerNewTask({
 *     specName: 'my_task0',
 *     axisName: 'cm',
 *     viewIndex: 'view:1',
 *     graphicType: 'plain:thin',
 *     calc_data: function() {
 *         this.addDataSet({
 *             x: [0, 1],
 *             y: [0, 1]
 *         });
 *     }
 * });
 *
 * Dispatcher.registerNewTask({
 *     specName: 'my_task1',
 *     dataSource: 'radius',
 *     defaultKeys: 'perimeter',
 *     calc_data: function() {
 *         this.addPerimeter(2 * Math.PI * Input.getValue(this.dataSource));
 *     }
 * });
 *
 * Dispatcher.registerNewTask({
 *     specName: 'my_task2',
 *     dependencies: ['my_task1:0:perimeter:0'],
 *     dataSource: 'height',
 *     defaultKeys: 'square',
 *     calc_data: function() {
 *         var perimeter = this.getDepDataSet(0);
 *         this.addSquare(perimeter * Input.getValue(this.dataSource));
 *     }
 * });
 *
 * Dispatcher.registerNewTask({
 *     specName: 'my_task3',
 *     dependencies: ['my_task2:0:square:0'],
 *     calc_data: function() {
 *         var square = this.getDepDataSet(0);
 *         var messageKey = 'my_task3.message.cylinder_square';
 *         Dispatcher.addMessage([messageKey, square]);
 *         return true;
 *     }
 * });
 * ```
 *
 *
 *
 * @param {Object} params **hash/dict with keys that are below**
 *
 *
 *
 * @param {String} params.specName Name of the task. **mandatory**. Should
 * not contain `:` and be unique through all tasks that are loaded
 *
 *
 *
 * @param {String} [params.dataSource = null]
 * Name of the input that holds data source for this task
 *
 *
 *
 * @param {Array} [params.dependencies = []]
 * List of dependent tasks that should be satisfied to have this task run.
 * Each dependency is defined in format of datalink. For details see
 * {@link Task#getUnsureTaskData} method
 *
 *
 *
 * @param {String} [params.viewIndex = null]
 * List of the views name and indexes of the graphics in that views. Format
 * of value is following
 *
 * `viewName:index[, viewName:index...]`
 *
 * where:
 *
 * - `viewName` is an name of the view that will get graphics produced by
 * this task
 * - `index` is an ordinal number (starting from 1) used to define order
 * of the graphic(s) in specified view.
 *
 *
 *
 * @param {String} [params.providedView = null]
 * Name of the view that should be created. Format of value is following
 *
 * `providedView:index`
 *
 * where:
 *
 * - `index` is an ordinal number (starting from 1) used to define order
 * of creation specified view.
 * - `viewName` is an **internal** name of the view. This name is used
 * everywhere inside scripts. View object itself will attempt to get its
 * localized name automatically in following way:
 *
 * `_t('views.' + providedView + '.name')`
 *
 * where:
 *
 *   - `'views.'` and `'.name'` are mandatory hardcoded strings
 *   - `providedView` is internal view name
 *   - `_t()` is shortcut for localization function
 *
 * this means that localization resource file should contain next line
 *
 * `views.MY_VIEW_NAME.name = Моя вкладка`
 *
 *
 *
 * @param {String} [params.axisName = 'none']
 * Internal name of the axis Y for all graphics produced by this task.
 * On graphic(s) drawing it will be automatically coverted to localized
 * version of it in following way
 *
 * `_t('units.' + axisName)`
 *
 * where
 *
 * - `'units.'` is a hardcoded mandatory string
 * - `axisName` is that internal axis name.
 *
 * This means that localization resource file should contain next line
 *
 * `units.MY_AXIS_NAME = крт.`
 *
 * If you need to hide unit box for graphic(s) produced by this task just
 * do not pass any value for this key/subparam, since default value for it
 * just does exaclty what you need.
 *
 *
 *
 * @param {String|Function} [params.graphicName = null]
 * Allows to set custom mechanizm for generating localized titles of
 * graphic(s) produced by this task. If this subparams is not passed than
 * next method is used
 *
 * `_t('specs.' + specName + '.name')`
 *
 * where
 *
 * - `'specs.'` and `'.name'` are mandatory hardcoded strings
 * - `specName` is name of task (see above)
 *
 * This means that localization resource file should contain next line
 *
 * `specs.MY_SPEC_NAME.name = График скорости улитки`
 *
 * If this subparam's value is a string than next method is used
 *
 * `_t('specs.' + graphicName + '.name', index)`
 *
 * where
 *
 * - `'specs.'` and `'.name'` are mandatory hardcoded strings
 * - `graphicName` is value of this subparam
 * - `index` is an ordinal number (startting from 1) of the graphic produced
 * by this task. Localization module will substitute a `%1` pattern with
 * passed index automatically
 *
 * This means that localization resource file may contain next line
 *
 * `specs.MY_GRAPHIC_NAME.name = График скорости %1-й улитки`
 *
 * However also previous approach is possible. In this case passed index will
 * be ignored and line in localization resource file may looks like this
 *
 * `specs.MY_GRAPHIC_NAME.name = График скорости улитки`
 *
 * If this subparam's value is a function than following method is used
 *
 * `this.graphicName(index, graphicsAmount);`
 *
 * In this case you will have all control on text that will be shown as title
 * for each graphic produced by this task. This function is executed in
 * context of task so you have full access to all internals of task object,
 * so please be carefull. Also function gets 2 params
 *
 * - `index` ordinal number (startting from 1) of the graphic produced by
 * this task
 * - `graphicsAmount` total number of graphics produced by this task
 *
 *
 *
 * @param {Function|Array|Number} [params.graphicColor = null]
 * Color(s) for graphics that will generated by this script
 *
 * Array of colors is usable when task priduces multiple graphics.
 * With help of function you have full freedom on creating any color you
 * like/need. Function receives an index of graphic that is currently processed
 *
 *
 * @param {Array|String} [params.hiddenGraphics = null]
 * Sometimes there is a need to turn off graphic(s) by default in the view.
 * This can be achieved by setting this property. Possible values are
 *
 * - `'*'` - make all graphics invisible
 * - `[1, 0, 1]` - make 1st and 3rd graphics invisible
 *
 * Default value means graphic(s) will be visible
 *
 *
 *
 * @param {String} [params.graphicType = '']
 * Specs of graphics that should be applied during drawing
 *
 * Commont format of this string is following
 *
 * ```
 * graphic_type:line_type
 * ```
 *
 * We support next types of graphics
 *
 * - `plain` - regular graphic
 * - `multicolor` - when graphic is a multicolor line
 * - `area` - when graphic is an area
 * - `sidestep` - when graphic is looks like stair-step
 *
 * ```
 *         (x2, y2)
 *                 o --
 *                 |
 *                 |
 *           o --- o
 *  (x1, y1) |     (x2, y1)
 * ```
 *
 * If no value specified `plain` value is assumed
 *
 * We support next types of lines
 *
 * - `thin` - thin line joined with thick dots
 * - `thick` - thick line, no dots
 * - `dots` - no lines, only thick dots
 *
 *
 *
 * @param {Array} [params.defaultKeys]
 * If you need to change {link Script#defaultKeys default list} of keys for
 * particular task feel free to set this property.
 *
 * Whenewer you set or not this prop {@link Task#createGetSetPropMethods}
 * method will use value from `Script#defaultKeys` property and create helper
 * methods
 *
 *
 *
 * @param {Boolean} [params.setLimits = false] A flag that indicates if limits
 * should be applied to graphics produced by this task
 *
 *
 *
 * @param {Function|Number} [params.minLimit = null] Defined min value of the
 * limit that should be applied to graphics produced by this task. Will be
 * ignored if `setScale` subparam does not equals to `true`
 *
 * If this subparam is a number than it will be used without any modifications.
 * If its a function than you get full control on number that will be
 * calculated for min limit. Function is executed in context of task so you
 * have full access to all internals of task object, so please be carefull.
 * Also function gets 1 param
 *
 * - `min` minimal value from 2nd default key of the dataset that is currently
 * processed
 *
 *
 *
 * @param {Function|Number} [params.maxLimit = null]
 * Defined max value of the limit that should be applied to graphics produced
 * by this task. Will be ignored if `setScale` subparam does not equals to
 * `true`.
 *
 * If this subparam is a number than it will be used without any
 * modifications. If its a function than you get full control on number that
 * will be calculated for min limit. Function is executed in context of task so you
 * have full access to all internals of task object, so please be carefull.
 * Also function gets 1 param
 *
 * - `max` maximum value from 2nd default key of the dataset that is currently
 * processed
 *
 *
 *
 * @param {Boolean} [params.setScale = false] A flag that indicates if scale
 * should be applied to graphics produced by this task
 *
 *
 *
 * @param {Number} [params.scaleValue = null] Value of the scale that should
 * be applied to graphics produced by this task. Will be ignored if `setScale`
 * subparam does not equals to `true`
 *
 *
 *
 * @param {Number} [params.scaleColor = null] Value of the color that should
 * be applied to graphics produced by this task. Will be ignored if `setScale`
 * subparam does not equals to `true`
 *
 *
 *
 * @param {Function} [params.calc_data] Function that should perform
 * calculation of the data. Call of this function is being done automatically.
 * Function is executed in context of task so you have full access to all
 * internals of task object, so please be carefull. Defined 'calc_data' prop
 * in hash overrides {@link Task#calc_data} method.
 *
 * If method does not produce any data, it should return boolean value that
 * indicates if function ended successfully
 *
 *
 *
 * @param {Function} [params.make_props] Code wrapped with function block
 * that should perform a creation of properties for view(s). Call of this
 * function is being done automatically. Defined 'make_props' prop in hash
 * overrides {@link Task#make_props} method.
 *
 *
 *
 * @constructor
 */
Task = function(params) {
    this.statusCodes = [];
    this.graphics = [];
    this.viewsProps = {};
    this.minMaxValues = null;
    this.dataSetsCount = 0;

    this.specName = null;
    this.defaultKeys = [];
    this.dataSource = null;
    this.dependencies = [];
    this.softDependencies = [];
  //this.revokedSpecs = [];
  //this.forbiddenChannel = null;

    this.exportData = false;
    this.importData = false;
    this.requestDataLoad = false;
    this.isSavingAllowed = true;
    // experimental
    this.drawMarkers = false;
    this.customMarkers = [];
    //DEBUG_START
    this.logHashInData = false;
    //DEBUG_STOP

    this.viewIndex = null;
    this.providedView = null;

    this.axisName = 'none';
    this.graphicName = null;
    this.lineType = null;
    this.graphicType = '';
    this.graphicColor = null;
    this.hiddenGraphics = null;
    this.defaultLineType =
        typeof $GRAPHIC_TYPE$ === 'undefined' ? 2 : $GRAPHIC_TYPE$;

    this.setLimits = false;
    this.minLimit  = null;
    this.maxLimit  = null;

    this.setScale = false;
    this.scaleValue = null;
    this.scaleColor = null;

    Utils.configureObj(this, params);
};

/**
 * Returns name of the task
 *
 * @private
 * @ignore
 */
Task.prototype.getFullName = function() {
    //DEBUG_START
    _w('Usage of `getFullName` method is deprecated');
    //DEBUG_STOP
    return this.getTaskName();
};

/**
 * Returns name of the task
 *
 * @return {String} name of the task
 * @private
 */
Task.prototype.getTaskName = function() {
    return this.specName;
};

/**
 * Returns status of the last completed action for current task
 *
 * @return {Boolean} status
 */
Task.prototype.getTaskStatus = function() {
    return this.statusCodes.last();
};

/**
 * Returns all statuses for current task
 *
 * @return {Array} status
 */
Task.prototype.getTaskStatuses = function() {
    return this.statusCodes.slice(0);
};

/**
 * Stores status of newly completed action. Also returns it
 *
 * @param  {Object} value that represent status that is going to be set.
 * Will be casted to `Boolean`
 * @return {Boolean} status that has been set
 * @private
 */
Task.prototype.updateStatus = function(taskStatus) {
    taskStatus = Boolean(taskStatus);
    this.statusCodes.push(taskStatus);
    return taskStatus;
};

/**
 * Runs all lowlevel task methods
 *
 * @return {Boolean} final status of the task
 * @private
 */
Task.prototype.process = function() {
    this.createAddMessageMethods();
    this.createGetSetPropMethods();
    this.checkDependencies();
    this.checkDataSource();
    this.processTaskDataMethod();
    //DEBUG_START
    this.logDataStats();
    //DEBUG_STOP
    this.processViewsProps();
    this.joinViewsProps();

    // contact with Dispatcher
    this.sendViewsProps();
    this.sendConfirmedView();
    this.addTask2Save4Compare();

    return this.getTaskStatus();
};

/**
 * Checks user's input for dataSource option for this task
 *
 * @return {Boolean} final status of the task
 * @experimental
 * @private
 */
Task.prototype.checkDataSource = function() {
    if (this.getTaskStatus() === false) {
        return false;
    }

    var result = true;

    if (this.dataSource) {
        var dataSource = Input.getValue(this.dataSource);

        // check for null is required for case when
        //      number of channel is requested that is unset by user
        // check for undefined is required for case when
        //      we need to get a value of input that was not shown to user
        if (typeof dataSource === 'undefined' || dataSource === null) {
            //DEBUG_START
            _w(this.dataSource, 'dataSource is not valid');
            //DEBUG_STOP
            result = false;
        } else {
            result = true;
        }
    }

    return this.updateStatus(result);
};

/**
 * Checks all kind of dependencies for this task
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.checkDependencies = function() {
    if (this.getTaskStatus() === false) {
        return false;
    }

    var result = true;
    //DEBUG_START
    _d('checking dependencies...');
    //DEBUG_STOP

    result = result && this.isDependenciesResolved();
    result = result && this.isSoftDependenciesResolved();
    result = result && this.isForbiddenDependenciesResolved();

    return this.updateStatus(result);
};

/**
 * Checks if direct dependencies of the task is resolved
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.isDependenciesResolved = function() {
    for (var ii = 0; ii < this.dependencies.length; ii++) {
        //DEBUG_START
        if (typeof this.dependencies[ii] !== 'string') {
            _e('Dependency has wrong type!');
            if (typeof this.dependencies[ii] === 'undefined') {
                _i('Quite possible you have useless comma in deps..');
            }
            return false;
        }
        //DEBUG_STOP

        if (this.dependencies[ii].charAt(0) === '!') {
            continue;
        }

        var depNameParts = this.dependencies[ii].split(':');
        var depName = depNameParts[0];
        var depObj = Dispatcher.getValidTaskObject(depName);

        if (!depObj) {
            //DEBUG_START
            _d(this.dependencies[ii], 'Next dependency was not resolved');
            //DEBUG_STOP
            return false;
        }

        if (depNameParts.length > 1) {
            if (depObj.isDataSetExist(depNameParts[1]) === false) {
                //DEBUG_START
                _e(depNameParts[1], 'cant find dataSet with specified index');
                //DEBUG_STOP
                return false;
            }
        }
    }

    return true;
};

/**
 * Checks if specified dependencies of the task is unresolved
 *
 * @return {Boolean} result of the check
 * @private
 * @ignore
 */
Task.prototype.isForbiddenDependenciesResolved = function() {
    var depName = null;

    for (var ii = 0; ii < this.dependencies.length; ii++) {
        //DEBUG_START
        if (typeof this.dependencies[ii] !== 'string') {
            _e('dependency has wrong type');
            continue;
        }
        //DEBUG_STOP

        depName = this.dependencies[ii];
        if (depName.charAt(0) !== '!') {
            continue;
        }

        depName = depName.slice(1);
        if (Dispatcher.getValidTaskObject(depName)) {
            //DEBUG_START
            _i(depName, 'Next dependency should not be resolved');
            //DEBUG_STOP
            return false;
        }
    }

    return true;
};

/**
 * Checks if any soft dependency of the task is resolved
 *
 * @return {Boolean} result of the check
 * @private
 * @ignore
 */
Task.prototype.isSoftDependenciesResolved = function() {
    if (this.softDependencies.empty()) {
        return true;
    }

    var isDepNameAString = function(item) {
        return typeof item === 'string';
    };

    var isDepNameAnArray = function(item) {
        return Array.isArray(item);
    };

    if (this.softDependencies.every(isDepNameAString)) {
        this.softDependencies = [this.softDependencies];
    } else if (this.softDependencies.every(isDepNameAnArray)) {
        // all is OK, nothing to do
    } else {
        //DEBUG_START
        _e('soft dependencies have inconsistent types');
        //DEBUG_STOP
        return false;
    }

    for (var ii = 0, specName; ii < this.softDependencies.length; ii++) {
        specName = this.softDependencies[ii];

        if (Task.findValidDependency(specName) === null) {
            //DEBUG_START
            _i('None soft dependency was resolved');
            //DEBUG_STOP
            return false;
        }
    }

    return true;
};

/**
 * Returns a dependency task by its index in 'dependencies' array.
 *
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {Task|null} task object
 */
Task.prototype.getDependencyObject = function(index) {
    index = Utils.parseIntegerNumber(index);

    if (index < this.dependencies.length) {
        var specName = this.dependencies[index].split(':')[0];
        return Dispatcher.getTaskObject(specName);
    }

    return null;
};

/**
 * Returns a dependency data by its index in 'dependencies' array
 *
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {DataSet|Array|Number} value that has been requested
 */
Task.prototype.getDepDataSet = function(index) {
    index = Utils.parseIntegerNumber(index);
    var depObj = this.getDependencyObject(index);
    return Task.getTaskData(depObj, this.dependencies[index]);
};

/**
 * Returns first task from soft dependencies that has positive status
 *
 * @param {Number} [index] zero-based index of the soft dependency
 *  that was requested
 * @return {Task} satisfied task
 * @private
 * @ignore
 */
Task.prototype.getActiveSoftDependency = function(index) {
    index = Utils.parseIntegerNumber(index);
    return Task.findValidDependency(this.softDependencies[index]);
};

/**
 * Returns a task's data by datalink. Its not safe to get a data from task with
 * unknown status. Thats why it has 'unsure' word in name. In case task's
 * status is negative, `null` is returned otherwise we try to reach requested
 * data with help of {@link Task#getTaskData}
 *
 * @param {String} datalink For most quick access to data from dependent tasks
 * and theris data we use strings that we called dataLink with next format
 *
 * `TaskName[:DataSetIndex[:DataKey[:Index]]]`
 *
 * @return {DataSet|Array|Number} value that has been requested
 */
Task.prototype.getUnsureTaskData = function(dataLink) {
    var specName = dataLink.split(':')[0];
    var task = Dispatcher.getValidTaskObject(specName);

    if (task !== null) {
        return Task.getTaskData(task, dataLink);
    }

    return null;
};

/**
 * Runs method that produces/gets data(numbers) for this task
 *
 * @return {Boolean} status/result of the action
 * @private
 */
Task.prototype.processTaskDataMethod = function() {
    if (this.getTaskStatus() === false) {
        return false;
    }

    var result = null;

    if (this.requestDataLoad) {
        result = this.processLoadResult(this.requestDataLoadMethod());
    } else if (this.importData) {
        result = this.processPullResult(this.pullTaskData());
    } else {
        //DEBUG_START
        _d('calculation of task\'s data');
        //DEBUG_STOP
        result = this.calc_data();
    }

    this.dataSetsCount = this.graphics.length;

    result = this.dataSetsCount > 0 && typeof result === 'undefined' ?
        true : !!result;

    //DEBUG_START
    _d(result, '`processTaskDataMethod` final result');
    //DEBUG_STOP
    return this.updateStatus(result);
};

/**
 * Asks Dispatcher to try to load external data
 *  that should be used for compare feature
 *
 * @return {Boolean} status/result of the action
 * @private
 */
Task.prototype.requestDataLoadMethod = function() {
    //DEBUG_START
    _d('load of external data');
    //DEBUG_STOP

    var filename = Input.getValue(this.dataSource);
    var result = false;

    if (filename) {
        result = Dispatcher.loadExternalData(filename);
    } else {
        return result;
    }

    if (typeof result === 'number') {
        this.addError('core.messages.loadData.error' + result);
        return result;
    }

    return result;
};

/**
 * Function that performs check of the result that was returned after
 * {@link Dispatcher#loadExternalData} call. Default source code of this
 * function is a stub. User may optionally redefine it.
 *
 * @return {Boolean} result of the operation
 */
Task.prototype.processLoadResult = function(result) {
    //DEBUG_START
    _d('you did not redefine \'processLoadResult\' function');
    //DEBUG_STOP

    return result && result.constructor === Object;
};

/**
 * Gets data of the task (if exist) from Dispatcher
 *
 * @return {Boolean} status/result of the action
 * @private
 */
Task.prototype.pullTaskData = function() {
    //DEBUG_START
    _d('pull task\'s data');
    //DEBUG_STOP

    var data = Dispatcher.requestTaskData(this.getTaskName());

    if (typeof data !== 'number') {
        this.graphics = data;
        data = 0;
    }

    return data;
};

/**
 * Function that performs check of the result that was returned after
 * {@link Dispatcher#requestTaskData} call. Default source code of this
 * function is a stub. User may optionally redefine it.
 *
 * @return {Boolean} result of the operation
 */
Task.prototype.processPullResult = function(result) {
    //DEBUG_START
    _d('you did not redefine \'processPullResult\' function');
    //DEBUG_STOP

    if (result > 0) {
        this.addWarning({
            'message': ['core.messages.pullData.warn1'],
            'onetime': true
        });

        //DEBUG_START
        var message = result === 0 ?
            '`data4Compare` is null. "pull" called before "load"?' :
            'current task\'s data in external file is absent or has wrong type';

        _w(message);
        _d(result, 'case code is');
        //DEBUG_STOP
    }

    return result === 0;
};

/**
 * Function that performs calculation of the data. Default source code of this
 * function is a stub. User may optionally redefine it.
 *
 * @return {Boolean} result of the operation
 */
Task.prototype.calc_data = function() {
    //DEBUG_START
    _d('you did not redefine \'calc_data\' function');
    //DEBUG_STOP
    return true;
};

//DEBUG_START
/**
 * Logs statistics for all datasets of this task
 *
 * @private
 */
Task.prototype.logDataStats = function() {
    if (this.dataSetsCount === 0) {
        _d('this spec does not have data');
    }

    this.graphics.forEach(function (dataSet, index) {
        _d('----- ' + index + ' -----');
        Object.keys(dataSet).forEach(function (key) {
            if (dataSet[key] === null || dataSet[key] === void 0) {
                _e(dataSet[key], 'key `' + key + '` value');
                return false;
            }

            if (Array.isArray(dataSet[key]) === false) {
                _d(dataSet[key].toString(), 'key `' + key + '` value');
                return false;
            }

            if (dataSet[key].empty()) {
                _d('key `' + key + '` does not have data');
                return false;
            }

            var notNum = typeof dataSet[key][0] !== 'number';
            _d(dataSet[key].length, key + '.length');

            if (notNum && dataSet[key].length === 1 && this.logHashInData) {
                _d(dataSet[key][0], key + '[0]');
                return false;
            } else if (notNum) {
                _d('key `' + key + '` holds non number items');
                return false;
            }

            var min = dataSet[key].min();
            var max = dataSet[key].max();

            if (Number.isInvalid(min) || Number.isInvalid(max)) {
                _e('key `' + key + '` contains invalid item');
                _d(dataSet[key], key);
                return false;
            }

            _d(min, key + '.min()');
            _d(max, key + '.max()');
        }, this);
    }, this);
};
//DEBUG_STOP

/**
 * Creates data set hash with default or passed keys
 *
 * @param {Array} forcedKeys array of keys
 *      that will be present in resulted hash
 * @return {DataSet} result hash (or dict) in next form
 * `{'1ST_KEY': Array.new()[, 'NEXT_KEY':  Array.new()...]}`
 */
Task.prototype.createDataSet = function(forcedKeys) {
    // TODO: non empty array
    var keys = Array.isArray(forcedKeys) ? forcedKeys : this.defaultKeys;

    return Utils.createDataSetStub(keys);
};

/**
 * Stores data that has been calculated for this task (or particular graphic)
 *
 * @param {DataSet} dataSet set of props in hash/dict
 * @return {Boolean} result of the action execution
 */
Task.prototype.addDataSet = function(dataSet) {
    // check if dataSet is hash
    if (dataSet && dataSet.constructor === Object) {
        // check if dataSet is not empty (has at least 1 key)
        if (Object.keys(dataSet).empty() === false) {
            this.graphics.push(dataSet);
            return true;
        }
    }

    return false;
};

/**
 * Stores array of datas that has been calculated for this task
 *
 * @param {Array} dataSets array of dataSets
 * @return {Boolean} result of the action execution
 */
Task.prototype.addDataSets = function(dataSets) {
    // check if dataSet is array
    if (Array.isArray(dataSets) === false) {
        return false;
    }

    var prevSize = this.graphics.length;

    for (var ii = 0; ii < dataSets.length; ii++) {
        this.addDataSet(dataSets[ii]);
    }

    return this.graphics.length > prevSize;
};

/**
 * Returns requested dataSet or one of its values by optionally specified key
 *
 * @param {Number} [index] zero-based index of the data set that
 * should be returned. Negative index is also accepted.
 * @param {String} [key] name of key that should be retrieved.
 *
 * @return {DataSet} result of the action execution
 */
Task.prototype.getDataSet = function(index, key) {
    if (typeof index === 'string') {
        key = index;
        index = 0;
    }

    var start = Utils.parseNaturalNumber(index);
    var sliceParams = start < 0 ? [start] : [start, start + 1];
    var dataSet = Array.prototype.slice.apply(this.graphics, sliceParams)[0];

    if (dataSet && key && dataSet.hasOwnProperty(key)) {
        return dataSet[key];
    }

    return dataSet || null;
};

/**
 * Returns all dataSets of this task
 *
 * @return {Array} dataSets array
 */
Task.prototype.getDataSets = function() {
    return this.graphics;
};

/**
 * Returns number of datasets in current task
 *
 * @param {Boolean} [force] flag that indicates
 *  if we need to get **current** amount of datasets
 *
 * @return {Number} amount of the datasets, produced by this task
 */
Task.prototype.getDataSetsCount = function(force) {
    return force !== true ? this.dataSetsCount : this.graphics.length;
};

/**
 * Checks if dataSet with specified index exists within task
 *
 * @param {Number} index index of the set that is checked.
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.isDataSetExist = function(index) {
    if (index === '*') {
        return this.getTaskStatus() && this.dataSetsCount > 0;
    }

    index = Utils.parseIntegerNumber(index);

    if (Number.isInvalid(index) === true) {
        return false;
    }

    if (typeof this.graphics[index] === 'undefined') {
        return false;
    }

    if (this.graphics[index] === null) {
        return false;
    }

    if (this.graphics[index].constructor !== Object) {
        return false;
    }

    return true;
};

/**
 * Creates helper methods for adding/getting values from datasets
 *
 * Lets assume next list of keys has been requested for this task
 *
 *
 * ```
 * Dispatcher.registerNewTask({
 *     ...
 *     defaultKeys: ['temperature'],
 *     ...
 * });
 * ```
 *
 * After this next methods will be **dynamically added** to instance of Task
 * class
 *
 * ```
 * Task.property.addTemperature = function(number, dataSetIndex) {
 *     dataSetIndex = Math.abs(parseInt(dataSetIndex, 10)) || 0;
 *
 *     if (typeof this.graphics[dataSetIndex] === 'undefined') {
 *         this.graphics[dataSetIndex] = {};
 *     }
 *
 *     if (typeof this.graphics[dataSetIndex]['temperature'] === 'undefined') {
 *         this.graphics[dataSetIndex]['temperature'] = [];
 *     }
 *
 *     this.graphics[dataSetIndex]['temperature'].push(number);
 * };
 *
 * Task.property.getTemperature = function(index, dataSetIndex) {
 *     index = Math.abs(parseInt(index, 10)) || 0;
 *     dataSetIndex = Math.abs(parseInt(dataSetIndex, 10)) || 0;
 *
 *     if (dataSetIndex < this.graphics.length) {
 *         return this.graphics[dataSetIndex]['temperature'][index];
 *     }
 *
 *     return []._undefined;
 * };
 * ```
 *
 * `addTemperature` method accepts next params
 *
 * - `number`, **mandatory** - item that should be added to array that is
 *   bind to 'temperature' key
 * - `dataSetIndex` - index of the data set which holds array that will get
 *   new item. This param is optional. 0 as index will be used if it is omitted
 *
 * `getTemperature` method accepts next params
 *
 * - `index` - index of the item that is requested from 'temperature' array.
 *   Can be omitted. 0 is used in that case
 * - `dataSetIndex` - index of the dataSet we going to look in
 *
 * Note its not possible to specify a `dataSetIndex` without specifying `index`
 *
 * Please note also that get/add methods capitalize keys in name of methods
 *
 * All this magic is happened for all keys of this task
 *
 * @private
 */
Task.prototype.createGetSetPropMethods = function() {
    var addValueFunc = function(self, key) {
        return function(item, dataSetIndex) {
            dataSetIndex = Utils.parseIntegerNumber(dataSetIndex);

            if (typeof self.graphics[dataSetIndex] === 'undefined') {
                self.graphics[dataSetIndex] = {};
            }

            if (typeof self.graphics[dataSetIndex][key] === 'undefined') {
                self.graphics[dataSetIndex][key] = [];
            }

            self.graphics[dataSetIndex][key].push(item);
        };
    };

    var getValueFunc = function(self, key) {
        return function(index, dataSetIndex) {
            index = Utils.parseIntegerNumber(index);
            dataSetIndex = Utils.parseIntegerNumber(dataSetIndex);

            if (dataSetIndex < self.graphics.length) {
                return self.graphics[dataSetIndex][key][index];
            }

            return []._undefined;
        };
    };

    if (this.defaultKeys.empty()) {
        this.defaultKeys = Script.defaultKeys;
    }

    // TODO filter keys that are not valid
    this.defaultKeys.forEach(function(prop) {
        this['add' + prop.capitalize()] = addValueFunc(this, prop);
        this['get' + prop.capitalize()] = getValueFunc(this, prop);
    }, this);
};

/**
 * This method creates infractructure for adding different type of messages.
 *
 * Message types are defined in {@link Script#messagePrintProps} property.
 * Lets show how this magic works with help of next example
 *
 * Lets assume `Script.messagePrintProps` property set to next value
 *
 * ```
 * Script.messagePrintProps = {
 *     'warning': {
 *         'headerControlChars': {
 *             'colors': [0xFFFFFF, 0xFF0000]
 *         }
 *     }
 * };
 * ```
 *
 * With that definition this new method (shown below) will be
 * **dynamically addded** inside every instance of Task class.
 *
 * ```
 * var task = new Task();
 * task.addWarning = function(message) {
 *     Dispatcher.addMessage('warning', message);
 * };
 * ```
 *
 * With this newly added method you will be able to add messages
 * (that will be printed at the end of script run) to special storage.
 * When script is near its finish {@link Dispatcher#printMessages} method
 * will print all of them with attributes you defined (colors, links, etc).
 *
 * All this magic is happened for all type of messages that are present
 * in * `Script#messagePrintProps` property
 */
Task.prototype.createAddMessageMethods = function() {
    var _this = this;
    var addMessageFunc = function(item) {
        return function() {
            var params = Array.prototype.slice.apply(arguments);

            if (params.empty()) {
                return false;
            }

            var message = params.shift();

            if (typeof message === 'string') {
                if (message.indexOf('.') === 0) {
                    message = 'specs.' + _this.getTaskName() + message;
                }

                if (params.empty()) {
                    params = [message];
                } else {
                    params.unshift(message);
                }

                message = params;
            }

            if (Array.isArray(message)) {
                //DEBUG_START
                if (message[0].indexOf('.') === 0) {
                    _w('incomplete key?');
                }
                //DEBUG_STOP
                message = {'message': message};
            }

            if (message.constructor !== Object) {
                //DEBUG_START
                _e('[Dispatcher::addMessage]: message is invalid object');
                //DEBUG_STOP
                return false;
            }

            Dispatcher.addMessage(item, message);
        };
    };

    Dispatcher.listMessageTypes().forEach(function(item) {
        this['add' + item.capitalize()] = addMessageFunc(item);
    }, this);
};

/**
 * Returns boolean flag that indicates if data of current task should
 * be stored
 *
 * @return {Boolean} flag to store data or not
 */
Task.prototype.isSavingRequired = function() {
    return this.isSavingAllowed;
};

/**
 * Schedules current task for saving to use in compare feature
 * @private
 */
Task.prototype.addTask2Save4Compare = function() {
    if (this.getTaskStatus() && this.exportData) {
        Dispatcher.addSpec4Saving(this.getTaskName());
    }
};

/**
 * Run user defined 'make_props' function
 *
 * @private
 */
Task.prototype.processViewsProps = function() {
    // if status is not OK no reason to go further
    if (this.getTaskStatus() === false) {
        return false;
    }

    this.make_props();
};

/**
 * Function that performs creation of the properties for view(s). Default
 * source code of this function is a stub. User may optionally redefine it.
 *
 * @return {Boolean} result of the operation
 */
Task.prototype.make_props = function() {
    //DEBUG_START
    _d('you did not redefine \'make_props\' function');
    //DEBUG_STOP
    return true;
};

/**
 * Stores user wanted rules of props for further usage
 *
 * @param {String|Array} views name of view (or array of views) that should get prop
 * @param {String} prop human readable name of prop that should be set. Next
 * props are confirmed to work:
 *
 * - `area`        is treated as `AddArea`
 * - `comment`     is treated as `AddComment`
 * - `description` is treated as `SetDescription`
 * - `graphic`     is treated as `AddGraphic`
 * - `graphicex`   is treated as `AddGraphicEx`
 * - `limits`      is treated as `SetLimits`
 * - `notation`    is treated as `AddNotation`
 * - `scale`       is treated as `SetScale`
 * - `set`         is treated as `SetGraphic`
 * - `zoom`        is treated as `ZoomToValues`
 *
 * Some of above props is handled automatically. No need to use them. Here
 * they are:
 *
 * - `area`
 * - `graphic`
 * - `graphicex`
 * @param {Array} params array of params for that prop
 * @return {Boolean} result of addition
 */
Task.prototype.addProp4Views = function(views, prop, params) {
    if (!(views && (typeof views === 'string' || Array.isArray(views)))) {
        //DEBUG_START
        _d('views param should be a string or an array of strings');
        //DEBUG_STOP
        return false;
    }

    if (typeof views === 'string') {
        views = [views];
    }

    if (!prop || typeof prop !== 'string') {
        //DEBUG_START
        _d('prop param should be non empty string');
        //DEBUG_STOP
        return false;
    }

    if (Array.isArray(params) === false || params.empty()) {
        //DEBUG_START
        _d('params param should be non empty array');
        //DEBUG_STOP
        return false;
    }

    views.forEach(function(view) {
        if (this.viewsProps.hasOwnProperty(view) === false) {
            this.viewsProps[view] = {};
        }

        if (this.viewsProps[view].hasOwnProperty(prop) === false) {
            this.viewsProps[view][prop] = [];
        }

        this.viewsProps[view][prop].push(params);
    }, this);

    return true;
};

/**
 * Converts view(s) prop(s) received from
 * {@link Task#processViewsProps} to state that is acceptable for
 * {@link Dispatcher#applyPropsToGraphicViews} method
 *
 * @return {Boolean} status of the operation
 * @private
 */
Task.prototype.joinViewsProps = function() {
    if (this.getTaskStatus() === false) {
        return false;
    }

    var view            = null;
    var prop            = null;
    var params          = null;
    var graphics        = this.drawGraphics();
    var viewIndexes     = this.parseViewIndex();
    var sourcesStates   = [
        this.getTaskStatus(),
        graphics.empty(),
        viewIndexes.empty(),
        Object.keys(this.viewsProps).empty()
    ];

    var result = Boolean(!sourcesStates.reduce(
                function(s, b) { return s && b; }, true));

    if (result === false) {
        //DEBUG_START
        _d('no view props will be generated by this task');
        //DEBUG_STOP
        return result;
    }

    // lets loop through
    //      views that should get graphics of this spec
    //      and props that should be changed for these views
    // and create namespece
    for (var ii = 0; ii < viewIndexes.length; ii++) {
        view = viewIndexes[ii].view;

        // if we do not have props for this **view**
        // lets create namespace for it
        if (this.viewsProps.hasOwnProperty(view) === false) {
            this.viewsProps[view] = {};
        }

        for (var jj = 0; jj < graphics.length; jj++) {
            switch (graphics[jj].graphicType) {
                case 'area':
                    prop = 'area';
                    break;
                case 'multicolor':
                    prop = 'graphic';
                    break;
                default:
                    prop = 'graphicex';
            }

            // if this we do not have **exact prop** for this view
            // lets create namespace for it
            if (this.viewsProps[view].hasOwnProperty(prop) === false) {
                this.viewsProps[view][prop] = [];
            }

            params = [
                // index of the graphic in view
                viewIndexes[ii].index,
                // index of the graphic obj in global array
                graphics[jj].graphic
            ];

            if (prop === 'area') {
                params.push(graphics[jj].color);
            } else if (prop !== 'multicolor') {
                params.push(graphics[jj].lineType);
                params.push(graphics[jj].color);
            }

            this.viewsProps[view][prop].push(params);

            // if this is an area or visible graphic -- skip all that is below
            // TODO we might got bugs after 2ns part of 'if' will be removed
            if (prop === 'area' || graphics[jj].visible) {
                continue;
            }

            // if this we do not have **exact prop** for this view
            // lets create namespace for it
            if (this.viewsProps[view].hasOwnProperty('set') === false) {
                // TODO 'set' should be stringified
                this.viewsProps[view].set = [];
            }

            // request making graphic invisible at start
            this.viewsProps[view].set.push([
                graphics[jj].name,
                graphics[jj].lineType,
                graphics[jj].color,
                // to set graphic initially invisible we need to pass 1 here
                graphics[jj].visible === 1 ? 0 : 1
            ]);
        }
    }

    //DEBUG_START
    if (typeof JSON !== 'undefined') {
        var msg = 'we prepared next props';
        _d(JSON.stringify(this.viewsProps, null, 4), msg);
    }
    //DEBUG_STOP

    return this.updateStatus(result);
};

/**
 * Top-level function that creates graphic(s)
 *
 * @return {Array} set of hashes that describe graphics
 * @private
 */
Task.prototype.drawGraphics = function() {
    if (!this.viewIndex) {
        return [];
    }

    this.findMinMaxValues();

    var graphics = [];
    var graphicParams = null;
    var checkFunc = function(key) {
        return typeof graphicParams[key] === 'undefined' ||
            graphicParams[key] === null;
    };

    // process every graphic
    this.graphics.forEach(function(dataSet, index) {
        graphicParams = {
            axis:        _t('units.' + this.axisName),
            color:       this.getGraphicColor(index),
            graphicType: this.getGraphicType(index),
            lineType:    this.getLineType(index),
            name:        this.getGraphicName(index + 1),
            visible :    this.getGraphicVisibility(index)
        };

        if (Object.keys(graphicParams).some(checkFunc)) {
            //DEBUG_START
            _e(index, 'graphic with next index failed has invalid draw spec');
            _d(graphicParams);
            //DEBUG_STOP
            return;
        }

        var graphic = this.draw2DGraphic(dataSet, graphicParams, index);

        if (graphic === null) {
            //DEBUG_START
            _e(index, 'failed to draw graphic with next index');
            //DEBUG_STOP
            return;
        }

        graphicParams.graphic = Dispatcher.storeGraphicObject(graphic) - 1;
        graphics.push(graphicParams);
    }, this);

    this.updateStatus(graphics.length > 0);
    return graphics;
};

/**
 * Parses index of the graphic(s) at views
 *
 * @return {Array} array with hashes that describes graphic 'address'
 * @private
 */
Task.prototype.parseViewIndex = function() {
    if (!this.viewIndex) { return []; }

    //DEBUG_START
    if (Dispatcher.isViewIndexAvailable(this.viewIndex) === false) {
        return [];
    }
    //DEBUG_STOP

    var viewIndexes = this.viewIndex.split(/ ?, ?/);
    var result = [];

    for (var ii = 0; ii < viewIndexes.length; ii++) {
        var parts = viewIndexes[ii].split(':');
        var position = Utils.parseNaturalNumber(parts[1]);
        var view = parts[0].match(/\w+/)[0];

        if (isNaN(position) || position < 1) {
            //DEBUG_START
            _e('Current spec has invalid viewIndex');
            //DEBUG_STOP
            continue;
        }

        if (!view) {
            //DEBUG_START
            _e('Current spec has invalid viewIndex');
            //DEBUG_STOP
            continue;
        }

        result.push({
            //DEBUG_START
            'orig': viewIndexes[ii],
            //DEBUG_STOP
            'view': view,
            'index': position - 1
        });
    }

    return result;
};

/**
 * Converts magic numbers and props to values that define graphic look&feel
 *
 * @private
 */
Task.prototype.getLineType = function(ii) {
    var graphicType = (Array.isArray(this.graphicType) ?
        this.graphicType[ii] : this.graphicType) || '';

    if (typeof graphicType !== 'string') {
        //DEBUG_START
        _e(graphicType, 'incorrect graphic type');
        //DEBUG_STOP
        return void(0);
    }

    var result = graphicType.split(':')[1];

    // TODO bars
    switch (result) {
    case 'fill': result = 3; break;
    case 'thin': result = 2; break;
    case 'thick': result = 0; break;
    case 'dots': result = 1; break;
    case void(0): result = this.defaultLineType; break;
    default:
        //DEBUG_START
        _e(graphicSpecs[1], 'unknown line type');
        //DEBUG_STOP
        result = void(0);
    }

    return result;
};

/**
 * Converts magic numbers and props to values that define graphic look&feel
 *
 * @private
 */
Task.prototype.getGraphicType = function(ii) {
    var graphicType = (Array.isArray(this.graphicType) ?
        this.graphicType[ii] : this.graphicType) || '';

    if (typeof graphicType !== 'string') {
        //DEBUG_START
        _e(graphicType, 'incorrect graphic type');
        //DEBUG_STOP
        return void(0);
    }

    var types = ['multicolor', 'sidestep', 'area',  'plain', 'bar'];
    var result = graphicType.split(':')[0] || 'plain';

    if (types.indexOf(result) === -1) {
        //DEBUG_START
        _e(result, 'unknown graphic type');
        //DEBUG_STOP
        result = void(0);
    }

    return result;
};

/**
 * Generates graphic name/title
 *
 * @param {Number} index index of the graphic (graphic is based on dataset)
 * of this task that is currently drawing.
 *
 * @return {String} graphic name
 * @private
 */
Task.prototype.getGraphicName = function(currentIndex) {
    var result = null;

    if (typeof this.graphicName === 'function') {
        var params = [this.specName, currentIndex, this.dataSetsCount];
        result = this.graphicName.apply(null, params);
    } else if (this.graphicName === '&index') {
        result = 'specs.' + this.specName + '.name' + currentIndex;
    } else if (this.graphicName === '&1or2+') {
        result = 'specs.' + this.specName + '.name' +
            (currentIndex === this.dataSetsCount ? '1' : 'X');
    } else if (typeof this.graphicName === 'string') {
        result = 'specs.' + this.graphicName + '.name';
    } else {
        result = 'specs.' + this.specName + '.name';
    }

    return _t(result, currentIndex);
};

/**
 * Calculates color for specific graphic
 *
 * @param {Number} index index of the graphic (graphic is based on dataset)
 * of this task that is currently drawing.
 *
 * @return {Number} graphic color
 * @private
 */
Task.prototype.getGraphicColor = function(index) {
    var graphicColor = null;

    switch (true) {
        /*case colorDef === null:
        case typeof colorDef === 'undefined':
            break;
        case typeof this.graphicColor === 'string':
            // TODO */
        case typeof this.graphicColor === 'number':
            graphicColor = this.graphicColor;
            break;
        case typeof this.graphicColor === 'function':
            graphicColor = this.graphicColor(index, this.dataSetsCount);
            break;
        case Array.isArray(this.graphicColor):
            graphicColor = this.graphicColor[index];
            break;
        /*case this.graphicColor && this.graphicColor.constructor === Object:
            // TODO */
        default:
            //DEBUG_START
            _d('random color was used for graphic');
            //DEBUG_STOP
            graphicColor = Utils.createRandomColor();
    }

    return graphicColor;
};

/**
 * Generates graphic visibility
 *
 * @param {Number} index index of the graphic (graphic is based on dataset)
 * of this task that is currently drawing.
 *
 * @return {Number} visibility
 * @private
 */
Task.prototype.getGraphicVisibility = function(index) {
    // initially graphic is visible
    var result = 1;

    switch (true) {
    case this.hiddenGraphics === '*':
        result = 0;
        break;
    case Array.isArray(this.hiddenGraphics):
        result = this.hiddenGraphics[index] === 0 ? 1 : 0;
        break;
    case typeof this.hiddenGraphics === 'boolean':
        result = this.hiddenGraphics[index] ? 0 : 1;
        break;
    case this.hiddenGraphics === null:
        result = 1;
        break;
        //DEBUG_START
    default:
        _e('invalid visibility token. graphic will be visible');
        result = 1;
        //DEBUG_STOP
    }

    return result;
};

/**
 * Created regular 2d graphic
 *
 * @param {DataSet} specObj hash with data for graphic (dataset)
 * @param {Object} params hash/dics with additional params for graphic
 * @param {Number} [index] zero-base number of the dataset that is processed
 * @return {Object} graphic object that represents real graphic
 * @private
 */
Task.prototype.draw2DGraphic = function(specObj, params, index) {
    //DEBUG_START
    var _1axis = this.defaultKeys[0];
    var _2axis = this.defaultKeys[1];

    if (!specObj.hasOwnProperty(_1axis) || !specObj.hasOwnProperty(_2axis)) {
        _e('specObj does not contain declared keys');
        return null;
    }

    if (!Array.isArray(specObj[_1axis]) || !Array.isArray(specObj[_2axis])) {
        _e('specObj\'s keys are not arrays');
        return null;
    }

    if (!specObj[_1axis].length || !specObj[_2axis].length) {
        _e('some of specObj\'s keys point to empty arrays');
        return null;
    }

    if (specObj[_1axis].length !== specObj[_2axis].length) {
        _e('data length mismatch!');
        return null;
    }
    //DEBUG_STOP

    var graphic = null;

    if (params.graphicType === 'multicolor') {
        graphic = Host.CreateColoredGraphic(
                params.name, params.axis, params.color);
    } else {
        // FIXME color issue: no matter what color to pass here
        graphic = Host.CreateGraphic(params.name, params.axis, 0x000000);
    }

    if (this.setGraphicPoints(specObj, graphic, params) === false) {
        return null;
    }

    if (this.setLimits) {
        var edge_values = this.getLimitPoints(index);
        graphic.SetLimits(edge_values[0], edge_values[1]);
    }

    if (this.setScale) {
        graphic.SetScale(this.scaleValue, this.scaleColor);
    }

    return graphic;
};

/**
 * Sets point to grapic
 *
 * @param {DataSet} specObj hash with data for graphic (dataset)
 * @param {Object} graphic object that represents real graphic
 * @return {Boolean} result of the operation
 * @private
 */
Task.prototype.setGraphicPoints = function(specObj, graphic, params) {
    var _1axis = this.defaultKeys[0];
    var _2axis = this.defaultKeys[1];
    var _1axisData = specObj[_1axis];
    var _2axisData = specObj[_2axis];
    var length = _2axisData.length;
    var isXValueInvalid = null;
    var isYValueInvalid = null;
    var prevYValue = null;

    // https://dev.opera.com/articles/efficient-javascript/?page=3#trycatch
    try {
        for (var jj = 0, x, y; jj < length; jj++) {
            x = _1axisData[jj];
            y = _2axisData[jj];

            if (params.graphicType === 'sidestep' && prevYValue !== null) {
                graphic.AddPoint(x, prevYValue);
            }

            //DEBUG_START
            // since Host.CreateGraphic().Add[Color]Point silently 'eats'
            // such incorrect values as undefined, NaN
            // we forced to do a check to know when we faced
            // with that values before 'Add[Color]Point' actually eats them
            isXValueInvalid = typeof x !== 'number' || !isFinite(x);
            isYValueInvalid = typeof y !== 'number' || !isFinite(y);

            if (isXValueInvalid || isYValueInvalid) {
                _e(jj, 'got a NaN insead of number at');
                _i(x, '`' + _1axis + '` equals to');
                _i(y, '`' + _2axis + '` equals to');
                continue;
            }
            //DEBUG_STOP

            if (params.graphicType === 'multicolor') {
                graphic.AddColorPoint(x, y, specObj.color[jj]);
            } else {
                graphic.AddPoint(x, y);
            }

            prevYValue = _2axisData[jj];

            // TODO check how to do this more flexible
            if (this.drawMarkers) {
                this.drawMarker(_1axisData[jj] * Host.Frequency, '');
            }
        }
    } catch (e) {
        this.addBug({'message': ['core.messages.error1'], 'onetime': true});
    }

    return true;
};

/**
 * Calculates min and max values for all dataSets
 *
 * @private
 */
Task.prototype.findMinMaxValues = function() {
    if (this.setLimits !== true) {
        return false;
    }

    this.minMaxValues = {'local': [], 'global': {}, 'globalIndex': []};

    this.graphics.forEach(function (dataSet) {
        var lMinMax = {};

        Object.keys(dataSet).forEach(function (key) {
            lMinMax[key] = [
                dataSet[key].min(),
                dataSet[key].max()
            ];
        });

        this.minMaxValues.local.push(lMinMax);
    }, this);

    this.defaultKeys.forEach(function(key) {
        var minValues = [];
        var maxValues = [];

        this.minMaxValues.local.forEach(function(dataSet) {
            minValues.push(dataSet[key][0]);
            maxValues.push(dataSet[key][1]);
        });

        this.minMaxValues.global[key] = [
            minValues.min(),
            maxValues.max()
        ];

        this.minMaxValues.globalIndex.push({
            max: {
                index: maxValues.indexOf(maxValues.max()),
                value: maxValues.max()
            },
            min: {
                index: minValues.indexOf(minValues.min()),
                value: minValues.min()
            }
        });
    }, this);
};

/**
 * Returns min and max values among all dataSets
 *
 * @param {String} [key] name of the key which max and min values
 *  should be retrieved
 * @return {Array} array with minimum and maximum values
 */
Task.prototype.getGlobalMinMaxValues = function(key) {
    return this.minMaxValues.global[key];
};

/**
 * Returns max value with dataSet index among all dataSets
 *
 * @param {String} [key] name of the key which max and min values
 *  should be retrieved
 * @return {Object} ...
 */
Task.prototype.getGlobalMaxWithIndexValue = function(key) {
    var index = this.defaultKeys.indexOf(key);
    return this.minMaxValues.globalIndex[index];
};

/**
 * Returns min and max values for specified dataSet
 *
 * @param {Number} [index] zero-based index of dataSet
 * @param {String} [key] name of the key
 * @return {Array} result array with minimum and maximum values
 */
Task.prototype.getLocalMinMaxValues = function(index, key) {
    if (typeof key === 'undefined') {
        return this.minMaxValues.local[index];
    }

    return this.minMaxValues.local[index][key];
};

/**
 * Calculates limits for the graphic based on passed dataset
 *
 * @param {DataSet} dataSet hash with keys and corresponding arrays of values
 * @return {Array} result array with minimum and maximum values
 * @private
 */
Task.prototype.getLimitPoints = function(index) {
    var lMinMax = this.getLocalMinMaxValues(index, this.defaultKeys[1]);
    var gMinMax = this.getGlobalMinMaxValues(this.defaultKeys[1]);
    var filterFunc = function(n) { return n !== null; };

    var userMin = typeof this.minLimit !== 'function' ? this.minLimit :
        this.minLimit(lMinMax[0], lMinMax[1], gMinMax[0], gMinMax[1]);

    var userMax = typeof this.maxLimit !== 'function' ? this.maxLimit :
        this.maxLimit(lMinMax[1], lMinMax[0], gMinMax[1], gMinMax[0]);

    return [
        [userMin, lMinMax[0]].filter(filterFunc)[0],
        [userMax, lMinMax[1]].filter(filterFunc)[0]
    ];
};

/**
 * Draws markers on oscillogram
 *
 * @ignore
 * @experimental
 */
Task.prototype.drawMarker = function(position, markerName) {
    if (this.customMarkers.length === 0) {
        Host.SetMarker(position, markerName || '');
    } else {
        for (var ii = 0; ii < this.customMarkers.length; ii++) {
            if (markerName.indexOf(this.customMarkers[ii]) > -1) {
                Host.SetMarker(position, markerName);
            }
        }
    }
};

/**
 * Adds views props generated by task to {@link Dispatcher#viewsProps}
 * property using {@link Dispatcher#storeViewsProps} method
 *
 * @return {Object} hash with views anth theirs props
 * @private
 */
Task.prototype.sendViewsProps = function() {
    Dispatcher.storeViewsProps(this.viewsProps);
};

/**
 * Adds view that has been confirmed for creation to
 * {@link Dispatcher#viewsProps} property using
 * {@link Dispatcher#storeConfirmedView} method
 *
 * @private
 */
Task.prototype.sendConfirmedView = function() {
    if (this.providedView !== null && this.getTaskStatus()) {
        //DEBUG_START
        _d(this.providedView, 'this spec managed to provide next view');
        //DEBUG_STOP
        Dispatcher.storeConfirmedView(this.providedView);
    }
};

/**
 * Makes task one that provides a view
 *
 * @param {String} viewDef keyword that represents view specs
 * @return {Boolean} result of the operation
 */
Task.prototype.setProvidedView = function(viewDef) {
    //DEBUG_START
    if (typeof viewDef !== 'string') {
        _e('"viewDef" is not a string');
        return false;
    }

    if (viewDef.length === 0) {
        _e('"viewDef" can not be zero length string');
        return false;
    }

    if (viewDef.indexOf(':') < 1) {
        _e('"viewDef" should follow next format "name:number"');
        return false;
    }
    //DEBUG_STOP

    return (this.providedView = viewDef) !== null;
};

/**
 * Get a data from task by its 'datalink'
 *
 * @param {Task} task object
 * @param {String} dataLink See {@link Task#getUnsureTaskData} for details
 * @return {DataSet|Array|Number} requested data
 * @static
 */
Task.getTaskData = function(depObj, dataLink) {
    //DEBUG_START
    if ((depObj instanceof Task) === false) {
        _e('Passed depObj param is not a Task instance object');
        return null;
    }

    if (typeof dataLink !== 'string' || dataLink.length === 0) {
        _e('Passed dataLink params is not a non empty string');
        return null;
    }
    //DEBUG_STOP

    var depSpec = dataLink.split(':');

    // if no dataset(s) was requested, plain task/spec will be returned
    if (depSpec.length === 1) {
        return depObj;
    }

    // process request of all datasets
    if (depSpec[1] === '*') {
        return depObj.getDataSets();
    }

    // get dataset index
    var dsIndex = Utils.parseNaturalNumber(depSpec[1]);

    //DEBUG_START
    if (Number.isInvalid(dsIndex) === true) {
        _e(dsIndex, 'index is not a valid number');
        return null;
    }

    if (depObj.isDataSetExist(dsIndex) === false) {
        _e(dsIndex, 'can\'t find dataset with specified index');
        return null;
    }
    //DEBUG_STOP

    // get dataSet
    var dataSet = depObj.getDataSet(dsIndex);

    //DEBUG_START
    if (depSpec[2] && dataSet.hasOwnProperty(depSpec[2]) === false) {
        _e(depSpec[2], 'can\'t find key within specified dataset');
        return null;
    }
    //DEBUG_STOP

    if (depSpec.length > 3) {
        var ii = Utils.parseIntegerNumber(depSpec[3]);
        return dataSet[depSpec[2]][ii];
    }

    // if dataKey is valid and dataSet has that dataKey
    if (depSpec.length > 2 && depSpec[2]) {
        // return data that is behind dataKey
        return dataSet[depSpec[2]];
    }

    // in default case return dataSet by specified index
    return dataSet;
};

/**
 * Returns first task from passed dependencies that has positive status
 *
 * @param {Array} [deps] An array with instances of Tasks class
 * @return {Task|null} satisfied task
 * @private
 * @ignore
 */
Task.findValidDependency = function(deps) {
    for (var ii = 0, dep; ii < deps.length; ii++) {
        if ((dep = Dispatcher.getValidTaskObject(deps[ii])) !== null) {
            return dep;
        }
    }

    return null;
};
