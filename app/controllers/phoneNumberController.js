var moment    = require('moment');
var uuid      = require('uuid/v4');
var AWS       = require("aws-sdk");
    AWS.config.update({
                        endpoint: "http://localhost:8000",
                        region:"test" ,
                        accessKeyId:"abcd" ,
                        secretAccessKey:"abcd"
                      });

var Client    = new AWS.DynamoDB.DocumentClient();

var date      = moment();
var dateInIso = date.toISOString();


module.exports.createPhoneNumber=function(req,res){
  var body = req.body

  if (body.phoneNumber===undefined || body.phoneNumber === null) {
    res.status(400).send({code:400,message:"Bad request"});
  } else {

      var params      = {
                          TableName: 'phoneNumber',
                          Item: { // a map of attribute name to AttributeValue
                                "Id"              : uuid(),
                                "phoneNumber"     : body.phoneNumber,
                                "active"          : true,
                                "dateTimeUpdated" : dateInIso

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

}
