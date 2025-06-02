import React, { useState, useEffect } from 'react';
import axios from 'axios';

function VlanManagement() {
  const [vlans, setVlans] = useState([]);
  const [switches, setSwitches] = useState([]);
  const [newVlan, setNewVlan] = useState({ name: '', vlanId: '' });
  const [editingVlan, setEditingVlan] = useState(null);
  const [selectedVlans, setSelectedVlans] = useState([]);
  const [bulkVlans, setBulkVlans] = useState([{ name: '', vlanId: '' }]);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [showSwitches, setShowSwitches] = useState({});
  const [showAssignModal, setShowAssignModal] = useState(null);
  const [assignmentData, setAssignmentData] = useState({ switchId: '', port: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVlans();
    fetchSwitches();
  }, []);

  const fetchVlans = async () => {
    try {
      console.log('Fetching VLANs...');
      const response = await axios.get('/api/vlans');
      console.log('VLANs response:', response.data);
      setVlans(response.data);
    } catch (error) {
      console.error('Error fetching VLANs:', error);
      setError('Failed to load VLANs. Please refresh the page.');
    }
  };

  const fetchSwitches = async () => {
    try {
      const response = await axios.get('/api/switches');
      setSwitches(response.data);
    } catch (error) {
      console.error('Error fetching switches:', error);
    }
  };

  const fetchVlanSwitches = async (vlanId) => {
    try {
      const response = await axios.get(`/api/vlans/${vlanId}/switches`);
      setShowSwitches(prev => ({
        ...prev,
        [vlanId]: response.data.switches
      }));
    } catch (error) {
      console.error('Error fetching VLAN switches:', error);
      setError('Failed to load VLAN switches.');
    }
  };

  const handleInputChange = (e) => {
    setNewVlan({ ...newVlan, [e.target.name]: e.target.value });
    setError('');
  };

  const handleEditInputChange = (e) => {
    setEditingVlan({ ...editingVlan, [e.target.name]: e.target.value });
    setError('');
  };

  const handleBulkInputChange = (index, e) => {
    const updatedBulkVlans = [...bulkVlans];
    updatedBulkVlans[index] = { ...updatedBulkVlans[index], [e.target.name]: e.target.value };
    setBulkVlans(updatedBulkVlans);
    setError('');
  };

  const addBulkVlanRow = () => {
    setBulkVlans([...bulkVlans, { name: '', vlanId: '' }]);
  };

  const removeBulkVlanRow = (index) => {
    const updatedBulkVlans = bulkVlans.filter((_, i) => i !== index);
    setBulkVlans(updatedBulkVlans.length ? updatedBulkVlans : [{ name: '', vlanId: '' }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('Creating VLAN:', newVlan);
      const response = await axios.post('/api/vlans', {
        name: newVlan.name,
        vlanId: parseInt(newVlan.vlanId) // Ensure vlanId is sent as integer
      });
      console.log('VLAN created:', response.data);
      
      setNewVlan({ name: '', vlanId: '' });
      setSuccess('VLAN added successfully!');
      fetchVlans();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding VLAN:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to add VLAN. Please try again.';
      
      if (error.response?.status === 400) {
        // Validation errors
        if (error.response.data?.details) {
          errorMessage = `Validation Error: ${error.response.data.details.map(d => d.msg).join(', ')}`;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = 'Invalid input data. Please check your entries.';
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'A VLAN with this VLAN ID already exists.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
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
      const validVlans = bulkVlans.filter(vlan => vlan.name && vlan.vlanId);
      if (validVlans.length === 0) {
        setError('Please fill in at least one complete VLAN.');
        return;
      }

      // Ensure vlanId is sent as integer for each VLAN
      const processedVlans = validVlans.map(vlan => ({
        name: vlan.name,
        vlanId: parseInt(vlan.vlanId)
      }));

      const response = await axios.post('/api/vlans/bulk', { vlans: processedVlans });
      console.log('Bulk VLANs created:', response.data);
      
      setBulkVlans([{ name: '', vlanId: '' }]);
      setShowBulkForm(false);
      setSuccess(`${response.data.created} VLANs added successfully!`);
      fetchVlans();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error adding bulk VLANs:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to add VLANs. Please try again.';
      
      if (error.response?.status === 400) {
        // Validation errors
        if (error.response.data?.details) {
          errorMessage = `Validation Error: ${error.response.data.details.map(d => d.msg).join(', ')}`;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = 'Invalid input data. Please check your entries.';
        }
      } else if (error.response?.status === 409) {
        errorMessage = 'One or more VLANs already exist with the specified VLAN IDs.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
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
      const response = await axios.put(`/api/vlans/${editingVlan.id}`, {
        name: editingVlan.name,
        vlanId: editingVlan.vlanId
      });
      console.log('VLAN updated:', response.data);
      
      setEditingVlan(null);
      setSuccess('VLAN updated successfully!');
      fetchVlans();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating VLAN:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update VLAN. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (vlanId) => {
    if (!window.confirm('Are you sure you want to delete this VLAN?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/vlans/${vlanId}`);
      setSuccess('VLAN deleted successfully!');
      fetchVlans();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting VLAN:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete VLAN. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedVlans.length === 0) {
      setError('Please select VLANs to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedVlans.length} VLANs?`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.delete('/api/vlans', { 
        data: { vlanIds: selectedVlans } 
      });
      setSuccess(`${response.data.deleted} VLANs deleted successfully!`);
      setSelectedVlans([]);
      fetchVlans();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting VLANs:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to delete VLANs. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSwitch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`/api/vlans/${showAssignModal}/switches/${assignmentData.switchId}`, {
        port: assignmentData.port
      });
      setSuccess('Switch assigned to VLAN successfully!');
      setShowAssignModal(null);
      setAssignmentData({ switchId: '', port: '' });
      
      // Refresh the switches for this VLAN if currently showing
      if (showSwitches[showAssignModal]) {
        fetchVlanSwitches(showAssignModal);
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error assigning switch to VLAN:', error);
      
      // Handle specific error types
      let errorMessage = 'Failed to assign switch to VLAN. Please try again.';
      
      if (error.response?.status === 400) {
        // Validation errors
        if (error.response.data?.details) {
          errorMessage = `Validation Error: ${error.response.data.details.map(d => d.msg).join(', ')}`;
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = 'Invalid input data. Please check your entries.';
        }
      } else if (error.response?.status === 409) {
        // Conflict errors (like duplicate assignment)
        errorMessage = 'This switch is already assigned to this VLAN.';
      } else if (error.response?.data?.details?.includes('UNIQUE constraint')) {
        errorMessage = 'This switch is already assigned to this VLAN.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSwitchFromVlan = async (vlanId, switchId) => {
    if (!window.confirm('Are you sure you want to remove this switch from the VLAN?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`/api/vlans/${vlanId}/switches/${switchId}`);
      setSuccess('Switch removed from VLAN successfully!');
      fetchVlanSwitches(vlanId);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing switch from VLAN:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to remove switch from VLAN. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleVlanSelection = (vlanId) => {
    setSelectedVlans(prev => 
      prev.includes(vlanId) 
        ? prev.filter(id => id !== vlanId)
        : [...prev, vlanId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedVlans(
      selectedVlans.length === vlans.length 
        ? [] 
        : vlans.map(vlan => vlan.id)
    );
  };

  const toggleSwitchView = (vlanId) => {
    if (showSwitches[vlanId]) {
      setShowSwitches(prev => ({
        ...prev,
        [vlanId]: null
      }));
    } else {
      fetchVlanSwitches(vlanId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add New VLAN Section */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New VLAN</h2>
        
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              name="name"
              placeholder="VLAN Name (e.g., Sales, IT, Guest)"
              value={newVlan.name}
              onChange={handleInputChange}
              className="input"
              disabled={loading}
              required
            />
            <input
              type="number"
              name="vlanId"
              placeholder="VLAN ID (1-4094)"
              value={newVlan.vlanId}
              onChange={handleInputChange}
              className="input"
              min="1"
              max="4094"
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
              {loading ? 'Adding VLAN...' : 'Add VLAN'}
            </button>
            <button
              type="button"
              onClick={() => setShowBulkForm(!showBulkForm)}
              className="btn btn-secondary"
            >
              {showBulkForm ? 'Hide Bulk Add' : 'Bulk Add VLANs'}
            </button>
          </div>
        </form>
      </div>

      {/* Bulk Add Section */}
      {showBulkForm && (
        <div className="card">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add Multiple VLANs</h3>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            {bulkVlans.map((vlan, index) => (
              <div key={index} className="flex space-x-2 items-center">
                <input
                  type="text"
                  name="name"
                  placeholder="VLAN Name"
                  value={vlan.name}
                  onChange={(e) => handleBulkInputChange(index, e)}
                  className="input flex-1"
                  disabled={loading}
                />
                <input
                  type="number"
                  name="vlanId"
                  placeholder="VLAN ID"
                  value={vlan.vlanId}
                  onChange={(e) => handleBulkInputChange(index, e)}
                  className="input flex-1"
                  min="1"
                  max="4094"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => removeBulkVlanRow(index)}
                  className="btn btn-danger text-sm"
                  disabled={bulkVlans.length === 1}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={addBulkVlanRow}
                className="btn btn-secondary"
              >
                Add Another VLAN
              </button>
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Adding VLANs...' : 'Add All VLANs'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VLANs List Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">VLAN List</h2>
          {selectedVlans.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn btn-danger"
              disabled={loading}
            >
              Delete Selected ({selectedVlans.length})
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
                    checked={vlans.length > 0 && selectedVlans.length === vlans.length}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VLAN ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {vlans.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                    No VLANs found. Add one above!
                  </td>
                </tr>
              ) : (
                vlans.map((vlan) => (
                  <React.Fragment key={vlan.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedVlans.includes(vlan.id)}
                          onChange={() => toggleVlanSelection(vlan.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingVlan?.id === vlan.id ? (
                          <input
                            type="text"
                            name="name"
                            value={editingVlan.name}
                            onChange={handleEditInputChange}
                            className="input text-sm"
                          />
                        ) : (
                          vlan.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingVlan?.id === vlan.id ? (
                          <input
                            type="number"
                            name="vlanId"
                            value={editingVlan.vlanId}
                            onChange={handleEditInputChange}
                            className="input text-sm"
                            min="1"
                            max="4094"
                          />
                        ) : (
                          vlan.vlanId
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {editingVlan?.id === vlan.id ? (
                          <>
                            <button
                              onClick={handleUpdate}
                              className="btn btn-success text-xs"
                              disabled={loading}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingVlan(null)}
                              className="btn btn-secondary text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingVlan(vlan)}
                              className="btn btn-secondary text-xs"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleSwitchView(vlan.id)}
                              className="btn btn-info text-xs"
                            >
                              {showSwitches[vlan.id] ? 'Hide Switches' : 'View Switches'}
                            </button>
                            <button
                              onClick={() => setShowAssignModal(vlan.id)}
                              className="btn btn-success text-xs"
                            >
                              Assign Switch
                            </button>
                            <button
                              onClick={() => handleDelete(vlan.id)}
                              className="btn btn-danger text-xs"
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                    {showSwitches[vlan.id] && (
                      <tr>
                        <td colSpan="4" className="px-6 py-4 bg-gray-50">
                          <div className="text-sm">
                            <strong>Switches in {vlan.name} (VLAN {vlan.vlanId}):</strong>
                            {showSwitches[vlan.id].length === 0 ? (
                              <p className="text-gray-500 mt-1">No switches associated with this VLAN.</p>
                            ) : (
                              <div className="mt-2 space-y-1">
                                {showSwitches[vlan.id].map((switchItem) => (
                                  <div key={switchItem.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                    <div>
                                      <span><strong>{switchItem.hostname}</strong> ({switchItem.ipAddress})</span>
                                      {switchItem.port && <span className="text-gray-500 ml-2">Port: {switchItem.port}</span>}
                                    </div>
                                    <button
                                      onClick={() => handleRemoveSwitchFromVlan(vlan.id, switchItem.id)}
                                      className="btn btn-danger text-xs"
                                      disabled={loading}
                                    >
                                      Remove
                                    </button>
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

      {/* Assign Switch Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Assign Switch to VLAN {vlans.find(v => v.id === showAssignModal)?.name}
            </h3>
            <form onSubmit={handleAssignSwitch} className="space-y-4">
              <select
                value={assignmentData.switchId}
                onChange={(e) => setAssignmentData({...assignmentData, switchId: e.target.value})}
                className="input w-full"
                required
              >
                <option value="">Select a switch...</option>
                {switches.map(switchItem => (
                  <option key={switchItem.id} value={switchItem.id}>
                    {switchItem.hostname} ({switchItem.ipAddress})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Port (optional, e.g., Gi1/0/24)"
                value={assignmentData.port}
                onChange={(e) => setAssignmentData({...assignmentData, port: e.target.value})}
                className="input w-full"
              />
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Assigning...' : 'Assign Switch'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(null);
                    setAssignmentData({ switchId: '', port: '' });
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VlanManagement; 