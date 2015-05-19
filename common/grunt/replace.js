module.exports = function(grunt) {
    return {
        dev: {
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: '<%= prev_file.script.getNewDestFile(grunt.task.current) %>',
            replacements: [
                { from: ' && $H_CC_inline', to: '' },
                { from: '$DATATYPE$', to: '<%= vars.datatype %>' },
                { from: '$LOG_LEVEL$', to: '<%= vars.logLevel %>' },
                { from: '$DEMO_MODE$', to: '<%= vars.demoMode %>' },
                { from: '$TIMESTAMP$', to: new Date().toUTCString() },
                { from: '$GRAPHIC_TYPE$', to: '<%= vars.graphic_type %>' },
                {
                    from: '$SCRIPT$',
                    to: function(pattern) {
                        var rqb = grunt.config('environment.env') === 'rqb';
                        var key = rqb ? 'scriptTitle' : 'devFilename';
                        return grunt.config.get('pkg.' + key);
                    }
                }
            ]
        },
        uib: {
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: '<%= prev_file.script.getNewDestFile(grunt.task.current) %>',
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
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: '<%= prev_file.script.getNewDestFile(grunt.task.current) %>',
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

