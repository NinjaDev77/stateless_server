var moment = require("moment");
var AWS    = require('aws-sdk');


var config            = require('../config/config.json');
var awsS3             = require('../framework/awsS3');

// function to check the config
if (config.enviroment==='dev') {
  AWS.config.update({
                      endpoint: config.dev.endpoint,
                      region:config.dev.region ,
                      accessKeyId:config.dev.accessKeyId,
                      secretAccessKey:config.dev.secretAccessKey
                    });
  var Client = new AWS.DynamoDB.DocumentClient();
}



function welcomeUpload(req,res){
  //res.send('Successfully uploaded ' + req.files.length + ' files!')
  var pathToTheFile   = req.files[0].location;
  var phoneNumber     = req.params.phoneNumber;
  var uriAudioWelcome = pathToTheFile ;

  var params      = {
                      TableName: "profile",
                      Key:{
                          "phoneNumber":phoneNumber
                      },
                      UpdateExpression :"set uriAudioWelcome = :uriAudioWelcome, dateTimeUpdated = :dtU",
                      ExpressionAttributeValues:{
                          ":uriAudioWelcome":uriAudioWelcome,
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
        res.status(200).send({"uriAudioWelcome" : uriAudioWelcome});
    }

  });

};

function getWelcomeAudio (req,res,next){

  var phoneNumber = req.params.phoneNumber;
  var params        = {
                        TableName: "profile",
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
                res.status(200).json({code:200,Description :"OK" ,uriAudioWelcome:data.Items[0].uriAudioWelcome});
            }
      }

  });

}

function deleteWelcomeAudio(req,res,next) {


  var phoneNumber = req.params.phoneNumber;

  var getParams        = {
                        TableName: "profile",
                        KeyConditionExpression: "phoneNumber = :phn",
                        ExpressionAttributeValues: {
                            ":phn": phoneNumber
                        }
  }
  Client.query(getParams,function(err, data) {
      if (err) {

          console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));

        } else {
            //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            if (Object.keys(data).length === 0) {
                res.status(404).json({code:404,message :"No Phone Number Not Found !"});
              } else {

                var uriAudioWelcome = data.Items[0].uriAudioWelcome;

                  var file =uriAudioWelcome.split('/')[4]
                  awsS3.deleteFile('audiostorebucket/welcome',file).then(function(){
                    var updateParams      = {
                                        TableName: "profile",
                                        Key:{
                                            "phoneNumber":phoneNumber
                                        },
                                        UpdateExpression :"set uriAudioWelcome = :uriAudioWelcome, dateTimeUpdated = :dtU",
                                        ExpressionAttributeValues:{
                                            ":uriAudioWelcome":'',
                                            ":dtU": moment().toISOString()
                                        },
                                        ReturnValues:"UPDATED_NEW"
                    };

                    Client.update(updateParams, function(err, data) {
                      if (err) {

                          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
                          res.status(400).json({code:400,message :err.message});

                      } else {
                          //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                          res.status(200).send("OK");
                      }

                    });

                  }).catch(function(err){
                    res.status(500).send({code:500 , message : err})
                  })

            }
      }

  });


}


module.exports.welcomeUpload=welcomeUpload;
module.exports.getWelcomeAudio=getWelcomeAudio;
module.exports.deleteWelcomeAudio=deleteWelcomeAudio;
