require('dotenv').config();
var express = require('express');

var path = require('path');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
const passport = require('passport');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const redis = require('redis');
const fetch = require('node-fetch');

var lambdaRoutesTemplate = require(path.join(__dirname, 'scripts', 'helper_func', 'lambdaRoutesTemplate.js'));
var batchRoutesTemplate = require(path.join(__dirname, 'scripts', 'helper_func', 'batchRoutesTemplate.js'));
var LambdaHelper = require(path.join(__dirname, 'scripts', 'helper_func', 'lambdaHelper.js'));
var BatchHelper = require(path.join(__dirname, 'scripts', 'helper_func', 'batchHelper.js'));
var RabbitmqSender = require(path.join(__dirname, 'scripts', 'helper_func', 'rabbitmqSender.js'));
var S3Helper = require(path.join(__dirname, 'scripts', 'helper_func', 's3Helper.js'));
var fs = require('fs');
var app = express();

/**
 * default path from environment file and set it global; maybe not be used
 */
smileHomePath = path.join(process.env.HOME, 'smile');
s3FolderName = process.env.USER || 'local';
SINGLE_USER = 'true';
email = true;

/**
 * determine which version of deployment: dockerized vs usual
 */
if (process.env.DOCKERIZED === 'true') {
    // determine credentials either from file or from environment variable
    REDIS_URL = process.env.REDIS_URL;
    RABBITMQ_URL = process.env.RABBITMQ_URL;
    SMILE_GRAPHQL_URL = process.env.SMILE_GRAPHQL_URL;
    AWS_ACCESSKEY = process.env.AWS_ACCESSKEY;
    AWS_ACCESSKEYSECRET = process.env.AWS_ACCESSKEYSECRET;
    TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
    TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
    REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
    REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
    REDDIT_CALLBACK_URL = process.env.REDDIT_CALLBACK_URL;
    FLICKR_CONSUMER_KEY = process.env.FLICKR_CONSUMER_KEY;
    FLICKR_CONSUMER_SECRET = process.env.FLICKR_CONSUMER_SECRET;
    BOX_CLIENT_ID = process.env.BOX_CLIENT_ID;
    BOX_CLIENT_SECRET = process.env.BOX_CLIENT_SECRET;
    DROPBOX_CLIENT_ID = process.env.DROPBOX_CLIENT_ID;
    DROPBOX_CLIENT_SECRET = process.env.DROPBOX_CLIENT_SECRET;
    GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    BUCKET_NAME = process.env.BUCKET_NAME;
    SINGLE_USER = process.env.SINGLE_USER;
    if (process.env.EMAIL_HOST === "" || process.env.EMAIL_HOST === undefined || process.env.EMAIL_HOST === null ||
        process.env.EMAIL_PORT === "" || process.env.EMAIL_PORT === undefined || process.env.EMAIL_PORT === null ||
        process.env.EMAIL_FROM_ADDRESS === "" || process.env.EMAIL_FROM_ADDRESS === undefined || process.env.EMAIL_FROM_ADDRESS === null ||
        process.env.EMAIL_PASSWORD === "" || process.env.EMAIL_PASSWORD === undefined || process.env.EMAIL_PASSWORD === null) {
        email = false;
    }

    // decide what handler to use
    lambdaHandler = new RabbitmqSender();
    batchHandler = new RabbitmqSender();
    s3 = new S3Helper(true, AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);

    if (SINGLE_USER === 'true') {
        global.checkIfLoggedIn = function (req, res, next) {
            req.user = {email: s3FolderName};
            return next();
        }

        global.retrieveCredentials = async function (req) {
            return new Promise((resolve, reject) => {
                if (req.session) resolve(req.session);
                else reject("There is no credential exists in the session!");
            });
        }

        global.removeCredential = async function (req, entry) {
            req.session[entry] = null;
            req.session.save();
        }

        global.setCredential = async function (req, entry, credential) {
            req.session[entry] = credential;
            req.session.save();
        };
    } else {
        // authenticate use CILogon
        passport.use(new OAuth2Strategy({
                state: true,
                authorizationURL: 'https://cilogon.org/authorize',
                tokenURL: 'https://cilogon.org/oauth2/token',
                clientID: process.env.CILOGON_CLIENT_ID,
                clientSecret: process.env.CILOGON_CLIENT_SECRET,
                callbackURL: process.env.CILOGON_CALLBACK_URL,
            }, (accessToken, refreshToken, profile, cb) => {
            fetch('https://cilogon.org/oauth2/userinfo?access_token=' + accessToken)
                .then(function (response) {
                    return response.json();
                })
                .then(function (json) {
                    process.nextTick(() => cb(null, json));
                })
            })
        );

        passport.serializeUser((user, done) => {
            done(null, user);
        });

        passport.deserializeUser(async (user, done) => {
            done(null, user);
        });

        // configure redisClient
        (async () => {
            redisClient = redis.createClient({url:REDIS_URL});
            redisClient.on('error', (err) => console.log('Redis Client Error', err));
            await redisClient.connect();
        })();

        global.checkIfLoggedIn = function (req, res, next) {
            if (req.isAuthenticated() || req.user != null) {
                return next();
            }
            res.redirect("/smile-login");
        }

        global.retrieveCredentials = async function (req) {
            return await redisClient.hGetAll(req.user.email);
        }

        global.removeCredential = async function (req, entry) {
            await redisClient.hDel(req.user.email, entry);
        }

        global.setCredential = async function (req, entry, credential) {
            await redisClient.hSet(req.user.email, entry, credential, redis.print);
            await redisClient.expire(req.user.email, 30 * 60);
        };
    }

} else {
    var config = require('./main_config.json');
    AWS_ACCESSKEY = config.aws.access_key;
    AWS_ACCESSKEYSECRET = config.aws.access_key_secret;
    TWITTER_CONSUMER_KEY = config.twitter.client_id;
    TWITTER_CONSUMER_SECRET = config.twitter.client_secret;
    REDDIT_CLIENT_ID = config.reddit.client_id;
    REDDIT_CLIENT_SECRET = config.reddit.client_secret;
    REDDIT_CALLBACK_URL = config.reddit.callback_url;
    FLICKR_CONSUMER_KEY = config.flickr.consumer_key;
    FLICKR_CONSUMER_SECRET = config.flickr.consumer_secret;
    BOX_CLIENT_ID = config.box.client_id;
    BOX_CLIENT_SECRET = config.box.client_secret;
    DROPBOX_CLIENT_ID = config.dropbox.client_id;
    DROPBOX_CLIENT_SECRET = config.dropbox.client_secret;
    GOOGLE_CLIENT_ID = config.google.client_id;
    GOOGLE_CLIENT_SECRET = config.google.client_secret;
    SMILE_GRAPHQL_URL = "localhost";
    BUCKET_NAME = 'macroscope-smile';
    SINGLE_USER = true;

    lambdaHandler = new LambdaHelper(AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);
    batchHandler = new BatchHelper(AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);
    s3 = new S3Helper(false, AWS_ACCESSKEY, AWS_ACCESSKEYSECRET);

    // backward compatibility; do not need multiuser capacity if deploying on macroscope
    global.checkIfLoggedIn = function (req, res, next) {
        req.user = {email: s3FolderName};
        return next();
    }

    global.retrieveCredentials = async function (req) {
        return new Promise((resolve, reject) => {
            if (req.session) resolve(req.session);
            else reject({error: "There is no credential exists in the session!"});
        });
    }

    global.removeCredential = async function (req, entry) {
        req.session[entry] = null;
        req.session.save();
    }

    global.setCredential = async function (req, entry, credential) {
        req.session[entry] = credential;
        req.session.save();
    };
}

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: {maxAge: 1000 * 30 * 60}, // last half an hour?
    rolling: true
}));
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use('/', require('./routes/index.js'));

// config analytics routes
var analysesRoutesDir = path.join(__dirname, "routes", "analyses");
var analysesRoutesFiles = fs.readdirSync(analysesRoutesDir);
analysesRoutesFiles.forEach(function (route, i) {
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "json"
        && fs.lstatSync(path.join(analysesRoutesDir, route)).isFile()) {

        var routesConfig = require(path.join(analysesRoutesDir, route));

        if ("get" in routesConfig) {
            app.get("/" + routesConfig.path, checkIfLoggedIn, function (req, res) {
                var formParam = routesConfig;
                res.render('analytics/formTemplate', {
                    DOCKERIZED: process.env.DOCKERIZED === 'true',
                    title: formParam.title,
                    introduction: formParam.introduction.join(" "),
                    wiki: formParam.wiki,
                    param: formParam,
                    user: req.user,
                    enableEmail: email
                });
            });
        }

        if ("post" in routesConfig) {
            app.post("/" + routesConfig.path, checkIfLoggedIn, function (req, res) {
                if (req.body.selectFile !== 'Please Select...') {
                    if (req.body.aws_identifier === 'lambda') {
                        lambdaRoutesTemplate(req, routesConfig, lambdaHandler).then(data => {
                            res.send(data);
                        })
                        .catch(err => {
                            res.send({ERROR: err});
                        });
                    } else if (req.body.aws_identifier === 'batch') {
                        batchRoutesTemplate(req, routesConfig, batchHandler).then(data => {
                            res.send(data);
                        })
                        .catch(err => {
                            res.send({ERROR: err});
                        });
                    }
                } else {
                    res.end('no file selected!');
                }
            })
        }

        if ("put" in routesConfig) {

            // define an upload location
            if (!fs.existsSync(smileHomePath)) {
                fs.mkdirSync(smileHomePath);
            }
            var multer = require('multer');
            var upload = multer({dest: path.join(smileHomePath, 'uploads')});

            app.put("/" + routesConfig.path, checkIfLoggedIn, upload.single("labeled"), function (req, res) {
                s3.uploadToS3(req.file.path, req.user.email + routesConfig['result_path'] + req.body.uid
                    + '/' + req.body.labeledFilename)
                .then(url => {
                    var remoteReadPath = req.user.email + routesConfig['result_path'] + req.body.uid + '/';
                    fs.unlinkSync(req.file.path);
                    if (req.body.selectFile !== 'Please Select...') {
                        if (req.body.aws_identifier === 'lambda') {
                            lambdaRoutesTemplate(req, routesConfig, lambdaHandler).then(data => {
                                res.send(data);
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        } else if (req.body.aws_identifier === 'batch') {
                            batchRoutesTemplate(req, routesConfig, batchHandler).then(data => {
                                res.send(data);
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        }
                    } else {
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
busRoutesFiles.forEach(function (route, i) {
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "js"
        && fs.lstatSync(path.join(busRoutesDir, route)).isFile()) {
        app.use('/', require('./routes/businessLogic/' + route));
    }
});

// seach endpoints
var searchRoutesDir = path.join(__dirname, "routes", "search");
var searchRoutesFiles = fs.readdirSync(searchRoutesDir);
searchRoutesFiles.forEach(function (route, i) {
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "js"
        && fs.lstatSync(path.join(searchRoutesDir, route)).isFile()) {
        app.use('/', require('./routes/search/' + route));
    }
});

// platform auth endpoints
var authRoutesDir = path.join(__dirname, "routes", "auth");
var authRoutesFiles = fs.readdirSync(authRoutesDir);
authRoutesFiles.forEach(function (route, i) {
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "js"
        && fs.lstatSync(path.join(authRoutesDir, route)).isFile()) {
        app.use('/', require('./routes/auth/' + route));
    }
});

app.get('/smile-login', passport.authenticate('oauth2', {
    scope: ['openid', 'email', 'profile']
}));

app.get('/smile-login/callback', function (req, res, next) {
    passport.authenticate('oauth2', {failureRedirect: '/smile-login'}, function (err, user, info) {
        if (err) { return res.send({ERROR: "fail to login!"}); }
        if (!user) { return res.send({ERROR: "fail to login!"}); }
        req.logIn(user, function (err) {
            if (err) { return res.send({ERROR: "fail to login!"}); }
            res.redirect('/');
        });
    })(req, res, next);
});

app.get('/smile-logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

/*--------------------set server----------------------*/
var debug = require('debug');
var port = normalizePort('8001');
app.set('port', port);
var server = http.createServer(app);
server.timeout = 1000 * 60 * 10; //10 minutes

server.listen(port);
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
