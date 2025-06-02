import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SwitchManagement() {
  const [switches, setSwitches] = useState([]);
  const [newSwitch, setNewSwitch] = useState({ hostname: '', ipAddress: '', model: '' });
  const [editingSwitch, setEditingSwitch] = useState(null);
  const [selectedSwitches, setSelectedSwitches] = useState([]);
  const [bulkSwitches, setBulkSwitches] = useState([{ hostname: '', ipAddress: '', model: '' }]);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showVlans, setShowVlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSwitches();
  }, []);

  const fetchSwitches = async () => {
    try {
      console.log('Fetching switches...');
      const response = await axios.get('/api/switches');
      console.log('Switches response:', response.data);
      setSwitches(response.data);
    } catch (error) {
      console.error('Error fetching switches:', error);
      setError('Failed to load switches. Please refresh the page.');
    }
  };

  const fetchSwitchVlans = async (switchId) => {
    try {
      const response = await axios.get(`/api/switches/${switchId}/vlans`);
      setShowVlans(prev => ({
        ...prev,
        [switchId]: response.data.vlans
      }));
    } catch (error) {
      console.error('Error fetching switch VLANs:', error);
      setError('Failed to load switch VLANs.');
    }
  };

  const handleInputChange = (e) => {
    setNewSwitch({ ...newSwitch, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEditInputChange = (e) => {
    setEditingSwitch({ ...editingSwitch, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBulkInputChange = (index, e) => {
    const updatedBulkSwitches = [...bulkSwitches];
    updatedBulkSwitches[index] = { ...updatedBulkSwitches[index], [e.target.name]: e.target.value };
    setBulkSwitches(updatedBulkSwitches);
    setError('');
  };

  const addBulkSwitchRow = () => {
    setBulkSwitches([...bulkSwitches, { hostname: '', ipAddress: '', model: '' }]);
  };

  const removeBulkSwitchRow = (index) => {
    const updatedBulkSwitches = bulkSwitches.filter((_, i) => i !== index);
    setBulkSwitches(updatedBulkSwitches.length ? updatedBulkSwitches : [{ hostname: '', ipAddress: '', model: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating switch:', newSwitch);
      const response = await axios.post('/api/switches', newSwitch);
      console.log('Switch created:', response.data);
      
      setNewSwitch({ hostname: '', ipAddress: '', model: '' });
      setSuccess('Switch added successfully!');
      fetchSwitches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding switch:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to add switch. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const validSwitches = bulkSwitches.filter(sw => sw.hostname && sw.ipAddress && sw.model);
      if (validSwitches.length === 0) {
        setError('Please fill in at least one complete switch.');
        return;
      }

      const response = await axios.post('/api/switches/bulk', { switches: validSwitches });
      console.log('Bulk switches created:', response.data);
      
      setBulkSwitches([{ hostname: '', ipAddress: '', model: '' }]);
      setShowBulkForm(false);
      setSuccess(`${response.data.created} switches added successfully!`);
      fetchSwitches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding bulk switches:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to add switches. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.put(`/api/switches/${editingSwitch.id}`, {
        hostname: editingSwitch.hostname,
        ipAddress: editingSwitch.ipAddress,
        model: editingSwitch.model
      });
      console.log('Switch updated:', response.data);
      
      setEditingSwitch(null);
      setSuccess('Switch updated successfully!');
      fetchSwitches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating switch:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update switch. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (switchId) => {
    if (!window.confirm('Are you sure you want to delete this switch?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/switches/${switchId}`);
      setSuccess('Switch deleted successfully!');
      fetchSwitches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting switch:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete switch. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSwitches.length === 0) {
      setError('Please select switches to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedSwitches.length} switches?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete('/api/switches', { 
        data: { switchIds: selectedSwitches } 
      });
      setSuccess(`${response.data.deleted} switches deleted successfully!`);
      setSelectedSwitches([]);
      fetchSwitches();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting switches:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete switches. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleSwitchSelection = (switchId) => {
    setSelectedSwitches(prev => 
      prev.includes(switchId) 
        ? prev.filter(id => id !== switchId)
        : [...prev, switchId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedSwitches(
      selectedSwitches.length === switches.length 
        ? [] 
        : switches.map(sw => sw.id)
    );
  };

  const toggleVlanView = (switchId) => {
    if (showVlans[switchId]) {
      setShowVlans(prev => ({
        ...prev,
        [switchId]: null
      }));
    } else {
      fetchSwitchVlans(switchId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New Switch Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Switch</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="text"
              name="hostname"
              placeholder="Hostname"
              value={newSwitch.hostname}
              onChange={handleInputChange}
              className="input"
              disabled={loading}
              required
            />
            <input
              type="text"
              name="ipAddress"
              placeholder="IP Address (e.g., 192.168.1.1)"
              value={newSwitch.ipAddress}
              onChange={handleInputChange}
              className="input"
              disabled={loading}
              required
            />
            <input
              type="text"
              name="model"
              placeholder="Model (e.g., Cisco 2960)"
              value={newSwitch.model}
              onChange={handleInputChange}
              className="input"
              disabled={loading}
              required
            />
          </div>
          <div className="flex space-x-4">
            <button 
              type="submit" 
              className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Adding Switch...' : 'Add Switch'}
            </button>
            <button
              type="button"
              onClick={() => setShowBulkForm(!showBulkForm)}
              className="btn btn-secondary"
            >
              {showBulkForm ? 'Hide Bulk Add' : 'Bulk Add Switches'}
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Add Section */}
      {showBulkForm && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add Multiple Switches</h3>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            {bulkSwitches.map((switchItem, index) => (
              <div key={index} className="flex space-x-2 items-center">
                <input
                  type="text"
                  name="hostname"
                  placeholder="Hostname"
                  value={switchItem.hostname}
                  onChange={(e) => handleBulkInputChange(index, e)}
                  className="input flex-1"
                  disabled={loading}
                />
                <input
                  type="text"
                  name="ipAddress"
                  placeholder="IP Address"
                  value={switchItem.ipAddress}
                  onChange={(e) => handleBulkInputChange(index, e)}
                  className="input flex-1"
                  disabled={loading}
                />
                <input
                  type="text"
                  name="model"
                  placeholder="Model"
                  value={switchItem.model}
                  onChange={(e) => handleBulkInputChange(index, e)}
                  className="input flex-1"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeBulkSwitchRow(index)}
                  className="btn btn-danger text-sm"
                  disabled={bulkSwitches.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={addBulkSwitchRow}
                className="btn btn-secondary"
              >
                Add Another Switch
              </button>
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Adding Switches...' : 'Add All Switches'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Switches List Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Network Switches</h2>
          {selectedSwitches.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger"
              disabled={loading}
            >
              Delete Selected ({selectedSwitches.length})
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={switches.length > 0 && selectedSwitches.length === switches.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hostname</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {switches.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No switches found. Add one above!
                  </td>
                </tr>
              ) : (
                switches.map((switchItem) => (
                  <React.Fragment key={switchItem.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSwitches.includes(switchItem.id)}
                          onChange={() => toggleSwitchSelection(switchItem.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingSwitch?.id === switchItem.id ? (
                          <input
                            type="text"
                            name="hostname"
                            value={editingSwitch.hostname}
                            onChange={handleEditInputChange}
                            className="input text-sm"
                          />
                        ) : (
                          switchItem.hostname
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingSwitch?.id === switchItem.id ? (
                          <input
                            type="text"
                            name="ipAddress"
                            value={editingSwitch.ipAddress}
                            onChange={handleEditInputChange}
                            className="input text-sm"
                          />
                        ) : (
                          switchItem.ipAddress
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingSwitch?.id === switchItem.id ? (
                          <input
                            type="text"
                            name="model"
                            value={editingSwitch.model}
                            onChange={handleEditInputChange}
                            className="input text-sm"
                          />
                        ) : (
                          switchItem.model
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {editingSwitch?.id === switchItem.id ? (
                          <>
                            <button
                              onClick={handleUpdate}
                              className="btn btn-success text-xs"
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingSwitch(null)}
                              className="btn btn-secondary text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingSwitch(switchItem)}
                              className="btn btn-secondary text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleVlanView(switchItem.id)}
                              className="btn btn-info text-xs"
                            >
                              {showVlans[switchItem.id] ? 'Hide VLANs' : 'View VLANs'}
                            </button>
                            <button
                              onClick={() => handleDelete(switchItem.id)}
                              className="btn btn-danger text-xs"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {showVlans[switchItem.id] && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <strong>VLANs on {switchItem.hostname}:</strong>
                            {showVlans[switchItem.id].length === 0 ? (
                              <p className="text-gray-500 mt-1">No VLANs associated with this switch.</p>
                            ) : (
                              <div className="mt-2 space-y-1">
                                {showVlans[switchItem.id].map((vlan) => (
                                  <div key={vlan.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                    <span><strong>{vlan.name}</strong> (VLAN {vlan.vlanId})</span>
                                    {vlan.port && <span className="text-gray-500">Port: {vlan.port}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SwitchManagement; 