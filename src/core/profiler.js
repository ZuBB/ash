/*
 * Profiler lib
 */
Profiler = {
    _items: {},
    _running: []
};

Profiler.start = function(name, time) {
    time = time || new Date();
    var key = name || time.toString();

    this._items[key] = [time];
    this._running.push(key);
};

Profiler.stop = function(name) {
    var time = new Date();
    var result = -1;

    for (var ii = 0; ii < this._running.length; ii++) {
        if (name && this._running[ii] === name) {
            this._items[name].push(time);
            this._running.splice(ii, 1);
            result = this.get_ms_time(name);
        }
    }

    return result;
};

Profiler.stopAll = function() {
    for (var ii = 0; ii < this._running.length; ii++) {
        this.stop(this._running[ii]);
    }
};

Profiler.get_ms_time = function(name) {
    var result = -1;

    if (name && this._items[name] && this._items[name][1]) {
        result = this._items[name][1] - this._items[name][0];
    }

    return result;
};

Profiler.get_s_time = function(name) {
    var ms = this.get_ms_time(name);

    if (!isNaN(ms)) {
        return ms / 1000;
    }
};

Profiler.get_m_time = function(name) {
    var ms = this.get_ms_time(name);

    if (!isNaN(ms)) {
        return ms / 60000;
    }
};

Profiler.get_detailed_time = function(name) {
    var diff = this.get_ms_time(name);

    if (isNaN(diff)) {
        return null;
    }

    // TODO: microseconds
    return {
        'm' : Math.floor(diff / 60000),
        's' : Math.floor((diff % 60000) / 1000),
        'ms': diff % 1000
    };
};

Profiler.get_HRF_time = function(name) {
    var timeObj = this.get_detailed_time(name);
    var str = [];

    if (timeObj.ms) {
        str.unshift(timeObj.ms + ' ' + _t('units.ms'));
    }

    if (timeObj.s) {
        str.unshift(timeObj.s + ' ' + _t('units.s'));
    }

    if (timeObj.m) {
        str.unshift(timeObj.m + ' ' + _t('units.min'));
    }

    return str.join(', ');
};

