var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var fs = require('fs');
var path = require('path');
var pythonShell = require('python-shell');
//TODO fs.unlink has some issues needed to be fixed
var rootDIR = path.resolve('.');

router.get('/sklearn/predict',function(req,res,next){
	res.render('scikit-learn/predict-upload');
});
 
router.post('/sklearn/predict',upload.array('files',2),function(req,res,next){
	 
	if (req.files){
		//console.log(req.files)
		//console.log(req.body)
		var options = {
			args:['--modelfile',req.files[1].path, '--file',req.files[0].path]
		};
		
		//put multiple encode header into args
		if (req.body.encode !== ''){
			options.args.push('--encodeHeader');
			// only one header
			if (Array.isArray(req.body.encode) === false){
				options.args.push(req.body.encode);
			}else{ //multiple headers
				for (var i=0; i<req.body.encode.length;i++){
					if (req.body.encode[i] !== ''){options.args.push(req.body.encode[i])}
				}
			}
		}
		
		var pyshell = new pythonShell(rootDIR +'/scripts/ML/classification_predict.py',options);
		
		var data = []; 
		
		pyshell.on('message',function(message){
			data.push(message);
		});
		
		pyshell.end(function(err){
			if(err){
				throw err;  
			};
			// remove the trailing '/r/n' in the downloadURL
			res.render('scikit-learn/predict-download', {downloadURL:data.pop().slice(0,-1),display:data});
		});
	}
	else{
		res.end('Missing file');
	}
	
});

module.exports = router;