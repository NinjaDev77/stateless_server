
var appointments = {
    TableName: 'appointments',
    KeySchema: [
        {
            AttributeName: 'phoneNumber',
            KeyType: 'HASH',
        },

    ],
    AttributeDefinitions: [
        {
            AttributeName: 'phoneNumber',
            AttributeType: 'S',
        }
    ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
    },
    };

module.exports.createTableAppointments=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'messages'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(appointments, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("appointments table is created");
          });
        }
      } else console.log("appointments table is active");


    })

  }
}
