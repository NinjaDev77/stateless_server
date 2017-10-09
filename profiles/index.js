'use strict';
var controller = require("./controller");

exports.handler = function(event, context, callback) {

  switch (event.httpMethod) {

    case 'GET' :

      controller.getProfile(event, context, callback);
      break;

    case 'POST' :

      controller.createProfile(event, context, callback);
      break;

    case 'PUT' :

      controller.updateProfile(event, context, callback);
      break;

    case 'DELETE' :

      controller.deleteProfile(event, context, callback);
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
