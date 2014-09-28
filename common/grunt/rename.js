module.exports = function(grunt, options) {
    return {
        'cc-fix': {
            // FIXME
            src: '<%= vars.destFile %>1',
            dest: '<%= vars.destFile %>',
        },
        uib: {
            src: '<%= vars.destFile %>',
            dest: [
                '<%= vars.dest %>',
                '<%= vars.name %>.',
                '<%= vars.buildType %>.',
                '<%= vars.branch %>-',
                '<%= vars.changesets %>',
                '<%= vars.hash === null ? "" : "[" + vars.hash + "]" %>',
                '<%= vars.modified %>.',
                '<%= vars.ext %>'
            ].join('')
        }
    };
};
