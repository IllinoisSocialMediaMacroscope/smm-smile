var uuidv4 = require('./uuidv4.js');
var getMultiRemote = require('./getRemote.js');
var CSV = require('csv-string');

function lambdaRoutesTemplate(req, config, handler ){

    return new Promise((resolve,reject) => {
        var uid;
        if (req.body.uid === undefined || req.body.uid === ""){
            uid = uuidv4();
        }
        else{
            // over write uuid for text classification; since three steps share the same uid
            uid = req.body.uid;
        }

        // set default lambda arguments
        var args = {
            'remoteReadPath': req.body.prefix,
            'resultPath': config.result_path,
            'column': req.body.selectFileColumn,
            's3FolderName': s3FolderName,
            'uid': uid
        };
        for (var i = 0; i < config.args.length; i++) {
            var arg_name = config.args[i];
            args[arg_name] = req.body[arg_name];
        }
        // invoke depending on the handler could be lambda, could be rabbitmq
        if ('post' in config) {
            var lambdaConfig = config.post.lambda_config;
            if ('rabbitmq_queue' in config.post) var queue = config.post.rabbitmq_queue;
        }
        else if ('put' in config) {
            var lambdaConfig = config.put.lambda_config;
            if ('rabbitmq_queue' in config.put) var queue = config.put.rabbitmq_queue;
        }
        handler.invoke(lambdaConfig["aws_lambda_function"], queue, args).then(results => {

            // fetch all the data from url, and add those to the result content
            // this might be slow since we are fetching everything
            // in theory we only need to fetch image and previews
            var promise_array = [];
            var resultConfig = config.results;
            for (var i = 0; i < resultConfig.length; i++) {
                if (resultConfig[i]['acronym'] in results){
                    promise_array.push(getMultiRemote(results[resultConfig[i]['acronym']]));
                }
                else{
                    // push empty promise to resever the spot
                    promise_array.push(new Promise((resolve,reject) => {resolve();}));
                }
            }

            Promise.all(promise_array).then(values => {
                // put together data to send
                var download = [];
                var preview = [];
                var img = [];
                var wordtree;


                for (var i = 0; i < resultConfig.length; i++) {
                    if (resultConfig[i]['acronym'] in results) {
                        if (resultConfig[i]["download"]) {
                            download.push({
                                name: resultConfig[i]["name"],
                                content: results[resultConfig[i]['acronym']]
                            })
                        }

                        if (resultConfig[i]["preview"]) {
                            // sort string to array
                            var preview_arr = CSV.parse(values[i]).slice(0, 1001);
                            if (resultConfig[i]["dataTable"] !== undefined)
                                preview.push({
                                    name: resultConfig[i]["name"],
                                    content: preview_arr,
                                    dataTable: resultConfig[i]["dataTable"]
                                });
                            else {
                                preview.push({
                                    name: resultConfig[i]["name"],
                                    content: values[i],
                                    dataTable: false
                                })
                            }
                        }

                        if (resultConfig[i]["img"]) {
                            img.push({
                                name: resultConfig[i]["name"],
                                content: values[i],
                                url: results[resultConfig[i]["acronym"]]
                            })
                        }

                        if ("wordtree" in resultConfig[i] && resultConfig[i]["wordtree"]){
                            var phrase_array = values[i].toString().split("\n");
                            var new_phrase_array = [];
                            for (var j = 0, length= phrase_array.length; j<length; j++){
                                //add [] to make it comply with google word tree requirement
                                new_phrase_array.push([phrase_array[j]]);
                            }
                            wordtree = {
                                name: resultConfig[i]["name"],
                                content: new_phrase_array,
                                root: ""
                            }

                        }
                    }
                }

                var data = ({
                    ID: s3FolderName + config['result_path'] + uid + "/",
                    img: img,
                    download: download,
                    preview: preview,
                    wordtree: wordtree
                });

                resolve(data);
            })
            .catch( (error) =>{
                reject(error);
            });
        })
        .catch( error =>{
            reject(error);
        });
    });

}

module.exports = lambdaRoutesTemplate
