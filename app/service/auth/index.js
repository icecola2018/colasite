var sess = require('./common/session');
var captcha = require('./captcha');
var register = require('./register');
var login = require('./login');
var logout = require('./logout');
var debug = require('debug')('app:auth');

var checkSession = function (req, res, next) {
    sess.init(req);
    sess.check(req);
    next();
};

var getStatus = function (req, res) {
    var auth = sess.auth(req);
    debug('status:');
    debug(auth);
    res.json({
        login: auth.login,
        needCaptcha: auth.needCaptcha
    });
};

module.exports = {
    init: checkSession,
    status: getStatus,
    captcha: captcha,
    register: register,
    login: login,
    logout:logout
}
