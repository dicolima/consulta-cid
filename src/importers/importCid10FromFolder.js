const path = require("path");
const fs = require("fs");
const pool = require("../config/database");
const { importCidCsv } = require("./cidCsvImporter");

const folder = path.join(__dirname, "../uploads/cid10");

const knownFiles = [
    { file: "CID-10-CATEGORIAS.CSV", type: "categoria" },
    { file: "CID-10-SUBCATEGORIAS.CSV", type: "subcategoria" },
    { file: "CID-10-CAPITULOS.CSV", type: "capitulo" },
    { file: "CID-10-GRUPOS.CSV", type: "grupo" }
];

async function main() {
    try {
        console.log("Importando arquivos da pasta:", folder);

        for (const item of knownFiles) {
            const filePath = path.join(folder, item.file);

            if (!fs.existsSync(filePath)) {
                console.log(`Ignorado: ${item.file} não encontrado.`);
                continue;
            }

            const result = await importCidCsv(filePath, item.type);

            console.log(`${item.file}:`, result);
        }

        console.log("Importação finalizada.");
    } catch (error) {
        console.error("Erro na importação:", error);
    } finally {
        await pool.end();
    }
}

main();
