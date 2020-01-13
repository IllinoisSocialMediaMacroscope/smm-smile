var AWS = require('aws-sdk');

class BatchHelper{
    constructor(AWS_ACCESSKEY, AWS_ACCESSKEYSECRET){
        AWS.config.update({
            accessKeyId: AWS_ACCESSKEY,
            secretAccessKey: AWS_ACCESSKEYSECRET });

        this.batch = new AWS.Batch({region: 'us-west-2',
            apiVersion: '2016-08-10',
            maxRetries: 0,
            maxRedirects: 0,
            httpOptions:{timeout:600000}
        });
    }

    batch(jobDefinition, jobName, jobQueue, rabbitmqJobQueue, command){

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

}

module.exports = BatchHelper;
