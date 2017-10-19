'use strict';
var accountSid = process.env.accountSid;
var authToken = process.env.authToken;
var twilioNumber= process.env.twilioNumber;
var twiMlUrl  = process.env.twiMlUrl
var client = require('twilio')(accountSid, authToken);

exports.handler = (event, context, callback) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));
  var body = JSON.parse(event.body);
  var toPhoneNumber = body.toPhoneNumber;
  var phoneNumber = event.pathParameters.phoneNumber.toString();
  var callUrl = `https://c17ceu2r2h.execute-api.us-east-1.amazonaws.com/serverlessapp/notifications/${toPhoneNumber}`;

  // var response = {
  //       statusCode: 200,
  //       headers: {
  //         "Content-Type": "application/json"
  //       },
  //       body: JSON.stringify({message : callUrl})
  //     };
  //
  //     callback(null, response);

  client.calls.create({
    url   : callUrl,
    to    : phoneNumber,
    from  : twilioNumber
  },function(err,call){

    if (!err){

      var response = {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({message : "Ok"})
      };

      callback(null, response);

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
