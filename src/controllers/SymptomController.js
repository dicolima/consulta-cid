const SymptomRepository = require("../repositories/SymptomRepository");

class SymptomController {
    async groups(req, res) {
        try {
            const groups = await SymptomRepository.findGroupsWithSymptoms();

            return res.json({
                total_groups: groups.length,
                data: groups
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro ao buscar sintomas."
            });
        }
    }

    async suggestCids(req, res) {
        try {
            const symptomIds = req.body.symptom_ids || [];
            const limit = Number(req.body.limit || 30);

            const result = await SymptomRepository.suggestCidsBySymptoms(symptomIds, limit);

            return res.json({
                ...result,
                total: result.suggestions.length,
                warning: "Sugestões para apoio profissional. Não substituem avaliação clínica, diagnóstico ou conduta médica."
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                error: "Erro ao sugerir CIDs por sintomas."
            });
        }
    }
}

module.exports = new SymptomController();
