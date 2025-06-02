import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NetworkDashboard() {
  const [stats, setStats] = useState({
    switches: 0,
    vlans: 0,
    associations: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickActions, setQuickActions] = useState({
    showBulkAssign: false,
    selectedVlan: '',
    selectedSwitches: [],
    port: ''
  });
  const [switches, setSwitches] = useState([]);
  const [vlans, setVlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [switchesResponse, vlansResponse] = await Promise.all([
        axios.get('/api/switches'),
        axios.get('/api/vlans')
      ]);

      setSwitches(switchesResponse.data);
      setVlans(vlansResponse.data);

      // Calculate associations count
      let associationsCount = 0;
      for (const vlan of vlansResponse.data) {
        try {
          const vlanSwitches = await axios.get(`/api/vlans/${vlan.id}/switches`);
          associationsCount += vlanSwitches.data.switches.length;
        } catch (err) {
          console.error('Error fetching VLAN switches:', err);
        }
      }

      setStats({
        switches: switchesResponse.data.length,
        vlans: vlansResponse.data.length,
        associations: associationsCount
      });

      // Mock recent activity - in a real app, this would come from an activity log
      setRecentActivity([
        { id: 1, action: 'Created switch', item: 'sw-access-01', time: '2 minutes ago' },
        { id: 2, action: 'Added VLAN', item: 'Guest Network (VLAN 40)', time: '5 minutes ago' },
        { id: 3, action: 'Assigned switch to VLAN', item: 'sw-core-01 → Management', time: '10 minutes ago' },
        { id: 4, action: 'Updated VLAN', item: 'Servers (VLAN 20)', time: '15 minutes ago' },
        { id: 5, action: 'Deleted switch', item: 'old-switch-02', time: '1 hour ago' }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data.');
    }
  };

  const handleBulkAssignSwitches = async () => {
    if (!quickActions.selectedVlan || quickActions.selectedSwitches.length === 0) {
      setError('Please select a VLAN and at least one switch.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const switchesToAssign = quickActions.selectedSwitches.map(switchId => ({
        switchId: parseInt(switchId),
        port: quickActions.port || null
      }));

      const response = await axios.post(`/api/vlans/${quickActions.selectedVlan}/switches/bulk`, {
        switches: switchesToAssign
      });

      setSuccess(`Successfully assigned ${response.data.added} switches to VLAN!`);
      setQuickActions({
        showBulkAssign: false,
        selectedVlan: '',
        selectedSwitches: [],
        port: ''
      });
      fetchDashboardData();

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error bulk assigning switches:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to assign switches. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (actionType) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      switch (actionType) {
        case 'seed-data':
          // This would typically call a seed data endpoint
          setSuccess('Sample data would be seeded in a real implementation.');
          break;
        case 'health-check':
          const healthResponse = await axios.get('/api/health');
          setSuccess(`API Health: ${healthResponse.data.status} - ${healthResponse.data.service}`);
          break;
        case 'refresh-data':
          await fetchDashboardData();
          setSuccess('Dashboard data refreshed successfully!');
          break;
        default:
          break;
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error performing quick action:', error);
      setError('Failed to perform action. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitchSelection = (switchId) => {
    setQuickActions(prev => ({
      ...prev,
      selectedSwitches: prev.selectedSwitches.includes(switchId.toString())
        ? prev.selectedSwitches.filter(id => id !== switchId.toString())
        : [...prev.selectedSwitches, switchId.toString()]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Network Management Dashboard</h1>
            <p className="text-gray-600 mt-1">Comprehensive VLAN and Switch Management</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleQuickAction('health-check')}
              className="btn btn-info"
              disabled={loading}
            >
              Health Check
            </button>
            <button
              onClick={() => handleQuickAction('refresh-data')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">SW</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Switches</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.switches}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">VL</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total VLANs</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.vlans}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-bold">AS</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">VLAN Associations</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.associations}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => setQuickActions(prev => ({ ...prev, showBulkAssign: !prev.showBulkAssign }))}
            className="btn btn-primary text-center"
          >
            Bulk Assign Switches
          </button>
          <button
            onClick={() => window.location.href = '#switches'}
            className="btn btn-secondary text-center"
          >
            Manage Switches
          </button>
          <button
            onClick={() => window.location.href = '#vlans'}
            className="btn btn-secondary text-center"
          >
            Manage VLANs
          </button>
          <button
            onClick={() => window.location.href = '#visualizer'}
            className="btn btn-info text-center"
          >
            View Network Topology
          </button>
        </div>
      </div>

      {/* Bulk Assign Panel */}
      {quickActions.showBulkAssign && (
        <div className="card">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bulk Assign Switches to VLAN</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select VLAN:</label>
              <select
                value={quickActions.selectedVlan}
                onChange={(e) => setQuickActions(prev => ({ ...prev, selectedVlan: e.target.value }))}
                className="input w-full max-w-md"
              >
                <option value="">Choose a VLAN...</option>
                {vlans.map(vlan => (
                  <option key={vlan.id} value={vlan.id}>
                    {vlan.name} (VLAN {vlan.vlanId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Switches:</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 max-h-48 overflow-y-auto">
                {switches.map(switchItem => (
                  <label key={switchItem.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={quickActions.selectedSwitches.includes(switchItem.id.toString())}
                      onChange={() => toggleSwitchSelection(switchItem.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{switchItem.hostname}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Port (Optional):</label>
              <input
                type="text"
                placeholder="e.g., Gi1/0/24"
                value={quickActions.port}
                onChange={(e) => setQuickActions(prev => ({ ...prev, port: e.target.value }))}
                className="input w-full max-w-md"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleBulkAssignSwitches}
                className="btn btn-success"
                disabled={loading || !quickActions.selectedVlan || quickActions.selectedSwitches.length === 0}
              >
                {loading ? 'Assigning...' : `Assign ${quickActions.selectedSwitches.length} Switches`}
              </button>
              <button
                onClick={() => setQuickActions(prev => ({ ...prev, showBulkAssign: false }))}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.item}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Endpoints Summary */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available API Operations</h2>
          <div className="space-y-3 text-sm">
            <div className="border-l-4 border-blue-500 pl-3">
              <h4 className="font-semibold">Switch Management</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Create, Read, Update, Delete switches</li>
                <li>• Bulk operations for switches</li>
                <li>• View VLANs per switch</li>
              </ul>
            </div>
            <div className="border-l-4 border-green-500 pl-3">
              <h4 className="font-semibold">VLAN Management</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Create, Read, Update, Delete VLANs</li>
                <li>• Bulk operations for VLANs</li>
                <li>• View switches per VLAN</li>
              </ul>
            </div>
            <div className="border-l-4 border-purple-500 pl-3">
              <h4 className="font-semibold">VLAN-Switch Associations</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Assign/Remove switches to/from VLANs</li>
                <li>• Bulk assignment operations</li>
                <li>• Network topology visualization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NetworkDashboard; 