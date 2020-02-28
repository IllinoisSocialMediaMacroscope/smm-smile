var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));


router.get('/query-crimson', isLoggedIn, function (req, res, next) {
    redisClient.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({'ERROR': err});
        }
        else if (obj && obj['crimson_access_token'] !== undefined) {
            lambdaHandler.invoke('crimson_hexagon_monitors', 'crimson_hexagon_monitors',
                {"crimson_access_token": obj['crimson_access_token']}).then(results => {
                if (results['monitor_list'] === 'null') {
                    res.send({'ERROR': results['info']});
                } else {
                    results['DOCKERIZED'] = process.env.DOCKERIZED === 'true';
                    results['user'] = req.user;
                    res.render('search/crimson/crimson',
                        results);
                }
            }).catch(error => {
                redisClient.hdel(req.user.username, 'crimson_access_token');
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.redirect('/query?error=You cannot access crimson hexagon if not providing your credentials!')
        }
    });
});

module.exports = router;
