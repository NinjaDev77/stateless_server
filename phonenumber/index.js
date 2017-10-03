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
            // dynamo.deleteItem(JSON.parse(event.body), done);
            const res = PhoneController.deletePhoneNumber(JSON.parse(event.body));
            callback(null, res);
            break;
        case 'GET':
            // dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
            const res = PhoneController.getAllPhoneNumbers();
            callback(null, res);
            break;
        case 'POST':
            // dynamo.putItem(JSON.parse(event.body), done);
            const res = PhoneController.createPhoneNumber(JSON.parse(event.body));
            callback(null, res);
            break;
        case 'PUT':
            // dynamo.updateItem(JSON.parse(event.body), done);
            const res = PhoneController.updatePhoneNumber(JSON.parse(event.body));
            callback(null, res);
            break;
        default:
            done(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
