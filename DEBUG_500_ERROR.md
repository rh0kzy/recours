# Debugging Guide for 500 Server Error on /api/admin/requests

## Step-by-Step Debugging Process

### 1. Check Environment Variables in Netlify
1. Go to your Netlify dashboard
2. Navigate to: Site settings → Environment variables
3. Verify that `DATABASE_URL` is set and contains a valid PostgreSQL connection string
4. The format should be: `postgresql://username:password@hostname:port/database?ssl=true`

### 2. Test Database Connection
After deploying the updated code, test the database connection:
```
https://usthbrecours.netlify.app/api/test-db-connection
```

This endpoint will return detailed information about:
- Database connection status
- Whether the requests table exists
- Table structure and row count
- Any connection errors

### 3. Initialize Database (if needed)
If the database connection works but the table doesn't exist:
```
https://usthbrecours.netlify.app/api/setup-database
```

This will create the required table and indexes.

### 4. Check Netlify Function Logs
1. Go to Netlify dashboard
2. Navigate to: Functions → admin-requests
3. Check the function logs for detailed error messages
4. Look for specific error codes and messages

### 5. Test the Admin Requests Endpoint
After fixing any database issues:
```
https://usthbrecours.netlify.app/api/admin/requests
```

## Common Issues and Solutions

### Issue 1: Missing DATABASE_URL
**Symptoms:** Function returns "Database configuration missing"
**Solution:** Set the DATABASE_URL environment variable in Netlify

### Issue 2: Database Connection Refused
**Symptoms:** Connection timeout or refused errors
**Solution:** 
- Verify database server is accessible from external connections
- Check if your database provider (Heroku, Supabase, etc.) allows external connections
- Ensure the connection string includes `?ssl=true`

### Issue 3: Table Doesn't Exist
**Symptoms:** "relation 'requests' does not exist"
**Solution:** Run the database setup endpoint to create the table

### Issue 4: Column Mismatch
**Symptoms:** "column does not exist" errors
**Solution:** The improved function now uses COALESCE for optional columns

### Issue 5: SSL/TLS Certificate Issues
**Symptoms:** SSL certificate errors
**Solution:** Ensure `ssl: { rejectUnauthorized: false }` in the connection config

## Enhanced Error Handling

The updated code now includes:
- ✅ Detailed error logging with PostgreSQL error codes
- ✅ Environment variable validation
- ✅ Table existence checking
- ✅ Column validation and safe handling
- ✅ Graceful degradation for missing data
- ✅ Frontend retry mechanism with exponential backoff
- ✅ Better user feedback and error messages

## Testing Locally

To test the functions locally:
1. Create `.env.local` with your DATABASE_URL
2. Run: `npm run dev`
3. Test endpoints:
   - http://localhost:3000/api/test-db-connection
   - http://localhost:3000/api/admin/requests

## Monitoring and Alerts

Set up monitoring for:
- Function execution duration
- Error rates
- Database connection pool usage
- Memory usage

## Quick Fixes Checklist

- [ ] DATABASE_URL environment variable is set in Netlify
- [ ] Database allows external connections
- [ ] Connection string includes SSL parameters
- [ ] Requests table exists (run setup-database endpoint)
- [ ] Function logs show specific error details
- [ ] Test database connection endpoint works
- [ ] Check for any quota/connection limits on your database provider

## Next Steps After Deployment

1. Deploy the updated code to Netlify
2. Test the database connection endpoint
3. Run database setup if needed
4. Test the admin requests endpoint
5. Check function logs for any remaining issues
6. Monitor the application for continued stability