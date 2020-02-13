var express = require('express');
var router = express.Router();

router.get('/citation', function (req, res) {
    res.render('citation', {
        user: req.user,
        parent: '/',
        DOCKERIZED:process.env.DOCKERIZED==='true'
    });
});

module.exports = router;
