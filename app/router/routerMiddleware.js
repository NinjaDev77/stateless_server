var jwt               = require('jsonwebtoken');
var AWS               = require('aws-sdk');
var isE164PhoneNumber = require('is-e164-phone-number');




var Token             = require('../framework/jwt.auth');
var config            = require('../config/config.json');


// check enviroment is developemet or not
if (config.enviroment==='dev') {

  new AWS.DynamoDB({
                      endpoint        : config.dev.endpoint,
                      region          : config.dev.region ,
                      accessKeyId     : config.dev.accessKeyId,
                      secretAccessKey : config.dev.secretAccessKey
  });

  // connection to the DynamoDB
  var Client = new AWS.DynamoDB.DocumentClient();

};


// function to  check authenticate
function isAuthenticated (req,res,next){
  // check header or url parameters or post parameters for token
var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.token;

  // decode token
if (token) {

  // verifies secret and checks exp
  jwt.verify(token, 'test', function(err, decoded) {
    if (err) {
      console.log(err);
      return res.status(403).json({ code:403, message: 'unauthorized' });
    } else {
      // if everything is good, save to request for use in other routes
      req.decoded = decoded;
      next();
    }

  });

} else {

  // if there is no token
  // return an error
  return res.status(403).json({ code:403, message: 'unauthorized' });

}

}

// function to check that phone number given is of format ES164 or not
  function checkPhoneNumberFormat (req,res,next){
    var phoneNumber = "+" + req.params.phoneNumber;
    var check       = isE164PhoneNumber(phoneNumber)
    next()
  }

  function checkPhoneNumber (req,res,next){

    var phoneNumber   = req.params.phoneNumber ;
    var isNumberE164  = isE164PhoneNumber("+"+ phoneNumber);
    if (!isNumberE164) {
      res.status(400).send({code:400, message : "Phone Number is not ES164"})

    } else {

      var params        = {
                            TableName: "phoneNumber",
                            KeyConditionExpression: "phoneNumber = :phn",
                            ExpressionAttributeValues: {
                                ":phn": phoneNumber
                            }
      };

      Client.query(params, function(err, data) {
          if (err) {

              console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
              //res.status(400).json({code:400,message :err.message});

            } else {
                // if no records found then reject else resolve
                if (data.Items.length === 0 ) {

                     res.status(404).json({code:404,message :"Phone Number Not Found"});

                } else {

                    next()
                }
          }

      });
    }

  };


module.exports.isAuthenticated        = isAuthenticated;
module.exports.checkPhoneNumberFormat = checkPhoneNumberFormat;
module.exports.checkPhoneNumber       = checkPhoneNumber;
