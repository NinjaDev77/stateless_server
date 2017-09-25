var jwt               = require('jsonwebtoken');
var Token             = require('../framework/jwt.auth');
var profileCtrl       = require('../controllers/profileController');
var phoneNumberCtrl   = require('../controllers/phoneNumberController');
var validate          = require('../framework/validation');
var routerMiddleware  = require('./routerMiddleware');
var uploadS3          = require('../framework/awsS3');
var audioWelcomeCtrl  = require('../controllers/audiosController');


  // Endpoints of the whole application
  module.exports = function(router) {

    var isAuthenticated        = routerMiddleware.isAuthenticated,
        checkPhoneNumber       = routerMiddleware.checkPhoneNumber ;

    router.post('/authenticate',checkPhoneNumber,authenticate)

    // Endpoints for phone number
    router.post('/numbers',phoneNumberCtrl.createPhoneNumber);
    router.get('/numbers', isAuthenticated,phoneNumberCtrl.getAllPhoneNumbers);
    router.get('/numbers/:phoneNumber', isAuthenticated,phoneNumberCtrl.getPhoneNumber);
    router.delete('/numbers/:phoneNumber', isAuthenticated,phoneNumberCtrl.deletePhoneNumber);
    router.put('/numbers/:phoneNumber', isAuthenticated, phoneNumberCtrl.updatePhoneNumber);


    // Endpoints for profile
    router.post('/profiles/:phoneNumber', isAuthenticated,validate.validateProfile,profileCtrl.createProfile);
    router.get('/profiles/:phoneNumber', isAuthenticated,profileCtrl.getProfile);
    router.delete('/profiles/:phoneNumber', isAuthenticated,profileCtrl.deleteProfile);
    router.put('/profiles/:phoneNumber', isAuthenticated, profileCtrl.updateProfile);

    // endpoints for audios
    router.post('/audios/:phoneNumber/welcome', checkPhoneNumber,uploadS3.uploadWelcome.array('audioFile',1) ,audioWelcomeCtrl.welcomeUpload);
    router.get('/audios/:phoneNumber/welcome', audioWelcomeCtrl.getWelcomeAudio);
    router.delete('/audios/:phoneNumber/welcome',audioWelcomeCtrl.deleteWelcomeAudio);

    return router;

    function authenticate (req,res,next){

      var phoneNumber = req.body.phoneNumber ;
      var userToken   = new Token({phoneNumber:phoneNumber});
      var token       = userToken.createToken();
      res.status(200).json({status :"OK", token:token});

    }
  }
