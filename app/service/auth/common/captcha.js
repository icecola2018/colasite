var generate = function (dg) {
    var number = 0;
    while (dg--) {
        number = number * 10 + parseInt(Math.random() * 9) + 1;
    }
    return number;
};

var reset = function (captcha) {
    captcha.number = 0;
    captcha.pass = false;
};

var newNumber = function (captcha) {
    captcha.number = generate(parseInt(Math.random() * 2) + 4);
    captcha.pass = false;
    return captcha.number;
};

var pass = function (captcha, number) {
    if (captcha.number === parseInt(Number(number))) {
        captcha.pass = true;
        captcha.passDate = (new Date()).getTime();
        return true;
    } else {
        reset();
        return false;
    }
};

module.exports = {
    reset: reset,
    newNumber: newNumber,
    pass: pass
};
