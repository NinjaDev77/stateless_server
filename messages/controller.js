'use strict';

const moment = require('moment');
const uuid = require('uuid/v4');
const isE164PhoneNumber = require('is-e164-phone-number');
const doc = require('dynamodb-doc');
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

// function to check the existence of the provided phone number 
function isPhoneNumberExist(phoneNumber){

    var payloads = {
        TableName: "phoneNumber",
        KeyConditionExpression: "phoneNumber = :phn",
        ExpressionAttributeValues: {
            ":phn": phoneNumber
        }
    };

    return new Promise (function(resolve, reject){

        dynamo.query(payloads, function(err, data) {

            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                //res.status(400).json({code:400,message :err.message});
            } else {
                // if no records found then reject else resolve
                if (data.Items.length === 0 ) {

                    reject();
                } else {
                    resolve()
                }
            }

        });

    })

}

// function to check the existence of the provided phone number and id property 
function isIdPropertyExist(phoneNumber, idProperty){

    var payloads = {
        TableName: "property",
        KeyConditionExpression: "phoneNumber = :phn AND idProperty = :id",
        ExpressionAttributeValues: {
            ":phn": phoneNumber,
            ":id": idProperty
        }
    };

    return new Promise (function(resolve, reject){

        dynamo.query(payloads, function(err, data) {

            if (err) {
                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                //res.status(400).json({code:400,message :err.message});
            } else {
                // if no records found then reject else resolve
                if (data.Items.length === 0 ) {
                    reject();
                } else {
                    resolve()
                }
            }

        });

    })

}

// function to get messages from number ( consumer customer )
module.exports.getConsumerMessage = function(event, context, callback) {

    var phoneNumber = event.pathParameters.phoneNumber;

    var payload = {
        TableName: "messages",
        KeyConditionExpression: "phoneNumber = :phn",
        ExpressionAttributeValues: {
            ":phn": phoneNumber
        }
    };

    // function to get appointment in dynamodb with the above params
    dynamo.query(payload, function(err, data) {

        if (err) {

            console.error(err);
            var response = {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "Error in getting message!"
                })
            };
            callback(null, response);

        } else {

            if (data.Items.length === 0) {

                var response = {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "message": "No message was found!"
                    })
                };
                callback(null, response);

            } else {

                var response = {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "message": "OK",
                        "data": data.Items
                    })
                };
                callback(null, response);

            }

        }

    });

};

// function to get messages from number ( business customer )
module.exports.getBusinessMessage = function(event, context, callback) {

    var phoneNumber = event.pathParameters.phoneNumber;
    var idPropertyCustomer  = event.pathParameters.idProperty;

    var payload = {
        TableName: 'messages',
        Select: 'ALL_ATTRIBUTES',
        ReturnConsumedCapacity: 'TOTAL',
        FilterExpression: '#phoneNumber = :phoneNumber and #idPropertyCustomer = :idPropertyCustomer' ,
        ExpressionAttributeNames: {
            '#phoneNumber': 'phoneNumber',
            '#idPropertyCustomer' : 'idPropertyCustomer'
        },
        ExpressionAttributeValues: {
            ':phoneNumber': phoneNumber,
            ':idPropertyCustomer': idPropertyCustomer
        }
    };

    // function to get appointment in dynamodb with the above params
    dynamo.scan(payload, function(err, data) {

        if (err) {

            console.error(err);
            var response = {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "Error in getting message"
                })
            };
            callback(null, response);

        } else {

            if (data.Items.length === 0) {

                var response = {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "message": "No message was found!"
                    })
                };
                callback(null, response);

            } else {

                var response = {
                    statusCode: 200,
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "message": "OK",
                        "data": data.Items
                    })
                };
                callback(null, response);

            }

        }

    });

};

// function to store messages from number ( consumer customer )
module.exports.storeConsumerMessage = function(event, context, callback) {

    var body = JSON.parse(event.body);
    var phoneNumber = event.pathParameters.phoneNumber;
    var messageId = uuid();

    var ifNumbervalid = isE164PhoneNumber('+' + phoneNumber);

    if (!ifNumbervalid) {

        var response = {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "message": "Phone number is not in E164 format"
            })
        };

        callback(null, response);

    } else {

        // isPhoneNumberExist(phoneNumber).then(function(){

        var urlRecording = body.urlRecording;

        if (urlRecording === null || urlRecording === undefined){

            var response = {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "Mandatory Field is missing !"
                })
            };
            callback(null, response);

        } else {

            var payload = {
                TableName: 'messages',
                Item: { // a map of attribute name to AttributeValue
                    "phoneNumber": phoneNumber,
                    "messageId": messageId,
                    "urlRecording": urlRecording
                },
                ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
                ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
                ReturnItemCollectionMetrics: 'NONE' // optional (NONE | SIZE)
            };

            //method to put into the dynamodb
            dynamo.put(payload, function(err, data) {
                if (err) {

                    console.error(err); // an error occurred
                    var response = {
                        statusCode: 400,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "message": "Error in creating message!"
                        })
                    };
                    callback(null, response);

                } else {

                    var response = {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "message": "OK"
                        })
                    };
                    callback(null, response);

                }
            });

        }

        // }).catch(function(){
        //   var response = {
        //     statusCode: 400,
        //     headers: {
        //       "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //       "message": "Phone number not found !"
        //     })
        //   };
        //   callback(null, response);
        // })

    }

};

// function to store messages from number ( business customer )
module.exports.storeBusinessMessage = function(event, context, callback) {

    var body = JSON.parse(event.body);
    var phoneNumber = event.pathParameters.phoneNumber;
    var messageId = uuid();
    var idPropertyCustomer = event.pathParameters.idProperty;

    var ifNumbervalid = isE164PhoneNumber('+' + phoneNumber)
    if (!ifNumbervalid) {

        var response = {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "message": "Phone number is not in E164 format"
            })
        };

        callback(null, response);

    } else {

        // isIdPropertyExist(phoneNumber, idProperty).then(function(){

        var urlRecording = body.urlRecording;

        if (urlRecording === null || urlRecording === undefined){

            var response = {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "Mandatory Field is missing !"
                })
            };
            callback(null, response);

        } else {

            var payload = {
                TableName: 'messages',
                Item: { // a map of attribute name to AttributeValue
                    "phoneNumber": phoneNumber,
                    "messageId": messageId,
                    "idPropertyCustomer": idPropertyCustomer,
                    "urlRecording": urlRecording
                },
                ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
                ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
                ReturnItemCollectionMetrics: 'NONE' // optional (NONE | SIZE)
            };

            //method to put into the dynamodb
            dynamo.put(payload, function(err, data) {

                if (err) {

                    console.error(err); // an error occurred
                    var response = {
                        statusCode: 400,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "message": "Error in creating message"
                        })
                    };
                    callback(null, response);

                } else {

                    var response = {
                        statusCode: 200,
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "message": "OK"
                        })
                    };
                    callback(null, response);

                }

            });

        }

        // }).catch(function(){
        //   var response = {
        //     statusCode: 400,
        //     headers: {
        //       "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //       "message": "Phone number not found !"
        //     })
        //   };
        //   callback(null, response);
        // })

    }

};

// function to delete messages from number ( consumer customer )
module.exports.deleteConsumerMessage = function(event, context, callback) {

    var phoneNumber = event.pathParameters.phoneNumber;
    var payloads = {
        TableName: "messages",
        Key: {
            "phoneNumber": phoneNumber
        }
    }
    // function to delete profile in dynamodb
    dynamo.delete(payloads, function(err, data) {
        if (err) {

            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            var response = {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "Error in deleting message"
                })
            };
            callback(null, response);

        } else {

            var response = {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "OK"
                })
            };
            callback(null, response);


        }

    });
};

// function to delete messages from number ( business customer )
module.exports.deleteBusinessMessage = function(event, context, callback) {

    var phoneNumber = event.pathParameters.phoneNumber;
    var idPropertyCustomer = event.pathParameters.idProperty;
    var payloads = {
        TableName: "messages",
        Key: {
            "phoneNumber": phoneNumber,
            "idPropertyCustomer": idPropertyCustomer
        }
    };
    // function to delete profile in dynamodb
    dynamo.delete(payloads, function(err, data) {
        if (err) {

            console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
            var response = {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "Error in deleting message"
                })
            };
            callback(null, response);

        } else {

            var response = {
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": "OK"
                })
            };
            callback(null, response);


        }

    });
};