var accountSid = "ACe1065454a067c5aaed51d03b39f90faf";
var authToken = "f6294104bdf50579b341f9cf14578f27";
var client = require('twilio')(accountSid, authToken);

//outbound calls

// client.calls.create({
//     url: "http://demo.twilio.com/docs/voice.xml",
//     to: "+918981690813",
//     from:"+18556418987"
// }, function(err, call) {
//     console.log(call.sid);
// });

function twilioOutboundCalls(toPhoneNumber,fromPhoneNumber,cb){

  client.calls.create({
      url: "https://handler.twilio.com/twiml/EH5bdc9eb98f8dd04a674f375ff86d0942",
      to: toPhoneNumber,
      from:"+18552576726"
  },cb);
  return cb;
}

module.exports.twilioOutboundCalls=twilioOutboundCalls;


// TWILIO_ACCOUNT_SID = "ACe1065454a067c5aaed51d03b39f90faf"
// TWILIO_AUTH_TOKEN  = "f6294104bdf50579b341f9cf14578f27"
// TWILIO_NUMBER = "+18552576726" node app.js
