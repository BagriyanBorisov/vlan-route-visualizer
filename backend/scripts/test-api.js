const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Configure axios
const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

class APITester {
  constructor() {
    this.testResults = [];
  }

  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    console.log(logMessage);
    this.testResults.push({ timestamp, type, message });
  }

  async testHealthCheck() {
    try {
      await this.log('Testing health check endpoint...');
      const response = await api.get('/health');
      await this.log(`Health check successful: ${response.data.status}`, 'success');
      return true;
    } catch (error) {
      await this.log(`Health check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async testSwitchOperations() {
    await this.log('=== Testing Switch Operations ===');
    
    try {
      // Test creating a single switch
      await this.log('Creating a new switch...');
      const newSwitch = {
        hostname: 'test-switch-01',
        ipAddress: '192.168.99.10',
        model: 'Test Switch Model'
      };
      const createResponse = await api.post('/switches', newSwitch);
      const switchId = createResponse.data.id;
      await this.log(`Switch created with ID: ${switchId}`, 'success');

      // Test getting all switches
      await this.log('Getting all switches...');
      const allSwitchesResponse = await api.get('/switches');
      await this.log(`Found ${allSwitchesResponse.data.length} switches`, 'success');

      // Test getting switch by ID
      await this.log(`Getting switch by ID: ${switchId}...`);
      const getSwitchResponse = await api.get(`/switches/${switchId}`);
      await this.log(`Retrieved switch: ${getSwitchResponse.data.hostname}`, 'success');

      // Test updating switch
      await this.log('Updating switch...');
      const updateData = {
        hostname: 'test-switch-01-updated',
        ipAddress: '192.168.99.11',
        model: 'Updated Test Switch Model'
      };
      const updateResponse = await api.put(`/switches/${switchId}`, updateData);
      await this.log(`Switch updated: ${updateResponse.data.hostname}`, 'success');

      // Test bulk switch creation
      await this.log('Creating switches in bulk...');
      const bulkSwitches = {
        switches: [
          {
            hostname: 'bulk-switch-01',
            ipAddress: '192.168.99.20',
            model: 'Bulk Test Switch'
          },
          {
            hostname: 'bulk-switch-02',
            ipAddress: '192.168.99.21',
            model: 'Bulk Test Switch'
          }
        ]
      };
      const bulkCreateResponse = await api.post('/switches/bulk', bulkSwitches);
      await this.log(`Bulk created ${bulkCreateResponse.data.created} switches`, 'success');

      return switchId;
    } catch (error) {
      await this.log(`Switch operations failed: ${error.response?.data?.error || error.message}`, 'error');
      return null;
    }
  }

  async testVlanOperations() {
    await this.log('=== Testing VLAN Operations ===');
    
    try {
      // Test creating a single VLAN
      await this.log('Creating a new VLAN...');
      const newVlan = {
        name: 'Test VLAN',
        vlanId: '999'
      };
      const createResponse = await api.post('/vlans', newVlan);
      const vlanId = createResponse.data.id;
      await this.log(`VLAN created with ID: ${vlanId}`, 'success');

      // Test getting all VLANs
      await this.log('Getting all VLANs...');
      const allVlansResponse = await api.get('/vlans');
      await this.log(`Found ${allVlansResponse.data.length} VLANs`, 'success');

      // Test getting VLAN by ID
      await this.log(`Getting VLAN by ID: ${vlanId}...`);
      const getVlanResponse = await api.get(`/vlans/${vlanId}`);
      await this.log(`Retrieved VLAN: ${getVlanResponse.data.name}`, 'success');

      // Test updating VLAN
      await this.log('Updating VLAN...');
      const updateData = {
        name: 'Updated Test VLAN',
        vlanId: '998'
      };
      const updateResponse = await api.put(`/vlans/${vlanId}`, updateData);
      await this.log(`VLAN updated: ${updateResponse.data.name}`, 'success');

      // Test bulk VLAN creation
      await this.log('Creating VLANs in bulk...');
      const bulkVlans = {
        vlans: [
          {
            name: 'Bulk Test VLAN 1',
            vlanId: '900'
          },
          {
            name: 'Bulk Test VLAN 2',
            vlanId: '901'
          }
        ]
      };
      const bulkCreateResponse = await api.post('/vlans/bulk', bulkVlans);
      await this.log(`Bulk created ${bulkCreateResponse.data.created} VLANs`, 'success');

      return vlanId;
    } catch (error) {
      await this.log(`VLAN operations failed: ${error.response?.data?.error || error.message}`, 'error');
      return null;
    }
  }

  async testVlanSwitchAssociations(vlanId, switchId) {
    await this.log('=== Testing VLAN-Switch Associations ===');
    
    if (!vlanId || !switchId) {
      await this.log('Cannot test associations without valid VLAN and Switch IDs', 'error');
      return;
    }

    try {
      // Test adding switch to VLAN
      await this.log(`Adding switch ${switchId} to VLAN ${vlanId}...`);
      const addResponse = await api.post(`/vlans/${vlanId}/switches/${switchId}`, {
        port: 'Gi1/0/24'
      });
      await this.log(`Switch added to VLAN successfully`, 'success');

      // Test getting switches for a VLAN
      await this.log(`Getting switches for VLAN ${vlanId}...`);
      const vlanSwitchesResponse = await api.get(`/vlans/${vlanId}/switches`);
      await this.log(`VLAN has ${vlanSwitchesResponse.data.switches.length} switches`, 'success');

      // Test getting VLANs for a switch
      await this.log(`Getting VLANs for switch ${switchId}...`);
      const switchVlansResponse = await api.get(`/switches/${switchId}/vlans`);
      await this.log(`Switch has ${switchVlansResponse.data.vlans.length} VLANs`, 'success');

      // Test updating switch port in VLAN
      await this.log('Updating switch port in VLAN...');
      const updatePortResponse = await api.put(`/vlans/${vlanId}/switches/${switchId}`, {
        port: 'Gi1/0/25'
      });
      await this.log(`Switch port updated in VLAN`, 'success');

      // Test VLAN route visualization
      await this.log(`Getting route visualization for VLAN ${vlanId}...`);
      const routeResponse = await api.get(`/vlans/${vlanId}/route`);
      await this.log(`Route visualization has ${routeResponse.data.length} elements`, 'success');

    } catch (error) {
      await this.log(`VLAN-Switch association operations failed: ${error.response?.data?.error || error.message}`, 'error');
    }
  }

  async testBulkOperations() {
    await this.log('=== Testing Bulk Operations ===');
    
    try {
      // Get current data to test bulk delete
      const switchesResponse = await api.get('/switches');
      const vlansResponse = await api.get('/vlans');
      
      // Find test items to delete
      const testSwitches = switchesResponse.data.filter(s => 
        s.hostname.includes('test-') || s.hostname.includes('bulk-')
      );
      const testVlans = vlansResponse.data.filter(v => 
        v.name.includes('Test') || v.name.includes('Bulk')
      );

      if (testSwitches.length > 0) {
        await this.log(`Bulk deleting ${testSwitches.length} test switches...`);
        const bulkDeleteSwitches = {
          switchIds: testSwitches.map(s => s.id)
        };
        const deleteResponse = await api.delete('/switches', { data: bulkDeleteSwitches });
        await this.log(`Bulk deleted ${deleteResponse.data.deleted} switches`, 'success');
      }

      if (testVlans.length > 0) {
        await this.log(`Bulk deleting ${testVlans.length} test VLANs...`);
        const bulkDeleteVlans = {
          vlanIds: testVlans.map(v => v.id)
        };
        const deleteResponse = await api.delete('/vlans', { data: bulkDeleteVlans });
        await this.log(`Bulk deleted ${deleteResponse.data.deleted} VLANs`, 'success');
      }

    } catch (error) {
      await this.log(`Bulk operations failed: ${error.response?.data?.error || error.message}`, 'error');
    }
  }

  async runAllTests() {
    await this.log('🚀 Starting comprehensive API tests...');
    
    // Test health check first
    const isHealthy = await this.testHealthCheck();
    if (!isHealthy) {
      await this.log('API is not healthy, stopping tests', 'error');
      return;
    }

    // Run all test suites
    const switchId = await this.testSwitchOperations();
    const vlanId = await this.testVlanOperations();
    await this.testVlanSwitchAssociations(vlanId, switchId);
    await this.testBulkOperations();
    
    await this.log('✅ All API tests completed!');
    
    // Summary
    const successTests = this.testResults.filter(r => r.type === 'success').length;
    const errorTests = this.testResults.filter(r => r.type === 'error').length;
    
    await this.log(`📊 Test Summary: ${successTests} successful, ${errorTests} failed`);
  }
}

// Run the tests
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests().catch(console.error);
}

module.exports = APITester; 