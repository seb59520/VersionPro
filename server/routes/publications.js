import { Router } from 'express';
import db from '../db.js';
import { z } from 'zod';

const router = Router();

// Validation schemas
const publicationSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  imageUrl: z.string().url(),
  category: z.string().min(1),
  isActive: z.boolean().default(true),
  minStock: z.number().int().min(0),
});

const stockUpdateSchema = z.object({
  quantity: z.number().int().min(0),
});

// Get all publications
router.get('/', (req, res) => {
  const publications = db.prepare('SELECT * FROM publications').all();
  res.json(publications);
});

// Create publication
router.post('/', (req, res) => {
  try {
    const data = publicationSchema.parse(req.body);
    const id = crypto.randomUUID();
    
    db.prepare(`
      INSERT INTO publications (
        id, title, description, image_url, 
        category, is_active, min_stock
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.title, data.description, data.imageUrl,
      data.category, data.isActive, data.minStock
    );

    res.status(201).json({ id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update publication stock
router.put('/:publicationId/stock/:standId', (req, res) => {
  try {
    const data = stockUpdateSchema.parse(req.body);
    
    db.prepare(`
      INSERT INTO publication_stocks (
        stand_id, publication_id, quantity, last_updated
      ) 
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(stand_id, publication_id) 
      DO UPDATE SET 
        quantity = excluded.quantity,
        last_updated = excluded.last_updated
    `).run(req.params.standId, req.params.publicationId, data.quantity);

    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;