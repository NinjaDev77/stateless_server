var express     = require('express'),
    path        = require('path'),
    morgan      = require('morgan'),
    bodyParser  = require('body-parser'),
    dynamo      = require('dynamodb');





var config      = require('./config/config'),
    apiRoutes   = require('./router/app.router'),
    db          = require('./models/database');




    var app     = express();
    var Router  = express.Router();

    // db call to create all the tables
    db();

    // middleware
    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use('/v1',apiRoutes(Router));


    var port = config.dev.port || 3000 ;

    // server listening
    app.listen(port,function(){
      console.log("Application is running on port " + port);
    })

    module.exports = app;
