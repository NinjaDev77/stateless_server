'use strict';

const isE164PhoneNumber = require('is-e164-phone-number');

const PhoneController = require('./controller.js');


/**
 * Demonstrates a simple HTTP endpoint using API Gateway. You have full
 * access to the request and response payload, including headers and
 * status code.
 *
 * To scan a DynamoDB table, make a GET request with the TableName as a
 * query string parameter. To put, update, or delete an item, make a POST,
 * PUT, or DELETE request respectively, passing in the payload to the
 * DynamoDB API as a JSON body.
 */
exports.handler = (event, context, callback) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));

    const done = (err, res) => callback(null, {
        statusCode: err ? '400' : '200',
        body: err ? err.message : JSON.stringify(res),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    switch (event.httpMethod) {
        case 'DELETE':
            // dynamo.deleteItem(event, context);
            PhoneController.deletePhoneNumber(event, context, callback);
            break;
        case 'GET':
            // dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            PhoneController.getAllPhoneNumbers(event, context, callback);
            break;
        case 'POST':
            // dynamo.putItem(event, context);
            PhoneController.createPhoneNumber(event, context, callback);
            break;
        case 'PUT':
            // dynamo.updateItem(event, context);
            PhoneController.updatePhoneNumber(event, context, callback);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
