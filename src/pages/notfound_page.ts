import React from 'react';

const NotFound = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <a href="/3c-control-center/">Go back to dashboard</a>
    </div>
  );
};

export default NotFound;
