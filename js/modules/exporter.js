/*
* Exporta los datos a CSV.
* Agregamos opción para exportar a JSON.
* Corregimos el manejo de comillas en CSV.
*/

function toJSON(data, filename = 'export') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  _download(blob, `${filename}.json`);
}

function toCSV(rows, filename = 'export') {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines   = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => _csvCell(row[h])).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  _download(blob, `${filename}.csv`);
}

function _csvCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value).replace(/"/g, '""');
  return /[",\r\n]/.test(str) ? `"${str}"` : str;
}

function _download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default { toJSON, toCSV };
