'use strict';

const isE164PhoneNumber = require('is-e164-phone-number');

const controller = require('./controller.js');


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

  switch (event.httpMethod) {

    case 'GET':
    // dynamo.scan({ TableName: event.queryStringParameters.TableName }, done);
      controller.getProfile(event, context);
      break;

    case 'POST':
      controller.createProfile(event, context);
      break;

    case 'DELETE':
      controller.deleteProfile(event, context);
      break;

    case 'PUT':
      controller.updateProfile(event, context);
      break;

    default:
      done(new Error(`Unsupported method "${event.httpMethod}"`));
  }
};
