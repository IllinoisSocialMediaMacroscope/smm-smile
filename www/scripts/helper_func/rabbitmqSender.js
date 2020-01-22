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
    invoke(queue, msg) {

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
                        // determine if it's aws lambda or local lambda
                        if (process.env.LOCAL_ALGORITHM){
                            msg['platform'] = 'lambda';
                        }
                        else{
                            msg['platform'] = 'aws-labmda';
                        }
                        channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)),
                            {correlationId: correlationId, replyTo: q.queue});

                    });
                });
            });
        });
    }

    batch(jobDefinition, jobName, jobQueue, rabbitmqJobQueue, command){

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
                        var msg = {};
                        if (process.env.LOCAL_ALGORITHM){
                            msg['platform'] = 'batch';
                        }
                        else{
                            msg['platform'] = 'aws-batch';
                        }
                        msg['command'] = command.join(" ");
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
                        channel.sendToQueue(rabbitmqJobQueue, Buffer.from(msg),
                            {correlationId: correlationId, replyTo: q.queue});

                    });
                });
            });
        });

    }
}


module.exports = RabbitmqSender;

