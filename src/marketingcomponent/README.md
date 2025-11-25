# Marketing Intelligence Component - Setup Guide

## 📁 Files Delivered

You have received **9 files** for your Marketing Intelligence System:

### Core Application Files:
1. `MarketingComponent.tsx` - Main dashboard component
2. `types.ts` - TypeScript interfaces
3. `config.ts` - Supabase configuration
4. `api/marketingAPI.ts` - Database API layer
5. `hooks/useMarketingData.ts` - React hooks
6. `utils/styleUtils.ts` - Styling utilities

### Database Setup Files:
7. `database-setup.sql` - Complete SQL setup (all-in-one)
8. `step-by-step-setup.sql` - Step-by-step SQL commands
9. `storage-bucket-setup.md` - Storage bucket instructions

---

## 🚀 Quick Start (5 Steps)

### Step 1: Install Dependencies

Make sure you have these packages installed:

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

### Step 2: Set Environment Variables

Create/update your `.env` file:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Create Database Tables

**IMPORTANT: Use the step-by-step approach to avoid syntax errors**

1. Open Supabase Dashboard → SQL Editor
2. Open `step-by-step-setup.sql`
3. Copy STEP 1, paste into SQL Editor, run
4. Copy STEP 2, paste, run
5. Continue through STEP 10
6. Verify tables exist with the final query

**Why step-by-step?** Running all SQL at once can cause syntax errors. One statement at a time is safer.

### Step 4: Create Storage Bucket

Follow instructions in `storage-bucket-setup.md`:
- Go to Storage in Supabase
- Create new bucket named `audio-files`
- Make it public
- Done!

### Step 5: Add Files to Your Project

Copy files to your project structure:

```
/src/marketingcomponent/
├── MarketingComponent.tsx
├── types.ts
├── config.ts
├── /api/
│   └── marketingAPI.ts
├── /hooks/
│   └── useMarketingData.ts
└── /utils/
    └── styleUtils.ts
```

Then import in your app:

```typescript
import MarketingComponent from './marketingcomponent/MarketingComponent';

function App() {
  return <MarketingComponent />;
}
```

---

## 🗄️ Database Tables Created

Your setup creates **8 tables**:

1. **personas** - Character profiles (Falcon, Panther, Wolf, Lion)
2. **keywords** - SEO keywords with usage tracking
3. **tags** - Content categorization tags
4. **channels** - Distribution channels
5. **content_strategies** - Strategy vault entries
6. **marketing_intel** - Intelligence entries with audio
7. **research_insights** - Research findings
8. **analytics_tools** - External tools registry

All tables include:
- UUID primary keys
- Created/updated timestamps
- Row Level Security (RLS) enabled
- Full CRUD policies for authenticated users

---

## 🎨 Features Included

### 8 Functional Tabs:
- ✅ **Personas** - Manage character profiles with audience segments
- ✅ **Keywords & Tags** - SEO keywords with CSV bulk import
- ✅ **Strategy Vault** - Store content strategies
- ✅ **Channels** - Distribution channel management
- ✅ **Marketing Intel** - Insights with audio file uploads
- ✅ **Research Insights** - Research findings tracker
- ✅ **Analytics Tools** - External tools registry
- ✅ **Caelum Archives** - Archive system (UI ready)

### Built-in Functionality:
- Dark/Light theme toggle (persisted in localStorage)
- CSV bulk import for keywords
- Audio file upload to Supabase Storage
- Real-time database operations
- Loading states & error handling
- Form validation
- Responsive design
- Professional Inter font styling

---

## 🐛 Troubleshooting

### Error: "Failed to run SQL query"

**Solution:** Use `step-by-step-setup.sql` instead of `database-setup.sql`
- Copy one statement at a time
- Run each individually
- This avoids syntax parsing issues

### Error: "Missing environment variables"

**Solution:** Check your `.env` file
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Make sure to restart your dev server after adding env vars.

### Error: "Failed to upload audio"

**Solution:** Check storage bucket setup
1. Go to Supabase Storage
2. Verify `audio-files` bucket exists
3. Make sure it's set to "public"
4. Check bucket policies are set

### Error: "Row Level Security policy violation"

**Solution:** Check RLS policies
1. Go to Supabase → Database → Tables
2. Click on any table (e.g., `personas`)
3. Go to "Policies" tab
4. Verify policy exists for authenticated users
5. If missing, run STEP 10 from `step-by-step-setup.sql`

### Tables not showing in Supabase

**Solution:** Verify table creation
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

You should see all 8 tables listed.

### Data not loading in UI

**Solution:** Check browser console for errors
- Open DevTools (F12)
- Look for API errors
- Common issues:
  - Wrong Supabase URL/key
  - RLS policies not set
  - Tables not created

---

## 🔒 Security Notes

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow authenticated users full CRUD access
- Block anonymous access
- Automatically enforce at the database level

### Storage Security

Audio files bucket is set to **public** by default:
- Files are accessible via public URLs
- Authenticated users can upload/delete
- Consider making it private if dealing with sensitive data

### API Keys

- **Anon key** is safe for client-side use
- Never expose your **service role key** in frontend code
- Store all keys in `.env` file
- Add `.env` to `.gitignore`

---

## 📊 Architecture

```
User Interface (MarketingComponent.tsx)
         ↓
  Custom Hooks (useMarketingData.ts)
         ↓
    API Layer (marketingAPI.ts)
         ↓
 Supabase Client (config.ts)
         ↓
    Database Tables (8 tables)
```

---

## 🔄 Data Flow Example

**Creating a Persona:**

1. User fills form in UI → clicks "Add Persona"
2. `handleAddPersona()` validates input
3. Calls `createPersona()` from `usePersonas()` hook
4. Hook calls `personasAPI.createPersona()` 
5. API sends INSERT to Supabase
6. Supabase creates row with UUID
7. Returns new persona object
8. Hook updates React state
9. UI re-renders with new persona

---

## 📈 Next Steps

Once setup is complete, you can:

1. **Test Each Tab** - Add sample data to verify CRUD operations
2. **Customize Styling** - Modify colors in `styleUtils.ts`
3. **Add More Personas** - Extend `PERSONA_OPTIONS` in `types.ts`
4. **Connect to Content Manager** - Link personas/keywords to content creation
5. **Build Analytics** - Use `dashboard_posts` for performance tracking

---

## 🆘 Need Help?

If you encounter issues:

1. Check browser console for errors (F12)
2. Verify all 8 tables exist in Supabase
3. Confirm RLS policies are active
4. Test Supabase connection with `testConnection()` function
5. Review error messages carefully

---

## ✅ Verification Checklist

Before launching, verify:

- [ ] All 8 tables created in Supabase
- [ ] Storage bucket `audio-files` exists and is public
- [ ] RLS policies active on all tables
- [ ] Environment variables set correctly
- [ ] Files placed in correct folder structure
- [ ] Component imports successfully
- [ ] Dark/light theme toggle works
- [ ] Can add/delete data in each tab
- [ ] Audio upload works (if using Intel tab)
- [ ] CSV import works (if using Keywords tab)

---

**You're ready to go! Start adding your marketing intelligence data.** 🚀
