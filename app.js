const fs = require("fs");
const CidRepository = require("../repositories/CidRepository");
const { importCidCsv } = require("../importers/cidCsvImporter");

class CidController {
    async search(req, res) {
        try {
            const q = req.query.q || "";
            const limit = Number(req.query.limit || 50);

            const results = await CidRepository.search(q, limit);

            return res.json({
                query: q,
                total: results.length,
                data: results
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro ao consultar CIDs."
            });
        }
    }

    async stats(req, res) {
        try {
            const stats = await CidRepository.countAll();
            return res.json(stats);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro ao buscar estatísticas."
            });
        }
    }

    async importCsv(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "Nenhum arquivo CSV foi enviado."
                });
            }

            const type = req.body.type || "subcategoria";

            const allowedTypes = ["categoria", "subcategoria", "capitulo", "grupo"];

            if (!allowedTypes.includes(type)) {
                return res.status(400).json({
                    error: "Tipo inválido. Use categoria, subcategoria, capitulo ou grupo."
                });
            }

            const result = await importCidCsv(req.file.path, type);

            fs.unlink(req.file.path, () => {});

            return res.json({
                message: "Arquivo importado com sucesso.",
                type,
                ...result
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro ao importar arquivo CSV.",
                details: error.message
            });
        }
    }
}

module.exports = new CidController();
