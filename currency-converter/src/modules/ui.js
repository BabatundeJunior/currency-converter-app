export function fillOptions(select, codes){
  select.innerHTML = codes.map(c => `<option value="${c}">${c}</option>`).join('');
}

export function showResult(node, amount, from, to, result, rate){
  node.innerHTML = `
    <div class="fade-in">
      <div>${Number(amount).toFixed(2)} ${from} = <span class="text-primary">${result?.toFixed(4)}</span> ${to}</div>
      <div class="small text-muted">Rate: 1 ${from} = ${rate?.toFixed(6)} ${to}</div>
    </div>`;
}
export function showError(node, msg){ node.innerHTML = `<div class="text-danger">${msg}</div>`; }
