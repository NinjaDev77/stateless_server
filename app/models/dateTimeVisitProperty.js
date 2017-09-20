
var dtVisitProperty = {
    TableName: 'dateTimeVisitProperty',
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

module.exports.createTableDTVisitProperty=function(con){
  if (con) {
    // check table is exists or not
    con.describeTable({TableName: 'dateTimeVisitProperty'},function(err,data){
      if(err) {
        // create table if not exist
        if (err.statusCode ===400) {
          con.createTable(dtVisitProperty, function(err, data) {
              if (err) console.error(err); // an error occurred
              else console.log("dateTimeVisitProperty table is created");
          });
        }
      } else console.log("dateTimeVisitProperty table is active");


    })

  }
}
