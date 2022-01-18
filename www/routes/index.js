var express = require('express');
var router = express.Router();
var fs = require("fs");
var path = require('path');
var routesDir = path.join(__dirname, "analyses");

router.get('/', function (req, res, next) {

    var pages = [
        {
            name: 'Searching Social Media',
            url: 'query',
            imgURL: 'bootstrap/img/logo/search-smm.png',
            wiki: 'https://en.wikipedia.org/wiki/Social_search',
            introduction: `SMILE empowers researchers to search content from multiple social media platforms all at once.
					Find tweets, individual user accounts, and comments that match specific criteria,
					and analyze content with just a few clicks. Both live and historical data are available for search.`
        }];

    var routesFiles = fs.readdirSync(routesDir);
    routesFiles.forEach(function (route, i) {
        if (route.split(".")[0] !== "" && route.split(".")[1] === "json" && fs.lstatSync(path.join(routesDir, route)).isFile()) {

            var routesConfig = require(path.join(routesDir, route));
            if ("get" in routesConfig) {
                var page = {
                    name: routesConfig.title,
                    url: routesConfig.path,
                    imgURL: routesConfig.imgURL,
                    wiki: routesConfig.wiki,
                    introduction: routesConfig.introduction.join(" ")
                };

                pages.push(page);
            }
        }
    });

    // pages.push({
    //     name: 'Clowder',
    //     url: '',
    //     imgURL: 'bootstrap/img/logo/clowder-only-logo.png',
    //     wiki: 'https://clowder.ncsa.illinois.edu',
    //     introduction: `Clowder is a research data management system. You can choose to add search results
    //     			and analytics outputs to Clowder within SMILE. A cluster of extraction services will process the
    //     			data to extract interesting metadata and create web based data previews and visualizations.`
    // });

    res.render('index', {
        user: req.user,
        pages: pages,
        SINGLE_USER:SINGLE_USER==='true',
    });
});

module.exports = router;
