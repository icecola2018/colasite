var conf = require('../config');
var bcrypt = require('bcrypt');
var debug = require('debug')('app:userdb');

var fs = require('fs');

var dbpath = conf.userdb;
var db = {};
var updated = false;
var writing = false;

if (dbpath) {
    try {
        var str = fs.readFileSync(dbpath, { encoding: 'utf8' });
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
        var onCreate = !db[username].password;
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
            'register-date': (new Date()).toUTCString(),
            'info': {
                'nickname': username,
                'greeting': 'Hello!'
            }
        }
        setPassword(username, password, callback);
    }
};

var setInfo = function (username, info, callback) {
    if (db[username]) {
        var userinfo = db[username]['info'];
        for (var key in info) {
            userinfo[key] = info[key];
        }
        updated = true;
        callback();
    } else { 
        callback(new Error('no such user'));
    }
};

exports.addUser = addUser;
exports.setPassword = setPassword;
exports.setInfo = setInfo;
exports.verify = verify;