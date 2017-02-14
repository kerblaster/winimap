var mongoose = require("mongoose");
var Location = require("./models/location");
var Comment = require("./models/comment");

var data = [
    {
        name: "Renard Tumbokon",
        status: "hostFriendlies",
        country: "United States",
        state: "New Jersey",
        city: "Cranford",
        address: "",
        zipcode: "07016",
        friendliesInfo: "Friendlies over here",
        tournyTitle: "",
        tournyInfo: "",
        start: "",
        prestige: "",
        game: "SSBM",
        image: "/images/status/hostFriendlies.png"   
    },
    {
        name: "mew2king",
        status: "hostFriendlies",
        country: "United States",
        state: "New Jersey",
        city: "cinnaminson",
        address: "",
        zipcode: "08077",
        friendliesInfo: "Let me chaingrab you in FD",
        tournyTitle: "",
        tournyInfo: "",
        start: "",
        prestige: "",
        game: "SSBM",
        image: "/images/status/hostFriendlies.png"   
    },
    {
        name: "GIMR",
        status: "hostTourny",
        country: "United States",
        state: "Maryland",
        city: "Halethorpe",
        address: "3921 Vero Road",
        zipcode: "32337",
        friendliesInfo: "",
        tournyTitle: "Smash@Xanadu",
        tournyInfo: "$5 Singles\r\n$5 Entry\r\nCome early\r\n\r\nThanks!",
        start: "2017-05-03",
        prestige: "Local Tournament",
        game: "SSBM",
        image: "/images/status/local.png"   
    },
    {
        name: "CrimsonBlur",
        status: "hostTourny",
        country: "United States",
        state: "California",
        city: "San Fransisco",
        address: "1675 Owens St",
        zipcode: "94158",
        friendliesInfo: "",
        tournyTitle: "SSS: Blood for Blood",
        tournyInfo: "On October 15th, in a special edition of SSS, the series visits NorCal, to avenge SoCal's terrible losses to NorCal's elite. SoCal is in shambles, and the only cure is revenge. Blood for Blood.",
        start: "2017-08-15",
        prestige: "Regional Tournament",
        game: "SSBM",
        image: "/images/status/regional.png"    
    },
    {
        name: "Dr.Z",
        status: "hostTourny",
        country: "United States",
        state: "California",
        city: "Oakland",
        address: "12500 Campus Dr",
        zipcode: "94619",
        friendliesInfo: "",
        tournyTitle: "I'm Not Yelling",
        tournyInfo: "The third installment of the legendary Norcal Melee regional tournaments features the same spacious venue and professional Norcal TO staff, along with Armada returning to Norcal for the first time since Genesis 2! We will also be presenting the finals of MattDotZeb's fantastic series, The Melee Games!",
        start: "2017-04-11",
        prestige: "Major",
        game: "SSBM",
        image: "/images/status/major.png"    
    },
    {
        name: "Juggleguy",
        status: "hostTourny",
        country: "United States",
        state: "Michigan",
        city: "Dearborn",
        address: "600 Town Center Drive",
        zipcode: "48126",
        friendliesInfo: "",
        tournyTitle: "The Big House 6",
        tournyInfo: "The Big House is the largest Super Smash Brothers tournament series in the Midwest. Since 2011, it has been the go-to annual event for Smashers and spectators not only in the Midwest, but across the world. Over three days, The Big House runs a singles (1v1) event, doubles (2v2) event, and various exhibitions for both Super Smash Bros. Melee and Super Smash Bros. for Wii U.\r\nWhy should you attend? Amazing venue – hotel space for 3000+ attendees, 300+ setups, main stage, and projector screens; Travel convenience – inexpensive transportation between the venue and DTW airport, and free parking on-site; Great TO staff – an established reputation for delivering high-quality tournament organization; Player experience – opportunity to officially compete in multiple games and events; Spectator experience – friendlies, exhibitions, and main stage viewing for spectators all weekend; Big spotlight – professionally broadcast on Smash’s premiere livestream platforms; Storied history – past attendance that includes Mango, Armada, PPMD, Mew2King, Hungrybox, Leffen, ZeRo, Nairo, Anti, dabuz, and more; Michigan community – one of the biggest and most active Super Smash Bros. scenes in the world",
        start: "2017-11-07",
        prestige: "Super Major",
        game: "SSBM",
        image: "/images/status/supermajor.png"    
    }
    
];

function seedDB(){
    //remove all locations
    Location.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed ALL loctions!");
        
        //remove all comments
        Comment.remove({}, function(err) {
            if(err){
                console.log(err);
            }
            console.log("removed ALL comments!");
/*
            //add few locations
            data.forEach(function(seed){
                Location.create(seed, function(err, location){
                    if(err){
                        console.log(err);
                    } else{
                        console.log("added a location");
                        
                        //create a (same) comment for that location
                        Comment.create(
                            {
                                text: "cool place, very friendly people",
                                author: "kerblaster"
                            }, function(err, comment){
                                if(err){
                                    console.log(err);
                                } else{
                                    location.comments.push(comment);
                                    location.save();
                                    console.log("Created new comment");
                                }
                            });
                    }
                });
            });        
*/
        });

    });  
}

module.exports = seedDB;