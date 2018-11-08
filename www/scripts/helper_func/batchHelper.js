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

function submit_Batchjob(jobName, command){
	
	var params = {
		jobDefinition: "arn:aws:batch:us-west-2:083781070261:job-definition/smile:3",
		jobName: jobName,
		jobQueue: 'arn:aws:batch:us-west-2:083781070261:job-queue/SMILE_batch',
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