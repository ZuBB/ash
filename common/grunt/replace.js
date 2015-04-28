module.exports = function(grunt, options) {
    return {
        dev: {
            src: '<%= vars.destFile %>',
            dest: '<%= vars.destFile %>',
            replacements: [
                { from: '$SCRIPT$', to: '<%= vars.name %>' },
                { from: '$DATATYPE$', to: '<%= vars.datatype %>' },
                { from: '$LOG_LEVEL$', to: '<%= vars.logLevel %>' },
                { from: '$DEMO_MODE$', to: '<%= vars.demo_mode %>' },
                { from: '$TIMESTAMP$', to: new Date().toUTCString() },
                { from: '$GRAPHIC_TYPE$', to: '<%= vars.graphic_type %>' },
                { from: ' && $H_CC_inline', to: '' },
                {
                    from: '$DUMP_TASKS_DATA$',
                    to: '<%= vars.dump_tasks_data %>'
                }
            ]
        },
        uib: {
            src: '<%= vars.destFile %>',
            dest: '<%= vars.destFile %>',
            replacements: [
                {
                    from: '$BUILD_ID$',
                    to: function(pattern) {
                        var changesets = grunt.config('vars.changesets');
                        var branch = grunt.config('vars.branch');

                        if (branch && changesets) {
                            return branch + '-' + changesets;
                        }

                        return pattern;
                    }
                }
            ]
        },
        rqb: {
            src: '<%= vars.destFile %>',
            dest: '<%= vars.destFile %>',
            replacements: [
                {
                    from: '$VERSION$',
                    to: function(pattern) {
                        return grunt.config('pkg.version') || pattern;
                    }
                }
            ]
        }
    };
};
