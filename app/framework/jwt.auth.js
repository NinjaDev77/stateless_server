var jwt = require('jsonwebtoken');
  // Token Class
  function Token(username){
    this.username=username
  }
  // Token generating method
  Token.prototype.createToken=function(){
    var token = jwt.sign(this.username, "test",{ algorithm: 'HS256', expiresIn: 60*60*24 });
    return token
  }

module.exports=Token
