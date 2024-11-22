import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.DATABASE_URL || 'file:local.db',
});

export async function initializeDatabase() {
  try {
    // Create tables
    await client.execute(`
      CREATE TABLE IF NOT EXISTS stands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        current_poster TEXT,
        is_reserved BOOLEAN DEFAULT FALSE,
        reserved_by TEXT,
        reserved_until TEXT,
        last_updated TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS poster_requests (
        id TEXT PRIMARY KEY,
        stand_id TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        requested_poster TEXT NOT NULL,
        request_date TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (stand_id) REFERENCES stands(id)
      );

      CREATE TABLE IF NOT EXISTS posters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      );

      CREATE TABLE IF NOT EXISTS publications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        min_stock INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS publication_stocks (
        stand_id TEXT NOT NULL,
        publication_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        last_updated TEXT NOT NULL,
        PRIMARY KEY (stand_id, publication_id),
        FOREIGN KEY (stand_id) REFERENCES stands(id),
        FOREIGN KEY (publication_id) REFERENCES publications(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        base_url TEXT NOT NULL,
        max_reservation_days INTEGER NOT NULL,
        min_advance_hours INTEGER NOT NULL,
        email_notifications_new_reservation BOOLEAN DEFAULT TRUE,
        email_notifications_poster_request BOOLEAN DEFAULT TRUE
      );
    `);

    // Insert default settings if not exists
    const settings = await client.execute('SELECT * FROM settings WHERE id = 1');
    if (!settings.rows.length) {
      await client.execute(`
        INSERT INTO settings (
          id, base_url, max_reservation_days, min_advance_hours,
          email_notifications_new_reservation, email_notifications_poster_request
        ) VALUES (
          1, 'https://presentoirs.example.com/stand/', 30, 24, 1, 1
        )
      `);
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export default client;