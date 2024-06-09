const router = require('express').Router();
const { getStripData, setStrip } = require('./controller')

router.route('/:stripname')
    .get(getStripData)
    .post(setStrip)


module.exports = router;