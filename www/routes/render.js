//require('dotenv').config();
var express = require('express');
var router = express.Router();
var fs = require('fs');
var CSV = require('csv-string');

router.post('/render',function(req,res,next){

	if (req.body.foldername !== 'empty'){
		
		var preview_string = fs.readFileSync('./downloads/GraphQL/' + req.body.directory +
					'/' + req.body.foldername + '/' + req.body.foldername + '.csv', "utf8");
		
		if (preview_string === ''){
			res.send({ERROR: 'This dataset you selected is empty, please select another one!'});
		}else{
			var preview_arr = CSV.parse(preview_string);
			res.send({preview:preview_arr.slice(0,10)}); // preview the top 25 line?
		}
	}else{
		res.send();
	}
});

module.exports = router;