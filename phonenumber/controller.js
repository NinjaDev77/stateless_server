'use strict';

const moment            = require('moment');

const uuid              = require('uuid/v4');

const doc = require('dynamodb-doc');

const dynamo = new doc.DynamoDB();

const isE164PhoneNumber = require('is-e164-phone-number');

const done = (err, res) => callback(null, {
    statusCode: err ? '400' : '200',
    body: err ? err.message : Object.keys(res).length ? { Description :"OK", data:res.Items } : { message :"No Phone Number Not Found !" },
    headers: {
        'Content-Type': 'application/json',
    },
});

// function to get all phone numbers
module.exports.getAllPhoneNumbers =function(req,res){

	var params = {
		TableName: "phoneNumber",
		ReturnConsumedCapacity   : "TOTAL"
	};

	dynamo.scan(params, done);

};

// function to get a number detail with a number provided
module.exports.getPhoneNumber =function(req,res){

	var phoneNumber = req.params.phoneNumber
	var params      = {
		TableName: "phoneNumber",
		KeyConditionExpression: "phoneNumber = :phn",
		ExpressionAttributeValues: {
			":phn": phoneNumber
		}
	}

	dynamo.scan(params, done);

};