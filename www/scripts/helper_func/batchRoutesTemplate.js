var uuidv4 = require('./uuidv4.js');


function batchRoutesTemplate(req, config, handler) {

    return new Promise((resolve, reject) => {
        var uid = uuidv4();
        var jobName = s3FolderName + '_' + uid;

        // set default batch command
        if ('post' in config) {

            if ('rabbitmq_queue' in config.post) var rabbitmqJobQueue = config.post.rabbitmq_queue;

            var command = [
                config.post.batch_config["batch_action"],
                config.post.batch_config["batch_script"],
                "--remoteReadPath", req.body.prefix,
                "--s3FolderName", s3FolderName,
                "--column", req.body.selectFileColumn,
                '--resultPath', config.result_path,
                "--email", req.body.email,
                "--uid", uid,
                "--sessionURL", req.body.sessionURL
            ];

            // add extra batch command params
            for (var i = 0; i < config.args.length; i++) {
                var arg_name = config.args[i];
                command.push("--" + arg_name);
                command.push(req.body[arg_name]);
            }

            handler.batch(config.post.batch_config["batch_job_definition"], jobName, config.post.batch_config["batch_job_queue"],
                rabbitmqJobQueue, command)
            .then(results => {
                results["ID"] = s3FolderName + config["result_path"] + uid + '/';
                resolve(results);
            })
            .catch(err => {
                console.log(err);
                reject(err);
            });
        }

    });
}

module.exports = batchRoutesTemplate;
