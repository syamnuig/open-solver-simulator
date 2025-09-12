const root = document.getElementById('app-root');

const apps = [
  { id: 'financial', label: 'Financial Planning' },
  { id: 'product-mix', label: 'Product Mix Optimization' }
];

function renderSelector() {
  root.innerHTML = `
    <div class="material-card" id="selector-card">
      <div class="heading">Open Solver Simulator</div>
      <div class="selector-btns">
        <button class="selector-btn" data-app="financial">${apps[0].label}</button>
        <button class="selector-btn" data-app="product-mix">${apps[1].label}</button>
      </div>
    </div>
  `;
  root.querySelectorAll('.selector-btn').forEach(btn => {
    btn.onclick = () => {
      if (btn.dataset.app === 'financial') renderFinancialUI();
      else renderProductMix();
    };
  });
}

// --- FINANCIAL PLANNING UI (Version 1 logic/fields, improved UI, euro symbol) ---
function renderFinancialUI() {
  root.innerHTML = `
    <div class="material-card" id="financial-card">
      <button class="back-btn" title="Back" aria-label="Back">
        <span class="material-icons">arrow_back</span> Back
      </button>
      <div class="app-content-title">Financial Planning Optimizer</div>
      <form id="financial-form" autocomplete="off">
        <div class="financial-form-2col">
          <div class="financial-form-row">
            <label for="goal">Goal (e.g., Target Amount):</label>
            <input type="number" id="goal" required placeholder="Target (e.g., 100000)" min="0">
          </div>
          <div class="financial-form-row">
            <label for="years">Years:</label>
            <input type="number" id="years" required placeholder="Years (e.g., 5)" min="1">
          </div>
          <div class="financial-form-row">
            <label for="rate">Expected Annual Return (%):</label>
            <input type="number" id="rate" required placeholder="e.g., 8" step="0.01">
          </div>
          <div class="financial-form-row">
            <label for="budget">Initial Investment (€):</label>
            <input type="number" id="budget" required placeholder="e.g., 10000" min="0">
          </div>
        </div>
        <button type="submit" class="calc-btn">Optimize Plan</button>
      </form>
      <div id="financial-result"></div>
    </div>
  `;
  root.querySelector('.back-btn').onclick = renderSelector;

  root.querySelector("#financial-form").onsubmit = function (e) {
    e.preventDefault();
    const goal = parseFloat(root.querySelector("#goal").value) || 0;
    const years = parseInt(root.querySelector("#years").value) || 1;
    const rate = parseFloat(root.querySelector("#rate").value) || 0;
    const budget = parseFloat(root.querySelector("#budget").value) || 0;

    let r = rate / 100 / 12; // monthly rate
    let n = years * 12;
    let FV = goal;
    let PV = budget;
    let monthly;
    if (r > 0) {
      monthly = (FV - PV * Math.pow(1 + r, n)) * r / (Math.pow(1 + r, n) - 1);
    } else {
      monthly = (FV - PV) / n;
    }

    let showResult = monthly > 0 && isFinite(monthly) && n > 0 && FV > PV;
    root.querySelector("#financial-result").innerHTML = showResult
      ? `
      <div class="result-block">
        To reach your goal of <strong>€${goal.toLocaleString()}</strong> in <strong>${years} years</strong> with an initial investment of <strong>€${budget.toLocaleString()}</strong> and an expected annual return of <strong>${rate}%</strong>:
        <span class="result-main">
          Invest <strong>€${monthly.toFixed(2)}</strong> per month
        </span>
        <small>(Assumes compounded monthly; for illustration purposes only.)</small>
      </div>
      `
      : `
      <div class="result-block" style="color:#e43f5a;">
        <strong>Please check your inputs.</strong> Goal should be greater than initial investment, and years > 0.
      </div>
      `;
  };
}

// --- Product Mix Optimization Application ---
function renderProductMix() {
  root.innerHTML = `
    <div class="material-card" id="product-mix-card">
      <button class="back-btn" title="Back" aria-label="Back">
        <span class="material-icons">arrow_back</span> Back
      </button>
      <div class="app-content-title">Product Mix Optimization</div>
      <form id="product-mix-form" autocomplete="off">
        <div class="form-section-title">Products</div>
        <div id="products-list"></div>
        <button type="button" class="add-btn" id="add-product-btn" style="margin-bottom:0.8rem;">Add Product</button>
        <div class="divider"></div>
        <div class="form-section-title">Constraints</div>
        <div class="form-row">
          <label for="resource-limit">Total Resource Limit:</label>
          <input id="resource-limit" type="number" min="0" step="0.01" value="100" />
        </div>
        <button class="calc-btn" type="submit">Optimize Mix</button>
      </form>
      <div id="product-mix-result"></div>
    </div>
  `;
  root.querySelector('.back-btn').onclick = renderSelector;

  let products = [
    { name: "Product A", profit: 20, resource: 10, quantity: 0 },
    { name: "Product B", profit: 30, resource: 20, quantity: 0 }
  ];
  renderProducts();

  function renderProducts() {
    const container = root.querySelector("#products-list");
    container.innerHTML = products.map((prod, idx) => `
      <div class="form-row" data-idx="${idx}">
        <input placeholder="Name" type="text" value="${prod.name}" style="flex:1.2;" required />
        <input placeholder="Profit" type="number" min="0" step="0.01" value="${prod.profit}" style="width:70px;" required />
        <input placeholder="Resource" type="number" min="0" step="0.01" value="${prod.resource}" style="width:70px;" required />
        <button type="button" class="remove-btn" title="Remove" ${products.length <= 1 ? 'disabled style="opacity:0.3;cursor:default;"' : ''}>
          <span class="material-icons">close</span>
        </button>
      </div>
    `).join("");

    Array.from(container.querySelectorAll('.form-row')).forEach((row, idx) => {
      row.querySelectorAll('input')[0].oninput = e => products[idx].name = e.target.value;
      row.querySelectorAll('input')[1].oninput = e => products[idx].profit = parseFloat(e.target.value) || 0;
      row.querySelectorAll('input')[2].oninput = e => products[idx].resource = parseFloat(e.target.value) || 0;
      row.querySelector('.remove-btn').onclick = function() {
        if (products.length > 1) {
          products.splice(idx, 1);
          renderProducts();
        }
      };
    });
  }

  root.querySelector("#add-product-btn").onclick = function() {
    products.push({ name: "Product " + String.fromCharCode(65 + products.length), profit: 0, resource: 0, quantity: 0 });
    renderProducts();
  };

  root.querySelector("#product-mix-form").onsubmit = function (e) {
    e.preventDefault();
    const limit = parseFloat(root.querySelector("#resource-limit").value) || 0;
    const model = {
      optimize: "profit",
      opType: "max",
      constraints: { resource: { "max": limit } },
      variables: {}
    };
    products.forEach((prod, idx) => {
      model.variables[prod.name] = { profit: prod.profit, resource: prod.resource };
    });

    let result;
    try {
      result = solver.Solve(model);
    } catch {
      result = null;
    }
    if (!result || !result.feasible) {
      root.querySelector("#product-mix-result").innerHTML = `<div class="result-block" style="color:#e43f5a;">No feasible solution found.</div>`;
      return;
    }

    let output = `<div class="result-block"><b>Optimal Product Mix:</b><br>`;
    products.forEach(prod => {
      output += `${prod.name}: <b>${result[prod.name] ? result[prod.name].toFixed(2) : 0}</b><br>`;
    });
    output += `<br><b>Total Profit:</b> €${result.result.toFixed(2)}</div>`;
    root.querySelector("#product-mix-result").innerHTML = output;
  };
}

renderSelector();