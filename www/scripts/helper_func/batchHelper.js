var AWS = require('aws-sdk');
var config = require('../../main_config');
var uuidv4 = require('./uuidv4.js');

AWS.config.update({
	accessKeyId: config.aws.access_key,
	secretAccessKey: config.aws.access_key_secret });

var batch = new AWS.Batch({region: 'us-west-2', 
	apiVersion: '2016-08-10',
	maxRetries: 0,
	maxRedirects: 0,
	httpOptions:{timeout:600000}
});

function submit_Batchjob(jobDefinition, jobName, jobQueue, command){
	
	var params = {
		jobDefinition: jobDefinition,
		jobName: jobName,
		jobQueue: jobQueue,
		containerOverrides: {
			command: command,
			memory: 2048,
			vcpus: 2
		}
	};
	
	return new Promise((resolve,reject) =>{ 
		batch.submitJob(params, function(err, data) {
			if (err){
				console.log("there is an lambda error happening");
				console.log(err,err.stack);
				reject(err);
			}else{
				resolve(data);
			}
		});
	});

}

function batch_routes_template(req, config){

    return new Promise((resolve,reject) => {
        var uid = uuidv4();
        var jobName = s3FolderName + '_' + uid;

        // set default batch command
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

        submit_Batchjob(config.post.batch_config["batch_job_definition"], jobName, config.post.batch_config["batch_job_queue"], command)
        .then(results =>{
            results["ID"] = s3FolderName + config["result_path"] + uid + '/';
            resolve(results);
        })
        .catch(err =>{
        	console.log(err);
            reject(err);
        });
    });
}

module.exports = { batch_routes_template, submit_Batchjob };
