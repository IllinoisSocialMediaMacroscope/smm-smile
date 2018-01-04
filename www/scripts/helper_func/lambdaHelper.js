var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '***REMOVED***', 
	secretAccessKey: '***REMOVED***' });
var lambda = new AWS.Lambda({region: 'us-west-2', apiVersion: '2015-03-31'});

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
				console.log(err, err.stack); // an error occurred
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