'use strict';
var controller = require("./controller");

exports.handler = function(event, context, callback) {

  switch (event.httpMethod) {

    case 'GET' :

      if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.idProperty !== undefined && event.pathParameters.idProperty !== null && event.pathParameters.idProperty !== "") {
          controller.getBusinessMessage(event, context, callback);
        } else {
          controller.getConsumerMessage(event, context, callback);
        }
      }
  
      break;

    case 'POST' :

      if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.idProperty !== undefined && event.pathParameters.idProperty !== null && event.pathParameters.idProperty !== "") {
          controller.storeBusinessMessage(event, context, callback);
        } else {
          controller.storeConsumerMessage(event, context, callback);
        }
      }

      break;

    case 'DELETE' :

      if (event.pathParameters !== null && event.pathParameters !== undefined) {
        if (event.pathParameters.idProperty !== undefined && event.pathParameters.idProperty !== null && event.pathParameters.idProperty !== "") {
          controller.deleteBusinessMessage(event, context, callback);
        } else {
          controller.deleteConsumerMessage(event, context, callback);
        }
      }

      break;

    default:
      defaultFunctionCall(event, context, callback);

  }
};

function defaultFunctionCall(event, context, callback) {
  var response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: " bad request"
    })
  };
  callback(null, response);
}