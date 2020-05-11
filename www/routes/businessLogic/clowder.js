var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));


router.post('/check-clowder-login', checkIfLoggedIn, function(req, res, next){
    redisClient.hgetall(req.user.username, function (err, obj) {
        if (err){
            res.send({ERROR:err});
        }
        else if (obj && obj['clowder_username'] !== undefined && obj['clowder_password'] !== undefined) {
            res.send('Logged in!');
        }
        else {
            redisClient.hdel(req.user.username, 'clowder_username');
            redisClient.hdel(req.user.username, 'clowder_password');
            res.send('Not logged in!');
        }
    });
});

router.post('/clowder-login', checkIfLoggedIn, function(req,res,next){
	if (req.body.clowder_username !== undefined && req.body.clowder_password !== undefined){
        redisClient.hset(req.user.username, 'clowder_username', req.body.clowder_username, redis.print);
        redisClient.hset(req.user.username, 'clowder_password', req.body.clowder_password, redis.print);
        redisClient.expire(req.user.username, 30 * 60);
		res.send({success:'succesfully provided username and password information!'});
	}else{
        redisClient.hdel(req.user.username, 'clowder_username');
        redisClient.hdel(req.user.username, 'clowder_password');
		res.send({ERROR:'username and password incomplete!'});
	}

});

router.post('/list-dataset', checkIfLoggedIn, function(req, res, next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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
                    redisClient.hdel(req.user.username, 'clowder_username');
                    redisClient.hdel(req.user.username, 'clowder_password');
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

router.post('/list-collection', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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
                    redisClient.hdel(req.user.username, 'clowder_username');
                    redisClient.hdel(req.user.username, 'clowder_password');
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

router.post('/list-space', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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
                    redisClient.hdel(req.user.username, 'clowder_username');
                    redisClient.hdel(req.user.username, 'clowder_password');
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

router.post('/list-user', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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
                    redisClient.hdel(req.user.username, 'clowder_username');
                    redisClient.hdel(req.user.username, 'clowder_password');
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

router.post('/clowder-dataset', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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

router.post('/clowder-collection', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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

router.post('/clowder-space', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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

router.post('/clowder-files', checkIfLoggedIn, function(req,res,next){
    redisClient.hgetall(req.user.username, function (err, obj) {
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
