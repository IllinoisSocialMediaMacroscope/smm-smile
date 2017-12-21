var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
var pythonShell = require('python-shell');

router.post('/reddit-expand',function(req,res,next){
	
	var options = {
			//pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
			pythonPath:'/opt/python/bin/python3.4',
			pythonOptions:['-W ignore'],
			scriptPath:appPath + '/scripts/',
			args:['--email',req.body.email, 
					'--remoteReadPath', req.body.prefix ]
		};
	pythonShell.run('RedditComment.py',options,function(err,results){
		if (err){
			console.log(err);
		}else{
			console.log(results);
		}
	});
	
	res.end('done');		
			
});

module.exports = router;