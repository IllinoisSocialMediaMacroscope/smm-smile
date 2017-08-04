var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var fs = require('fs');
var path = require('path');
var pythonShell = require('python-shell');

//TODO fs.unlink has some issues needed to be fixed
var rootDIR = path.resolve('.');

router.get('/networkx',function(req,res,next){
	res.render('networkx/networkx');
});

router.post('/networkx',upload.single('file'),function(req,res,next){
	
	//console.log(req.body);
	
	if (req.file){
		
		var options = {
			args:['--file',req.file.path, '--layout',req.body.layout, '--directed',req.body.type, 
			'--node_size',req.body.node_size,'--edge_width',req.body.edge_width]
		};
		//put multiple encode header into args
		if ('metrics' in req.body){
			options.args.push('--metrics');
			
			// only one header
			if (Array.isArray(req.body.metrics) === false){
				options.args.push(req.body.metrics);
			} 
			else{ //multiple headers
				for (var i=0; i<req.body.metrics.length;i++){
					if (req.body.metrics[i] !== ''){options.args.push(req.body.metrics[i])}
				}
			} 
		}
		
		var pyshell = new pythonShell(rootDIR +'/scripts/NetworkX/network_analysis.py',options);
		
		var count = 0;
		downloadFiles = [];
		pyshell.on('message',function(message){
			if (count === 0){ div = message; }
			if (count >= 1) { downloadFiles.push(message); }
			count += 1;
		});
			
		 
		pyshell.end(function(err){
			if(err){
				throw err;
			};
			//console.log(downloadFiles);
			
			var div_data = fs.readFileSync(div.slice(0,-1), 'utf8'); //trailing /r
			
			var downloads = [];
			if (downloadFiles.length === 1){
				downloads.push({'name':req.body.metrics + ' analysis', 'content':downloadFiles[0]});
			}else{
				for (i in downloadFiles){
					//console.log(req.body.metrics[i]);
					downloads.push({'name':req.body.metrics[i] + ' analysis', 'content':downloadFiles[i]})
				}
			}
			res.send({
				title:'Network Analysis', 
				img:[{name:'Network Graph',content:div_data}],
				download: downloads,
				metrics:{name:'', content:''}, 
				preview:{name:'',content:''}						
			});
			
			// delete upload file
			fs.unlink(req.file.path, (err) => {
				if (err) throw err;
				console.log('successfully deleted!');
			}); 
		}); 
	}
});
      
module.exports = router;