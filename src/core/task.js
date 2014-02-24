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
 * Returns status of the last processed action for current task
 *
 * @method
 * @return {Boolean} status
 */
Task.prototype.getTaskStatus = function() {
    return this.statusCodes.last();
};

/**
 * Stores status of newly completed action. Also returns it
 *
 * @param  {Boolean} value of the status that is going to be set
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
 * function that ...
 *
 * @return {Boolean} result of the check
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
 * Wrapper function that checks all kind of dependencies for this task
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
 * checks if direct dependencies of the task is resolved
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
 * @method
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {Task} task object
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
 * @method
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {Task} task object
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
 * @method
 * @param {Number} index zero based index of the dependency
 *  in 'dependencies' prop
 * @return {Object} task object
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
 * function that ...
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
 * function that ...
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
 * function that ...
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
 * You **should not** call it directly (this is being done automatically).
 * Define a 'calc_data' prop in hash that is passed to
 * `Dispatcher#registerNewTask` method.
 * Code you see below is a stub
 *
 * @method
 * @return {Boolean} fake status/result of the action
 */
Task.prototype.calc_data = function() {
    //DEBUG_START
    _d('you missed to redefine \'calc_data\' function');
    //DEBUG_STOP
    return true;
};

/**
 * Logs short stats for task's data
 *
 * @private
 */
//DEBUG_START
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
 * function that ...
 *
 * @method joinViewsProps
 * @private
 */
Task.prototype.joinViewsProps = function() {
    this.make_props();

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
            } else {
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
                this.graphicType,
                graphics[jj].color,
                // to set graphic initially invisible we need to pass 1 here
                Number(!graphics[jj].visible)
            ]);
        }
    }

    return this.updateStatus(result);
};

/**
 * Function that should perform a creation of properties for view(s).
 * You **should not** call it directly (this is being done automatically).
 * Define a 'make_props' prop in hash that is passed to
 * `Dispatcher#registerNewTask` method.
 * Code you see below is a stub
 *
 * @method
 * @return {Boolean} fake status/result of the action
 */
Task.prototype.make_props = function() {
    //DEBUG_START
    _d('you missed to redefine \'make_props\' function');
    //DEBUG_STOP
    return true;
};

/**
 * function that ...
 *
 * @method parseViewIndex
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
 * function that ...
 *
 * @method adjustGraphicTypeValue
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
 * function that ...
 *
 * @method drawGraphics
 * @param {Object} graphicObj - value itself
 * @private
 */
Task.prototype.drawGraphics = function() {
    var graphics = [];
    if (!this.getTaskStatus() || !this.viewIndex) {
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

        var visible = this.hiddenGraphics === '*' ? false : true;
        visible = Array.isArray(this.hiddenGraphics) ?
            !Boolean(this.hiddenGraphics[ii]) : visible;

        var graphic = this.draw2DGraphic(dataSet, graphicParams);

        graphics.push({
            'graphic' : graphic,
            'visible' : visible,
            'color'   : graphicParams.color,
            'name'    : graphicParams.name
        });
    }, this);

    this.updateStatus(graphics.length > 0);
    return graphics;
};

/**
 * function that ...
 *
 * @method getGraphicName
 * @param {Object} graphicObj - value itself
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
 * function that ...
 *
 * @method getGraphicColor
 * @param {Object} graphicObj - value itself
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
 * function that ...
 *
 * @method getLimitPoints
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
 * @method draw2DGraphic
 * @param {Object} graphicObj - value itself
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
 * function that ...
 *
 * @method setGraphicPoints
 * @param {Object} setGraphicPoints - value itself
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
 * function that ...
 *
 * @method drawMarker
 * @param {Object} graphicObj - value itself
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
 * function that ...
 *
 * @method getViewsProps
 * @private
 */
Task.prototype.getViewsProps = function() {
    return this.viewsProps;
};

/**
 * function that ...
 *
 * @method getConfirmedView
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
 * @method isDataSetExist
 * @private
 *
 * @param {Number} index zero-based index of the set that is checked.
 * @return {Boolean} result of the action execution
 */
Task.prototype.isDataSetExist = function(index) {
    index = Math.abs(parseInt(index, 10)) || 0;
    return this.graphics[index].constructor === Object;
};

/**
 * helper function that creates data set stub
 *
 * @method createDataSet
 */
Task.prototype.createDataSet = function(forcedKeys) {
    var keys = Array.isArray(forcedKeys) ? forcedKeys : this.defaultKeys;

    return Utils.createDataSetStub(keys);
};

/**
 * Stores data that has been calculated for this task (or particular graphic)
 *
 * @param {Hash} dataSet set of props in hash/dict that represent data
 *      for this task (or particular graphic)
 *
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
 *
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
 * helper function that ...
 *
 * @method createDataSet
 * @private
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
 * Get a data from task by its 'link'
 *
 * @method getTaskData
 * @param {Taks} task object
 * @param {String} data link
 * @return {Object} data object
 */
Task.getTaskData = function(depObj, dataLink) {
    var depSpec = dataLink.split(':');

    // quit if task has not been found
    if (!depObj) {
        return null;
    }

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

