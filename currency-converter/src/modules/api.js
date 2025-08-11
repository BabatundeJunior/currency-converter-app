const BASE = 'https://api.exchangerate.host';

export async function getSymbols(){
  const res = await fetch(`${BASE}/symbols`);
  if(!res.ok) throw new Error('Failed to load symbols');
  const { symbols } = await res.json();
  return Object.keys(symbols); // ["USD","EUR",...]
}

export async function convert(from, to, amount){
  const url = `${BASE}/convert?from=${from}&to=${to}&amount=${amount}`;
  const res = await fetch(url);
  if(!res.ok) throw new Error('Conversion failed');
  const data = await res.json();
  return { result: data.result, rate: data.info?.rate };
}
