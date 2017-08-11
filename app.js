require('dotenv').config();
var express = require('express')
var path = require('path');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var favicon = require('express-favicon');
var app = express();

app.use(session({ secret: 'keyboard cat', 
                  resave: true, 
                  saveUninitialized: true,
				  cookie: { maxAge: 1000*1800 }, // last half an hour?
				  rolling: true
}));
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static(path.join(__dirname, '/public')));

app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/',require('./routes/index'));
app.use('/',require('./routes/networkx/networkx'));
app.use('/',require('./routes/scikit-learn/scikit-learn-cluster'));
app.use('/',require('./routes/NLP/NLP-preprocess')); 
app.use('/',require('./routes/NLP/NLP-SA'));
app.use('/',require('./routes/NLP/NLP-topic'));
app.use('/',require('./routes/query'));
app.use('/',require('./routes/download'));
app.use('/',require('./routes/render'));
app.use('/',require('./routes/email'));
app.use('/',require('./routes/history'));
app.use('/',require('./routes/auth/twitter_auth'));
app.use('/',require('./routes/auth/reddit_auth'));
app.use('/',require('./routes/auth/es_auth'));

/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/

/*--------------------set server----------------------*/
var debug = require('debug');
var port = normalizePort(process.env.PORT || '8080');
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
console.log("App listening on \n\tlocalhost:" + port)
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
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
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}