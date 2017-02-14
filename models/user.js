var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
   username: String,
   password: String,
   tag: String,
   isConfirmed: {type: Boolean, default: false},
   
   country: String,
   state: String,
   city: String,
   municipality: String,
   
   coord: {
      lat: Number,
      lng: Number
   },
   
   game: String,
   created: {type: Date, default: Date.now},
   lastReportedAt: {type: Date, default: Date.now},
   
   post: mongoose.Schema.Types.ObjectId
   
   
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);