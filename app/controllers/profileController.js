var config    = require('../config/config')
var AWS       = require("aws-sdk")

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

  var phoneNumber = req.params.phoneNumber;
  var body        = req.body;
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
                            "dateTimeCreated":body.dateTimeCreated,
                            "dateTimeUpdated":body.dateTimeUpdated

                    },
                    ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
                    ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
                    ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
  };
  //method to put into the dynamodb
  Client.put(params, function(err, data) {
      if (err) {

          console.error(err); // an error occurred
          res.status(200).json({code:400,message :"error"});

      } else {

          //console.log(JSON.stringify(data));
          res.status(200).json({code:200,Description :"OK"});

      } // successful response
  });
}

module.exports.getProfile=function(req,res){
  var phoneNumber   = req.params.phoneNumber;
  var params        = {
                        TableName: "profile",
                        Key:{
                            "phoneNumber":phoneNumber
                        }
  }
  Client.get(params, function(err, data) {
      if (err) {

          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(200).json({code:400,message :"error"});

        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (Object.keys(data).length === 0) {
                res.status(404).json({code:404,message :"Phone Number Not Found !"});
              } else {
                res.status(200).json({code:200,Description :"OK" ,data:data.Item});
            }
      }

  });
}

module.exports.deleteProfile=function(req,res) {
  var phoneNumber = req.params.phoneNumber;
  var params      = {
                      TableName: "profile",
                      Key:{
                          "phoneNumber":phoneNumber
                      }
  }
  Client.delete(params, function(err, data) {
    if (err) {

        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(200).json({code:400,message :"error"});

    } else {

        //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        res.status(200).json({code:200,Description :"OK"});

    }

  });

};

module.exports.updateProfile = function(req,res){

}
