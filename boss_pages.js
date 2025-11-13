document.addEventListener("DOMContentLoaded", () => {
  const listRoot = document.querySelector('[data-role="boss-list"]');
  const detailRoot = document.querySelector('[data-role="boss-detail"]');

  if (listRoot) {
    setupBossList(listRoot);
  }
  if (detailRoot) {
    setupBossDetail(detailRoot);
  }
});

function setupBossList(root) {
  const csvFile = root.getAttribute("data-csv");
  const detailPage = root.getAttribute("data-detail") || "boss_detail.html";
  if (!csvFile) return;

  fetch(csvFile)
    .then((res) => {
      if (!res.ok) throw new Error("CSV load failed: " + res.status);
      return res.text();
    })
    .then((text) => {
      const rows = parseCSV(text);
      if (!rows || rows.length <= 1) return;

      const header = rows[0];
      const idxBoss = header.indexOf("ボス戦名");
      const idxPlace = header.indexOf("出現場所");
      const idxHP = header.indexOf("HP");
      const idxExp = header.indexOf("経験値");
      const idxGold = header.indexOf("ゴールド");
      if (idxBoss === -1) return;

      const bosses = new Map();

      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        const bossName = cols[idxBoss] || "";
        if (!bossName) continue;

        const placeVal = idxPlace >= 0 ? (cols[idxPlace] || "") : "";
        const hpVal = idxHP >= 0 ? (cols[idxHP] || "") : "";
        const expVal = idxExp >= 0 ? (cols[idxExp] || "") : "";
        const goldVal = idxGold >= 0 ? (cols[idxGold] || "") : "";

        if (!bosses.has(bossName)) {
          bosses.set(bossName, {
            name: bossName,
            place: placeVal,
            hp: hpVal,
            exp: expVal,
            gold: goldVal,
          });
        } else {
          const info = bosses.get(bossName);
          if (!info.place && placeVal) info.place = placeVal;
          if (!info.hp && hpVal) info.hp = hpVal;
          if (!info.exp && expVal) info.exp = expVal;
          if (!info.gold && goldVal) info.gold = goldVal;
        }
      }

      const table = document.createElement("table");
      table.className = "boss-index-table";

      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      ["ボス戦名", "出現場所", "HP", "経験値", "ゴールド"].forEach((label) => {
        const th = document.createElement("th");
        th.textContent = label;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      for (const { name, place, hp, exp, gold } of bosses.values()) {
        const tr = document.createElement("tr");

        const tdName = document.createElement("td");
        const a = document.createElement("a");
        a.textContent = name;
        a.href = detailPage + "?boss=" + encodeURIComponent(name);
        tdName.appendChild(a);

        const tdPlace = document.createElement("td");
        tdPlace.textContent = place || "";

        const tdHP = document.createElement("td");
        tdHP.textContent = hp || "";

        const tdExp = document.createElement("td");
        tdExp.textContent = exp || "";

        const tdGold = document.createElement("td");
        tdGold.textContent = gold || "";

        tr.appendChild(tdName);
        tr.appendChild(tdPlace);
        tr.appendChild(tdHP);
        tr.appendChild(tdExp);
        tr.appendChild(tdGold);

        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      root.appendChild(table);
    })
    .catch((err) => {
      console.error(err);
    });
}

function setupBossDetail(root) {
  const csvFile = root.getAttribute("data-csv");
  if (!csvFile) return;

  const params = new URLSearchParams(window.location.search);
  const bossName = params.get("boss");
  if (!bossName) {
    root.textContent = "ボスが指定されていません。";
    return;
  }

  fetch(csvFile)
    .then((res) => {
      if (!res.ok) throw new Error("CSV load failed: " + res.status);
      return res.text();
    })
    .then((text) => {
      const rows = parseCSV(text);
      if (!rows || rows.length <= 1) {
        root.textContent = "データが見つかりません。";
        return;
      }

      const header = rows[0];
      const idxBoss = header.indexOf("ボス戦名");
      const idxUnit = header.indexOf("個体名");
      const idxCount = header.indexOf("体数");
      const idxHP = header.indexOf("HP");
      const idxExp = header.indexOf("経験値");
      const idxGold = header.indexOf("ゴールド");
      const idxPlace = header.indexOf("出現場所");
      const idxNote = header.indexOf("特徴メモ");
      const idxSrc = header.indexOf("参考元");

      if (idxBoss === -1) {
        root.textContent = "ボス名の列が見つかりません。";
        return;
      }

      const units = [];
      let place = "";
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i];
        if (!cols[idxBoss] || cols[idxBoss] !== bossName) continue;

        const unit = {
          unit: idxUnit >= 0 ? (cols[idxUnit] || "") : "",
          count: idxCount >= 0 ? (cols[idxCount] || "") : "",
          hp: idxHP >= 0 ? (cols[idxHP] || "") : "",
          exp: idxExp >= 0 ? (cols[idxExp] || "") : "",
          gold: idxGold >= 0 ? (cols[idxGold] || "") : "",
          place: idxPlace >= 0 ? (cols[idxPlace] || "") : "",
          note: idxNote >= 0 ? (cols[idxNote] || "") : "",
          src: idxSrc >= 0 ? (cols[idxSrc] || "") : "",
        };
        if (!place && unit.place) place = unit.place;
        units.push(unit);
      }

      if (!units.length) {
        root.textContent = "指定されたボスのデータが見つかりません。";
        return;
      }

      const h2 = document.createElement("h2");
      h2.textContent = bossName;
      root.appendChild(h2);

      if (place) {
        const pPlace = document.createElement("p");
        pPlace.textContent = "出現場所：" + place;
        root.appendChild(pPlace);
      }

      const table = document.createElement("table");
      table.className = "boss-detail-table";
      const thead = document.createElement("thead");
      const trh = document.createElement("tr");
      ["個体名", "体数", "HP", "経験値", "ゴールド", "特徴メモ", "参考元"].forEach((label) => {
        const th = document.createElement("th");
        th.textContent = label;
        trh.appendChild(th);
      });
      thead.appendChild(trh);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      for (const u of units) {
        const tr = document.createElement("tr");
        const cols = [
          u.unit,
          u.count,
          u.hp,
          u.exp,
          u.gold,
          u.note,
          u.src,
        ];
        cols.forEach((val) => {
          const td = document.createElement("td");
          td.textContent = val || "";
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      }
      table.appendChild(tbody);
      root.appendChild(table);
    })
    .catch((err) => {
      console.error(err);
      root.textContent = "読み込み中にエラーが発生しました。";
    });
}

// simple CSV parser (no external library)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(current);
        current = "";
      } else if (c === "\r") {
        // ignore
      } else if (c === "\n") {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      } else {
        current += c;
      }
    }
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    rows.push(row);
  }

  return rows;
}
