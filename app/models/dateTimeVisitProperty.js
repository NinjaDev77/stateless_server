
var dtVisitProperty = {
    TableName: 'dateTimeVisitProperty',
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
