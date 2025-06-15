import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DebugPage = () => {
  const [tests, setTests] = useState({});
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
  const API = `${BACKEND_URL}/api`;

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = {};

    // Test 1: Environment variable
    results.envVar = BACKEND_URL || 'MISSING';

    // Test 2: Basic fetch
    try {
      const response = await fetch(`${API}/`);
      const data = await response.json();
      results.basicFetch = `✅ ${data.message}`;
    } catch (error) {
      results.basicFetch = `❌ ${error.message}`;
    }

    // Test 3: Axios request
    try {
      const response = await axios.get(`${API}/`);
      results.axiosTest = `✅ ${response.data.message}`;
    } catch (error) {
      results.axiosTest = `❌ ${error.message}`;
    }

    // Test 4: Dashboard API
    try {
      const userId = '7db1f025-21f6-4737-a7a0-0c92c0581d71';
      const response = await axios.get(`${API}/users/${userId}/dashboard`);
      results.dashboardAPI = `✅ Got dashboard data`;
    } catch (error) {
      results.dashboardAPI = `❌ ${error.message}`;
    }

    // Test 5: Jobs API
    try {
      const response = await axios.get(`${API}/jobs`);
      results.jobsAPI = `✅ Found ${response.data.length} jobs`;
    } catch (error) {
      results.jobsAPI = `❌ ${error.message}`;
    }

    setTests(results);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Running diagnostics...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">JobBot Debug Page</h1>
      
      <div className="grid gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Environment Variables</h2>
          <p>REACT_APP_BACKEND_URL: <code className="bg-gray-100 px-2 py-1 rounded">{tests.envVar}</code></p>
          <p>Computed API URL: <code className="bg-gray-100 px-2 py-1 rounded">{API}</code></p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">API Tests</h2>
          <div className="space-y-2">
            <p><strong>Basic Fetch:</strong> {tests.basicFetch}</p>
            <p><strong>Axios Test:</strong> {tests.axiosTest}</p>
            <p><strong>Dashboard API:</strong> {tests.dashboardAPI}</p>
            <p><strong>Jobs API:</strong> {tests.jobsAPI}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Button Test</h2>
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={() => alert('Button clicked!')}
          >
            Test Button
          </button>
          <button 
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold mb-2">Console Errors</h2>
          <p className="text-sm text-gray-600">Check browser console (F12) for JavaScript errors</p>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;