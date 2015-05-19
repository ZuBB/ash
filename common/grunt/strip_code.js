module.exports = function(grunt, options) {
    return {
        strip: {
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: '<%= prev_file.script.getNewDestFile(grunt.task.current) %>',
            options: {
                parityCheck: true,
                intersectionCheck: true,
                blocks: [{
                    start_block: '//DEBUG_START',
                    end_block:   '//DEBUG_STOP'
                }]
            }
        }
    };
};
