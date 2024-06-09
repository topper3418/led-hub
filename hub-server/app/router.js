const router = require('express').Router();
const { read, write } = require('./controller')

router.route('/:stripMac')
    .get(read)
    .post(write)


module.exports = router;