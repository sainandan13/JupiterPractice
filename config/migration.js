const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Meghalaya',  // PostgreSQL database name
    password: 'root',
    port: 5432,
});

const runMigrations = async () => {
    const client = await pool.connect();
    try {
        console.log('🔄 Running database migrations...');

        // Start transaction
        await client.query('BEGIN');

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                                                 id SERIAL PRIMARY KEY,
                                                 name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(50) NOT NULL
                );
        `);

        // Create patients table
        await client.query(`
            CREATE TABLE IF NOT EXISTS patients (
                                                    id SERIAL PRIMARY KEY,
                                                    first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                abha_number VARCHAR(50) UNIQUE NOT NULL,
                gender VARCHAR(10),
                dob DATE,
                phone VARCHAR(20),
                email VARCHAR(255),
                address TEXT,
                medical_history TEXT[]
                );
        `);

        // Create opd_visits table (before orders, since orders references it)
        await client.query(`
            CREATE TABLE IF NOT EXISTS opd_visits (
                                                      id SERIAL PRIMARY KEY,
                                                      patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
                doctor_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                chief_complaint TEXT,
                vitals JSONB NOT NULL,
                diagnosis TEXT,
                comments TEXT,
                follow_up_instructions TEXT
                );
        `);

        // Create order_sets table
        await client.query(`
            CREATE TABLE IF NOT EXISTS order_sets (
                                                      id SERIAL PRIMARY KEY,
                                                      name VARCHAR(255) NOT NULL,
                order_type VARCHAR(50) CHECK (order_type IN ('medication', 'lab', 'radiology')),
                diagnosis VARCHAR(255),
                items JSONB NOT NULL,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
                );
        `);

        // Create orders table (after opd_visits because it references it)
        await client.query(`
            CREATE TABLE IF NOT EXISTS orders (
                                                  id SERIAL PRIMARY KEY,
                                                  patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
                visit_id INTEGER REFERENCES opd_visits(id) ON DELETE SET NULL,
                ordered_by INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                order_type VARCHAR(50) CHECK (order_type IN ('medication', 'lab', 'radiology')) NOT NULL,
                items JSONB NOT NULL,
                status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        // Create notifications table
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                                                         id SERIAL PRIMARY KEY,
                                                         user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
        `);

        // Commit transaction
        await client.query('COMMIT');

        console.log('✅ Database migrations completed successfully!');
    } catch (error) {
        // Rollback if there’s an error
        await client.query('ROLLBACK');
        console.error('❌ Error running migrations:', error);
    } finally {
        client.release();
    }
};

// Run migrations
runMigrations();

module.exports = pool;
