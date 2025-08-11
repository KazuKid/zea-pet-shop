import React, { useState, useEffect } from 'react';

const ConnectionTest = () => {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing connection to backend...');
        const response = await fetch('http://localhost:5000/api/test');
        const data = await response.json();
        console.log('Connection test result:', data);
        setStatus('✅ Connected to backend successfully');
      } catch (error) {
        console.error('Connection test failed:', error);
        setStatus('❌ Failed to connect to backend: ' + error.message);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Backend Connection Test</h3>
      <p>{status}</p>
    </div>
  );
};

export default ConnectionTest;
