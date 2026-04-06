// Alert model - using Supabase for storage
// Alerts are stored in Supabase PostgreSQL database

const Alert = {
  async findOne(query) {
    // This is a placeholder - actual implementation should use Supabase
    // Import supabase from '../config/supabase.js' in routes that need alerts
    console.warn('Alert.findOne called - implement using Supabase in your route handlers');
    return null;
  },

  async create(alertData) {
    // This is a placeholder - actual implementation should use Supabase
    console.warn('Alert.create called - implement using Supabase in your route handlers');
    return {
      _id: 'placeholder-id',
      ...alertData,
      save: async () => {},
      toObject: () => ({ _id: 'placeholder-id', ...alertData })
    };
  }
};

export default Alert;
