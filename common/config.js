module.exports = function(grunt, path) {
    var filePath = path.join(process.cwd(), 'custom-config-dirs.json');
    var configDirs = [];

    if (grunt.file.exists(filePath)) {
        configDirs = grunt.file.readJSON(filePath).pathes;
    }

    configDirs = configDirs.map(function(item) {
        return path.join(process.cwd(), item);
    });

    return {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'src/core/common/grunt'),
        overridePath: configDirs,

        // auto grunt.initConfig
        init: true,
        jitGrunt: {
            staticMappings: {
                replace: 'grunt-text-replace',
                gta: 'grunt-git-them-all',
                shell: 'grunt-shell-spawn'
            }
        },

        // data passed into config. can use with <%= test %>
        data: {
            pkg: grunt.file.readJSON('package.json')
        },

        // can optionally pass options to load-grunt-tasks.
        // If you set to false, it will disable auto loading tasks.
        loadGruntTasks: true
    };
};
