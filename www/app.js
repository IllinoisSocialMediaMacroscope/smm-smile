require('dotenv').config();
var express = require('express');

var path = require('path');
var multer = require('multer');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var lambdaRoutesTemplate = require(path.join(__dirname, 'scripts', 'helper_func', 'lambdaRoutesTemplate.js'));
var batchRoutesTemplate = require(path.join(__dirname, 'scripts', 'helper_func', 'batchRoutesTemplate.js'));
var LambdaHelper = require(path.join(__dirname, 'scripts', 'helper_func', 'lambdaHelper.js'));
var BatchHelper = require(path.join(__dirname, 'scripts', 'helper_func', 'batchHelper.js'));
var RabbitmqSender = require(path.join(__dirname, 'scripts', 'helper_func', 'rabbitmqSender.js'));
var S3Helper = require(path.join(__dirname, 'scripts', 'helper_func', 's3Helper.js'));
var fs = require('fs');
var app = express();

/**
 * read user name from environment file and set it global
 */
s3FolderName = process.env.USER || 'local';
smileHomePath = path.join(process.env.HOME, 'smile');

/**
 * determine which version of deployment: dockerized vs usual
 */
if (process.env.DOCKERIZED) {
    // determine credentials either from file or from environment variable
    AWS_ACCESSKEY = process.env.AWS_ACCESSKEY;
    AWS_ACCESSKEYSECRET = process.env.AWS_ACCESSKEYSECRET;
    TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
    REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
    REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
    FLICKR_CONSUMER_KEY = process.env.FLICKR_CONSUMER_KEY;
    FLICKR_CONSUMER_SECRET = process.env.FLICKR_CONSUMER_SECRET;
    BOX_CLIENT_ID = process.env.BOX_CLIENT_ID;
    BOX_CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
    DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
    DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
    GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    SMILE_GRAPHQL = "smile_graphql";
    BUCKET_NAME = process.env.BUCKET_NAME;

    // decide what handler to use
    lambdaHandler = new RabbitmqSender();
    batchHandler = new RabbitmqSender();
    s3 = new S3Helper(true, AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);
}
else{
    var config = require('./main_config.json');
    AWS_ACCESSKEY = config.aws.access_key;
    AWS_ACCESSKEYSECRET = config.aws.access_key_secret;
    TWITTER_CONSUMER_KEY = config.twitter.client_id;
    TWITTER_CONSUMER_SECRET = config.twitter.client_secret;
    REDDIT_CLIENT_ID = config.reddit.client_id;
    REDDIT_CLIENT_SECRET = config.reddit.client_secret;
    FLICKR_CONSUMER_KEY = config.flickr.consumer_key;
    FLICKR_CONSUMER_SECRET = config.flickr.consumer_secret;
    BOX_CLIENT_ID = config.box.client_id;
    BOX_CLIENT_SECRET = config.box.client_secret;
    DROPBOX_CLIENT_ID = config.dropbox.client_id;
    DROPBOX_CLIENT_SECRET = config.dropbox.client_secret;
    GOOGLE_CLIENT_ID = config.google.client_id;
    GOOGLE_CLIENT_SECRET = config.google.client_secret;
    SMILE_GRAPHQL = "localhost";
    BUCKET_NAME = 'macroscope-smile';

    lambdaHandler = new LambdaHelper(AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);
    batchHandler = new BatchHelper(AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);
    s3 = new S3Helper(false, AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);
}


// if smile home folder doesn't exist, create one
if (!fs.existsSync(smileHomePath)) {
    fs.mkdirSync(smileHomePath);
}
var upload = multer({dest:path.join(smileHomePath, 'uploads')})

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 1800}, // last half an hour?
    rolling: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

app.use('/', require('./routes/index.js'));

// config analytics routes
var analysesRoutesDir = path.join(__dirname, "routes", "analyses");
var analysesRoutesFiles = fs.readdirSync(analysesRoutesDir);
analysesRoutesFiles.forEach(function(route, i){
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "json"
        && fs.lstatSync(path.join(analysesRoutesDir, route)).isFile()){

        var routesConfig = require(path.join(analysesRoutesDir, route));

        if ("get" in routesConfig){
            app.get("/" + routesConfig.path, function(req, res){
                var formParam = routesConfig;
                res.render('analytics/formTemplate', {
                    DOCKERIZED:process.env.DOCKERIZED,
                    title: formParam.title,
                    introduction:formParam.introduction.join(" "),
                    wiki: formParam.wiki,
                    param: formParam,
                });
            });
        }

        if ("post" in routesConfig){
            app.post("/" + routesConfig.path, function(req, res){
                if (req.body.selectFile !== 'Please Select...') {
                    if (req.body.aws_identifier === 'lambda') {
                        lambdaRoutesTemplate(req, routesConfig, lambdaHandler).then(data => {
                            res.send(data);
                        })
                        .catch(err => {
                            res.send({ERROR: err});
                        });
                    }
                    else if (req.body.aws_identifier === 'batch') {
                        batchRoutesTemplate(req, routesConfig, batchHandler).then(data => {
                            res.send(data);
                        })
                        .catch(err => {
                            res.send({ERROR: err});
                        });
                    }
                }
                else {
                    res.end('no file selected!');
                }
            })
        }

        if ("put" in routesConfig){
            app.put("/" + routesConfig.path, upload.single("labeled"), function(req, res){
                s3.uploadToS3(req.file.path, s3FolderName + routesConfig['result_path'] + req.body.uid
                    + '/' + req.body.labeledFilename)
                .then(url => {
                    var remoteReadPath = s3FolderName + routesConfig['result_path'] + req.body.uid + '/';
                    fs.unlinkSync(req.file.path);
                    if (req.body.selectFile !== 'Please Select...') {
                        if (req.body.aws_identifier === 'lambda') {
                            lambdaRoutesTemplate(req, routesConfig, lambdaHandler).then(data => {
                                res.send(data);
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        }
                        else if (req.body.aws_identifier === 'batch') {
                            batchRoutesTemplate(req, routesConfig, batchHandler).then(data => {
                                res.send(data);
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        }
                    }
                    else {
                        res.end('no file selected!');
                    }
                }).catch(err => {
                    fs.unlinkSync(req.file.path);
                    res.send({ERROR: err});
                });
            });
        }
    }

});

// business logics endpoints
var busRoutesDir = path.join(__dirname, "routes", "businessLogic");
var busRoutesFiles = fs.readdirSync(busRoutesDir);
busRoutesFiles.forEach(function(route, i){
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "js"
        && fs.lstatSync(path.join(busRoutesDir, route)).isFile()){
        app.use('/', require('./routes/businessLogic/' + route));
    }
});

// seach endpoints
var searchRoutesDir = path.join(__dirname, "routes", "search");
var searchRoutesFiles = fs.readdirSync(searchRoutesDir);
searchRoutesFiles.forEach(function(route, i){
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "js"
        && fs.lstatSync(path.join(searchRoutesDir, route)).isFile()){
        app.use('/', require('./routes/search/' + route));
    }
});

// auth endpoints
var authRoutesDir = path.join(__dirname, "routes", "auth");
var authRoutesFiles = fs.readdirSync(authRoutesDir);
authRoutesFiles.forEach(function(route, i){
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "js"
        && fs.lstatSync(path.join(authRoutesDir, route)).isFile()){
        app.use('/', require('./routes/auth/' + route));
    }
});


/*--------------------set server----------------------*/
var debug = require('debug');
var port = normalizePort('8001');
app.set('port', port);
var server = http.createServer(app);
server.timeout = 1000 * 60 * 10; //10 minutes

server.listen(port);
console.log("App listening on \n\tlocalhost:" + port);
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

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
