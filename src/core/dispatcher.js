/**
 * function that ...
 *
 * @method init
 */
Dispatcher = {
    runTimestamp: new Date(),
    //DEBUG_START
    maxSpecNameLength: 0,
    //DEBUG_STOP

    revokedGraphics: [],
    drownGraphics: [],

    graphicsViewsProps: {},
    confirmedViews: [],
    graphicsViews: {},

    messageTypes: [],

    tasksHash: {},
    specs: []
};

/**
 * function that ...
 *
 * @method process
 */
Dispatcher.registerNewTask = function(taskDefObj) {
    if (!taskDefObj) {
        //DEBUG_START
        _e('can not register empty graphic specs object!');
        //DEBUG_STOP
        return;
    }

    var taskObj = new Task(taskDefObj);
    var graphicFullName = taskObj.getFullName();

    if (!graphicFullName) {
        //DEBUG_START
        _e('passed spec misses name!');
        //DEBUG_STOP
        return;
    }

    if (graphicFullName in this.tasksHash) {
        //DEBUG_START
        _e(graphicFullName, 'spec name duplication');
        //DEBUG_STOP
        return;
    }

    //DEBUG_START
    if (this.maxSpecNameLength < graphicFullName.length) {
        this.maxSpecNameLength = graphicFullName.length;
    }
    //DEBUG_STOP

    this.specs.push(taskObj);
    this.tasksHash[graphicFullName] = taskObj;

    taskDefObj = null;
    taskObj = null;

    //DEBUG_START
    _d(graphicFullName, 'next graphic has been successfully registered');
    //DEBUG_STOP
};

/**
 * function that ...
 *
 * @method init
 */
Dispatcher.init = function(params) {
    if (typeof params !== 'object') {
        return false;
    }

    this.createMessageInfractructure(params.messageTypes);

};

/**
 * function that ...
 *
 * @method process
 */
Dispatcher.process = function() {
    //DEBUG_START
    Logger.init();
    //DEBUG_STOP

    // announce version, build time, run time
    this.announce({
        version:    Script.version,
        buildID:    Script.buildID,
        buildTime:  Script.buildTimestamp,
        scriptName: Script.name
    });

    if (Validation !== null) {
        if (Validation.isMasterKeyPresent()) {
            if (Validation.checkActivationKey() === false) {
                _rp(_t('core.validation.error1'));
                return;
            }
        } else {
            Validation.buildKeyFile();
            _rp(_t('core.validation.keys_created'));
            return;
        }
    } else if (Script.demoMode) {
        _rp(_t('core.demo_mode'));
    }

    // deal with all configuration stuff
    Input.createConfiguration(Script.inputs, Script.inputFields);

    //DEBUG_START
    this.logIncomingParams();
    //DEBUG_STOP

    // lets start counting execution time
    Profiler.start('main');

    Host.ShowProgress(_t('core.status.start'), this.specs.length);

    this.loopThroughRegisteredSpecs();
    this.createGraphicViews();
    this.processGraphicsViewProps();
    this.printMessages();

    Host.ShowReport();
    Host.HideProgress();

    Profiler.stop('main');
    _rp(_t('report.done', Profiler.get_HRF_time('main')));

    //DEBUG_START
    Logger.close();
    //DEBUG_STOP
};

/**
 * function that ...
 *
 * @method announce
 */
Dispatcher.announce = function(params) {
    if (typeof params !== 'object') {
        //DEBUG_START
        _d('no version data has been passed');
        //DEBUG_STOP
        return false;
    }

    var message = null;
    var fixedbuildTime = new Date(params.buildTime);
    // Ant's tstamp task returns month that starts from 1
    // since JavaScript treats month as zero-based number
    // we have to 'go' one month back
    // TODO possbily this work buggy with dates > 27th
    fixedbuildTime.setMonth(params.buildTime.getMonth() - 1);

    if (params.version.indexOf('\x56\x45\x52\x53\x49\x4F\x4E') < 0) {
        message = _t('report.version.rel', params.scriptName, params.version);
    } else if (params.buildID.indexOf('\x42\x55\x49\x4c\x44\x5f\x49\x44') < 0) {
        message = _t('report.version.vcs_dev', params.scriptName,
                params.buildID, fixedbuildTime.toLocaleString());
    } else {
        message = _t('report.version.dev', params.scriptName,
                fixedbuildTime.toLocaleString());
    }

    _rp(message);
    //DEBUG_START
    _rp(_t('report.date', this.runTimestamp.toLocaleString()));
    //DEBUG_STOP
};

/**
 * function that ...
 *
 * log processed and optionally loaded files, entered data
 */
//DEBUG_START
Dispatcher.logIncomingParams = function() {
    _d('');
    _d(Host.CurFileName, 'current file');
    _d(Host.Frequency, 'frequency');
    _d(Host.NumberOfSamples, 'samples');
    _d(Host.NumberOfSamples / Host.Frequency, 'duration');

    for (var ii = 0, input; ii < Input.createdInputs.length; ii++) {
        input = Input.createdInputs[ii];
        _d(Input.getValue(input), input);
    }

    _d('');
};
//DEBUG_STOP

/**
 * function that ...
 *
 * @method loop
 */
Dispatcher.loopThroughRegisteredSpecs = function() {
    //DEBUG_START
    _rl('');
    var pad_len = Math.ceil(this.maxSpecNameLength * 1.4);
    var len     = this.specs.length.toString();
    //DEBUG_STOP

    for (var ii = 0; ii < this.specs.length; ii++) {
        Host.SetStatusText(_t('core.status.message', ii));

        var specObj = this.specs[ii];
        //DEBUG_START
        var specName = specObj.getFullName();
        Profiler.start(specName);
        var outputStr = ['>'.repeat(15), ' Processing next '];
        outputStr.push('(', (ii + 1).toString().lpad(' ', len.length), '/');
        outputStr.push(len, ') spec: ', specName.rpad(' ', pad_len));
        _rh(outputStr.join(''));
        //DEBUG_STOP

        specObj.process();
        this.storeViewsProps(specObj.getViewsProps());
        this.confirmedViews.push(specObj.getConfirmedView());

        //DEBUG_START
        _rl(specObj.getTaskStatus() ? '+' : '-');
        _d('Processing finished! Passed (ms) ' + Profiler.stop(specName));
        //DEBUG_STOP

        Host.SetProgress(ii);
    }
};

/**
 * function that ...
 *
 * @method init
 */
Dispatcher.createMessageInfractructure = function(messages) {
    this.messageTypes = messages && messages.constructor === Object ?
        messages : {
            'bug': {
                'headerControlChars': {
                    'colors': [0xFFFFFF, 0xFF0000]
                }
            },
            'error': {
                'headerControlChars': {
                    'colors': [@PRINT_MISTAKES@]
                }
            },
            'hint': {
                'headerControlChars': {
                    'colors': [0x0F8052]
                }
            },
            'message': {
                'skipHeader': true
            }
        };

    var addMessageFunc = function(item, self) {
        return function(message) {
            var msgObj = Utils.convertReportMessage2Obj(message);
            if (msgObj) {
                self.messageTypes[item].messages.push(msgObj);
            }
        };
    };

    for (var item in this.messageTypes) {
        if (this.messageTypes.hasOwnProperty(item)) {
            this.messageTypes[item].messages = [];
            var addMethodName = 'add' + item.capitalize();
            this[addMethodName] = addMessageFunc(item, this);
        }
    }
};

/**
 * function that ...
 *
 * @method printMessages
 */
Dispatcher.printMessages = function() {
    var printMessageFunc = function(item) {
        _rl(_t.apply(null, item.message), item.controlChars);
    };

    for (var type in this.messageTypes) {
        if (this.messageTypes.hasOwnProperty(type)) {
            if (this.messageTypes[type].messages.length === 0) {
                continue;
            }

            if ((this.messageTypes[type].skipHeader === true) === false) {
                _rp(_t('report.messages.' + type),
                        this.messageTypes[type].headerControlChars);
            }

            this.messageTypes[type].messages.forEach(printMessageFunc);
            _rl('');
        }
    }
};

/**
 * function that ...
 *
 * @method createGraphicViews
 */
Dispatcher.createGraphicViews = function() {
    //DEBUG_START
    _p('in `createGraphicViews`');
    //DEBUG_STOP

    this.confirmedViews
        .filter(function(view) { return view; })
        .map(function(view) { return view.split(':'); })
        .sort(function(a, b) { return a[1] - b[1]; })
        .forEach(function(view) {
            if (typeof this.graphicsViews[view[0]] === 'undefined') {
                //DEBUG_START
                _d(view[0], 'Creating next view');
                //DEBUG_STOP
                this.graphicsViews[view[0]] =
                    Host.CreateGraphicView(_t('views.' + view[0] + '.name'));
            //DEBUG_START
            } else {
                _e(view[0], 'Next view has been already created');
            //DEBUG_STOP
            }
        }, this);

    return true;
};

/**
 * function that ...
 *
 * @method processGraphicsViewProps
 */
Dispatcher.processGraphicsViewProps = function() {
    //DEBUG_START
    _p('in `processGraphicsViewProps`');
    _d('');
    _d(this.graphicsViewsProps, 'all props');
    _d('');
    //DEBUG_STOP

    var params = null;
    for (var ii in this.graphicsViewsProps) {
        if (!this.graphicsViewsProps.hasOwnProperty(ii)) {
            continue;
        }

        if (typeof this.graphicsViews[ii] === 'undefined') {
            //DEBUG_START
            _e(ii, 'missing view');
            //DEBUG_STOP
            continue;
        }

        //DEBUG_START
        _d(ii, 'setting props for next view');
        //DEBUG_STOP

        for (var key in this.graphicsViewsProps[ii]) {
            if (!this.graphicsViewsProps[ii].hasOwnProperty(key)) {
                continue;
            }

            try {
                // would be nice to use apply here but seems its not possible
                switch (key) {
                case 'area':
                    params = this.graphicsViewsProps[ii][key];
                    this.addAreasToView(ii, params);
                    break;
                case 'description':
                    params = this.graphicsViewsProps[ii][key];
                    this.addDescriptionToView(ii, params);
                    break;
                case 'comment':
                    params = this.graphicsViewsProps[ii][key];
                    this.addCommentToView(ii, params);
                    break;
                case 'graphic':
                    params = this.graphicsViewsProps[ii][key];
                    this.appendGraphic2Views(ii, params);
                    break;
                case 'graphicEx':
                    params = this.graphicsViewsProps[ii][key];
                    this.appendGraphicEx2Views(ii, params);
                    break;
                case 'limits':
                    params = this.graphicsViewsProps[ii][key];
                    this.addLimitsToView(ii, params);
                    break;
                case 'notation':
                    params = this.graphicsViewsProps[ii][key];
                    this.addNotationToView(ii, params);
                    break;
                case 'scale':
                    params = this.graphicsViewsProps[ii][key];
                    this.addScaleToView(ii, params);
                    break;
                case 'set':
                    params = this.graphicsViewsProps[ii][key];
                    this.setGraphicOptions(ii, params);
                    break;
                case 'zoom':
                    params = this.graphicsViewsProps[ii][key];
                    this.zoomGraphicInView(ii, params);
                    break;
                default:
                    //DEBUG_START
                    _e(key, 'Handler for next view method is not implemented');
                    //DEBUG_STOP
                    continue;
                }
            } catch (e) {
                //DEBUG_START
                _e(key, 'Next error occured on processing this key');
                _d(e.message);
                //DEBUG_STOP
            }
        }

        this.graphicsViews[ii].Update();
    }
};

/**
 * function that ...
 *
 * @method addAreasToView
 */
Dispatcher.addAreasToView = function(view_index, paramsArray) {
    for (var ii = 0, area; ii < paramsArray.length; ii++) {
        area = this.drownGraphics[paramsArray[ii][0]];
        this.graphicsViews[view_index].AddArea(area, paramsArray[ii][1]);
    }
};

/**
 * function that ...
 *
 * @method addDescriptionToView
 */
Dispatcher.addDescriptionToView = function(view_index, params) {
    // TODO
    this.graphicsViews[view_index].SetDescription(params.join('. '));
};

/**
 * function that ...
 *
 * @method addCommentToView
 */
Dispatcher.addCommentToView = function(view_index, paramsArray) {
    for (var ii = 0; ii < paramsArray.length; ii++) {
        var params = paramsArray[ii];
        this.graphicsViews[view_index].AddComment(
            params.text,
            params.type,
            params.graphicName,
            params.x,
            params.y,
            params.command
        );
    }
};

/**
 * function that ...
 *
 * @method appendGraphic2Views
 */
Dispatcher.appendGraphic2Views = function(view_index, paramsArray) {
    var graphic = null;
    var graphicOpts = null;
    var viewObject = this.graphicsViews[view_index];

    paramsArray = paramsArray.sort(function(a, b){
        // try to sort by view index
        if (a[1] < b[1]) { return -1; }
        if (a[1] > b[1]) { return 1; }
        // if still same - sort by index in global array
        return a[0] - b[0];
    });

    for (var ii = 0; ii < paramsArray.length; ii++) {
        graphicOpts = paramsArray[ii];
        graphic = this.drownGraphics[graphicOpts[0]];
        viewObject.AddGraphic(graphic);
    }
};

/**
 * function that ...
 *
 * @method appendGraphicEx2Views
 */
Dispatcher.appendGraphicEx2Views = function(view_index, paramsArray) {
    var graphic = null;
    var graphicOpts = null;
    var viewObject = this.graphicsViews[view_index];

    paramsArray = paramsArray.sort(function(a, b){
        // try to sort by view index
        if (a[1] < b[1]) { return -1; }
        if (a[1] > b[1]) { return 1; }
        // if still same - sort by index in global array
        return a[0] - b[0];
    });

    for (var ii = 0; ii < paramsArray.length; ii++) {
        graphicOpts = paramsArray[ii];
        graphic = this.drownGraphics[graphicOpts[0]];
        viewObject.AddGraphicEx(graphic, graphicOpts[2], graphicOpts[3]);
    }
};

/**
 * function that ...
 *
 * @method addLimitsToView
 */
Dispatcher.addLimitsToView = function(view_index, params) {
    this.graphicsViews[view_index].SetLimits(params[0], params[1]);
};

/**
 * function that ...
 *
 * @method addNotationToView
 */
Dispatcher.addNotationToView = function(view_index, params) {
    // TODO
    this.graphicsViews[view_index].AddNotation(params[0], params[1]);
};

/**
 * function that ...
 *
 * @method addScaleToView
 */
Dispatcher.addScaleToView = function(view_index, params) {
    this.graphicsViews[view_index].SetScale(params[0], params[1]);
};

/**
 * function that ...
 *
 * @method setGraphicOptions
 */
Dispatcher.setGraphicOptions = function(view_index, paramsArray) {
    var viewObject = this.graphicsViews[view_index];

    for (var ii = 0; ii < paramsArray.length; ii++) {
        var opts = paramsArray[ii];
        // setting next opts: name,    type,    color,   visibility
        viewObject.SetGraphic(opts[0], opts[1], opts[2], opts[3]);
    }
};

/**
 * function that ...
 *
 * @method zoomGraphicInView
 */
Dispatcher.zoomGraphicInView = function(view_index, params) {
    var vMinX = params[0];
    var vMaxX = params[1];
    var vMinY = params[2];
    var vMaxY = params[3];
    var vGraphic = params[4];
    this.graphicsViews[view_index].ZoomToValues(
            vMinX, vMaxX, vMinY, vMaxY, vGraphic);
};

/**
 * function that ...
 *
 * @method getTaskObject
 */
Dispatcher.getTaskObject = function(name) {
    if (!name) {
        //DEBUG_START
        _e(name, 'attemp to access spec by invalid name');
        //DEBUG_STOP
        return null;
    }

    return this.tasksHash[name];
};

/**
 * function that ...
 *
 * @method getValidTaskObject
 */
Dispatcher.getValidTaskObject = function(name) {
    var taskObj = this.getTaskObject(name);

    if (taskObj && taskObj.getTaskStatus()) {
        return taskObj;
    } else {
        return null;
    }
};

/**
 * function that ...
 *
 * @method storeViewsProps
 */
Dispatcher.storeViewsProps = function(viewsProps) {
    this.graphicsViewsProps =
        Utils.mergeRecursive(this.graphicsViewsProps, viewsProps);
};

/**
 * function that ...
 *
 * @method addSpec4Saving
 */
Dispatcher.addSpec4Saving = function(specName2Save) {
    if (!specName2Save) {
        return false;
    }

    var specName = 'specs2compare';
    this.getTaskObject(specName).dataY.push(specName2Save);
};

