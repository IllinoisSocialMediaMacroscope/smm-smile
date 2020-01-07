var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var jsonexport = require('jsonexport');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var lambda_invoke = require(path.join(appPath, 'scripts', 'helper_func', 'lambdaHelper.js')).lambda_invoke;
var getMultiRemote = require(path.join(appPath, 'scripts', 'helper_func', 'getRemote.js'));

router.get('/query', function (req, res) {

    // check if all the sessions have token, in case the server stops in the middle
    var status = checkSessionToken(req.session);
    var platforms = Object.keys(status);

    for (var i = 0; i < platforms.length; i++) {
        if (!status[platforms[i]]) {
            res.cookie(platforms[i] + '-success', 'false', {maxAge: 365 * 24 * 60 * 60 * 1000, httpOnly: false});
        }
    }

    res.render('search/query', {parent: '/', error: req.query.error});

});

router.post('/query-dryrun', function (req, res) {
    var status = checkSessionToken(req.session);
    var platform = req.body.prefix.split('-')[0];

    if (status[platform] || req.body.prefix === 'reddit-Historical-Post' || req.body.prefix === 'reddit-Historical-Comment') {
        var headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'redditaccesstoken': req.session.rd_access_token,
            'twtaccesstokenkey': req.session.twt_access_token_key,
            'twtaccesstokensecret': req.session.twt_access_token_secret,
            'crimsonaccesstoken': req.session.crimson_access_token
        };

        gatherSinglePost(req.body.query, headers).then(responseObj => {
            var key1 = Object.keys(responseObj)[0];
            var key2 = Object.keys(responseObj[key1])[0];
            var key3 = Object.keys(responseObj[key1][key2])[0];
            res.send({
                rendering: responseObj[key1][key2][key3]
            });
        })
        .catch(err => {
            console.log(err);
            res.send({ERROR: err});
        });
    }
    else {
        res.send({ERROR: platform + " token expired! Please refresh the page."});
    }
});

router.post('/query', function (req, res) {

    var status = checkSessionToken(req.session);
    var platform = req.body.prefix.split('-')[0];

    if (status[platform] || req.body.prefix === 'reddit-Historical-Post' || req.body.prefix === 'reddit-Historical-Comment') {
        if (!fs.existsSync(smileHomePath)) {
            fs.mkdirSync(smileHomePath);
        }

        var dir_downloads = path.join(smileHomePath, 'downloads');
        if (!fs.existsSync(dir_downloads)) {
            fs.mkdirSync(dir_downloads);
        }

        var dir_downloads_graphql = path.join(dir_downloads, 'GraphQL');
        if (!fs.existsSync(dir_downloads_graphql)) {
            fs.mkdirSync(dir_downloads_graphql);
        }

        var dir_downloads_graphql_prefix = path.join(dir_downloads_graphql, req.body.prefix);
        if (!fs.existsSync(dir_downloads_graphql_prefix)) {
            fs.mkdirSync(dir_downloads_graphql_prefix);
        }

        checkExist(s3FolderName + '/GraphQL/' + req.body.prefix + '/', req.body.filename).then((value) => {
            if (value) {

                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'redditaccesstoken': req.session.rd_access_token,
                    'twtaccesstokenkey': req.session.twt_access_token_key,
                    'twtaccesstokensecret': req.session.twt_access_token_secret,
                    'crimsonaccesstoken': req.session.crimson_access_token
                };

                p_array_2 = [];

                if (parseInt(req.body.pages) !== -999) {
                    if (req.body.prefix === 'twitter-Tweet' || req.body.prefix === 'twitter-Timeline'){
                        // post one time with all pages
                        p_array_2.push(gatherMultiPost(req.body.query, headers, parseInt(req.body.pages)));
                    }
                    else{
                        // flipping through pages
                        for (var i = 0; i < parseInt(req.body.pages); i++) {
                            p_array_2.push(gatherMultiPost(req.body.query, headers, i + 1));
                        }
                    }
                }
                else {
                    // no pagination available
                    p_array_2.push(gatherSinglePost(req.body.query, headers));
                }
                Promise.all(p_array_2).then(values => {
                    // piece the json together here
                    var key1 = Object.keys(values[0])[0];
                    var key2 = Object.keys(values[0][key1])[0];
                    var key3 = Object.keys(values[0][key1][key2])[0];
                    if ("errors" in values[0]) {
                        res.send({ERROR: values[0]['errors'][0]['message']});
                    } else {
                        responseObj = mergeJSON(values, [key1, key2, key3]);
                        // ------------------------------------save csv file---------------------------------------------------------
                        if (responseObj[key1][key2][key3].length > 0
                            && responseObj[key1][key2][key3] !== 'null'
                            && responseObj[key1][key2][key3] !== undefined) {

                            // if no such folder, create that folder
                            var directory = path.join(dir_downloads_graphql_prefix, req.body.filename);
                            if (!fs.existsSync(directory)) {
                                fs.mkdirSync(directory);
                            }

                            // save query parameters to it so history page can use it! Synchronous method
                            params = JSON.parse(req.body.params);
                            if (parseInt(req.body.pages) !== -999) params['pages:'] = parseInt(req.body.pages);
                            if (params['fields'] === "") params['fields'] = "DEFAULT";
                            fs.writeFileSync(path.join(directory, "config.json"), JSON.stringify(params), 'utf8');

                            // save json for future pagination purpose
                            // due to [{xxx:xxx},{xxx:xxx}...] is not a valid json format
                            var jsonObj = {};
                            jsonObj[req.body.prefix] = responseObj[key1][key2][key3];
                            var raw_json = req.body.filename + '.json';
                            fs.writeFileSync(path.join(directory, raw_json), JSON.stringify(jsonObj, null, 2), 'utf8');

                            // save CSV; Async
                            var processed = req.body.filename + '.csv';
                            var promise_csv = new Promise((resolve, reject) => {
                                jsonexport(jsonObj[req.body.prefix], {
                                    fillGaps: false,
                                    undefinedString: 'NaN'
                                }, function (err, csv) {
                                    if (err) reject(err);
                                    if (csv !== '') {
                                        fs.writeFile(path.join(directory, processed), csv, 'utf8', function (err) {
                                            if (err) {
                                                reject(err);
                                            } else {
                                                resolve();
                                            }
                                        });
                                    }
                                });
                            });

                            // post to s3 bucket
                            promise_csv.then(() => {
                                var promise_arr = [];
                                promise_arr.push(s3.uploadToS3(path.join(directory, processed),
                                    s3FolderName + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/' + processed));
                                promise_arr.push(s3.uploadToS3(path.join(directory, raw_json),
                                    s3FolderName + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/' + raw_json));
                                promise_arr.push(s3.uploadToS3(path.join(directory, "config.json"),
                                    s3FolderName + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/' + "config.json"));
                                Promise.all(promise_arr).then((URLs) => {

                                    var args = {
                                        's3FolderName': s3FolderName,
                                        'filename': processed,
                                        'remoteReadPath': s3FolderName + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/'
                                    };

                                    lambda_invoke('histogram', args).then(results => {

                                        if (results['url'] === 'null') {
                                            var rendering = responseObj[key1][key2][key3].slice(0, 100);
                                            s3.deleteLocalFolders(directory.slice(0, -1)).then(() => {
                                                res.send({fname: processed, URLs: URLs, rendering: rendering});
                                            }).catch(err => {
                                                console.log(err);
                                                res.send({ERROR: err});
                                            });
                                        }

                                        else {
                                            getMultiRemote(results['url']).then(function (data) {

                                                var histogram = data;
                                                var rendering = responseObj[key1][key2][key3].slice(0, 100);
                                                s3.deleteLocalFolders(directory.slice(0, -1)).then(() => {
                                                    res.send({
                                                        fname: processed, URLs: URLs, rendering: rendering,
                                                        histogram: histogram
                                                    });
                                                }).catch(err => { // deleteFolderERROR
                                                    console.log(err);
                                                    res.send({ERROR: err});
                                                });
                                            }).catch(err => { // download div error
                                                console.log(err);
                                                res.send({ERROR: err});
                                            });
                                        }

                                    }).catch(error => { // lambda histogram error
                                        console.log(error);
                                        res.send({'ERROR': error});
                                    });

                                }).catch(err => { // upload s3 ERROR
                                    console.log(err);
                                    res.send({ERROR: JSON.stringify(err)});
                                });

                            }).catch(err => { // save to CSV error
                                console.log(err);
                                res.send({ERROR: JSON.stringify(err)});
                            });

                        }
                        else {
                            res.send({ERROR: "Sorry, we couldn't find results that matches your query..."});
                        }
                    }

                }).catch((error) => {
                    res.send({ERROR: JSON.stringify(error)});
                })
            }
            else {
                res.send({ERROR: 'This filename ' + req.body.filename + ' already exist in your directory. Please rename it to something else!'});
            }
        });
    }
    else {
        res.send({ERROR: platform + " token expired! Please refresh the page."});
    }
});

router.post('/prompt', function (req, res) {
    lambda_invoke('bae_screen_name_prompt', {
        consumer_key: TWITTER_CONSUMER_KEY,
        consumer_secret: TWITTER_CONSUMER_SECRET,
        access_token: req.session.twt_access_token_key,
        access_token_secret: req.session.twt_access_token_secret,
        screen_name: req.body.screenName
    })
    .then(user => {
        res.send(user);
    })
    .catch(err => {
        console.log(err);
        reject(err);
    });
});

/****************************************************************** helper *****************************************************************************************/
function checkExist(remotePrefix, localFolderName) {
    var p = s3.list_folders(remotePrefix);
    return p.then(folderObj => {
        var subFolders = Object.keys(folderObj);
        for (var i = 0, length = subFolders.length; i < length; i++) {
            if (subFolders[i].toLowerCase() === localFolderName.toLowerCase()) {
                return false;
            }
        }
        return true;
    });
}

function gatherMultiPost(query, headers, pageNum) {
    // user regex to add a pages:pageNum in the query here
    if (pageNum !== -999) {
        query = query.replace(/(\) *{)/g, ",pages:" + pageNum + "$1");
    }
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5050/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({"query": query})
        }).then(function (response) {
            return response.text();
        }).then(function (responseBody) {
            responseBody = responseBody.replace(/\\r/g, '');
            var responseObj = JSON.parse(responseBody);
            if (responseObj!==undefined && responseObj['errors'] !== undefined) reject(responseObj['errors']);
            else resolve(responseObj);
            resolve(responseObj);
        }).catch((error) => {
            reject(error);
        });
    });
};

function gatherSinglePost(query, headers) {
    return new Promise((resolve, reject) => {
        fetch('http://localhost:5050/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({"query": query})
        }).then(function (response) {
            return response.text();
        }).then(function (responseBody) {
            responseBody = responseBody.replace(/\\r/g, '');
            var responseObj = JSON.parse(responseBody);

            if (responseObj!==undefined && responseObj['errors'] !== undefined) reject(responseObj['errors']);
            else resolve(responseObj);
        }).catch((error) => {
            reject(error);
        });
    });
};

function mergeJSON(values, keys) {
    /* {
        data{
            twitter{
                ...
            }
        }
    }*/
    var newJSON = {};

    newJSON[keys[0]] = {};
    newJSON[keys[0]][keys[1]] = {};
    newJSON[keys[0]][keys[1]][keys[2]] = [];

    for (var i = 0; i < values.length; i++) {
        newJSON[keys[0]][keys[1]][keys[2]] = newJSON[keys[0]][keys[1]][keys[2]].concat(values[i][keys[0]][keys[1]][keys[2]]);
    }

    return newJSON;
};

function checkSessionToken(session) {
    var response = {
        twitter: true,
        reddit: true,
        crimson: true
    };

    if (session.twt_access_token_key === undefined || session.twt_access_token_secret === undefined) {
        response['twitter'] = false;
    }

    if (session.rd_access_token === undefined) {
        response['reddit'] = false;
    }

    if (session.crimson_access_token === undefined) {
        response['crimson'] = false;
    }

    return response;

}

module.exports = router;
