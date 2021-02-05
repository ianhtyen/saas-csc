const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const AWS = require("aws-sdk");
const configApp = require("../config.js");
let awsConfig = configApp.awsConfig;
AWS.config.update(awsConfig);
var docClient = new AWS.DynamoDB.DocumentClient();
const dotenv = require('dotenv');
dotenv.config();

//stripe config:
const keySecret = process.env.stripe_sKey;
const stripe = require("stripe")(keySecret);


//welcome handle
router.get('/login',(req,res)=>{
    res.render('login');
});
router.get('/register',(req,res)=>{
    res.render('register')
});

//login post handle
router.post('/login',(req,res,next)=>{
passport.authenticate('local',{
    successRedirect : '/dashboard',
    failureRedirect: '/users/login',
    failureFlash : true
})(req,res,next)
});

//stripe handle
router.post("/charge", (req, res) => {
    let amount = 50;
  
    stripe.customers.create({
       email: req.body.stripeEmail,
      source: req.body.stripeToken
    })
    .then(customer =>
      stripe.charges.create({
        amount,
        description: "Sample Charge",
           currency: "usd",
           customer: customer.id
      }))
    .then((charge) => {
        var input = {
            "email": req.body.stripeEmail,
        };
        var paramsWrite = {
            TableName: "stripe",
            Item:  input
        };
        docClient.put(paramsWrite, function(err, data) {
            if (err) { //DB Problem
                console.log(err);
                errors.push({msg: "Unable to save to db, JSON:" + err})
                res.redirect('/dashboard');
            } else { //Successful
                console.log(data);
                req.flash('success_msg','Successfully Registered!');
                res.redirect('/dashboard');
            }
        });
    });
});

//test handle
router.get('/get',(req,res)=>{
    res.status(200).send("ABC");
});


//register post handle
router.post('/register',(req,res)=>{
    const {email, password, password2} = req.body;
    let errors = [];
    console.log(' email :' + email+ ' pass:' + password);
    if(!email || !password || !password2) {
        errors.push({msg : "Please fill in all fields"})
    }
    //check if match
    if(password !== password2) {
        errors.push({msg : "Passwords don't match"});
    }
    
    //check if password is more than 6 characters
    if(password.length < 6 ) {
        errors.push({msg : 'password atleast 6 characters'})
    }

    //check if there is error message(s)
    if(errors.length > 0 ) {
    res.render('register', {
        errors : errors,
        email : email,
        password : password,
        password2 : password2})
     } else {
        //validation passed
        const newUser = ({
            email : email,
            password : password
        });
        var params = {
            TableName: "users",
            Key: {
                "email": newUser.email,
            }
        };
        docClient.get(params, function(err, data) {
            if (err) { //fail to get item
                errors.push({msg: "Unable to read item. Error JSON:"+err})
                res.render('register', {
                    errors : errors,
                    email : email,
                    password : password,
                    password2 : password2});
            } else { //Able to get the item
                response = "GetItem succeeded: " + JSON.stringify(data, null, 2);
                if (response === "GetItem succeeded: {}"){
                    bcrypt.genSalt(10,(err,salt)=> 
                    bcrypt.hash(newUser.password,salt,
                        (err,hash)=> {
                            if(err) throw err;
                            newUser.password = hash; //save pass to hash
                            //Write to dynamodb
                            var input = {
                                "email": newUser.email, 
                                "password": newUser.password, 
                                "created_on": new Date().toString(),
                            };
                            var paramsWrite = {
                                TableName: "users",
                                Item:  input
                            };

                            docClient.put(paramsWrite, function(err, data) {
                                if (err) { //DB Problem
                                    console.log(err);
                                    errors.push({msg: "Unable to save to db, JSON:" + err})
                                    res.render('register', {
                                        errors : errors,
                                        email : email,
                                        password : password,
                                        password2 : password2
                                    });
                                } else { //Successful
                                    console.log(data);
                                    req.flash('success_msg','Successfully Registered!');
                                    res.redirect('/');
                                }
                            });
                        }
                    ));
                }
                else { //Existing item
                    console.log(data);
                    errors.push({msg: "Unable to add user, because the email address is already associated with an existing account."})
                    res.render('register', {
                        errors : errors,
                        email : email,
                        password : password,
                        password2 : password2
                    });
                };
            }
        });
    }
});

//logout
router.get('/logout',(req,res)=>{
req.logout();
req.flash('success_msg','Now logged out');
res.redirect('/users/login'); 
});


module.exports  = router;