module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsduck: {
            options: {
                'external': ['DataSet']
            },
            main: {
                src: ['src/core/*.js'],
                dest: '/tmp/ash-jsdoc'
            },
            deploy: {
                src: ['src/core/*.js'],
                dest: grunt.option('repo-path')
            }
        },
        shell: {
            options: {
                execOptions: {
                    cwd: grunt.option('repo-path'),
                }
            },
            'git-count': {
                command: 'git ls-files -m | grep -v index.html | wc -l',
                options: {
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
            },
            'git-add': {
                command: 'git add -A',
            },
            'git-checkout': {
                command: 'git checkout .'
            }
        },
        gitcommit: {
            commit: {
                options: {
                    message: 'autoupdate of JSDocs',
                    cwd: grunt.option('repo-path')
                }
            }
        },
        gitpush: {
            push: {
                options: {
                    branch: 'master',
                    cwd: grunt.option('repo-path')
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
                'shell:git-add',
                'gitcommit',
                'gitpush'
            ]);
        }
    });

    grunt.registerTask('jsdoc', ['jsduck:deploy', 'shell:git-count', 'git']);
    grunt.registerTask('default', ['jsduck:main']);
};

