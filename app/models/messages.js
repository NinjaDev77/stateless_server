
var message = {
    TableName: 'messages',
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

module.exports.createTableMessage=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'messages'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(message, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("messages table is created");
          });
        }
      } else console.log("messages table is active");


    })

  }
}
