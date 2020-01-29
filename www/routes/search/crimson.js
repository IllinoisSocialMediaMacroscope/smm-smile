var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));

router.get('/query-crimson',function(req,res,next){

    if (req.session.crimson_access_token === undefined){
        res.redirect('/query?error=You cannot access crimson hexagon if not providing your credentials!')
    }
    else {

        lambdaHandler.invoke('crimson_hexagon_monitors','crimson_hexagon_monitors',
            {"crimson_access_token": req.session.crimson_access_token}).then(results => {
                if (results['monitor_list'] === 'null') {
                    res.send({'ERROR': results['info']});
                } else {
                    results['DOCKERIZED'] = process.env.DOCKERIZED;
                    res.render('search/crimson/crimson', results);
                }
        }).catch(error => {
            console.log(error);
            res.send({'ERROR': JSON.stringify(error)});
        });
    }

});

module.exports = router;
