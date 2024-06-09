const { json } = require('express');
const axios = require('axios');

const db = require('../db');

// factory for getting the strip. it won't always be mandatory
const getStrip = (mandatory=true) => {
    return async (req, res, next) => {
        const { mac } = req.params;
        console.log('received request for strip:', mac)
        let strip;
        try {
            strip = db.strips.find(mac);
            console.log('found strip:', strip)
        } catch (error) {
            console.log('error finding strip:', error)
        }
        // only send 404 if the strip is mandatory
        if (!strip && mandatory) {
            res.status(404).send("Strip not found");
            return;
        } else if (strip) {
            res.locals.strip = strip;
        }
        next();
    }
}

// factory for checking for items in the body
const bodyHas = (items) => {
    return (req, res, next) => {
        for (const item of items) {
            if (!req.body[item]) {
                res.status(400).send(`Missing ${item} in body`);
                return;
            }
            res.locals[item] = req.body[item];
        }
        next();
    }
}

// Middleware:
// - getStrip(mandatory=false)
// - bodyHas(['mac', 'ip', 'type'])
const handshake = async (req, res, next) => {
    const { strip, mac, ip, type } = res.locals;
    let foundStrip = strip;
    if (!strip) {
        db.handshakes.create(mac, ip, 'init');
        db.strips.create(mac, req.body.name, ip);
        foundStrip = db.strips.find(req.body.mac);
    }
    foundStrip.current_ip = ip;
    db.strips.update(foundStrip);
    res.status(200).json(foundStrip);
}


// Middleware:
// - getStrip()
const read = async (req, res, next) => {
    const { strip } = res.locals;

    try {
        const stripData = await axios.get(`http://${strip.current_ip}/`);
    
        const data = stripData.data
        console.log('got data from strip:', data)
        console.log('type of data: ', typeof data)
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error fetching from strip'});
    }
};

// no Middleware
const list = async (req, res, next) => {
    try {
        const strips = db.strips.list();
        res.json(strips);
    } catch (error) {
        res.status(500).json({error: error.stack, message: 'error fetching strips'});
    }
}


// Middleware:
// - getStrip()
const write = async (req, res) => {
    const { strip } = res.locals;

    const {color, on, brightness} = req.body;
    const onStatus = on ? 'on' : 'off';
    console.log('color', color)
    const url = `http://${strip.current_ip}/`;
    const body = {
        color,
        state: onStatus,
        brightness
    }

    try {
        const stripData = await axios.post(url, body);
        // const data = compensateForPicoFuckery(stripData.data)
        const data = stripData.data;

        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error posting to strip'});
    }
}


// Middleware: 

module.exports = {
    handshake: [
        getStrip(mandatory=false), 
        bodyHas(['mac', 'ip', 'type']), 
        handshake],
    read: [getStrip(), read], 
    write: [getStrip(), write],
    list
};