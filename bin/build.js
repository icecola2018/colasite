var path = require('path');
var debug = require('debug')('app:build');
var fs = require('fs');

fs.writeFile(path.join(__dirname, '../user.json'), '{}', function (err) {
    if (err) {
        debug(err);
    } else {
        debug('user.json success.');
    }
});
