var jwt             = require('jsonwebtoken');
var Token           = require('../framework/jwt.auth');
var profileCtrl     = require('../controllers/profileController');
var phoneNumberCtrl = require('../controllers/phoneNumberController');
var validate = require('../framework/validation');

  // Endpoints of the whole application
  module.exports = function(router) {

    router.get('/authenticate',function(req,res){
      var userToken   = new Token({app:"serverlessapp"});
      var token       = userToken.createToken();
      res.status(200).json({status :"OK", token:token});
    });

    // Endpoints for phone number
    router.post('/number',isAuthenticated,phoneNumberCtrl.createPhoneNumber);
    router.get('/number', isAuthenticated,phoneNumberCtrl.getAllPhoneNumbers);
    router.get('/number/:phoneNumber', isAuthenticated,phoneNumberCtrl.getPhoneNumber);
    router.delete('/number/:phoneNumber', isAuthenticated,phoneNumberCtrl.deletePhoneNumber);
    router.put('/number/:phoneNumber', isAuthenticated, phoneNumberCtrl.updatePhoneNumber);


    // Endpoints for profile
    router.post('/profile/:phoneNumber', isAuthenticated,validate.validateProfile,profileCtrl.createProfile);
    router.get('/profile/:phoneNumber', isAuthenticated,profileCtrl.getProfile);
    router.delete('/profile/:phoneNumber', isAuthenticated,profileCtrl.deleteProfile);
    router.put('/profile/:phoneNumber', isAuthenticated, profileCtrl.updateProfile)

    return router;
  }

  // function to  check authenticate
  function isAuthenticated (req,res,next){
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
