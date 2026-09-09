'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/priceAlert.controller');
const { protect }            = require('../middleware/auth.middleware');
const { validate, schemas }  = require('../middleware/validation.middleware');
const { alertCreateLimiter } = require('../middleware/rateLimit.middleware');

router.use(protect);

router.get('/',       ctrl.getAlerts);
router.get('/stats',  ctrl.getAlertStats);
router.post('/',      alertCreateLimiter, validate(schemas.createAlert), ctrl.createAlert);
router.get('/:id',    ctrl.getAlertById);
router.put('/:id',    validate(schemas.updateAlert), ctrl.updateAlert);
router.delete('/:id', ctrl.deleteAlert);

module.exports = router;
