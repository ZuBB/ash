module.exports = function(grunt, options) {
    return {
        main: {
            src: '<%= vars.destFile %>',
            dest: '<%= vars.destFile %>',
            replacements: [
                { from: '$SCRIPT$', to: '<%= pkg.name %>' },
                { from: '$DATATYPE$', to: '<%= vars.datatype %>' },
                { from: '$DEMO_MODE$', to: '<%= vars.demo_mode %>' },
                { from: '$TIMESTAMP$', to: new Date().toUTCString() },
                { from: '$GRAPHIC_TYPE$', to: '<%= vars.graphic_type %>' },
                {
                    from: '$DUMP_TASKS_DATA$',
                    to: '<%= vars.dump_tasks_data %>'
                },
                {
                    from: '$VERSION$',
                    to: function(pattern) {
                        return grunt.config('vars.version') || pattern;
                    }
                },
                {
                    from: '$BUILD_ID$',
                    to: function(pattern) {
                        var changesets = grunt.config('vars.branch');
                        var branch = grunt.config('vars.branch');

                        if (branch && changesets) {
                            return branch + '-' + changesets;
                        }

                        return pattern;
                    }
                }
            ]
        }
    };
};

