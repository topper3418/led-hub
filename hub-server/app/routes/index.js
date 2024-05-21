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

const setStrip = async (req, res) => {
    const stripName = req.params.stripname;
    const ipAddress = strips[stripName];

    if (!ipAddress) {
        res.status(404).send("Strip not found");
        return;
    }

    const {color, on, brightness} = req.body;
    const onStatus = on ? 'on' : 'off';
    const rgb = `(${color.r},${color.g},${color.b})`
    const url = `http://${ipAddress}/?color=${rgb}&state=${onStatus}&brightness=${brightness}`;

    try {
        console.log('setting strip:', {color, on, brightness})
        const stripData = await axios.post(url);
        const data = stripData.data
        console.log('got data from strip:', data)

        res.json(data);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: error.stack, message: 'error posting to strip'});
    }

}

module.exports = {getStripData, setStrip};