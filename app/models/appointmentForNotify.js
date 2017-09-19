
var appointmentForNotify = {
    TableName: 'appointmentForNotify',
    KeySchema: [
        {
            AttributeName: 'Id',
            KeyType: 'HASH',
        },

    ],
    AttributeDefinitions: [
        {
            AttributeName: 'Id',
            AttributeType: 'S',
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
    };

module.exports.createTableAppointmentForNotify=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'appointmentForNotify'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(appointmentForNotify, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("appointmentForNotify table is created");
          });
        }
      } else console.log("appointmentForNotify table is active");


    })

  }
}
