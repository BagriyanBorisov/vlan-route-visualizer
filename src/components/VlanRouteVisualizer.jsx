import React, { useState, useEffect } from 'react';
import axios from 'axios';
import cytoscape from 'cytoscape';

function VlanRouteVisualizer() {
  const [vlans, setVlans] = useState([]);
  const [selectedVlan, setSelectedVlan] = useState(null);
  const [graphData, setGraphData] = useState(null);

  useEffect(() => {
    fetchVlans();
  }, []);

  useEffect(() => {
    if (selectedVlan) {
      fetchVlanRoute(selectedVlan);
    }
  }, [selectedVlan]);

  const fetchVlans = async () => {
    try {
      const response = await axios.get('/api/vlans');
      setVlans(response.data);
    } catch (error) {
      console.error('Error fetching VLANs:', error);
    }
  };

  const fetchVlanRoute = async (vlanId) => {
    try {
      const response = await axios.get(`/api/vlans/${vlanId}/route`);
      setGraphData(response.data);
      renderGraph(response.data);
    } catch (error) {
      console.error('Error fetching VLAN route:', error);
    }
  };

  const renderGraph = (data) => {
    const cy = cytoscape({
      container: document.getElementById('cy'),
      elements: data,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3B82F6',
            'label': 'data(id)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'text-outline-color': '#000',
            'text-outline-width': 2,
            'width': 40,
            'height': 40
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#9CA3AF',
            'target-arrow-color': '#9CA3AF',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          }
        }
      ],
      layout: {
        name: 'cose',
        padding: 50,
        animate: true,
        animationDuration: 500,
        randomize: true,
        nodeRepulsion: 4500,
        idealEdgeLength: 100,
        edgeElasticity: 0.45
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">VLAN Route Visualization</h2>
        <div className="mb-4">
          <select
            onChange={(e) => setSelectedVlan(e.target.value)}
            className="input w-full max-w-xs"
          >
            <option value="">Select a VLAN</option>
            {vlans.map((vlan) => (
              <option key={vlan.id} value={vlan.id}>
                {vlan.name} - {vlan.vlanId}
              </option>
            ))}
          </select>
        </div>
        <div id="cy" className="w-full h-[600px] border border-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
}

export default VlanRouteVisualizer; 