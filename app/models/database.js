var AWS         = require('aws-sdk'),
    dynamodb    = AWS.DynamoDB;





var profile               = require('./profile'),
    phoneNumber           = require('./phoneNumber'),
    property              = require('./property'),
    messages              = require('./messages'),
    appointments          = require('./appointments'),
    dateTimeVisitProperty = require('./dateTimeVisitProperty');



module.exports=function(){
  var dyn= new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000'),region:"test" ,accessKeyId:"abcd" ,secretAccessKey:"abcd"});

    // create all the tables

        // dyn.deleteTable({TableName: 'property'}, function(err, data) {
        //     if (err) console.log(err); // an error occurred
        //     else console.log(JSON.stringify(data)); // successful response
        // });
    // profile.createTableProfile(dyn);
     phoneNumber.createTablePhoneNumber(dyn);
    // property.createTableProperty(dyn);
    // messages.createTableMessage(dyn);
    // appointments.createTableAppointments(dyn);
    // dateTimeVisitProperty.createTableDTVisitProperty(dyn);
    //return dyn
    // var date = moment();
    // console.log(date.toISOString())

}
