- [x] need to make it so its visible when a strip is disconnected
    - [x] need to update all server code to accommodate the port in the data for the device and handshakes.
        - [x] need to troubleshoot why after the port is updated from the handshake it isnt flowing through to the ping requests
    - [x] need to update the strip logic to include its port in the handshake
- [x] need to integrate environment variables in all places
- [x] fix the "back" button on LED control
- [x] need to fix the "click lag" on the ledcards for the on/off
    - [x] I've figured it out, I need to make it so that the "change led" route updates the DB as well. 
    - [x] make the button a multi-state to make it more clear
        - [x] figure out the indication issue then this should be good. 
            - [x] the solution might actually be to integrate the hooks for reading and writing to the state
        - [x] now I need to make it so that the text is always legible
- [x] update docker files to use environment variables and have dev and prod builds and such
- [x] deploy and start replicating strips. 


# Congrats on getting to 1.0.0!!!!

## Current status

### Frontend

> Currently the app has three views: 

* Main view that shows all conected devices. 
    * Click on the device cards to go to their view, or toggle them with the multi state button 
    * Toggle all button in the top right
    * updates via polling
* device drilldown that allows you to change the color, brightness and toggle on/off
    * updates via events
* log view that is arguably a whole different project
    * shows a table with timestamp, logger, level and message
    * allows users to toggle visibility and level of loggers, which is saved on the logging service
    * allows users to click a log to view any metadata that was attached to it

### Backend

> The backend is a simple express rest API server that connects to a mysql database

* routes
    * /
        * GET: returns all devices
        * POST: adds a device via a handshake protocol
    * /:id
        * GET: returns device data by id
        * POST: sends a command to a device by id
        * DELETE: deletes a device by id
    * /all
        * POST: sends a command to all devices
    * /harryPotter
        * /lumos
            * POST: turns on all devices
        * /nox
            * POST: turns off all devices
        * /migraneous
            * POST: changes all devices to red at low brightness
* database
    * devices
        * id
        * mac
        * name
        * type
        * current_ip
        * current_port
        * on
        * brightness
        * red
        * green
        * blue
        * connected
        * removed
    * handshakes
        * id
        * timestamp
        * mac
        * ip
        * port

### logging-service

> the logging service is written in golang, is a simple rest API and connects to a sqlite database. it is its own git module

* routes
    * /logs
        * GET: returns logs (minus metadata) based on query params
        * POST: adds a log
    * /logs/:id
        * GET: returns a log and its metadata by id
    * /config
        * GET: returns all the loggers
        * POST: creates a logger
        * PUT: updates the level of a logger
* database
    * logger
        * id
        * name
        * level
    * logs
        * id
        * timestamp
        * logger
        * level
        * message
    * metadata
        * id
        * log_id
        * data

### led-server

> the led server is writtin in micropython for the raspberry pi pico. It conects to the backend on startup via a handshake protocol that sends the mac, ip and port of the device. It then serves a rest API that allows the backend to send commands to the device.
> It also features a lightweight (beginnings of a) REST framework that handles raw socket requests and sends responses. It's pretty slow. 

* config
    * DEVICE_NAME
    * LED_PIN
    * LED_COUNT
    * SSID
    * PASSWORD
    * SERVER_ADDRESS
    * SERVER_PORT
    * HANDSHAKE_ENDPOINT
* routes
    * /
        * GET: returns the device data
        * POST: sends a command to the device

### CAD

> I have designed a 3d printed pico case that works with how I soldered it all together. It takes 14mm M3 screws and has interference holes to suck in nuts. It has a hole for a USB-C port and a 3-pin connector. 

## Next Steps

### Frontend

I have a <couple> main goals for this project.
1) Add a voice control route that would allow users to use siri to send a voice command to a server.
    [ ] add route to the backend
    [ ] create a new microservice in python to interact with the backend
2)  Redo database to handle much of the logic and allow for different "groups" or rooms
    [ ] must not require a change to the led strip firmwares
    [ ] update frontend, can probably leverage the current "devices" view
    [ ] update backend and database. Arguably, I should move to golang at this point
        [ ] cleaner iteration on route structure
        [ ] redo python scripts to interact with the new backend
3) redo pico in a faster language, it is pretty slow currently
    [ ] do the faster language
        [ ] give go a final chance to work
        [ ] c is backup plan, but unnecesaary if go works
    [ ] allow to do some slightly more fun stuff
        [ ] start with two colors
        [ ] "animated" mode that allows it to kinda scroll through colors
            [ ] set speed
            [ ] it sets to groups of two and three lights to make the animation more visible

## way future, product level

* order individual electronics components, design circuit board, and see how cheaply I can make the product
* design an automated light curtain
* make IOS app/android app
* make a very clean led strip configurator desktop app that also helps setup the host server
* make it so that the led strip can be connected to directly (wired) via a mobile app
* investigate bluetooth control
