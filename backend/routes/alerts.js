import express from 'express';
const router = express.Router();
import { supabase } from '../config/supabase.js';
import { verifyToken } from '../middleware/auth.js';

// Get alerts for a farm
router.get('/farm/:farmId', verifyToken, async (req, res) => {
  try {
    const { limit = 50, unreadOnly = false } = req.query;

    let query = supabase
      .from('alerts')
      .select('*')
      .eq('farm_id', req.params.farmId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (unreadOnly === 'true') {
      query = query.eq('is_read', false);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Get all alerts (admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 100, severity, alertType } = req.query;

    let query = supabase
      .from('alerts')
      .select('*, farms(farm_name, district, location)')
      .order('created_at', { ascending: false })
      .limit(parseInt(limit));

    if (severity) query = query.eq('severity', severity);
    if (alertType) query = query.eq('alert_type', alertType);

    const { data: alerts, error } = await query;

    if (error) throw error;

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching all alerts:', error);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Mark alert as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const { data: alert, error } = await supabase
      .from('alerts')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Resolve alert
router.patch('/:id/resolve', verifyToken, async (req, res) => {
  try {
    const { data: alert, error } = await supabase
      .from('alerts')
      .update({
        is_resolved: true,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error || !alert) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json(alert);
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// Get alert statistics
router.get('/stats/summary', verifyToken, async (req, res) => {
  try {
    const { farmId } = req.query;

    // Fetch all alerts and calculate stats client-side
    // (In production, use a Postgres function for better performance)
    let query = supabase.from('alerts').select('severity, is_read');

    if (farmId) {
      query = query.eq('farm_id', farmId);
    }

    const { data: alerts, error } = await query;

    if (error) throw error;

    const summary = {
      low: { total: 0, unread: 0 },
      medium: { total: 0, unread: 0 },
      high: { total: 0, unread: 0 },
      critical: { total: 0, unread: 0 },
    };

    alerts.forEach((alert) => {
      if (summary[alert.severity]) {
        summary[alert.severity].total++;
        if (!alert.is_read) {
          summary[alert.severity].unread++;
        }
      }
    });

    res.json(summary);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ error: 'Failed to fetch alert statistics' });
  }
});

// Delete old resolved alerts
router.delete('/cleanup', verifyToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('alerts')
      .delete()
      .eq('is_resolved', true)
      .lt('resolved_at', cutoffDate)
      .select();

    if (error) throw error;

    res.json({
      message: 'Cleanup completed',
      deletedCount: data.length,
    });
  } catch (error) {
    console.error('Error cleaning up alerts:', error);
    res.status(500).json({ error: 'Failed to cleanup alerts' });
  }
});

export default router;
