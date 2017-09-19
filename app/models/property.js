
var profile = {
    TableName: 'property',
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

module.exports.createTableProperty=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'property'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(profile, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("property table is created");
          });
        }
      } else console.log("property table is active");


    })

  }
}
