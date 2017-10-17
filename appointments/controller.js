'use strict';

const moment = require('moment');
const uuid = require('uuid/v4');
const isE164PhoneNumber = require('is-e164-phone-number');
const doc = require('dynamodb-doc');
const AWS = require('aws-sdk');

const dynamo = new AWS.DynamoDB.DocumentClient();

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

          reject();
        } else {
          resolve()
        }
      }

    });

  })

}

// function to check the existence of the provided phone number and id property
function isIdPropertyExist(phoneNumber, idProperty){

  var payloads = {
    TableName: "property",
    KeyConditionExpression: "phoneNumber = :phn AND idProperty = :id",
    ExpressionAttributeValues: {
      ":phn": phoneNumber,
      ":id": idProperty
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
          reject();
        } else {
          resolve()
        }
      }

    });

  })

}

// function to get appointments from number ( consumer customer )
module.exports.getConsumerAppointment = function(event, context, callback) {

  var phoneNumber = event.pathParameters.phoneNumber;

  var payload = {
    TableName: "appointments",
    KeyConditionExpression: "phoneNumber = :phn",
    ExpressionAttributeValues: {
      ":phn": phoneNumber
    }
  };

  // function to get appointment in dynamodb with the above params
  dynamo.query(payload, function(err, data) {

    if (err) {

      console.error(err);
      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Error in getting appointment"
        })
      };
      callback(null, response);

    } else {

      if (data.Items.length === 0) {

        var response = {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "message": "No appointment was found !"
          })
        };
        callback(null, response);

      } else {

        var response = {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "message": "OK",
            "data": data.Items
          })
        };
        callback(null, response);

      }

    }

  });

};

// function to get appointments from number ( business customer )
module.exports.getBusinessAppointment = function(event, context, callback) {

  var phoneNumber = event.pathParameters.phoneNumber;
  var idProperty  = event.pathParameters.idProperty;

  var payload = {
        TableName: 'appointments',
        Select: 'ALL_ATTRIBUTES',
        ReturnConsumedCapacity: 'TOTAL',
        FilterExpression: '#phoneNumber = :phoneNumber and #idProperty = :idProperty' ,
        ExpressionAttributeNames: {
            '#phoneNumber': 'phoneNumber',
            '#idProperty' : 'idProperty'
        },
        ExpressionAttributeValues: {
            ':phoneNumber': phoneNumber,
            ':idProperty': idProperty
        }
    };

    // var payload = {
    //     TableName: "appointments",
    //     KeyConditionExpression: "phoneNumber = :phn AND appointmentId = :appId AND idProperty = :id",
    //     ExpressionAttributeValues: {
    //         ":phn": phoneNumber,
    //         ":appId": 'undefined',
    //         ":id": idProperty
    //     }
    // };

  // function to get appointment in dynamodb with the above params
  dynamo.scan(payload, function(err, data) {

    if (err) {

      console.error(err);
      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Error in getting appointment"
        })
      };
      callback(null, response);

    } else {

      if (data.Items.length === 0) {

        var response = {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "message": "No appointment was Found !"
          })
        };
        callback(null, response);

      } else {

        var response = {
          statusCode: 200,
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "message": "OK",
            "data": data.Items
          })
        };
        callback(null, response);

      }

    }

  });

};

// function to store appointments from number ( consumer customer )
module.exports.storeConsumerAppointment = function(event, context, callback) {

  var body = JSON.parse(event.body);

  var phoneNumber = event.pathParameters.phoneNumber;

  var isNumberValid = isE164PhoneNumber('+' + phoneNumber);

  if (!isNumberValid) {

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

      var phoneTo             = body.phoneTo,
          appointmentId       = uuid(),
          appointmentDateTime = moment(body.appointmentDateTime).toISOString(),
          callStatus          = body.callStatus,
          createdAt           = moment().toISOString(),
          updatedAt           = moment().toISOString();


      if( phoneTo !== null || phoneTo !== undefined || phoneTo !== ''){

        if (!isE164PhoneNumber('+' + phoneTo)) {

          var response = {
            statusCode: 400,
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "message": "PhoneTo number is not in E164 format"
            })
          };

          callback(null, response);

        }

      }

      if (appointmentId === null || appointmentId === undefined || phoneTo === null || phoneTo === undefined || callStatus === null || callStatus === undefined || appointmentDateTime === null || appointmentDateTime === undefined){

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

        var payload = {
          TableName: 'appointments',
          Item: { // a map of attribute name to AttributeValue
            "phoneNumber": phoneNumber,
            "appointmentId": appointmentId,
            "phoneTo": phoneTo,
            "appointmentDateTime": appointmentDateTime,
            "callStatus": callStatus,
            "createdAt": createdAt,
            "updatedAt": updatedAt
          },
          ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
          ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
          ReturnItemCollectionMetrics: 'NONE' // optional (NONE | SIZE)
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
                "message": "Error in creating appointment"
              })
            };
            callback(null, response);

          } else {

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

      }

    // }).catch(function(){
    //   var response = {
    //     statusCode: 400,
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //       "message": "Phone number not found !"
    //     })
    //   };
    //   callback(null, response);
    // })

  }

};

// function to store appointments from number ( business customer )
module.exports.storeBusinessAppointment = function(event, context, callback) {

  var body = JSON.parse(event.body);
  var phoneNumber = event.pathParameters.phoneNumber;
  var idProperty = event.pathParameters.idProperty;

  var isNumberValid = isE164PhoneNumber('+' + phoneNumber);

  if (!isNumberValid) {

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

    // isIdPropertyExist(phoneNumber, idProperty).then(function(){

      var phoneTo             = body.phoneTo,
          appointmentId       = uuid(),
          appointmentDateTime = moment(body.appointmentDateTime).toISOString(),
          callStatus          = body.callStatus,
          createdAt           = moment().toISOString(),
          updatedAt           = moment().toISOString();

      if( phoneTo !== null && phoneTo !== undefined && phoneTo !== ''){

        if (!isE164PhoneNumber('+' + phoneTo)) {

          var response = {
            statusCode: 400,
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              "message": "PhoneTo number is not in E164 format"
            })
          };

          callback(null, response);

        }

      }

      if (phoneTo === null || phoneTo === undefined || callStatus === null || callStatus === undefined || appointmentDateTime === null || appointmentDateTime === undefined){

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

        var payload = {
          TableName: 'appointments',
          Item: { // a map of attribute name to AttributeValue
            "phoneNumber": phoneNumber,
            "appointmentId": appointmentId,
            "idProperty": idProperty,
            "phoneTo": phoneTo,
            "appointmentDateTime": appointmentDateTime,
            "callStatus": callStatus,
            "createdAt": createdAt,
            "updatedAt": updatedAt
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
                "message": "Error in creating appointment"
              })
            };
            callback(null, response);

          } else {

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

      }

    // }).catch(function(){
    //   var response = {
    //     statusCode: 400,
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //       "message": "Phone number not found !"
    //     })
    //   };
    //   callback(null, response);
    // })

  }
};

// function to update appointments from number ( consumer customer )
module.exports.updateConsumerAppointment = function(event, context, callback) {

  var phoneNumber         = event.pathParameters.phoneNumber;
  var body                = JSON.parse(event.body);

  var phoneTo             = body.phoneTo,
      appointmentId       = body.appointmentId,
      appointmentDateTime = moment(body.appointmentDateTime).toISOString(),
      callStatus          = body.callStatus,
      updatedAt           = moment().toISOString();


  // object to map to the db attribute value
  var dbAttributeValue    = {
    ":phoneTo"             : phoneTo,
    ":appointmentDateTime" : appointmentDateTime,
    ":callStatus"          : callStatus,
    ":updatedAt"           : updatedAt
  };

  // creating dynamic query string to map the Attribute values
  var dbUpdateExpression = "set "                                                +
    (phoneTo             ? "phoneTo             = :phoneTo, "              : "") +
    (appointmentDateTime ? "appointmentDateTime = :appointmentDateTime, "  : "") +
    (callStatus==false || callStatus==true ? "callStatus = :callStatus, "  : "") +
    (updatedAt           ? "updatedAt           = :updatedAt "             : "") ;

  var payloads = {
    TableName: "appointments",
    Key: {
        "phoneNumber": phoneNumber,
        "appointmentId": appointmentId
    },
    UpdateExpression: dbUpdateExpression,
    ExpressionAttributeValues: dbAttributeValue,
    ReturnValues:"UPDATED_NEW"
  };
  console.log('Payload', payloads);
  dynamo.update(payloads, function(err, data) {
    if (err) {

      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Error in appointment"
        })
      };
      callback(null, response);

    } else {

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

};

// function to update appointments from number ( business customer )
module.exports.updateBusinessAppointment = function(event, context, callback) {

  var phoneNumber         = event.pathParameters.phoneNumber;
  var idProperty          = event.pathParameters.idProperty;

  var body                = JSON.parse(event.body);

  var phoneTo             = body.phoneTo,
      appointmentDateTime = moment(body.appointmentDateTime).toISOString(),
      callStatus          = body.callStatus,
      appointmentId       = body.appointmentId,
      updatedAt           = moment().toISOString();


  // object to map to the db attribute value
  var dbAttributeValue    = {
    ":phoneTo"             : phoneTo,
    ":appointmentDateTime" : appointmentDateTime,
    ":callStatus"          : callStatus,
    ":updatedAt"           : updatedAt
  };

  // creating dynamic query string to map the Attribute values
  var dbUpdateExpression  = "set "                                               +
    (phoneTo             ? "phoneTo             = :phoneTo, "              : "") +
    (appointmentDateTime ? "appointmentDateTime = :appointmentDateTime, "  : "") +
    (callStatus==false || callStatus==true ? "callStatus = :callStatus, "  : "") +
    (updatedAt           ? "updatedAt           = :updatedAt "             : "") ;

  var payloads = {
    TableName: "appointments",
    Key: {
        "phoneNumber": phoneNumber,
        "appointmentId": appointmentId
    },
    UpdateExpression: dbUpdateExpression,
    ExpressionAttributeValues: dbAttributeValue,
    ReturnValues:"UPDATED_NEW"
  }

  dynamo.update(payloads, function(err, data) {
    if (err) {

      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
      var response = {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": "Error in appointment"
        })
      };
      callback(null, response);

    } else {

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

};
