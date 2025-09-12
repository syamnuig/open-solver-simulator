// App entrypoint for Open Solver Simulator

const appMain = document.getElementById('app-main');
const modeBtns = {
  financial: document.getElementById('mode-financial'),
  productMix: document.getElementById('mode-product-mix')
};
let currentMode = 'financial';

function setMode(mode) {
  currentMode = mode;
  for (const key in modeBtns) {
    modeBtns[key].classList.toggle('active', key === mode);
  }
  renderMain();
}

for (const [key, btn] of Object.entries(modeBtns)) {
  btn.onclick = () => setMode(key);
}

function renderMain() {
  appMain.innerHTML = '';
  if (currentMode === 'financial') renderFinancialUI();
  else renderProductMixUI();
}

// --- FINANCIAL PLANNING UI ---
function renderFinancialUI() {
  appMain.innerHTML = `
    <section class="card">
      <h2><span class="material-icons" style="vertical-align:middle;">calculate</span>
        Financial Planning Optimizer</h2>
      <form id="financial-form">
        <label for="goal">Goal (e.g., Target Amount):</label>
        <input type="number" id="goal" required placeholder="Target (e.g., 100000)">
        <label for="years">Years:</label>
        <input type="number" id="years" required placeholder="Years (e.g., 5)">
        <label for="rate">Expected Annual Return (%)</label>
        <input type="number" id="rate" required placeholder="e.g., 8">
        <label for="budget">Initial Investment ($):</label>
        <input type="number" id="budget" required placeholder="e.g., 10000">
        <button type="submit" class="btn-primary">Optimize Plan</button>
      </form>
      <div id="financial-result"></div>
    </section>
  `;
  document.getElementById('financial-form').onsubmit = financialOptimize;
}

function financialOptimize(e) {
  e.preventDefault();
  const goal = +document.getElementById('goal').value;
  const years = +document.getElementById('years').value;
  const rate = +document.getElementById('rate').value / 100;
  const budget = +document.getElementById('budget').value;

  // Simple FV = PV*(1+r)^n; Solve for required annual contribution if not enough
  let fv = budget * Math.pow(1 + rate, years);
  let annualContribution = 0;
  if (fv < goal) {
    // PMT formula: PMT = (FV - PV*(1+r)^n) / [((1+r)^n -1)/r]
    annualContribution = (goal - fv) * rate / (Math.pow(1+rate, years) - 1);
  }

  document.getElementById('financial-result').innerHTML = `
    <div class="card" style="background:#e8f5fe;">
      <strong>Projected Value After ${years} Years:</strong> $${fv.toLocaleString()}
      <br>
      ${fv < goal
        ? `<span style="color:var(--accent);">
            You need to contribute <b>$${annualContribution.toLocaleString(undefined, {maximumFractionDigits:2})}</b> per year to reach your goal.
            </span>`
        : `<span style="color:green;">
            Congratulations! Your initial investment is enough to reach your goal.
          </span>`
      }
    </div>
  `;
}

// --- PRODUCT MIX OPTIMIZATION UI ---
function renderProductMixUI() {
  appMain.innerHTML = `
    <section class="card">
      <h2><span class="material-icons" style="vertical-align:middle;">widgets</span>
        Product Mix Optimizer</h2>
      <form id="productmix-form">
        <label>Enter Products (comma separated):</label>
        <input id="products" required placeholder="e.g., A,B,C" />
        <label>Profits per Product (comma separated, $):</label>
        <input id="profits" required placeholder="e.g., 40,30,50" />
        <label>Resource Usage Matrix (rows=resources, cols=products; CSV):</label>
        <textarea id="usage" rows="3" required placeholder="e.g., 2,1,3\n1,2,1"></textarea>
        <label>Resource Capacities (comma separated):</label>
        <input id="capacities" required placeholder="e.g., 100,80" />
        <button type="submit" class="btn-primary">Solve Mix</button>
      </form>
      <div id="productmix-result"></div>
    </section>
  `;
  document.getElementById('productmix-form').onsubmit = productMixSolve;
}

function productMixSolve(e) {
  e.preventDefault();
  const products = document.getElementById('products').value.split(',').map(s => s.trim());
  const profits = document.getElementById('profits').value.split(',').map(Number);
  const usage = document.getElementById('usage').value.trim().split('\n').map(row => row.split(',').map(Number));
  const capacities = document.getElementById('capacities').value.split(',').map(Number);

  // Build LP model for javascript-lp-solver
  const variables = {};
  for (let i = 0; i < products.length; i++) {
    variables[products[i]] = {};
    for (let j = 0; j < usage.length; j++) {
      variables[products[i]][`resource${j}`] = usage[j][i];
    }
    variables[products[i]].profit = profits[i];
  }

  const constraints = {};
  for (let j = 0; j < usage.length; j++) {
    constraints[`resource${j}`] = { max: capacities[j] };
  }

  const model = {
    optimize: "profit",
    opType: "max",
    constraints,
    variables
  };

  const result = window.solver.Solve(model);
  let output = '';
  if (result.feasible) {
    output += `<div class="card" style="background:#e8f5fe;">
      <strong>Optimal Mix:</strong><br>`;
    products.forEach(p => {
      output += `${p}: <b>${result[p] || 0}</b> units<br>`;
    });
    output += `<br><strong>Maximum Profit:</strong> $${result.result.toLocaleString()}</div>`;
  } else {
    output += `<div class="card" style="background:#ffeaea;color:var(--accent);">
      <strong>No feasible solution found. Please check your constraints.</strong>
    </div>`;
  }
  document.getElementById('productmix-result').innerHTML = output;
}

// --- Initial Render ---
renderMain();