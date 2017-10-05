'use strict';

const moment            = require('moment');

const uuid              = require('uuid/v4');

const doc 				= require('dynamodb-doc');

const dynamo 			= new doc.DynamoDB();

const isE164PhoneNumber = require('is-e164-phone-number');

// function to create phone number
module.exports.createPhoneNumber = function(event, context){

	let req           = event;
  let body          = JSON.parse(req.body);

	if (body.phoneNumber===undefined || body.phoneNumber === null) {
		return {statusCode: '400' ,body: { message : "Bad request"}};
	} else {

		var params      = {
			TableName: 'phoneNumber',
			Item: {
				"phoneNumber"     : body.phoneNumber,
				"active"          : true,
				"dateTimeUpdated" : moment().toISOString(),
			},
			ReturnValues: 'NONE', // optional (NONE | ALL_OLD)
			ReturnConsumedCapacity: 'NONE', // optional (NONE | TOTAL | INDEXES)
			ReturnItemCollectionMetrics: 'NONE', // optional (NONE | SIZE)
		};

		dynamo.putItem(params, function(err, res) {

			const done = {
			    statusCode: err ? '400' : '200',
			    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
			    headers: {
			        'Content-Type': 'application/json',
			    },
			};

			context.succeed(done);

		});

	}

};

// function to get all phone numbers
module.exports.getAllPhoneNumbers =function(event, context){

	var params = {
		TableName: "phoneNumber",
		ReturnConsumedCapacity   : "TOTAL"
	};

	dynamo.scan(params, function(err, res) {

		const done = {
		    statusCode: err ? '400' : '200',
		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
		    headers: {
		        'Content-Type': 'application/json',
		    },
		};

		context.succeed(done);

	});

};

// function to get a number detail with a number provided
module.exports.getPhoneNumber =function(event, context){

	var phoneNumber = body.phoneNumber
	var params      = {
		TableName: "phoneNumber",
		KeyConditionExpression: "phoneNumber = :phn",
		ExpressionAttributeValues: {
			":phn": phoneNumber
		}
	}

	dynamo.scan(params, function(err, res) {

		const done = {
		    statusCode: err ? '400' : '200',
		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
		    headers: {
		        'Content-Type': 'application/json',
		    },
		};

		context.succeed(done);

	});

};

// function to update a number details with a number provided
module.exports.updatePhoneNumber =function(event, context){

	var phoneNumber = body.phoneNumber;
	var active      = body.active;

	if (active === null || active == undefined) {

	res.status(404).json({code:404 , message : "active is missing"}) ;

	} else {

    var params      = {
        TableName: "phoneNumber",
        Key:{
            "phoneNumber":phoneNumber
        },
        UpdateExpression :"set active = :ac, dateTimeUpdated = :dtU",
        ExpressionAttributeValues:{
            ":ac":active,
            ":dtU": moment().toISOString()
        },
        ReturnValues:"UPDATED_NEW"
    };

    dynamo.updateItem(params, function(err, res) {

		const done = {
		    statusCode: err ? '400' : '200',
		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
		    headers: {
		        'Content-Type': 'application/json',
		    },
		};

		context.succeed(done);

	});

  }

};

// function to delete phone number
module.exports.deletePhoneNumber =function (event, context) {

	var phoneNumber = body.phoneNumber;
	var params      = {
		TableName: "phoneNumber",
		Key:{
	  		"phoneNumber":phoneNumber
		}
	};

	dynamo.deleteItem(params, function(err, res) {

		const done = {
		    statusCode: err ? '400' : '200',
		    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
		    headers: {
		        'Content-Type': 'application/json',
		    },
		};

		context.succeed(done);

	});

}
