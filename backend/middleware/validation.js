const { body, param, validationResult } = require('express-validator');

// Validation error handling middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors.array()
    });
  }
  next();
};

// Authentication validation rules
const authValidation = {
  login: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 1, max: 50 })
      .withMessage('Username must be between 1 and 50 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1 })
      .withMessage('Password is required'),
    handleValidationErrors
  ],
  register: [
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Username must be between 3 and 50 characters')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username can only contain letters, numbers, and underscores'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6, max: 100 })
      .withMessage('Password must be between 6 and 100 characters'),
    body('email')
      .optional()
      .trim()
      .isEmail()
      .withMessage('Invalid email format'),
    handleValidationErrors
  ]
};

// Switch validation rules
const switchValidation = {
  create: [
    body('hostname')
      .trim()
      .notEmpty()
      .withMessage('Hostname is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Hostname must be between 1 and 255 characters'),
    body('ipAddress')
      .trim()
      .notEmpty()
      .withMessage('IP Address is required')
      .isIP()
      .withMessage('Invalid IP address format'),
    body('model')
      .trim()
      .notEmpty()
      .withMessage('Model is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Model must be between 1 and 255 characters'),
    handleValidationErrors
  ],
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid switch ID'),
    body('hostname')
      .trim()
      .notEmpty()
      .withMessage('Hostname is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Hostname must be between 1 and 255 characters'),
    body('ipAddress')
      .trim()
      .notEmpty()
      .withMessage('IP Address is required')
      .isIP()
      .withMessage('Invalid IP address format'),
    body('model')
      .trim()
      .notEmpty()
      .withMessage('Model is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('Model must be between 1 and 255 characters'),
    handleValidationErrors
  ],
  bulk: [
    body('switches')
      .isArray({ min: 1 })
      .withMessage('Switches array is required with at least one item'),
    body('switches.*.hostname')
      .trim()
      .notEmpty()
      .withMessage('Hostname is required for each switch')
      .isLength({ min: 1, max: 255 })
      .withMessage('Hostname must be between 1 and 255 characters'),
    body('switches.*.ipAddress')
      .trim()
      .notEmpty()
      .withMessage('IP Address is required for each switch')
      .isIP()
      .withMessage('Invalid IP address format'),
    body('switches.*.model')
      .trim()
      .notEmpty()
      .withMessage('Model is required for each switch')
      .isLength({ min: 1, max: 255 })
      .withMessage('Model must be between 1 and 255 characters'),
    handleValidationErrors
  ],
  bulkDelete: [
    body('switchIds')
      .isArray({ min: 1 })
      .withMessage('SwitchIds array is required with at least one item'),
    body('switchIds.*')
      .isInt({ min: 1 })
      .withMessage('Each switch ID must be a positive integer'),
    handleValidationErrors
  ]
};

// VLAN validation rules
const vlanValidation = {
  create: [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('VLAN name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('VLAN name must be between 1 and 255 characters'),
    body('vlanId')
      .notEmpty()
      .withMessage('VLAN ID is required')
      .isInt({ min: 1, max: 4094 })
      .withMessage('VLAN ID must be between 1 and 4094'),
    handleValidationErrors
  ],
  update: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid VLAN ID'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('VLAN name is required')
      .isLength({ min: 1, max: 255 })
      .withMessage('VLAN name must be between 1 and 255 characters'),
    body('vlanId')
      .notEmpty()
      .withMessage('VLAN ID is required')
      .isInt({ min: 1, max: 4094 })
      .withMessage('VLAN ID must be between 1 and 4094'),
    handleValidationErrors
  ],
  addSwitch: [
    param('vlanId')
      .isInt({ min: 1 })
      .withMessage('Invalid VLAN ID'),
    param('switchId')
      .isInt({ min: 1 })
      .withMessage('Invalid switch ID'),
    body('port')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Port name must be less than 50 characters'),
    handleValidationErrors
  ],
  bulk: [
    body('vlans')
      .isArray({ min: 1 })
      .withMessage('VLANs array is required with at least one item'),
    body('vlans.*.name')
      .trim()
      .notEmpty()
      .withMessage('VLAN name is required for each VLAN')
      .isLength({ min: 1, max: 255 })
      .withMessage('VLAN name must be between 1 and 255 characters'),
    body('vlans.*.vlanId')
      .notEmpty()
      .withMessage('VLAN ID is required for each VLAN')
      .isInt({ min: 1, max: 4094 })
      .withMessage('VLAN ID must be between 1 and 4094'),
    handleValidationErrors
  ],
  bulkDelete: [
    body('vlanIds')
      .isArray({ min: 1 })
      .withMessage('VlanIds array is required with at least one item'),
    body('vlanIds.*')
      .isInt({ min: 1 })
      .withMessage('Each VLAN ID must be a positive integer'),
    handleValidationErrors
  ],
  bulkAddSwitches: [
    param('vlanId')
      .isInt({ min: 1 })
      .withMessage('Invalid VLAN ID'),
    body('switches')
      .isArray({ min: 1 })
      .withMessage('Switches array is required with at least one item'),
    body('switches.*.switchId')
      .isInt({ min: 1 })
      .withMessage('Each switch ID must be a positive integer'),
    body('switches.*.port')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Port name must be less than 50 characters'),
    handleValidationErrors
  ],
  bulkRemoveSwitches: [
    param('vlanId')
      .isInt({ min: 1 })
      .withMessage('Invalid VLAN ID'),
    body('switchIds')
      .isArray({ min: 1 })
      .withMessage('SwitchIds array is required with at least one item'),
    body('switchIds.*')
      .isInt({ min: 1 })
      .withMessage('Each switch ID must be a positive integer'),
    handleValidationErrors
  ]
};

// Parameter validation
const paramValidation = {
  id: [
    param('id')
      .isInt({ min: 1 })
      .withMessage('Invalid ID parameter'),
    handleValidationErrors
  ]
};

module.exports = {
  authValidation,
  switchValidation,
  vlanValidation,
  paramValidation,
  handleValidationErrors
}; 