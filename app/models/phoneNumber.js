
var phoneNumber = {
    TableName: 'phoneNumber',
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

module.exports.createTablePhoneNumber=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'phoneNumber'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(phoneNumber, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("phoneNumber table is created");
          });
        }
      } else console.log("phoneNumber table is active");


    })

  }
}
