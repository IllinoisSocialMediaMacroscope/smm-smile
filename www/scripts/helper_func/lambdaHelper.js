var AWS = require('aws-sdk');

class LambdaHelper{
	constructor(AWS_ACCESSKEY, AWS_ACCESSKEYSECRET){
		AWS.config.update({
			accessKeyId: AWS_ACCESSKEY,
            secretAccessKey: AWS_ACCESSKEYSECRET });

		this.lambda = new AWS.Lambda({region: 'us-west-2',
			apiVersion: '2015-03-31',
			maxRetries: 0,
			maxRedirects: 0,
			httpOptions:{timeout:600000}
		});
	}

    /**
	 * wrapper function to invoke any AWS lambda with parameters`
     * @param function_name
     * @param args
     */
	invoke(function_name, queue, args) {

		var params = {
			FunctionName: function_name,
			InvocationType: 'RequestResponse',
			LogType: 'Tail',
			Payload: JSON.stringify(args)
		};

		return new Promise((resolve, reject) => {
			this.lambda.invoke(params, function (err, data) {
				if (err) {
					console.log("there is an lambda error happening");
					reject(err);
				} else {
					var response = JSON.parse(data.Payload);
					if ('errorMessage' in response) {
						reject(response['errorMessage']);
					}
					resolve(response);
				}
			});
		});
	}

}



module.exports = LambdaHelper;
