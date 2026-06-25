const importForm = document.getElementById("importForm");
const importResult = document.getElementById("importResult");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsBody = document.getElementById("resultsBody");
const resultInfo = document.getElementById("resultInfo");
const statsBox = document.getElementById("statsBox");
const symptomGroups = document.getElementById("symptomGroups");
const selectedSymptomsBox = document.getElementById("selectedSymptomsBox");
const clearSymptomsButton = document.getElementById("clearSymptomsButton");
const suggestionInfo = document.getElementById("suggestionInfo");
const suggestionsBody = document.getElementById("suggestionsBody");

const selectedSymptoms = new Map();

async function loadStats() {
    try {
        const response = await fetch("/api/cids/stats");
        const data = await response.json();

        statsBox.innerHTML = `
            <strong>Total:</strong> ${data.total || 0}<br />
            <strong>Categorias:</strong> ${data.categorias || 0}<br />
            <strong>Subcategorias:</strong> ${data.subcategorias || 0}<br />
            <strong>Capítulos:</strong> ${data.capitulos || 0}<br />
            <strong>Grupos:</strong> ${data.grupos || 0}
        `;
    } catch (error) {
        statsBox.textContent = "Não foi possível carregar estatísticas.";
    }
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderResults(items) {
    if (!items.length) {
        resultsBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty">Nenhum CID encontrado.</td>
            </tr>
        `;
        return;
    }

    resultsBody.innerHTML = items.map((item) => `
        <tr>
            <td class="code">${escapeHtml(item.formatted_code || item.code)}</td>
            <td>${escapeHtml(item.description)}</td>
            <td>${escapeHtml(item.short_description || "-")}</td>
            <td>${escapeHtml(item.type)}</td>
        </tr>
    `).join("");
}

async function searchCid() {
    const q = searchInput.value.trim();

    resultInfo.textContent = "Pesquisando...";

    try {
        const response = await fetch(`/api/cids?q=${encodeURIComponent(q)}&limit=50`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao pesquisar.");
        }

        resultInfo.textContent = `${data.total} resultado(s) encontrado(s).`;
        renderResults(data.data || []);
    } catch (error) {
        resultInfo.textContent = "Erro ao pesquisar.";
        renderResults([]);
    }
}

async function loadSymptoms() {
    try {
        const response = await fetch("/api/symptom-groups");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao carregar sintomas.");
        }

        renderSymptomGroups(data.data || []);
    } catch (error) {
        symptomGroups.innerHTML = `<div class="empty">Não foi possível carregar os sintomas.</div>`;
    }
}

function renderSymptomGroups(groups) {
    if (!groups.length) {
        symptomGroups.innerHTML = `<div class="empty">Nenhum sintoma cadastrado.</div>`;
        return;
    }

    symptomGroups.innerHTML = groups.map((group) => `
        <div class="symptom-group">
            <h3>${escapeHtml(group.name)}</h3>
            <p class="hint">${escapeHtml(group.description || "")}</p>
            <div class="chip-list">
                ${(group.symptoms || []).map((symptom) => `
                    <button
                        type="button"
                        class="symptom-chip"
                        data-symptom-id="${symptom.symptom_id}"
                        data-symptom-name="${escapeHtml(symptom.name)}"
                    >
                        ${escapeHtml(symptom.name)}
                    </button>
                `).join("")}
            </div>
        </div>
    `).join("");

    document.querySelectorAll(".symptom-chip").forEach((button) => {
        button.addEventListener("click", () => toggleSymptom(button));
    });
}

function toggleSymptom(button) {
    const id = Number(button.dataset.symptomId);
    const name = button.dataset.symptomName;

    if (selectedSymptoms.has(id)) {
        selectedSymptoms.delete(id);
        button.classList.remove("active");
    } else {
        selectedSymptoms.set(id, name);
        button.classList.add("active");
    }

    renderSelectedSymptoms();
    suggestBySymptoms();
}

function renderSelectedSymptoms() {
    if (!selectedSymptoms.size) {
        selectedSymptomsBox.className = "selected-box empty-selection";
        selectedSymptomsBox.textContent = "Nenhum sintoma selecionado.";
        return;
    }

    selectedSymptomsBox.className = "selected-box";
    selectedSymptomsBox.innerHTML = Array.from(selectedSymptoms.values()).map((name) => `
        <span class="selected-pill">${escapeHtml(name)}</span>
    `).join("");
}

async function suggestBySymptoms() {
    const symptomIds = Array.from(selectedSymptoms.keys());

    if (!symptomIds.length) {
        suggestionInfo.textContent = "Selecione sintomas para gerar sugestões.";
        suggestionsBody.innerHTML = "";
        return;
    }

    suggestionInfo.textContent = "Calculando sugestões...";

    try {
        const response = await fetch("/api/cids/suggest-by-symptoms", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                symptom_ids: symptomIds,
                limit: 30
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao sugerir CIDs.");
        }

        suggestionInfo.textContent = `${data.total} sugestão(ões) encontrada(s). ${data.warning || ""}`;
        renderSuggestions(data.suggestions || []);
    } catch (error) {
        suggestionInfo.textContent = error.message;
        suggestionsBody.innerHTML = "";
    }
}

function renderSuggestions(items) {
    if (!items.length) {
        suggestionsBody.innerHTML = `
            <div class="empty">
                Nenhum CID relacionado foi encontrado. Importe as subcategorias/categorias da CID-10 ou selecione outros sintomas.
            </div>
        `;
        return;
    }

    suggestionsBody.innerHTML = items.map((item) => `
        <article class="suggestion-card">
            <div class="suggestion-card-header">
                <div>
                    <div class="code">${escapeHtml(item.formatted_code || item.code)} — ${escapeHtml(item.description)}</div>
                    <div class="hint">Tipo: ${escapeHtml(item.type || "-")}</div>
                </div>
                <span class="score-badge">Pontuação ${item.score}</span>
            </div>
            <div class="suggestion-meta">
                <strong>Sintomas relacionados:</strong> ${escapeHtml((item.matched_symptoms || []).join(", ") || "-")}<br />
                <strong>Motivos/termos:</strong> ${escapeHtml((item.reasons || []).slice(0, 8).join(", ") || "-")}<br />
                <strong>Origem:</strong> ${escapeHtml((item.sources || []).join(", ") || "-")}
            </div>
        </article>
    `).join("");
}

function clearSymptoms() {
    selectedSymptoms.clear();
    document.querySelectorAll(".symptom-chip.active").forEach((button) => {
        button.classList.remove("active");
    });
    renderSelectedSymptoms();
    suggestBySymptoms();
}

importForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(importForm);

    importResult.className = "result-message";
    importResult.textContent = "Importando arquivo. Aguarde...";

    try {
        const response = await fetch("/api/cids/import", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.details || "Erro ao importar.");
        }

        importResult.className = "result-message success";
        importResult.textContent = `Importado com sucesso: ${data.imported} registros. Ignorados: ${data.ignored}.`;

        importForm.reset();
        await loadStats();
        await suggestBySymptoms();
    } catch (error) {
        importResult.className = "result-message error";
        importResult.textContent = error.message;
    }
});

searchButton.addEventListener("click", searchCid);
clearSymptomsButton.addEventListener("click", clearSymptoms);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchCid();
    }
});

loadStats();
loadSymptoms();
renderSelectedSymptoms();
