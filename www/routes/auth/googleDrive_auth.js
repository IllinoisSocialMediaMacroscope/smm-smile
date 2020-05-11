var googleAuth = require('google-auth-library');
var express = require('express');
var router = express.Router();

var clientId = GOOGLE_CLIENT_ID;
var clientSecret = GOOGLE_CLIENT_SECRET;
var redirectUrl = 'urn:ietf:wg:oauth:2.0:oob';
var auth = new googleAuth();
var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

router.get('/login/google', checkIfLoggedIn, function (req, res, next) {

    var authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive']
    });

    res.redirect(authUrl);
});

router.post('/login/google', checkIfLoggedIn, function (req, res, next) {

    oauth2Client.getToken(req.body.authorizeCode, function (err, token) {
        if (err) {
            res.send({'ERROR': err});
        } else {
            if (process.env.DOCKERIZED === 'true') {
                // save in redis
                redisClient.hset(req.user.username, 'google_access_token', token.access_token, redis.print);
                redisClient.expire(req.user.username, 30 * 60);
            }
            else{
                // save in local session
                req.session.google_access_token = token.access_token;
                req.session.save();
            }
            res.send({'data': 'success'});
        }
    });

});

module.exports = router;
