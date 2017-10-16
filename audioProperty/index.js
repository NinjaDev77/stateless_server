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

    getPropertyAudio(event, context, callback);
    break;

    case 'POST':

    s3Upload(event, context, callback);
    break;

    case 'PUT':

    s3Upload(event, context, callback);
    break;

    case 'DELETE':

    deletePropertyAudio(event, context, callback);
    break;

    default:
    defaultFunctionCall(event, context, callback);
  }
}

function defaultFunctionCall(event, context, callback) {
  var response = {
    statusCode: 200,
    message: " bad request"
  }
  callback(null, response);
}


function s3Upload(event, context, callback) {

  let phoneNumber = event.phoneNumber;
  let idProperty = event.idProperty;
  let audioFileInBase64 = event.body.audioFile;
  let audioFileExt = event.body.audioFileExt;
  let audioFile = new Buffer(audioFileInBase64, 'base64');
  let fileName = uuid();

  let params = {
    Bucket: 'audiostorebucket/property',
    Key: fileName + '.' + audioFileExt,
    Body: audioFile
  }

  s3.upload(params, function(err, data) {
    if (err) {
      console.log(err);
      var response = {
        statusCode: 500,
        message: "Whoops Something Went Wrong !"
      }
      callback(null, response);


    } else {

      var uriAudioProperty = data.Location;

      var payloads = {
        TableName: "property",
        Key: {
          "phoneNumber": phoneNumber,
          "idProperty": idProperty
        },
        ConditionExpression: "phoneNumber = :phoneNumber and idProperty = :idProperty",
        UpdateExpression: "set uriAudioProperty = :uriAudioProperty, dateTimeUpdated = :dtU",
        ExpressionAttributeValues: {
          ":uriAudioProperty": uriAudioProperty,
          ":dtU": moment().toISOString(),
          ":phoneNumber": phoneNumber,
          ":idProperty": idProperty
        },
        ReturnValues: "UPDATED_NEW"
      };

      dynamo.update(payloads, function(err, data) {
        if (err) {

          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          var response = {
            statusCode: 404,
            message: "Whoops Something Went Wrong !"
          }
          callback(null, response);

        } else {
          //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          var response = {
            statusCode: 200,
            message: "Ok",
            uriAudioProperty: uriAudioProperty
          }
          callback(null, response);

        }

      });

    }
  });

}



function getPropertyAudio(event, context, callback) {

  var phoneNumber = event.phoneNumber;
  var idProperty = event.idProperty;
  var params = {
    TableName: "property",
    KeyConditionExpression: "phoneNumber = :phn and idProperty = :idProp",
    ExpressionAttributeValues: {
      ":phn": phoneNumber,
      ":idProp": idProperty
    }
  }
  //return context.succeed(params);
  dynamo.query(params, function(err, data) {
    if (err) {

      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
      var response = {
        statusCode: 500,
        message: err.message
      }
      callback(null, response);


    } else {
      //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      if (data.Items.length === 0) {
        var response = {
          statusCode: 400,
          message: "Not Found "
        }
        callback(null, response);


      } else {
        //res.status(200).json({code:200,Description :"OK" ,uriAudioAppointment:data.Items[0].uriAudioAppointment});
        var response = {
          statusCode: 200,
          message: "OK",
          uriAudioProperty: data.Items[0].uriAudioProperty
        }
        callback(null, response);

      }
    }

  });

}

function deletePropertyAudio(event, context, callback) {

  var phoneNumber = event.phoneNumber;
  var idProperty = event.idProperty;

  var params = {
    TableName: "property",
    KeyConditionExpression: "phoneNumber = :phn and idProperty = :idProp",
    ExpressionAttributeValues: {
      ":phn": phoneNumber,
      ":idProp": idProperty
    }
  }
  dynamo.query(params, function(err, data) {
    if (err) {

      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));

    } else {
      //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      if (data.Items.length === 0) {
        //res.status(404).json({code:404,message :"No Phone Number Not Found !"});
        var response = {
          statusCode: 404,
          message: "Not Found !"
        }
        callback(null, response);

      } else {

        if (!data.Items[0].uriAudioProperty) {
          //res.status(400).send({code: 400 , message : "No audio welcome was found"});
          var response = {
            statusCode: 400,
            message: "No audio was found"
          }
          callback(null, response);

        } else {

          updatePropertyAfterDelete(event, context, callback);
          var uriAudioProperty = data.Items[0].uriAudioProperty;
          // getting the file name from a url
          var file = uriAudioProperty.split('/')[4];
          var params = {
            Bucket: "audiostorebucket/property",
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

function updatePropertyAfterDelete(event, context, callback) {

  var phoneNumber = event.phoneNumber;
  var idProperty = event.idProperty;
  var params = {
    TableName: "property",
    Key: {
      "phoneNumber": phoneNumber,
      "idProperty": idProperty
    },
    ConditionExpression: "phoneNumber = :phNo and idProperty = :id",
    ExpressionAttributeValues: {
      ":phNo": phoneNumber,
      ":id": idProperty
    },
    UpdateExpression: "remove uriAudioProperty",
    ReturnValues: "UPDATED_NEW"
  };
  //console.log("update" , params)
  dynamo.update(params, function(err, data) {
    if (err) {

      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      //res.status(400).json({code:400,message :err.message});
      var response = {
        statusCode: 400,
        message: "Something Went Wrong !"
      }
      callback(null, response);


    } else {
      //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
      //res.status(200).send({code: 200 , message : "OK"});
      var response = {
        statusCode: 200,
        message: "OK"
      }
      callback(null, response);

    }
  });
}
