{/* Title Field */}
        {(!fieldConfig || fieldConfig.title?.show !== false) && (
          <div style={{ width: '100%' }}>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: isDarkMode ? '#f8fafc' : '#111827',
              marginBottom: '8px'
            }}>
              Title/Headline
            </label>
            
            {/* Title Formatting Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              backgroundColor: isDarkMode ? '#475569' : '#f3f4f6',
              borderRadius: '6px 6px 0 0',
              border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
              borderBottom: 'none'
            }}>
              <button
                type="button"
                onClick={() => {
                  const input = document.querySelector('input[placeholder*="Enter compelling title"]') as HTMLInputElement;
                  if (input) {
                    const start = input.selectionStart || 0;
                    const end = input.selectionEnd || 0;
                    const selectedText = input.value.substring(start, end);
                    const newText = input.value.substring(0, start) + `**${selectedText}**` + input.value.substring(end);
                    setContent(prev => ({ ...prev, title: newText }));
                    // Set cursor position after the formatting
                    setTimeout(() => {
                      input.setSelectionRange(start + 2 + selectedText.length + 2, start + 2 + selectedText.length + 2);
                    }, 0);
                  }
                }}
                style={{
                  padding: '6px 10px',
                  backgroundColor: isDarkMode ? '#334155' : 'white',
                  border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: isDarkMode ? '#f8fafc' : '#111827'
                }}
                title="Bold (wrap selected text with **)"
              >
                B
              </button>
              
              <div style={{
                fontSize: '12px',
                color: isDarkMode ? '#94a3b8' : '#6b7280',
                marginLeft: 'auto'
              }}>
                UK English | Formatting: **bold**
              </div>
            </div>
            
            <input
              type="text"
              value={content.title}
              onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter compelling title... (UK English)"
              maxLength={fieldConfig?.title?.maxLength || 150}
              style={{
                width: '100%',
                padding: '12px',
                border: `1px solid ${isDarkMode ? '#475569' : '#d1d5db'}`,
                borderRadius: '0 0 8px 8px',
                fontSize: '14px',
                backgroundColor: isDarkMode ? '#334155' : 'white',
                color: '#000000', // Black font for posts as requested
                fontFamily: 'inherit',
                borderTop: 'none'
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '4px',
              fontSize: '12px',
              color: isDarkMode ? '#94a3b8' : '#6b7280'
            }}>
              <span>Create an attention-grabbing headline (UK English)</span>
              <span>{content.title.length}/{fieldConfig?.title?.maxLength || 150}</span>
            </div>
          </div>
        )}
