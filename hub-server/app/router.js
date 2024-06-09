const router = require('express').Router();
const { read, write } = require('./controller')

router.route('/:stripname')
    .get(read)
    .post(write)


module.exports = router;