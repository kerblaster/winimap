//imports
var express = require("express");
var router = express.Router();
var passport = require("passport");
var googleMaps = require("@google/maps").createClient({
    key: "AIzaSyBhIPCZxFHwypX-_WeRzyoAOXi_ycyQR-0"
});

//models
var User = require("../models/user");
var Location = require("../models/location");
var Comment = require("../models/comment");

/****************
 * Auth Routes
 *****************/
//show register form
router.get("/register", function(req, res){
    if (req.user){
       req.flash("error", "You already have a user");
       res.redirect("/user");     //NOTE: FIX WHEN EDIT USER IS FIXED   
    } else{
        res.render("register");
    }
});

//handle sign up logic
router.post("/register", function(req, res){
    if (req.body.termsOfService == "true"){ //trick the bots
        req.flash("error", "Error processing your request");
        res.redirect("/locations");        
        return;
    }    
    if (!req.body.email || !req.body.password || !req.body.tag || !req.body.country || !req.body.state || !req.body.state || !req.body.city || !req.body.game || req.body.email.length >= 32 || req.body.tag.length >= 16 || req.body.city.length >= 16 || (req.body.municipality && req.body.municipality >= 16)){ //check input from hacks
        req.flash("error", "Your input = Bad!");
        res.redirect("/locations");        
        return;        
    }
    var address = req.body.municipality + " " + req.body.city + ", " + req.body.state + ", " + req.body.country;
    googleMaps.geocode({address: address}, function (geo_err, geo_data){
       if (geo_err){
            req.flash("error", "Could not find locality: " + address);
            res.redirect("/register");
       } else if(!isValidStr(req.body.tag)){
            req.flash("error", "Invalid characters for Alias; 'A-Z', 'a-z', '0-9', '_' are allowed");
            res.redirect("/register");            
       } else{       
            var newUser = new User({
                username: req.body.email, 
                tag: req.body.tag, 
                country: req.body.country, 
                state: req.body.state, 
                city: req.body.city, 
                municipality: req.body.municipality, 
                game: req.body.game,
                coord: {
                    lat: geo_data.json.results[0].geometry.location.lat, 
                    lng: geo_data.json.results[0].geometry.location.lng
                }
            });
            User.register(newUser, req.body.password, function(reg_err, user){
               if(reg_err){
                   req.flash("error", reg_err.message); //username/email taken, empty field, etc..
                   return res.redirect("/register");
               } else{
                      console.log("New user: " + user.tag + " (" + user.username + ")" + " from " + user.city + ", " + user.state + " [" + user.game + "]"); //DO NOT DELETE
                      req.flash("success", "Welcome, " + user.tag + "! You have successfully registered. Please login to continue...");
                      return res.redirect("/login");
                      /*
                   passport.authenticate("local")(req, res, function(){
                       console.log("iunno why this doesnt print");
                       req.flash("success", "Welcome, " + user.tag + "! You have successfully registered.");
                      return res.redirect("/locations");
                   });  
                   */
               }

           });     
       }
    });
});

// Edit user route
router.get("/user", function(req, res){ //go to user = editing info
    if (req.user){
       User.findById(req.user.id, function(err, foundUser){ //note: prev if-statement is error check
          res.render("user/edit", {user: foundUser}); //success
       });        
    } else{
        req.flash("errror", "Please login");
        return res.redirect("/login");
    }
});

// Update user route
router.put("/user/edit", function(req, res){
   //find and update correct location
    if (!req.body.user.tag || !req.body.user.country || !req.body.user.state || !req.body.user.state || !req.body.user.city || !req.body.user.game || req.body.user.tag.length >= 16 || req.body.user.city.length >= 16 || (req.body.user.municipality && req.body.user.municipality >= 16)){ //check input from hacks
        req.flash("error", "Your input = Bad!");
        res.redirect("/locations");        
        return;        
    }   
    var addressToGeocode = req.body.user.city + ", " + req.body.user.state + ", " + req.body.user.country;
    if (req.body.user.municipality){
        addressToGeocode = req.body.user.municipality + ", " + addressToGeocode;
    }
    googleMaps.geocode({address: addressToGeocode}, function(geo_err, geo_data){
        if (geo_err){
           req.flash("error", "Could not find locality: " + addressToGeocode);
           res.redirect("/user");
        } else{
            var coord = {};
            coord["lat"] = geo_data.json.results[0].geometry.location.lat;
            coord["lng"] = geo_data.json.results[0].geometry.location.lng;
            req.body.user.coord = coord;
            User.findByIdAndUpdate(req.user.id, req.body.user, function(err, updatedUser){
                if(err){
                    req.flash("error", "Failed to update user");
                    console.log(err);
                    res.redirect("/user");
                } else{
                    //redirect back with updated info
                    req.flash("success", "Update to user successfull!");
                    res.redirect("/user");
                }
           });
        }
    });    
});

// Delete user route
router.delete("/user/edit", function(req, res){
    User.findByIdAndRemove(req.user.id, function(err){
        if(err){
            req.flash("error", "Failed to delete");
            res.redirect("/user");
        } else{
            Location.remove({"author.id": req.user._id}, function(err, result) { //remove posts created by user
                if (err) {
                    req.flash("error", "Failed to delete user posts");
                } 
                Comment.remove({"author.id": req.user._id}, function(err, result){ //remove comments created by user
                    if (err) {
                        req.flash("error", "Failed to delete user comments");
                    } 
                    req.flash("success", "User deletion successfull!");
                    req.logout();
                    res.redirect("/locations");    
                });
            });
        } 
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/locations",
        failureRedirect: "/login",
        failureFlash: true
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logout successful!");
   res.redirect("/locations");
});

//middleware 
//A-Z, a-z, 0-9, _
function isValidStr(str) { return /^\w+$/.test(str); }

module.exports = router;

