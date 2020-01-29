var express = require('express');
var router = express.Router();
var fs = require('fs');
var CSV = require('csv-string');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath, 'scripts', 'helper_func', 'getRemote.js'));

router.get('/history', function (req, res, next) {
    res.render('history', {
        parent: '/',
        DOCKERIZED:process.env.DOCKERIZED
    });
});

router.post('/history', function (req, res, next) {
    var arrURL = req.body.folderURL.split('/');

    // check if the requested folder matches the current user's identity
    if (arrURL[0] === s3FolderName) {
        if (arrURL[1] === 'GraphQL') {
            var p = s3.list_files(req.body.folderURL);
            p.then(folderObj => {
                var promise_array = [];
                var fileList = Object.keys(folderObj);

                if (fileList.length >= 2) {
                    for (var i = 0, length = fileList.length; i < length; i++) {
                        var filename = fileList[i];
                        if (filename === 'config.json') {
                            var config = folderObj[filename];
                        } else if (filename.slice(-4) === '.csv') {
                            var preview = folderObj[filename];
                        } else if (filename.slice(-4) === '.zip') {
                            if (filename === "images.zip") var images = folderObj[filename];
                            else var comments = folderObj[filename];
                        }
                    }
                    var download = [{name: 'CSV format', content: preview}];
                    if (comments !== undefined) download.push({name: 'Collection of comments', content: comments});
                    if (images !== undefined) download.push({name:'Collection of images', content:images});

                    promise_array.push(getMultiRemote(config));
                    promise_array.push(getMultiRemote(preview));
                    Promise.all(promise_array).then(values => {
                        var config_data = JSON.parse(values[0]);
                        var preview_string = values[1];
                        var preview_arr = CSV.parse(preview_string).slice(0, 1001);
                        config_data.fields = preview_arr[0];

                        var data =
                        {
                            title: 'Social Media',
                            ID: req.body.folderURL,
                            download: download,
                            preview: [{name: "Preview the .csv file", content: preview_arr, dataTable: true}],
                            length: preview_arr.length - 1, // display in the expand comments modal
                            config: config_data,
                            uid: arrURL[3]
                        };

                        if (arrURL[2] === 'reddit-Search' || arrURL[2] === 'reddit-Post' || arrURL[2] === 'reddit-Historical-Post'){
                            data['expandable'] = req.body.folderURL;
                        }

                        if (arrURL[2] === 'reddit-Search' || arrURL[2] === 'reddit-Post'
                            || arrURL[2] === 'reddit-Historical-Post' || arrURL[2] === 'twitter-Tweet'
                            || arrURL[2] === 'twitter-Timeline' || arrURL === 'crimson-Hexagon'){
                            data['crawlImage'] = req.body.folderURL;
                        }

                        res.send(data);

                    });

                } else {
                    res.send({
                        ERROR: `Sorry! We cannot find a complete analytic history associated with this ID. You should double check `
                        + `if you have fulfilled all the required  process when carrying out this analysis.`
                    });
                }
            });
        }
        else {
            var routesDir = path.join(path.dirname(__dirname), "analyses");
            var routesConfig = require(path.join(routesDir, arrURL[2] + '.json'));
            history_routes_template(req, routesConfig)
            .then(data => {
                res.send(data);
            })
            .catch(err => {
                res.send({ERROR: err});
            });
        }
    }
    else {
        res.send({ERROR: "Access Denied!"});
    }
});

router.delete('/history', function (req, res, next) {
    if (req.body.type === 'local') {
        var p = [];
        p.push(s3.deleteLocalFolders(path.join(smileHomePath, 'downloads')));
        p.push(s3.deleteLocalFolders(path.join(smileHomePath, 'uploads')));
        Promise.all(p).then(() => {
            res.send({'data': 'Successfully purged!'});
        }).catch(err => {
            console.log(err);
            res.send({ERROR: err});
        });
    }
    else if (req.body.type === 'remote') {
        if (req.body.folderURL.split("/")[0] === s3FolderName) {
            var p = s3.deleteRemoteFolder(req.body.folderURL);
            p.then(() => {
                res.send({'data': 'Successfully deleted!'});
            }).catch(err => {
                res.send({ERROR: err});
            });
        }
        else {
            res.send({ERROR: "Access Denied!"});
        }
    }

});

function history_routes_template(req, config) {
    return new Promise((resolve, reject) => {
        var p = s3.list_files(req.body.folderURL);
        var arrURL = req.body.folderURL.split('/');
        if (arrURL[0] === s3FolderName) {
            p.then(results => {
                // fetch all the data from url, and add those to the result content
                // this might be slow since we are fetching everything
                // in theory we only need to fetch image and previews
                var promise_array = [];
                var promise_array_acronym = [];
                var resultConfig = config.results;
                var download = [];
                for (var i = 0; i < resultConfig.length; i++) {
                    for (var j = 0; j < Object.keys(results).length; j++) {
                        if (Object.keys(results)[j].split(".")[0] === resultConfig[i]['acronym']) {
                            var fname = Object.keys(results)[j];
                            var url = results[fname];
                            if (resultConfig[i]["download"]) {
                                download.push({
                                    name: resultConfig[i]['name'],
                                    content: url
                                })
                            }

                            // record the order of collected
                            promise_array_acronym.push(fname);
                            promise_array.push(getMultiRemote(url));
                        }
                    }
                }

                Promise.all(promise_array).then(values => {
                    // put together data to send
                    var preview = [];
                    var img = [];
                    var config_data;
                    var wordtree;

                    for (var i = 0; i < resultConfig.length; i++) {
                        for (var j = 0; j < promise_array_acronym.length; j++) {
                            if (promise_array_acronym[j].split(".")[0] === (resultConfig[i]['acronym'])) {
                                if (resultConfig[i]["config"]) {
                                    config_data = JSON.parse(values[j]);
                                }

                                if (resultConfig[i]["preview"]) {
                                    // sort string to array
                                    var preview_arr = CSV.parse(values[j]).slice(0, 1001);
                                    if (resultConfig[i]["dataTable"] !== undefined)
                                        preview.push({
                                            name: resultConfig[i]["name"],
                                            content: preview_arr,
                                            dataTable: resultConfig[i]["dataTable"]
                                        });
                                    else {
                                        preview.push({
                                            name: resultConfig[i]["name"],
                                            content: values[j],
                                            dataTable: false
                                        })
                                    }
                                }

                                if (resultConfig[i]["img"]) {
                                    img.push({
                                        name: resultConfig[i]["name"],
                                        content: values[j],
                                        url: results[resultConfig[i]["acronym"] + ".html"]
                                    })
                                }

                                if ("wordtree" in resultConfig[i] && resultConfig[i]["wordtree"]) {
                                    var phrase_array = values[j].toString().split("\n");
                                    var new_phrase_array = [];
                                    for (var k = 0, length = phrase_array.length; k < length; k++) {
                                        //add [] to make it comply with google word tree requirement
                                        new_phrase_array.push([phrase_array[k]]);
                                    }
                                    wordtree = {
                                        name: resultConfig[i]["name"],
                                        content: new_phrase_array,
                                        root: ""
                                    }

                                }
                            }
                        }
                    }

                    var data = ({
                        title: config.title,
                        ID: req.body.folderURL,
                        uid: arrURL[3],
                        img: img,
                        download: download,
                        preview: preview,
                        config: config_data,
                        wordtree: wordtree
                    });
                    resolve(data);
                })
                .catch((error) => {
                    reject(error);
                });
            })
            .catch(error => {
                reject(error);
            });
        }
        else {
            res.send({ERROR: "Access Denied!"});
        }
    });
}

module.exports = router;
