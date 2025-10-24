# 🔓 Bypass Login Guide

## Three Ways to Bypass Login (Farmer & Admin)

### ✅ Method 1: Direct Access Pages (Recommended)

#### 👨‍🌾 Farmer Auto-Login
Visit: **`http://localhost:3000/test`**

This will:
- Auto-login as "Test Farmer"
- Set authentication state in Zustand store
- Store user data in localStorage
- Redirect to `/farmer/dashboard`

#### 👨‍💼 Admin Auto-Login
Visit: **`http://localhost:3000/test-admin`**

This will:
- Auto-login as "Test Admin"
- Set authentication state in Zustand store
- Store user data in localStorage
- Redirect to `/admin/dashboard`

---

### ✅ Method 2: Use Without MongoDB (Current Setup)

Since Firebase credentials are not configured, authentication is **already bypassed**!

#### For Farmers:
1. Go to `http://localhost:3000/auth/login?type=farmer`
2. Enter ANY email and password
3. The backend will use a mock user: `{ uid: 'dev-user', email: 'dev@example.com' }`
4. You'll be redirected to the farmer dashboard

#### For Admins:
1. Go to `http://localhost:3000/auth/login?type=admin`
2. Enter ANY email and password
3. The backend will use a mock user
4. You'll be redirected to the admin dashboard

**No actual authentication happens!**

---

### ✅ Method 3: Seed Test Database

If you want realistic test data with multiple farms:

#### Step 1: Make sure MongoDB is configured
Edit `backend/.env`:
```env
MONGODB_URI=mongodb+srv://your-connection-string
```

Or use local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/poultry-monitoring
```

#### Step 2: Run the seed script
```bash
cd backend
node seed-test-data.js
```

This creates:

**1 Admin Account:**
- **Test Admin**
  - Email: `admin@test.com`
  - User ID: test-admin-1
  - Full access to all farms

**3 Farmer Accounts:**
1. **Green Valley Poultry Farm** (Safe status)
   - Email: `farmer1@test.com`
   - District: North 24 Parganas
   - Real ID: TEST123456789

2. **Sunrise Poultry Farm** (Warning status)
   - Email: `farmer2@test.com`
   - District: Howrah
   - Real ID: TEST987654321

3. **Golden Egg Farm** (Safe status)
   - Email: `farmer3@test.com`
   - District: Kolkata
   - Real ID: TEST555666777

Each farm includes:
- ✓ 24 hours of historical sensor data
- ✓ Current readings
- ✓ Alerts (for warning status farms)

#### Step 3: Access the dashboard
Since authentication is bypassed, use ANY email/password to login!

---

## 🔧 Manual URL Access

You can directly access any page by URL:

```bash
# Home page
http://localhost:3000/

# Auto-login as Farmer
http://localhost:3000/test

# Auto-login as Admin
http://localhost:3000/test-admin

# Farmer dashboard (might need mock user in store)
http://localhost:3000/farmer/dashboard

# Admin dashboard
http://localhost:3000/admin/dashboard

# Login pages
http://localhost:3000/auth/login?type=farmer
http://localhost:3000/auth/login?type=admin
```

---

## 📝 Testing Without Real Data

If you don't want to set up MongoDB, the app will still work but:
- ❌ No farm data will load
- ❌ No sensor data will display
- ❌ API calls will fail gracefully
- ✅ UI components will still render
- ✅ You can test the frontend design

---

## 🔐 Backend Authentication Status

Check backend console output:
```
⚠️  Firebase credentials not configured. Authentication will be disabled.
⚠️  Authentication bypassed - Firebase not configured
```

These warnings mean **login is already bypassed**!

---

## 🚀 Quick Start (No Setup Required)

1. **Start backend**: `cd backend && npm run dev`
2. **Start frontend**: `npm run dev`
3. **Choose your role**:
   - **Farmer**: Visit `http://localhost:3000/test`
   - **Admin**: Visit `http://localhost:3000/test-admin`
4. **Done!** You'll be auto-logged in and redirected to the dashboard

---

## 📊 View Backend Health

Check if services are running:
```
http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Poultry Disease Monitoring API is running",
  "timestamp": "2025-10-24T12:00:00.000Z"
}
```

---

## 🎯 Current Tech Stack (October 2025)

- **Next.js**: 16.0.0 with Turbopack
- **React**: 19.2.0
- **TypeScript**: 5.9.3
- **Node.js**: 25.0.0
- **TailwindCSS**: 4.1.16
- **Firebase**: 11.0.1
- **MongoDB**: 8.8.4

All authentication is **bypassed by default** for development! 🎉
