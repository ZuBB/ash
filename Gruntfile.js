module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsduck: {
            options: {
                'external': ['DataSet']
            },
            main: {
                src: ['src/core/*.js'],
                dest: '/home/vv/work/own/zubb.bitbucket.org/ash-jsdoc/'
            },
            test: {
                src: ['src/core/*.js'],
                dest: '/tmp/docs'
            }
        },
        shell: {
            'git-count': {
                command: 'git ls-files -m | grep -v index.html | wc -l',
                options: {
                    execOptions: {
                        cwd: '/home/vv/work/own/zubb.bitbucket.org/ash-jsdoc/'
                    },
                    callback: function(err, stdout, stderr, cb) {
                        grunt.config.set('git', {
                            'count': parseInt(stdout, 10) || 0
                        });

                        cb();
                    }
                }
            },
            'git-remove': {
                command: 'git rm $(git ls-files -d -z)',
                options: {
                    execOptions: {
                        cwd: '/home/vv/work/own/zubb.bitbucket.org/ash-jsdoc/',
                    }
                }
            },
            'git-checkout': {
                command: 'git checkout .',
                options: {
                    execOptions: {
                        cwd: '/home/vv/work/own/zubb.bitbucket.org/ash-jsdoc/'
                    }
                }
            }
        },
        gitcommit: {
            commit: {
                options: {
                    message: 'autoupdate of JSDocs'
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

    grunt.config.set('work-dir', {
        'gwd': process.cwd(),
        'twd': grunt.config.get('jsduck.main.dest')
    });

    grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-git');

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

    grunt.registerTask('git', 'check count of modified files', function() {
        if (grunt.config.get('git.count') === 0) {
            grunt.task.run('shell:git-checkout');
        } else {
            grunt.task.run([
                'shell:git-remove',
                'work-dir:change',
                'gitcommit',
                'gitpush',
                'work-dir:restore'
            ]);
        }
    });

    grunt.registerTask('jsdoc', ['jsduck:main', 'shell:git-count', 'git']);
    grunt.registerTask('default', ['jsdoc']);
};

