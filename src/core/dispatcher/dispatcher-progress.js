/**
 * Dispatcher class
 *
 * Manages process of script run
 *
 * Most public methods of this class are called automatically.
 * If your target is a 'quick start' - {@link Dispatcher#registerNewTask}
 * is single method, which you should pay attention for.
 *
 * @singleton
 * @class
 */
Dispatcher = (function() {
    /**
     * Starts visualisation on application's progress bar
     */
    this.startProgress = function() {
        // all tasks + pre process (1 step) + post process (1 step)
        var stepsTotal = this.listRegisteredTasks().length + 1 + 1;
        Host.ShowProgress(_t('core.status.start'), stepsTotal);
    };

    /**
     * Stops visualisation on application's progress bar
     */
    this.stopProgress = function() {
        Host.HideProgress();
    };

    /**
     * Sets current progress in status bar
     *
     * @param {String} text text that represents current step
     */
    this.stepProgressIn = function(text) {
        SetStatusText(text);
    };

    /**
     * Visualises current progress in progress bar
     *
     * @param {Number} step index of current step
     */
    this.stepProgressOut = function(step) {
        Host.SetProgress(step + 1);
    };

    // schedule method in parenthes to be run
    this.schedulePreProcessMethod({
        'index':  5,
        'method': 'startProgress'
    });

    // schedule method in parenthes to be run
    this.schedulePreProcessMethod({
        'index':  6,
        'method': 'stepProgress',
        'params': [0]
    });

    // schedule method in parenthes to be run
    this.schedulePostProcessMethod({
        'index':  95,
        'method': 'stopProgress'
    });

    return this;
}).apply(Dispatcher);

