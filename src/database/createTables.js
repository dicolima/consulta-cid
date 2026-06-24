const pool = require("../config/database");

async function createTables() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cids (
            cid_id SERIAL PRIMARY KEY,
            code VARCHAR(20) UNIQUE NOT NULL,
            formatted_code VARCHAR(20),
            description TEXT NOT NULL,
            short_description TEXT,
            type VARCHAR(30) NOT NULL,
            classification VARCHAR(100),
            sex_restriction VARCHAR(50),
            death_cause VARCHAR(50),
            source VARCHAR(100) DEFAULT 'DATASUS',
            version VARCHAR(100) DEFAULT 'CID-10 DATASUS',
            raw_data JSONB,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_cids_code
        ON cids (code);
    `);

    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_cids_description
        ON cids USING gin (to_tsvector('portuguese', description));
    `);

    console.log("Tabela cids criada/verificada com sucesso.");
}

module.exports = createTables;

if (require.main === module) {
    createTables()
        .catch((error) => {
            console.error("Erro ao criar tabelas:", error);
            process.exitCode = 1;
        })
        .finally(async () => {
            await pool.end();
        });
}
