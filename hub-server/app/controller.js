const { json } = require('express');
const axios = require('axios');
const strips = require('../strips.json');

const getStripData = async (req, res) => {
    const stripName = req.params.stripname;
    let ipAddress;
    ipAddress = strips[stripName];

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        console.log('no ip')
        return;
    }
    try {
        const stripData = await axios.get(`http://${ipAddress}/`);
    
        // const data = compensateForPicoFuckery(stripData.data)
        const data = stripData.data
        console.log('got data from strip:', data)
        console.log('type of data: ', typeof data)
        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error fetching from strip'});
    }
};

const setStrip = async (req, res) => {
    const stripName = req.params.stripname;
    const ipAddress = strips[stripName];

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        return;
    }

    const {color, on, brightness} = req.body;
    const onStatus = on ? 'on' : 'off';
    console.log('color', color)
    const rgb = `(${color.r},${color.g},${color.b})`
    const url = `http://${ipAddress}/?color=${rgb}&state=${onStatus}&brightness=${brightness}`;
    console.log('url', `http://${ipAddress}/?color=${rgb}&state=${onStatus}&brightness=${brightness}`)
    console.log('betterurl', "192.168.68.69:80/?state=off&color=(127,0,255)&brightness=255")

    try {
        const stripData = await axios.post(url);
        // const data = compensateForPicoFuckery(stripData.data)
        const data = stripData.data

        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error posting to strip'});
    }

}

module.exports = {getStripData, setStrip};