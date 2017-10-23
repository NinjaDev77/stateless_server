'use strict';
var accountSid = process.env.accountSid;
var authToken = process.env.authToken;
var twilioNumber= process.env.twilioNumber;
var twiMlUrl  = process.env.twiMlUrl
var client = require('twilio')(accountSid, authToken);
const moment = require('moment');
const AWS = require('aws-sdk');
const uuid  = require('uuid/v4');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));
  var body = JSON.parse(event.body);
  var toPhoneNumber = body.toPhoneNumber;
  var idProperty    = body.idProperty ;
  var phoneNumber   = event.pathParameters.phoneNumber.toString();
  //var phoneNumber = (event.pathParameters.phoneNumber.toString().charAt(0) === "+") ? (event.pathParameters.phoneNumber.toString()) : ("+" + event.pathParameters.phoneNumber.toString())
  var callUrl = `https://c17ceu2r2h.execute-api.us-east-1.amazonaws.com/serverlessapp/notifications/${toPhoneNumber}`;

  client.calls.create({
    url   : callUrl,
    to    : (phoneNumber.toString().charAt(0) === "+") ? (phoneNumber.toString()) : ("+" + phoneNumber.toString()),
    from  : twilioNumber
  },function(err,call){

    if (!err){

            var payload = {
                TableName: 'outboundCalls',
                Item: { // a map of attribute name to AttributeValue
                  "id"            : uuid(),
                  "phoneNumber"   : phoneNumber,
                  "idProperty"    : idProperty,
                  "toPhoneNumber" : toPhoneNumber,
                  "dateTimeCall"  : moment().toISOString()
                },
                ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
                ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
                ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
              };
              dynamo.put(payload, function(err, data) {
                if (err) {

                  console.error(err); // an error occurred
                  var response = {
                    statusCode: 500,
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                      "message": err
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

    } else {

      var response = {

        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(err)
      };

      callback(null, response);

    }
  });

};
