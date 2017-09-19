var express     = require('express'),
    path        = require('path'),
    morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    dynamo      = require('dynamodb');





var config      = require('../config/development.config'),
    apiRoutes   = require('./router/app.router'),
    db          = require('./models/database');




    var app     = express();
    var Router  = express.Router();

    //var AWS= require('aws-sdk'),
    db();

    // middleware
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use('/v1',apiRoutes(Router));


    // connectin to the dynamo
    //var dynamodb = new AWS.DynamoDB(config.dynamodb-config);
    
    var port = config.port || 3000 ;
    // server listening
    app.listen(port,function(){
      console.log("Application is running on port " + port);
    })

    module.exports = app;
