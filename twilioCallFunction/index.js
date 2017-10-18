'use strict';
var accountSid = process.env.accountSid || "ACe1065454a067c5aaed51d03b39f90faf" ;
var authToken = process.env.authToken || "f6294104bdf50579b341f9cf14578f27";
var twilioNumber= process.env.twilioNumber || "+18552576726" ;
var twiMlUrl  = process.env.twiMlUrl || "https://c17ceu2r2h.execute-api.us-east-1.amazonaws.com/serverlessapp/notifications/"
var client = require('twilio')(accountSid, authToken);

exports.handler = (event, context, callback) => {
  //console.log('Received event:', JSON.stringify(event, null, 2));
  var body = JSON.parse(event.body);
  var toPhoneNumber = body.toPhoneNumber.toString();
  var phoneNumber = event.pathParameters.phoneNumber.toString();

  client.calls.create({
    url   : twiMlUrl + toPhoneNumber,
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
