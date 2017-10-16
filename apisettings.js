{ "params": {
    "phoneNumber" : "$input.params('phoneNumber')"
    },

  "httpMethod": "$context.httpMethod",
  "body":"$input.body"
 }


 {
 "body" : $input.json('$'),
 "phoneNumber" : "$input.params('phoneNumber')"
 }
// s3 upload body template
 {
 "body" :$input.json('$'),
 "phoneNumber" : "$input.params('phoneNumber')",
 "httpMethod" : "$context.httpMethod"
 }
