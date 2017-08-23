var express = require('express');
var router = express.Router();

router.post('/download',function(req,res,next){
	var downloadURL = req.body.downloadURL;
	res.download(downloadURL);
});

module.exports = router;