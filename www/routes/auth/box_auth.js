var express = require('express');
var router = express.Router();
var BoxSDK = require('box-node-sdk');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

var redis = require('redis');
var client = redis.createClient();

router.get('/login/box', isLoggedIn, function (req, res, next) {

    client.hset(req.user.username, 'boxPageURL', req.query.pageURL, redis.print);
    client.hset(req.user.username, 'boxCurrentURL', req.query.currentURL, redis.print);
    client.expire(req.user.username, 30 * 60);

    var authUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=`
        + BOX_CLIENT_ID
        + `&redirect_uri=https://socialmediamacroscope.org:8000` + req.query.currentURL + `login/box/callback`;
    // +`&redirect_uri=http://localhost:8001` + req.query.currentURL +`login/box/callback`;

    res.redirect(authUrl);
});

router.get('/login/box/callback', isLoggedIn, function (req, res, next) {

    client.hgetall(req.user.username, function (err, obj) {
        var box = new BoxSDK({
            clientID: BOX_CLIENT_ID,
            clientSecret: BOX_CLIENT_SECRET
        });

        if (req.query.error !== undefined) {
            res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?error=' + req.query.error);
        } else {
            box.getTokensAuthorizationCodeGrant(req.query.code, null, function (err, tokenInfo) {
                if (err) {
                    res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?error=' + err);
                } else {
                    client.hset(req.user.username, 'box_access_token', tokenInfo.accessToken, redis.print);
                    client.expire(req.user.username, 30 * 60);
                    res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?box=success');
                }
            });
        }
    });
});

module.exports = router;
