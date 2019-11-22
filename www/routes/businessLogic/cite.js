var express = require('express');
var router = express.Router();

router.get('/citation', function (req, res) {
    res.render('citation', {parent: '/'});
});

module.exports = router;
