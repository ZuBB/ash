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
     * Sets visualises current progress in progress and status bars
     *
     * @param {Number} step index of current step
     */
    this.stepProgress = function(step) {
        if (typeof step === 'number' && isFinite(step)) {
            Host.SetProgress(step + 1);
            //SetStatusText('some message');
        }
    };

    /**
     * Stops visualisation on application's progress bar
     */
    this.stopProgress = function() {
        Host.HideProgress();
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

