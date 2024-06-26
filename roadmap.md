# initial usefulness
    1) get the pico talking to the computer
    2) get the led's to light up from a function on the computer
    3) get the pico to change color, turn on and off from web requests
    4) build a flask webserver that can take requests to change the color of the pico over the web, as well as get status
    5) build a simple UI that the users can use to change and monitor the color

# LED buildout
    * connecting to multiple strips will be handled this way: 
    ** on startup, the strip will ping the server with its mac address
    ** server will find the strip by mac address and record its IP address
    ** on first connect the server will give a name automatically, user can config
    1) build a database DONE
        * be sure to store the ddl's and such in the file struct
        * one table, MAC, last IP, name
    2) build some functions for the database DONE
        * no ORM here, lets make it raw SQL
    3) integrate into the routes DONE
    4) add to the startup script on the pico DONE
        * request should be a "post" request including the pico's mac address. that should be the 
        param, not the name. Mac address to serve as the PK
    5) build a simple UI that allows the user to see all the configured LED strips and then select one. TODO
        * configure name on the pico DONE
        * make a tile for each LED. then you can click into it and control it like before
        * to facilitate this, I need to implement the react-router to locate the controller. 
        * fix white control while you're at it. 
        * need to integrate a periodic ping from the hub to speed up load time and make the server aware of devices and their status. 
    6) add logging throughout, properly.  DONE
        * get splunk instance up and working, and start logging to it
        * FAILED THE ABOVE, just make the logger spit out to the database. DONE
        * build a logger API like with my own logger, could probably copy and paste it and adapt queries. DONE
    7) finally get environment variables right TODO
        * this will allow you to point things at the right databases and such safely when switching from dev to prod
        * also allows configuring stuff in docker easier. 

# More elegant control
    * allow LED's to be grouped up and controlled as one
    * allow simple configuration values to be configured remotely (name, etc)
    * allow dynamic patterns (animations?)
    * allow users to create timers

# LLM integration
    * investigate function-calling using ollama. this will allow for organic voice activation

# Lineup expansion
    * make all code generic enough to work with multiple device types, adjust the DB accordingly. 
    * other IOT stuff: pool, septic, blinds, whatever.
    

