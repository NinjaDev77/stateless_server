// This a validation file with different types of validation


module.exports.isNullOrUndefind=function (value) {
    if (value ===null || value === undefined ) {
      return true
    } else {
      return false
    }
}

module.exports.validateProfile = function(req,res,next){

  var body                = req.body;

  var customerID          = body.customerID,
      customerType        = body.customerType,
      customerEmail       = body.customerEmail,
      customerMobile      = body.customerMobile,
      uriAudioWelcome     = body.uriAudioWelcome,
      uriAudioAppointment = body.uriAudioAppointment,
      routingActive       = body.routingActive,
      routingPhone        = body.routingPhone;

  // custom validation
  if (customerID === undefined || customerID === null){
      sendBadResponse('customerID', res);
  }
  else  if (routingActive === undefined || routingActive === null){
     sendBadResponse('routingActive',res);
  }
  else  if (customerType === undefined || customerType === null){
      sendBadResponse('customerType',res);
  }
  else  if (customerEmail === undefined || customerEmail === null){
      sendBadResponse('customerEmail',res);
  }
  else if (routingActive === true){

        if (routingPhone === undefined || routingPhone === null){
          sendBadResponse('routingPhone',res);
        }else {
          next();
        }

  } else {
    next();
  }

}

function sendBadResponse (params ,res){
  res.status(400).send({code:400,message: params + " is missings"});
}
