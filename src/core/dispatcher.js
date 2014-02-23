/**
 * function that ...
 *
 * @method init
 */
Dispatcher = {
    sortableProps: ['area', 'graphic', 'graphicex'],

    runTimestamp: new Date(),

    revokedGraphics: [],
    drownGraphics: [],

    confirmedViews: [],
    graphicsViews: {},
    // hash that holds all properties and theirs values for all views
    viewsProps: {},

    messageTypes: [],
    messagePrintProps: {
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
    },

    tasksHash: {}
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

    this.announce();
    Input.createConfiguration(Script.inputs, Script.inputFields);
    //DEBUG_START
    this.logIncomingParams();
    //DEBUG_STOP
    this.startProgressBar();

    if (isScriptAllowedToRun()) {
        Profiler.start('main');
        this.loopThroughRegisteredSpecs();
        this.createGraphicViews();
        this.sortGraphicsByIndexes();
        this.applyPropsToGraphicViews();
    }

    this.printMessages();
    this.stopProgressBar();
    Profiler.stop('main');
    _rp(_t('report.done', Profiler.get_HRF_time('main')));

    //DEBUG_START
    Logger.close();
    //DEBUG_STOP
};

/**
 * function that announces version, build time, run time
 *
 * @method announce
 */
Dispatcher.announce = function() {
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
    var specs  = Object.keys(this.tasksHash);
    var sortFn = function(a, b) { return a.length - b.length; };
    var padLen = Math.ceil(specs.sort(sortFn).last().length * 1.4);
    var len    = specs.length.toString();
    _rl('');
    //DEBUG_STOP

    Object.keys(this.tasksHash).forEach(function(specName, ii) {
        Host.SetStatusText(_t('core.status.message', ii));

        var specObj = this.tasksHash[specName];
        //DEBUG_START
        Profiler.start(specName);
        var outputStr = ['>'.repeat(15), ' Processing next '];
        outputStr.push('(', (ii + 1).toString().lpad(' ', len.length), '/');
        outputStr.push(len, ') spec: ', specName.rpad(' ', padLen));
        _d('\n'.repeat(4));
        _rw(outputStr.join(''));
        //DEBUG_STOP

        specObj.process();
        this.storeViewsProps(specObj.getViewsProps());
        this.storeConfirmedView(specObj.getConfirmedView());

        //DEBUG_START
        _rl(specObj.getTaskStatus() ? '+' : '-');
        _i('Processing finished! Passed (ms) ' + Profiler.stop(specName));
        //DEBUG_STOP

        Host.SetProgress(ii);
    }, this);
};

/**
 * function that ...
 *
 * @method init
 */
Dispatcher.createMessageInfractructure = function(messages) {
    this.messageTypes = messages && messages.constructor === Object ?
        messages : this.messagePrintProps;

    var addMessageFunc = function(item, self) {
        return function(message) {
            if (typeof message === 'string') {
                message = [message];
            }

            if (Array.isArray(message)) {
                message = {'message': message};
            }

            if (!message || message.constructor !== Object) {
                //DEBUG_START
                _e(message, 'addMessageFunc got invalid value');
                //DEBUG_STOP
                return null;
            } else {
                self.messageTypes[item].messages.push(message);
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
    var viewIndexes = [];
    //DEBUG_STOP

    this.confirmedViews
        .map(function(view) { return view.split(':'); })
        .sort(function(a, b) { return a[1] - b[1]; })
        .forEach(function(view) {
            //DEBUG_START
            _d(view, 'Processing next view');
            if (viewIndexes.indexOf(view[1]) > -1) {
                _e('Duplication of index');
                return;
            }

            if (this.graphicsViews.hasOwnProperty([view[0]])) {
                _e('Next view has been already created');
                return;
            }

            viewIndexes.push(view[1]);
            //DEBUG_STOP
            var title = _t('views.' + view[0] + '.name');
            this.graphicsViews[view[0]] = Host.CreateGraphicView(title);
        }, this);

    return true;
};

/**
 * function that ...
 *
 * @method sortGraphicsByIndexes
 */
Dispatcher.sortGraphicsByIndexes = function() {
    var mapFunc  = function(item) { return item.slice(1); };
    var sortFunc = function(a, b) {
        // try to sort by view index
        if (a[0] < b[0]) { return -1; }
        if (a[0] > b[0]) { return  1; }
        // if still same - sort by index in global array
        return a[1] - b[1];
    };

    Object.keys(this.viewsProps).forEach(function(ii) {
        this.sortableProps.forEach(function(key) {
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

    Object.keys(this.graphicsViews).forEach(function(view) {
        Object.keys(this.viewsProps[view]).forEach(function(key) {
            this.applyMethodToView(view, key, this.viewsProps[view][key]);
        }, this);

        this.graphicsViews[view].Update();
    }, this);
};

Dispatcher.applyMethodToView = function(view, key, instancesParams) {
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
    var viewObject  = this.graphicsViews[view];

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
        var arg1 = this.sortableProps.indexOf(key) > -1 ?
            this.drownGraphics[args[0]] : args[0];

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
    }, this);
};

Dispatcher.startProgressBar = function() {
    var taskTotal = Object.keys(this.tasksHash).length + 1;
    Host.ShowProgress(_t('core.status.start'), taskTotal);
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

Dispatcher.storeConfirmedView = function(view) {
    if (view) {
        this.confirmedViews.push(view);
    }
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

