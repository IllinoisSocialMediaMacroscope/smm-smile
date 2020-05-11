var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');


router.post('/login/crimson', checkIfLoggedIn, function (req, res, next) {

    fetch("https://api.crimsonhexagon.com/api/authenticate?username="
        + req.body.crimson_username + "&password="
        + req.body.crimson_password).then(function (response) {
        return response.json();
    }).then(function (json) {
        if ('message' in json) {
            res.cookie('crimson-success', 'false', {maxAge: 1000000000, httpOnly: false});
            res.send({ERROR: JSON.stringify(json.message)})
        } else if ('auth' in json) {
            if (process.env.DOCKERIZED === 'true'){
                // save in redis
                redisClient.hset(req.user.username, 'crimson_access_token', json.auth, redis.print);
                redisClient.expire(req.user.username, 30 * 60);
            }
            else{
                // save in session
                req.session.crimson_access_token = json.auth;
                req.session.save();
                res.cookie('crimson-success', 'true', {maxAge: 1000 * 60 * 30, httpOnly: false});
            }

            res.send({});
        }
    })
});

module.exports = router;
