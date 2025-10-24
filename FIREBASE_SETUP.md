# Firebase Setup Guide

## Step 1: Create Firebase Project

1. Visit: https://console.firebase.google.com/
2. Click **"Add project"**
3. Project name: `poultry-monitoring`
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

## Step 2: Enable Email/Password Authentication

1. In left sidebar → **Authentication**
2. Click **"Get started"**
3. Tab: **"Sign-in method"**
4. Enable: **"Email/Password"**
5. Click **"Save"**

---

## Step 3: Get Web App Configuration

1. Click gear icon ⚙️ → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click web icon **`</>`**
4. App nickname: `poultry-web`
5. **Copy the config object** (looks like below)

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "poultry-monitoring.firebaseapp.com",
  projectId: "poultry-monitoring",
  storageBucket: "poultry-monitoring.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

---

## Step 4: Update Frontend `.env.local`

In the **root directory** of the project, update `.env.local`:

```env
# Firebase Configuration (from Step 3)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=poultry-monitoring.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=poultry-monitoring
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=poultry-monitoring.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# MQTT Configuration (set up later)
NEXT_PUBLIC_MQTT_BROKER_URL=wss://your-hivemq-broker.com:8884/mqtt
NEXT_PUBLIC_MQTT_USERNAME=your_username
NEXT_PUBLIC_MQTT_PASSWORD=your_password
```

---

## Step 5: Get Firebase Admin SDK Private Key

1. In Firebase Console → **Project settings**
2. Tab: **"Service accounts"**
3. Click **"Generate new private key"**
4. Click **"Generate key"** (downloads JSON file)
5. Open the JSON file and find these values:
   - `project_id`
   - `client_email`
   - `private_key`

---

## Step 6: Update Backend `.env`

In `backend/.env` file:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/poultry-monitoring?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# Firebase Admin SDK (from Step 5 JSON file)
FIREBASE_PROJECT_ID=poultry-monitoring
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@poultry-monitoring.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Long-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# HiveMQ MQTT Broker (set up later)
MQTT_BROKER_URL=mqtt://your-hivemq-broker.com:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password
MQTT_TOPIC=poultry/sensors/#

# CORS Origin
CORS_ORIGIN=http://localhost:3000

# Proximity Alert Distance (km)
ALERT_RADIUS_KM=5
```

**Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters in the private key (they represent newlines)
- Never commit the `.env` files to Git (they're in `.gitignore`)

---

## Step 7: Test the Setup

### Start Backend Server:
```bash
cd backend
npm run dev
```

Should see:
```
✓ Firebase Admin initialized successfully
✓ MongoDB connected
✓ Server running on port 5000
```

### Start Frontend:
```bash
npm run dev
```

Should see:
```
✓ Ready on http://localhost:3000
```

### Test Authentication:

1. Go to: http://localhost:3000/auth/login?type=farmer
2. Click **"Don't have an account? Register"**
3. Fill in the form:
   - Email: `test@farm.com`
   - Password: `Test1234`
   - Real ID: `123456789012`
   - Farm Name: `Test Farm`
   - Latitude: `22.5726`
   - Longitude: `88.3639`
4. Click **"Create Account"**

If successful, you'll be redirected to the farmer dashboard!

---

## Quick Test (Bypass Firebase)

If you just want to test the UI without Firebase setup:

Go to: http://localhost:3000/test

This bypasses authentication and takes you straight to the dashboard with mock data.

---

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check that `NEXT_PUBLIC_FIREBASE_API_KEY` is correct
- Make sure there are no extra spaces or quotes

### Error: "Firebase Admin not initialized"
- Check `FIREBASE_PRIVATE_KEY` has quotes around it
- Check that `\n` characters are present in the private key
- Verify project_id and client_email are correct

### Error: "Network error" during registration
- Make sure backend server is running on port 5000
- Check `NEXT_PUBLIC_API_URL=http://localhost:5000` in `.env.local`
- Verify CORS is enabled in backend

### Can't see typed text in input fields
- This was fixed! Text should now be visible in black color
- Password field has a show/hide toggle (eye icon)

---

## Alternative: Skip Firebase Setup

If you want to avoid Firebase complexity, we can replace it with custom JWT authentication. Let me know if you'd prefer that approach!

---

## Next Steps After Firebase Setup

1. ✅ Set up MongoDB Atlas (for database)
2. ✅ Set up HiveMQ Cloud (for MQTT broker)
3. ✅ Deploy backend to Railway/Render
4. ✅ Deploy frontend to Vercel

See `DEPLOYMENT.md` for deployment instructions.
