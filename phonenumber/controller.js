'use strict';

const moment = require('moment');
const uuid = require('uuid/v4');
const isE164PhoneNumber = require('is-e164-phone-number');
const doc = require('dynamodb-doc');
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

// function to create phone number
// module.exports.createPhoneNumber = function(event, context) {

// 	let req 	   = event;
//   	let body       = JSON.parse(req.body);

// 	if (body.phoneNumber===undefined || body.phoneNumber === null) {
// 		return {statusCode: '400' ,body: { message : "Bad request"}};
// 	} else {

// 		var params = {
// 			TableName: 'phoneNumber',
// 			Item: {
// 				"phoneNumber"     : body.phoneNumber,
// 				"active"          : true,
// 				"dateTimeUpdated" : moment().toISOString(),
// 			},
// 			ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
// 			ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
// 			ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
// 		};

// 		dynamo.putItem(params, function(err, res) {

// 			const done = {
// 			    statusCode: err ? '400' : '200',
// 			    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
// 			    headers: {
// 			        'Content-Type': 'application/json',
// 			    },
// 			};

// 			context.succeed(done);

// 		});

// 	}

// };

// function to get all phone numbers
// module.exports.getAllPhoneNumbers = function(event, context) {

// 	var params = {
// 		TableName: "phoneNumber",
// 		ReturnConsumedCapacity   : "TOTAL"
// 	};

// 	dynamo.scan(params, function(err, res) {

// 		const done = {
// 		    statusCode: err ? '400' : '200',
// 		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
// 		    headers: {
// 		        'Content-Type': 'application/json',
// 		    },
// 		};

// 		context.succeed(done);

// 	});

// };

// function to get a number detail with a number provided
// module.exports.getPhoneNumber = function(event, context) {

// 	var phoneNumber = body.phoneNumber
// 	var params      = {
// 		TableName: "phoneNumber",
// 		KeyConditionExpression: "phoneNumber = :phn",
// 		ExpressionAttributeValues: {
// 			":phn": phoneNumber
// 		}
// 	}

// 	dynamo.scan(params, function(err, res) {

// 		const done = {
// 		    statusCode: err ? '400' : '200',
// 		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
// 		    headers: {
// 		        'Content-Type': 'application/json',
// 		    },
// 		};

// 		context.succeed(done);

// 	});

// };

// function to update a number details with a number provided
// module.exports.updatePhoneNumber = function(event, context) {

// 	var phoneNumber = body.phoneNumber;
// 	var active      = body.active;

// 	if (active === null || active == undefined) {

// 	res.status(404).json({code:404 , message : "active is missing"}) ;

// 	} else {

//     var params      = {
//         TableName: "phoneNumber",
//         Key:{
//             "phoneNumber":phoneNumber
//         },
//         UpdateExpression :"set active = :ac, dateTimeUpdated = :dtU",
//         ExpressionAttributeValues:{
//             ":ac":active,
//             ":dtU": moment().toISOString()
//         },
//         ReturnValues:"UPDATED_NEW"
//     };

//     dynamo.updateItem(params, function(err, res) {

// 		const done = {
// 		    statusCode: err ? '400' : '200',
// 		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
// 		    headers: {
// 		        'Content-Type': 'application/json',
// 		    },
// 		};

// 		context.succeed(done);

// 	});

//   }

// };

// function to delete phone number
// module.exports.deletePhoneNumber = function (event, context) {

// 	var phoneNumber = body.phoneNumber;
// 	var params      = {
// 		TableName: "phoneNumber",
// 		Key:{
// 	  		"phoneNumber":phoneNumber
// 		}
// 	};

// 	dynamo.deleteItem(params, function(err, res) {

// 		const done = {
// 		    statusCode: err ? '400' : '200',
// 		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
// 		    headers: {
// 		        'Content-Type': 'application/json',
// 		    },
// 		};

// 		context.succeed(done);

// 	});

// }

// function to check the existence of the provided phone number 
function isPhoneNumberExist(phoneNumber){

  var payloads = {
    TableName: "phoneNumber",
    KeyConditionExpression: "phoneNumber = :phn",
    ExpressionAttributeValues: {
      ":phn": phoneNumber
    }
  };
  
  return new Promise (function(resolve, reject){

    dynamo.query(payloads, function(err, data) {

      if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        //res.status(400).json({code:400,message :err.message});
      } else {
        // if no records found then reject else resolve
        if (data.Items.length === 0 ) {
          console.log('resolved');
			    resolve();
        } else {
          console.log('rejected');
			    reject();
        }
      }

    });

  })

}

// function to store phone number in db
module.exports.createPhoneNumber = function(event, context, callback){

  var body = JSON.parse(event.body);
  var phoneNumber = body.phoneNumber;
  var active = body.active;
  var ifNumbervalid = isE164PhoneNumber('+' + phoneNumber);

	if (active === null || active === undefined || phoneNumber === null || phoneNumber === undefined){ 
	
		var response = {
			statusCode: 400,
			headers: {
			"Content-Type": "application/json"
			},
			body: JSON.stringify({
			"message": "Mandator Field is missing !"
			})
		};
		callback(null, response);

	} else {

		if (!ifNumbervalid) {

      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Phone number is not in E164 format"
        })
      };

      callback(null, response);

    } else {

      // isPhoneNumberExist(phoneNumber).then(function(){

          var payload = {
            TableName: 'phoneNumber',
            Item: { // a map of attribute name to AttributeValue
              "phoneNumber": phoneNumber,
              "active": active
            },
            ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
            ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
            ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
          };
          
          //method to put into the dynamodb
          dynamo.put(payload, function(err, data) {
            if (err) {
              
              console.error(err); // an error occurred
              var response = {
                statusCode: 400,
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  "message": "Error in creating phone number"
                })
              };
              callback(null, response);

            } else {
              console.log('In errro');
              var response = {
                statusCode: 200,
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  "message": "OK"
                })
              };
              callback(null, response);

            }
          });

      // }).catch(function(){
      //   console.log('In Catch');
      //   var response = {
      //     statusCode: 400,
      //     headers: {
      //       "Content-Type": "application/json"
      //     },
      //     body: JSON.stringify({
      //       "message": "Phone number is already present!"
      //     })
      //   };
      //   callback(null, response);
      // })

    }

	}

}
