const { validationResult } = require('express-validator');
const database = require('../config/database');

class VlanController {
  // Get all VLANs
  async getAllVlans(req, res) {
    try {
      const db = database.getDatabase();
      const query = 'SELECT * FROM vlans ORDER BY created_at DESC';
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error fetching VLANs:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch VLANs',
            details: err.message 
          });
        }
        res.json(rows);
      });
    } catch (error) {
      console.error('Error in getAllVlans:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Get VLAN by ID
  async getVlanById(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      const query = 'SELECT * FROM vlans WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          console.error('Error fetching VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch VLAN',
            details: err.message 
          });
        }
        
        if (!row) {
          return res.status(404).json({ error: 'VLAN not found' });
        }
        
        res.json(row);
      });
    } catch (error) {
      console.error('Error in getVlanById:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Create new VLAN
  async createVlan(req, res) {
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
      const { name, vlanId } = req.body;
      const query = `
        INSERT INTO vlans (name, vlanId) 
        VALUES (?, ?)
      `;
      
      db.run(query, [name, vlanId], function(err) {
        if (err) {
          console.error('Error creating VLAN:', err);
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ 
              error: 'VLAN with this VLAN ID already exists' 
            });
          }
          return res.status(500).json({ 
            error: 'Failed to create VLAN',
            details: err.message 
          });
        }
        
        // Return the created VLAN
        db.get('SELECT * FROM vlans WHERE id = ?', [this.lastID], (err, row) => {
          if (err) {
            console.error('Error fetching created VLAN:', err);
            return res.status(500).json({ 
              error: 'VLAN created but failed to fetch details',
              details: err.message 
            });
          }
          res.status(201).json(row);
        });
      });
    } catch (error) {
      console.error('Error in createVlan:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Update VLAN
  async updateVlan(req, res) {
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
      const { name, vlanId } = req.body;
      const query = `
        UPDATE vlans 
        SET name = ?, vlanId = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;
      
      db.run(query, [name, vlanId, id], function(err) {
        if (err) {
          console.error('Error updating VLAN:', err);
          if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ 
              error: 'VLAN with this VLAN ID already exists' 
            });
          }
          return res.status(500).json({ 
            error: 'Failed to update VLAN',
            details: err.message 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'VLAN not found' });
        }
        
        // Return the updated VLAN
        db.get('SELECT * FROM vlans WHERE id = ?', [id], (err, row) => {
          if (err) {
            console.error('Error fetching updated VLAN:', err);
            return res.status(500).json({ 
              error: 'VLAN updated but failed to fetch details',
              details: err.message 
            });
          }
          res.json(row);
        });
      });
    } catch (error) {
      console.error('Error in updateVlan:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Delete VLAN
  async deleteVlan(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      const query = 'DELETE FROM vlans WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          console.error('Error deleting VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to delete VLAN',
            details: err.message 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'VLAN not found' });
        }
        
        res.json({ message: 'VLAN deleted successfully' });
      });
    } catch (error) {
      console.error('Error in deleteVlan:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Get VLAN route visualization data
  async getVlanRoute(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      
      // First check if VLAN exists
      db.get('SELECT * FROM vlans WHERE id = ?', [id], (err, vlan) => {
        if (err) {
          console.error('Error fetching VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch VLAN',
            details: err.message 
          });
        }
        
        if (!vlan) {
          return res.status(404).json({ error: 'VLAN not found' });
        }

        // Get switches that are part of this VLAN
        const switchQuery = `
          SELECT s.*, vs.port 
          FROM switches s 
          JOIN vlan_switches vs ON s.id = vs.switch_id 
          WHERE vs.vlan_id = ?
        `;
        
        db.all(switchQuery, [id], (err, switches) => {
          if (err) {
            console.error('Error fetching VLAN switches:', err);
            return res.status(500).json({ 
              error: 'Failed to fetch VLAN switches',
              details: err.message 
            });
          }

          // Generate cytoscape-compatible graph data
          const nodes = switches.map(sw => ({
            data: { 
              id: `switch-${sw.id}`, 
              label: sw.hostname,
              hostname: sw.hostname,
              ipAddress: sw.ipAddress,
              model: sw.model,
              port: sw.port
            }
          }));

          // For now, create a simple mesh topology
          // In a real scenario, you'd have actual route data
          const edges = [];
          for (let i = 0; i < switches.length; i++) {
            for (let j = i + 1; j < switches.length; j++) {
              edges.push({
                data: {
                  id: `edge-${switches[i].id}-${switches[j].id}`,
                  source: `switch-${switches[i].id}`,
                  target: `switch-${switches[j].id}`,
                  label: `VLAN ${vlan.vlanId}`
                }
              });
            }
          }

          const graphData = [...nodes, ...edges];
          res.json(graphData);
        });
      });
    } catch (error) {
      console.error('Error in getVlanRoute:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Associate a switch with a VLAN
  async addSwitchToVlan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const db = database.getDatabase();
      const { vlanId, switchId } = req.params;
      const { port } = req.body;

      // First check if VLAN exists
      db.get('SELECT * FROM vlans WHERE id = ?', [vlanId], (err, vlan) => {
        if (err) {
          console.error('Error checking VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to verify VLAN',
            details: err.message 
          });
        }
        
        if (!vlan) {
          return res.status(404).json({ error: 'VLAN not found' });
        }

        // Check if switch exists
        db.get('SELECT * FROM switches WHERE id = ?', [switchId], (err, switchItem) => {
          if (err) {
            console.error('Error checking switch:', err);
            return res.status(500).json({ 
              error: 'Failed to verify switch',
              details: err.message 
            });
          }
          
          if (!switchItem) {
            return res.status(404).json({ error: 'Switch not found' });
          }

          // Check if association already exists
          db.get('SELECT * FROM vlan_switches WHERE vlan_id = ? AND switch_id = ?', [vlanId, switchId], (err, existing) => {
            if (err) {
              console.error('Error checking existing association:', err);
              return res.status(500).json({ 
                error: 'Failed to check existing association',
                details: err.message 
              });
            }
            
            if (existing) {
              return res.status(409).json({ 
                error: 'Switch is already assigned to this VLAN',
                details: `${switchItem.hostname} is already associated with VLAN ${vlan.name}` 
              });
            }

            // Create the association
            const query = `
              INSERT INTO vlan_switches (vlan_id, switch_id, port) 
              VALUES (?, ?, ?)
            `;
            
            db.run(query, [vlanId, switchId, port], function(err) {
              if (err) {
                console.error('Error adding switch to VLAN:', err);
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                  return res.status(409).json({ 
                    error: 'Switch is already assigned to this VLAN' 
                  });
                }
                return res.status(500).json({ 
                  error: 'Failed to add switch to VLAN',
                  details: err.message 
                });
              }
              
              res.status(201).json({ 
                message: 'Switch added to VLAN successfully',
                vlanSwitchId: this.lastID,
                vlanName: vlan.name,
                switchName: switchItem.hostname,
                port: port || null
              });
            });
          });
        });
      });
    } catch (error) {
      console.error('Error in addSwitchToVlan:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Remove a switch from a VLAN
  async removeSwitchFromVlan(req, res) {
    try {
      const db = database.getDatabase();
      const { vlanId, switchId } = req.params;
      const query = 'DELETE FROM vlan_switches WHERE vlan_id = ? AND switch_id = ?';
      
      db.run(query, [vlanId, switchId], function(err) {
        if (err) {
          console.error('Error removing switch from VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to remove switch from VLAN',
            details: err.message 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Switch not associated with this VLAN' });
        }
        
        res.json({ message: 'Switch removed from VLAN successfully' });
      });
    } catch (error) {
      console.error('Error in removeSwitchFromVlan:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Get switches associated with a VLAN
  async getVlanSwitches(req, res) {
    try {
      const db = database.getDatabase();
      const { id } = req.params;
      
      // First check if VLAN exists
      db.get('SELECT * FROM vlans WHERE id = ?', [id], (err, vlanRow) => {
        if (err) {
          console.error('Error fetching VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to fetch VLAN',
            details: err.message 
          });
        }
        
        if (!vlanRow) {
          return res.status(404).json({ error: 'VLAN not found' });
        }

        // Get switches associated with this VLAN
        const query = `
          SELECT s.*, vs.port, vs.id as vlan_switch_id
          FROM switches s 
          JOIN vlan_switches vs ON s.id = vs.switch_id 
          WHERE vs.vlan_id = ?
          ORDER BY s.hostname
        `;
        
        db.all(query, [id], (err, rows) => {
          if (err) {
            console.error('Error fetching VLAN switches:', err);
            return res.status(500).json({ 
              error: 'Failed to fetch VLAN switches',
              details: err.message 
            });
          }
          
          res.json({
            vlan: vlanRow,
            switches: rows
          });
        });
      });
    } catch (error) {
      console.error('Error in getVlanSwitches:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Create multiple VLANs (bulk operation)
  async createVlansBulk(req, res) {
    try {
      const { vlans } = req.body;
      
      if (!Array.isArray(vlans) || vlans.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input: vlans array is required' 
        });
      }

      const db = database.getDatabase();
      const createdVlans = [];
      const errors = [];
      
      for (let i = 0; i < vlans.length; i++) {
        const vlanData = vlans[i];
        const { name, vlanId } = vlanData;
        
        // Basic validation
        if (!name || !vlanId) {
          errors.push(`VLAN ${i + 1}: name and vlanId are required`);
          continue;
        }
        
        try {
          await new Promise((resolve, reject) => {
            const query = 'INSERT INTO vlans (name, vlanId) VALUES (?, ?)';
            db.run(query, [name, vlanId], function(err) {
              if (err) {
                errors.push(`VLAN ${i + 1} (${name}): ${err.message}`);
                resolve();
              } else {
                db.get('SELECT * FROM vlans WHERE id = ?', [this.lastID], (err, row) => {
                  if (err) {
                    errors.push(`VLAN ${i + 1} (${name}): Created but failed to fetch details`);
                  } else {
                    createdVlans.push(row);
                  }
                  resolve();
                });
              }
            });
          });
        } catch (error) {
          errors.push(`VLAN ${i + 1} (${name}): ${error.message}`);
        }
      }
      
      res.status(201).json({
        message: `Bulk operation completed`,
        created: createdVlans.length,
        total: vlans.length,
        vlans: createdVlans,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error in createVlansBulk:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Delete multiple VLANs (bulk operation)
  async deleteVlansBulk(req, res) {
    try {
      const { vlanIds } = req.body;
      
      if (!Array.isArray(vlanIds) || vlanIds.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input: vlanIds array is required' 
        });
      }

      const db = database.getDatabase();
      let deletedCount = 0;
      
      for (const id of vlanIds) {
        try {
          await new Promise((resolve, reject) => {
            db.run('DELETE FROM vlans WHERE id = ?', [id], function(err) {
              if (err) {
                console.error(`Error deleting VLAN ${id}:`, err);
              } else {
                deletedCount += this.changes;
              }
              resolve();
            });
          });
        } catch (error) {
          console.error(`Error in bulk delete for VLAN ${id}:`, error);
        }
      }
      
      res.json({
        message: `Bulk delete completed`,
        requested: vlanIds.length,
        deleted: deletedCount
      });
    } catch (error) {
      console.error('Error in deleteVlansBulk:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Update switch port assignment in VLAN
  async updateSwitchInVlan(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed',
          details: errors.array() 
        });
      }

      const db = database.getDatabase();
      const { vlanId, switchId } = req.params;
      const { port } = req.body;
      
      const query = `
        UPDATE vlan_switches 
        SET port = ?, created_at = CURRENT_TIMESTAMP 
        WHERE vlan_id = ? AND switch_id = ?
      `;
      
      db.run(query, [port, vlanId, switchId], function(err) {
        if (err) {
          console.error('Error updating switch in VLAN:', err);
          return res.status(500).json({ 
            error: 'Failed to update switch in VLAN',
            details: err.message 
          });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Switch not associated with this VLAN' });
        }
        
        res.json({ 
          message: 'Switch port updated in VLAN successfully',
          vlanId: parseInt(vlanId),
          switchId: parseInt(switchId),
          port: port
        });
      });
    } catch (error) {
      console.error('Error in updateSwitchInVlan:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Add multiple switches to VLAN (bulk operation)
  async addSwitchesToVlanBulk(req, res) {
    try {
      const { vlanId } = req.params;
      const { switches } = req.body;
      
      if (!Array.isArray(switches) || switches.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input: switches array is required' 
        });
      }

      const db = database.getDatabase();
      const addedSwitches = [];
      const errors = [];
      
      for (let i = 0; i < switches.length; i++) {
        const switchData = switches[i];
        const { switchId, port } = switchData;
        
        if (!switchId) {
          errors.push(`Switch ${i + 1}: switchId is required`);
          continue;
        }
        
        try {
          await new Promise((resolve, reject) => {
            const query = 'INSERT INTO vlan_switches (vlan_id, switch_id, port) VALUES (?, ?, ?)';
            db.run(query, [vlanId, switchId, port || null], function(err) {
              if (err) {
                if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
                  errors.push(`Switch ${i + 1} (ID: ${switchId}): Already associated with this VLAN`);
                } else {
                  errors.push(`Switch ${i + 1} (ID: ${switchId}): ${err.message}`);
                }
                resolve();
              } else {
                addedSwitches.push({
                  vlanSwitchId: this.lastID,
                  switchId: parseInt(switchId),
                  port: port || null
                });
                resolve();
              }
            });
          });
        } catch (error) {
          errors.push(`Switch ${i + 1} (ID: ${switchId}): ${error.message}`);
        }
      }
      
      res.status(201).json({
        message: `Bulk add switches to VLAN completed`,
        vlanId: parseInt(vlanId),
        added: addedSwitches.length,
        total: switches.length,
        switches: addedSwitches,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      console.error('Error in addSwitchesToVlanBulk:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }

  // Remove multiple switches from VLAN (bulk operation)
  async removeSwitchesFromVlanBulk(req, res) {
    try {
      const { vlanId } = req.params;
      const { switchIds } = req.body;
      
      if (!Array.isArray(switchIds) || switchIds.length === 0) {
        return res.status(400).json({ 
          error: 'Invalid input: switchIds array is required' 
        });
      }

      const db = database.getDatabase();
      let removedCount = 0;
      
      for (const switchId of switchIds) {
        try {
          await new Promise((resolve, reject) => {
            db.run('DELETE FROM vlan_switches WHERE vlan_id = ? AND switch_id = ?', [vlanId, switchId], function(err) {
              if (err) {
                console.error(`Error removing switch ${switchId} from VLAN ${vlanId}:`, err);
              } else {
                removedCount += this.changes;
              }
              resolve();
            });
          });
        } catch (error) {
          console.error(`Error in bulk remove for switch ${switchId}:`, error);
        }
      }
      
      res.json({
        message: `Bulk remove switches from VLAN completed`,
        vlanId: parseInt(vlanId),
        requested: switchIds.length,
        removed: removedCount
      });
    } catch (error) {
      console.error('Error in removeSwitchesFromVlanBulk:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        details: error.message 
      });
    }
  }
}

module.exports = new VlanController(); 