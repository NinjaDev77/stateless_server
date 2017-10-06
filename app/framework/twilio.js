const sid = ""
const token = ""

var accountSid = '';
var authToken = "";
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
      url: "http://demo.twilio.com/docs/voice.xml",
      to: toPhoneNumber,
      from:"+18556418987"
  },cb);
  return cb;
}

module.exports.twilioOutboundCalls=twilioOutboundCalls;
