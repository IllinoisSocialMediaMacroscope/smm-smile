var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(__dirname);
//var spawn = require("child_process").spawn;
const getSize = require('get-folder-size');
var pythonShell = require('python-shell');

router.post('/reddit-expand',function(req,res,next){
	getSize('./downloads', function(err, size) {
		if (err) { res.send({'ERROR':err}); }
		else{ 
			var sizeMB = size / 1024 / 1024;
			console.log( sizeMB.toFixed(2) + ' Mb');
			
			//threshhold of 50MB for each user maybe?
			if (sizeMB >= 500){
				res.send({'ERROR':`You have accumulated a total ` + sizeMB.toFixed(2) + 'MB of data in your directory, which ' 
				 + 'reached the alarm of 500MB for each individual. Please go free up the space by visiting the HISTORY page '
				 + 'and delete some of the historical data. No furthur data ingestion or computation can be performed until your ' +
				'disk usage is below 500MB. We appreciate your understanding!'
				});
			}else{
				var options = {
						//pythonPath:'C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe',
						pythonPath:'/opt/python/bin/python3.4',
						pythonOptions:['-W ignore'],
						scriptPath:appPath + '/scripts/',
						args:['--email',req.body.email, '--filename','./downloads/GraphQL/'+req.body.filename]
					};
				pythonShell.run('RedditComment.py',options,function(err,results){
					if (err){
						console.log(err);
					}else{
						console.log(results);
					}
				});
				
				res.end('done');		
			}
		}	
	});		
});

module.exports = router;

/*var myPythonScript = appPath + '/scripts/RedditComment.py';
					//var pythonExecutable = "C:/Users/cwang138/AppData/Local/Programs/Python/Python36-32/python.exe";
					var pythonExecutable = "/opt/python/bin/python3.4";
					
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
					
					p.unref();*/