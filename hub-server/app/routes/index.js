const { json } = require('express');
const strips = require('../../strips.json');
const axios = require('axios');

const getStripData = async (req, res) => {
    const stripName = req.params.stripname;
    let ipAddress;
    ipAddress = strips[stripName];

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        console.log('no ip')
        return;
    }

    const stripData = await axios.get(`http://${ipAddress}/`);

    const datastring = stripData.data;
    // holy shit I need to fix this on the pico
    const properlyformatteddatastring = datastring
        .replace(/'/g, '"')
        .replace(/True/g, 'true')
        .replace(/False/g, 'false')
        .replace(/\(([^)]+)\)/g, '[$1]');
    console.log(properlyformatteddatastring)
    const dataOut = JSON.parse(properlyformatteddatastring)
    res.json(dataOut);
};

const setStrip = async (req, res) => {
    const stripName = req.params.stripname;
    const ipAddress = strips[stripName];

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        return;
    }

    const {color, status} = req.body;
    const url = `http://${ipAddress}/?color=${color}&status=${status}`;

    try {
        const stripData = await axios.post(url);
        console.log(stripData.data)
        res.json(stripData.data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.message});
    }

}

module.exports = {getStripData, setStrip};