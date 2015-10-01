module.exports = function(grunt) {
    return {
        options: {
            file: 'config.json',
            tagName: 'v<%= version %>',
            npm: false
        },
    };
};
