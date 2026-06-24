const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");
const { parse } = require("csv-parse/sync");
const pool = require("../src/config/database");

function normalizeCode(code) {
    if (!code) return null;

    return String(code)
        .trim()
        .replace(".", "")
        .toUpperCase();
}

function normalizeDescription(description) {
    if (!description) return null;

    return String(description)
        .trim()
        .replace(/\s+/g, " ");
}

function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/)[0];

    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;

    return semicolonCount >= commaCount ? ";" : ",";
}

function readCsvFile(filePath) {
    const buffer = fs.readFileSync(filePath);

    let text = iconv.decode(buffer, "latin1");

    if (!text || text.includes("�")) {
        text = buffer.toString("utf8");
    }

    const delimiter = detectDelimiter(text);

    return parse(text, {
        columns: true,
        skip_empty_lines: true,
        delimiter,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
    });
}

function getValue(row, possibleNames) {
    for (const name of possibleNames) {
        if (row[name] !== undefined && row[name] !== null && row[name] !== "") {
            return row[name];
        }
    }

    const keys = Object.keys(row);

    for (const key of keys) {
        const normalizedKey = key
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        for (const name of possibleNames) {
            const normalizedName = name
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase();

            if (normalizedKey === normalizedName) {
                return row[key];
            }
        }
    }

    return null;
}

async function upsertCid({ code, description, type }) {
    if (!code || !description) {
        return;
    }

    await pool.query(
        `
        INSERT INTO cids (
            code,
            description,
            type,
            source,
            version,
            is_active
        )
        VALUES ($1, $2, $3, $4, $5, TRUE)
        ON CONFLICT (code)
        DO UPDATE SET
            description = EXCLUDED.description,
            type = EXCLUDED.type,
            source = EXCLUDED.source,
            version = EXCLUDED.version,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
        `,
        [
            code,
            description,
            type,
            "DATASUS",
            "CID-10 DATASUS"
        ]
    );
}

async function importFile(fileName, type) {
    const filePath = path.join(
        __dirname,
        "imports",
        "cid10",
        fileName
    );

    if (!fs.existsSync(filePath)) {
        console.log(`Arquivo não encontrado: ${filePath}`);
        return 0;
    }

    const rows = readCsvFile(filePath);

    let imported = 0;

    for (const row of rows) {
        const rawCode = getValue(row, [
            "CAT",
            "SUBCAT",
            "CODIGO",
            "CÓDIGO",
            "CID",
            "COD",
            "Código",
            "Codigo"
        ]);

        const rawDescription = getValue(row, [
            "DESCRICAO",
            "DESCRIÇÃO",
            "DESCR",
            "NOME",
            "Descrição",
            "Descricao"
        ]);

        const code = normalizeCode(rawCode);
        const description = normalizeDescription(rawDescription);

        if (!code || !description) {
            continue;
        }

        await upsertCid({
            code,
            description,
            type
        });

        imported++;
    }

    console.log(`${fileName}: ${imported} registros importados.`);

    return imported;
}

async function main() {
    try {
        console.log("Iniciando importação da CID-10...");

        await importFile("CID-10-CATEGORIAS.CSV", "categoria");
        await importFile("CID-10-SUBCATEGORIAS.CSV", "subcategoria");

        console.log("Importação finalizada com sucesso.");
    } catch (error) {
        console.error("Erro ao importar CID-10:");
        console.error(error);
    } finally {
        await pool.end();
    }
}

main();