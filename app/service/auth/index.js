var captchapng = require('captchapng');
var debug = require('debug')('app:auth');
var user = require('../userdb');

var version = 1;
var checkSession = function (req, res, next) {
    if (req.session.authVersion != version) {
        switch (req.session.authVersion) {
        // case x: // other version
        default: // new session
            req.session.auth = {
                login: '',
                captcha: -1,
                ignoreCaptcha: true,
                failedTry: 0,
            };
        }
        req.session.authVersion = version;
    }
    
    var sess = req.session.auth;
    if (sess.failedTry > 5) {
        sess.ignoreCaptcha = false;
    }

    return next();
};

var logout = function (session) {
    session.login = '';
};
var login = function (session, username) {
    if (session.login) {
        logout(session);
    }
    session.login = username;

    return {
        success: true
    };
};

var getStatus = function (req, res) {
    var sess = req.session.auth;
    res.json({
        login: sess.login,
        ignore: sess.ignoreCaptcha
    });
    res.end();
};

var bkcolor = () => parseInt(Math.random() * 40);
var ftcolor = () => parseInt(Math.random() * 130 + 120);
var getCaptcha = function (req, res) {
    var number = parseInt(Math.random() * 9000 + 1000);
    req.session.auth.captcha = number;

    var p = new captchapng(80, 30, number);
    p.color(bkcolor(), bkcolor(), bkcolor(), 255);
    p.color(ftcolor(), ftcolor(), ftcolor(), 255);

    var imgbase64 = new Buffer(p.getBase64(), 'base64');
    res.type('png');
    res.send(imgbase64);
    res.end();
};

var goodUsername = (string) => (/^[a-zA-Z]\w{5,15}$/).test(string);
var goodPassword = (string) => (/^\w{6,16}$/).test(string);
var basicCheck = function (req) {
    var sess = req.session.auth;
    var auth = {};
    if (goodUsername(req.body.username)) {
        auth.username = req.body.username;
    }
    if (goodPassword(req.body.password)) {
        auth.password = req.body.password;
    }
    if (sess.ignoreCaptcha) {
        auth.captcha = true;
    } else if (req.body.captcha) {
        if (sess.captcha === parseInt(Number(req.body.captcha))) {
            auth.captcha = true;
            sess.ignoreCaptcha = true;
            sess.failedTry = 0;
        }
        sess.captcha = -1;
    }
    return auth;
};

var initResult = function () {
    return {
        data: { fail: {}},
        fail: function (msg, detail) {
            if (!detail) { 
                detail = true;
            }
            this.data.fail[msg] = detail;
        },
        success: function (msg) { 
            if (!msg) { 
                msg = true;
            }
            delete this.data.fail;
            this.data.success = msg;
        },
        failed: function () {
            if (this.data.success) {
                return false;
            } else {
                return Object.keys(this.data.fail).length > 0;
            }
        }
    };
};

var tryLogin = function (req, res) {
    var result = initResult();
    var auth = basicCheck(req);
    var sess = req.session.auth;
    if (!auth.username) { 
        result.fail('bad-username', '字母开头，可以包含数字下划线，长度6-16');
    }
    if (!auth.password) { 
        result.fail('bad-password', '数字字母下划线，长度6-16');
    }
    if (!auth.captcha) { 
        result.fail('bad-captcha', '验证码错误');
    }
    if (!result.failed()) {
        user.verify(auth.username, auth.password, function (err, ok) { 
            if (err) {
                if (err.message === 'no such user') {
                    result.failed('no-user', '用户不存在');
                } else { 
                    result.failed('internal-error', '验证时出现错误');
                }
            } else { 
                if (ok) {
                    if (login(sess, auth.username).success) {
                        sess.failedTry = 0;
                        result.success();
                    } else { 
                        // future feature
                    }
                } else { 
                    result.fail('wrong-password', '密码不正确');
                }
            }
            if (result.failed()) {
                sess.failedTry += 1;
            }
            res.json(result.data);
            res.end();
        });
        return;
    } else {
        sess.failedTry += 1;
    }
    res.json(result.data);
    res.end();
};

var tryLogout = function (req, res) {
    var result = initResult();
    var auth = basicCheck(req);
    var sess = req.session.auth;
    if (!sess.login) {
        result.failed('already-logout', '未登录');
    } else {
        var username = auth.username;
        if (!username) {
            result.fail('bad-username', '字母开头，可以包含数字下划线，长度6-16');
        } else {
            if (sess.login === username) {
                logout(sess);
                sess.failedTry = 0;
                result.success();
            } else {
                result.fail('bad-user', 'current user is ' + sess.login);
            }
        }
    }
    if (result.failed()) {
        sess.failedTry += 1;
    }
    res.json(result.data);
    res.end();
};

var register = function (req, res) {
    try {
        var result = initResult();
        var auth = basicCheck(req);
        if (!auth.username) {
            result.fail('bad-username', '字母开头，可以包含数字下划线，长度6-16');
        }
        if (!auth.password) {
            result.fail('bad-password', '数字字母下划线，长度6-16');
        }
        if (!auth.captcha) {
            result.fail('bad-captcha', '验证码错误');
        }
        if (!result.failed()) {
            user.addUser(auth.username, auth.password, function (err) {
                debug('!!!!adduser');
                if (!err) {
                    req.session.auth.failedTry = 0;
                    result.success();
                } else if (err.message === 'user exists') {
                    result.fail('user-exists', '该用户已存在');
                } else {
                    result.fail('internal-error', '添加用户时出现错误');
                }
                res.json(result.data);
                res.end();
            });
            return;
        } else {
            req.session.auth.failedTry += 1;
        }
    } catch (err) { 
        debug(err);
    }
    res.json(result.data);
    res.end();
};

module.exports = {
    init: checkSession,
    status: getStatus,
    captcha: getCaptcha,
    login: tryLogin,
    logout: tryLogout,
    register: register
}
