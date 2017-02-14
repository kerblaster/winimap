var mongoose = require("mongoose");

var winimapSchema = new mongoose.Schema({
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      tag: String
   },
   status: String,
   country: String,
   state: String,
   city: String,
   address: String,
   
   coord: {
      lat: Number,
      lng: Number
   },
   
   information: String,
   tournyTitle: String,
   start: String,
   prestige: String,
   game: String,
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   created: {type: Date, default: Date.now, expireAfterSeconds: 60*60*24*7}, 
   numReports: {type: Number, default: 0}
});

module.exports = mongoose.model("Location", winimapSchema); 

//Expires in 8 hours