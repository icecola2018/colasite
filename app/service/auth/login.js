var user = require('./common/user');
var initResult = require('./common/result');
var check = require('./common/check');
var sess = require('./common/session');
var log = require('./common/log');
var debug = require('debug')('app:login');

var tryLogin = function (req, res) {
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
            user.verify(un, pw, function (err, ok) {
                if (err) {
                    if (err.message === 'no such user') {
                        log.fail(auth);
                        result.fail('no-user');
                    } else {
                        debug(err);
                        result.fail('internal-error');
                    }
                } else {
                    if (ok) {
                        if (log.in(auth, un).success) {
                            result.success();
                        } else {
                            // future feature
                        }
                    } else {
                        log.fail(auth);
                        result.fail('wrong-password', '密码不正确');
                    }
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

module.exports = tryLogin;