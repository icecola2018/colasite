var app = require('../app');
var debug = require('debug')('app:server');
var http = require('http');
var path = require("path");

var port = parseInt(process.env.PORT, 10);
port = (isNaN(port) ? port : (port >= 0 ? port : false)) || '8080';

var server = http.createServer(app);
server.listen(port);

server.on('error', function(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
    case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
    case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
    default:
        throw error;
    }
});

server.on('listening', function () {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    if (process.env.DEBUG) {
        debug('Press ENTER to exit.');
        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', () => {
            const chunk = process.stdin.read();
            if (chunk !== null) {
                process.exit(0);
            }
        });
    }
});


