'use strict';

const moment = require('moment');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
exports.handler = (event, context, callback) => {

  var idProperty  = event.pathParameters.idProperty;

  if (idProperty === null || idProperty === undefined ){

    getConsumerReportsCalls(event, callback)

  } else {

    getBusinessReportsCalls(event, callback);

  }


};

function getConsumerReportsCalls(event,callback){

  var phoneNumber = event.pathParameters.phoneNumber;
  var idProperty  = event.pathParameters.idProperty;

  var payload = {
      TableName: 'outboundCalls',
      Select: 'ALL_ATTRIBUTES',
      ReturnConsumedCapacity: 'TOTAL',
      FilterExpression: '#phoneNumber = :phoneNumber' ,
      ExpressionAttributeNames: {
          '#phoneNumber': 'phoneNumber',
          //'#idProperty' : 'idProperty'
      },
      ExpressionAttributeValues: {
          ':phoneNumber': phoneNumber,
          //':idPropertyCustomer': idProperty
      }
  };

//}
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
                "message": "Error in getting message"
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
                    "message": "No message was found!"
                })
            };
            callback(null, response);

        } else {


            var records = data.Items;
            var recordCount = 0;
            for(let i = 0; i < records.length; i++){

                if(moment(records[i].dateTimeCall).month() == moment().month() ){
                    recordCount++;
                    if(i == records.length-1) {
                        var response = {
                            statusCode: 200,
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "message": "OK",
                                "numberCalls": recordCount
                            })
                        };
                        callback(null, response);
                    }

                }
            }

        }

    }

});


}


function getBusinessReportsCalls (event,callback){

  var phoneNumber = event.pathParameters.phoneNumber;
  var idProperty  = event.pathParameters.idProperty;

  var payload = {
      TableName: 'outboundCalls',
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
console.log(payload)
//}
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
                "message": "Error in getting calls"
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
                    "message": "No message was found!"
                })
            };
            callback(null, response);

        } else {


            var records = data.Items;
            var recordCount = 0;
            for(let i = 0; i < records.length; i++){

                if(moment(records[i].dateTimeCall).month() == moment().month() ){
                    recordCount++;
                    if(i == records.length-1) {
                        var response = {
                            statusCode: 200,
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "message": "OK",
                                "numberCalls": recordCount
                            })
                        };
                        callback(null, response);
                    }

                }
            }

        }

    }

});

}
