require('dotenv').config();
var express = require('express');

var path = require('path');
var multer = require('multer');
var http = require('http');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var lambda_routes_template = require(path.join(__dirname, 'scripts', 'helper_func', 'lambdaHelper.js')).lambda_routes_template;
var batch_routes_template = require(path.join(__dirname, 'scripts', 'helper_func', 'batchHelper.js')).batch_routes_template;
var uploadToS3 = require(path.join(__dirname, 'scripts', 'helper_func', 's3Helper.js')).uploadToS3;
var fs = require('fs');
var app = express();

/**
 * read user name from environment file and set it global
 */
s3FolderName = process.env.USER || 'local';
smileHomePath = path.join(process.env.HOME, 'smile');

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

// config analytics routes
var routesDir = path.join(__dirname, "routes", "analyses");
var routesFiles = fs.readdirSync(routesDir);
routesFiles.forEach(function(route, i){
    if (route.split(".")[0] !== ""
        && route.split(".")[1] === "json"
        && fs.lstatSync(path.join(routesDir, route)).isFile()){

        var routesConfig = require(path.join(routesDir, route));

        if ("get" in routesConfig){
            app.get("/" + routesConfig.path, function(req, res){
                var formParam = routesConfig;
                res.render('analytics/formTemplate', {title: formParam.title, param: formParam});
            });
        }

        if ("post" in routesConfig){
            app.post("/" + routesConfig.path, function(req, res){
                if (req.body.selectFile !== 'Please Select...') {
                    if (req.body.aws_identifier === 'lambda') {
                        lambda_routes_template(req, routesConfig).then(data => {
                            res.send(data);
                        })
                        .catch(err => {
                            res.send({ERROR: err});
                        });
                    }
                    else if (req.body.aws_identifier === 'batch') {
                        batch_routes_template(req, routesConfig).then(data => {
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
                uploadToS3(req.file.path, s3FolderName + routesConfig['result_path'] + req.body.uid
                    + '/' + req.body.labeledFilename)
                .then(url => {
                    var remoteReadPath = s3FolderName + routesConfig['result_path'] + req.body.uid + '/';
                    fs.unlinkSync(req.file.path);
                    if (req.body.selectFile !== 'Please Select...') {
                        if (req.body.aws_identifier === 'lambda') {
                            lambda_routes_template(req, routesConfig).then(data => {
                                res.send(data);
                            })
                            .catch(err => {
                                res.send({ERROR: err});
                            });
                        }
                        else if (req.body.aws_identifier === 'batch') {
                            batch_routes_template(req, routesConfig).then(data => {
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
app.use('/', require('./routes/index'));
app.use('/', require('./routes/businessLogic/download'));
app.use('/', require('./routes/businessLogic/render'));
app.use('/', require('./routes/businessLogic/tag'));
app.use('/', require('./routes/businessLogic/history'));
app.use('/', require('./routes/businessLogic/export'));
app.use('/', require('./routes/businessLogic/import'));
app.use('/', require('./routes/businessLogic/RedditExpand'));
app.use('/', require('./routes/businessLogic/imageCrawler'));
app.use('/', require('./routes/businessLogic/clowder.js'));
app.use('/', require('./routes/businessLogic/histogram.js'));

// seach endpoints
app.use('/', require('./routes/search/query'));
app.use('/', require('./routes/search/crimson'));

// auth endpoints
app.use('/', require('./routes/auth/twitter_auth'));
app.use('/', require('./routes/auth/googleDrive_auth'));
app.use('/', require('./routes/auth/dropbox_auth'));
app.use('/', require('./routes/auth/box_auth'));
app.use('/', require('./routes/auth/reddit_auth'));
app.use('/', require('./routes/auth/crimson_auth'));


/*--------------------set server----------------------*/
var debug = require('debug');
var port = normalizePort('8001');
app.set('port', port);
var server = http.createServer(app);
server.timeout = 1000 * 60 * 10; //10 minutes

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
