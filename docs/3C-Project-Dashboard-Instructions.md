# 3C Project — Dashboard User Instructions

# 3C Connection Engineering Map

## 🔗 **Service Integration Architecture**

### **Data Flow Hierarchy:**
```
Admin Center (Master)
├── Template Management → Wasabi Storage
├── Configuration Sync → Notion Database  
└── Publishing Pipeline → Supabase
    └── Content Distribution → External APIs
```

## 📊 **Service Responsibilities:**

### **Supabase (Publishing Engine):**
- **Content posting/publishing**
- **Scheduled post execution**  
- **User authentication backup**
- **Analytics data storage**
- **Real-time subscriptions**

**Usage Pattern:**
```typescript
// When content is ready to publish
supabase.from('posts').insert({
  content, platform, schedule_time, status
})
```

### **Notion (Configuration Database):**
- **Tab title functions/metadata**
- **Component configurations**
- **User preferences**
- **Dashboard settings**
- **Navigation state**

**Usage Pattern:**
```typescript
// When component needs configuration
notion.databases.query({
  database_id: 'component_config_db',
  filter: { component: 'content-manager' }
})
```

### **Wasabi (Internal File Storage):**
- **Media assets (images, videos)**
- **Template files**
- **Brand kit assets**
- **Backup configurations**
- **Export/import data**

**Usage Pattern:**
```typescript
// When storing media or templates
wasabi.upload('templates/', templateFile)
wasabi.getSignedUrl('brand-kit/logo.png')
```

## 🏗️ **Admin Center as Master Hub**

### **Core Functions:**
1. **Template Engine** - Creates formats for other components
2. **Configuration Manager** - Defines settings other components use
3. **Data Sync Controller** - Orchestrates all service connections
4. **Brand Kit Manager** - Central asset repository

### **Admin Center Structure:**
```
Admin Center
├── 📄 Template Management
│   ├── Social Media Post Templates
│   ├── Email Templates  
│   ├── Chat Response Templates
│   └── Schedule Templates
├── 🎨 Brand Kit Management
│   ├── Logos & Assets (Wasabi)
│   ├── Color Schemes
│   ├── Typography Rules
│   └── Style Guidelines
├── ⚙️ Global Configuration
│   ├── Platform API Keys
│   ├── Service Endpoints
│   ├── User Permissions
│   └── Component Settings (Notion)
└── 🔄 Sync Management
    ├── Supabase Connection Status
    ├── Notion Database Health
    ├── Wasabi Storage Quota
    └── External API Status
```

## 🔄 **Synchronization Flow:**

### **Template Creation (Admin → Other Components):**
1. **Admin Center** creates template → **Wasabi storage**
2. **Template metadata** → **Notion database**
3. **Other components** fetch available templates from Notion
4. **Content creation** uses template from Wasabi
5. **Finished content** → **Supabase for publishing**

### **Configuration Updates:**
1. **Admin Center** updates settings → **Notion database**
2. **Components listen** for config changes via Notion API
3. **Real-time updates** propagate across dashboard
4. **Backup configurations** → **Wasabi storage**

## 💾 **Data Models:**

### **Template Structure:**
```typescript
interface Template {
  id: string;
  name: string;
  type: 'social' | 'email' | 'chat' | 'schedule';
  content: string;
  variables: string[];
  wasabi_url: string;
  created_by: string;
  updated_at: Date;
  metadata: {
    platform: string[];
    dimensions?: object;
    category: string;
  };
}
```

### **Configuration Structure:**
```typescript
interface ComponentConfig {
  component_id: string;
  settings: object;
  ui_preferences: object;
  api_endpoints: object;
  enabled_features: string[];
  last_sync: Date;
}
```

## 🎯 **Implementation Priority:**

### **Phase 3A: Admin Center Foundation**
1. **Template Management System**
2. **Wasabi integration for asset storage**  
3. **Notion configuration database**
4. **Basic brand kit structure**

### **Phase 3B: Service Connections**
1. **Supabase publishing pipeline**
2. **Notion API integration**
3. **Wasabi file management**
4. **Error handling & fallbacks**

### **Phase 3C: Component Synchronization**
1. **Content Manager** connects to templates
2. **Schedule Manager** uses Admin configurations
3. **Marketing Center** pulls brand kit assets
4. **Settings** modifies Admin-stored configurations

## 🔧 **Technical Prerequisites:**

### **Environment Variables Needed:**
```env
# Supabase
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=

# Notion
REACT_APP_NOTION_TOKEN=
REACT_APP_NOTION_DATABASE_ID=

# Wasabi
REACT_APP_WASABI_ACCESS_KEY=
REACT_APP_WASABI_SECRET_KEY=
REACT_APP_WASABI_BUCKET=
REACT_APP_WASABI_REGION=
```

### **Required Dependencies:**
```bash
npm install @supabase/supabase-js
npm install @notionhq/client
npm install aws-sdk  # For Wasabi S3-compatible API
```

## 🎯 **Next Steps:**
1. Set up Admin Center template management interface
2. Configure service connections (Supabase, Notion, Wasabi)
3. Build template creation/editing tools
4. Establish synchronization patterns for other components

## 🎯 Project Status: **Phase 1 & 2 COMPLETE** ✅

### **Quick Context for New Chats:**
```
Repository: 3c-control-center
Domain: https://3c-control-center.vercel.app
Auth: GitHub OAuth (Anica-blip only)
Framework: React + Vite + TypeScript
Styling: Inline styles (NO Tailwind, NO external CSS)
```

---

## 📁 **Component Architecture:**

### **✅ COMPLETED COMPONENTS:**
- **App.tsx** - Main dashboard with auth & navigation
- **index.html** - Clean, no complex favicon  
- **vite.config.ts** - `base: '/'` for proper deployment
- **webchat.tsx** - Fixed, no auto-scroll

### **🔧 COMPONENTS NEEDING PRECISION WORK:**
1. **📝 Content Manager** (`src/contentcomponent.tsx`)
2. **📅 Schedule Manager** (`src/schedulecomponent.tsx`) 
3. **🧠 Marketing Center** (`src/marketingcomponent.tsx`)
4. **⚙️ Settings** (`src/settingscomponent.tsx`)
5. **🔧 Admin Center** (`src/admincomponents.tsx`)

---

## 🏗️ **ESTABLISHED PATTERNS:**

### **Component Structure:**
```typescript
// Header pattern for ALL components:
<div style={{
  backgroundColor: isDarkMode ? '#1e293b' : 'white',
  boxShadow: '...',
  borderRadius: '8px',
  padding: '20px',
  marginBottom: '20px',
  border: `1px solid ${isDarkMode ? '#334155' : '#3b82f6'}`
}}>
  <h1>🎯 Component Name</h1>
  <p>Component description</p>
</div>
```

### **Dark Mode Support:**
- Use `withThemeWrapper` HOC for global CSS injection
- Consistent color scheme: `#0f172a` → `#1e293b` → `#334155`
- Apply `className="component-content"` for theme targeting

### **DO NOT CHANGE:**
- ✅ Authentication system (working perfectly)
- ✅ Top-right controls layout 
- ✅ Navigation sidebar
- ✅ Color schemes and styling patterns

---

## 📋 **CURRENT PRIORITIES:**

### **Next Phase: Component Precision Work**
- [ ] Content Manager - Polish UI, add features
- [ ] Schedule Manager - Calendar integration, better UX
- [ ] Marketing Center - Analytics, persona management
- [ ] Settings - Platform configurations
- [ ] Admin Center - Template management, advanced controls

### **Future Phases:**
- [ ] AI Rule Book Integration
- [ ] Brand Kit Implementation  
- [ ] Language Translation System
- [ ] Advanced Features & Optimization

---

## 🚫 **DEPLOYMENT RULES:**

1. **Test locally first:** `npm run dev`
2. **Check all navigation tabs** work
3. **Test login/logout cycle**
4. **Verify dark mode** throughout
5. **Only then deploy**

---

## 🔄 **Chat Continuity Protocol:**

### **Starting New Chat:**
"Hey Claude! Continuing 3C Thread To Success project. Please reference the file `docs/3C-Project-Dashboard-Instructions.md` for full context. Currently working on [COMPONENT NAME] precision work."

### **Always Include:**
- Current working component
- Specific issue/feature being addressed
- What NOT to change (auth, layout, patterns)

---

## 📝 **Change Log:**

### **[DATE] - Phase 1 & 2 Complete:**
- ✅ Fixed authentication system
- ✅ Resolved deployment issues (vite.config.ts base path)
- ✅ Implemented dark mode with withThemeWrapper
- ✅ Added static controls with language flags
- ✅ Fixed webchat auto-scroll issue
- ✅ Added headers to all navigation sections

### **[DATE] - Next:**
- 🔄 Begin precision work on individual components

---

## 🎯 **Success Metrics:**
- **Deployment:** ✅ Stable on Vercel
- **Authentication:** ✅ GitHub OAuth working
- **Navigation:** ✅ All 7 components accessible  
- **Dark Mode:** ✅ Consistent throughout
- **User Experience:** ✅ Smooth, professional

---

**💡 REMEMBER:** This is a premium dashboard - every component should feel polished and professional!
