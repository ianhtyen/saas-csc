const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const AWS = require("aws-sdk");
const configApp = require("../config.js");
let awsConfig = configApp.awsConfig;
AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();
const dotenv = require('dotenv');
dotenv.config();

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'email'},(email,password,done)=>{
            var params = {
                TableName: "users",
                Key:{
                    "email": email
                }
            };
            //match user
            try {
            docClient.get(params, function(err, data) {
                    if (err) {
                        console.log(err);
                        console.log(email);
                        return done(null,false,{message:'Email is not registered'});
                    } else {
                        bcrypt.compare(password,data.Item.password,(err,isMatch)=>{
                            if(err) throw Error;
                            if(isMatch){
                                return done(null,data.Item);
                            } else{
                                return done(null,false,{message: 'Incorrect Password'});
                            }
                        })
                };      
            })
            }catch(err) {
                console.log(err);
            }
        })
    )
    passport.serializeUser(function(user,done) {
        done(null,user.email);
    })
    passport.deserializeUser(function(email,done){
        const paramsDes = {
            TableName :"users",
            Key: {
                "email": email
            }
        }
        docClient.get(paramsDes, function(err,data){
            if (err){
              done(err,data);
            }
            done(err,data);
          })
    })
}