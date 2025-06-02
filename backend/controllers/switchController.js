const { validationResult } = require('express-validator');
const database = require('../config/database');

class SwitchController {
  // Get all switches
  async getAllSwitches(req, res) {
    try {
      const db = database.getDatabase();
      const query = 'SELECT * FROM switches ORDER BY created_at DESC';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error fetching switches:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch switches',
            details: err.message 
          });
        }
        res.json(rows);
      });
    } catch (error) {
      console.error('Error in getAllSwitches:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Get switch by ID
  async getSwitchById(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      const query = 'SELECT * FROM switches WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          console.error('Error fetching switch:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch switch',
            details: err.message 
          });
        }
        
        if (!row) {
          return res.status(404).json({ error: 'Switch not found' });
        }
        
        res.json(row);
      });
    } catch (error) {
      console.error('Error in getSwitchById:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Get VLANs associated with a switch
  async getSwitchVlans(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      
      // First check if switch exists
      db.get('SELECT * FROM switches WHERE id = ?', [id], (err, switchRow) => {
        if (err) {
          console.error('Error fetching switch:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch switch',
            details: err.message 
          });
        }
        
        if (!switchRow) {
          return res.status(404).json({ error: 'Switch not found' });
        }

        // Get VLANs associated with this switch
        const query = `
          SELECT v.*, vs.port, vs.id as vlan_switch_id
          FROM vlans v 
          JOIN vlan_switches vs ON v.id = vs.vlan_id 
          WHERE vs.switch_id = ?
          ORDER BY v.vlanId
        `;
        
        db.all(query, [id], (err, rows) => {
          if (err) {
            console.error('Error fetching switch VLANs:', err);
            return res.status(500).json({ 
              error: 'Failed to fetch switch VLANs',
              details: err.message 
            });
          }
          
          res.json({
            switch: switchRow,
            vlans: rows
          });
        });
      });
    } catch (error) {
      console.error('Error in getSwitchVlans:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Create new switch
  async createSwitch(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const db = database.getDatabase();
      const { hostname, ipAddress, model } = req.body;
      const query = `
        INSERT INTO switches (hostname, ipAddress, model) 
        VALUES (?, ?, ?)
      `;
      
      db.run(query, [hostname, ipAddress, model], function(err) {
        if (err) {
          console.error('Error creating switch:', err);
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ 
              error: 'Switch with this hostname or IP address already exists' 
            });
          }
          return res.status(500).json({ 
            error: 'Failed to create switch',
            details: err.message 
          });
        }
        
        // Return the created switch
        db.get('SELECT * FROM switches WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('Error fetching created switch:', err);
            return res.status(500).json({ 
              error: 'Switch created but failed to fetch details',
              details: err.message 
            });
          }
          res.status(201).json(row);
        });
      });
    } catch (error) {
      console.error('Error in createSwitch:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Create multiple switches (bulk operation)
  async createSwitchesBulk(req, res) {
    try {
      const { switches } = req.body;
      
      if (!Array.isArray(switches) || switches.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input: switches array is required' 
        });
      }

      const db = database.getDatabase();
      const createdSwitches = [];
      const errors = [];
      
      for (let i = 0; i < switches.length; i++) {
        const switchData = switches[i];
        const { hostname, ipAddress, model } = switchData;
        
        // Basic validation
        if (!hostname || !ipAddress || !model) {
          errors.push(`Switch ${i + 1}: hostname, ipAddress, and model are required`);
          continue;
        }
        
        try {
          await new Promise((resolve, reject) => {
            const query = 'INSERT INTO switches (hostname, ipAddress, model) VALUES (?, ?, ?)';
            db.run(query, [hostname, ipAddress, model], function(err) {
              if (err) {
                errors.push(`Switch ${i + 1} (${hostname}): ${err.message}`);
                resolve();
              } else {
                db.get('SELECT * FROM switches WHERE id = ?', [this.lastID], (err, row) => {
                  if (err) {
                    errors.push(`Switch ${i + 1} (${hostname}): Created but failed to fetch details`);
                  } else {
                    createdSwitches.push(row);
                  }
                  resolve();
                });
              }
            });
          });
        } catch (error) {
          errors.push(`Switch ${i + 1} (${hostname}): ${error.message}`);
        }
      }
      
      res.status(201).json({
        message: `Bulk operation completed`,
        created: createdSwitches.length,
        total: switches.length,
        switches: createdSwitches,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error in createSwitchesBulk:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Update switch
  async updateSwitch(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const db = database.getDatabase();
      const { id } = req.params;
      const { hostname, ipAddress, model } = req.body;
      const query = `
        UPDATE switches 
        SET hostname = ?, ipAddress = ?, model = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.run(query, [hostname, ipAddress, model, id], function(err) {
        if (err) {
          console.error('Error updating switch:', err);
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ 
              error: 'Switch with this hostname or IP address already exists' 
            });
          }
          return res.status(500).json({ 
            error: 'Failed to update switch',
            details: err.message 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Switch not found' });
        }
        
        // Return the updated switch
        db.get('SELECT * FROM switches WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('Error fetching updated switch:', err);
            return res.status(500).json({ 
              error: 'Switch updated but failed to fetch details',
              details: err.message 
            });
          }
          res.json(row);
        });
      });
    } catch (error) {
      console.error('Error in updateSwitch:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Delete switch
  async deleteSwitch(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      const query = 'DELETE FROM switches WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          console.error('Error deleting switch:', err);
          return res.status(500).json({ 
            error: 'Failed to delete switch',
            details: err.message 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Switch not found' });
        }
        
        res.json({ message: 'Switch deleted successfully' });
      });
    } catch (error) {
      console.error('Error in deleteSwitch:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Delete multiple switches (bulk operation)
  async deleteSwitchesBulk(req, res) {
    try {
      const { switchIds } = req.body;
      
      if (!Array.isArray(switchIds) || switchIds.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input: switchIds array is required' 
        });
      }

      const db = database.getDatabase();
      let deletedCount = 0;
      
      for (const id of switchIds) {
        try {
          await new Promise((resolve, reject) => {
            db.run('DELETE FROM switches WHERE id = ?', [id], function(err) {
              if (err) {
                console.error(`Error deleting switch ${id}:`, err);
              } else {
                deletedCount += this.changes;
              }
              resolve();
            });
          });
        } catch (error) {
          console.error(`Error in bulk delete for switch ${id}:`, error);
        }
      }
      
      res.json({
        message: `Bulk delete completed`,
        requested: switchIds.length,
        deleted: deletedCount
      });
    } catch (error) {
      console.error('Error in deleteSwitchesBulk:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}

module.exports = new SwitchController(); 