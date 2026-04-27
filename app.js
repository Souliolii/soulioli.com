const apiBase = 'https://prices.runescape.wiki/api/v1/osrs/latest?id=';

const formatGp = (value) => `${Number(value).toLocaleString()} gp`;

const createMaterialRow = () => {
  const row = document.createElement('div');
  row.className = 'material-row';
  row.innerHTML = `
    <label>
      Item ID
      <input type="number" min="1" class="item-id" placeholder="e.g. 126" />
    </label>
    <label>
      Quantity
      <input type="number" min="1" value="1" class="item-qty" />
    </label>
    <button class="remove-row" type="button" aria-label="Remove material row">×</button>
  `;
  return row;
};

const showMessage = (text, type = 'info') => {
  const output = document.querySelector('#calculator-message');
  output.textContent = text;
  output.className = `calculator-message ${type}`;
};

const fetchPrice = async (itemId) => {
  const response = await fetch(`${apiBase}${encodeURIComponent(itemId)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch price for item ${itemId}.`);
  }
  const json = await response.json();
  const entry = json.data?.[itemId];
  if (!entry) {
    throw new Error(`No price data found for item ${itemId}.`);
  }
  return entry;
};

const buildMaterialRow = ({ id, qty, high, low, subtotal }) => {
  return `
    <div class="detail-row">
      <div>${id}</div>
      <div>${qty}</div>
      <div>${formatGp(high)}</div>
      <div>${formatGp(subtotal)}</div>
    </div>
  `;
};

const calculateProfit = async () => {
  showMessage('Loading prices…', 'info');

  const outputItemId = document.querySelector('#output-id').value.trim();
  const outputQty = Number(document.querySelector('#output-qty').value) || 1;
  const rows = [...document.querySelectorAll('.material-row')];

  const materials = rows.map((row) => ({
    id: row.querySelector('.item-id').value.trim(),
    qty: Number(row.querySelector('.item-qty').value) || 0,
  })).filter((entry) => entry.id && entry.qty > 0);

  if (!outputItemId) {
    showMessage('Enter the crafted item ID.', 'error');
    return;
  }

  if (materials.length === 0) {
    showMessage('Add at least one ingredient with an item ID and quantity.', 'error');
    return;
  }

  const allIds = [...new Set(materials.map((item) => item.id).concat(outputItemId))];

  try {
    const priceResults = await Promise.all(allIds.map((id) => fetchPrice(id)));
    const priceMap = allIds.reduce((map, id, index) => {
      map[id] = priceResults[index];
      return map;
    }, {});

    let totalCost = 0;
    const materialDetails = materials.map((material) => {
      const price = priceMap[material.id];
      const subtotal = price.high * material.qty;
      totalCost += subtotal;
      return {
        ...material,
        high: price.high,
        subtotal,
      };
    });

    const outputPrice = priceMap[outputItemId];
    const revenue = outputPrice.low * outputQty;
    const profit = revenue - totalCost;
    const roi = totalCost ? ((profit / totalCost) * 100).toFixed(1) : '0.0';

    const resultElement = document.querySelector('#calculator-result');
    resultElement.innerHTML = `
      <div class="result-grid">
        <div class="result-label">Crafted item ID</div>
        <div>${outputItemId}</div>
        <div class="result-label">Output quantity</div>
        <div>${outputQty}</div>
        <div class="result-label">Sell price per item</div>
        <div>${formatGp(outputPrice.low)}</div>
        <div class="result-label">Total revenue</div>
        <div>${formatGp(revenue)}</div>
        <div class="result-label">Total cost</div>
        <div>${formatGp(totalCost)}</div>
        <div class="result-label">Profit</div>
        <div class="${profit >= 0 ? 'positive' : 'negative'}">${formatGp(profit)}</div>
        <div class="result-label">ROI</div>
        <div>${profit >= 0 ? roi : 'N/A'}%</div>
      </div>
      <div class="material-summary">
        <h3>Material costs</h3>
        <div class="detail-row header">
          <div>Item ID</div>
          <div>Qty</div>
          <div>Buy-now</div>
          <div>Cost</div>
        </div>
        ${materialDetails.map(buildMaterialRow).join('')}
      </div>
    `;

    showMessage('Price checks complete. Review the profit summary below.', 'success');
  } catch (error) {
    showMessage(error.message, 'error');
  }
};

const ensureRemoveButton = (event) => {
  const button = event.target;
  if (!button.matches('.remove-row')) return;
  const row = button.closest('.material-row');
  const container = document.querySelector('#materials');
  if (container.children.length > 1) {
    row.remove();
    showMessage('Material removed.', 'info');
  }
};

window.addEventListener('DOMContentLoaded', () => {
  const materials = document.querySelector('#materials');
  materials.appendChild(createMaterialRow());

  document.querySelector('#add-material').addEventListener('click', (event) => {
    event.preventDefault();
    materials.appendChild(createMaterialRow());
    showMessage('Added a new ingredient row.', 'info');
  });

  materials.addEventListener('click', ensureRemoveButton);
  document.querySelector('#calculate-profit').addEventListener('click', (event) => {
    event.preventDefault();
    calculateProfit();
  });
});
