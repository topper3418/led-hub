const { json } = require('express');
const axios = require('axios');
const strips = require('../strips.json');

const db = require('../db');

const read = async (req, res) => {
    const stripName = req.params.stripMac;
    let ipAddress;
    ipAddress = strips[stripName];
    console.log('received request for strip:', stripName, 'with ip:', ipAddress)

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        console.log('no ip')
        return;
    }
    try {
        const stripData = await axios.get(`http://${ipAddress}/`);
    
        const data = stripData.data
        console.log('got data from strip:', data)
        console.log('type of data: ', typeof data)
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error fetching from strip'});
    }
};

const write = async (req, res) => {
    const stripName = req.params.stripMac;
    const ipAddress = strips[stripName];

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        return;
    }

    const {color, on, brightness} = req.body;
    const onStatus = on ? 'on' : 'off';
    console.log('color', color)
    const url = `http://${ipAddress}/`;
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

module.exports = {
    read, 
    write 
};