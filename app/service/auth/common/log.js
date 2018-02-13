var captcha = require('./captcha');

var passCaptcha = function (auth) {
    auth.failedTry = 0;
    auth.needCaptcha = false;
}

var tooManyFail = function (auth) {
    return auth.failedTry > 5;
};

var fail = function (auth) {
    auth.failedTry++;
    if (tooManyFail(auth)) {
        captcha.reset(auth.captcha);
    }
};

var logout = function (auth) {
    auth.login = '';
    passCaptcha(auth);
};

var login = function (auth, username) {
    if (auth.login) {
        logout(auth);
    }

    auth.login = username;
    passCaptcha(auth);

    return {
        success: true
    };
};

module.exports = {
    in: login,
    out: logout,
    passCaptcha: passCaptcha,
    fail: fail,
    tooManyFail: tooManyFail
}
