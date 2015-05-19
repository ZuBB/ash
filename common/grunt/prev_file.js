module.exports = function(grunt, options) {
    return {
        script: {
            createFilename: function(currentTask) {
                var parts = [
                    grunt.config('vars.dest'),
                    grunt.config('vars.name').toLowerCase(),
                    '.'+ currentTask.name + '.',
                    grunt.config('vars.ext')
                ];

                return parts.join('');
            }
        }
    };
};

