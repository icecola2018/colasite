var initResult = require('./common/result');
var check = require('./common/check');
var sess = require('./common/session');
var log = require('./common/log');
var debug = require('debug')('app:logout');

var tryLogout = function (req, res) {
    var result = initResult();
    var auth = sess.auth(req);

    debug(req.body.username);

    if (!auth.login) {
        result.fail('not-login');
    } else {
        var un = req.body.username;
        if (!check.username(un)) {
            result.fail('bad-username');
        } else {
            if (auth.login === un) {
                log.out(auth);
                result.success();
            } else {
                result.fail('bad-user');
            }
        }
    }
    if (result.failed()) {
        log.fail(auth);
    }
    res.json(result.data);
};

module.exports = tryLogout;