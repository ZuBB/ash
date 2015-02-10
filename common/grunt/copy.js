module.exports = function(grunt, options) {
    var local  = 'package.json';
    var common = 'src/core/common/package-json.reference.json';

    return {
        config2common: {
            src: local,
            dest: common,
        },
        config2local: {
            src: common,
            dest: local,
        }
    };

};
