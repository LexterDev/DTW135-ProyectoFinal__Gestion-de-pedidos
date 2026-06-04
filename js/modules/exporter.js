/*
* Exporta los datos a CSV.
*/

function toCSV(rows, filename = 'export') {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines   = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h];
        return val === null || val === undefined ? '' : String(val);
      }).join(',')
    ),
  ];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  _download(blob, `${filename}.csv`);
}

function _download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default { toCSV };

