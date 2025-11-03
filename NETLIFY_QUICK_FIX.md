# 🚀 Quick Netlify Fix - Action Required

## ⚠️ Immediate Action: Add Environment Variables to Netlify

Your build is failing because Netlify doesn't have the required environment variables. Here's what to do **RIGHT NOW**:

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project: `vqocisaiygmlguiuspct`
3. Go to **Settings** → **API**
4. Copy the **anon/public** key (you'll need this in Step 2)

### Step 2: Add Environment Variables in Netlify
1. Go to your Netlify dashboard
2. Select your site
3. Navigate to: **Site settings** → **Build & deploy** → **Environment** → **Environment variables**
4. Click **"Add a variable"** and add each of these:

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://vqocisaiygmlguiuspct.supabase.co

Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb2Npc2FpeWdtbGd1aXVzcGN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA4MzY0MiwiZXhwIjoyMDc0NjU5NjQyfQ.yMGE2zAxZtn2MSrLnStlD6dNHvkv9i16OyPj2wVD-xE

Key: SUPABASE_ANON_KEY
Value: [GET THIS FROM SUPABASE DASHBOARD - Settings → API → anon/public key]

Key: DATABASE_URL
Value: postgresql://postgres.vqocisaiygmlguiuspct:0000@aws-1-eu-west-3.pooler.supabase.com:5432/postgres

Key: JWT_SECRET
Value: IFPlpnPUszBJ9Um4BDhlTODNIqjDXHWUMdTDpFTRUU8=

Key: EMAIL_USER
Value: inscriptiondecision@gmail.com

Key: EMAIL_APP_PASSWORD
Value: srwl jweo uare nmhg

Key: NODE_VERSION
Value: 20
```

### Step 3: Trigger a New Deploy
1. After adding ALL the environment variables above
2. Go to **Deploys** tab in Netlify
3. Click **"Trigger deploy"** → **"Deploy site"**

### Step 4: Monitor the Build
Watch the build log. It should now succeed without the "supabaseUrl is required" error.

---

## ✅ What Was Fixed in the Code

I've already committed these fixes to your repository:

1. **Defensive Supabase Initialization** (`src/lib/supabase.ts`)
   - Now supports both `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - Provides clear error messages if env vars are missing
   - Falls back gracefully between different naming conventions

2. **Node.js Version** (`.nvmrc`)
   - Specifies Node.js 20 to avoid deprecation warnings

3. **Documentation** (`NETLIFY_SETUP.md`)
   - Complete guide for Netlify deployment
   - Troubleshooting section for common errors

---

## 🔍 Why This Happened

The build failed because:
- Your code expects `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- These environment variables exist in your local `.env.local` file
- But Netlify doesn't have access to your local `.env.local` file
- Netlify needs these variables configured in its dashboard

---

## 📋 Verification Checklist

After deployment, verify:
- [ ] Build completes successfully (no "supabaseUrl is required" error)
- [ ] Site loads without errors
- [ ] Admin login works: `https://your-site.netlify.app/admin/login`
- [ ] Can view admin dashboard after login
- [ ] Student request form works on homepage

---

## 🆘 Still Having Issues?

If you still see errors after adding the environment variables:

1. **Clear Netlify's build cache**:
   - Go to **Site settings** → **Build & deploy** → **Build settings**
   - Click **"Clear cache and retry deploy"**

2. **Verify all variables are set**:
   - Go to **Site settings** → **Environment variables**
   - Confirm all 8 variables listed above are present

3. **Check build logs**:
   - Look for any other missing environment variables
   - Check for TypeScript or compilation errors

---

## 📚 Need More Details?

See `NETLIFY_SETUP.md` for:
- Complete environment variable documentation
- Where to get each value
- Security best practices
- Troubleshooting guide
