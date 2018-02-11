var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);

var app = express();
app.use(logger('dev'));

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/static', express.static(path.join(__dirname, 'public')));

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


var auth = require('./auth/router');
app.use(auth);


// 404 Not Found
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('Error: ' + (err.status || 500));
});

module.exports = app;