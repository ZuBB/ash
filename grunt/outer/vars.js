module.exports = {
    'ext': 'ajs',
    'dest': 'build/output/',
    'buildType': null,

    'destFile': [
        '<%= vars.dest %>',
        '<%= pkg.name %>.',
        '<%= vars.buildType %>.',
        '<%= vars.ext %>'
    ].join(''),

    'mail': {
        'to': '',
        'cc': '',
        'bcc': '',
        'from': 'ASH Build System',
        'subject': '',
        'message': '',
        'messageFooter': 'Email sent by ASH robat v2.',
        'smtpCredsFile': 'creds.smtp.json'
    },

    'changesets': null,
    'branch': null,
    'version': null,
    'modified': null,

    'datatype': '$DATATYPE$',
    'demo_mode': false,
    'dump_tasks_data': false,
    'graphic_type': null
};

