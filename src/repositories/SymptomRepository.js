const pool = require("../config/database");

class SymptomRepository {
    async findGroupsWithSymptoms() {
        const result = await pool.query(`
            SELECT
                g.symptom_group_id,
                g.name AS group_name,
                g.description AS group_description,
                g.display_order AS group_order,
                s.symptom_id,
                s.name AS symptom_name,
                s.description AS symptom_description,
                s.search_terms,
                s.display_order AS symptom_order
            FROM symptom_groups g
            LEFT JOIN symptoms s
                ON s.symptom_group_id = g.symptom_group_id
               AND s.is_active = TRUE
            WHERE g.is_active = TRUE
            ORDER BY g.display_order, g.name, s.display_order, s.name;
        `);

        const groupsMap = new Map();

        for (const row of result.rows) {
            if (!groupsMap.has(row.symptom_group_id)) {
                groupsMap.set(row.symptom_group_id, {
                    symptom_group_id: row.symptom_group_id,
                    name: row.group_name,
                    description: row.group_description,
                    display_order: row.group_order,
                    symptoms: []
                });
            }

            if (row.symptom_id) {
                groupsMap.get(row.symptom_group_id).symptoms.push({
                    symptom_id: row.symptom_id,
                    name: row.symptom_name,
                    description: row.symptom_description,
                    search_terms: row.search_terms || [],
                    display_order: row.symptom_order
                });
            }
        }

        return Array.from(groupsMap.values());
    }

    async suggestCidsBySymptoms(symptomIds, limit = 30) {
        const ids = Array.from(
            new Set(
                (symptomIds || [])
                    .map((id) => Number(id))
                    .filter((id) => Number.isInteger(id) && id > 0)
            )
        );

        if (!ids.length) {
            return {
                selected_symptoms: [],
                suggestions: []
            };
        }

        const selectedResult = await pool.query(
            `
            SELECT
                symptom_id,
                name,
                search_terms
            FROM symptoms
            WHERE is_active = TRUE
              AND symptom_id = ANY($1::int[])
            ORDER BY name;
            `,
            [ids]
        );

        const selectedSymptoms = selectedResult.rows.map((row) => ({
            symptom_id: row.symptom_id,
            name: row.name,
            search_terms: row.search_terms || []
        }));

        if (!selectedSymptoms.length) {
            return {
                selected_symptoms: [],
                suggestions: []
            };
        }

        const result = await pool.query(
            `
            WITH selected_symptoms AS (
                SELECT
                    symptom_id,
                    name,
                    search_terms
                FROM symptoms
                WHERE is_active = TRUE
                  AND symptom_id = ANY($1::int[])
            ),
            direct_matches AS (
                SELECT
                    c.cid_id,
                    c.code,
                    c.formatted_code,
                    c.description,
                    c.short_description,
                    c.type,
                    r.weight::INTEGER AS score,
                    s.name AS matched_symptom,
                    r.notes AS reason,
                    'relação sintoma-cid' AS source
                FROM selected_symptoms s
                INNER JOIN symptom_cid_relations r
                    ON r.symptom_id = s.symptom_id
                INNER JOIN cids c
                    ON c.is_active = TRUE
                   AND c.code = r.cid_code
            ),
            terms AS (
                SELECT
                    symptom_id,
                    name,
                    UNNEST(search_terms) AS term
                FROM selected_symptoms
            ),
            term_matches AS (
                SELECT
                    c.cid_id,
                    c.code,
                    c.formatted_code,
                    c.description,
                    c.short_description,
                    c.type,
                    2::INTEGER AS score,
                    t.name AS matched_symptom,
                    t.term AS reason,
                    'busca por termos' AS source
                FROM terms t
                INNER JOIN cids c
                    ON c.is_active = TRUE
                   AND (
                        c.description ILIKE '%' || t.term || '%'
                        OR COALESCE(c.short_description, '') ILIKE '%' || t.term || '%'
                   )
                WHERE LENGTH(t.term) >= 3
            )
            SELECT * FROM direct_matches
            UNION ALL
            SELECT * FROM term_matches;
            `,
            [ids]
        );

        const suggestionsMap = new Map();

        for (const row of result.rows) {
            if (!suggestionsMap.has(row.cid_id)) {
                suggestionsMap.set(row.cid_id, {
                    cid_id: row.cid_id,
                    code: row.code,
                    formatted_code: row.formatted_code,
                    description: row.description,
                    short_description: row.short_description,
                    type: row.type,
                    score: 0,
                    matched_symptoms: [],
                    reasons: [],
                    sources: []
                });
            }

            const item = suggestionsMap.get(row.cid_id);
            item.score += Number(row.score || 0);

            if (row.matched_symptom && !item.matched_symptoms.includes(row.matched_symptom)) {
                item.matched_symptoms.push(row.matched_symptom);
            }

            if (row.reason && !item.reasons.includes(row.reason)) {
                item.reasons.push(row.reason);
            }

            if (row.source && !item.sources.includes(row.source)) {
                item.sources.push(row.source);
            }
        }

        const suggestions = Array.from(suggestionsMap.values())
            .sort((a, b) => b.score - a.score || String(a.code).localeCompare(String(b.code)))
            .slice(0, limit);

        return {
            selected_symptoms: selectedSymptoms,
            suggestions
        };
    }
}

module.exports = new SymptomRepository();
