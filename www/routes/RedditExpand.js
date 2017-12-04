var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
var spawn = require("child_process").spawn;

router.post('/reddit-expand',function(req,res,next){
	
	var myPythonScript = appPath + '/scripts/RedditComment.py';
	var pythonExecutable = "C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe";
	//var pythonExecutable = "/opt/python/bin/python3.4";
	
	var p = spawn(pythonExecutable, [myPythonScript,"--email",req.body.email,"--filename",'./downloads/GraphQL/'+req.body.filename], 
				{detached: true});
	
	p.stdout.on('data', (data) => {
	  console.log(`stdout: ${data}`);
	});
	p.stderr.on('data', (data) => {
	  console.log(`stderr: ${data}`);
	});

	p.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
	});
	
	p.unref();
	
	res.end('done');
});

module.exports = router;