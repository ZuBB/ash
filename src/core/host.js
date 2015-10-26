function fillHost() {
    Host = {};

    Host.CurPath = '';
    Host.DataType = 'ANA';
    Host.NumberOfSamples = 3030;
    Host.SelBegin = 10;
    Host.SelEnd = 999;
    Host.CurFileName = 'passat1.6';
    Host.Frequency = 12499;

    Host.GetCurLanguage = function() {
        // 1049: == 'ru'
        // 1033: == 'en'
        return 1049;
    };

    Host.ReportOut = function(string) {
        // TODO
        console.log(string);
    };

    Host.ShowProgress = function() {
        // TODO
        console.info('`Host.ShowProgress` - not implemented');
    };

    Host.CreateConfigure = function() {
        return {
            AddItemEx: function() {},
            Configure: function() {},
            GetValue: function() {},
        };
    };

    Host.SetStatusText = function() {
        // TODO
        console.info('`Host.SetStatusText` - not implemented');
    };

    Host.SetProgress = function() {
        // TODO
        console.info('`Host.SetProgress` - not implemented');
    };

    Host.HideProgress = function() {
        // TODO
        console.info('`Host.HideProgress` - not implemented');
    };
}

function fillIO() {
    IO = {
        getSafeNeighbourPath: function() {},
        createFile: function() {
            return {
                getFilePath: function() {},
                getSize: function() {},
                resaveInUTF: function() {},
            }
        },
        getDirFiles: function() { return ''},
        getSafeDirPath: function() { return ''},
        buildPath: function() { return ''},
    };
}

if (typeof Host === 'undefined') {
    fillHost();
}
if (typeof IO === 'undefined') {
    fillIO();
}
