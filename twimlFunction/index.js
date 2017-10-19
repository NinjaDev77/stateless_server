'use strict';
const twilio        = require('twilio');
const voiceResponse = twilio.twiml.VoiceResponse;
exports.handler = (event, context, callback) => {

  let req           = event;
  let phoneNumber   = req.pathParameters.phonenumber.toString();
  let twimlResponse = new voiceResponse();

  twimlResponse.say('Please wait while we are connecting',{ voice: 'woman' });

  twimlResponse.dial(phoneNumber);

  //console.log(twimlResponse.toString());
  let response = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/xml"
    },
    body: twimlResponse.toString()
  };
  callback(null, response)


};
