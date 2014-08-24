module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jsduck: {
            options: {
                external: ['DataSet'],

                // https://github.com/senchalabs/jsduck/issues/525
                'warnings-exit-nonzero': true,

                'cache-dir': './jsdoc-cache',
                cache: true
            },
            main: {
                src: ['src/core/*.js'],
                dest: '/tmp/ash-jsdoc',
            },
            deploy: {
                src: ['src/core/*.js'],
                dest: grunt.option('repo-path')
            }
        },
        shell: {
            'git-count': {
                command: 'git ls-files -m | grep -v index.html | wc -l',
                options: {
                    execOptions: {
                        cwd: grunt.option('repo-path'),
                    },
                    callback: function(err, stdout, stderr, cb) {
                        grunt.config.set('git', {
                            'count': parseInt(stdout, 10) || 0
                        });

                        cb();
                    }
                }
            }
        },
        gta: {
            options: {
                cwd: grunt.option('repo-path'),
            },
            checkout: {
                command: 'checkout .',
            },
            add: {
                command: 'add -A .',
            },
            commit: {
                command: 'commit -m "autoupdate of JSDocs"',
            },
            push: {
                command: 'push origin master',
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-git-them-all');

    grunt.registerTask('git', 'check count of modified files', function() {
        if (grunt.config.get('git.count') === 0) {
            grunt.task.run('gta:checkout');
        } else {
            grunt.task.run([
                'gta:add',
                'gta:commit',
                'gta:push'
            ]);
        }
    });

    grunt.registerTask('jsdoc', ['jsduck:deploy', 'shell:git-count', 'git']);
    grunt.registerTask('default', ['jsduck:main']);
};

