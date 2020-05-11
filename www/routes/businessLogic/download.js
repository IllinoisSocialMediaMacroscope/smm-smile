var express = require('express');
var router = express.Router();
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));

router.post('/download', checkIfLoggedIn, function (req, res, next) {
    var downloadURL = req.body.downloadURL;
    res.download(downloadURL);
});

module.exports = router;
