var moment    = require('moment');
var uuid      = require('uuid/v4');
var AWS       = require("aws-sdk")
var config    = require('../config/config');


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

// function to create phone number
module.exports.createPhoneNumber=function(req,res){
  var body = req.body

  if (body.phoneNumber===undefined || body.phoneNumber === null) {
    res.status(400).send({code:400,message:"Bad request"});
  } else {

      var params      = {
                          TableName: 'phoneNumber',
                          Item: {
                                "phoneNumber"     : body.phoneNumber,
                                "active"          : true,
                                "dateTimeUpdated" : moment().toISOString(),

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

};

// function to get all phone numbers
module.exports.getAllPhoneNumbers =function(req,res){
  var params        = {
                        TableName: "phoneNumber",
                        ReturnConsumedCapacity   : "TOTAL"
  }
  Client.scan(params, function(err, data) {
      if (err) {

          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(400).json({code:400,message :"error"});

        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (Object.keys(data).length === 0) {
                res.status(404).json({code:404,message :"No Phone Number Not Found !"});
              } else {
                res.status(200).json({code:200,Description :"OK" ,data:data.Items});
            }
      }

  });

}
// function to get a number detail with a number provided
module.exports.getPhoneNumber =function(req,res){
  var phoneNumber   = req.params.phoneNumber
  var params        = {
                        TableName: "phoneNumber",
                        KeyConditionExpression: "phoneNumber = :phn",
                        ExpressionAttributeValues: {
                            ":phn": phoneNumber
                        }
  }
  Client.query(params, function(err, data) {
      if (err) {

          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(400).json({code:400,message :err.message});

        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (Object.keys(data).length === 0) {
                res.status(404).json({code:404,message :"No Phone Number Not Found !"});
              } else {
                res.status(200).json({code:200,Description :"OK" ,data:data.Items});
            }
      }

  });

};

// function to delete phone number
module.exports.deletePhoneNumber =function (req,res) {
  var phoneNumber = req.params.phoneNumber;
  var params      = {
                      TableName: "phoneNumber",
                      Key:{
                          "phoneNumber":phoneNumber
                      }
  }
  Client.delete(params, function(err, data) {
    if (err) {

        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
        res.status(200).json({code:400,message :err.message});

    } else {

        //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
        res.status(200).json({code:200,Description :"OK"});

    }

  });

}

// function to update phone number
module.exports.updatePhoneNumber =function(req,res){

  var phoneNumber = req.params.phoneNumber;
  var active      = req.body.active;

  if (active === null || active == undefined) {

    res.status(404).json({code:404 , message : "active is missing"}) ;

  } else {

    var params      = {
                        TableName: "phoneNumber",
                        Key:{
                            "phoneNumber":phoneNumber
                        },
                        UpdateExpression :"set active = :ac, dateTimeUpdated = :dtU",
                        ExpressionAttributeValues:{
                            ":ac":active,
                            ":dtU": moment().toISOString()
                        },
                        ReturnValues:"UPDATED_NEW"
    };

    Client.update(params, function(err, data) {
      if (err) {

          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          res.status(400).json({code:400,message :err.message});

      } else {

          //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          res.status(200).json({code:200,Description :"OK"});

      }

    });

  }

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
