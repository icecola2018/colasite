var router = require('express').Router();
var auth = require('./index');

router.use(auth.init);

router.get('/auth/status', auth.status);

router.get('/auth/captcha', auth.captcha.get);
router.post('/auth/captcha', auth.captcha.verify);

router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.post('/auth/logout', auth.logout);

module.exports = router;
