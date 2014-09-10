module.exports = function(grunt, path) {
    return {
        // path to task.js files, defaults to grunt dir
        configPath: path.join(process.cwd(), 'src/core/common/grunt'),
        overridePath: path.join(process.cwd(), 'build/sdh'),

        // auto grunt.initConfig
        init: true,
        jitGrunt: {
            replace: 'grunt-text-replace',
            gta: 'grunt-git-them-all',
            shell: 'grunt-shell-spawn'
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
