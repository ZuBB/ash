module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsduck: {
            main: {
                src: ['src/core/*.js'],
                dest: '/home/vv/work/own/zubb.bitbucket.org/ash-jsdoc/',
                options: {
                    'external': ['DataSet']
                }
            }
        },
        gitcommit: {
            commit: {
                options: {
                    message: 'JSDocs updated'
                },
                files: {
                    src: [
                        'data-*.js',
                        'index.html',
                        'output/*.js',
                        'source/*.html'
                    ]
                }
            }
        },
        gitpush: {
            push: {
                options: {
                    branch: 'master'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-git');

    grunt.config.set('work-dir', {
        'gwd': process.cwd(),
        'twd': grunt.config.get('jsduck.main.dest')
    });

    grunt.registerTask('work-dir', 'change/restore current working dir', function() {
        grunt.log.writeln(grunt.config.get('work-dir.gwd'));
        grunt.log.writeln(grunt.config.get('work-dir.twd'));
    });

    grunt.registerTask('work-dir:change', 'change current working dir', function() {
        grunt.file.setBase(grunt.config('work-dir.twd'));
    });

    grunt.registerTask('work-dir:restore', 'restore current working dir', function() {
        grunt.file.setBase(grunt.config.get('work-dir.gwd'));
    });

    grunt.registerTask('work-dir:pwd', 'print current working dir', function() {
        grunt.log.writeln(process.cwd());
    });

    grunt.registerTask('git', ['gitcommit', 'gitpush']);
    grunt.registerTask('jsdoc', ['jsduck', 'work-dir:change', 'git', 'work-dir:restore']);
    grunt.registerTask('default', ['jsdoc']);
};

