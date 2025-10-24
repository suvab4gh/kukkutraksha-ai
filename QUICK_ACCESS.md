# 🚀 Quick Access URLs

## Instant Access (No Authentication Required)

### 👨‍🌾 Farmer Access
```
http://localhost:3000/test
```
- ✅ Auto-login as Test Farmer
- ✅ Redirects to farmer dashboard
- ✅ No credentials needed

### 👨‍💼 Admin Access
```
http://localhost:3000/test-admin
```
- ✅ Auto-login as Test Admin
- ✅ Redirects to admin dashboard
- ✅ View all farms across West Bengal

---

## Other URLs

### Home Page
```
http://localhost:3000/
```
- Select Farmer or Admin role
- Click "Quick Test Login" links for instant access

### Login Pages (Auth Bypassed)
```
Farmer: http://localhost:3000/auth/login?type=farmer
Admin:  http://localhost:3000/auth/login?type=admin
```
Enter ANY email/password - authentication is disabled!

### Backend Health Check
```
http://localhost:5000/health
```

---

## 📊 Seed Database (Optional)

For realistic test data with 3 farms and sensor readings:

```bash
cd backend
node seed-test-data.js
```

Creates:
- 1 admin account (admin@test.com)
- 3 farmer accounts with different statuses
- 24 hours of sensor data per farm
- Automated alerts

---

## ✨ Current Status

✅ **Backend**: Running on port 5000  
✅ **Frontend**: Running on port 3000  
✅ **Authentication**: BYPASSED (Firebase not configured)  
✅ **Latest Tech Stack**: Next.js 16, React 19, TypeScript 5.9, Node.js 25

**Just visit the URLs above - no setup required!** 🎉
