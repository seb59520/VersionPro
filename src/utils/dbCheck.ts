import { createClient } from '@libsql/client';

const getClient = async () => {
  try {
    const client = createClient({
      url: import.meta.env.VITE_DATABASE_URL,
      authToken: import.meta.env.VITE_DATABASE_AUTH_TOKEN
    });
    
    // Test the connection
    await client.execute('SELECT 1');
    return client;
  } catch (error) {
    console.error('Error creating Turso client:', error);
    throw error;
  }
};

let dbClient: ReturnType<typeof createClient> | null = null;

export const checkDatabase = async () => {
  try {
    if (!dbClient) {
      dbClient = await getClient();
    }

    console.log('✅ Connexion à Turso établie');

    const tables = await dbClient.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);

    console.log('📊 Tables existantes:', tables.rows.map(row => row.name));

    for (const table of tables.rows) {
      const count = await dbClient.execute(`SELECT COUNT(*) as count FROM ${table.name}`);
      console.log(`📝 ${table.name}: ${count.rows[0].count} enregistrements`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à Turso:', error);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    if (!dbClient) {
      dbClient = await getClient();
    }

    await dbClient.batch([
      `CREATE TABLE IF NOT EXISTS stands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        current_poster TEXT,
        is_reserved BOOLEAN DEFAULT FALSE,
        reserved_by TEXT,
        reserved_until TEXT,
        last_updated TEXT NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS poster_requests (
        id TEXT PRIMARY KEY,
        stand_id TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        requested_poster TEXT NOT NULL,
        request_date TEXT NOT NULL,
        status TEXT NOT NULL,
        notes TEXT,
        FOREIGN KEY (stand_id) REFERENCES stands(id)
      )`,

      `CREATE TABLE IF NOT EXISTS posters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      )`,

      `CREATE TABLE IF NOT EXISTS publications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        min_stock INTEGER NOT NULL
      )`,

      `CREATE TABLE IF NOT EXISTS publication_stocks (
        stand_id TEXT NOT NULL,
        publication_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        last_updated TEXT NOT NULL,
        PRIMARY KEY (stand_id, publication_id),
        FOREIGN KEY (stand_id) REFERENCES stands(id),
        FOREIGN KEY (publication_id) REFERENCES publications(id)
      )`,

      `CREATE TABLE IF NOT EXISTS maintenance_history (
        id TEXT PRIMARY KEY,
        stand_id TEXT NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        description TEXT NOT NULL,
        issues TEXT,
        resolution TEXT,
        FOREIGN KEY (stand_id) REFERENCES stands(id)
      )`,

      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`
    ]);

    console.log('✅ Base de données initialisée avec succès');
    return true;
  } catch (error) {
    console.error('❌ Erreur d\'initialisation de la base de données:', error);
    return false;
  }
};