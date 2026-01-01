export function exportToCSV(data: any[], filename = "export.csv") {
  const rows = data || [];

  if (!rows.length) {
    // fallback to JSON when no rows
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.csv$/i, ".json");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return;
  }

  // collect all keys
  const keys = rows.reduce((acc: string[], row) => {
    Object.keys(row).forEach((k) => {
      if (!acc.includes(k)) acc.push(k);
    });
    return acc;
  }, [] as string[]);

  const csv = [keys.join(",")]
    .concat(
      rows.map((row) =>
        keys
          .map((k) => {
            const v = row[k];
            if (v === null || v === undefined) return "";
            if (typeof v === "object") return '"' + JSON.stringify(v).replace(/"/g, '""') + '"';
            return String(v).replace(/"/g, '""');
          })
          .join(",")
      )
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportToJSON(data: any[], filename = "export.json") {
  const blob = new Blob([JSON.stringify(data || [], null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default { exportToCSV, exportToJSON };