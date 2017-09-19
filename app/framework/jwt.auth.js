var jwt = require('jsonwebtoken');

  function Token(username){
    this.username=username
  }
  Token.prototype.createToken=function(){
    // sign asynchronously
  var token = jwt.sign(this.username, "test", { algorithm: 'HS256' },{ expiresIn: 60 * 60 * 60 });
  return token
  }

module.exports=Token
