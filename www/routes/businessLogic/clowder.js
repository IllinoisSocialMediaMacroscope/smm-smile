var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var lambda_invoke = require(path.join(appPath,'scripts','helper_func','lambdaHelper.js')).lambda_invoke;

router.post('/check-clowder-login', function(req,res,next){
	if (req.session.clowder_username !== undefined && req.session.clowder_password !== undefined){
		res.send('logged');
	}else{
		res.send('unlogged');
	}
});

router.post('/clowder-login', function(req,res,next){
	// if success, notify the frontend by setting the cookie in the browser to true
	if (req.body.clowder_username !== undefined && req.body.clowder_password !== undefined){
		req.session.clowder_username = req.body.clowder_username;
		req.session.clowder_password = req.body.clowder_password;
		req.session.save();
		res.send({success:'succesfully provided username and password information!'});
	
	// if faild to provide username and password, set the frontend cookie to false forever (a year)...
	}else{
		res.send({ERROR:'username and password incomplete!'});
	}
	
});

router.post('/list-dataset', function(req, res, next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		// invoke CLowder lambda function
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'item':'dataset'
		}	
		lambda_invoke('lambda_list_clowder', args).then(results =>{
			if (results['data'].indexOf('error') !== -1){
				req.session.destroy();
				res.send({'ERROR':results['info']});
			}else{
				res.send(results['data']);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}
});

router.post('/list-collection',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		// invoke CLowder lambda function
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'item':'collection'
		}	
		lambda_invoke('lambda_list_clowder', args).then(results =>{
			if (results['data'].indexOf('error') !== -1){
				req.session.destroy();
				res.send({'ERROR':results['info']});
			}else{
				res.send(results['data']);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}	
});

router.post('/list-space',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		// invoke CLowder lambda function
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'item':'space'
		}	
		lambda_invoke('lambda_list_clowder', args).then(results =>{
			if (results['data'].indexOf('error') !== -1){
				req.session.destroy();
				res.send({'ERROR':results['info']});
			}else{
				res.send(results['data']);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}	
});

router.post('/list-user',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		// invoke CLowder lambda function
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'item':'user'
		}	
		lambda_invoke('lambda_list_clowder', args).then(results =>{
			if (results['data'].indexOf('error') !== -1){
				req.session.destroy();
				res.send({'ERROR':results['info']});
			}else{
				res.send(results['data']);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}	
});

router.post('/clowder-dataset',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		// invoke CLowder lambda function
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'payload':req.body
		};
		lambda_invoke('lambda_invoke_clowder', args).then(results =>{
			
			if (results['id']  === 'null'){
				res.send({'ERROR':'Creating new dataset failed!'});
			}else{
				res.send(results);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}
});

router.post('/clowder-collection',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'payload':req.body
		}	
		lambda_invoke('clowder_create_collection', args).then(results =>{
			if (results['id']  === 'null'){
				res.send({'ERROR':'Creating new collection failed!'});
			}else{
				//console.log(results);
				res.send(results);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}
});

router.post('/clowder-space',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		var args = {'username':req.session.clowder_username, 
			'password':req.session.clowder_password,
			'payload':req.body
		}	
		lambda_invoke('clowder_create_space', args).then(results =>{
			if (results['id']  === 'null'){
				res.send({'ERROR':'Creating new space failed!'});
			}else{
				//console.log(results);
				res.send(results);
			}
			
		}).catch( error =>{
			//console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}
});


router.post('/clowder-files',function(req,res,next){
	if (req.session.clowder_username === undefined || req.session.clowder_password === undefined){
		res.send({ERROR:'Your login session has expired. Please login again!'});
	}else{
		// invoke Clowder lambda function
		var args = {'username':req.session.clowder_username,
			'password':req.session.clowder_password,
			'payload':req.body
		}		
		lambda_invoke('lambda_upload_clowder', args).then(results =>{
			if (results['ids'].length === 0){
				res.send({'ERROR':'Uploading files to dataset failed. ERROR:' + results['info']});
			}else{
				res.send(results);
			}
			
		}).catch( error =>{
			console.log(error);
			res.send({'ERROR':JSON.stringify(error)});
		});
	}
});

module.exports = router;
