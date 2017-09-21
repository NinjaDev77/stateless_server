var moment      = require('moment')
var AWS         = require("aws-sdk")

var config      = require('../config/config')
var validation  = require('../framework/validation')


if (config.enviroment==='dev') {
  AWS.config.update({
                      endpoint: config.dev.endpoint,
                      region:config.dev.region ,
                      accessKeyId:config.dev.accessKeyId,
                      secretAccessKey:config.dev.secretAccessKey
                    });
  var Client = new AWS.DynamoDB.DocumentClient();
}
// CRUD On profile

module.exports.createProfile=function(req,res){


  var body            = req.body;
  var phoneNumber     = req.params.phoneNumber;

  var customerID          = body.customerID,
      customerType        = body.customerType,
      customerEmail       = body.customerEmail,
      customerMobile      = body.customerMobile,
      uriAudioWelcome     = body.uriAudioWelcome,
      uriAudioAppointment = body.uriAudioAppointment,
      routingActive       = body.routingActive,
      routingPhone        = body.routingActive;


  // check Whether the phone number exist is table or not
  checkPhoneNumber(phoneNumber).then (function(){
    var params      = {
                        TableName: 'profile',
                        Item: { // a map of attribute name to AttributeValue

                              "phoneNumber": phoneNumber,
                              "customerType":body.customerType,
                              "customerID"  :body.customerID,
                              "customerEmail":body.customerEmail,
                              "customerMobile":body.customerMobile,
                              "uriAudioWelcome":body.uriAudioWelcome,
                              "uriAudioAppointment":body.uriAudioAppointment,
                              "routingActive":body.routingActive,
                              "routingPhone":body.routingPhone,
                              "dateTimeCreated":moment().toISOString(),
                              "dateTimeUpdated":moment().toISOString()

                      },
                      ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
                      ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
                      ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
    };
    //method to put into the dynamodb
    Client.put(params, function(err, data) {
        if (err) {

            console.error(err); // an error occurred
            res.status(400).json({code:400,message :"error"});

        } else {

            //console.log(JSON.stringify(data));
            res.status(200).json({code:200,Description :"OK"});

        } // successful response
    });

  }).catch(function(){

     res.status(404).json({code:404,message :"Phone Number Not Found"});
  })

}

// function to get profile
module.exports.getProfile=function(req,res){

  var phoneNumber   = req.params.phoneNumber;
  checkPhoneNumber(phoneNumber).then(function(){
    var params        = {
                          TableName: "profile",
                          Key:{
                              "phoneNumber":phoneNumber
                          }
    }
    // function to get profile in dynamodb with the above params
    Client.get(params, function(err, data) {
        if (err) {

            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(200).json({code:400,message :"error"});

          } else {
              //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
              if (Object.keys(data).length === 0) {
                  res.status(404).json({code:404,message :"Profile Not Found !"});
                } else {
                  res.status(200).json({code:200,Description :"OK" ,data:data.Item});
              }
        }

    });

  }).catch(function(){

     res.status(404).json({code:404,message :"Phone Number Not Found"});
  });

}

// function to delete profile
module.exports.deleteProfile=function(req,res) {

  var phoneNumber = req.params.phoneNumber;
  // function to check phone number;

  checkPhoneNumber(phoneNumber).then (function(){

    var params      = {
                        TableName: "profile",
                        Key:{
                            "phoneNumber":phoneNumber
                        }
    }
    // function to delete profile in dynamodb
    Client.delete(params, function(err, data) {
      if (err) {

          console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(400).json({code:400,message :"error"});

      } else {

          //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          res.status(200).json({code:200,Description :"OK"});

      }

    });
  }).catch(function(){

     res.status(404).json({code:404,message :"Phone Number Not Found"});
  })

};

module.exports.updateProfile=function(req,res){
  console.log("asgdhasgdhs");

  var phoneNumber         = req.params.phoneNumber;
  // function to check phone number exist of not
  checkPhoneNumber(phoneNumber).then(function(){

    var body                = req.body;

    var customerID          = body.customerID ;
    var customerType        = body.customerType ;
    var customerEmail       = body.customerEmail ;
    var customerMobile      = body.customerMobile ;
    var uriAudioWelcome     = body.uriAudioWelcome ;
    var uriAudioAppointment = body.uriAudioAppointment ;
    var routingActive       = (body.routingActive ===true ? body.routingActive : undefined);
    var routingPhone        = (body.routingActive ===true ? body.routingPhone : undefined);

    // object to map to the db attribute value
    var dbAttributeValue      = {
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
    var dbUpdateExpression  = "set "                                                              +
                               (customerID          ? "customerID           = :cusId, "     : "") +
                               (customerType        ? "customerType         = :cusType, "   : "") +
                               (customerEmail       ? "customerEmail        = :cusEmail, "  : "") +
                               (customerMobile      ? "customerMobile       = :cusMobile, " : "") +
                               (uriAudioWelcome     ? "uriAudioWelcome      = :uriAudWel, " : "") +
                               (uriAudioAppointment ? "uriAudioAppointment  = :uriAudApp, " : "") +
                               (routingActive       ? "routingActive        = :routAct, "   : "") +
                               (routingActive       ? "routingPhone         = :routPhn, "   : "") + "dateTimeUpdated = :dtU";

    var params      = {
                        TableName: "profile",
                        Key:{
                            "phoneNumber":phoneNumber
                        },
                        UpdateExpression :dbUpdateExpression,
                        ExpressionAttributeValues:dbAttributeValue,
                        ReturnValues:"UPDATED_NEW"
    };
    console.log(params);
    Client.update(params, function(err, data) {
      if (err) {

          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(400).json({code:400,message :err.message});

      } else {
          //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          res.status(200).json({code:200,Description :"OK"});
      }

    });

  }).catch(function(){

     res.status(404).json({code:404,message :"Phone Number Not Found"});
  });

}


// for validation purpose
function checkPhoneNumber (phoneNumber){

  var params        = {
                        TableName: "phoneNumber",
                        KeyConditionExpression: "phoneNumber = :phn",
                        ExpressionAttributeValues: {
                            ":phn": phoneNumber
                        }
  };

  return new Promise (function(resolve, reject){
    Client.query(params, function(err, data) {
        if (err) {

            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            //res.status(400).json({code:400,message :err.message});

          } else {
              // if no records found then reject else resolve
              if (data.Items.length === 0 ) {
                   reject();
              } else {
                resolve()
              }
        }

    });
  })

};
