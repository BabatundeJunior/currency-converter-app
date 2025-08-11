const LS_KEY = 'conversionHistory_v1';

function readHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function fmt(n) {
  return Number(n).toFixed(2);
}

function renderHistory() {
  const tableBody = document.getElementById('historyTableBody');
  const history = readHistory();

  tableBody.innerHTML = '';

  if (history.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No history yet</td></tr>`;
    return;
  }

  history.slice().reverse().forEach(item => {
    const date = new Date(item.ts).toLocaleString();
    const row = `
      <tr>
        <td>${date}</td>
        <td>${fmt(item.amount)} ${item.from}</td>
        <td>${item.to}</td>
        <td>${fmt(item.rate)}</td>
        <td>${fmt(item.result)}</td>
      </tr>
    `;
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

// 🆕 Clear history
function clearHistory() {
  localStorage.removeItem(LS_KEY);
  renderHistory();
}

document.getElementById('clearHistory').addEventListener('click', clearHistory);

renderHistory();
