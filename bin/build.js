var path = require('path');
var debug = require('debug')('app:build');
var fs = require('fs');
fs.copyFile(path.join(__dirname, '../app/config.js.sample'),
            path.join(__dirname, '../app/config.js'), function (err) { 
    if (err) {
        debug(err);
    } else { 
        debug('config.js success.');
    }
});
fs.writeFile(path.join(__dirname, '../user.json'), '{}', function (err) {
    if (err) {
        debug(err);
    } else {
        debug('user.json success.');
    }
});
