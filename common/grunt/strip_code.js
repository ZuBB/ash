module.exports = function(grunt, options) {
    return {
        strip: {
            src: '<%= prev_file.getLastDestFile() %>',
            dest: '<%= prev_file.getNewDestFile() %>',
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
