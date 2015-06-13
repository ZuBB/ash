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
     * @property {Array} SORTABLE_PROPS = ['area', 'graphic', 'graphicex']
     * @private
     *
     * List of props that need to be handled in special way.
     */
    var SORTABLE_PROPS = ['area', 'graphic', 'graphicex'];

    //DEBUG_START
    // An array of viewIndexes from all tasks
    var bookedViewIndexes = [];
    //DEBUG_STOP

    /**
     * @property {Array} confirmedViews = []
     * @private
     *
     * An array that holds names of views that has been confirmed to be drown
     */
    var confirmedViews = [];

    /**
     * @property {Array} drownGraphics = []
     * @private
     *
     * An array that holds real graphic objects
     */
    var drownGraphics = [];

    /**
     * @property {{name: Object}} graphicsViews = {}
     * @private
     *
     * A dictionary that holds key/value pairs related to real graphic views
     * Each `key` is a internal name of view.
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
     * Each `key` is a internal name of view.
     * Each `value` paired to corresponding key is a dictionary with props
     * that should be applied to it
     */
    var viewsProps = {};

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

            arg1 = SORTABLE_PROPS.indexOf(key) < 0 ?
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
                    //DEBUG_START
                } else {
                    var msg = 'This amount of params is not handled yet';
                    dumpInfoFunc(msg, args);
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

                if (graphicsViews.hasOwnProperty(view[0])) {
                    _e(view, 'Next view has been already created');
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

    //DEBUG_START
    /**
     * Checks if viewIndex of the current task has not been announced
     * for further usage
     *
     * **NOTE**: This method is stripped from production code
     *
     * @param {String} viewIndex A string representation of viewIndex
     * @return {Boolean} result of check
     */
    this.isViewIndexAvailable = function(viewIndex) {
        if (bookedViewIndexes.indexOf(viewIndex) > -1) {
            _e(viewIndex, 'Next viewIndex is already booked:');
            return false;
        }

        bookedViewIndexes.push(viewIndex);
        return true;
    };
    //DEBUG_STOP

    /**
     * Sort all kind of graphics to get order they were requested to be
     * appeared in views they were addressed
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
            SORTABLE_PROPS.forEach(function(key) {
                if (Array.isArray(viewsProps[ii][key])) {
                    viewsProps[ii][key] =
                        viewsProps[ii][key].sort(sortFunc).map(mapFunc);
                }
            });
        });

        return true;
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
     */
    this.storeConfirmedView = function(view) {
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
    this.storeGraphicObject = function(graphicObj) {
        if (graphicObj) {
            return drownGraphics.push(graphicObj);
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
    this.storeViewsProps = function(newViewsProps) {
        viewsProps = Utils.mergeRecursive(viewsProps, newViewsProps);
    };

    /**
     * Invokes a set of methods that are responsible for dealing with
     * graphics stuff after all tasks have been completed.
     * This method is just a wrapper on others
     */
    this.processGraphicMethods = function() {
        createGraphicViews();
        sortGraphicsByIndexes();
        applyPropsToGraphicViews();
    };

    // schedule method in parenthes to be run
    this.schedulePostProcessMethod({
        'index':  20,
        'method': 'processGraphicMethods'
    });

    return this;
}).apply(Dispatcher);

