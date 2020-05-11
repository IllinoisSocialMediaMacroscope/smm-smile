var express = require('express');
var router = express.Router();
var BoxSDK = require('box-node-sdk');


router.get('/login/box', checkIfLoggedIn, function (req, res, next) {
    setCredential(req, 'boxPageURL', req.query.pageURL);
    setCredential(req, 'boxCurrentURL', req.query.currentURL);

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

    retrieveCredentials(req).then(obj =>{
        if (req.query.error !== undefined) {
            res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?error=' + req.query.error);
        } else {
            box.getTokensAuthorizationCodeGrant(req.query.code, null,
                function (getTokensAuthorizationCodeGrantError, tokenInfo) {
                if (getTokensAuthorizationCodeGrantError) {
                    res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?error=' + getTokensAuthorizationCodeGrantError);
                } else {
                    setCredential(req, 'box_access_token', tokenInfo.accessToken);
                    res.redirect(obj['boxCurrentURL'] + obj['boxPageURL'] + '?box=success');
                }
            });
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR:retrieveCredentialsError});
    });
});

module.exports = router;
