define(['moment'], function logging (moment) {
    // List of modules whose logs are no displayed.
    var moduleFilter = {};

    return function loggingCtor (module) {
        return {
            log: function (msg) {
                // If the current module logging isn't being filtered...
                if (!(module in moduleFilter)) {
                    var date = moment().format('MM/DD/YY HH:MM');
                    console.log(date + " " + module + " => " + msg + "\n");
                }
            },
            filter: function (filters) {
                if (filters.module !== undefined) {
                    for (var m in filters.module) {
                        if (filters.module[m]) {
                            moduleFilter[m] = true;
                        }
                        else {
                            delete moduleFilter[m];
                        }
                    }
                }
            }
        };
    };
});