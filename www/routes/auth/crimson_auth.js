var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var crypto = require('crypto');
var config = require('../../main_config');

router.post('/login/crimson', function(req,res,next){

    fetch("https://api.crimsonhexagon.com/api/authenticate?username="
        + req.body.crimson_username + "&password="
        + req.body.crimson_password).then(function(response){
            return response.json();
    }).then(function(json){
        if ('message' in json){
            res.cookie('crimson-success', 'false', {maxAge: 1000000000, httpOnly: false});
            res.cookie('crimson-later', 'false', {maxAge: 1000 * 60 * 29, httpOnly: false});
            res.send({redirect_url: req.body.currentURL + 'query?error=' + json.message})
        }else if ('auth' in json){
            req.session.crimson_access_token = json.auth;
            req.session.save();

            res.cookie('crimson-success', 'true', {maxAge: 1000 * 60 * 29, httpOnly: false});
            res.cookie('crimson-later', 'false', {maxAge: 1000 * 60 * 29, httpOnly: false});
            res.send({redirect_url: req.body.currentURL + 'query'});
        }
    })
});

module.exports = router;
