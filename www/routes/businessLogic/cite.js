var express = require('express');
var router = express.Router();

router.get('/citation', function (req, res) {
    res.render('citation', {
        parent: '/',
        DOCKERIZED:process.env.DOCKERIZED
    });
});

module.exports = router;
