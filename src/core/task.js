/**
 * @constructor
 *
 * function that ...
 */
Task = function(params) {
    this.statusCodes = [];
    this.graphics = [];
    this.sourceType = null;
    this.viewsProps = {};

    this.specName = null;
    this.defaultKeys = [];
    this.dataSource = null;
    this.dependencies = [];
    this.softDependencies = [];
  //this.revokedSpecs = [];
  //this.forbiddenChannel = null;

    this.saveData4Compare = false;
    this.loadData4Compare = false;

    this.viewIndex = null;
    this.providedView = null;

    this.axisName = '';
    this.graphicName = null;
    this.graphicType = $GRAPHIC_TYPE$;
    this.defaultGraphicType = $GRAPHIC_TYPE$;
    this.drawMarkers = false;
    this.graphicColor = null;
    this.customMarkers = [];
    this.hiddenGraphics = null;
    this.drawGraphicsAsShelf = false;
    this.graphicIsBackground = false;
    this.multicolorGraphic = false;

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
 * @deprecated
 */
Task.prototype.getFullName = function() {
    //DEBUG_START
    _w('Usage of `getDependencyObject` method is deprecated');
    //DEBUG_STOP
    return this.getTaskName();
};

/**
 * Returns name of the task
 *
 * @return {String} name of the task
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
 * Stores status of newly completed action. Also returns it
 *
 * @param  {Object} value of the status that is going to be set
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
    this.createGetSetPropMethods();
    this.checkDataSource();
  //this.checkForbiddenChannel();
    this.checkDependencies();
    this.processCalcs();
    this.processViewsProps();
    this.joinViewsProps();

    if (this.getTaskStatus() && this.saveData4Compare) {
        Dispatcher.addSpec4Saving(this.getFullName());
    }

    return this.getTaskStatus();
};

/**
 * Checks user's input for dataSource option for this task
 *
 * @return {Boolean} final status of the task
 * @private
 */
Task.prototype.checkDataSource = function() {
    var result = true;

    if (this.dataSource) {
        var rawDataSource = Input.getRawValue(this.dataSource);
        var dataSource = Input.getValue(this.dataSource);

        if (dataSource === null) {
            result = false;
        } else {
            result = false;
            if (dataSource === rawDataSource) {
                result |= this.checkSingleChannel(dataSource);
            }

            if (!result && typeof dataSource === 'string') {
                result |= this.checkChannelsList(dataSource);
            }

            if (!result) {
                result |= this.checkDataSourceFile(rawDataSource);
            }
        }
    }

    return this.updateStatus(result);
};

/**
 * Checks if user's input is a valid single channel number
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.checkSingleChannel = function(dataSource) {
    var result = Utils.checkChannel(dataSource);
    this.sourceType = result === true ? 'channel' : null;
    return result;
};

/**
 * Checks if user's input is a list of valid channel numbers
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.checkChannelsList = function( dataSource) {
    var result = Utils.checkChannelsList(dataSource);
    this.sourceType = result === true ? 'channel' : null;
    return result;
};

/**
 * Checks if user's input is a valid filename that exists
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.checkDataSourceFile = function(rawDataSource) {
    var result = null;

    try {
        var filename = 'C:\\' + rawDataSource + '.json.txt';
        var FSObject = new ActiveXObject('Scripting.FileSystemObject');
        result = FSObject.FileExists(filename);

        if (result) {
            // we count that minimal file size is 70 bytes
            result = FSObject.GetFile(filename).Size > 70;
        }

        this.sourceType = result === true ? 'file' : null;
    } catch(e) {
        //DEBUG_START
        _e('Failed to check source data file due to next error');
        _d(e.message);
        //DEBUG_STOP
        result = false;
    }

    return result;
};

/**
 * Checks if non allowed channel is entered by user for this task
 *
 * @return {Boolean} result of the check
 * @experimental
 * @private
 */
Task.prototype.checkForbiddenChannel = function() {
    if (this.getTaskStatus() === false) {
        return false;
    }

    if (this.forbiddenChannel) {
        var channel = Input.getValue(this.forbiddenChannel);

        if (!isNaN(channel) && channel > 0) {
            return true;
        }
    }

    return false;
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

    result &= this.isDependenciesResolved();
    result &= this.isSoftDependenciesResolved();
    result &= this.isForbiddenDependenciesResolved();
    result  = Boolean(result);

    return this.updateStatus(result);
};

/**
 * Checks if direct dependencies of the task is resolved
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.isDependenciesResolved = function() {
    var depObj, depName, depItem, dsIndex;

    for (var ii = 0; ii < this.dependencies.length; ii++) {
        depItem = this.dependencies[ii];
        if (depItem.charAt(0) === '!') {
            continue;
        }

        depName = depItem.split(':')[0];
        depObj = Dispatcher.getValidTaskObject(depName);

        if (!depObj) {
            //DEBUG_START
            _e(depItem, 'Next dependency was not resolved');
            //DEBUG_STOP
            return false;
        }

        if (depItem.split(':')[1]) {
            dsIndex = parseInt(depItem.split(':')[1], 10);
            if (depObj.isDataSetExist(dsIndex) === false) {
                //DEBUG_START
                _e(depItem, 'cant find dataSet with specified index');
                //DEBUG_STOP
                return false;
            }
        }
    }

    return true;
};

/**
 * checks if specified dependencies of the task is unresolved
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.isForbiddenDependenciesResolved = function() {
    var depName = null;

    for (var ii = 0; ii < this.dependencies.length; ii++) {
        depName = this.dependencies[ii];
        if (depName.charAt(0) !== '!') {
            continue;
        }

        depName = depName.slice(1);
        if (Dispatcher.getValidTaskObject(depName)) {
            //DEBUG_START
            _w(depName, 'Next dependency should not be resolved');
            //DEBUG_STOP
            return false;
        }
    }

    return true;
};

/**
 * checks if any soft dependency of the task is resolved
 *
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.isSoftDependenciesResolved = function() {
    if (this.softDependencies.length === 0) {
        return true;
    }

    for (var ii = 0; ii < this.softDependencies.length; ii++) {
        if (Dispatcher.getValidTaskObject(this.softDependencies[ii])) {
            return true;
        }
    }

    //DEBUG_START
    _w('None soft dependency was resolved');
    //DEBUG_STOP
    return false;
};

/**
 * Returns a dependency task by its index in 'dependencies' array.
 *      Usage of this method is highly unwanted.
 *
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {Task} task object
 * @experimental
 * @private
 */
Task.prototype.getDependencyObject = function(index) {
    //DEBUG_START
    _w('Usage of this method (`getDependencyObject`) is highly unwanted');
    //DEBUG_STOP
    if (index < this.dependencies.length) {
        return Dispatcher.getTaskObject(this.dependencies[index]);
    }

    return null;
};

/**
 * Returns a dependency data by its index in 'dependencies' array
 *
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {Object} value that has been requested
 */
Task.prototype.getDepDataSet = function(index) {
    index = Math.abs(parseInt(index, 10)) || 0;
    // check if index is not out of array limits
    if (index >= this.dependencies.length) {
        return null;
    }

    // dependency string
    var specName = this.dependencies[index].match(/[^:]+(?!:)?/);
    // get dependency task
    var depObj = Dispatcher.getValidTaskObject(specName);

    return Task.getTaskData(depObj, this.dependencies[index]);
};

/**
 * Returns first active soft dependency
 *
 * @return {Task} satisfied task
 * @experimental
 */
Task.prototype.getActiveSoftDependency = function() {
    var depName = null;

    for (var ii = 0; ii < this.softDependencies.length; ii++) {
        depName = this.softDependencies[ii];
        if (Dispatcher.getValidTaskObject(depName)) {
            return Dispatcher.getValidTaskObject(depName);
        }
    }

    return null;
};

/**
 * Returns a dependency task by its index in 'dependencies' array.
 *      Usage of this method is highly unwanted.
 *
 * @param {String} datalink with next format
 *     'TaskName[:DataSetIndex[:DataKey[:Index]]]'
 * @return {Object} value that has been requested
 */
Task.prototype.getUnsureTaskData = function(dataLink) {
    var specName = dataLink.match(/[^:]+(?!:)?/);
    var task = Dispatcher.getValidTaskObject(specName);

    if (task !== null) {
        return Task.getTaskData(task, dataLink);
    }

    return null;
};

/**
 * Produces data/numbers for this task
 *
 * @return {Boolean} status/result of the action
 * @private
 */
Task.prototype.processCalcs = function() {
    var result = false;

    if (this.getTaskStatus() === false) {
        return false;
    }

    // TODO: new save
    if (this.sourceType === 'file' || this.loadData4Compare) {
        result = this.loadGraphicsData();
    } else {
        //DEBUG_START
        _d('processing calcs...');
        //DEBUG_STOP
        result = this.calc_data();

        if (this.graphics.length > 0) {
            result = typeof result === 'undefined' ? true : result;
        } else {
            //DEBUG_START
            _d('this spec does not have data');
            //DEBUG_STOP
            if (typeof result === 'undefined') {
                result = false;
            }
        }

        //DEBUG_START
        _d(result, 'calcs complete');
        //DEBUG_STOP
    }

    //DEBUG_START
    this.logDataStats();
    //DEBUG_STOP
    return this.updateStatus(result);
};

/**
 * Creates filename where data for task might be
 *
 * @return {Boolean} status/result of the action
 * @private
 */
Task.prototype.loadGraphicsData = function() {
    //DEBUG_START
    _d('loading data...');
    //DEBUG_STOP
    // TODO: new save
    if (this.loadData4Compare === false && this.sourceType === 'channel') {
        return false;
    }

    var filename = null;

    if (this.sourceType === 'file') {
        filename = Input.getValue(this.dataSource);
        if (filename) {
            filename = 'C:\\' + filename + '.json.txt';
        } else {
            filename = null;
        }
    } else {
        // TODO
        filename = Input.getValue('loadfile');
        // this will not work if number of files in data folder
        // has been changed during run
        filename = Utils.getDataFolderListing()[filename];
        if (filename) {
            filename = Host.CurPath + 'data\\' + filename + '.json.txt';
        } else {
            filename = null;
        }
    }

    return this.readGraphicsData(filename);
};

/**
 * Reads data for this task from file
 *
 * @return {Boolean} status/result of the action
 * @private
 */
Task.prototype.readGraphicsData = function(filename) {
    var FSObject = new ActiveXObject('Scripting.FileSystemObject');
    var dataKey = this.getFullName();
    var fileHandler = null;
    var result = null;
    var data = null;

    if (!filename || !FSObject.FileExists(filename)) {
        //DEBUG_START
        _d(filename, 'Can not find next file');
        //DEBUG_STOP
        return false;
    }

    //DEBUG_START
    _d(filename, 'Next file will be used to read external data');
    //DEBUG_STOP

    try {
        fileHandler = FSObject.OpenTextFile(filename, 1);
        data = JSON.parse(fileHandler.ReadAll());
        // TODO
        if (typeof data.specs2compare[dataKey] !== 'undefined') {
            this.graphics = data.specs2compare[dataKey];
            result = true;
        } else {
            //DEBUG_START
            _d('No data found for this spec');
            //DEBUG_STOP
            result = false;
        }
        fileHandler.Close();
    } catch(e) {
        //DEBUG_START
        _d('Failed to read data file due to next error');
        _d(e.message);
        //DEBUG_STOP
        result = false;
    }

    fileHandler = null;
    FSObject = null;
    return result;
};

/**
 * Function that should perform a calculation of data.
 * Call of this function is being done automatically.
 * Define a 'calc_data' prop in hash that is passed to
 * `Dispatcher#registerNewTask` method.
 * Code you see below is a stub
 *
 * @return {Boolean} fake status/result of the action
 * @example
 */
Task.prototype.calc_data = function() {
    //DEBUG_START
    _d('you missed to redefine \'calc_data\' function');
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
    this.graphics.forEach(function (dataSet, index) {
        _d('----- ' + index + ' -----');
        Object.keys(dataSet).forEach(function (key) {
            if (dataSet[key].empty()) {
                _d('key `' + key + '` does not have data');
                return false;
            }

            var not_a_num = typeof dataSet[key][0] !== 'number';
            _d(dataSet[key].length, key + '.length');

            if (not_a_num && dataSet[key].length === 1) {
                _d(dataSet[key][0], key + '[0]');
                return false;
            }

            if (not_a_num) {
                _d('key `' + key + '` holds non number items');
                return false;
            }

            var min = dataSet[key].min();
            var max = dataSet[key].max();

            if (Utils.isNumberInvalid(min) || Utils.isNumberInvalid(max)) {
                _e('key `' + key + '` contains invalid item');
                return this.updateStatus(false);
            }

            _d(min, key + '.min()');
            _d(max, key + '.max()');
        }, this);
    }, this);
};
//DEBUG_STOP

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
Task.prototype.addViewsProp = function(views, prop, params) {
    if (!views || typeof views !== 'string') {
        //DEBUG_START
        _d('views param should be a string or an array of strings');
        //DEBUG_STOP
        return false;
    }

    if (Array.isArray(views) === false) {
        views = [views];
        return false;
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
 * {@link Task#prototype#processViewsProps} to state that is acceptable for
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
    var result          = true;
    var indexes         = [];
    var graphics        = this.drawGraphics();
    var viewIndexes     = this.parseViewIndex();
    var sourcesStates   = [
        graphics.empty(),
        viewIndexes.empty(),
        Object.keys(this.viewsProps).empty()
    ];

    result &= !sourcesStates.every(function(b) { return b === true; });
    result &= this.getTaskStatus();
    result =  Boolean(result);

    if (result === false) {
        //DEBUG_START
        _d('no view props will be generated by this task');
        //DEBUG_STOP
        return result;
    }

    // lets add real graphics objects into target array
    graphics.forEach(function(graphicHash) {
        indexes.push(Dispatcher.storeGraphicObject(graphicHash.graphic) - 1);
    });

    //DEBUG_START
    if (typeof JSON !== 'undefined') {
        var msg = 'we prepared graphics with next indexes';
        _d(JSON.stringify(viewIndexes, null, 4), msg);
    }
    //DEBUG_STOP

    // lets loop through
    //      views that should get graphics of this spec
    //      and props that should be changed for these views
    // and create namespece
    for (var ii = 0; ii < viewIndexes.length; ii++) {
        view = viewIndexes[ii].view;

        switch (true) {
        case this.graphicIsBackground:
            prop = 'area';
            break;
        case this.multicolorGraphic:
            prop = 'graphic';
            break;
        default:
            prop = 'graphicex';
        }

        // if we do not have props for this **view**
        // lets create namespace for it
        if (this.viewsProps.hasOwnProperty(view) === false) {
            this.viewsProps[view] = {};
        }

        // if this we do not have **exact prop** for this view
        // lets create namespace for it
        if (this.viewsProps[view].hasOwnProperty(prop) === false) {
            this.viewsProps[view][prop] = [];
        }

        for (var jj = 0; jj < indexes.length; jj++) {
            params = [
                // index of the graphic in view
                viewIndexes[ii].index,
                // index of the graphic obj in global array
                indexes[jj]
            ];

            if (this.graphicIsBackground) {
                params.push(graphics[jj].color);
            } else if (!this.multicolorGraphic) {
                params.push(this.graphicType);
                params.push(graphics[jj].color);
            }

            this.viewsProps[view][prop].push(params);

            // if this is an area or visible graphic -- skip all that is below
            if (prop === 'area' || graphics[jj].visible) {
                continue;
            }

            // if this we do not have **exact prop** for this view
            // lets create namespace for it
            if (this.viewsProps[view].hasOwnProperty('set') === false) {
                this.viewsProps[view].set = [];
            }

            // request making graphic invisible at start
            this.viewsProps[view].set.push([
                graphics[jj].name,
                this.lineType,
                graphics[jj].color,
                graphics[jj].visible
            ]);
        }
    }

    return this.updateStatus(result);
};

/**
 * Function that should perform a creation of properties for view(s).
 * Call of this function is being done automatically.
 * Define a 'make_props' prop in hash that is passed to
 * `Dispatcher#registerNewTask` method.
 * Code you see below is a stub
 *
 * @return {Boolean} fake status/result of the action
 * @example
 */
Task.prototype.make_props = function() {
    //DEBUG_START
    _d('you missed to redefine \'make_props\' function');
    //DEBUG_STOP
    return true;
};

/**
 * Parses index of the graphic(s) at views
 *
 * @private
 */
Task.prototype.parseViewIndex = function() {
    var result = [];
    if (!this.viewIndex) { return result; }
    var viewIndexes = this.viewIndex.split(/ ?, ?/);

    for (var ii = 0; ii < viewIndexes.length; ii++) {
        var parts = viewIndexes[ii].split(':');
        var position = parseInt(parts[1], 10);
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
 * @experimental
 * @private
 */
Task.prototype.adjustGraphicTypeValue = function() {
    if (this.getTaskStatus() === false || isNaN(this.graphicType)) {
        return false;
    }

    if (this.graphicType < 0 || this.graphicType > 9) {
        return false;
    }

    if (this.graphicType === 3) {
        this.graphicIsBackground = true;
        this.graphicType = this.defaultGraphicType;
        return true;
    }

    // multicolor graphic
    if (this.graphicType === 4) {
        this.multicolorGraphic = true;
        this.graphicType = 0;
        return true;
    }

    if (this.graphicType === 8) {
        this.drawGraphicsAsShelf = true;
        // thin lines with dots
        this.graphicType = 2;
        return true;
    }

    if (this.graphicType === 9) {
        this.drawGraphicsAsShelf = true;
        this.graphicType = this.defaultGraphicType;
        return true;
    }

    return false;
};

/**
 * Top-level function that creates graphic(s)
 *
 * @param {Object} graphicObj - value itself
 * @return {Array} set of hashes that describe graphic
 * @private
 */
Task.prototype.drawGraphics = function() {
    var graphics = [];
    if (!this.viewIndex) {
        return graphics;
    }

    // do magic with graphic types
    this.adjustGraphicTypeValue();

    // process every graphic
    this.graphics.forEach(function(dataSet, ii) {
        var graphicParams = {
            axis: _t('units.' + this.axisName),
            name: this.getGraphicName(ii + 1),
            color: this.getGraphicColor(ii)
        };

        var graphic = this.draw2DGraphic(dataSet, graphicParams);

        graphics.push({
            'graphic' : graphic,
            'visible' : this.getGraphicVisibility(ii),
            'color'   : graphicParams.color,
            'name'    : graphicParams.name
        });
    }, this);

    this.updateStatus(graphics.length > 0);
    return graphics;
};

/**
 * Generates graphic name/title
 *
 * @param {Number} index of the graphic in graphics array of this task
 * @return {String} graphic name
 * @private
 */
Task.prototype.getGraphicName = function(currentIndex) {
    var result = null;

    if (typeof this.graphicName === 'function') {
        // TODO: no need to send total index in instance method
        result = this.graphicName(currentIndex, this.graphics.length);
    } else if (typeof this.graphicName === 'string') {
        result = 'specs.' + this.graphicName + '.name';
    } else {
        result = 'specs.' + this.specName + '.name';
    }

    return _t(result, currentIndex);
};

/**
 * Generates graphic color
 *
 * @param {Number} index of the graphic in graphics array of this task
 * @return {String} graphic color
 * @private
 */
Task.prototype.getGraphicColor = function(index) {
    var graphicColor = null;

    if (Array.isArray(this.graphicColor)) {
        graphicColor = this.graphicColor[index];
    } else if (this.graphicColor) {
        graphicColor = this.graphicColor;
    } else {
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
    // to set graphic initially invisible we need to return 1
    var result = 0;

    switch (true) {
    case this.hiddenGraphics === '*':
        result = 1;
        break;
    case Array.isArray(this.hiddenGraphics):
        result = Number(Boolean(this.hiddenGraphics[index]));
        break;
    case typeof this.hiddenGraphics === 'boolean':
        result = Number(this.hiddenGraphics[index]);
        break;
    case this.hiddenGraphics === null:
        result = 0;
        break;
    default:
        //DEBUG_START
        _e('invalid visibility token. graphic will be visible');
        //DEBUG_STOP
        result = 0;
    }

    return result;
};

/**
 * Created regular 2d graphic
 *
 * @param {Hash} specObj - hash with data for graphic (dataset)
 * @param {Hash} params - additional params for graphic
 * @return {Object} graphic - graphic itself
 * @private
 */
Task.prototype.draw2DGraphic = function(specObj, params) {
    var _1axis = this.defaultKeys[0];
    var _2axis = this.defaultKeys[1];

    if (!specObj[_1axis].length || !specObj[_2axis].length) {
        return null;
    }

    //DEBUG_START
    if (specObj[_1axis].length !== specObj[_2axis].length) {
        _e('data length mismatch!');
    }
    //DEBUG_STOP

    var graphic = null;

    if (this.multicolorGraphic !== true) {
        // color issue: no matter what color to pass here
        graphic = Host.CreateGraphic(params.name, params.axis, 0x000000);
    } else {
        graphic = Host.CreateColoredGraphic(params.name, params.axis, params.color);
    }

    if (!this.setGraphicPoints(specObj, graphic)) {
        return null;
    }

    if (this.setLimits) {
        var edge_values = this.getLimitPoints(specObj);
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
 * @param {Hash} specObj - hash with data for graphic (dataset)
 * @param {Hash} params - additional params for graphic
 * @return {Boolean} result of the operation
 * @private
 */
Task.prototype.setGraphicPoints = function(specObj, graphic) {
    var _1axis = this.defaultKeys[0];
    var _2axis = this.defaultKeys[1];
    var prevYValue = null;

    for (var jj = 0; jj < specObj[_2axis].length && Host.CanContinue(); jj++) {
        if (this.drawGraphicsAsShelf && prevYValue !== null) {
            graphic.AddPoint(specObj[_1axis][jj], prevYValue);
        }

        var x = specObj[_1axis][jj];
        var y = specObj[_2axis][jj];
        try {
            if (this.multicolorGraphic === false) {
                graphic.AddPoint(x, y);
            } else {
                graphic.AddColorPoint(x, y, specObj.color[jj]);
            }
        } catch (e) {
            //DEBUG_START
            _e(jj, 'got a NaN insead of number at');
            _i(x, '`' + _1axis + '` equals to');
            _i(y, '`' + _2axis + '` equals to');
            return this.updateStatus(false);
            //DEBUG_STOP

            Dispatcher.addBug('core.error1');
        }

        prevYValue = specObj[_2axis][jj];

        // TODO temporary disable this markers
        // untill we figure out how to proceed them
        if (false && this.drawMarkers) {
            this.drawMarker(specObj.x[jj] * Host.Frequency, specObj.name);
        }
    }

    return true;
};

/**
 * Calculates limits of the graphic
 *
 * @param {Object} graphicObj - value itself
 * @private
 */
Task.prototype.getLimitPoints = function(dataSet) {
    var minVal = dataSet[this.defaultKeys[1]].min();
    var maxVal = dataSet[this.defaultKeys[1]].max();
    var minFunc = typeof this.minLimit === 'function';
    var maxFunc = typeof this.maxLimit === 'function';
    var filterFunc = function(n) { return n !== null; };
    var minValues = [minFunc ? this.minLimit(minVal) : this.minLimit, minVal];
    var maxValues = [maxFunc ? this.maxLimit(maxVal) : this.maxLimit, maxVal];

    return [minValues.filter(filterFunc)[0], maxValues.filter(filterFunc)[0]];
};

/**
 * function that ...
 *
 * @param {Object} graphicObj - value itself
 * @experimental
 * @private
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
 * Returns view props generated by task
 *
 * @return {Object} viewsProps
 * @private
 */
Task.prototype.getViewsProps = function() {
    return this.viewsProps;
};

/**
 * Returns name view that has been confirmed for creation
 *
 * @return {String} providedView
 * @private
 */
Task.prototype.getConfirmedView = function() {
    if (this.providedView && this.getTaskStatus()) {
        //DEBUG_START
        _d(this.providedView, 'this spec managed to provide next view');
        //DEBUG_STOP
        return this.providedView;
    }

    return null;
};

/**
 * Checks if dataSet with specified index exists within task
 *
 * @param {Number} index zero-based index of the set that is checked.
 * @return {Boolean} result of the check
 * @private
 */
Task.prototype.isDataSetExist = function(index) {
    index = Math.abs(parseInt(index, 10)) || 0;
    return this.graphics[index].constructor === Object;
};

/**
 * creates data set hash with default or passed keys
 *
 * @param {Array} forcedKeys - array of keys
 *      that should be present in resulted hash
 * @return {Hash} result
 */
Task.prototype.createDataSet = function(forcedKeys) {
    var keys = Array.isArray(forcedKeys) ? forcedKeys : this.defaultKeys;

    return Utils.createDataSetStub(keys);
};

/**
 * Stores data that has been calculated for this task (or particular graphic)
 *
 * @param {Hash} dataSet set of props in hash/dict
 * @return {Boolean} result of the action execution
 */
Task.prototype.addDataSet = function(dataSet) {
    // check if dataSet is hash
    if (dataSet.constructor === Object) {
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
 * @param {Number} index zero-based index of the set that should be returned.
 *      Negative index is also accepted
 * @param {String} key name of key that should be retrieved. Optional
 *
 * @return {Object} result of the action execution
 */
Task.prototype.getDataSet = function(index, key) {
    if (typeof index === 'string') {
        key = index;
        index = 0;
    }

    var start = parseInt(index, 10) || 0;
    var sliceParams = start < 0 ? [start] : [start, start + 1];
    var dataSet = Array.prototype.slice.apply(this.graphics, sliceParams)[0];

    if (dataSet && key && dataSet.hasOwnProperty(key)) {
        return dataSet[key];
    }

    return dataSet || null;
};

/**
 * Returns all dataSet of this task
 *
 * @return {Array} result of the action execution
 */
Task.prototype.getDataSets = function() {
    return this.graphics;
};

/**
 * Creates helper methods for adding/getting values from datasets
 *
 * @protected
 */
Task.prototype.createGetSetPropMethods = function() {
    var addValueFunc = function(self, key) {
        return function(number, dataSetIndex) {
            dataSetIndex = Math.abs(parseInt(dataSetIndex, 10)) || 0;

            if (typeof self.graphics[dataSetIndex] === 'undefined') {
                self.graphics[dataSetIndex] = {};
            }

            if (typeof self.graphics[dataSetIndex][key] === 'undefined') {
                self.graphics[dataSetIndex][key] = [];
            }

            self.graphics[dataSetIndex][key].push(number);
        };
    };

    var getValueFunc = function(self, key) {
        return function(index, dataSetIndex) {
            index = Math.abs(parseInt(index, 10)) || 0;
            dataSetIndex = Math.abs(parseInt(dataSetIndex, 10)) || 0;

            if (dataSetIndex < self.graphics.length) {
                return self.graphics[dataSetIndex][key][index];
            }

            return []._undefined;
        };
    };

    if (this.defaultKeys.empty()) {
        this.defaultKeys = Script.defaultKeys;
    }

    this.defaultKeys.forEach(function(prop) {
        this['add' + prop.capitalize()] = addValueFunc(this, prop);
        this['get' + prop.capitalize()] = getValueFunc(this, prop);
    }, this);
};

/**
 * Get a data from task by its 'datalink'
 *
 * @param {Task} task object
 * @param {String} data link
 * @return {Object} requested data
 * @static
 */
Task.getTaskData = function(depObj, dataLink) {
    // quit if task has not been found
    if ((depObj instanceof Task) === false) {
        //DEBUG_START
        _e('Passed depObj params is not a Task instance object');
        //DEBUG_STOP
        return null;
    }

    if (typeof dataLink !== 'string' || dataLink.length === 0) {
        //DEBUG_START
        _e('Passed dataLink params is not a non empty string');
        //DEBUG_STOP
        return null;
    }

    var depSpec = dataLink.split(':');

    // get dataSetIndex
    var dsIndex = parseInt((depSpec[1] || '0'), 10);

    // quit if dataSet has not been found
    if (depObj.isDataSetExist(dsIndex) === false) {
        return null;
    }

    // process request of all datasets
    if (depSpec[1] === '*') {
        return depObj.getDataSets();
    }

    // get dataSet
    var dataSet = depObj.getDataSet(dsIndex);
    var dataKey = depSpec[2];

    // if dataKey is valid and dataSet has that dataKey
    if (dataKey && dataSet.hasOwnProperty(dataKey)) {
        // if index exists
        if (depSpec[3] !== undefined) {
            // parse it and return that item
            var ii = Math.abs(parseInt(depSpec[3], 10)) || 0;
            return dataSet[dataKey][ii];
        }

        // if index does not exist, return data that is behind dataKey
        return dataSet[dataKey];
    }

    // in default case return dataSet by specified index
    return dataSet;
};

