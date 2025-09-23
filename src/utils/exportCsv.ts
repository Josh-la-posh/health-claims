/**
 * Export JSON data to a downloadable CSV file.
 * @param filename The name of the file to save as (e.g. "transactions.csv")
 * @param headers Array of column headers (string[])
 * @param rows Array of row arrays (string[][])
 */
export function exportToCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const safe = (val: string | number | boolean | null | undefined): string => {
    if (val == null) return "";
    // Escape quotes by doubling them
    const str = String(val).replace(/"/g, '""');
    // Wrap in quotes if contains comma or newline
    if (/[",\n]/.test(str)) return `"${str}"`;
    return str;
  };

  const csv = [headers, ...rows].map((r) => r.map(safe).join(",")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
