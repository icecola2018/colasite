var conf = require('../../../config');
var bcrypt = require('bcrypt');
var debug = require('debug')('app:user');

var fs = require('fs');

var dbpath = conf.userdb;
var db = {};
var updated = false;
var writing = false;

if (dbpath) {
    try {
        var str = fs.readFileSync(dbpath, {encoding: 'utf8'});
        db = JSON.parse(str);
    } catch (err) {
        dbpath = '';
        debug(err);
        debug('Cannot read file.');
    }

    var interval = setInterval(function () {
        if (!dbpath) {
            clearInterval(interval);
        }
        if (updated && !writing) {
            try {
                writing = true;
                fs.writeFileSync(dbpath, JSON.stringify(db));
            } catch (err) {
                dbpath = '';
                debug(err);
                debug('Cannot write file.');
            }
            writing = false;
        }
    }, 120000);
}

var verify = function (username, password, callback) {
    if (db[username]) {
        bcrypt.compare(password, db[username].password, function (err, res) {
            if (err) {
                debug(err);
                debug('compare failed');
                callback(new Error('compare failed'));
            } else {
                callback(undefined, res);
            }
        });
    } else {
        callback(new Error('no such user'));
    }
};

var setPassword = function (username, password, callback) {
    if (db[username]) {
        var onCreate = db[username].status === 'init';
        bcrypt.hash(password, 9, function (err, hash) {
            if (err) {
                debug(err);
                debug('hash failed.');
                if (onCreate) {
                    delete db[username];
                }
                callback(new Error('hash failed'));
            } else {
                db[username].password = hash;
                if (onCreate) {
                    db[username].status = 'normal';
                }
                updated = true;
                callback();
            }
        });
    } else {
        callback(new Error('no such user'));
    }
};

var addUser = function (username, password, callback) {
    if (db[username]) {
        callback(new Error('user exists'));
    } else {
        db[username] = {
            'username': username,
            'status': 'init',
            'register-date': (new Date()).toUTCString()
        }
        setPassword(username, password, callback);
    }
};


var userStatus = function (username, callback) {
    if (db[username]) {
        callback(null, db[username].status);
    } else {
        callback(new Error('no such user'));
    }
}

module.exports = {
    userStatus: userStatus,
    addUser: addUser,
    setPassword: setPassword,
    verify: verify
}
