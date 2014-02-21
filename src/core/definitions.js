// global objects
var Dispatcher = null;
var Task       = null;
var Input      = null;
//DEBUG_START
var Logger     = null;
//DEBUG_STOP
var Reporter   = null;
var Profiler   = null;
var Utils      = {};
var MathHelper = {};
var AHF = {};
var isScriptAllowedToRun = function() { return true; };

// i18n
var _t = null;

//DEBUG_START
// logger stuff
var _d = null;
var _i = null;
var _p = null;
var _w = null;
var _e = null;
var _f = null;
//DEBUG_STOP

// reporter stuff
var _rw = null;
var _rl = null;
var _rp = null;

// Namespace for constants.
var CONSTS = {};

// Namespace for props of script
var Script = {
    dispatcherOpts: {},
    buildTimestamp: new Date("TIMESTAMP"),
    defaultKeys:    ['x', 'y'],
    demoMode:       $DEMO_MODE$,
    buildID:        '$BUILD_ID$',
    version:        '$VERSION$',
    name:           '$SCRIPT$'
};

