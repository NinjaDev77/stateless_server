'use strict';

const moment = require('moment');
const uuid = require('uuid/v4');
const isE164PhoneNumber = require('is-e164-phone-number');
const doc = require('dynamodb-doc');
const AWS = require('aws-sdk');


const dynamo = new AWS.DynamoDB.DocumentClient();

// function to get profile
module.exports.getProfile = function(event, context, callback) {
  var phoneNumber = event.pathParameters.proxy;

  var payload = {
    TableName: "profile",
    KeyConditionExpression: "phoneNumber = :phn",
    ExpressionAttributeValues: {
      ":phn": phoneNumber
    }
  };
  // var payload = {
  //   TableName: "profile",
  // 	ReturnConsumedCapacity   : "TOTAL"
  // }
  // function to get profile in dynamodb with the above params
  dynamo.query(payload, function(err, data) {
    if (err) {
      console.error(err);
      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Error in getting profile"
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
            "message": "No profile was Found !"
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
  //  }

};

// function to create profile
module.exports.createProfile = function(event, context, callback) {
  let body = JSON.parse(event.body);
  let phoneNumber = event.pathParameters.proxy;

  let customerID        = body.customerID,
    customerType        = body.customerType,
    customerEmail       = body.customerEmail,
    customerMobile      = body.customerMobile,
    uriAudioWelcome     = body.uriAudioWelcome,
    uriAudioAppointment = body.uriAudioAppointment,
    routingActive       = body.routingActive,
    routingPhone        = body.routingActive;

  var payload = {
    TableName: 'profile',
    Item: { // a map of attribute name to AttributeValue

      "phoneNumber"         : phoneNumber,
      "customerType"        : body.customerType,
      "customerID"          : body.customerID,
      "customerEmail"       : body.customerEmail,
      "customerMobile"      : body.customerMobile,
      "uriAudioWelcome"     : body.uriAudioWelcome,
      "uriAudioAppointment" : body.uriAudioAppointment,
      "routingActive"       : body.routingActive,
      "routingPhone"        : body.routingPhone,
      "dateTimeCreated"     : moment().toISOString(),
      "dateTimeUpdated"     : moment().toISOString()

    },
    ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
    ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
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
          "message": "Error in updating profile"
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

    } // successful response
  });

}

//function to delete profile
module.exports.deleteProfile = function(event, context, callback) {

  var phoneNumber = event.pathParameters.proxy;
  var payloads = {
    TableName: "profile",
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
          "message": "Error in delete profile"
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

// function to update profile
module.exports.updateProfile = function(event, context, callback) {

  let req                 = event;
  let body                = JSON.parse(req.body);
  let params              = req.pathParameters;
  let phoneNumber         = event.pathParameters.proxy;
  let customerID          = body.customerID;
  let customerType        = body.customerType;
  let customerEmail       = body.customerEmail;
  let customerMobile      = body.customerMobile;
  let uriAudioWelcome     = body.uriAudioWelcome;
  let uriAudioAppointment = body.uriAudioAppointment;
  let routingActive       = (body.routingActive === true ? body.routingActive : undefined);
  let routingPhone        = (body.routingActive === true ? body.routingPhone : undefined);

  // object to map to the db attribute value
  let dbAttributeValue = {
    ":cusId"    : customerID,
    ":cusType"  : customerType,
    ":cusEmail" : customerEmail,
    ":cusMobile": customerMobile,
    ":uriAudWel": uriAudioWelcome,
    ":uriAudApp": uriAudioAppointment,
    ":routAct"  : routingActive,
    ":routPhn"  : routingPhone,
    ":dtU"      : moment().toISOString()
  };

  // creating dynamic query string to map the Attribute values
  let dbUpdateExpression = "set " +
    (customerID           ? "customerID           = :cusId, "     : "") +
    (customerType         ? "customerType         = :cusType, "   : "") +
    (customerEmail        ? "customerEmail        = :cusEmail, "  : "") +
    (customerMobile       ? "customerMobile       = :cusMobile, " : "") +
    (uriAudioWelcome      ? "uriAudioWelcome      = :uriAudWel, " : "") +
    (uriAudioAppointment  ? "uriAudioAppointment  = :uriAudApp, " : "") +
    (routingActive        ? "routingActive        = :routAct, "   : "") +
    (routingActive        ? "routingPhone         = :routPhn, "   : "") + "dateTimeUpdated = :dtU";

  let payloads = {
    TableName: "profile",
    Key: {
      "phoneNumber": phoneNumber
    },
    UpdateExpression: dbUpdateExpression,
    ExpressionAttributeValues: dbAttributeValue,
    ReturnValues: "UPDATED_NEW"
  };
  console.log(payloads);
  dynamo.update(payloads, function(err, data) {
    if (err) {

      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Error in profile"
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
