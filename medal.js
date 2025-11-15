
// medal.js - 共通CSVテーブル表示スクリプト
// CSVはカンマ区切り・ダブルクオートなし前提

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== "");
  if (lines.length === 0) return { header: [], rows: [] };

  const header = lines[0].split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length === 1 && cols[0].trim() === "") continue;

    const row = cols.map(c => c.trim());
    // 足りない列は空文字で埋める
    while (row.length < header.length) {
      row.push("");
    }
    rows.push(row);
  }

  return { header, rows };
}

function setupCsvTable(config) {
  const { csvPath, tableId, searchInputId } = config;

  const table = document.getElementById(tableId);
  if (!table) {
    console.warn("table not found:", tableId);
    return;
  }
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");
  const searchInput = document.getElementById(searchInputId);

  if (!thead || !tbody) {
    console.warn("thead/tbody missing in table:", tableId);
    return;
  }

  let header = [];
  let allRows = [];

  function render(filteredRows) {
    // ヘッダー描画
    thead.innerHTML = "";
    const trHead = document.createElement("tr");
    header.forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);

    // ボディ描画
    tbody.innerHTML = "";
    const frag = document.createDocumentFragment();
    filteredRows.forEach(row => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
  }

  function applyFilter() {
    const keyword = (searchInput && searchInput.value || "").trim().toLowerCase();
    if (!keyword) {
      render(allRows);
      return;
    }
    const filtered = allRows.filter(row => {
      const joined = row.join(" ").toLowerCase();
      return joined.includes(keyword);
    });
    render(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  fetch(csvPath)
    .then(res => {
      if (!res.ok) {
        throw new Error("CSV 読み込みに失敗しました: " + csvPath);
      }
      return res.text();
    })
    .then(text => {
      const parsed = parseCsv(text);
      header = parsed.header;
      allRows = parsed.rows;
      render(allRows);
    })
    .catch(err => {
      console.error(err);
      tbody.innerHTML = "<tr><td>データを読み込めませんでした</td></tr>";
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // DQ1 メダル場所
  if (document.getElementById("dq1-medal-locations-table")) {
    setupCsvTable({
      csvPath: "medal - dq1_medal.csv",
      tableId: "dq1-medal-locations-table",
      searchInputId: "dq1-medal-locations-search"
    });
  }
  // DQ1 メダル景品
  if (document.getElementById("dq1-medal-prizes-table")) {
    setupCsvTable({
      csvPath: "medal - dq1_prize.csv",
      tableId: "dq1-medal-prizes-table",
      searchInputId: "dq1-medal-prizes-search"
    });
  }

  // DQ2 メダル場所
  if (document.getElementById("dq2-medal-locations-table")) {
    setupCsvTable({
      csvPath: "medal - dq2_medal.csv",
      tableId: "dq2-medal-locations-table",
      searchInputId: "dq2-medal-locations-search"
    });
  }
  // DQ2 メダル景品
  if (document.getElementById("dq2-medal-prizes-table")) {
    setupCsvTable({
      csvPath: "medal - dq2_prize.csv",
      tableId: "dq2-medal-prizes-table",
      searchInputId: "dq2-medal-prizes-search"
    });
  }
});
