# 🔑 Get Your Supabase Anon Key

## Quick Steps

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Login if needed

2. **Select Your Project**
   - Click on project: `vqocisaiygmlguiuspct`

3. **Navigate to API Settings**
   - Click **Settings** (⚙️ icon in left sidebar)
   - Click **API** in the settings menu

4. **Copy the Anon Key**
   - Look for section: **Project API keys**
   - Find the key labeled: **`anon` `public`**
   - Click the copy icon next to it
   - It will look something like:
     ```
     eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxb2Npc2FpeWdtbGd1aXVzcGN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODM2NDIsImV4cCI6MjA3NDY1OTY0Mn0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
     ```

5. **Add it to Netlify**
   - Go to Netlify dashboard: https://app.netlify.com
   - Select your site
   - Go to: **Site settings** → **Environment variables**
   - Click **Add a variable**
   - Key: `SUPABASE_ANON_KEY`
   - Value: [paste the key you copied]
   - Click **Save**

6. **Redeploy**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Deploy site**

---

## ✅ What You Have So Far

Your local `.env.local` already has:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ `SUPABASE_ANON_KEY` = "your-anon-key-here" (needs real value)

---

## 🎯 After You Get the Key

Replace the placeholder in your local `.env.local`:
```bash
SUPABASE_ANON_KEY=your-actual-anon-key-here
```

**Note:** Don't commit `.env.local` to git! It's already in `.gitignore`.

---

## 📸 Visual Guide

When you're in Supabase → Settings → API, you'll see:

```
Project API keys
────────────────────────────────────────

Project URL
https://vqocisaiygmlguiuspct.supabase.co    [📋 Copy]

anon public
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    [📋 Copy] ← Click this!

service_role secret
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    [📋 Copy]
```

Copy the **anon public** key!
