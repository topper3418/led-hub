const router = require('express').Router();
const controller = require('./controller')
const errors = require('./errors')


router.route('/all')
    .post(controller.writeAll)
router.route('/:id')
    .get(controller.read)
    .post(controller.write)
    .delete(controller.delete);
router.route('/')
    .get(controller.list)
    .post(controller.handshake);
router.use(errors.notFound);
router.use(errors.handler);

module.exports = router;
