var express = require('express');
var router = express.Router();

router.post('/check-clowder-login', checkIfLoggedIn, function(req, res, next){
    retrieveCredentials(req).then(obj =>{
        if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            res.send('Logged in!');
        }
        else {
            removeCredential(req, 'clowder_username');
            removeCredential(req, 'clowder_password');
            res.send('Not logged in!');
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
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

router.post('/list-dataset', checkIfLoggedIn, function(req, res, next){
    retrieveCredentials(req).then(obj =>{
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/list-collection', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj =>{
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/list-space', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj =>{
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/list-user', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj =>{
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/clowder-dataset', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj =>{
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/clowder-collection', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj =>{
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/clowder-space', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj =>{
        if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
        else {
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
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

router.post('/clowder-files', checkIfLoggedIn, function(req,res,next){
    retrieveCredentials(req).then(obj => {
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
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    })
    .catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

module.exports = router;
