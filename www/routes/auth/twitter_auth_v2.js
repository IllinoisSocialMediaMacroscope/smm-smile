var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');


router.get('/login/twitterV2', checkIfLoggedIn, function(req,res,next){
    crypto.randomBytes(24, function(err, buffer) {
        var RANDOM_STRING = buffer.toString('hex');
        // store it in the redis for later comparison?
        setCredential(req, 'twt_v2_state', RANDOM_STRING);
        var url = new URL("https://twitter.com/i/oauth2/authorize"),
            params = {
                response_type: "code",
                client_id: TWITTER_V2_CLIENT_ID,
                redirect_uri: TWITTER_V2_CALLBACK_URL,
                scope: "tweet.read users.read offline.access",
                state: RANDOM_STRING,
                code_challenge: RANDOM_STRING,
                code_challenge_method: "plain"
            }
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        res.redirect(url);
    });
});

router.get('/login/twitterV2/callback', checkIfLoggedIn, async function (req, res, next) {
    var code = req.query.code;
    var state = req.query.state;

    // check if state matches
    var obj = await retrieveCredentials(req);
    if (state === obj['twt_v2_state']){
        // get access token
        var url = new URL("https://api.twitter.com/2/oauth2/token"), params = {
            grant_type: "authorization_code",
            code: code,
            redirect_uri: TWITTER_V2_CALLBACK_URL,
            code_verifier: obj['twt_v2_state']
        }
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        var base64encodedData = new Buffer.from(TWITTER_V2_CLIENT_ID + ':' + TWITTER_V2_CLIENT_SECRET).toString('base64');
        fetch(url.toString(), {
            method:'POST',
            headers:{
                'Authorization': 'Basic ' + base64encodedData,
                'Content-Type': "application/x-www-form-urlencoded",
                'user-agent': 'smm testing various things v0.1',
            },
        }).then(function(response){
            return response.json();
        }).then(function(json){
            if ('error' in json){
                res.send({ERROR: JSON.stringify(json)});
            }
            else{
                setCredential(req, 'twt_v2_access_token', json['access_token']);
                res.redirect("/query");
            }
        });
    }
    else{
        res.send({ERROR: "State does not match. Auth failed!"})
    }
});

module.exports = router;
