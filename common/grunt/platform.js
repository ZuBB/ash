module.exports = function(grunt, options) {
    var DEFAULT_PLATFORM = 'uos';

    grunt.registerTask('platform', function() {
        grunt.config(this.name + '.getDefaultPlatform', function() {
            return DEFAULT_PLATFORM.slice(0);
        });

        grunt.config(this.name + '.getPlatforms', function() {
            return grunt.config('pkg.platforms') || [DEFAULT_PLATFORM];
        });
    });
};

