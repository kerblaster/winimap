To Do:
======
- captia in new.ejs????
- forgot password
- forgot user
- experience blog
- contact me page



=========================
Notes/Design changes
=========================
Not show friendlies in main map because will have many overlapping pins due to same major city
    I only asked for city, not full address (different from tourny)




=========================
Bugs and Fixes Log
=========================
./mongo not working
    do ./mongo --smallfiles
    or do ./mongo --nojournal
    https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/1886098
    
SHOW route: mongoose error: Cast to ObjectId failed for value "<mongo-id>" at path "_id" for model "<schema-model>"
    make sure mongo is version 4.3.3
    delete node_modules/mongoose folder
    in package.json, make sure mongoose is: "mongoose": "4.3.3"
    https://www.udemy.com/the-web-developer-bootcamp/learn/v4/questions/1904384
    