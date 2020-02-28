var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));


router.post('/login/crimson', isLoggedIn, function(req, res, next){

    fetch("https://api.crimsonhexagon.com/api/authenticate?username="
        + req.body.crimson_username + "&password="
        + req.body.crimson_password).then(function(response){
            return response.json();
    }).then(function(json){
        if ('message' in json){
            res.send({ERROR: JSON.stringify(json.message)})
        }else if ('auth' in json){
            redisClient.hset(req.user.username, 'crimson_access_token', json.auth, redis.print);
            redisClient.expire(req.user.username, 30 * 60);
            res.send({});
        }
    })
});

module.exports = router;
