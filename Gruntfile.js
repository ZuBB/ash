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
            },
            count: {
                command: 'ls-files -m | grep -v index.html | wc -l',
                options: {
                    storeOutputTo: 'count'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsduck');
    grunt.loadNpmTasks('grunt-git-them-all');

    grunt.registerTask('git', 'check count of modified files', function() {
        if ((parseInt(count, 10) || 0) === 0) {
            grunt.task.run('gta:checkout');
        } else {
            grunt.task.run(['gta:add', 'gta:commit', 'gta:push']);
        }
    });

    grunt.registerTask('jsdoc', ['jsduck:deploy', 'gta:count', 'git']);
    grunt.registerTask('default', ['jsduck:main']);
};

