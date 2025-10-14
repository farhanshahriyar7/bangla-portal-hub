# Migration Guide: Moving to Your Own Supabase Account

## Step 1: Create Your Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account
3. Create a new project
4. Wait for the project to finish provisioning (~2 minutes)

## Step 2: Run the Database Schema

1. In your new Supabase project, go to **SQL Editor**
2. Open the `SUPABASE_EXPORT.sql` file from this project
3. Copy and paste the entire SQL script
4. Click **Run** to execute it
5. Verify all tables were created by checking the **Table Editor**

## Step 3: Export Your Current Data

Since you're using Lovable Cloud, you'll need to export your data manually:

### Export Profiles Data
```sql
-- Run this in your current Lovable Cloud SQL Editor
SELECT * FROM public.profiles;
```
Copy the results and save as CSV.

### Export Office Information Data
```sql
-- Run this in your current Lovable Cloud SQL Editor
SELECT * FROM public.office_information;
```
Copy the results and save as CSV.

### Export User Roles Data
```sql
-- Run this in your current Lovable Cloud SQL Editor
SELECT * FROM public.user_roles;
```
Copy the results and save as CSV.

## Step 4: Import Data to New Supabase

1. Go to **Table Editor** in your new Supabase project
2. For each table:
   - Click the table name
   - Click **Insert** → **Import from CSV**
   - Upload your CSV file
   - Map the columns correctly
   - Click **Import**

## Step 5: Download Storage Files

You'll need to manually download and re-upload files from storage:

1. **Access current storage**:
   - Go to your Lovable Cloud backend
   - Navigate to Storage → passport-photos
   - Download all files
   - Navigate to Storage → id-proofs
   - Download all files

2. **Upload to new storage**:
   - In your new Supabase project, go to Storage
   - Upload files to their respective buckets
   - Maintain the same folder structure: `{user_id}/filename`

## Step 6: Update Your Frontend Code

Update environment variables in your project:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
```

**Where to find these values:**
- Go to your Supabase project
- Click **Settings** → **API**
- Copy the **Project URL** and **anon public** key

## Step 7: Configure Supabase Auth Settings

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Go to **Authentication** → **URL Configuration**
4. Set:
   - **Site URL**: Your app's production URL (or localhost for testing)
   - **Redirect URLs**: Add `http://localhost:8080/**` for local testing

5. Go to **Authentication** → **Settings**
6. **For testing**: Disable "Enable email confirmations" (enable for production!)

## Step 8: Create Your First Admin User

After migrating, you'll need to create an admin user:

1. Register a new user in your app
2. Get their user ID from the Supabase dashboard (**Authentication** → **Users**)
3. Run this SQL in the SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('PASTE_USER_ID_HERE', 'admin');
```

## Step 9: Test Everything

1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Test profile creation
4. ✅ Test file uploads (passport photos, ID proofs)
5. ✅ Test office information creation
6. ✅ Test admin verification features

## Common Issues

### Issue: "requested path is invalid" when logging in
**Fix**: Make sure Site URL and Redirect URLs are configured correctly in Auth settings.

### Issue: Can't see uploaded images
**Fix**: Check that storage buckets were created and policies are active. Run the storage policies section of SUPABASE_EXPORT.sql again.

### Issue: "new row violates row-level security policy"
**Fix**: Make sure you're logged in and the user's auth.uid() matches the user_id in the tables.

### Issue: Can't update verification status
**Fix**: Make sure your user has the 'admin' role in the user_roles table.

## What About Edge Functions?

If your app uses any edge functions, you'll need to deploy them separately:

1. Install Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref YOUR_PROJECT_ID`
3. Deploy functions: `supabase functions deploy`

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the Supabase logs in your dashboard for detailed error messages

## Important Notes

⚠️ **Remember**: This project will still be connected to Lovable Cloud. These files are just for your reference to migrate to your own Supabase account. You'll need to maintain the new Supabase project separately.

⚠️ **Security**: Don't forget to:
- Enable email confirmation in production
- Set up proper backup policies
- Configure SSL/HTTPS for production
- Review all RLS policies before going live