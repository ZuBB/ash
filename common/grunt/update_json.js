module.exports = function(grunt) {
    return {
        local: {
            src: 'src/core/common/package-json.stub.json',
            dest: 'package.json',
            fields: 'devDependencies',
            options: {
                indent: '  '
            }
        },
        common: {
            dest: 'src/core/common/package-json.stub.json',
            src: 'package.json',
            fields: 'devDependencies',
            options: {
                indent: '    '
            }
        }
    };
};
