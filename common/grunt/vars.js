module.exports = {
    'ext': 'ajs',
    'name': '',
    'dest': 'build/output/',
    'buildType': null,

    'destFile': [
        '<%= vars.dest %>',
        '<%= vars.name.toLowerCase() %>.',
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

    'hash': null,
    'branch': null,
    'modified': null,
    'changesets': null,

    'datatype': '$DATATYPE$',
    'demo_mode': false,
    'dump_tasks_data': false,
    'graphic_type': null,
    'logLevel': 0
};
