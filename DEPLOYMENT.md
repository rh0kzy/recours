# Deployment and Troubleshooting Guide

## Environment Variables Required

For the application to work properly on Netlify, you need to set the following environment variables in your Netlify dashboard:

### Required:
- `DATABASE_URL`: Your PostgreSQL database connection string
  - Format: `postgresql://username:password@hostname:port/database?ssl=true`

### Optional (for email notifications):
- `EMAIL_USER`: Gmail address for sending notifications
- `EMAIL_APP_PASSWORD`: Gmail app password (not your regular password)

## Database Setup

1. **First deployment**: After deploying to Netlify, visit:
   ```
   https://your-app.netlify.app/api/setup-database
   ```
   This will create the required database table and indexes.

2. **Verify database**: You can check if the database is working by visiting:
   ```
   https://your-app.netlify.app/api/admin/requests
   ```

## Common 500 Error Fixes

### 1. Missing Environment Variables
- Check Netlify dashboard → Site settings → Environment variables
- Ensure `DATABASE_URL` is set correctly
- Database URL should include SSL parameter: `?ssl=true`

### 2. Database Connection Issues
- Verify your database is accessible from external connections
- Check if your database provider allows connections from Netlify IPs
- Test database connection string manually

### 3. Database Table Missing
- Run the database setup endpoint: `/api/setup-database`
- Verify table exists in your database

### 4. Build Issues
- Check Netlify build logs for errors
- Ensure all dependencies are in package.json
- Verify Next.js version compatibility

## Testing Locally

1. Create `.env.local` file with your environment variables
2. Run: `npm run dev`
3. Test endpoints:
   - http://localhost:3000/
   - http://localhost:3000/admin

## Netlify Deployment Checklist

- [ ] Environment variables set in Netlify dashboard
- [ ] Database accessible from external connections
- [ ] Run database setup endpoint after first deployment
- [ ] Test form submission
- [ ] Test admin panel
- [ ] Check function logs in Netlify dashboard

## Monitoring

- Check Netlify function logs for errors
- Monitor database connection limits
- Set up error alerts for 500 errors

## Support

If you continue to experience issues:
1. Check Netlify function logs
2. Verify all environment variables
3. Test database connection manually
4. Check if specific endpoints are failing