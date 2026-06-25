const pool = require("../config/database");

class CidRepository {
    async upsert(cid) {
        const result = await pool.query(
            `
            INSERT INTO cids (
                code,
                formatted_code,
                description,
                short_description,
                type,
                classification,
                sex_restriction,
                death_cause,
                source,
                version,
                raw_data,
                is_active
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DATASUS', 'CID-10 DATASUS', $9, TRUE)
            ON CONFLICT (code)
            DO UPDATE SET
                formatted_code = EXCLUDED.formatted_code,
                description = EXCLUDED.description,
                short_description = EXCLUDED.short_description,
                type = EXCLUDED.type,
                classification = EXCLUDED.classification,
                sex_restriction = EXCLUDED.sex_restriction,
                death_cause = EXCLUDED.death_cause,
                raw_data = EXCLUDED.raw_data,
                is_active = TRUE,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
            `,
            [
                cid.code,
                cid.formatted_code,
                cid.description,
                cid.short_description,
                cid.type,
                cid.classification,
                cid.sex_restriction,
                cid.death_cause,
                cid.raw_data
            ]
        );

        return result.rows[0];
    }

    async search(term, limit = 50) {
        const normalizedTerm = String(term || "").trim();

        if (!normalizedTerm) {
            const result = await pool.query(
                `
                SELECT
                    cid_id,
                    code,
                    formatted_code,
                    description,
                    short_description,
                    type
                FROM cids
                WHERE is_active = TRUE
                ORDER BY code
                LIMIT $1;
                `,
                [limit]
            );

            return result.rows;
        }

        const codeTerm = normalizedTerm.replace(".", "").toUpperCase();
        const likeTerm = `%${normalizedTerm}%`;
        const likeCodeTerm = `%${codeTerm}%`;

        const result = await pool.query(
            `
            SELECT
                cid_id,
                code,
                formatted_code,
                description,
                short_description,
                type
            FROM cids
            WHERE is_active = TRUE
              AND (
                code ILIKE $1
                OR formatted_code ILIKE $2
                OR description ILIKE $2
                OR short_description ILIKE $2
              )
            ORDER BY
                CASE
                    WHEN code = $3 THEN 1
                    WHEN formatted_code = $4 THEN 2
                    WHEN code ILIKE $1 THEN 3
                    ELSE 4
                END,
                code
            LIMIT $5;
            `,
            [likeCodeTerm, likeTerm, codeTerm, normalizedTerm.toUpperCase(), limit]
        );

        return result.rows;
    }

    async countAll() {
        const result = await pool.query(
            `
            SELECT
                COUNT(*)::INTEGER AS total,
                COUNT(*) FILTER (WHERE type = 'categoria')::INTEGER AS categorias,
                COUNT(*) FILTER (WHERE type = 'subcategoria')::INTEGER AS subcategorias,
                COUNT(*) FILTER (WHERE type = 'capitulo')::INTEGER AS capitulos,
                COUNT(*) FILTER (WHERE type = 'grupo')::INTEGER AS grupos
            FROM cids
            WHERE is_active = TRUE;
            `
        );

        return result.rows[0];
    }
}

module.exports = new CidRepository();
