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

    confirmedViews: [],
    graphicsViews: {},
    // hash that holds all properties and theirs values for all views
    viewsProps: {},

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

    if (this.isScriptAllowedToRun() === false) { return false; }

    // deal with all configuration stuff
    Input.createConfiguration(Script.inputs, Script.inputFields);

    //DEBUG_START
    this.logIncomingParams();
    //DEBUG_STOP

    Profiler.start('main');

    this.startProgressBar();
    this.loopThroughRegisteredSpecs();
    this.createGraphicViews();
    this.sortGraphicsByIndexes();
    this.applyPropsToGraphicViews();
    this.printMessages();
    this.stopProgressBar();

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
                    'colors': [0xF05025]
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

    Host.ShowReport();
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
 * @method sortGraphicsByIndexes
 */
Dispatcher.sortGraphicsByIndexes = function() {
    var methods  = ['AddArea', 'AddGraphic', 'AddGraphicEx'];
    var mapFunc  = function(item) { return item.slice(1); };
    var sortFunc = function(a, b) {
        // try to sort by view index
        if (a[0] < b[0]) { return -1; }
        if (a[0] > b[0]) { return  1; }
        // if still same - sort by index in global array
        return a[1] - b[1];
    };

    Object.keys(this.viewsProps).forEach(function(ii) {
        methods.forEach(function(key) {
            if (typeof this.viewsProps[ii][key] === 'undefined') {
                return;
            }

            this.viewsProps[ii][key] =
                this.viewsProps[ii][key].sort(sortFunc).map(mapFunc);
        }, this);
    }, this);

    return true;
};

/**
 * function that ...
 *
 * @method applyPropsToGraphicViews
 */
Dispatcher.applyPropsToGraphicViews = function() {
    //DEBUG_START
    _p('in `applyPropsToGraphicViews`');
    _d('');
    _d(this.viewsProps, 'all props');
    _d('');
    //DEBUG_STOP

    var params = null;
    for (var ii in this.viewsProps) {
        if (!this.viewsProps.hasOwnProperty(ii)) {
            continue;
        }

        if (typeof this.graphicsViews[ii] === 'undefined') {
            //DEBUG_START
            _e(ii, 'missing view');
            //DEBUG_STOP
            continue;
        }

        for (var key in this.viewsProps[ii]) {
            if (this.viewsProps[ii].hasOwnProperty(key)) {
                params = this.viewsProps[ii][key];
                this.applyMethodToView(ii, key, params);
            }
        }

        this.graphicsViews[ii].Update();
    }
};

Dispatcher.applyMethodToView = function(viewIndex, methodName, instancesParams) {
    var methods     = ['AddArea', 'AddGraphic', 'AddGraphicEx'];
    var viewObject  = this.graphicsViews[viewIndex];
    var fix1stParam = function(arg1, methodName, self) {
        return methods.indexOf(methodName) > -1 ?
            self.drownGraphics[arg1] : arg1;
    };

    instancesParams.forEach(function(params) {
        var arg1 = fix1stParam(params[0], methodName, this);

        try {
            switch (params.length) {
            case 1:
                viewObject[methodName](arg1);
                break;
            case 2:
                viewObject[methodName](arg1, params[1]);
                break;
            case 3:
                viewObject[methodName](arg1, params[1], params[2]);
                break;
            case 4:
                viewObject[methodName](arg1, params[1], params[2], params[3]);
                break;
            case 5:
                viewObject[methodName](arg1, params[1], params[2], params[3], params[4]);
                break;
            default:
                //DEBUG_START
                _i('%'.repeat(40));
                _e(params.length, 'Next amount of params is not handled yet');
                _d(params, 'params');
                _d(viewIndex, 'view');
                _d(methodName, 'method');
                //DEBUG_STOP
            }
        } catch (e) {
            //DEBUG_START
            _i('%'.repeat(40));
            _e('Next error occured on processing this item');
            _d(e.message);
            _d(params.length, 'amount of params');
            _d(params, 'params');
            _d(viewIndex, 'view');
            _d(methodName, 'method');
            //DEBUG_STOP
        }
    }, this);
};

Dispatcher.isScriptAllowedToRun = function() {
    if (Validation !== null) {
        if (Validation.isMasterKeyPresent()) {
            if (Validation.checkActivationKey() === false) {
                _rp(_t('core.validation.error1'));
                return false;
            }
        } else {
            Validation.buildKeyFile();
            _rp(_t('core.validation.keys_created'));
            return false;
        }
    } else if (Script.demoMode) {
        _rp(_t('core.demo_mode'));
    }

    return true;
};

Dispatcher.startProgressBar = function() {
    Host.ShowProgress(_t('core.status.start'), this.specs.length + 1);
};

Dispatcher.stopProgressBar = function() {
    Host.HideProgress();
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
    this.viewsProps = Utils.mergeRecursive(this.viewsProps, viewsProps);
};

Dispatcher.storeGraphicObject = function(graphicObj) {
    if (graphicObj) {
        return this.drownGraphics.push(graphicObj);
    } else {
        // TODO what is best value here?
        return null;
    }
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

