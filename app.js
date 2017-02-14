/*
mongod --smallfiles
node app.js

name        url                         verb    desc
============================================================================
INDEX       /locations                  GET     Display list of all locations
NEW         /locations/new              GET     Displays form to make a new location
CREATE      /locations                  POST    Add new location to database
SHOW        /locations/:id              GET     Show info about 1 location

NEW         locations/:id/comments/new  GET
CREATE      locations/:id/comments      POST
*/

//imports
var     express             = require("express"),
        app                 = express(),
        bodyParser          = require("body-parser"),
        mongoose            = require("mongoose"),
        flash               = require("connect-flash"),
        passport            = require("passport"),
        LocalStrategy       = require("passport-local"),
        methodOverride      = require("method-override"),
        sanitizer           = require("express-sanitizer"),
        
//models        
        Location            = require("./models/location"),
        Comment             = require("./models/comment"),
        User                = require("./models/user"),
        seedDB              = require("./seeds")        //seed
        
//routes        
var     commentRoutes       = require("./routes/comments"),
        locationRoutes      = require("./routes/locations"),
        indexRoutes         = require("./routes/index"),
        authRoutes          = require("./routes/auth")
        
//run every time server starts
mongoose.Promise = global.Promise; //prevents deprication warning from mongodb
mongoose.connect("mongodb://localhost/winimap");
app.use(bodyParser.urlencoded({extended: true}));
app.use(sanitizer());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash()); //install flash
//seedDB(); // seed database

// PASSPORT CONFIG
app.use(require("express-session")({
    secret: "I also play Overwatch!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware: send info to all routes 
app.use(function(req, res, next){ 
   res.locals.currentUser = req.user; //current logged in user
   res.locals.error = req.flash("error"); //flash error
   res.locals.success = req.flash("success"); //flash success
   next();
});

//Use routes that are refactored to own files
app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/locations", locationRoutes);
app.use("/locations/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server has started!")
});