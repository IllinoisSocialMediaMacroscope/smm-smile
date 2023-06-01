var express = require('express');
var router = express.Router();

router.post('/check-clowder-login', checkIfLoggedIn, async function(req, res, next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        res.send('Logged in!');
    }
    else {
        removeCredential(req, 'clowder_username');
        removeCredential(req, 'clowder_password');
        res.send('Not logged in!');
    }
});

router.post('/clowder-login', checkIfLoggedIn, function(req,res,next){
	if (req.body.clowder_username !== undefined && req.body.clowder_password !== undefined){
        setCredential(req, 'clowder_username', req.body.clowder_username);
        setCredential(req, 'clowder_password', req.body.clowder_password);
		res.send({success:'succesfully provided username and password information!'});
	}else{
        removeCredential(req, 'clowder_username');
        removeCredential(req, 'clowder_password');
		res.send({ERROR:'username and password incomplete!'});
	}

});

router.post('/list-dataset', checkIfLoggedIn, async function(req, res, next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        // invoke CLowder lambda function
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'item': 'dataset'
        };

        lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
            if (results['data'].indexOf('error') !== -1) {
                removeCredential(req, 'clowder_username');
                removeCredential(req, 'clowder_password');
                res.send({'ERROR': results['info']});
            } else {
                res.send(results['data']);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    } else {
        res.send({ERROR: 'list datset: Your login session has expired. Please login again!'});
    }
});

router.post('/list-collection', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        // invoke CLowder lambda function
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'item': 'collection'
        };
        lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
            if (results['data'].indexOf('error') !== -1) {
                removeCredential(req, 'clowder_username');
                removeCredential(req, 'clowder_password');
                res.send({'ERROR': results['info']});
            } else {
                res.send(results['data']);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'list collection: Your login session has expired. Please login again!'});
    }
});

router.post('/list-space', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        // invoke CLowder lambda function
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'item': 'space'
        };
        lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
            if (results['data'].indexOf('error') !== -1) {
                removeCredential(req, 'clowder_username');
                removeCredential(req, 'clowder_password');
                res.send({'ERROR': results['info']});
            } else {
                res.send(results['data']);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'list space: Your login session has expired. Please login again!'});
    }
});

router.post('/list-user', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        // invoke CLowder lambda function
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'item': 'user'
        };
        lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
            if (results['data'].indexOf('error') !== -1) {
                removeCredential(req, 'clowder_username');
                removeCredential(req, 'clowder_password');
                res.send({'ERROR': results['info']});
            } else {
                res.send(results['data']);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'list user: Your login session has expired. Please login again!'});
    }
});

router.post('/clowder-dataset', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        // invoke CLowder lambda function
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'payload': req.body
        };
        lambdaHandler.invoke('lambda_invoke_clowder', 'lambda_invoke_clowder', args).then(results => {

            if (results['id'] === 'null') {
                res.send({'ERROR': 'Creating new dataset failed!'});
            } else {
                res.send(results);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'create dataset: Your login session has expired. Please login again!'});
    }
});

router.post('/clowder-collection', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
   if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'payload': req.body
        };
        lambdaHandler.invoke('clowder_create_collection', 'clowder_create_collection', args).then(results => {
            if (results['id'] === 'null') {
                res.send({'ERROR': 'Creating new collection failed!'});
            } else {
                res.send(results);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'create collection: Your login session has expired. Please login again!'});
    }

});

router.post('/clowder-space', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'payload': req.body
        };
        lambdaHandler.invoke('clowder_create_space', 'clowder_create_space', args).then(results => {
            if (results['id'] === 'null') {
                res.send({'ERROR': 'Creating new space failed!'});
            } else {
                res.send(results);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'create space: Your login session has expired. Please login again!'});
    }
});

router.post('/clowder-files', checkIfLoggedIn, async function(req,res,next){
    var obj = await retrieveCredentials(req);
    if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
        var args = {
            'username': obj['clowder_username'],
            'password': obj['clowder_password'],
            'payload': req.body
        };
        lambdaHandler.invoke('lambda_upload_clowder', 'lambda_upload_clowder', args).then(results => {
            if (results['ids'].length === 0) {
                res.send({'ERROR': 'Uploading files to dataset failed. ERROR:' + results['info']});
            } else {
                res.send(results);
            }

        }).catch(lambdaHandlerError => {
            res.send({'ERROR': JSON.stringify(lambdaHandlerError)});
        });
    }
    else {
        res.send({ERROR: 'upload files: Your login session has expired. Please login again!'});
    }
});

module.exports = router;
