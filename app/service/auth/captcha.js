var captchapng = require('captchapng');
var initResult = require('./common/result');
var captchaUtils = require('./common/captcha');
var log = require('./common/log');
var sess = require('./common/session');
var debug = require('debug')('app:captcha');

var bkcolor = () => parseInt(Math.random() * 40);
var ftcolor = () => parseInt(Math.random() * 130 + 120);
var getCaptcha = function (req, res) {
    var captcha = sess.auth(req).captcha;
    if (captcha.pass) {
        debug('pass');
        var result = initResult();
        result.fail('no-need');
        res.json(result.data);
    } else {
        var number = captchaUtils.newNumber(captcha);
        debug('get ' + number);

        var p = new captchapng(100, 30, number);
        p.color(bkcolor(), bkcolor(), bkcolor(), 255);
        p.color(ftcolor(), ftcolor(), ftcolor(), 255);

        var imgbase64 = new Buffer(p.getBase64(), 'base64');
        res.type('png');
        res.send(imgbase64);
    }
};

var verifyCaptcha = function (req, res) {
    var captcha = sess.auth(req).captcha;
    debug(req.body.captcha + '->' + captcha.number);
    var result = initResult();
    if (captcha.pass) {
        result.fail('no-need');
    } else if (captchaUtils.pass(captcha, req.body.captcha)) {
        log.passCaptcha(sess.auth(req));
        result.success();
    } else {
        result.fail('wrong-captcha');
    }
    res.json(result.data);
}


module.exports = {
    get: getCaptcha,
    verify: verifyCaptcha
}
