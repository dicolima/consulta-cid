const fs = require("fs");
const iconv = require("iconv-lite");
const { parse } = require("csv-parse/sync");
const CidRepository = require("../repositories/CidRepository");

function removeAccents(text) {
    return String(text || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function normalizeHeader(header) {
    return removeAccents(header)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]/g, "");
}

function normalizeCode(code) {
    if (!code) return null;

    const normalized = String(code)
        .trim()
        .replace(/\./g, "")
        .replace(/\s+/g, "")
        .toUpperCase();

    return normalized || null;
}

function formatCidCode(code) {
    if (!code) return null;

    const normalized = normalizeCode(code);

    if (/^[A-Z][0-9]{2}[A-Z0-9]$/.test(normalized)) {
        return `${normalized.slice(0, 3)}.${normalized.slice(3)}`;
    }

    return normalized;
}

function normalizeText(text) {
    if (!text) return null;

    const normalized = String(text)
        .trim()
        .replace(/^"+|"+$/g, "")
        .replace(/""/g, '"')
        .replace(/\s+/g, " ");

    return normalized || null;
}

function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/)[0] || "";
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const commaCount = (firstLine.match(/,/g) || []).length;

    return semicolonCount >= commaCount ? ";" : ",";
}

function readCsv(filePath) {
    const buffer = fs.readFileSync(filePath);

    let text = iconv.decode(buffer, "latin1");

    if (text.includes("�")) {
        text = buffer.toString("utf8");
    }

    text = text.replace(/^\uFEFF/, "");

    const delimiter = detectDelimiter(text);

    try {
        return parse(text, {
            columns: true,
            delimiter,
            skip_empty_lines: true,
            trim: true,
            relax_quotes: true,
            relax_column_count: true,
            bom: true
        });
    } catch (error) {
        console.warn("CSV com aspas irregulares detectado. Usando leitura tolerante sem tratamento de aspas.");
        console.warn(`Linha aproximada do problema: ${error.lines || "não informada"}`);

        return parse(text, {
            columns: true,
            delimiter,
            skip_empty_lines: true,
            trim: true,
            relax_column_count: true,
            bom: true,
            quote: false
        });
    }
}

function getValue(row, names) {
    const keys = Object.keys(row);
    const normalizedMap = new Map();

    for (const key of keys) {
        normalizedMap.set(normalizeHeader(key), key);
    }

    for (const name of names) {
        const normalizedName = normalizeHeader(name);
        const realKey = normalizedMap.get(normalizedName);

        if (realKey && row[realKey] !== undefined && row[realKey] !== null && row[realKey] !== "") {
            return row[realKey];
        }
    }

    return null;
}

function mapRowToCid(row, type) {
    const rawCode = getValue(row, [
        "SUBCAT",
        "CAT",
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
        "DESCRICAO_LONGA",
        "Descrição",
        "Descricao"
    ]);

    const rawShortDescription = getValue(row, [
        "DESCRABREV",
        "DESCRICAO_ABREV",
        "DESCRIÇÃO_ABREV",
        "DESCR_ABREV",
        "DESCRICAO CURTA",
        "Descrição curta"
    ]);

    const code = normalizeCode(rawCode);
    const description = normalizeText(rawDescription || rawShortDescription);

    if (!code || !description) {
        return null;
    }

    return {
        code,
        formatted_code: formatCidCode(code),
        description,
        short_description: normalizeText(rawShortDescription),
        type,
        classification: normalizeText(getValue(row, ["CLASSIF", "CLASSIFICACAO", "CLASSIFICAÇÃO"])),
        sex_restriction: normalizeText(getValue(row, ["RESTRSEXO", "RESTRICAO_SEXO", "RESTRIÇÃO_SEXO"])),
        death_cause: normalizeText(getValue(row, ["CAUSAOBITO", "CAUSA_OBITO", "CAUSA_ÓBITO"])),
        raw_data: row
    };
}

async function importCidCsv(filePath, type) {
    const rows = readCsv(filePath);

    let imported = 0;
    let ignored = 0;

    for (const row of rows) {
        const cid = mapRowToCid(row, type);

        if (!cid) {
            ignored++;
            continue;
        }

        await CidRepository.upsert(cid);
        imported++;
    }

    return {
        imported,
        ignored,
        totalRows: rows.length
    };
}

module.exports = {
    importCidCsv,
    normalizeCode,
    formatCidCode
};
