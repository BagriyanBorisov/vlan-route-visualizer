const database = require('../config/database');

const sampleSwitches = [
  { hostname: 'sw-core-01', ipAddress: '192.168.1.10', model: 'Cisco Catalyst 9300' },
  { hostname: 'sw-dist-01', ipAddress: '192.168.1.20', model: 'Cisco Catalyst 9200' },
  { hostname: 'sw-dist-02', ipAddress: '192.168.1.21', model: 'Cisco Catalyst 9200' },
  { hostname: 'sw-access-01', ipAddress: '192.168.1.30', model: 'Cisco Catalyst 9100' },
  { hostname: 'sw-access-02', ipAddress: '192.168.1.31', model: 'Cisco Catalyst 9100' },
  { hostname: 'sw-access-03', ipAddress: '192.168.1.32', model: 'Cisco Catalyst 9100' }
];

const sampleVlans = [
  { name: 'Management', vlanId: '10' },
  { name: 'Servers', vlanId: '20' },
  { name: 'Workstations', vlanId: '30' },
  { name: 'Guest', vlanId: '40' },
  { name: 'IoT Devices', vlanId: '50' }
];

const sampleVlanSwitches = [
  // Management VLAN (VLAN 10) on all switches
  { vlan_id: 1, switch_id: 1, port: 'Gi1/0/1' },
  { vlan_id: 1, switch_id: 2, port: 'Gi1/0/1' },
  { vlan_id: 1, switch_id: 3, port: 'Gi1/0/1' },
  { vlan_id: 1, switch_id: 4, port: 'Gi1/0/1' },
  { vlan_id: 1, switch_id: 5, port: 'Gi1/0/1' },
  { vlan_id: 1, switch_id: 6, port: 'Gi1/0/1' },
  
  // Servers VLAN (VLAN 20) on core and distribution switches
  { vlan_id: 2, switch_id: 1, port: 'Gi1/0/10-20' },
  { vlan_id: 2, switch_id: 2, port: 'Gi1/0/10-15' },
  { vlan_id: 2, switch_id: 3, port: 'Gi1/0/10-15' },
  
  // Workstations VLAN (VLAN 30) on distribution and access switches
  { vlan_id: 3, switch_id: 2, port: 'Gi1/0/20-30' },
  { vlan_id: 3, switch_id: 3, port: 'Gi1/0/20-30' },
  { vlan_id: 3, switch_id: 4, port: 'Gi1/0/2-24' },
  { vlan_id: 3, switch_id: 5, port: 'Gi1/0/2-24' },
  
  // Guest VLAN (VLAN 40) on access switches
  { vlan_id: 4, switch_id: 4, port: 'Gi1/0/25-48' },
  { vlan_id: 4, switch_id: 5, port: 'Gi1/0/25-48' },
  { vlan_id: 4, switch_id: 6, port: 'Gi1/0/2-24' },
  
  // IoT Devices VLAN (VLAN 50) on specific access switches
  { vlan_id: 5, switch_id: 5, port: 'Gi1/0/30-40' },
  { vlan_id: 5, switch_id: 6, port: 'Gi1/0/25-48' }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await database.connect();
    await database.initializeTables();
    
    const db = database.getDatabase();
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM vlan_switches');
        db.run('DELETE FROM routes');
        db.run('DELETE FROM vlans');
        db.run('DELETE FROM switches', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });
    
    // Insert switches
    console.log('🔌 Inserting switches...');
    for (const switchData of sampleSwitches) {
      await new Promise((resolve, reject) => {
        const query = 'INSERT INTO switches (hostname, ipAddress, model) VALUES (?, ?, ?)';
        db.run(query, [switchData.hostname, switchData.ipAddress, switchData.model], function(err) {
          if (err) reject(err);
          else {
            console.log(`  ✅ Added switch: ${switchData.hostname} (ID: ${this.lastID})`);
            resolve();
          }
        });
      });
    }
    
    // Insert VLANs
    console.log('🏷️  Inserting VLANs...');
    for (const vlanData of sampleVlans) {
      await new Promise((resolve, reject) => {
        const query = 'INSERT INTO vlans (name, vlanId) VALUES (?, ?)';
        db.run(query, [vlanData.name, vlanData.vlanId], function(err) {
          if (err) reject(err);
          else {
            console.log(`  ✅ Added VLAN: ${vlanData.name} (VLAN ${vlanData.vlanId}, ID: ${this.lastID})`);
            resolve();
          }
        });
      });
    }
    
    // Insert VLAN-Switch associations
    console.log('🔗 Creating VLAN-Switch associations...');
    for (const vlanSwitch of sampleVlanSwitches) {
      await new Promise((resolve, reject) => {
        const query = 'INSERT INTO vlan_switches (vlan_id, switch_id, port) VALUES (?, ?, ?)';
        db.run(query, [vlanSwitch.vlan_id, vlanSwitch.switch_id, vlanSwitch.port], function(err) {
          if (err) reject(err);
          else {
            console.log(`  ✅ Associated VLAN ${vlanSwitch.vlan_id} with Switch ${vlanSwitch.switch_id} on port ${vlanSwitch.port}`);
            resolve();
          }
        });
      });
    }
    
    console.log('✨ Database seeding completed successfully!');
    console.log('\n📊 Seeded data summary:');
    console.log(`  - ${sampleSwitches.length} switches`);
    console.log(`  - ${sampleVlans.length} VLANs`);
    console.log(`  - ${sampleVlanSwitches.length} VLAN-Switch associations`);
    
    await database.close();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    await database.close();
    process.exit(1);
  }
}

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 