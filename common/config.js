module.exports = function(grunt, path) {
    var filePath = path.join(process.cwd(), 'config.json');
    var dataObj  = null;

    if (grunt.file.exists(filePath)) {
        dataObj = grunt.file.readJSON(filePath);
    } else {
        grunt.fail.fatal('No main config found');
    }

    return {
        // path to task.js files
        configPath: path.join(process.cwd(), 'src/core/common/grunt'),
        overridePath: (dataObj.usersTaskFolders || []).map(function(item) {
            return path.join(process.cwd(), item);
        }),

        // auto grunt.initConfig
        init: true,
        jitGrunt: {
            staticMappings: {
                replace: 'grunt-text-replace',
                git: 'grunt-simple-git',
                shell: 'grunt-shell-spawn'
            }
        },

        // data passed into config. can use with <%= test %>
        data: {
            pkg: dataObj
        },

        // can optionally pass options to load-grunt-tasks.
        // If you set to false, it will disable auto loading tasks.
        loadGruntTasks: true
    };
};
