module.exports = function(grunt) {
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

    grunt.registerTask('meta-replace', function() {
        var currEnv = grunt.config('environment.env');
        var tasks = ['replace:dev'];

        if (currEnv === 'uib') {
            tasks.push('replace:uib');
        } else if (currEnv === 'rqb') {
            tasks.push('replace:rqb');
        }

        grunt.task.run(tasks);
    });

    grunt.registerTask('meta-strip', function() {
        var currEnv = grunt.config('environment.env');

        if (currEnv === 'lint' || currEnv === 'rqb') {
            grunt.task.run('strip_code');
        }
    });

    grunt.registerTask('meta-lint', function() {
        if (grunt.config('environment.env') === 'lint') {
            grunt.task.run('jshint:light');
        }
    });

    grunt.registerTask('meta-minify', function() {
        if (grunt.config('environment.env') === 'rqb') {
            grunt.task.run('closureCompiler:likeOld');
        }
    });

    grunt.registerTask('meta-iconv', function() {
        if (grunt.config('environment.env') !== 'lint') {
            //grunt.task.run('transcode:main');
        }
    });

    grunt.registerTask('meta-naming', function() {
        var currEnv = grunt.config('environment.env');

        if (currEnv !== 'lint') {
            grunt.task.run('copy:' + currEnv);
        }
    });

    grunt.registerTask('scriptOwned', function() {
    });
};

