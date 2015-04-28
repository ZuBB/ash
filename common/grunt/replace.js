module.exports = function(grunt, options) {
    return {
        dev: {
            src: '<%= vars.getLastDestFile() %>',
            dest: '<%= vars.getNewDestFile(grunt.task.current) %>',
            replacements: [
                { from: '$SCRIPT$', to: '<%= vars.name %>' },
                { from: '$DATATYPE$', to: '<%= vars.datatype %>' },
                { from: '$LOG_LEVEL$', to: '<%= vars.logLevel %>' },
                { from: '$TIMESTAMP$', to: new Date().toUTCString() },
                { from: '$GRAPHIC_TYPE$', to: '<%= vars.graphic_type %>' },
                { from: ' && $H_CC_inline', to: '' },
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
            src: '<%= vars.getLastDestFile() %>',
            dest: '<%= vars.getNewDestFile(grunt.task.current) %>',
            replacements: [
                { from: '$DEMO_MODE$', to: '<%= vars.demo_mode %>' },
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
