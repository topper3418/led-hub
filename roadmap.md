# initial usefulness
    1) get the pico talking to the computer
    2) get the led's to light up from a function on the computer
    3) get the pico to change color, turn on and off from web requests
    4) build a flask webserver that can take requests to change the color of the pico over the web, as well as get status
    5) build a simple UI that the users can use to change and monitor the color

# LED buildout
    1) get the hub able to connect to multiple strips
    2) get the strips able to take sequences and store them as light settings
    3) make the client able to see multiple lights and their status at a time

## robust-pico-connection
    * connecting to multiple strips will be handled this way: 
    ** on startup, the strip will ping the server with its mac address
    ** server will find the strip by mac address and record its IP address
    ** on first connect the server will give a name automatically, user can config
    1) build a database
        * be sure to store the ddl's and such in the file struct
        * one table, MAC, last IP, name
    2) build some functions for the database
        * no ORM here, lets make it raw SQL
    3) integrate into the routes
    4) add to the startup script on the pico
        * request should be a "post" request including the pico's mac address. that should be the 
        param, not the name. Mac address to serve as the PK
    5) build a simple UI that allows the user to see all the configured LED strips and then select one. 
    

