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

// function to get report of messages from number ( consumer customer )
module.exports.getConsumerReportsMessages = function(event, context, callback) {

    var phoneNumber = event.pathParameters.phoneNumber;

    var payload = {
        TableName: "messages",
        KeyConditionExpression: "phoneNumber = :phn",
        ExpressionAttributeValues: {
            ":phn": phoneNumber
        }
    };

    // function to get messages in dynamo db with the above params
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

                var records = data.Items;
                var recordCount = 0;
                for(let i = 0; i < records.length; i++){

                    if(moment(records[i].createdAt).month() == moment().month() ){
                        recordCount++;
                        if(i == records.length-1) {
                            var response = {
                                statusCode: 200,
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    "message": "OK",
                                    "numberMessages": recordCount
                                })
                            };
                            callback(null, response);
                        }

                    }
                }

            }

        }

    });

};

// function to get report of messages from number ( business customer )
module.exports.getBusinessReportsMessages = function(event, context, callback) {

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


                var records = data.Items;
                var recordCount = 0;
                for(let i = 0; i < records.length; i++){

                    if(moment(records[i].createdAt).month() == moment().month() ){
                        recordCount++;
                        if(i == records.length-1) {
                            var response = {
                                statusCode: 200,
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    "message": "OK",
                                    "numberMessages": recordCount
                                })
                            };
                            callback(null, response);
                        }

                    }
                }

            }

        }

    });

};

