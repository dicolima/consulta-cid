const importForm = document.getElementById("importForm");
const importResult = document.getElementById("importResult");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsBody = document.getElementById("resultsBody");
const resultInfo = document.getElementById("resultInfo");
const statsBox = document.getElementById("statsBox");

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
    } catch (error) {
        importResult.className = "result-message error";
        importResult.textContent = error.message;
    }
});

searchButton.addEventListener("click", searchCid);

searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchCid();
    }
});

loadStats();
