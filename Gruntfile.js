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
            },
            test: {
                src: ['src/core/*.js'],
                dest: '/tmp/docs',
                options: {
                    'external': ['DataSet']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jsduck');

    grunt.registerTask('default', ['jsduck:main']);
};

