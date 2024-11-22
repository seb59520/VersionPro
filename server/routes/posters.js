import { Router } from 'express';
import db from '../db.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const posterSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().url(),
  category: z.string().min(1),
  isActive: z.boolean().default(true),
});

const posterRequestSchema = z.object({
  requestedBy: z.string().min(1),
  requestedPoster: z.string().min(1),
  notes: z.string().optional(),
});

// Get all posters
router.get('/', (req, res) => {
  const posters = db.prepare('SELECT * FROM posters').all();
  res.json(posters);
});

// Create poster
router.post('/', (req, res) => {
  try {
    const data = posterSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO posters (id, name, description, image_url, category, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.description, data.imageUrl, data.category, data.isActive);

    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Create poster request
router.post('/:standId/request', (req, res) => {
  try {
    const data = posterRequestSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO poster_requests (
        id, stand_id, requested_by, requested_poster, 
        request_date, status, notes
      )
      VALUES (?, ?, ?, ?, datetime('now'), 'pending', ?)
    `).run(id, req.params.standId, data.requestedBy, data.requestedPoster, data.notes);

    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update poster request status
router.put('/request/:id/status', (req, res) => {
  const { status } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const result = db.prepare(`
    UPDATE poster_requests 
    SET status = ?
    WHERE id = ?
  `).run(status, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Poster request not found' });
  }

  if (status === 'approved') {
    const request = db.prepare('SELECT * FROM poster_requests WHERE id = ?').get(req.params.id);
    db.prepare(`
      UPDATE stands 
      SET current_poster = ?, 
          last_updated = datetime('now')
      WHERE id = ?
    `).run(request.requested_poster, request.stand_id);
  }

  res.json({ message: 'Poster request updated successfully' });
});

export default router;