'use strict';

const moment            = require('moment');
const uuid              = require('uuid/v4');
const isE164PhoneNumber = require('is-e164-phone-number');

// connection to the DynamoDB
const doc 				= require('dynamodb-doc');

const dynamo 			= new doc.DynamoDB();

exports.handler = (event, context, callback) => {

	var body = event;

    if (body.phoneNumber===undefined || body.phoneNumber === null) {

		callback(null, {code :400, message:"Bad request"});

	} else {

		var phoneNumber   = body.phoneNumber ;
    	var isNumberE164  = isE164PhoneNumber("+"+ phoneNumber);

    	// checking number format before adding it to db
    	if (!isNumberE164) {

    		callback(null, {code:400, message : "Phone Number is not ES164"});
    	
    	} else {

			var params      = {
				TableName: 'phoneNumber',
				Item: {
					"phoneNumber"     : body.phoneNumber,
					"active"          : true,
					"dateTimeUpdated" : moment().toISOString()
				},
				ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
				ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
				ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
			};

			const done = (err, res) => callback(null, {
		        statusCode: err ? '400' : '200',
		        body: err ? "Bad request" : "OK",
		        headers: {
		            'Content-Type': 'application/json',
		        },
		    });

			//method to put into the dynamodb
			dynamo.putItem(params, done);
		}
	}
};