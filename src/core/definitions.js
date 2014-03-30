// global objects
var Dispatcher = null;
var Task       = null;
var Input      = null;
var IO         = null;
var Reporter   = null;
var Profiler   = null;
var Utils      = {};
var MathHelper = {};
var AHF = {};
var isScriptAllowedToRun = function() { return true; };

// i18n
var _t = null;

//DEBUG_START
var Logger     = null;
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

/**
 * @class
 *
 * Script is a namespace that holds options for setting up different aspects
 * of {@link Task}, {@link Dispatcher} and other classes of this library.
 *
 * Any of non readonly properties that defined below may be redefined by
 * author of the script in any file located in `src/app` directory (called
 * "user's files"). It is recommended to do most redefines in
 * `src/app/definitions.js` file otherwise it will be specified better
 * location/filename
 *
 * Overwriting/redefining may look like this
 *
 * ```
 * Script.version = '1.27';
 * ```
 *
 * After this, values that are set in this file will be replaced by new values
 *
 */
var Script = {};


/**
 * @property {Object} dispatcherOpts = {}
 * @experimental
 *
 * Holds options for Dispatcher class
 */
Script.dispatcherOpts = {};


/**
 * @property {Object} buildTimestamp = (Date || String)
 * @readonly
 *
 * Holds time when script has been built
 */
Script.buildTimestamp = new Date("TIMESTAMP");


/**
 * @property {Object} inputFields = {}
 *
 * Contains dictionary of key/pair values that define input specs
 *
 * By default this dictionary is empty. This means no inputs are required
 * to be filled for script run. To change that create
 * `src/app/input_fields.js` file if it does not exist and
 * fill it with inputs you need.
 *
 * All details on how to define inputs are in {@link Input} class
 */
Script.inputFields = {};


/**
 * @property {Array} dialogsContent = {}
 *
 * Contains names of inputs that should appear in dialog(s)
 *
 * By default this array is empty. This means no dialog(s) will shown
 * on script start. To change that create `src/app/dialogs.js` file if
 * it does not exist and fill it with input names you need.
 *
 * All details on how to define inputs are in {@link Input} class
 */
Script.dialogsContent = [];


/**
 * @property {Array} defaultKeys = ['x', 'y']
 *
 * A list of keys that hold data calculated in tasks
 *
 * Lets assume most of your tasks need will operate with next data: `time` and
 * `distance`. It makes sence to change default keys to those values. So your
 * `definitions.js` file will have next line
 *
 * ```
 * Script.defaultKeys = ['time', 'distance'];
 * ```
 *
 * A list of keys have next influe on every instance of Task
 *
 * - every dataSet created by {@link Task#createDataSet} will have that keys
 *
 * ```
 * {
 *     'time': [],
 *     'distance': []
 * }
 * ```
 *
 * - {@link Task#addDataSet} will accept data sets that have at least one of
 *   that keys
 * - {@link Task#createGetSetPropMethods} will add methods that will have those
 *   keys in their names. In our case it will be next methods
 *
 *   - `Task.addDistance()`
 *   - `Task.addTime()`
 *   - `Task.getDistance()`
 *   - `Task.getTime()`
 *
 *
 * If any of your tasks still need to have another set of keys you can achieve
 * this by passing corresponding subparam `params.defaultKeys` to Task's
 * constructor. For details see annotation for that subparam
 *
 * Please take a **note** that name of key should follow next rules:
 *
 * - only letters, digits and underscore `_`
 * - no digits at start
 *
 *
 * May be redefined in "user's file"
 *
 */
Script.defaultKeys = ['x', 'y'];


/**
 * @property {Boolean} demoMode = false
 *
 * Flag that indicates if script works in demo mode. Standart way to change it
 * is through build system. However we cant stop you to change it via plain
 * redefine in any of "user's file"
 */
Script.demoMode = $DEMO_MODE$;


/**
 * @property {String} buildID = '$BUILD_ID$'
 *
 * Text that shows unique id of the script that has been built with help of
 * build system. Does nothing if you are not using build system and VCS([version
 * control system](http://en.wikipedia.org/wiki/Revision_control)\)
 */
Script.buildID = '$BUILD_ID$';


/**
 * @property {String} version = '$VERSION$'
 *
 * Text that shows version of the script in production version.
 *
 * If you use VCS, build system will automatically fill it.
 * In other case you can always redefine it manually in "user's file"
 *
 * **Note** on usage of this property: if value of this property is changed
 * ie its value is not a default one ('$VERSION$'), this means that at stast
 * of script runt will printed header that is used to print for release build
 *
 * Summary: change this property only before going to do a
 * real release build or [RTM](http://goo.gl/HoJHWY)
 */
Script.version = '$VERSION$';


/**
 * @property {String} name = '$SCRIPT$'
 *
 * Name of the script.
 *
 * If you use build system, it will automatically replace default value with
 * real name. That name is retrived from name of the main build file that is
 * used by Apache Ant (from property `name` of the `project` tag).
 *
 * In other case you can always redefine it manually in "user's file"
 */
Script.name = '$SCRIPT$';


/**
 * @property {Boolean} dumpTasksData = '$DUMP_TASKS_DATA$'
 *
 * Flag that indicates if dispatcher should dump tasks data. Usefull only for
 * tests
 */
Script.dumpTasksData = $DUMP_TASKS_DATA$;

/**
 * @property {Object} messagePrintProps = {}
 *
 * Contains dictionary of key/pair values that define message types and
 * attributes for printing message headers and messages itself
 *
 * Each key is an internal name of the message type.
 *
 * Each value is also a dictionary ant it contains message attributes
 *
 * Here is comlex example with all possible attributes listed
 *
 * ```
 * Script.messagePrintProps = {
 *     'message': {
 *          // indicates if header should be printed or not
 *          'skipHeader': true,
 *          // control chars for header. All possible control chars is
 *          // acceptable. See 'Reporter' class annotaion for details
 *          'headerControlChars': {
 *              'colors': [0xFFFFFF, 0xFF0000]
 *          },
 *          // control chars for messages. All possible control chars is
 *          // acceptable. See 'Reporter' class annotaion for details
 *          // If message has its own controlChars attributes defined
 *          // these one will be ignored
 *          'messageControlChars': {
 *              'colors': [0xFFFFFF, 0xFF0000]
 *          },
 *     }
 * };
 * ```
 *
 * Also may be redefined in "user's file"
 */
Script.messagePrintProps = {
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

