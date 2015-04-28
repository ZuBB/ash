module.exports = function(grunt, options) {
    return {
        uib: {
            src: '<%= vars.getLastDestFile() %>',
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
