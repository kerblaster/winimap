//imports
var express = require("express");
var geolib = require("geolib");
var sanitizer = require("express-sanitizer");
var googleMaps = require("@google/maps").createClient({
    key: "AIzaSyBhIPCZxFHwypX-_WeRzyoAOXi_ycyQR-0"
});
var router = express.Router();
var middleware = require("../middleware");

//models
var Location = require("../models/location");
var User = require("../models/user");

//INDEX Route - List all locations
router.get("/", function(req, res){
    // Get all locations from DB
    Location.find({}, function(err, allLocations){
       if (err){
           console.log(err);
       } else {
            var filterLocations = [];
            var farLocations = [];
            var distances = [];
            var farDistances = [];
            allLocations.forEach(function(loc){
                //filter game (logged in) OR only see tournys (signed out)
                if (!req.user && loc.status === "hostTourny"){ 
                    filterLocations.push(loc);
                } else if (req.user && req.user.game === loc.game){ //logged in
                    var origin = {latitude: req.user.coord.lat, longitude: req.user.coord.lng};
                    var dest = {latitude: loc.coord.lat, longitude: loc.coord.lng};
                    var distance = geolib.getDistance(origin, dest, 10, 1);
                    if (distance <= 160934 || req.user.tag === loc.author.tag){ //160934 meters = 100 miles
                        filterLocations.push(loc);
                        if (distance < 1609){ // 1 mile
                            distances.push("<1"); //force 
                        } else{
                            distances.push(Number(distance/1609.34).toFixed(2)); // 2 decimal places
                        } 
                    } else if (loc.status === "hostTourny"){ //more than 100 miles away, only show tournys
                        farLocations.push(loc);
                        farDistances.push(Number(distance/1609.34).toFixed(2));
                    }                            
                }                        
            });
            if (req.user){ //logged in
                res.render("locations/index", {locations: filterLocations, distances: distances, farLocations: farLocations, farDistances: farDistances});
            } else{
                res.render("locations/index", {locations:filterLocations});
            }
       }
    });
});

//NEW route - Show new locations (form, before CREATE) 
router.get("/new", middleware.isLoggedIn, function(req, res){
    Location.findById(req.user.post, function(notFound, foundLocation){ // 1 post not expired or deleted
        if (notFound || !req.user.post || foundLocation == null){ //error because not found
            res.render("locations/new");
        } else{
            req.flash("error", "Max 1 pinpoint per user; this will replace your previous location made on " + foundLocation.created.toLocaleString('en-US', {timeZoneName: "short"}) + ". Comments will remain unless pinpoint is fully deleted.");
            res.redirect(req.user.post + "/edit"); //BROKEN HERE@@@@@@@@@@@ not save details
        }
    });
});

//CREATE Route - Create new locations, then redirect
router.post("/", middleware.isLoggedIn, function(req, res){
    if (req.body.termsOfService == "true"){ //trick the bots prevent google API use
       req.flash("error", "Error processing your request");
       res.redirect("/locations");        
        return;
    }
    if (!req.body.status || !req.body.information || req.body.information.length >= 2048){ //check input from hacks
        req.flash("error", "Your input = Bad!");
        res.redirect("/locations/" + req.params.id);        
        return;        
    }
   var author = {
       id: req.user._id,
       tag: req.user.tag
   }
   var country = req.user.country;
   var state = req.user.state;
   var city = req.user.city;
   var municipality = req.user.municipality;
   var address = "";
   var latGeocoder = "";
   var lngGeocoder = "";
   var information = req.sanitize(req.body.information);
   var tournyTitle = "";
   var start = "";
   var prestige = "";
   var game = req.user.game;
   var status = req.body.status; 
   
   if (status === "hostTourny"){
        if (!req.body.tournyTitle || !req.body.country || !req.body.state || !req.body.city || !req.body.address || !req.body.start ||
            req.body.tournyTitle.length >= 32 || req.body.city.length >= 16 || req.body.address.length >= 32 || req.body.start.length != 10){ //check input from hacks
            req.flash("error", "Your input = Bad!");
            res.redirect("/locations/" + req.params.id);        
            return;        
        }
       tournyTitle = req.body.tournyTitle;
       country = req.body.country; //overwrite
       state = req.body.state; //overwrite
       city = req.body.city; //overwrite
       address = req.body.address;
       start = req.body.start;
       prestige = req.body.prestige;
    }    
    var addressToGeocode = city + ", " + state + ", " + country;
    if (req.body.status === "hostTourny"){
        addressToGeocode = address + ", " + addressToGeocode;
    }else if (municipality){ 
        addressToGeocode = municipality + ", " + addressToGeocode;
    }
    googleMaps.geocode({address: addressToGeocode}, function(geo_err, geo_data){
        if (geo_err){
           req.flash("error", "Could not find locality: " + addressToGeocode);
           res.redirect("/locations");
        } else{
            var coord = {};
            coord["lat"] = geo_data.json.results[0].geometry.location.lat;
            coord["lng"] = geo_data.json.results[0].geometry.location.lng;
            
            var locObj = new Location({
                author: author, 
                status: status, 
                country: country, 
                state: state, 
                city: city, 
                address: address, 
                coord: coord,
                information: information, 
                tournyTitle: tournyTitle, 
                start: start, 
                prestige: prestige, 
                game: game,
            });
            Location.create(locObj, function(err, newLocation){
                if(err){
                    req.flash("error", "Failed to Post");
                    console.log(err);
                } else{
                    // update user
                    req.user.post = newLocation._id;
                    User.findByIdAndUpdate(req.user._id, req.user, function(err, updatedUser){
                        console.log("New location by " + newLocation.author.tag + ": " + newLocation.status + " at " + newLocation.city + ", " + newLocation.state);//DO NOT DELETE
                        //redirect back to location
                        req.flash("success", "Post Successfull!");
                        res.redirect("/locations");
                    });
                }                
            });
        }
    });
});

//SHOW route - show info about 1 location (must be after NEW) 
router.get("/:id", function(req, res){
    //find location with provided ID req.params.id
    Location.findById(req.params.id).populate("comments").exec(function(err, foundLocation){
       if(err){
            console.log(err);
            req.flash("error", "Cannot find location");
            res.render("locations");
       } else{
           //render show template with that location
           if (!req.user){
               res.render("locations/show", {location: foundLocation});
           } else{ //logged in
                var origin = {latitude: req.user.coord.lat, longitude: req.user.coord.lng};
                var dest = {latitude: foundLocation.coord.lat, longitude: foundLocation.coord.lng};
                var distance = geolib.getDistance(origin, dest, 10, 1);
                if (distance < 1609){ // 1 mile
                    distance = "<1"; //force 
                } else{
                    distance = Number(distance/1609.34).toFixed(2); // 2 decimal places    
                }
                res.render("locations/show", {location: foundLocation, distance: distance});
           }
       }
    });
});

// EDIT route (form, before UPDATE)
router.get("/:id/edit", middleware.checkLocationOwnership, function(req, res){
    Location.findById(req.params.id, function(err, foundLocation){ //note: already error checked in checkLocationOwnership()
        res.render("locations/edit", {location: foundLocation});
    });
});

// UPDATE route
router.put("/:id", middleware.checkLocationOwnership, function(req, res){
    if (req.body.termsOfService == "true"){ //trick the bots
       req.flash("error", "Error processing your request");
       res.redirect("/locations");        
        return;
    }    
    if (!req.body.location.status || !req.body.location.information || req.body.location.information.length >= 2048){ //check input from hacks
        req.flash("error", "Your input = Bad!");
        res.redirect("/locations/" + req.params.id);        
        return;        
    }
   //find and update correct location
   req.body.location.information = req.sanitize(req.body.location.information);
    req.body.location.game = req.user.game;
    req.body.location.created = Date.now();
    var addressToGeocode; 
    if (req.body.location.status === "hostTourny"){
        if (!req.body.location.tournyTitle || !req.body.location.country || !req.body.location.state || !req.body.location.city || !req.body.location.address || !req.body.location.start ||
            req.body.location.tournyTitle.length >= 32 || req.body.location.city.length >= 16 || req.body.location.address.length >= 32 || req.body.location.start.length != 10){ //check input from hacks
            req.flash("error", "Your input = Bad!");
            res.redirect("/locations/" + req.params.id);        
            return;        
        }
        addressToGeocode = req.body.location.address + ", " + req.body.location.city + ", " + req.body.location.state + ", " + req.body.location.country;
    }else{ //friendlies
        req.body.location.country =  req.user.country;
        req.body.location.state = req.user.state;
        req.body.location.city = req.user.city
        addressToGeocode = req.user.city + ", " + req.user.state + ", " + req.user.country;
        if (req.user.municipality){
            addressToGeocode = req.body.user.municipality + ", " + addressToGeocode;
        }    
    }
    googleMaps.geocode({address: addressToGeocode}, function(geo_err, geo_data){
        if (geo_err){
           req.flash("error", "Could not find locality: " + addressToGeocode);
           res.redirect("/locations");
        } else{
            var coord = {};
            coord["lat"] = geo_data.json.results[0].geometry.location.lat;
            coord["lng"] = geo_data.json.results[0].geometry.location.lng;
            req.body.location.coord = coord;
            Location.findByIdAndUpdate(req.params.id, req.body.location, function(err, updatedLocation){ //UPDATE INFORMATION
                if(err){
                    req.flash("error", "Failed to Update");
                    console.log(err);
                    res.redirect("/locations");
                } else{
                    //redirect to SHOW page
                    console.log("Edited location by " + updatedLocation.author.tag + ": " + updatedLocation.status + " at " + updatedLocation.city + ", " + updatedLocation.state);//DO NOT DELETE
                    req.flash("success", "Update Successfull!");
                    res.redirect("/locations/" + req.params.id);
                }
           });
        } 
    });
});

// REPORT route 
router.get("/:id/report", function(req, res){
    Location.findById(req.params.id, function(err, foundLocation){ //note: already error checked in checkLocationOwnership()
        if (err){
            req.flash("error", "Report error 1; admin has been notified");
            res.redirect("/locations/");             
        } else{
            foundLocation.numReports += 1;
            Location.findByIdAndUpdate(req.params.id, foundLocation, function(err, editedLocation){
                if (err){
                    req.flash("error", "Report error 2; admin has been notified");
                    res.redirect("/locations/");                      
                } else{
                    req.user.lastReportedAt = Date.now();
                    User.findByIdAndUpdate(req.user._id, req.user, function(err, updatedUser){
                        if (err){
                            req.flash("error", "Report error 3; admin has been notified");
                            res.redirect("/locations/");                      
                        } else{
                            //surpass report limit or not
                            if (((foundLocation.status === "seeking" || foundLocation.status === "hostFriendlies") && foundLocation.numReports >= 5) || (foundLocation.status === "hostTourny" && foundLocation.numReports >= 10)){
                                Location.findByIdAndRemove(req.params.id, function(err){
                                   if(err){
                                        req.flash("error", "Report error 4; admin has been notified");
                                        res.redirect("/locations/"); 
                                   } else{
                                       //***Future: tell author of location his location is deleted via email
                                       console.log(req.user.username + "(" + req.user._id + ")" + " has reported " + req.params.id + "(#reports: " + (editedLocation.numReports+1) + " => AUTO-DELETED!)"); // DO NOT DELETE
                                        req.flash("success", "Report Successfull!");
                                        res.redirect("/locations/");  
                                   }
                                });            
                            } else{
                                //***Future: tell author of location his location is deleted via email
                                console.log(req.user.username + "(" + req.user._id + ")" + " has reported " + req.params.id + "(#reports: " + (editedLocation.numReports+1) + ")"); // DO NOT DELETE
                                req.flash("success", "Report Successfull!");
                                res.redirect("/locations/");              
                            }                           
                        }
                    });                       
                }
            });
        }
    });
});

// DESTROY route
router.delete("/:id", middleware.checkLocationOwnership, function(req, res){
    Location.findByIdAndRemove(req.params.id, function(err){
       if(err){
           req.flash("error", "Failed to Delete");
           res.redirect("/locations");
       } else{
           req.flash("success", "Deletion Successfull!");
           res.redirect("/locations");
       }
    });
});

// MIDDLEWARE

function getNumDaysBetween(date){
    var nowDate = Date.now();
    var endDate = new Date(date.substring(0,4), date.substring(5,7), date.substring(9,10));
    return Date.daysBetween(nowDate, endDate);
}

module.exports = router;