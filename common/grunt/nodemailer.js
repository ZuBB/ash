module.exports = {
    options: {
        message: {
            from:    '<%= vars.mail.from %>',
            to:      '<%= vars.mail.to %>',
            cc:      '<%= vars.mail.cc %>',
            bcc:     '<%= vars.mail.bcc %>',
            subject: '<%= vars.mail.subject %>',
            text:    '<%= vars.mail.message %>\n\n' +
                '<%= vars.mail.messageFooter %>'
        }
    },
    send: {}
};
