/*
 * For location/new.ejs, location/edit.ejs
 * Note: only common js (non jquery) scripts, above files has unique jquery scripts
 */

function setMinMaxDate(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //note: Jan = 0
    var yyyy = today.getFullYear();
     if(dd<10){
            dd='0'+dd
        } 
        if(mm<10){
            mm='0'+mm
        } 
    
    today = yyyy+'-'+mm+'-'+dd;
    document.getElementById("start").setAttribute("min", today);
    
    var nextYear = (yyyy+1)+'-'+mm+'-'+dd; //1 year max
    document.getElementById("start").setAttribute("max", nextYear);
}