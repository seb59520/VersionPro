import { Router } from 'express';
import db from '../db.js';
import { z } from 'zod';

const router = Router();

// Validation schema
const settingsSchema = z.object({
  baseUrl: z.string().url(),
  maxReservationDays: z.number().int().min(1).max(90),
  minAdvanceHours: z.number().int().min(0).max(72),
  emailNotifications: z.object({
    newReservation: z.boolean(),
    posterRequest: z.boolean(),
  }),
});

// Get settings
router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
  res.json({
    baseUrl: settings.base_url,
    maxReservationDays: settings.max_reservation_days,
    minAdvanceHours: settings.min_advance_hours,
    emailNotifications: {
      newReservation: Boolean(settings.email_notifications_new_reservation),
      posterRequest: Boolean(settings.email_notifications_poster_request),
    },
  });
});

// Update settings
router.put('/', (req, res) => {
  try {
    const data = settingsSchema.parse(req.body);
    
    db.prepare(`
      UPDATE settings 
      SET base_url = ?,
          max_reservation_days = ?,
          min_advance_hours = ?,
          email_notifications_new_reservation = ?,
          email_notifications_poster_request = ?
      WHERE id = 1
    `).run(
      data.baseUrl,
      data.maxReservationDays,
      data.minAdvanceHours,
      data.emailNotifications.newReservation,
      data.emailNotifications.posterRequest
    );

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;