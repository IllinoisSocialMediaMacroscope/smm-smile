var amqp = require('amqplib/callback_api');

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class RabbitmqSender {
    constructor() {
    }

    // real time rabbitmq sender with reply
    invoke(function_name, queue, msg) {
        // determine if it's aws lambda or local lambda
        if (process.env.LOCAL_ALGORITHM==='true'){
            msg['platform'] = 'lambda';
        }
        else{
            msg['platform'] = 'aws-lambda';
            msg['function_name'] = function_name
        }

        return new Promise((resolve, reject) => {
            amqp.connect('amqp://rabbitmq:5672', function (error0, connection) {
                if (error0) reject(error0);

                connection.createChannel(function (error1, channel) {
                    if (error1) {
                        reject(error1);
                    }

                    channel.assertQueue('', {exclusive: true}, function (error2, q) {
                        if (error2) {
                            reject(error2);
                        }
                        var correlationId = uuidv4();

                        // reply
                        channel.consume(q.queue, function (msg) {
                            if (msg.properties.correlationId === correlationId) {
                                var parsedMsg = JSON.parse(msg.content.toString());
                                if ('ERROR' in parsedMsg){
                                    reject(parsedMsg['ERROR']);
                                }
                                else{
                                    resolve(parsedMsg);
                                }
                            }
                            setTimeout(function () {
                                connection.close();
                            }, 500); // time out in 5 minutes
                        }, {
                            noAck: true
                        });

                        // sender
                        channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)),
                            {correlationId: correlationId, replyTo: q.queue});
                    });
                });
            });
        });
    }

    batch(jobDefinition, jobName, jobQueue, rabbitmqJobQueue, command){

        // determine if it's aws lambda or local lambda
        var msg = {};
        if (process.env.LOCAL_ALGORITHM==='true'){
            msg['platform'] = 'batch';
        }
        else{
            msg['platform'] = 'aws-batch';
            msg['jobDefinition'] = jobDefinition;
            msg['jobName'] = jobName;
            msg['jobQueue'] = jobQueue;
        }
        msg['command'] = command;

        return new Promise((resolve, reject) => {
            amqp.connect('amqp://rabbitmq:5672', function (error0, connection) {
                if (error0) reject(error0);

                connection.createChannel(function (error1, channel) {
                    if (error1) {
                        reject(error1);
                    }

                    channel.assertQueue(rabbitmqJobQueue, {durable:false});
                    channel.sendToQueue(rabbitmqJobQueue, Buffer.from(JSON.stringify(msg)));
                    resolve({
                        "jobName":jobName,
                        "jobId":"Not Applicable",
                    });
                });
            });
        });

    }
}


module.exports = RabbitmqSender;

