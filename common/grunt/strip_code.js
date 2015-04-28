module.exports = function(grunt, options) {
    return {
        strip: {
            src: '<%= vars.getLastDestFile() %>',
            dest: '<%= vars.getNewDestFile(grunt.task.current) %>',
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
