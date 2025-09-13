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
            <input type="number" id="goal" required placeholder="e.g., 100000" min="0">
          </div>
          <div class="financial-form-row">
            <label for="months">Months:</label>
            <input type="number" id="months" required placeholder="e.g., 60" min="1">
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
    const months = parseInt(root.querySelector("#months").value) || 1;
    const rate = parseFloat(root.querySelector("#rate").value) || 0;
    const budget = parseFloat(root.querySelector("#budget").value) || 0;

    let r = rate / 100 / 12; // monthly rate
    let n = months; // direct, since input is now months
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
        To reach your goal of <strong>€${goal.toLocaleString()}</strong> in <strong>${months} months</strong> with an initial investment of <strong>€${budget.toLocaleString()}</strong> and an expected annual return of <strong>${rate}%</strong>:
        <span class="result-main">
          Invest <strong>€${monthly.toFixed(2)}</strong> per month
        </span>
        <small>(Assumes compounded monthly; for illustration purposes only.)</small>
      </div>
      `
      : `
      <div class="result-block" style="color:#e43f5a;">
        <strong>Please check your inputs.</strong> Goal should be greater than initial investment, and months > 0.
      </div>
      `;
  };
}

// --- PRODUCT MIX OPTIMIZATION: dynamic resources and products ---
function renderProductMix() {
  // Initial state
  let resources = [
    { name: "Resource 1", stock: 100 }
  ];
  let products = [
    { name: "Product A", profit: 20, resourceMap: [{ resourceIdx: 0, amount: 1 }] }
  ];

  function rerender() {
    // Set CSS variable for dynamic grid columns
    document.documentElement.style.setProperty('--resource-count', resources.length);

    root.innerHTML = `
      <div class="material-card" id="product-mix-card">
        <button class="back-btn" title="Back" aria-label="Back">
          <span class="material-icons">arrow_back</span> Back
        </button>
        <div class="app-content-title">Product Mix Optimization</div>
        <form id="product-mix-form" autocomplete="off">
          <div class="form-section-title">Resources</div>
          <div class="resource-input-grid">
            <div class="resource-input-header">
              <span>Resource Name</span>
              <span>Inventory Stock</span>
              <span></span>
            </div>
            <div id="resource-list"></div>
            <button type="button" id="add-resource-btn" ${resources.length >= 5 ? 'disabled style="opacity:.5;cursor:not-allowed;"' : ''}>Add Resource</button>
          </div>
          <div class="divider"></div>
          <div class="form-section-title">Products</div>
          <div class="product-input-grid">
            <div class="product-input-header">
              <span>Product Name</span>
              <span>Profit per unit (€)</span>
              ${resources.map(r => `<span>${r.name} / unit</span>`).join('')}
              <span></span>
            </div>
            <div id="products-list"></div>
            <button type="button" id="add-product-btn">Add Product</button>
          </div>
          <button class="calc-btn" type="submit">Optimize Mix</button>
        </form>
        <div id="product-mix-result"></div>
      </div>
      <div class="tool-usage-note">
        <b>How to use this tool:</b><br>
        - Define resources (e.g., machines, workers, materials) and their inventory stock (max 5 resources).<br>
        - For each product, enter profit per unit and specify, for each resource, how much is required per unit produced.<br>
        - Click "Optimize Mix" to calculate the optimal product quantities for maximum profit without exceeding any resource inventory.<br>
        <br>
        <b>Note:</b> All values should be non-negative. At least one resource and one product are required. Results are computed using linear programming.
      </div>
    `;

    root.querySelector('.back-btn').onclick = renderSelector;

    // Render resources
    renderResources();
    // Render products
    renderProducts();

    // Add resource
    root.querySelector("#add-resource-btn").onclick = function() {
      if (resources.length < 5) {
        resources.push({ name: `Resource ${resources.length + 1}`, stock: 0 });
        // For every product, add a new resource entry to resourceMap
        products.forEach(prod => prod.resourceMap.push({ resourceIdx: resources.length - 1, amount: 0 }));
        rerender();
      }
    };

    // Add product
    root.querySelector("#add-product-btn").onclick = function() {
      let newResourceMap = resources.map((r, i) => ({ resourceIdx: i, amount: 0 }));
      products.push({ name: `Product ${String.fromCharCode(65 + products.length)}`, profit: 0, resourceMap: newResourceMap });
      rerender();
    };

    // Handle optimization
    root.querySelector("#product-mix-form").onsubmit = function(e) {
      e.preventDefault();

      // Build model
      let model = {
        optimize: "profit",
        opType: "max",
        constraints: {},
        variables: {}
      };

      // Constraints: for each resource
      resources.forEach((resource, rIdx) => {
        model.constraints[resource.name] = { max: parseFloat(resource.stock) || 0 };
      });

      // Variables: for each product
      products.forEach((prod, pIdx) => {
        let prodVars = { profit: parseFloat(prod.profit) || 0 };
        prod.resourceMap.forEach((rm) => {
          let rname = resources[rm.resourceIdx]?.name || `R${rm.resourceIdx+1}`;
          prodVars[rname] = parseFloat(rm.amount) || 0;
        });
        model.variables[prod.name] = prodVars;
      });

      // Solve
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
        output += `${prod.name}: <b>${result[prod.name] ? result[prod.name].toFixed(2) : 0}</b> units<br>`;
      });
      output += `<br><b>Total Profit:</b> €${result.result.toFixed(2)}</div>`;
      root.querySelector("#product-mix-result").innerHTML = output;
    };
  }

  // PATCH: Only rerender product headers when resource name edit is finished (not on every keystroke)
  function renderResources() {
    const container = root.querySelector("#resource-list");
    container.innerHTML = resources.map((res, idx) => `
      <div class="resource-input-row" data-idx="${idx}">
        <input type="text" placeholder="Resource Name" value="${res.name}" required aria-label="Resource Name">
        <input type="number" min="0" step="0.01" placeholder="Stock" value="${res.stock}" required aria-label="Inventory Stock">
        <button type="button" class="remove-btn" title="Remove" ${resources.length <= 1 ? 'disabled' : ''}>
          <span class="material-icons">close</span>
        </button>
      </div>
    `).join("");
    Array.from(container.querySelectorAll('.resource-input-row')).forEach((row, idx) => {
      const nameInput = row.querySelectorAll('input')[0];
      nameInput.oninput = e => {
        resources[idx].name = e.target.value;
        // Do NOT rerender here!
      };
      nameInput.onblur = () => {
        rerender();
      };
      nameInput.onkeydown = (ev) => {
        if (ev.key === "Enter") {
          nameInput.blur();
        }
      };

      row.querySelectorAll('input')[1].oninput = e => resources[idx].stock = parseFloat(e.target.value) || 0;
      row.querySelector('.remove-btn').onclick = function() {
        if (resources.length > 1) {
          resources.splice(idx, 1);
          products.forEach(prod => prod.resourceMap.splice(idx, 1));
          rerender();
        }
      };
    });
  }

  function renderProducts() {
    const container = root.querySelector("#products-list");
    container.innerHTML = products.map((prod, pIdx) => `
      <div class="product-input-row" data-idx="${pIdx}">
        <input type="text" placeholder="Product Name" value="${prod.name}" required aria-label="Product Name">
        <input type="number" min="0" step="0.01" placeholder="Profit (€)" value="${prod.profit}" required aria-label="Profit per unit (€)">
        ${
          resources.map((res, rIdx) => {
            return `<input type="number" min="0" step="0.01" placeholder="${res.name} / unit" value="${prod.resourceMap[rIdx]?.amount ?? 0}" required aria-label="${res.name} per unit">`
          }).join("")
        }
        <button type="button" class="remove-btn" title="Remove" ${products.length <= 1 ? 'disabled' : ''}>
          <span class="material-icons">close</span>
        </button>
      </div>
    `).join("");
    Array.from(container.querySelectorAll('.product-input-row')).forEach((row, pIdx) => {
      row.querySelectorAll('input')[0].oninput = e => products[pIdx].name = e.target.value;
      row.querySelectorAll('input')[1].oninput = e => products[pIdx].profit = parseFloat(e.target.value) || 0;
      // Resource per unit
      for (let rIdx = 0; rIdx < resources.length; ++rIdx) {
        row.querySelectorAll('input')[2 + rIdx].oninput = e => {
          products[pIdx].resourceMap[rIdx].amount = parseFloat(e.target.value) || 0;
        };
      }
      row.querySelector('.remove-btn').onclick = function() {
        if (products.length > 1) {
          products.splice(pIdx, 1);
          rerender();
        }
      };
    });
  }

  rerender();
}

renderSelector();