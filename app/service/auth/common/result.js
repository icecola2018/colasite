var details = {
    'bad-username': '用户名只能以字母开头，可以包含数字和下划线，长度6-16',
    'bad-password': '密码只能包含数字，字母以及下划线，长度6-16',
    'need-captcha': '需要通过验证码验证',
    'default': '没有更多信息',
    'internal-error': '内部错误',
    // register
    'user-exists': '用户名已被占用',
    // login
    'no-user': '用户不存在',
    'wrong-password': '密码不正确',
    // logout
    'bad-user': '只能注销当前活动用户',
    'not-login': '当前尚未登录',
    // captcha
    'no-need': '当前不需要进行验证',
    'wrong-captcha': '错误的验证码'
};

module.exports = function () {
    return {
        data: {fail: {}},
        fail: function (msg) {
            this.data.fail[msg] = details[details[msg] ? msg : 'default'];
        },
        success: function () {
            delete this.data.fail;
            this.data.success = true;
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
