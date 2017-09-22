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

// CRUD On Appointment

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

// function to store appointments from number ( consumer customer )
module.exports.storeConsumerAppointment = function(req, res) {

    var body                = req.body;
    var phoneNumber         = req.params.phoneNumber;

    var idProperty          = body.idProperty,
        phoneTo             = body.phoneTo,
        appointmentDateTime = moment().toISOString(),
        callStatus          = body.callStatus,
        createAt            = moment().toISOString(),
        updateAt            = moment().toISOString();

    // check Whether the phone number exist is table or not
    checkPhoneNumber(phoneNumber).then (function(){
        var params          = {
                                TableName: 'appointments',
                                Item: { // a map of attribute name to AttributeValue

                                    "phoneNumber": phoneNumber,
                                    "idProperty": idProperty,
                                    "phoneTo": phoneTo,
                                    "appointmentDateTime": appointmentDateTime,
                                    "callStatus": callStatus,
                                    "createAt": createAt,
                                        "updateAt": updateAt
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

// function to get appointments from number ( consumer customer )
module.exports.getConsumerAppointment = function(req, res) {

    var phoneNumber = req.params.phoneNumber;

    checkPhoneNumber(phoneNumber).then(function(){
        var params  = {
                        TableName: "appointments",
                        Key: {
                            "phoneNumber": phoneNumber
                        }
                    };


        // function to get profile in dynamodb with the above params
        Client.get(params, function(err, data) {
            if (err) {

                console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                res.status(200).json({code: 400, message: "error"});

            } else {
                //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                if (Object.keys(data).length === 0) {
                    res.status(404).json({code:404, message: "Appointment Not Found !"});
                    } else {
                    res.status(200).json({code:200, Description: "OK", data: data.Item});
                }
            }

        });

    }).catch(function(){
        res.status(404).json({code:404,message :"Phone Number Not Found"});
    });

}

// function to get appointments from number ( consumer customer )
module.exports.updateConsumerAppointment = function(req, res) {

  var phoneNumber         = req.params.phoneNumber;

  // function to check phone number exist of not
  checkPhoneNumber(phoneNumber).then(function(){

    var body                = req.body;

    var idProperty          = body.idProperty,
        phoneTo             = body.phoneTo,
        appointmentDateTime = moment().toISOString(),
        callStatus          = body.callStatus,
        updateAt            = moment().toISOString();

    // object to map to the db attribute value
    var dbAttributeValue    = {
                                ":idProperty"          : idProperty,
                                ":phoneTo"             : phoneTo,
                                ":appointmentDateTime" : appointmentDateTime,
                                ":callStatus"          : callStatus,
                                ":updateAt"            : updateAt
        };

    // creating dynamic query string to map the Attribute values
    var dbUpdateExpression  = "set "                                                                        +
                               (idProperty          ? "idProperty          = :idProperty, "           : "") +
                               (phoneTo             ? "phoneTo             = :phoneTo, "              : "") +
                               (appointmentDateTime ? "appointmentDateTime = :appointmentDateTime, "  : "") +
                               (callStatus          ? "callStatus          = :callStatus, "           : "") +
                               (updateAt            ? "updateAt            = :updateAt "             : "") ;

    var params      = {
                        TableName: "appointments",
                        Key: {
                            "phoneNumber": phoneNumber
                        },
                        UpdateExpression: dbUpdateExpression,
                        ExpressionAttributeValues: dbAttributeValue,
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

  }).catch(function() {
     res.status(404).json({code:404,message :"Phone Number Not Found"});
  });

}

// function to store appointments from number ( business customer )
module.exports.storeBusinessAppointment = function(req, res) {

    var body                = req.body;
    var phoneNumber         = req.params.phoneNumber;
    var idProperty          = req.params.idProperty;

    var phoneTo             = body.phoneTo,
        appointmentDateTime = moment().toISOString(),
        callStatus          = body.callStatus,
        createAt            = moment().toISOString(),
        updateAt            = moment().toISOString();

    // check Whether the phone number exist is table or not
    checkPhoneNumber(phoneNumber).then (function(){
        var params      = {
                            TableName: 'appointments',
                            Item: { // a map of attribute name to AttributeValue

                                "phoneNumber": phoneNumber,
                                "idProperty": idProperty,
                                "phoneTo": phoneTo,
                                "appointmentDateTime": appointmentDateTime,
                                "callStatus": callStatus,
                                "createAt": createAt,
                                "updateAt": updateAt

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

// function to get appointments from number ( business customer )
module.exports.getBusinessAppointment = function(req, res) {

    var phoneNumber = req.params.phoneNumber;
    var idProperty  = req.params.idProperty;

    checkPhoneNumber(phoneNumber).then(function(){
        var params  = {
                        TableName: "appointments",
                        Key: {
                            "phoneNumber": phoneNumber,
                            "idProperty" : idProperty
                        }
                    };

    // function to get profile in dynamodb with the above params
    Client.get(params, function(err, data) {
        if (err) {

            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            res.status(200).json({code: 400, message: "error"});

          } else {
              //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
              if (Object.keys(data).length === 0) {
                  res.status(404).json({code:404, message: "Appointment Not Found !"});
                } else {
                  res.status(200).json({code:200, Description: "OK", data: data.Item});
              }
        }

    });

  }).catch(function(){

     res.status(404).json({code:404,message :"Phone Number Not Found"});
  });

}

// function to get appointments from number ( business customer )
module.exports.updateBusinessAppointment = function(req, res) {

    var phoneNumber = req.params.phoneNumber;
    var idProperty  = req.params.idProperty;

    // function to check phone number exist of not
    checkPhoneNumber(phoneNumber).then(function(){

        var body                = req.body;

        var phoneTo             = body.phoneTo,
            appointmentDateTime = moment().toISOString(),
            callStatus          = (body.callStatus ===true ? body.callStatus : undefined),
            updateAt            = moment().toISOString();

        // object to map to the db attribute value
        var dbAttributeValue    = {
                                ":phoneTo"             : phoneTo,
                                ":appointmentDateTime" : appointmentDateTime,
                                ":callStatus"          : callStatus,
                                ":updateAt"            : updateAt
        };

        // creating dynamic query string to map the Attribute values
        var dbUpdateExpression  = "set "                                                                     +
                                (phoneTo             ? "phoneTo             = :phoneTo, "              : "") +
                                (appointmentDateTime ? "appointmentDateTime = :appointmentDateTime, "  : "") +
                                (callStatus          ? "callStatus          = :callStatus, "           : "") +
                                (updateAt            ? "updateAt            = :updateAt "              : "") ;

        var params      = {
                            TableName: "appointments",
                            Key: {
                                "phoneNumber": phoneNumber,
                                "idProperty": idProperty
                            },
                            UpdateExpression: dbUpdateExpression,
                            ExpressionAttributeValues: dbAttributeValue,
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

    }).catch(function() {

     res.status(404).json({code:404,message :"Phone Number Not Found"});
  });

}