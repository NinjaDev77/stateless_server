'use strict'
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3({
  apiVersion: '2006-03-01'
});
const moment = require('moment');
const uuid = require('uuid/v4');

exports.handler = function(event, context, callback) {
  switch (event.httpMethod) {

    case 'GET':

    getWelcomeAudio(event, context, callback);
    //defaultFunctionCall(event, context, callback);
    break;

    case 'POST':

    s3Upload(event, context, callback);
    break;

    case 'PUT':

    //controller.updateProfile(event, context, callback);
    s3Upload(event, context, callback);
    break;

    case 'DELETE':

    //controller.deleteProfile(event, context, callback);
    deleteWelcomeAudio(event, context, callback);
    break;

    default:
    defaultFunctionCall(event, context, callback);
  }
}

function defaultFunctionCall(event, context, callback) {
  var response = {
    statusCode:200,
    message: "Bad Request"
  }
  callback(null, response);
}


function s3Upload(event, context, callback) {

  let phoneNumber = event.phoneNumber.toString();
  let audioFileInBase64 = event.body.audioFile;
  let audioFileExt = event.body.audioFileExt;
  let audioFile = new Buffer(audioFileInBase64, 'base64');
  let fileName = uuid();

  let params = {
    Bucket: 'audiostorebucket/welcome',
    Key: fileName + '.' + audioFileExt,
    Body: audioFile
  }

  s3.upload(params, function(err, data) {
    if (err) {
      return console.log(err);
      var response = {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: "Whoops Something Went Wrong !",
        })
      };
      callback(null, response);


    } else {

      var uriAudioWelcome = data.Location;

      var payloads = {
        TableName: "profile",
        Key: {
          "phoneNumber": phoneNumber
        },
        UpdateExpression: "set uriAudioWelcome = :uriAudioWelcome, dateTimeUpdated = :dtU",
        ExpressionAttributeValues: {
          ":uriAudioWelcome": uriAudioWelcome,
          ":dtU": moment().toISOString()
        },
        ReturnValues: "UPDATED_NEW"
      };
      console.log(payloads)

      dynamo.update(payloads, function(err, data) {
        if (err) {

          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          var response = {
            statusCode: 500,
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: "Whoops Something Went Wrong !",
            })
          };
          callback(null, response);

        } else {
          //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          var response = {
            statusCode: 500,
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              message: "Ok",
              uriAudioWelcome: uriAudioWelcome
            })
          };
          callback(null, response);

        }

      });

    }
  });

}



function getWelcomeAudio (event,context,callback){

  const AWS = require('aws-sdk');
  const dynamo = new AWS.DynamoDB.DocumentClient();

  var phoneNumber = event.phoneNumber.toString();
  var params        = {
    TableName: "profile",
    KeyConditionExpression: "phoneNumber = :phn",
    ExpressionAttributeValues: {
      ":phn": phoneNumber
    }
  }
  dynamo.query(params, function(err, data) {
    if (err) {

      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      var response = {
        statusCode:400,
        message: err.message
      }

      callback(null, response);


    } else {
      //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      if (data.Items.length === 0) {

        var response = {
          statusCode:404,
          message: "No Phone Number Found !"
        }
        callback(null, response);


      } else {
        //res.status(200).json({code:200,Description :"OK" ,uriAudioWelcome:data.Items[0].uriAudioWelcome});
        var response = {
          statusCode:200,
          message: "Ok",
          uriAudioWelcome:data.Items[0].uriAudioWelcome
        }
        callback(null, response);

      }
    }

  });

}

function deleteWelcomeAudio(event,context,callback) {

  var phoneNumber = event.phoneNumber.toString();

  var getParams        = {
    TableName: "profile",
    KeyConditionExpression: "phoneNumber = :phn",
    ExpressionAttributeValues: {
      ":phn": phoneNumber
    }
  }
  dynamo.query(getParams,function(err, data) {
    if (err) {

      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));

    } else {
      //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      if (data.Items.length === 0) {
        //res.status(404).json({code:404,message :"No Phone Number Not Found !"});

        var response = {
          statusCode:404,
          message:"No Phone Number Found !"
        }
        callback(null, response);

      } else {

        if (!data.Items[0].uriAudioWelcome) {
          //res.status(400).send({code: 400 , message : "No audio welcome was found"});
          var response = {
            statusCode:404,
            message:"No audio welcome was found"
          }
          callback(null, response);

        } else {

          updateProfileAfterDelete(event,context,callback);
          var uriAudioWelcome = data.Items[0].uriAudioWelcome;
          // getting the file name from a url
          var file = uriAudioWelcome.split('/')[4];
          var params = {
            Bucket: "audiostorebucket/welcome",
            Key: file
          };

          s3.deleteObject(params, function(err, data) {
            if (err) console.log(err);
            else {
              console.log(data);
            }
          });

        }

      }
    }

  });
}

function updateProfileAfterDelete (event,context,callback){

  var phoneNumber = event.phoneNumber.toString();
  var params      = {
    TableName: "profile",
    Key:{
      "phoneNumber":phoneNumber
    },
    UpdateExpression :"REMOVE uriAudioWelcome",
    ReturnValues:"UPDATED_NEW"
  };

  dynamo.update(params, function(err, data) {
    if (err) {

      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      //res.status(400).json({code:400,message :err.message});
      var response = {
        statusCode:400,
        message:err.message
      }
      callback(null, response);


    } else {
      //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
      //res.status(200).send({code: 200 , message : "OK"});
      var response = {
        statusCode:200,
        message:"OK"
      }
      callback(null, response);

    }
  });
}
