var jwt             = require('jsonwebtoken');
var Token           = require('../framework/jwt.auth');
var profileCtrl     = require('../controllers/profileController');
var phoneNumberCtrl = require('../controllers/phoneNumberController');

  // Endpoints of the whole application
  module.exports = function(router) {

    router.get('/authenticate',function(req,res){
      var userToken   = new Token({app:"serverlessapp"});
      var token       = userToken.createToken();
      res.status(200).json({status :"OK", token:token});
    });
    
    // Endpoints for phone number
    router.post('/number',phoneNumberCtrl.createPhoneNumber);
    router.get('/number',phoneNumberCtrl.getAllPhoneNumbers);
    router.get('/number/:phoneNumber',phoneNumberCtrl.getPhoneNumber);
    router.delete('/number/:phoneNumber',phoneNumberCtrl.deletePhoneNumber);
    router.put('/number/:phoneNumber',phoneNumberCtrl.updatePhoneNumber);


    // Endpoints for profile
    router.post('/profile/:phoneNumber',profileCtrl.createProfile);
    router.get('/profile/:phoneNumber',isAuthticated,profileCtrl.getProfile);
    router.delete('/profile/:phoneNumber',profileCtrl.deleteProfile);

    return router;
  }

  // function to  check authenticate
  function isAuthticated (req,res,next){
    // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || req.headers.token;

    // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, 'test', function(err, decoded) {
      if (err) {
        console.log(err);
        return res.status(403).json({ code:403, message: 'unauthorized' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).json({ code:403, message: 'unauthorized' });

  }

  }
