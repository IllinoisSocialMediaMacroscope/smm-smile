var googleAuth = require('google-auth-library');
var express = require('express');
var router = express.Router();

var clientId = GOOGLE_CLIENT_ID;
var clientSecret = GOOGLE_CLIENT_SECRET;
var redirectUrl = 'urn:ietf:wg:oauth:2.0:oob';
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

var redis = require('redis');
var client = redis.createClient();

router.get('/login/google', isLoggedIn, function (req, res, next) {

    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive']
    });

    res.redirect(authUrl);
});

router.post('/login/google', isLoggedIn, function (req, res, next) {

    oauth2Client.getToken(req.body.authorizeCode, function (err, token) {
        if (err) {
            res.send({'ERROR': err});
        } else {
            client.hset(req.user.username, 'google_access_token', token.access_token, redis.print);
            res.send({'data': 'success'});
        }
    });

});

module.exports = router;
