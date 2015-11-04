module.exports = function(grunt) {
    function metaTaskSkeleton(taskFunction) {
        var currEnv = grunt.config('environment.env');
        var platforms = grunt.config('pkg.platforms') || ['uos'];
        var tasksToRun = null;

        platforms.forEach(function(platform) {
            grunt.config('vars.platform', platform);
            tasksToRun = taskFunction(currEnv);

            if (tasksToRun) {
                grunt.task.run(tasksToRun);
            }
        });
    }

    grunt.registerTask('meta-vars', function() {
        if (grunt.config('environment.env') === 'rqb') {
            grunt.task.run('vars-rq');
        } else {
            grunt.task.run('vars-dev');
        }
    });

    grunt.registerTask('meta-git', function() {
        var currEnv = grunt.config('environment.env');
        if (currEnv === 'uib' || currEnv === 'rqb') {
            grunt.task.run('git');
        }
    });

    grunt.registerTask('meta-clean', function() {
        grunt.task.run('clean');
    });

    grunt.registerTask('meta-concat', function() {
        metaTaskSkeleton(function() {
            return 'concat';
        });
    });

    grunt.registerTask('meta-replace', function() {
        metaTaskSkeleton(function(currEnv) {
            var tasks = ['replace:dev'];

            if (currEnv === 'uib') {
                tasks.push('replace:uib');
            } else if (currEnv === 'rqb') {
                tasks.push('replace:rqb');
            }

            return tasks;
        });
    });

    grunt.registerTask('meta-strip', function() {
        metaTaskSkeleton(function(currEnv) {
            if (currEnv === 'lint' || currEnv === 'rqb') {
                return 'strip_code';
            }
        });
    });

    grunt.registerTask('meta-lint', function() {
        metaTaskSkeleton(function(currEnv) {
            if (currEnv === 'lint') {
                return 'jshint:light';
            }
        });
    });

    grunt.registerTask('meta-minify', function() {
        metaTaskSkeleton(function(currEnv) {
            if (currEnv === 'rqb') {
                return 'closureCompiler:likeOld';
            }
        });
    });

    grunt.registerTask('meta-iconv', function() {
        metaTaskSkeleton(function(currEnv) {
            if (currEnv !== 'lint') {
                return 'transcode:main';
            }
        });
    });

    grunt.registerTask('meta-naming', function() {
        metaTaskSkeleton(function(currEnv) {
            if (currEnv !== 'lint') {
                return 'copy:' + currEnv;
            }
        });
    });

    grunt.registerTask('scriptOwned', function() {
    });
};

