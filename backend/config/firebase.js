import admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
let db;
let auth;

try {
  // Check if service account key exists
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  
  // For production/render deployment, use environment variables
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase initialized (from env variable)');
  } 
  // For local development, use the JSON file
  else {
    const serviceAccount = await import(serviceAccountPath, { assert: { type: 'json' } });
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount.default),
    });
    console.log('✅ Firebase initialized (from serviceAccountKey.json)');
  }

  db = admin.firestore();
  auth = admin.auth();
  
  console.log('🔥 Firestore and Auth services ready');
  
} catch (error) {
  console.warn('⚠️  Firebase not configured properly. Features will be limited.');
  console.warn('   Place serviceAccountKey.json in backend/ folder OR set FIREBASE_SERVICE_ACCOUNT env var');
  console.warn('   Error:', error.message);
  
  // Create mock objects for development without crashing
  db = {
    collection: () => ({
      doc: () => ({
        set: async () => {},
        get: async () => ({ exists: false, data: () => null }),
        update: async () => {},
        delete: async () => {}
      }),
      add: async () => ({ id: 'mock-id' }),
      where: () => ({
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [], empty: true })
          })
        }),
        get: async () => ({ docs: [], empty: true })
      })
    })
  };
  
  auth = {
    createUser: async () => ({ uid: 'mock-uid' }),
    getUser: async () => ({ uid: 'mock-uid', email: 'mock@example.com' }),
    verifyIdToken: async (token) => ({ uid: 'mock-uid', email: 'mock@example.com' })
  };
}

export { db, auth, admin };
