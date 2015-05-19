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
        },
        dev: {
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: [
                '<%= vars.dest %>',
                '<%= vars.name %>',
                '-cooked',
                '.',
                '<%= vars.ext %>'
            ].join('')
        },
        uib: {
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: [
                '<%= vars.dest %>',
                '<%= vars.name %>',
                '.',
                'dev',
                '-cooked',
                '.',
                '<%= vars.branch %>-',
                '<%= vars.changesets %>',
                '<%= vars.hash === null ? "" : "[" + vars.hash + "]" %>',
                '<%= vars.modified %>',
                '.',
                '<%= vars.ext %>'
            ].join('')
        },
        rqb: {
            src: '<%= prev_file.script.getLastDestFile() %>',
            dest: [
                '<%= vars.dest %>',
                '<%= pkg.releaseFilename %>',
                '.',
                '<%= environment.env %>',
                '-cooked',
                '.',
                '<%= vars.branch %>-',
                '<%= vars.changesets %>',
                '<%= vars.hash === null ? "" : "[" + vars.hash + "]" %>',
                '<%= vars.modified %>',
                '.',
                '<%= vars.ext %>'
            ].join('')
        }
    };
};

