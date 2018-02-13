var user = require('./common/user');
var initResult = require('./common/result');
var check = require('./common/check');
var sess = require('./common/session');
var log = require('./common/log');
var debug = require('debug')('app:register');

var register = function (req, res) {
    var result = initResult();
    var auth = sess.auth(req);

    debug(req.body.username);
    debug((auth.needCaptcha ? '' : 'do not ') + 'need captcha.');
    if (auth.needCaptcha) {
        debug(auth.captcha.pass ? 'pass' : 'fail');
    }

    if (auth.needCaptcha && !auth.captcha.pass) {
        log.fail(auth);
        result.fail('need-captcha');
    } else {
        if (!check.username(req.body.username)) {
            result.fail('bad-username');
        }
        if (!check.password(req.body.password)) {
            result.fail('bad-password');
        }
        if (!result.failed()) {
            var un = req.body.username;
            var pw = req.body.password;
            user.addUser(un, pw, function (err) {
                if (!err) {
                    log.passCaptcha(auth);
                    result.success();
                } else if (err.message === 'user exists') {
                    log.fail(auth);
                    result.fail('user-exists');
                } else {
                    debug(err);
                    result.fail('internal-error');
                }
                res.json(result.data);
            });
            return;
        } else {
            log.fail(auth);
        }
    }
    res.json(result.data);
};

module.exports = register;
