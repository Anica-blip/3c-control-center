import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>🚀 3C Control Center</h1>
      <p>Your dashboard is now live!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>Features:</h2>
        <ul>
          <li>✅ React Application Running</li>
          <li>✅ TypeScript Support</li>
          <li>✅ GitHub Pages Deployment</li>
          <li>✅ Supabase Integration Ready</li>
        </ul>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/3c-control-center/*" element={<Dashboard />} />
        <Route path="/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
