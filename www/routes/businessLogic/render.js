var express = require('express');
var router = express.Router();
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var routesDir = path.join(appPath, 'routes', 'analyses');
var columnHeadersPath = path.join(appPath, 'columnHeaders.json');
var getMultiRemote = require(path.join(appPath, 'scripts', 'helper_func', 'getRemote.js'));
var isLoggedIn = require(path.join(appPath, 'scripts', 'helper_func', 'loginMiddleware.js'));
var fs = require('fs');

router.post('/render-json', isLoggedIn, function (req, res, next) {
    getMultiRemote(req.body.fileURL).then((preview_string) => {
        if (preview_string === '') {
            res.send({ERROR: 'Nothing to render'});
        } else {
            var preview_json = JSON.parse(preview_string);
            var prefix = Object.keys(preview_json)[0];
            var begin = parseInt(req.body.begin);

            if (begin < 0) {
                res.send({ERROR: 'It\'s already the first page!'})
            } else if (begin > preview_json[prefix].length - 1) {
                res.send({ERROR: 'It\'s already the last page!'})
            } else {
                if (begin + 99 > preview_json[prefix].length - 1) {
                    var end = preview_json[prefix].length - 1;
                } else {
                    var end = begin + 99;
                }

                res.send({
                    preview: preview_json[prefix].slice(begin, end),
                    prefix: prefix
                });
            }
        }
    }).catch(err => {
        console.log(err);
        res.send({ERROR: err});
    });
});

router.post('/render', isLoggedIn, function (req, res, next) {

    // decide if multiuser or not
    if (s3FolderName !== undefined) {
        var userPath = s3FolderName;
    }
    else {
        var userPath = req.user.username;
    }
    if (req.body.prefix.split("/")[0] === userPath) {
        if (req.body.prefix !== '' && req.body.prefix !== undefined) {

            var p = s3.list_files(req.body.prefix);
            p.then((folderObj) => {
                var fileList = Object.keys(folderObj);
                for (var i = 0, length = fileList.length; i < length; i++) {
                    if (fileList[i].slice(-4) === '.csv') {
                        var fileURL = folderObj[fileList[i]];

                        var p2 = getMultiRemote(fileURL);
                        p2.then((preview_string) => {
                            if (preview_string === '') {
                                res.send({ERROR: 'This dataset you selected is empty, please select another one!'});
                            } else {

                                if (fs.existsSync(columnHeadersPath)) {
                                    var columnHeaders = JSON.parse(fs.readFileSync(columnHeadersPath));
                                }
                                else {
                                    res.send({ERROR: "Cannot load preview due to missing the columnHeaders.json file."})
                                }

                                // add custom setting headers
                                var customColumnHeadersPath = path.join(smileHomePath, 'customColumnHeaders.json');
                                if (fs.existsSync(customColumnHeadersPath)) {
                                    var customColumnHeaders = JSON.parse(fs.readFileSync(customColumnHeadersPath));
                                    for (var key in customColumnHeaders) {
                                        for (i = 0; i < customColumnHeaders[key].length; i++) {
                                            if (columnHeaders[key].indexOf(customColumnHeaders[key][i]) < 0) {
                                                columnHeaders[key].push(customColumnHeaders[key][i]);
                                            }
                                        }
                                    }
                                }

                                var preview_arr = CSV.parse(preview_string);
                                res.send({preview: preview_arr, columnHeaders: columnHeaders});
                            }
                        });

                    }
                }

            }).catch((err) => {
                res.send({ERROR: err});
            });
        } else {
            res.send();
        }
    }
    else {
        res.send({ERROR: "Access Denied!"});
    }

});

router.post('/list', isLoggedIn, function (req, res, next) {

    var directory = {};

    var promise_array = [];

    // decide if multiuser or not
    if (s3FolderName !== undefined) {
        var userPath = s3FolderName;
    }
    else {
        var userPath = req.user.username;
    }
    promise_array.push(s3.list_folders(userPath + '/GraphQL/twitter-Tweet/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/twitter-Timeline/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Search/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Post/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Comment/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Historical-Post/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Historical-Comment/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/crimson-Hexagon/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/userspec-Others/'));
    Promise.all(promise_array).then(values => {

        directory['twitter-Tweet'] = values[0];
        directory['twitter-Timeline'] = values[1];
        directory['reddit-Search'] = values[2];
        directory['reddit-Post'] = values[3];
        directory['reddit-Comment'] = values[4];
        directory['reddit-Historical-Post'] = values[5];
        directory['reddit-Historical-Comment'] = values[6];
        directory['crimson-Hexagon'] = values[7];
        directory['userspec-Others'] = values[8];

        res.send(directory);
    }).catch(err => {
        res.send({ERROR: err});
    });

});

router.post('/list-all', isLoggedIn, function (req, res, next) {

    var promise_array = [];

    // decide if multiuser or not
    if (s3FolderName !== undefined) {
        var userPath = s3FolderName;
    }
    else {
        var userPath = req.user.username;
    }
    promise_array.push(s3.list_folders(userPath + '/GraphQL/twitter-Tweet/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/twitter-Timeline/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Search/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Post/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Comment/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Historical-Post/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/reddit-Historical-Comment/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/crimson-Hexagon/'));
    promise_array.push(s3.list_folders(userPath + '/GraphQL/userspec-Others/'));
    var graphqlLength = promise_array.length;

    // loop through analyses setting files
    var routesFiles = fs.readdirSync(routesDir);
    // record the path and order
    var order = [];
    var j = 0;
    routesFiles.forEach(function (route, i) {
        if (route.split(".")[0] !== "" && route.split(".")[1] === "json" && fs.lstatSync(path.join(routesDir, route)).isFile()) {
            var routesConfig = require(path.join(routesDir, route));
            if ('result_path' in routesConfig) {

                var parent = routesConfig['result_path'].split("/")[1];
                var child = routesConfig['result_path'].split("/")[2];
                order.push({order: j + graphqlLength, parent: parent, child: child});
                promise_array.push(s3.list_folders(userPath + routesConfig['result_path']));

                j++;
            }
        }
    });

    var directory = {};
    Promise.all(promise_array).then(values => {
        directory['GraphQL'] = {};
        directory['GraphQL']['twitter-Tweet'] = values[0];
        directory['GraphQL']['twitter-Timeline'] = values[1];
        directory['GraphQL']['reddit-Search'] = values[2];
        directory['GraphQL']['reddit-Post'] = values[3];
        directory['GraphQL']['reddit-Comment'] = values[4];
        directory['GraphQL']['reddit-Historical-Post'] = values[5];
        directory['GraphQL']['reddit-Historical-Comment'] = values[6];
        directory['GraphQL']['crimson-Hexagon'] = values[7];
        directory['GraphQL']['userspec-Others'] = values[8];
        for (i = 0; i < order.length; i++) {
            var parent = order[i]['parent'];
            var child = order[i]['child'];
            var orderNum = order[i]['order'];

            if (!(parent in directory)) {
                directory[parent] = {};
            }
            directory[parent][child] = values[orderNum]
        }

        res.send(directory);

    }).catch((err) => {

        res.send({ERROR: err});

    });

});

router.post('/add-columnHead', isLoggedIn, function (req, res, next) {
    // allow user to add custom column header name to the list
    // used when perform analyses on dataset
    // write to user's home direction under SMILE folder

    var data = req.body;
    if (data.customColumnHeaders !== []
        && data.customColumnHeaders !== undefined
        && data.analyses !== []
        && data.analyses !== undefined
    ) {
        // if smile home folder doesn't exist, create one
        if (!fs.existsSync(smileHomePath)) {
            fs.mkdirSync(smileHomePath);
        }

        // write user specific column header to customColumnHeaders.json file
        var customColumnHeadersPath = path.join(smileHomePath, 'customColumnHeaders.json');
        if (fs.existsSync(customColumnHeadersPath)) {
            var customColumnHeaders = JSON.parse(fs.readFileSync(customColumnHeadersPath));
            for (i = 0; i < data.analyses.length; i++) {
                for (j = 0; j < data.customColumnHeaders.length; j++) {
                    if (customColumnHeaders[data.analyses[i]].indexOf(data.customColumnHeaders[j]) < 0) {
                        customColumnHeaders[data.analyses[i]].push(data.customColumnHeaders[j]);
                    }
                }
            }
        } else {
            var customColumnHeaders = {};
            for (i = 0; i < data.analyses.length; i++) {
                customColumnHeaders[data.analyses[i]] = [];
                for (j = 0; j < data.customColumnHeaders.length; j++) {
                    customColumnHeaders[data.analyses[i]].push(data.customColumnHeaders[j]);
                }
            }
        }

        // save it to file
        fs.writeFileSync(customColumnHeadersPath, JSON.stringify(customColumnHeaders, null, 4));
        res.send({message: 'done!'});
    }
});

router.get('/list-columnHead', isLoggedIn, function (req, res, next) {
    var columnHeaders = JSON.parse(fs.readFileSync(columnHeadersPath));

    var customColumnHeadersPath = path.join(smileHomePath, 'customColumnHeaders.json');
    if (fs.existsSync(customColumnHeadersPath)) {
        var customColumnHeaders = JSON.parse(fs.readFileSync(customColumnHeadersPath));
        for (var key in customColumnHeaders) {
            for (i = 0; i < customColumnHeaders[key].length; i++) {
                if (columnHeaders[key].indexOf(customColumnHeaders[key][i]) < 0) {
                    columnHeaders[key].push(customColumnHeaders[key][i]);
                }
            }
        }
    }

    res.send(columnHeaders);
});

router.get('/list-analyses', function (req, res, next) {
    var analyses = [];
    var routesFiles = fs.readdirSync(routesDir);
    routesFiles.forEach(function (route, i) {
        if (route.split(".")[0] !== ""
            && route.split(".")[1] === "json"
            && fs.lstatSync(path.join(routesDir, route)).isFile()) {

            var routesConfig = require(path.join(routesDir, route));
            if ("get" in routesConfig) {
                var analysis = {};
                analysis['name'] = routesConfig.title;
                analysis['url'] = routesConfig.path;
                analysis['lambda'] = true;
                analysis['batch'] = false;

                if ("post" in routesConfig) {
                    if ("lambda_config" in routesConfig.post) {
                        analysis['lambda'] = true;
                    }
                    else {
                        analysis['lambda'] = false;
                    }

                    if ("batch_config" in routesConfig.post) {
                        analysis['batch'] = true;
                    }
                    else {
                        analysis['batch'] = false;
                    }

                    if ("cutoff" in routesConfig.post) {
                        analysis['cutoff'] = routesConfig.post.cutoff || routesConfig.put.cutoff;
                    }
                }
                ;
                analyses.push(analysis);
            }
        }
    });

    res.send({analyses: analyses});
});

module.exports = router;
