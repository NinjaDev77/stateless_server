
var profile = {
    TableName: 'profile',
    AttributeDefinitions: [
        {
            AttributeName: 'Id',
            AttributeType: 'S',
        }
    ],
    KeySchema: [
        {
            AttributeName: 'Id',
            KeyType: 'HASH',
        },

  ],
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
    },
    };

module.exports.createTableProfile=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'profile'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(profile, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("profile table is created");
          });
        }
      } else console.log("profile table is active");


    })

  }
}
