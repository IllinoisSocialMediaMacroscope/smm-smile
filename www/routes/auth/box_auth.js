var express = require('express');
var router = express.Router();
var BoxSDK = require('box-node-sdk');


router.get('/login/box', checkIfLoggedIn, function (req, res, next) {
    if (process.env.DOCKERIZED === 'true'){
        // save in redis
        redisClient.hset(req.user.username, 'boxPageURL', req.query.pageURL, redis.print);
        redisClient.hset(req.user.username, 'boxCurrentURL', req.query.currentURL, redis.print);
        redisClient.expire(req.user.username, 30 * 60);
    }
    else{
        req.session.pageURL = req.query.pageURL;
        req.session.currentURL = req.query.currentURL;
        req.session.save();
    }

    var authUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=`
        + BOX_CLIENT_ID
        + `&redirect_uri=https://socialmediamacroscope.org:8000` + req.query.currentURL + `login/box/callback`;
    // +`&redirect_uri=http://localhost:8001` + req.query.currentURL +`login/box/callback`;

    res.redirect(authUrl);
});

router.get('/login/box/callback', checkIfLoggedIn, function (req, res, next) {
    var box = new BoxSDK({
        clientID: BOX_CLIENT_ID,
        clientSecret: BOX_CLIENT_SECRET
    });

    if (process.env.DOCKERIZED === 'true') {
        // save in redis
        redisClient.hgetall(req.user.username, function (err, obj) {
            if (req.query.error !== undefined) {
                res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?error=' + req.query.error);
            } else {
                box.getTokensAuthorizationCodeGrant(req.query.code, null, function (err, tokenInfo) {
                    if (err) {
                        res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?error=' + err);
                    } else {
                        redisClient.hset(req.user.username, 'box_access_token', tokenInfo.accessToken, redis.print);
                        redisClient.expire(req.user.username, 30 * 60);
                        res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?box=success');
                    }
                });
            }
        });
    }
    else{
        // save in session
        if (req.query.error !== undefined){
            res.redirect(req.session.currentURL + req.session.pageURL + '?error=' + req.query.error);
        }else{
            box.getTokensAuthorizationCodeGrant(req.query.code, null, function(err, tokenInfo) {
                if (err){
                    res.redirect(req.session.currentURL + req.session.pageURL + '?error=' + err);
                }else{
                    req.session.box_access_token = tokenInfo.accessToken;
                    req.session.save();
                    res.redirect(req.session.currentURL + req.session.pageURL + '?box=success');
                }
            });
        }
    }
});

module.exports = router;
