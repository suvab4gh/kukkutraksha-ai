import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

try {
  // Check if Firebase credentials are properly configured
  if (
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.FIREBASE_PROJECT_ID !== 'your_project_id'
  ) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } else {
    console.warn('⚠️  Firebase credentials not configured. Authentication will be disabled.');
    console.warn('   Update FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/.env');
  }
} catch (error) {
  console.error('❌ Firebase Admin SDK initialization failed:', error.message);
  console.warn('   Authentication will be disabled. Please check your Firebase credentials.');
}

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
  // If Firebase is not initialized, skip authentication in development
  if (!firebaseInitialized) {
    console.warn('⚠️  Authentication bypassed - Firebase not configured');
    req.user = { uid: 'dev-user', email: 'dev@example.com' }; // Mock user for development
    return next();
  }

  try {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export { admin, verifyToken };
