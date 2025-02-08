const controller = require('./controller');

const router = require('express').Router();

router.route('/lumos')
    .post(controller.harryPotter.lummos)
router.route('/nox')
    .post(controller.harryPotter.nox)
router.route('/migraneous')
    .post(controller.harryPotter.migraneous)

module.exports = { router };
