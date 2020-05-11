var express = require('express');
var router = express.Router();


router.get('/query-crimson', checkIfLoggedIn, function (req, res, next) {
    retrieveCredentials(req).then(obj => {
        if (obj && obj['crimson_access_token'] !== undefined) {
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
                removeCredential(req, 'crimson_access_token');
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.redirect('/query?error=You cannot access crimson hexagon if not providing your credentials!')
        }
    })
    .catch( err =>{
        res.send({'ERROR': err});
    });
});

module.exports = router;
