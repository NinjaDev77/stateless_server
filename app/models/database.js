var AWS                   = require('aws-sdk')

var config                = require('../config/config'),
    profile               = require('./profile'),
    phoneNumber           = require('./phoneNumber'),
    property              = require('./property'),
    messages              = require('./messages'),
    appointments          = require('./appointments'),
    dateTimeVisitProperty = require('./dateTimeVisitProperty');

var dynamodb              = AWS.DynamoDB;

module.exports=function(){
  if (config.enviroment === 'dev') {
    var Client= new AWS.DynamoDB({
                                endpoint:config.dev.endpoint,
                                region:config.dev.region,
                                accessKeyId:config.dev.accessKeyId,
                                secretAccessKey:config.dev.secretAccessKey
                              });

  };
    /**
    * Create Table In The Database Or Check Whether It's Alive
    *
    */
     phoneNumber.createTablePhoneNumber(Client);
    // property.createTableProperty(Client);
    // messages.createTableMessage(Client);
    // appointments.createTableAppointments(Client);
    // dateTimeVisitProperty.createTableDTVisitProperty(Client);


}
