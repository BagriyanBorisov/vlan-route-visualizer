const express = require('express');
const router = express.Router();
const switchController = require('../controllers/switchController');
const { switchValidation, paramValidation } = require('../middleware/validation');

// GET /api/switches - Get all switches
router.get('/', switchController.getAllSwitches);

// GET /api/switches/:id - Get switch by ID
router.get('/:id', paramValidation.id, switchController.getSwitchById);

// GET /api/switches/:id/vlans - Get VLANs associated with a switch
router.get('/:id/vlans', paramValidation.id, switchController.getSwitchVlans);

// POST /api/switches - Create new switch
router.post('/', switchValidation.create, switchController.createSwitch);

// POST /api/switches/bulk - Create multiple switches
router.post('/bulk', switchValidation.bulk, switchController.createSwitchesBulk);

// PUT /api/switches/:id - Update switch
router.put('/:id', switchValidation.update, switchController.updateSwitch);

// DELETE /api/switches/:id - Delete switch
router.delete('/:id', paramValidation.id, switchController.deleteSwitch);

// DELETE /api/switches - Delete multiple switches
router.delete('/', switchValidation.bulkDelete, switchController.deleteSwitchesBulk);

module.exports = router; 