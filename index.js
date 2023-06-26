const otpGen=require('otp-generator')
let otp=otpGen.generate(6,{digits:true,upperCaseAlphabets:false,lowerCaseAlphabets:false,speclaliChars:false})

// sid and aut_token is token form twilio after login get both token and cid and from twilio mobile number bhi web site sai hi 

var sid="AC61f2ca4abdee33297c145de5a4b9ebc3";
var auth_token="264319e33bbab9c0e2fe796758432257";
var twilio=require("twilio")(sid,auth_token);

twilio.messages.create({
    from:"+15076046360",
    to:"+917651972973",
    body:`this is testing OTP is ${otp}`,

})
.then(function(res){console.log("message has send on your mobile !")})
.catch(function(err){
    console.log(err);
})