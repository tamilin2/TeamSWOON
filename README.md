Run "npm install" on CMD to install dependencies; verify dependencies on package.json

To run website, use node in CMD:
    - "node server.js"; "nodemon server.js"
        - "node" will run the script
        - "nodemon" will run the script and auto-restart to show changes
    - Console should log "App started"
    - To view website, enter "localhost:<port_number>"
        - port_number is default to '8080' but can be changed under server.js

Current functions:
    - Enter home page
    - Create/Edit/View user profile with list of created club by user
    - Create/Edit/View/Delete club profile with a specified interest
    - Search for club by name or interest
    - Email club leaders
    - Obtain Forgotten password
    - View all clubs
    

Structure:
    - routes:
        Holds all .js files to connect pages
    - public:
        Holds all .css and .js files to style pages/add jquery
    - views:
        Holds all .ejs files that format html pages
    - model:
        Hold the .js referencing the MySQL database
