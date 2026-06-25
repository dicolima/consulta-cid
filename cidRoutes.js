const pool = require("../config/database");

const symptomSeed = [
    {
        name: "Dor",
        description: "Sintomas dolorosos por localização.",
        order: 1,
        symptoms: [
            ["Dor de cabeça", ["cefaleia", "enxaqueca", "dor de cabeça"], 1],
            ["Dor torácica", ["dor torácica", "precordialgia", "dor no peito"], 2],
            ["Dor abdominal", ["dor abdominal", "abdome", "cólica abdominal"], 3],
            ["Dor lombar", ["dor lombar", "lombalgia"], 4],
            ["Dor no braço", ["dor no braço", "membro superior"], 5],
            ["Dor na perna", ["dor na perna", "membro inferior"], 6],
            ["Dor ao urinar", ["disúria", "dor ao urinar", "ardor urinário"], 7],
            ["Dor de garganta", ["faringite", "dor de garganta", "amigdalite"], 8]
        ]
    },
    {
        name: "Geral",
        description: "Sinais e sintomas gerais.",
        order: 2,
        symptoms: [
            ["Febre", ["febre", "pirexia"], 1],
            ["Cansaço", ["fadiga", "cansaço", "astenia"], 2],
            ["Mal-estar", ["mal-estar", "indisposição"], 3],
            ["Perda de peso", ["perda de peso", "emagrecimento"], 4],
            ["Sudorese", ["sudorese", "suor excessivo"], 5],
            ["Calafrios", ["calafrios", "tremores"], 6]
        ]
    },
    {
        name: "Respiratório",
        description: "Sintomas respiratórios e de vias aéreas.",
        order: 3,
        symptoms: [
            ["Tosse", ["tosse"], 1],
            ["Coriza", ["coriza", "rinorreia", "nasofaringite"], 2],
            ["Falta de ar", ["dispneia", "falta de ar"], 3],
            ["Chiado", ["sibilância", "chiado", "asma"], 4],
            ["Espirros", ["espirros", "rinite"], 5],
            ["Congestão nasal", ["congestão nasal", "obstrução nasal"], 6]
        ]
    },
    {
        name: "Digestivo",
        description: "Sintomas gastrointestinais.",
        order: 4,
        symptoms: [
            ["Náusea", ["náusea", "enjoo"], 1],
            ["Vômito", ["vômito", "emese"], 2],
            ["Diarreia", ["diarreia", "gastroenterite"], 3],
            ["Prisão de ventre", ["constipação", "prisão de ventre"], 4],
            ["Azia", ["azia", "pirose", "refluxo"], 5],
            ["Sangue nas fezes", ["sangue nas fezes", "hematoquezia", "melena"], 6]
        ]
    },
    {
        name: "Neurológico",
        description: "Sintomas neurológicos.",
        order: 5,
        symptoms: [
            ["Tontura", ["tontura", "vertigem"], 1],
            ["Desmaio", ["síncope", "desmaio"], 2],
            ["Convulsão", ["convulsão", "epilepsia"], 3],
            ["Confusão mental", ["confusão mental", "desorientação"], 4],
            ["Dormência", ["parestesia", "dormência", "formigamento"], 5],
            ["Fraqueza súbita", ["fraqueza", "paresia", "paralisia"], 6]
        ]
    },
    {
        name: "Urinário",
        description: "Sintomas urinários.",
        order: 6,
        symptoms: [
            ["Ardência ao urinar", ["disúria", "ardência ao urinar"], 1],
            ["Urina escura", ["urina escura", "colúria"], 2],
            ["Sangue na urina", ["hematúria", "sangue na urina"], 3],
            ["Urinar muitas vezes", ["poliúria", "frequência urinária", "micção frequente"], 4],
            ["Urgência urinária", ["urgência urinária"], 5]
        ]
    },
    {
        name: "Pele",
        description: "Sintomas dermatológicos.",
        order: 7,
        symptoms: [
            ["Coceira", ["prurido", "coceira"], 1],
            ["Manchas na pele", ["manchas na pele", "exantema", "erupção cutânea"], 2],
            ["Feridas", ["ferida", "úlcera", "lesão de pele"], 3],
            ["Vermelhidão", ["eritema", "vermelhidão"], 4],
            ["Inchaço", ["edema", "inchaço"], 5]
        ]
    },
    {
        name: "Cardiovascular",
        description: "Sinais e sintomas cardiovasculares.",
        order: 8,
        symptoms: [
            ["Palpitação", ["palpitação", "taquicardia"], 1],
            ["Pressão alta", ["hipertensão", "pressão alta", "pressão arterial elevada"], 2],
            ["Dor irradiando para braço", ["dor irradiada", "dor no braço", "dor torácica"], 3],
            ["Lábios arroxeados", ["cianose", "lábios arroxeados"], 4]
        ]
    }
];

const relationSeed = {
    "Dor de cabeça": [
        ["R51", 10, "Cefaleia"],
        ["G43", 7, "Enxaqueca"],
        ["G439", 7, "Enxaqueca não especificada"]
    ],
    "Dor torácica": [
        ["R07", 9, "Dor de garganta e no peito"],
        ["R074", 10, "Dor torácica não especificada"],
        ["I20", 5, "Angina pectoris"],
        ["I219", 4, "Infarto agudo do miocárdio não especificado"]
    ],
    "Dor abdominal": [
        ["R10", 10, "Dor abdominal e pélvica"],
        ["R104", 9, "Outras dores abdominais e as não especificadas"],
        ["K529", 5, "Gastroenterite e colite não infecciosas não especificadas"]
    ],
    "Dor lombar": [
        ["M54", 8, "Dorsalgia"],
        ["M545", 10, "Dor lombar baixa"],
        ["N390", 4, "Infecção do trato urinário de localização não especificada"]
    ],
    "Dor ao urinar": [
        ["R30", 10, "Dor associada à micção"],
        ["R300", 10, "Disúria"],
        ["N390", 8, "Infecção do trato urinário de localização não especificada"]
    ],
    "Dor de garganta": [
        ["J02", 9, "Faringite aguda"],
        ["J029", 10, "Faringite aguda não especificada"],
        ["J03", 8, "Amigdalite aguda"],
        ["J039", 8, "Amigdalite aguda não especificada"],
        ["J069", 6, "Infecção aguda das vias aéreas superiores não especificada"]
    ],
    "Febre": [
        ["R50", 9, "Febre de origem desconhecida"],
        ["R509", 10, "Febre não especificada"],
        ["J11", 5, "Influenza devida a vírus não identificado"],
        ["A90", 5, "Dengue clássica"]
    ],
    "Cansaço": [
        ["R53", 10, "Mal-estar e fadiga"],
        ["D64", 4, "Outras anemias"]
    ],
    "Mal-estar": [
        ["R53", 10, "Mal-estar e fadiga"]
    ],
    "Perda de peso": [
        ["R63", 8, "Sintomas e sinais relativos à alimentação"],
        ["R634", 10, "Perda de peso anormal"],
        ["E11", 4, "Diabetes mellitus não-insulino-dependente"]
    ],
    "Sudorese": [
        ["R61", 10, "Hiperidrose"],
        ["R07", 3, "Dor de garganta e no peito"]
    ],
    "Calafrios": [
        ["R50", 6, "Febre de origem desconhecida"],
        ["R509", 6, "Febre não especificada"]
    ],
    "Tosse": [
        ["R05", 10, "Tosse"],
        ["J20", 6, "Bronquite aguda"],
        ["J40", 5, "Bronquite não especificada como aguda ou crônica"],
        ["J069", 5, "Infecção aguda das vias aéreas superiores não especificada"],
        ["J11", 4, "Influenza devida a vírus não identificado"]
    ],
    "Coriza": [
        ["J00", 10, "Nasofaringite aguda"],
        ["J30", 7, "Rinite alérgica e vasomotora"],
        ["J069", 6, "Infecção aguda das vias aéreas superiores não especificada"]
    ],
    "Falta de ar": [
        ["R06", 9, "Anormalidades da respiração"],
        ["R060", 10, "Dispneia"],
        ["J45", 5, "Asma"],
        ["J18", 4, "Pneumonia por microrganismo não especificada"]
    ],
    "Chiado": [
        ["R062", 9, "Respiração ofegante"],
        ["J45", 9, "Asma"],
        ["J459", 10, "Asma não especificada"]
    ],
    "Espirros": [
        ["J30", 8, "Rinite alérgica e vasomotora"],
        ["J00", 7, "Nasofaringite aguda"]
    ],
    "Congestão nasal": [
        ["J00", 8, "Nasofaringite aguda"],
        ["J30", 7, "Rinite alérgica e vasomotora"]
    ],
    "Náusea": [
        ["R11", 10, "Náusea e vômitos"],
        ["A09", 4, "Diarreia e gastroenterite de origem infecciosa presumível"]
    ],
    "Vômito": [
        ["R11", 10, "Náusea e vômitos"],
        ["A09", 5, "Diarreia e gastroenterite de origem infecciosa presumível"]
    ],
    "Diarreia": [
        ["A09", 10, "Diarreia e gastroenterite de origem infecciosa presumível"],
        ["K529", 5, "Gastroenterite e colite não infecciosas não especificadas"]
    ],
    "Prisão de ventre": [
        ["K59", 8, "Outros transtornos funcionais do intestino"],
        ["K590", 10, "Constipação"]
    ],
    "Azia": [
        ["K21", 9, "Doença de refluxo gastroesofágico"],
        ["K219", 10, "Doença de refluxo gastroesofágico sem esofagite"]
    ],
    "Sangue nas fezes": [
        ["K92", 7, "Outras doenças do aparelho digestivo"],
        ["K922", 10, "Hemorragia gastrointestinal não especificada"]
    ],
    "Tontura": [
        ["R42", 10, "Tontura e instabilidade"],
        ["H81", 4, "Transtornos da função vestibular"]
    ],
    "Desmaio": [
        ["R55", 10, "Síncope e colapso"]
    ],
    "Convulsão": [
        ["R56", 8, "Convulsões não classificadas em outra parte"],
        ["G40", 7, "Epilepsia"]
    ],
    "Confusão mental": [
        ["R41", 8, "Outros sintomas e sinais relativos às funções cognitivas"],
        ["R410", 10, "Desorientação não especificada"]
    ],
    "Dormência": [
        ["R20", 8, "Distúrbios da sensibilidade cutânea"],
        ["R202", 10, "Parestesia cutânea"]
    ],
    "Fraqueza súbita": [
        ["R53", 6, "Mal-estar e fadiga"],
        ["I64", 4, "Acidente vascular cerebral não especificado como hemorrágico ou isquêmico"]
    ],
    "Ardência ao urinar": [
        ["R300", 10, "Disúria"],
        ["N390", 9, "Infecção do trato urinário de localização não especificada"]
    ],
    "Urina escura": [
        ["R82", 6, "Outros achados anormais na urina"],
        ["R829", 8, "Outros achados anormais na urina não especificados"]
    ],
    "Sangue na urina": [
        ["R31", 10, "Hematúria não especificada"],
        ["N390", 5, "Infecção do trato urinário de localização não especificada"]
    ],
    "Urinar muitas vezes": [
        ["R35", 10, "Poliúria"],
        ["E11", 4, "Diabetes mellitus não-insulino-dependente"]
    ],
    "Urgência urinária": [
        ["R39", 7, "Outros sintomas e sinais relativos ao aparelho urinário"],
        ["N390", 6, "Infecção do trato urinário de localização não especificada"]
    ],
    "Coceira": [
        ["L29", 10, "Prurido"],
        ["L299", 10, "Prurido não especificado"]
    ],
    "Manchas na pele": [
        ["R21", 10, "Eritema e outras erupções cutâneas não especificadas"],
        ["L30", 5, "Outras dermatites"]
    ],
    "Feridas": [
        ["L98", 6, "Outras afecções da pele"],
        ["T14", 5, "Traumatismo de região não especificada"]
    ],
    "Vermelhidão": [
        ["L53", 8, "Outras afecções eritematosas"],
        ["R21", 7, "Eritema e outras erupções cutâneas não especificadas"]
    ],
    "Inchaço": [
        ["R60", 10, "Edema não classificado em outra parte"],
        ["R609", 10, "Edema não especificado"]
    ],
    "Palpitação": [
        ["R00", 7, "Anormalidades do batimento cardíaco"],
        ["R002", 10, "Palpitações"]
    ],
    "Pressão alta": [
        ["I10", 10, "Hipertensão essencial primária"]
    ],
    "Dor irradiando para braço": [
        ["R074", 8, "Dor torácica não especificada"],
        ["I20", 5, "Angina pectoris"],
        ["I219", 4, "Infarto agudo do miocárdio não especificado"]
    ],
    "Lábios arroxeados": [
        ["R23", 8, "Outras alterações da pele"],
        ["R230", 10, "Cianose"]
    ]
};

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
        CREATE TABLE IF NOT EXISTS symptom_groups (
            symptom_group_id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS symptoms (
            symptom_id SERIAL PRIMARY KEY,
            symptom_group_id INTEGER REFERENCES symptom_groups(symptom_group_id),
            name VARCHAR(150) UNIQUE NOT NULL,
            description TEXT,
            search_terms TEXT[] DEFAULT '{}',
            display_order INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS symptom_cid_relations (
            symptom_cid_relation_id SERIAL PRIMARY KEY,
            symptom_id INTEGER NOT NULL REFERENCES symptoms(symptom_id) ON DELETE CASCADE,
            cid_code VARCHAR(20) NOT NULL,
            weight INTEGER DEFAULT 1,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (symptom_id, cid_code)
        );
    `);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cids_code ON cids (code);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_cids_description ON cids USING gin (to_tsvector('portuguese', description));`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_symptoms_group ON symptoms (symptom_group_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_symptom_relations_symptom ON symptom_cid_relations (symptom_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_symptom_relations_cid_code ON symptom_cid_relations (cid_code);`);

    await seedSymptoms();

    console.log("Tabelas cids, sintomas e relações criadas/verificadas com sucesso.");
}

async function seedSymptoms() {
    for (const group of symptomSeed) {
        const groupResult = await pool.query(
            `
            INSERT INTO symptom_groups (name, description, display_order, is_active)
            VALUES ($1, $2, $3, TRUE)
            ON CONFLICT (name)
            DO UPDATE SET
                description = EXCLUDED.description,
                display_order = EXCLUDED.display_order,
                is_active = TRUE,
                updated_at = CURRENT_TIMESTAMP
            RETURNING symptom_group_id;
            `,
            [group.name, group.description, group.order]
        );

        const groupId = groupResult.rows[0].symptom_group_id;

        for (const [name, searchTerms, order] of group.symptoms) {
            await pool.query(
                `
                INSERT INTO symptoms (symptom_group_id, name, search_terms, display_order, is_active)
                VALUES ($1, $2, $3, $4, TRUE)
                ON CONFLICT (name)
                DO UPDATE SET
                    symptom_group_id = EXCLUDED.symptom_group_id,
                    search_terms = EXCLUDED.search_terms,
                    display_order = EXCLUDED.display_order,
                    is_active = TRUE,
                    updated_at = CURRENT_TIMESTAMP;
                `,
                [groupId, name, searchTerms, order]
            );
        }
    }

    for (const [symptomName, relations] of Object.entries(relationSeed)) {
        const symptomResult = await pool.query(
            `SELECT symptom_id FROM symptoms WHERE name = $1 LIMIT 1;`,
            [symptomName]
        );

        if (!symptomResult.rows.length) continue;

        const symptomId = symptomResult.rows[0].symptom_id;

        for (const [cidCode, weight, notes] of relations) {
            await pool.query(
                `
                INSERT INTO symptom_cid_relations (symptom_id, cid_code, weight, notes)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (symptom_id, cid_code)
                DO UPDATE SET
                    weight = EXCLUDED.weight,
                    notes = EXCLUDED.notes;
                `,
                [symptomId, cidCode, weight, notes]
            );
        }
    }
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
