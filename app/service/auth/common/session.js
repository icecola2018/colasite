var captcha = require('./captcha');
var log = require('./log');
var debug = require('debug')('app:auth');

var version = 1;

var newAuth = function () {
    debug('generate new auth object');
    return {
        login: '',
        captcha: {
            number: 0,
            pass: false,
            passDate: null
        },
        failedTry: 0,
        needCaptcha: false
    };
}

var initAuth = function (session) {
    debug('version: ' + session.authVersion + '->' + version);
    if (session.authVersion != version) {
        switch (session.authVersion) {
            // case x: // other version
            default: // new session
                session.auth = newAuth();
        }
        session.authVersion = version;
    }
}

var checkAuth = function (auth) {
    debug('check:');
    debug(auth);

    if (auth.captcha.pass && new Date().getTime() - auth.passDate > 180000) { // 3 min
        debug('abate captcha pass');
        captcha.reset(auth.captcha);
    }

    if (log.tooManyFail(auth)) {
        debug('too many failed tries');
        auth.needCaptcha = true;
    }
}

module.exports = {
    auth: function (req) {
        return req.session.auth
    },
    init: function (req) {
        return initAuth(req.session);
    },
    check: function (req) {
        return checkAuth(req.session.auth);
    }
}