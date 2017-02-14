var Location = require("../models/location");
var Comment = require("../models/comment");

// all middleware
var middlewareObj = {};

middlewareObj.checkLocationOwnership = function(req, res, next){
    // is user logged in?
    if(req.isAuthenticated()){
        Location.findById(req.params.id, function(err, foundLocation){
            if (err){
                req.flash("error", "Location not found");
                res.redirect("back");
            } else{
                // does user own location?
                if(foundLocation.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "Permission Denied");
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "Must login to do that");
        res.redirect("back");
    }    
}    

middlewareObj.checkCommentOwnership = function(req, res, next){
    // is user logged in?
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if (err){
                req.flash("error", "Location not found");
                res.redirect("back");
            } else{
                // does user own comment?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "Permission Denied");
                    res.redirect("back");
                }
            }
        });
    } else{
        req.flash("error", "Must login to do that");
        res.redirect("back");
    }        
}

middlewareObj.isLoggedIn = function(req, res, next){
    // check if logged in
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Must login to do that");
    res.redirect("/login");
}

module.exports = middlewareObj;