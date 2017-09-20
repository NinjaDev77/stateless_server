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

  var isAllValidated  = false ;
  var body            = req.body;
  var phoneNumber     = req.params.phoneNumber;


  if (true) {
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
  }
}

// function to get profile
module.exports.getProfile=function(req,res){
  var phoneNumber   = req.params.phoneNumber;
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
}

// function to delete profile
module.exports.deleteProfile=function(req,res) {
  var phoneNumber = req.params.phoneNumber;
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

};

module.exports.updateProfile=function(res,res){
  var phoneNumber         = req.params.phoneNumber;

  var customerID          = req.body.customerID,
      customerType        = req.body.customerType,
      customerEmail       = req.body.customerEmail,
      customerMobile      = req.body.customerMobile,
      uriAudioWelcome     = req.body.uriAudioWelcome,
      uriAudioAppointment = req.body.uriAudioAppointment,
      routingActive       = req.body.routingActive,
      routingPhone        = req.body.routingPhone;



  // var params      = {
  //                     TableName: "profile",
  //                     Key:{
  //                         "phoneNumber":phoneNumber
  //                     },
  //                     UpdateExpression :"set active = :ac, dateTimeUpdated = :dtU",
  //                     ExpressionAttributeValues:{
  //                         ":ac":active,
  //                         ":dtU": moment().toISOString()
  //                     },
  //                     ReturnValues:"UPDATED_NEW"
  // };
  // Client.update(params, function(err, data) {
  //   if (err) {
  //
  //       console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
  //       res.status(400).json({code:400,message :err.message});
  //
  //   } else {
  //
  //       //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
  //       res.status(200).json({code:200,Description :"OK"});
  //
  //   }
  //
  // });

}

// for validation purpoes
function mandatoryCheck (req, res , fieldName){
  res.status(422).json({code:422,Description : fieldName + " is missing"})
}
