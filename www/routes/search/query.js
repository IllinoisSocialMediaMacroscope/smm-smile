var express = require('express');
var router = express.Router();
var fetch = require('node-fetch');
var fs = require('fs');
var jsonexport = require('jsonexport');
var path = require('path');
var appPath = path.dirname(path.dirname(__dirname));
var getMultiRemote = require(path.join(appPath, 'scripts', 'helper_func', 'getRemote.js'));

router.get('/authorized', checkIfLoggedIn, function(req, res){
    checkAuthorized(req).then(status => {
        res.send(status);
    })
    .catch(checkAuthorizedError =>{
        res.send({ERROR: checkAuthorizedError});
    })
});

router.get('/query', checkIfLoggedIn, function (req, res) {
    checkAuthorized(req).then(status => {
        res.render('search/query', {
            user: req.user,
            parent: '/',
            error: req.query.error,
            DOCKERIZED: process.env.DOCKERIZED === 'true',
            status: status,
        });
    })
    .catch(checkAuthorizedError =>{
        res.send({ERROR: checkAuthorizedError});
    });
});

router.post('/query-dryrun', checkIfLoggedIn, function (req, res) {
    checkAuthorized(req).then(status => {
        var platform = req.body.prefix.split('-')[0];

        if (status[platform] || req.body.prefix === 'reddit-Historical-Post' || req.body.prefix === 'reddit-Historical-Comment') {
            retrieveCredentials(req).then(obj => {
                var headers = {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'redditaccesstoken': obj['rd_access_token'],
                    'twtaccesstokenkey': obj['twt_access_token_key'],
                    'twtaccesstokensecret': obj['twt_access_token_secret'],
                    'crimsonaccesstoken': obj['crimson_access_token']
                };

                gatherSinglePost(req, headers).then(responseObj => {
                    var key1 = Object.keys(responseObj)[0];
                    var key2 = Object.keys(responseObj[key1])[0];
                    var key3 = Object.keys(responseObj[key1][key2])[0];
                    res.send({
                        rendering: responseObj[key1][key2][key3]
                    });
                })
                .catch(gatherSinglePostError => {
                    res.send({ERROR: gatherSinglePostError});
                });
            })
            .catch(retrieveCredentialsError =>{
                res.send({ERROR: retrieveCredentialsError});
            });
        }
        else {
            res.send({ERROR: platform + " token expired! Please refresh the page."});
        }
    })
    .catch(checkAuthorizedError => {
        res.send({ERROR: checkAuthorizedError});
    });
});

router.post('/query', checkIfLoggedIn, function (req, res) {
    checkAuthorized(req).then(status => {
        var platform = req.body.prefix.split('-')[0];
        if (status[platform] || req.body.prefix === 'reddit-Historical-Post'
            || req.body.prefix === 'reddit-Historical-Comment') {
            retrieveCredentials(req).then(obj => {
                if (!fs.existsSync(smileHomePath)) {
                    fs.mkdirSync(smileHomePath);
                }

                // if that user path doesn't exist
                if (!fs.existsSync(path.join(smileHomePath, req.user.username))) {
                    fs.mkdirSync(path.join(smileHomePath, req.user.username));
                }

                var dir_downloads = path.join(smileHomePath, req.user.username, 'downloads');
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

                checkExist(req.user.username + '/GraphQL/' + req.body.prefix + '/', req.body.filename)
                .then((value) => {
                    if (value) {

                        var headers = {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'redditaccesstoken': obj['rd_access_token'],
                            'twtaccesstokenkey': obj['twt_access_token_key'],
                            'twtaccesstokensecret': obj['twt_access_token_secret'],
                            'crimsonaccesstoken': obj['crimson_access_token']
                        };

                        p_array_2 = [];

                        if (parseInt(req.body.pages) !== -999) {
                            if (req.body.prefix === 'twitter-Tweet' || req.body.prefix === 'twitter-Timeline') {
                                // post one time with all pages
                                p_array_2.push(gatherMultiPost(req, headers, parseInt(req.body.pages)));
                            } else {
                                // flipping through pages
                                for (var i = 0; i < parseInt(req.body.pages); i++) {
                                    p_array_2.push(gatherMultiPost(req, headers, i + 1));
                                }
                            }
                        } else {
                            // no pagination available
                            p_array_2.push(gatherSinglePost(req, headers));
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
                                            req.user.username + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/' + processed));
                                        promise_arr.push(s3.uploadToS3(path.join(directory, raw_json),
                                            req.user.username + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/' + raw_json));
                                        promise_arr.push(s3.uploadToS3(path.join(directory, "config.json"),
                                            req.user.username + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/' + "config.json"));
                                        Promise.all(promise_arr).then((URLs) => {

                                            var args = {
                                                's3FolderName': req.user.username,
                                                'filename': processed,
                                                'remoteReadPath': req.user.username + '/GraphQL/' + req.body.prefix + '/' + req.body.filename + '/'
                                            };

                                            if (req.body.prefix !== ('crimson-Hexagon')) {
                                                lambdaHandler.invoke('histogram', 'histogram', args).then(results => {
                                                    if (results['url'] === 'null') {
                                                        var rendering = responseObj[key1][key2][key3].slice(0, 100);
                                                        s3.deleteLocalFolders(directory.slice(0, -1)).then(() => {
                                                            res.send({
                                                                fname: processed,
                                                                URLs: URLs,
                                                                rendering: rendering
                                                            });
                                                        }).catch(deleteLocalFoldersError => {
                                                            res.send({ERROR: deleteLocalFoldersError});
                                                        });
                                                    } else {
                                                        getMultiRemote(results['url']).then(function (data) {

                                                            var histogram = data;
                                                            var rendering = responseObj[key1][key2][key3].slice(0, 100);
                                                            s3.deleteLocalFolders(directory.slice(0, -1)).then(() => {
                                                                res.send({
                                                                    fname: processed,
                                                                    URLs: URLs,
                                                                    rendering: rendering,
                                                                    histogram: histogram
                                                                });
                                                            }).catch(deleteLocalFoldersError => { // deleteFolderERROR
                                                                res.send({ERROR: deleteLocalFoldersError});
                                                            });
                                                        }).catch(getMultiRemoteError => {
                                                            res.send({ERROR: getMultiRemoteError});
                                                        });
                                                    }

                                                }).catch(lambdaHandlerError => {
                                                    res.send({'ERROR': lambdaHandlerError});
                                                });
                                            } else {
                                                s3.deleteLocalFolders(directory.slice(0, -1)).then(() => {
                                                    res.send({fname: processed, URLs: URLs});
                                                }).catch(deleteLocalFoldersError => {
                                                    res.send({ERROR: deleteLocalFoldersError});
                                                });
                                            }
                                        }).catch(uploadToS3Error => {
                                            res.send({ERROR: JSON.stringify(uploadToS3Error)});
                                        });

                                    }).catch(jsonexportError => {
                                        res.send({ERROR: JSON.stringify(jsonexportError)});
                                    });

                                } else {
                                    res.send({ERROR: "Sorry, we couldn't find results that matches your query..."});
                                }
                            }

                        }).catch((gatherMultiPostError) => {
                            res.send({ERROR: JSON.stringify(gatherMultiPostError)});
                        })
                    } else {
                        res.send({ERROR: 'This filename ' + req.body.filename + ' already exist in your directory. Please rename it to something else!'});
                    }
                });
            })
            .catch(retrieveCredentialsError => {
                res.send({ERROR: retrieveCredentialsError});
            });
        }
        else{
            res.send({ERROR: platform + " token expired! Please refresh the page."})
        }
    }).catch(checkAuthorizedError => {
        res.send({ERROR: checkAuthorizedError});
    });
});

router.post('/prompt', checkIfLoggedIn, function (req, res) {
    retrieveCredentials(req).then(obj =>{
        lambdaHandler.invoke('bae_screen_name_prompt', 'bae_screen_name_prompt', {
                consumer_key: TWITTER_CONSUMER_KEY,
                consumer_secret: TWITTER_CONSUMER_SECRET,
                access_token: obj['twt_access_token_key'],
                access_token_secret: obj['twt_access_token_secret'],
                screen_name: req.body.screenName
            })
            .then(userinfo => {
                res.send(userinfo);
            })
            .catch(lambdaHandlerError => {
                res.send({ERROR: lambdaHandlerError});
            });
        }).catch(retrieveCredentialsError =>{
        res.send({ERROR: retrieveCredentialsError});
    });
});

/****************************************************************** helper *****************************************************************************************/
function retrieveCredentials(req) {
    return new Promise((resolve, reject) => {
        if (process.env.DOCKERIZED === 'true') {
            redisClient.hgetall(req.user.username, function (err, obj) {
                if (err) {
                    reject(err);
                } else if (obj) {
                    resolve(obj)
                }
            });
        } else {
            if (req.session) resolve(req.session);
            else reject("There is no credential exists in the session!");
        }
    });
}

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

function gatherMultiPost(req, headers, pageNum) {
    // user regex to add a pages:pageNum in the query here
    var query = req.body.query;
    if (pageNum !== -999) {
        query = query.replace(/(\) *{)/g, ",pages:" + pageNum + "$1");
    }

    var platform = req.body.prefix.split('-')[0];

    return new Promise((resolve, reject) => {
        fetch('http://'+ SMILE_GRAPHQL +':5050/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({"query": query })
        }).then(function (response) {
            return response.text();
        }).then(function (responseBody) {
            responseBody = responseBody.replace(/\\r/g, '');
            var responseObj = JSON.parse(responseBody);
            if (responseObj!==undefined && responseObj['errors'] !== undefined){
                reject(responseObj['errors']);
                removeInvalidToken(req, platform);
            }
            else {
                resolve(responseObj);
            }
        }).catch((fetchError) => {
            removeInvalidToken(req, platform);
            reject(fetchError);
        });
    });
}

function gatherSinglePost(req, headers) {
    var platform = req.body.prefix.split('-')[0];

    return new Promise((resolve, reject) => {
        fetch('http://' + SMILE_GRAPHQL + ':5050/graphql', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({"query": req.body.query})
        }).then(function (response) {
            return response.text();
        }).then(function (responseBody) {
            responseBody = responseBody.replace(/\\r/g, '');
            var responseObj = JSON.parse(responseBody);
            if (responseObj!==undefined && responseObj['errors'] !== undefined) {
                reject(responseObj['errors']);
                removeInvalidToken(req, platform);
            }
            else{
                resolve(responseObj);
            }
        }).catch((fetchError) => {
            removeInvalidToken(req, platform);
            reject(fetchError);
        });
    });
}

function removeInvalidToken(req, platform){
    if (process.env.DOCKERIZED === 'true') {
        if (platform === 'twitter') {
            redisClient.hdel(req.user.username, 'twt_access_token_key');
            redisClient.hdel(req.user.username, 'twt_access_token_secret');
        } else if (platform === 'reddit') {
            redisClient.hdel(req.user.username, 'rd_access_token');
        } else if (platform === 'crimson') {
            redisClient.hdel(req.user.username, 'crimson_access_token');
        }
    }
    else{
        if (platform === 'twitter'){
            req.session.twt_access_token_key = null;
            req.session.twt_access_token_secret = null;
        } else if (platform === 'reddit') {
            req.session.rd_access_token = null;
        } else if (platform === 'crimson') {
            req.session.crimson_access_token = null;
        }
        req.session.save();
    }
}

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
}

function checkAuthorized(req) {
    return new Promise((resolve, reject) => {
        var response = {
            twitter: false,
            reddit: false,
            crimson: false,
        };

        if (process.env.DOCKERIZED === 'true') {
            redisClient.hgetall(req.user.username, function (err, obj) {
                if (err) {
                    reject(err);
                } else {
                    if (obj && 'twt_access_token_key' in obj && 'twt_access_token_secret' in obj) response['twitter'] = true;
                    if (obj && 'rd_access_token' in obj) response['reddit'] = true;
                    if (obj && 'crimson_access_token' in obj) response['crimson'] = true;
                    resolve(response);
                }
            });
        }
        else{
            if (req.session.twt_access_token_key && req.session.twt_access_token_secret) response['twitter'] = true;
            if (req.session.rd_access_token) response['reddit'] = true;
            if (req.session.crimson_access_token) response['crimson'] = true;
            resolve(response);
        }
    });
}

module.exports = router;
