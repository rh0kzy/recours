# Netlify Deployment Configuration

## Environment Variables Setup

To deploy this application successfully on Netlify, you **must** configure the following environment variables in your Netlify site settings.

### How to Add Environment Variables in Netlify

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to **Site settings** → **Build & deploy** → **Environment**
4. Click **"Environment variables"**
5. Add each variable below using the **"Add a variable"** button

### Required Environment Variables

```bash
# Database - PostgreSQL Connection String
DATABASE_URL=postgresql://postgres.YOUR_PROJECT:YOUR_PASSWORD@aws-0-YOUR_REGION.pooler.supabase.com:5432/postgres

# Email Configuration (for student notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-specific-password

# JWT Secret for Admin Authentication
# Generate a secure random string: openssl rand -base64 32
JWT_SECRET=your-32-character-minimum-jwt-secret

# Supabase Configuration
# Get these from: https://app.supabase.com → Your Project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
```

### Where to Get These Values

#### 1. **DATABASE_URL**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **Database** → **Connection string** → **URI**
- Copy the connection string (replace `[YOUR-PASSWORD]` with your actual password)

#### 2. **EMAIL_USER & EMAIL_APP_PASSWORD**
- Use a Gmail account
- Enable 2-factor authentication
- Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
- Use this app-specific password (not your regular Gmail password)

#### 3. **JWT_SECRET**
- Generate a secure random string:
  ```bash
  # On Linux/Mac/WSL:
  openssl rand -base64 32
  
  # Or use Node.js:
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```

#### 4. **Supabase Keys**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **API**
- Copy these values:
  - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
  - **anon/public** key → `SUPABASE_ANON_KEY`
  - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

## Node.js Version

This project requires **Node.js 20 or higher**. Configure this in Netlify:

1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Under **Build environment variables**, add:
   ```
   NODE_VERSION=20
   ```

Or add a `.nvmrc` file to your repository (already included):
```
20
```

## Build Settings

Ensure your Netlify build settings are:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Functions directory**: `netlify/functions` (if using Netlify Functions)

## Troubleshooting

### Error: "supabaseUrl is required"
- **Cause**: Missing `NEXT_PUBLIC_SUPABASE_URL` or `SUPABASE_ANON_KEY` environment variables
- **Solution**: Add both variables in Netlify environment settings (see above)

### Error: "Database connection failed"
- **Cause**: Incorrect `DATABASE_URL` or database not accessible
- **Solution**: Verify the connection string and ensure your Supabase project is active

### Error: "Failed to send email"
- **Cause**: Invalid `EMAIL_USER` or `EMAIL_APP_PASSWORD`
- **Solution**: 
  - Use Gmail App Password (not regular password)
  - Enable 2FA on your Google account first
  - Generate a new App Password

### Build succeeds but features don't work
- **Cause**: Environment variables not properly set
- **Solution**: 
  - Clear deploy cache in Netlify
  - Redeploy after adding all environment variables
  - Check browser console for client-side errors

## Security Notes

⚠️ **NEVER** commit `.env.local` or any file containing real credentials to git!

- `.env.local` is in `.gitignore` and should stay there
- Only commit `.env.example` with placeholder values
- The `SUPABASE_SERVICE_ROLE_KEY` has full admin access - keep it secret!
- The `JWT_SECRET` should be long and random (minimum 32 characters)

## Deployment Checklist

Before deploying to Netlify, verify:

- [ ] All environment variables added in Netlify dashboard
- [ ] Node.js version set to 20
- [ ] Database migrations run in Supabase
- [ ] Default admin user created (see `database/create_default_admin.sql`)
- [ ] Build succeeds locally: `npm run build`
- [ ] Test locally with production build: `npm start`

## Additional Resources

- [Netlify Environment Variables Documentation](https://docs.netlify.com/environment-variables/overview/)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase Documentation](https://supabase.com/docs)
