# 🚀 Supabase Setup Guide for KukkutRaksha AI

## 📋 Prerequisites
- Supabase account (https://supabase.com)
- Project repository cloned locally

## Step 1: Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in:
   - **Name**: kukkutraksha-ai (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai/Asia South)
   - **Pricing Plan**: Free tier is fine to start
4. Click **"Create new project"** (takes ~2 minutes)

## Step 2: Run Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql` from your project
4. Paste into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`
6. Wait for success message: "Success. No rows returned"

### What this creates:
✅ 7 tables: profiles, farms, sensor_data, alerts, tasks, incidents, iot_devices
✅ Indexes for fast queries
✅ Row Level Security (RLS) policies
✅ Auto-update triggers for timestamps
✅ PostGIS extension for location data

## Step 3: Get API Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT**: 
- `anon key` = Safe for frontend (public)
- `service_role key` = NEVER expose to frontend (backend only)

## Step 4: Configure Environment Variables

### Frontend (.env.local)
Create/update `.env.local` in project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# MQTT Configuration
NEXT_PUBLIC_MQTT_HOST=your-hivemq-host.com
NEXT_PUBLIC_MQTT_PORT=8884
NEXT_PUBLIC_MQTT_USERNAME=your_mqtt_username
NEXT_PUBLIC_MQTT_PASSWORD=your_mqtt_password
```

### Backend (.env)
Create/update `backend/.env`:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server Configuration
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# MQTT Configuration
MQTT_BROKER_URL=mqtt://your-hivemq-host.com:1883
MQTT_USERNAME=your_mqtt_username
MQTT_PASSWORD=your_mqtt_password
MQTT_TOPIC=poultry/sensors/#
```

## Step 5: Configure Vercel (Production)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_MQTT_HOST = your-hivemq-host.com
NEXT_PUBLIC_MQTT_PORT = 8884
NEXT_PUBLIC_MQTT_USERNAME = your_mqtt_username
NEXT_PUBLIC_MQTT_PASSWORD = your_mqtt_password
NEXT_PUBLIC_API_URL = https://your-backend-url.com
```

4. Redeploy your application

## Step 6: Test the Setup

### Test Frontend Connection:
```bash
npm run dev
```

Check browser console for:
- No Supabase connection errors
- Successful auth initialization

### Test Backend Connection:
```bash
cd backend
npm start
```

Check terminal for:
```
✅ Supabase client created successfully
📊 Database: PostgreSQL with TimescaleDB capabilities
🔐 Auth: Supabase Authentication enabled
```

## Step 7: Create Admin User (Optional)

1. Sign up a user through your app's signup page
2. Go to Supabase Dashboard → **Authentication** → **Users**
3. Find your user, click on it
4. Go to **SQL Editor** and run:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

Now that user has admin access!

## 🔒 Security Best Practices

### ✅ DO:
- Use `NEXT_PUBLIC_*` prefix for frontend variables
- Keep `service_role key` in backend only
- Enable RLS on all tables (already done in schema)
- Regularly update Supabase password
- Use environment variables, never hardcode keys

### ❌ DON'T:
- Commit `.env` or `.env.local` to Git
- Expose `service_role key` to frontend
- Disable Row Level Security
- Use same credentials for dev and production

## 📊 Database Structure

### Tables Created:
1. **profiles** - User accounts and roles
2. **farms** - Farm information and registration
3. **sensor_data** - IoT sensor readings (time-series)
4. **alerts** - Disease warnings and notifications
5. **tasks** - Farm management tasks
6. **incidents** - Disease outbreak records
7. **iot_devices** - Device registry

### Row Level Security (RLS):
- ✅ Farmers can only see their own data
- ✅ Admins can see all data
- ✅ Service role (backend) can insert sensor data
- ✅ All queries are automatically filtered

## 🛠️ Maintenance

### Clean Old Sensor Data (Run monthly):
```sql
CALL cleanup_old_sensor_data();
```
This removes sensor data older than 90 days.

### Monitor Database Size:
1. Go to **Settings** → **Database**
2. Check storage usage
3. Free tier: 500 MB

### View Real-time Data:
1. Go to **Table Editor** (left sidebar)
2. Select a table (e.g., `sensor_data`)
3. View and edit data directly

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"
- ✅ Check `.env.local` has correct variable names with `NEXT_PUBLIC_` prefix
- ✅ Restart dev server after adding env vars

### Error: "Invalid API key"
- ✅ Verify you copied the full key (very long string)
- ✅ Check for extra spaces or line breaks
- ✅ Make sure using `anon key` for frontend, `service_role key` for backend

### Error: "row-level security policy"
- ✅ Make sure you ran the complete `supabase-schema.sql`
- ✅ Check user is authenticated (logged in)
- ✅ Verify RLS policies were created

### Database not visible in Table Editor:
- ✅ Refresh the page
- ✅ Check SQL query ran successfully
- ✅ Look in "public" schema dropdown

## 📚 Additional Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [PostGIS (Location Data)](https://postgis.net/docs/)

## ✅ Checklist

- [ ] Supabase project created
- [ ] `supabase-schema.sql` executed successfully
- [ ] API credentials copied
- [ ] Frontend `.env.local` configured
- [ ] Backend `.env` configured
- [ ] Vercel environment variables added
- [ ] Local dev server runs without errors
- [ ] First user account created
- [ ] Admin role assigned (if needed)
- [ ] Test authentication works
- [ ] Test data queries work

---

🎉 **Setup Complete!** Your Supabase database is ready for KukkutRaksha AI!
