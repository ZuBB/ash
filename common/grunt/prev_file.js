module.exports = function(grunt, options) {
    grunt.registerTask('prev_file', function() {
        //console.log(this)
        var destFilenames = this._destFilenames = {};

        grunt.config(this.name + '.getNewDestFile', function() {
            var platform = grunt.config('vars.platform');
            var parts = [
                grunt.config('vars.dest'),
                grunt.config('vars.name').toLowerCase(),
                '.' + grunt.task.current.name,
                '.' + platform + '.',
                grunt.config('vars.ext')
            ];

            var newFilename = parts.join('');

            if (destFilenames.hasOwnProperty(platform) === false) {
                destFilenames[platform] = [];
            }

            if (destFilenames[platform].indexOf(newFilename) < 0) {
                destFilenames[platform].push(newFilename);
            }

            return newFilename;
        });

        grunt.config(this.name + '.getLastDestFile', function() {
            return destFilenames[grunt.config('vars.platform')]
                .filter(function(filepath) {
                    return grunt.file.exists(filepath);
                })
                .slice(-1)
                .pop();
        });
    });
};

