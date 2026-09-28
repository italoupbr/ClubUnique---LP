(() => {
  "use strict";

  const refreshBtn = document.getElementById("admin-refresh");
  const exportBtn = document.getElementById("admin-export");
  const filterSelect = document.getElementById("admin-edition-filter");
  const tableBody = document.getElementById("admin-table-body");
  const statsEl = document.getElementById("admin-stats");

  let currentRows = [];

  async function loadPresences() {
    if (statsEl) statsEl.textContent = "Carregando…";

    try {
      if (!window.ClubUniqueApi) {
        throw new Error("Integração com Supabase indisponível.");
      }

      const edition = filterSelect?.value || "all";
      currentRows = await window.ClubUniqueApi.listPresences(edition);
      renderTable(currentRows);
    } catch (err) {
      renderError(err.message || "Erro ao carregar registros.");
    }
  }

  function renderTable(rows) {
    if (!tableBody) return;

    if (!rows.length) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="admin-empty">Nenhum check-in encontrado para este filtro.</td></tr>';
      if (statsEl) statsEl.textContent = "0 confirmados";
      return;
    }

    tableBody.innerHTML = rows
      .map((row) => {
        const createdAt = row.created_at
          ? new Date(row.created_at).toLocaleString("pt-BR", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "—";

        return `<tr>
          <td>${escapeHtml(row.full_name)}</td>
          <td>${escapeHtml(row.phone)}</td>
          <td>${escapeHtml(row.email)}</td>
          <td>${escapeHtml(row.company)}</td>
          <td>${escapeHtml(formatEdition(row.edition))}</td>
          <td>${escapeHtml(createdAt)}</td>
        </tr>`;
      })
      .join("");

    if (statsEl) statsEl.textContent = `${rows.length} confirmado${rows.length === 1 ? "" : "s"}`;
  }

  function renderError(message) {
    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="6" class="admin-empty">${escapeHtml(message)}</td></tr>`;
    }
    if (statsEl) statsEl.textContent = "Erro ao carregar";
  }

  function formatEdition(value) {
    if (value === "2026-08-22") return "22 ago 2026";
    if (value === "2026-09-26") return "26 set 2026";
    if (value === "2026-10-24") return "24 out 2026";
    return value || "—";
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function exportCsv() {
    if (!currentRows.length) return;

    const headers = ["Nome", "Telefone", "E-mail", "Empresa", "Edição", "Confirmado em"];
    const lines = currentRows.map((row) =>
      [
        row.full_name,
        row.phone,
        row.email,
        row.company,
        formatEdition(row.edition),
        row.created_at,
      ]
        .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );

    const blob = new Blob([[headers.join(","), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `club-unique-checkins-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  refreshBtn?.addEventListener("click", loadPresences);
  exportBtn?.addEventListener("click", exportCsv);
  filterSelect?.addEventListener("change", loadPresences);

  loadPresences();
})();
