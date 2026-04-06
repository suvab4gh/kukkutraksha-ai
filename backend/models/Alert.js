import { db } from '../config/firebase.js';

// Firebase Firestore Alert Helper Class
class AlertFirestore {
  static async findOne(query) {
    const alertsRef = db.collection('alerts');
    let snapshotQuery = alertsRef;

    // Build query
    if (query.farmId) {
      snapshotQuery = snapshotQuery.where('farmId', '==', query.farmId);
    }
    if (query.alertType) {
      snapshotQuery = snapshotQuery.where('alertType', '==', query.alertType);
    }
    if (query.isResolved !== undefined) {
      snapshotQuery = snapshotQuery.where('isResolved', '==', query.isResolved);
    }
    if (query.createdAt && query.createdAt.$gte) {
      // Note: Firestore doesn't support $gte directly, need to filter client-side for dates
      snapshotQuery = snapshotQuery.orderBy('createdAt', 'desc');
    }

    snapshotQuery = snapshotQuery.limit(1);
    const snapshot = await snapshotQuery.get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data();
    
    // Additional client-side filtering for date range
    if (query.createdAt && query.createdAt.$gte) {
      const createdAt = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
      if (createdAt < query.createdAt.$gte) return null;
    }

    return {
      _id: doc.id,
      ...data,
      toObject: () => ({ _id: doc.id, ...data })
    };
  }

  static async create(alertData) {
    const alertsRef = db.collection('alerts');
    const docRef = await alertsRef.add({
      ...alertData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    return {
      _id: docRef.id,
      ...alertData,
      save: async () => {}, // No-op for compatibility
      toObject: () => ({ _id: docRef.id, ...alertData })
    };
  }
}

const Alert = AlertFirestore;
export default Alert;
