module.exports = function(grunt) {
    return {
        options: {
            push: true,
            pushTo: 'origin',
            updateConfigs: ['pkg']
        },
    };
};
