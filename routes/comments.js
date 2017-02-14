//imports
var express = require("express");
var router = express.Router({mergeParams: true});
var middleware = require("../middleware");

//models
var Location = require("../models/location");
var Comment = require("../models/comment");

//comments NEW route
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find location by id
    Location.findById(req.params.id, function(err, foundLocation){
        if(err){
            console.log(err);
        } else{
            res.render("comments/new", {location: foundLocation});           
        }
    });
});

//comments CREATE route
router.post("/", middleware.isLoggedIn, function(req, res){
    if (!req.body.comment || req.body.comment.length >= 1024){ //check input from hacks
        req.flash("error", "Your input = Bad!");
        res.redirect("/locations/" + req.params.id);        
        return;        
    }    
    //lookup location using ID
    Location.findById(req.params.id, function(err, foundLocation){
       if(err){
           console.log(err);
           res.redirect("/locations");
       } else{
           //create new comment
           Comment.create(req.body.comment, function(err, foundComment){
               if (err){
                   req.flash("error", "Something went wrong :(");
                   console.log(err);
               } else{
                   //add tag and id to comment
                   foundComment.author.id = req.user._id;
                   foundComment.author.tag = req.user.tag;
                   foundComment.save();
                   //connect new comment to location
                   foundLocation.comments.push(foundComment);
                   foundLocation.save();
                    //redirect to location show page
                    req.flash("success", "Comment added Successfully!");
                   res.redirect("/locations/" + foundLocation._id);
               }
           });
       }
    });
});

//comments EDIT route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
       if (err){
           res.redirect("back"); //error check redundant bc of middleware?
       } else{
           res.render("comments/edit", {location_id: req.params.id, comment: foundComment}); 
       }
    });
});

//comments UPDATE route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    if (!req.body.comment || req.body.comment.length >= 1024){ //check input from hacks
        req.flash("error", "Your input = Bad!");
        res.redirect("/locations/" + req.params.id);        
        return;        
    }
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if (err){
          req.flash("error", "Failed to Update");
          res.redirect("back");
      } else{
          req.flash("success", "Update Successfull!");
          res.redirect("/locations/" + req.params.id);
      }
   });
});

//comments DESTOROY route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
   Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if (err){
           req.flash("error", "Failed to Delete");
           res.redirect("back");
       } else{
           req.flash("error", "Deletion Successfull!");
           res.redirect("/locations/" + req.params.id);
       }
   });
});


module.exports = router;