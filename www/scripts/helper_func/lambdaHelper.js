var AWS = require('aws-sdk');
AWS.config.update({
	accessKeyId: '***REMOVED***', 
	secretAccessKey: '***REMOVED***' });
	
var lambda = new AWS.Lambda({region: 'us-west-2', apiVersion: '2015-03-31'});

var params = {
	FunctionName: 'test_lambda_write2S3',
	//ClientContext: 'local',
	InvocationType: 'RequestResponse',
	LogType: 'Tail',
	Payload: JSON.stringify({'remoteReadPath':'local/GraphQL/twitter-Tweet/Iran/',
		's3FolderName':'local'})
};

lambda.invoke(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
	