var AWS       = require('aws-sdk')
var multer    = require('multer');
var multerS3  = require('multer-s3');

AWS.config.loadFromPath('app/config/aws-config.json');
var uuid              = require('uuid/v4');
var s3 = new AWS.S3({apiVersion: '2006-03-01'})

var uploadWelcome = multer({

  storage: multerS3({
    s3: s3,
    bucket: 'audiostorebucket/welcome',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
          var extention = file.originalname.split('.')[1] ;
          var newFileName = uuid() +'.'+ extention ;
      cb(null, newFileName)

    }
  })

});

function getBucketList(){

  s3.listBuckets(function(err, data) {
     if (err) {
        console.log("Error", err);
     } else {
        console.log("Bucket List", data.Buckets);
     }
  });

};

function deleteFile(filename,bucket_name) {
    var bucketInstance = new AWS.S3();
    var params = {
        Bucket: bucket_name,
        Key: filename
    };
    return new Promise (function(resolve, reject){

      bucketInstance.deleteObject(params, function (err, data) {
          if (data) {
              //console.log("File deleted successfully");
              resolve()
          }
          else {

              //console.log("Check if you have sufficient permissions : "+err);
              reject(err);

          }
    });

  });

}

module.exports.uploadWelcome=uploadWelcome;
module.exports.deleteFile=deleteFile;
