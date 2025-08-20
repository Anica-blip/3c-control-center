const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return React.createElement('div', { style: { padding: '20px' } },
          React.createElement('h1', null, '📊 3C Content Center'),
          React.createElement('p', null, 'Welcome to your comprehensive content management dashboard'),
          
          React.createElement('div', {
            style: { 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '20px',
              marginTop: '30px'
            }
          },
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #3b82f6', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#1e40af', marginBottom: '15px' } }, '📝 Content Manager'),
              React.createElement('p', { style: { color: '#1e40af', fontSize: '14px', marginBottom: '20px' } }, 'Create, manage, and organize all your content with AI assistance and templates'),
              React.createElement('button', {
                onClick: () => setActiveSection('content-manager'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '📝 Create Content')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #10b981', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#047857', marginBottom: '15px' } }, '💬 Chat Manager - Public'),
              React.createElement('p', { style: { color: '#047857', fontSize: '14px', marginBottom: '20px' } }, 'Manage customer communications, support emails, and notifications'),
              React.createElement('button', {
                onClick: () => setActiveSection('chat-manager-public'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '💬 Manage Chats')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #f59e0b', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#92400e', marginBottom: '15px' } }, '📅 Content Scheduler'),
              React.createElement('p', { style: { color: '#92400e', fontSize: '14px', marginBottom: '20px' } }, 'Schedule and automate content publishing across all platforms'),
              React.createElement('button', {
                onClick: () => setActiveSection('scheduler'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#f59e0b', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '📅 Schedule Content')
            ),
            React.createElement('div', {
              style: { 
                padding: '25px', 
                border: '2px solid #7c3aed', 
                borderRadius: '12px', 
                background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)'
              }
            },
              React.createElement('h3', { style: { color: '#7c3aed', marginBottom: '15px' } }, '🧠 Marketing Center'),
              React.createElement('p', { style: { color: '#7c3aed', fontSize: '14px', marginBottom: '20px' } }, 'Campaign management, analytics, and marketing automation tools'),
              React.createElement('button', {
                onClick: () => setActiveSection('marketing-center'),
                style: { 
                  padding: '10px 20px', 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }
              }, '🧠 Launch Campaigns')
            )
          )
        );
