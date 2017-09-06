var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest:'uploads/'});
var fs = require('fs');
var path = require('path');
var pythonShell = require('python-shell');
//TODO fs.unlink has some issues needed to be fixed
var rootDIR = path.resolve('.');

router.get('/sklearn/train',function(req,res,next){
	res.render('scikit-learn/train-upload');
});
 
router.post('/sklearn/train',upload.single('file'),function(req,res,next){
	 
	if (req.file){
		var options = {
			args:['--file',req.file.path, '--targetHeader',req.body.target,
			'--test_size',req.body.test_size,'--model',req.body.model]
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
		  
		var pyshell = new pythonShell(rootDIR +'/scripts/ML/classification_train.py',options);
		
		var data = []; 
		
		pyshell.on('message',function(message){
			data.push(message);
		});
		
		pyshell.end(function(err){
			if(err){
				throw err;  
			};
			//console.log(data);
			// remove the trailing '/r/n' in the downloadURL
			
			//downloadURL = data.pop().slice(0,-1)
			
			res.render('scikit-learn/train-download', {model:req.body.model,downloadURL:data.pop().slice(0,-1),metrics:data});
		});
	}
	else{
		res.end('Missing file');
	}
	
});

module.exports = router;