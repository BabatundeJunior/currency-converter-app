
const API_KEY = '2121d7e9de829ef950331e93'; 
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const amountInput = document.getElementById("amount");
const convertBtn = document.getElementById("convertBtn");
const resultDiv = document.getElementById("result");

// Populate currency dropdowns
async function loadCurrencies() {
  try {
    const res = await fetch(API_URL + "USD"); // Base call to get currency codes
    const data = await res.json();
    const codes = Object.keys(data.conversion_rates);

    codes.forEach(code => {
      const option1 = new Option(code, code);
      const option2 = new Option(code, code);
      fromCurrency.add(option1);
      toCurrency.add(option2);
    });

    // Set default
    fromCurrency.value = "USD";
    toCurrency.value = "EUR";
  } catch (err) {
    console.error("Error loading currencies", err);
  }
}

// 2Convert currency
// 2) Convert currency  (patched: also saves to localStorage)
async function convertCurrency(e) {
  if (e) e.preventDefault();

  const amount = parseFloat(amountInput.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    resultDiv.innerHTML = `<p class="text-danger">Enter a valid amount</p>`;
    return;
  }

  try {
    const res = await fetch(API_URL + fromCurrency.value);
    if (!res.ok) throw new Error('Rate fetch failed');
    const data = await res.json();

    const rate = data.conversion_rates?.[toCurrency.value];
    if (!Number.isFinite(rate)) {
      resultDiv.innerHTML = `<p class="text-danger">Rate not available for ${fromCurrency.value} → ${toCurrency.value}</p>`;
      return;
    }

    const result = amount * rate;              // keep number for history
    const display = result.toFixed(2);         // format for UI

    resultDiv.innerHTML = `
      <div class="conversion-result">
        <p class="fs-4 fw-bold">${amount} ${fromCurrency.value} = ${display} ${toCurrency.value}</p>
        <p class="text-muted">Rate: 1 ${fromCurrency.value} = ${rate} ${toCurrency.value}</p>
      </div>
    `;

    // SAVE to localStorage (this was missing)
    saveToHistory({
      amount,
      from: fromCurrency.value,
      to:   toCurrency.value,
      rate,
      result
    });

  } catch (err) {
    console.error("Error converting currency", err);
    resultDiv.innerHTML = `<p class="text-danger">Failed to convert. Try again.</p>`;
  }
}


loadCurrencies();
convertBtn.addEventListener("click", convertCurrency);

const swapBtn = document.getElementById('swapBtn');

function swapCurrencies() {
  const tmp = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = tmp;

  // If there’s a valid amount, auto-recalculate
  const amt = parseFloat(amountInput.value);
  if (amt) {
    convertBtn.click();
  }
}

// Click + keyboard support
swapBtn.addEventListener('click', swapCurrencies);
swapBtn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    swapCurrencies();
  }
});


// ===== CONFIG =====
/* ========= Live Rates (no charts) ========= */
const LATEST_URL = (base) => `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${base}`;

const MAJORS = [
  { code: "USD", name: "US Dollar",        flag: "us" },
  { code: "EUR", name: "Euro",             flag: "eu" },
  { code: "GBP", name: "British Pound",    flag: "gb" },
  { code: "JPY", name: "Japanese Yen",     flag: "jp" },
  { code: "CAD", name: "Canadian Dollar",  flag: "ca" },
  { code: "AUD", name: "Australian Dollar",flag: "au" },
  { code: "CHF", name: "Swiss Franc",      flag: "ch" },
  { code: "CNY", name: "Chinese Yuan",     flag: "cn" },
];

const baseCurrencySelect = document.getElementById("baseCurrency");
const liveRatesList = document.getElementById("liveRatesList");

/** Detect local currency by IP */
async function detectLocalCurrency() {
  try {
    const res = await fetch("https://ipwho.is/");
    const data = await res.json();
    return data?.currency?.code || null;
  } catch {
    return null;
  }
}

/** Populate dropdown */
async function initBaseOptions() {
  try {
    const res = await fetch(LATEST_URL("USD"));
    const data = await res.json();
    const codes = Object.keys(data.conversion_rates || {}).sort();
    baseCurrencySelect.innerHTML = codes.map(c => `<option value="${c}">${c}</option>`).join('');

    // Set detected local currency if possible
    const local = await detectLocalCurrency();
    baseCurrencySelect.value = codes.includes(local) ? local : "USD";
  } catch {
    baseCurrencySelect.innerHTML = `<option value="USD">USD</option>`;
  }
}

/** Render rates list */
function renderRatesList(base, rates) {
  liveRatesList.innerHTML = "";
  MAJORS.filter(m => m.code !== base).forEach(m => {
    const li = document.createElement("li");
    li.className = "list-group-item rate-row";

    const flagURL = `https://flagcdn.com/24x18/${m.flag}.png`;
    li.innerHTML = `
      <div class="rate-name">
        <img class="rate-flag" src="${flagURL}" alt="${m.name} flag" width="24" height="18">
        <span>${m.name}</span>
      </div>
      <div class="rate-value">${rates[m.code] ? rates[m.code].toFixed(4) : "—"} ${base}</div>
    `;
    liveRatesList.appendChild(li);
  });
}

/** Fetch and update UI */
async function updateLiveRatesUI(base) {
  try {
    const res = await fetch(LATEST_URL(base));
    const data = await res.json();
    const rates = data.conversion_rates || {};
    renderRatesList(base, rates);
  } catch (e) {
    liveRatesList.innerHTML = `<li class="list-group-item text-danger">Failed to load rates.</li>`;
  }
}

/** Init */
(async function initLiveSection() {
  await initBaseOptions();
  await updateLiveRatesUI(baseCurrencySelect.value);

  baseCurrencySelect.addEventListener("change", e => {
    updateLiveRatesUI(e.target.value);
  });
})();



// News Section Logic
const GNEWS_KEY = '18bcc9a285965be9fcaf07f57b24bb8e';
const GNEWS_URL = `https://gnews.io/api/v4/search?q=currency&lang=en&country=us&max=5&apikey=${GNEWS_KEY}`;
async function loadNews() {
  try {
    const res = await fetch(GNEWS_URL);
    const data = await res.json();

    const container = document.getElementById("newsList");
    container.innerHTML = "";

    (data.articles || []).forEach(article => {
      const col = document.createElement("div");
      col.className = "col-md-4";

      col.innerHTML = `
        <div class="news-card h-100 shadow-sm">
          <img src="${article.image}" alt="News Image">
          <div class="p-2">
            <h6 class="fw-bold">${article.title}</h6>
            <p>${article.description || ""}</p>
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-primary">Read More</a>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

  } catch (error) {
    console.error("Error loading news:", error);
  }
}

loadNews();

// ---- Conversion History (LocalStorage) ----
const LS_KEY = 'conversionHistory_v1';

function readHistory() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

function writeHistory(items) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

/** Save one successful conversion */
function saveToHistory({ amount, from, to, rate, result }) {
  const items = readHistory();
  items.push({
    amount: Number(amount),
    from,
    to,
    rate: Number(rate),
    result: Number(result),
    ts: Date.now()
  });
  writeHistory(items);
}

document.getElementById("year").textContent = new Date().getFullYear();

