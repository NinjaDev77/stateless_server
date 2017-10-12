'use strict'
// 
// const AWS = require('aws-sdk');
// var s3 = new AWS.S3({apiVersion: '2006-03-01'});
// //const s3  = new AWS.S3();
// const moment = require('moment');
// const fileType = require('file-type');
// const uuid = require('uuid/v4');

exports.handler = function (event,context,callback) {

  const AWS = require('aws-sdk');
  var s3 = new AWS.S3({apiVersion: '2006-03-01'});
  //const s3  = new AWS.S3();
  const moment = require('moment');
  const fileType = require('file-type');
  const uuid = require('uuid/v4');

  let request = event.body ;
  //let base64String = request.base64String ;
  //context.succeed(event);
  let buffer = new Buffer(request,'base64');
  let fileMime = fileType(request);

  if (fileMime === null){
    return context.fail('The string supplied is not a file type ');
  }

  let fileExt = fileMime.ext ;
  let fileName = uuid() + fileExt ;

  let params = {
    Bucket : 'audiostorebucket/welcome',
    Key    : fileName ,
    Body   : buffer
  }

  s3.upload(params, function(err,data){
    if (err) {
      return console.log(err) ;
    }
    return context.succeed(data);
  })
}

// var AWS = require('aws-sdk')
// var multer = require('multer');
// var multerS3 = require('multer-s3');
// var uuid = require('uuid/v4');
// var moment = require('moment');
// var bodyParser = require('body-parser');
// var s3 = new AWS.S3({
//   apiVersion: '2006-03-01'
// })
// var Client = new AWS.DynamoDB.DocumentClient();
// var express = require('express');
// var app = express();
//
// var uploadWelcome = multer({
//
//   storage: multerS3({
//     s3: s3,
//     bucket: 'audiostorebucket/welcome',
//     metadata: function(req, file, cb) {
//       cb(null, {
//         fieldName: file.fieldname
//       });
//     },
//     key: function(req, file, cb) {
//       var extention = file.originalname.split('.')[1];
//       console.log("ASHISHSKJHISHISHSIHS");
//       var newFileName = uuid() + '.' + extention;
//       cb(null, newFileName)
//
//     },
//   })
//
// });
//     app.use(bodyParser.json({limit: '5mb'}));
//     app.use(bodyParser.urlencoded({ extended: true , limit: '5mb' }));
//
//   app.post("/audios/:phoneNumber/welcome", uploadWelcome.array('audioFile', 1), function(req, res) {
//       //console.log(req.req);
//       //console.log(req);
//       var pathToTheFile   = req.files[0].location;
//
//       var phoneNumber     = req.params.phoneNumber;
//       var uriAudioWelcome = pathToTheFile ;
//
//       var params      = {
//                           TableName: "profile",
//                           Key:{
//                               "phoneNumber":phoneNumber
//                           },
//                           UpdateExpression :"set uriAudioWelcome = :uriAudioWelcome, dateTimeUpdated = :dtU",
//                           ExpressionAttributeValues:{
//                               ":uriAudioWelcome":uriAudioWelcome,
//                               ":dtU": moment().toISOString()
//                           },
//                           ReturnValues:"UPDATED_NEW"
//       };
//
//       Client.update(params, function(err, data) {
//         if (err) {
//
//             console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
//             res.status(400).json({code:400,message :err.message});
//
//         } else {
//             //console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
//             res.status(200).send({"uriAudioWelcome" : uriAudioWelcome});
//         }
//
//       });
//
//   });
//

// exports.handler = require('express-on-serverless')(app)
