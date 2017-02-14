//imports
var express = require("express");
var router = express.Router();
var geolib = require("geolib");
//models
var User = require("../models/user");
var Location = require("../models/location");

// Root route
router.get("/", function(req, res){ 
    User.find({}, function(user_err, allUsers){
        if (user_err){
            res.send("Server error");
        } else{
            var allCoords = new Array();
            //heatmap
            allUsers.forEach(function(user){
                if (!req.user || (req.user && req.user.game === user.game)){ //divide by game
                    var coord = new Array(user.coord.lat, user.coord.lng);
                    allCoords.push(coord); //push only coord (safety reasons)                    
                }
            });
            //pins
            Location.find({}, function(loc_error, allLoc){
                if (loc_error){
                    res.send("Server error");
                } else{ 
                    var allTournyLoc = new Array();
                    allLoc.forEach(function(loc){
                        if (!req.user || (req.user && req.user.game === loc.game)){ //divide by game
                            if (loc.status === "hostTourny" && loc.coord.lat != null && loc.coord.lng != null){
                                var gameTitle;
                                if (loc.game === "ssb64"){
                                    gameTitle = "Smash 64";
                                } else if (loc.game === "ssbm"){
                                   gameTitle = "Smash Melee" ;
                                } else if (loc.game === "ssbb"){
                                   gameTitle = "Smash Brawl";
                                } else if (loc.game === "ssbpm"){
                                   gameTitle = "Project M";
                                } else if (loc.game === "ssb4"){
                                   gameTitle = "Smash 4" 
                                }
                                var infoNeed = {
                                    lat: loc.coord.lat, 
                                    lng: loc.coord.lng,
                                    tournyTitle: loc.tournyTitle, 
                                    start: loc.start, 
                                    prestige: loc.prestige,
                                    game: gameTitle
                                };
                                allTournyLoc.push(infoNeed); //push whole tourny location object
                            }
                        }
    
                    }); 
                    res.render("landing", {allCoords: allCoords, allTournyLoc: allTournyLoc});    //render     
                }

            });
            
        }
    });
   
});

// About and contact me
router.get("/about", function(req, res){ 
     res.render("about");
});

module.exports = router;