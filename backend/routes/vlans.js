const express = require('express');
const router = express.Router();
const vlanController = require('../controllers/vlanController');
const { vlanValidation, paramValidation } = require('../middleware/validation');

// GET /api/vlans - Get all VLANs
router.get('/', vlanController.getAllVlans);

// GET /api/vlans/:id - Get VLAN by ID
router.get('/:id', paramValidation.id, vlanController.getVlanById);

// GET /api/vlans/:id/switches - Get switches associated with a VLAN
router.get('/:id/switches', paramValidation.id, vlanController.getVlanSwitches);

// POST /api/vlans - Create new VLAN
router.post('/', vlanValidation.create, vlanController.createVlan);

// POST /api/vlans/bulk - Create multiple VLANs
router.post('/bulk', vlanValidation.bulk, vlanController.createVlansBulk);

// PUT /api/vlans/:id - Update VLAN
router.put('/:id', vlanValidation.update, vlanController.updateVlan);

// PUT /api/vlans/:vlanId/switches/:switchId - Update switch port in VLAN
router.put('/:vlanId/switches/:switchId', vlanValidation.addSwitch, vlanController.updateSwitchInVlan);

// DELETE /api/vlans/:id - Delete VLAN
router.delete('/:id', paramValidation.id, vlanController.deleteVlan);

// DELETE /api/vlans - Delete multiple VLANs
router.delete('/', vlanValidation.bulkDelete, vlanController.deleteVlansBulk);

// GET /api/vlans/:id/route - Get VLAN route visualization data
router.get('/:id/route', paramValidation.id, vlanController.getVlanRoute);

// POST /api/vlans/:vlanId/switches/:switchId - Add switch to VLAN
router.post('/:vlanId/switches/:switchId', vlanValidation.addSwitch, vlanController.addSwitchToVlan);

// DELETE /api/vlans/:vlanId/switches/:switchId - Remove switch from VLAN
router.delete('/:vlanId/switches/:switchId', vlanController.removeSwitchFromVlan);

// POST /api/vlans/:vlanId/switches/bulk - Add multiple switches to VLAN
router.post('/:vlanId/switches/bulk', vlanValidation.bulkAddSwitches, vlanController.addSwitchesToVlanBulk);

// DELETE /api/vlans/:vlanId/switches/bulk - Remove multiple switches from VLAN
router.delete('/:vlanId/switches/bulk', vlanValidation.bulkRemoveSwitches, vlanController.removeSwitchesFromVlanBulk);

module.exports = router; 