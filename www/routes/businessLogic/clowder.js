var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

var redis = require('redis');
var client = redis.createClient();

router.post('/check-clowder-login', isLoggedIn, function(req, res, next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            res.send('Logged in!');
        }
        else {
            client.hdel(req.user.username, 'clowder_username');
            client.hdel(req.user.username, 'clowder_password');
            res.send('Not logged in!');
        }
    });
});

router.post('/clowder-login', isLoggedIn, function(req,res,next){
	if (req.body.clowder_username !== undefined && req.body.clowder_password !== undefined){
        client.hset(req.user.username, 'clowder_username', req.body.clowder_username, redis.print);
        client.hset(req.user.username, 'clowder_password', req.body.clowder_password, redis.print);
        client.expire(req.user.username, 30 * 60);
		res.send({success:'succesfully provided username and password information!'});
	}else{
        client.hdel(req.user.username, 'clowder_username');
        client.hdel(req.user.username, 'clowder_password');
		res.send({ERROR:'username and password incomplete!'});
	}

});

router.post('/list-dataset', isLoggedIn, function(req, res, next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR: err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            // invoke CLowder lambda function
            var args = {
                'username': obj['clowder_username'],
                'password': obj['clowder_password'],
                'item': 'dataset'
            };

            lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
                if (results['data'].indexOf('error') !== -1) {
                    client.hdel(req.user.username, 'clowder_username');
                    client.hdel(req.user.username, 'clowder_password');
					res.send({'ERROR': results['info']});
                } else {
                    res.send(results['data']);
                }

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        } else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

router.post('/list-collection', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            // invoke CLowder lambda function
            var args = {
                'username': obj['clowder_username'],
                'password': obj['clowder_password'],
                'item': 'collection'
            };
            lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
                if (results['data'].indexOf('error') !== -1) {
                    client.hdel(req.user.username, 'clowder_username');
                    client.hdel(req.user.username, 'clowder_password');
                    res.send({'ERROR': results['info']});
                } else {
                    res.send(results['data']);
                }

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

router.post('/list-space', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR: err});
        }
        if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            // invoke CLowder lambda function
            var args = {
                'username': obj['clowder_username'],
                'password': obj['clowder_password'],
                'item': 'space'
            };
            lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
                if (results['data'].indexOf('error') !== -1) {
                    client.hdel(req.user.username, 'clowder_username');
                    client.hdel(req.user.username, 'clowder_password');
                    res.send({'ERROR': results['info']});
                } else {
                    res.send(results['data']);
                }

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

router.post('/list-user', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            // invoke CLowder lambda function
            var args = {
                'username': obj['clowder_username'],
                'password': obj['clowder_password'],
                'item': 'user'
            };
            lambdaHandler.invoke('lambda_list_clowder', 'lambda_list_clowder', args).then(results => {
                if (results['data'].indexOf('error') !== -1) {
                    client.hdel(req.user.username, 'clowder_username');
                    client.hdel(req.user.username, 'clowder_password');
                    res.send({'ERROR': results['info']});
                } else {
                    res.send(results['data']);
                }

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

router.post('/clowder-dataset', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
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

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

router.post('/clowder-collection', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
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

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

router.post('/clowder-space', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
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

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
    });
});

router.post('/clowder-files', isLoggedIn, function(req,res,next){
    client.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
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

            }).catch(error => {
                res.send({'ERROR': JSON.stringify(error)});
            });
        }
        else {
            res.send({ERROR: 'Your login session has expired. Please login again!'});
        }
    });
});

module.exports = router;
