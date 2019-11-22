var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js')).lambda_invoke;

router.get('/query-crimson',function(req,res,next){

    if (req.session.crimson_access_token === undefined){
        res.redirect('/query?error=You cannot access crimson hexagon if not providing your credentials!')
    }
    else {
        lambda_invoke('crimson_hexagon_monitors',
            {"crimson_access_token": req.session.crimson_access_token}).then(results => {
                if (results['monitor_list'] === 'null') {
                    res.send({'ERROR': results['info']});
                } else {
                    res.render('search/crimson/crimson', results);
                }
        }).catch(error => {
            console.log(error);
            res.send({'ERROR': JSON.stringify(error)});
        });
    }

});

module.exports = router;
