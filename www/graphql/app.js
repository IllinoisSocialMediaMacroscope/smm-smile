var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var graphqlHTTP = require('express-graphql');
var schema = require('./data/schema/schema.js')
//var loaders = require('./API/loader')
const cors = require('cors');

var app = express();

/**
 * determine which version of deployment: dockerized vs usual
 */
if (process.env.DOCKERIZED==='true') {
    TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
    FLICKR_CONSUMER_KEY = process.env.FLICKR_CONSUMER_KEY;
    FLICKR_CONSUMER_SECRET = process.env.FLICKR_CONSUMER_SECRET;
}
else{
    var config = require('./graphql_config.json');
    TWITTER_CONSUMER_KEY = config.twitter.client_id;
    TWITTER_CONSUMER_SECRET = config.twitter.client_secret;
    FLICKR_CONSUMER_KEY = config.flickr.consumer_key;
    FLICKR_CONSUMER_SECRET = config.flickr.consumer_secret;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/graphql', cors(), graphqlHTTP((req) => ({
  schema:schema,
  graphiql: true,
  context:req.headers
})));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = {
  app
};


