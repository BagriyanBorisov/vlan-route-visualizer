import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NetworkDashboard from './components/NetworkDashboard';
import SwitchManagement from './components/SwitchManagement';
import VlanManagement from './components/VlanManagement';
import VlanRouteVisualizer from './components/VlanRouteVisualizer';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-800">VLAN-Route Manager</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link to="/" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/switches" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                    Switches
                  </Link>
                  <Link to="/vlans" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                    VLANs
                  </Link>
                  <Link to="/visualizer" className="text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-blue-500 transition-colors">
                    Visualizer
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn btn-secondary text-sm">
                  Login
                </Link>
              </div>
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Dashboard
                </Link>
                <Link to="/switches" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Switches
                </Link>
                <Link to="/vlans" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  VLANs
                </Link>
                <Link to="/visualizer" className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                  Visualizer
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<NetworkDashboard />} />
            <Route path="/switches" element={<SwitchManagement />} />
            <Route path="/vlans" element={<VlanManagement />} />
            <Route path="/visualizer" element={<VlanRouteVisualizer />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        {/* Footer with API info */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                VLAN Route Manager - Full REST API for Network Infrastructure Management
              </div>
              <div className="flex space-x-4 text-xs text-gray-400">
                <span>✓ Switch CRUD</span>
                <span>✓ VLAN CRUD</span>
                <span>✓ Bulk Operations</span>
                <span>✓ Association Management</span>
                <span>✓ Network Visualization</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App; 