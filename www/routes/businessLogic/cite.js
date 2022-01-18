var express = require('express');
var router = express.Router();

router.get('/citation', function (req, res) {
    res.render('citation', {
        user: req.user,
        parent: '/',
        SINGLE_USER:SINGLE_USER==='true'
    });
});

module.exports = router;
