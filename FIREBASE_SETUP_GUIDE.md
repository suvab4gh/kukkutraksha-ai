# Firebase Setup Guide for KukkutRaksha AI

This guide helps you configure Firebase as the sole backend infrastructure.

## 1. Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Name: `kukkutraksha-ai` (or your preferred unique name)
4. Disable Google Analytics (optional)
5. Click **Create Project**

## 2. Enable Services
### Authentication
- Go to **Build** > **Authentication**
- Click **Get Started**
- Enable **Email/Password** sign-in method

### Firestore Database
- Go to **Build** > **Firestore Database**
- Click **Create Database**
- Select **Start in Test Mode** (we will secure rules later)
- Choose a location closest to your physical farm
- Click **Enable**

### Cloud Functions (Required for AI Prediction)
- Go to **Build** > **Functions**
- Click **Get Started**
- **Note**: This requires upgrading to the **Blaze (Pay as you go)** plan.
  - *Don't worry*: The free tier includes 2 million invocations/month. You won't be charged unless you exceed this.
- Follow the setup prompts.

### Cloud Messaging (FCM)
- Enabled by default. Used for sending alerts.

## 3. Get Configuration Keys

### A. Service Account Key (For Backend)
1. Go to **Project Settings** (Gear icon)
2. Tab: **Service Accounts**
3. Click **Generate New Private Key**
4. A JSON file will download.
5. Rename it to `serviceAccountKey.json`
6. Move it to: `/workspace/backend/serviceAccountKey.json`
   - ⚠️ **Important**: This file contains secrets. Never commit it to Git.

### B. Web Config (For Frontend & ESP32)
1. Go to **Project Settings** (Gear icon)
2. Tab: **General**
3. Scroll to **Your apps**
4. Click the **Web icon (</>)**
5. App nickname: `KukkutRaksha Web`
6. Check "Also set up Firebase Hosting" (optional, can skip)
7. Click **Register App**
8. Copy the `firebaseConfig` object. It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "kukkutraksha-ai.firebaseapp.com",
     projectId: "kukkutraksha-ai",
     storageBucket: "kukkutraksha-ai.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

## 4. Update Environment Files

### Backend (.env)
Ensure `serviceAccountKey.json` is in the backend folder. No extra env vars needed for the key itself, but ensure `PROJECT_ID` matches.

### Frontend (.env.local)
Paste your config values:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### ESP32 (esp32_poultry_sensor.ino)
Update the `FIREBASE_CONFIG` struct with your Project ID and API Key.

## 5. Security Rules (Production Ready)
Once testing is done, update Firestore Rules in the console:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own farm data
    match /farms/{farmId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
    // Sensor data is append-only for devices, readable by owners
    match /sensor_data/{docId} {
      allow create: if request.auth != null; 
      allow read: if request.auth != null;
    }
  }
}
```

## Next Steps
1. Run `npm install` in both `backend` and `client` folders.
2. Start the backend: `cd backend && npm start`
3. Start the frontend: `cd client && npm start`
4. Test user registration and sensor data simulation.
