module.exports = function(grunt) {
    var repoPath = '/home/vv/work/own/zubb.bitbucket.org/ash-jsdoc/';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsduck: {
            options: {
                'external': ['DataSet']
            },
            main: {
                src: ['src/core/*.js'],
                dest: repoPath
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
                        cwd: repoPath
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
                        cwd: repoPath,
                    }
                }
            },
            'git-checkout': {
                command: 'git checkout .',
                options: {
                    execOptions: {
                        cwd: repoPath
                    }
                }
            }
        },
        gitcommit: {
            commit: {
                options: {
                    message: 'autoupdate of JSDocs',
                    cwd: repoPath
                },
                files: [{
                    expand: true,
                    cwd: repoPath,
                    src: [
                        'data-*.js',
                        'index.html',
                        'output/*.js',
                        'source/*.html'
                    ]
                }]
            }
        },
        gitpush: {
            push: {
                options: {
                    branch: 'master',
                    cwd: repoPath
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-git');

    grunt.registerTask('git', 'check count of modified files', function() {
        if (grunt.config.get('git.count') === 0) {
            grunt.task.run('shell:git-checkout');
        } else {
            grunt.task.run([
                'shell:git-remove',
                'gitcommit',
                'gitpush'
            ]);
        }
    });

    grunt.registerTask('jsdoc', ['jsduck:main', 'shell:git-count', 'git']);
    grunt.registerTask('default', ['jsdoc']);
};

