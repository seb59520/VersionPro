import { Router } from 'express';
import client from '../db.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const standSchema = z.object({
  name: z.string().min(1),
  location: z.string().min(1),
  currentPoster: z.string().optional(),
});

const reservationSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Get all stands
router.get('/', async (req, res) => {
  try {
    const stands = await client.execute('SELECT * FROM stands');
    const enrichedStands = await Promise.all(stands.rows.map(async stand => {
      const publications = await client.execute(
        'SELECT * FROM publication_stocks WHERE stand_id = ?',
        [stand.id]
      );
      const posterRequests = await client.execute(
        'SELECT * FROM poster_requests WHERE stand_id = ?',
        [stand.id]
      );
      return {
        ...stand,
        publications: publications.rows,
        posterRequests: posterRequests.rows
      };
    }));
    res.json(enrichedStands);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stand by ID
router.get('/:id', async (req, res) => {
  try {
    const stand = await client.execute('SELECT * FROM stands WHERE id = ?', [req.params.id]);
    if (!stand.rows.length) {
      return res.status(404).json({ error: 'Stand not found' });
    }
    res.json(stand.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create stand
router.post('/', async (req, res) => {
  try {
    const data = standSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    await client.execute(`
      INSERT INTO stands (id, name, location, current_poster, last_updated)
      VALUES (?, ?, ?, ?, datetime('now'))
    `, [id, data.name, data.location, data.currentPoster]);

    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update stand
router.put('/:id', async (req, res) => {
  try {
    const data = standSchema.parse(req.body);
    
    const result = await client.execute(`
      UPDATE stands 
      SET name = ?, location = ?, current_poster = ?, last_updated = datetime('now')
      WHERE id = ?
    `, [data.name, data.location, data.currentPoster, req.params.id]);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ error: 'Stand not found' });
    }

    res.json({ message: 'Stand updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Reserve stand
router.post('/:id/reserve', async (req, res) => {
  try {
    const data = reservationSchema.parse(req.body);
    
    const result = await client.execute(`
      UPDATE stands 
      SET is_reserved = 1, 
          reserved_by = ?, 
          reserved_until = ?,
          last_updated = datetime('now')
      WHERE id = ? AND is_reserved = 0
    `, [data.name, data.endDate, req.params.id]);

    if (result.rowsAffected === 0) {
      return res.status(400).json({ error: 'Stand is already reserved or not found' });
    }

    res.json({ message: 'Stand reserved successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel reservation
router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await client.execute(`
      UPDATE stands 
      SET is_reserved = 0, 
          reserved_by = NULL, 
          reserved_until = NULL,
          last_updated = datetime('now')
      WHERE id = ? AND is_reserved = 1
    `, [req.params.id]);

    if (result.rowsAffected === 0) {
      return res.status(400).json({ error: 'Stand is not reserved or not found' });
    }

    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;