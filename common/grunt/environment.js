module.exports = function(grunt, options) {
    grunt.registerTask('environment:dev', function() {
        grunt.config.set('environment.env', 'dev');
    });

    grunt.registerTask('environment:uib', function() {
        grunt.config.set('environment.env', 'uib');
    });

    grunt.registerTask('environment:lint', function() {
        grunt.config.set('environment.env', 'lint');
    });

    grunt.registerTask('environment:rqb', function() {
        grunt.config.set('environment.env', 'rqb');
    });

    return {
        env: 'dev'
    };
};

