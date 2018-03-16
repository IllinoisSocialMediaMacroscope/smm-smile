var AWS = require('aws-sdk');
var config = require('../../main_config');

AWS.config.update({
	accessKeyId: config.aws.access_key,
	secretAccessKey: config.aws.access_key_secret });
	
var lambda = new AWS.Lambda({region: 'us-west-2', 
								apiVersion: '2015-03-31',
								maxRetries: 0,
								maxRedirects: 0, 
								httpOptions:{timeout:600000}
							});

function lambda_invoke(function_name, args){
	
	var params = {
		FunctionName: function_name,
		InvocationType: 'RequestResponse',
		LogType: 'Tail',
		Payload: JSON.stringify(args)
	};

	return new Promise((resolve,reject) =>{
		lambda.invoke(params, function(err, data) {
			if (err){
				console.log("there is an lambda error happening");
				reject(err);
			}else{
				response = JSON.parse(data.Payload);
				if ('errorMessage' in response){
					reject(response['errorMessage']);
				}
				resolve(response);
			}
		});
	});

}


module.exports = lambda_invoke;