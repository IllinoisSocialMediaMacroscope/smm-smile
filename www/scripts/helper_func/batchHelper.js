var AWS = require('aws-sdk');
var config = require('../../main_config');

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

module.exports = submit_Batchjob;
