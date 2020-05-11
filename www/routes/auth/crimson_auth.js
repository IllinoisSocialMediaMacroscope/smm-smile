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
            res.send({ERROR: JSON.stringify(json.message)})
        }
        else if ('auth' in json) {
            setCredential(req, 'crimson_access_token', json.auth);
            res.send({});
        }
    })
});

module.exports = router;
