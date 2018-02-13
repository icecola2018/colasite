var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var debug = require('debug')('app:main')
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var app = express();
app.use(logger('dev'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use('/static', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var sess = {
    name: 'cola152d7524-f946-469a-a52f-8f4494fcab56',
    secret: 'c2e9c31e-cab4-4900-bf23-3e0c496dd3d2',
    cookie: {
        maxAge: 1000*60*60*24*7
    },
    resave: false,
    rolling: true,
    saveUninitialized: true,
    store: new FileStore(),
    unset: 'destroy'
};
if (!process.env['DEBUG']) {
    app.set('trust proxy', 1) // trust first proxy
    sess.cookie.secure = true // serve secure cookies
}
app.use(session(sess));

var auth = require('./service/auth/router');
app.use(auth);


app.use(function (req, res, next) {
    res.sendFile('./html/index.html', {}, function (err) {
        if (err) {
            debug(err)
            debug('- Failed to send index.html');
            next(err);
        }
    });
});

/*
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});
*/

app.use(function (err, req, res, next) {
    debug(err);
    res.sendStatus(err.status || 500);
});

module.exports = app;