module.exports = function(grunt, options) {
    return {
        branch: {
            command: 'rev-parse --abbrev-ref HEAD',
            options: {
                storeOutputTo: 'vars.branch',
                postProcessOutput: function(stdout) {
                    return stdout.trim();
                }
            }
        },
        commits: {
            command: 'rev-list --count HEAD',
            options: {
                storeOutputTo: 'vars.changesets',
                postProcessOutput: function(stdout) {
                    return stdout.trim();
                }
            }
        },
        sha: {
            command: 'git rev-parse --short=8 HEAD',
            options: {
                storeOutputTo: 'vars.hash',
                postProcessOutput: function(stdout) {
                    return stdout.trim();
                }
            }
        },
        modified: {
            command: 'diff --stat',
            options: {
                storeOutputTo: 'vars.modified',
                postProcessOutput: function(stdout) {
                    return stdout.trim().length > 0 ? '+' : '';
                }
            }
        }
    };
};
