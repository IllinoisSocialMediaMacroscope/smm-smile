var express = require('express');
var router = express.Router();
var appPath = path.dirname(path.dirname(__dirname));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));

router.post('/download', isLoggedIn, function (req, res, next) {
    var downloadURL = req.body.downloadURL;
    res.download(downloadURL);
});

module.exports = router;
