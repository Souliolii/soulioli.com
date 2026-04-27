const priceApiBase = 'https://prices.runescape.wiki/api/v1/osrs/latest?id=';
const mappingApi = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const iconBase = 'https://oldschool.runescape.wiki/images/';

let itemCatalog = [];
let itemSearchIndex = [];
const itemById = new Map();
const priceCache = new Map();

const formatGp = (value) => `${Number(value).toLocaleString()} gp`;

const normalize = (value) => String(value).trim().toLowerCase();

const debounce = (callback, delay = 120) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

const createMaterialRow = () => {
  const row = document.createElement('div');
  row.className = 'material-row';
  row.innerHTML = `
    <div class="search-wrap">
      <label>
        Ingredient
        <input type="search" class="item-search" placeholder="Search item by name or paste ID" autocomplete="off" />
      </label>
      <span class="item-preview"></span>
      <ul class="search-suggestions"></ul>
      <input type="hidden" class="item-id" />
    </div>
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

// The OSRS prices API exposes a single /mapping endpoint but no dedicated search route.
// Load the mapping once and reuse the local item index for search suggestions.
const fetchMapping = async () => {
  try {
    const response = await fetch(mappingApi);
    if (!response.ok) throw new Error('Unable to load item data.');
    itemCatalog = await response.json();
    itemCatalog.forEach((item) => {
      itemById.set(String(item.id), item);
      itemSearchIndex.push({
        ...item,
        nameLower: item.name.toLowerCase(),
      });
    });
  } catch (error) {
    showMessage('Could not load item search data. Item search will be disabled.', 'error');
  }
};

const getMatches = (query) => {
  if (!query) return [];
  const normalizedQuery = normalize(query);
  const exactId = itemById.get(normalizedQuery);
  if (exactId) return [exactId];

  const substring = normalizedQuery.replace(/[^a-z0-9 ]/g, '');
  return itemSearchIndex
    .filter((item) => item.nameLower.includes(substring) || String(item.id) === substring)
    .slice(0, 10);
};

const getImageUrl = (icon) => `${iconBase}${encodeURIComponent(icon.replace(/ /g, '_'))}`;

const renderSuggestions = (searchWrap, results) => {
  const list = searchWrap.querySelector('.search-suggestions');
  list.innerHTML = results
    .map((item) => `
      <li class="search-suggestion" data-id="${item.id}" data-name="${item.name}" data-icon="${item.icon}">
        <img src="${getImageUrl(item.icon)}" alt="${item.name}" />
        <span>${item.name} <small>#${item.id}</small></span>
      </li>
    `)
    .join('');
};

const clearSuggestions = (searchWrap) => {
  const list = searchWrap.querySelector('.search-suggestions');
  if (list) list.innerHTML = '';
};

const setSelectedItem = (searchWrap, item) => {
  const searchInput = searchWrap.querySelector('input[type="search"]');
  const hiddenIdInput = searchWrap.querySelector('input[type="hidden"]');
  const preview = searchWrap.querySelector('.item-preview');

  if (!searchInput || !hiddenIdInput || !preview) return;

  searchInput.value = item.name;
  hiddenIdInput.value = item.id;
  preview.innerHTML = `
    <img src="${getImageUrl(item.icon)}" alt="${item.name}" />
    <span>${item.name}</span>
  `;
  clearSuggestions(searchWrap);
};


const formatItemName = (id) => {
  const item = itemById.get(String(id));
  return item ? `${item.name} (#${id})` : `#${id}`;
};

const formatItemLabel = (id) => {
  const item = itemById.get(String(id));
  return item ? `${item.name} (${id})` : `#${id}`;
};

const fetchPrices = async (ids) => {
  const uniqueIds = [...new Set(ids.filter(Boolean).map(String))];
  const uncachedIds = uniqueIds.filter((id) => !priceCache.has(id));

  if (uncachedIds.length > 0) {
    const response = await fetch(`${priceApiBase}${uncachedIds.map(encodeURIComponent).join(',')}`);
    if (!response.ok) {
      throw new Error('Failed to load prices from the API.');
    }

    const json = await response.json();
    const data = json.data || {};

    const missingIds = uncachedIds.filter((id) => !data[id]);
    if (missingIds.length > 0) {
      const missingNames = missingIds.map(formatItemLabel).join(', ');
      throw new Error(`No live price data found for ${missingNames}. Some items may not currently be traded on the Grand Exchange.`);
    }

    uncachedIds.forEach((id) => {
      priceCache.set(id, data[id]);
    });
  }

  const priceMap = uniqueIds.reduce((map, id) => {
    map[id] = priceCache.get(id);
    return map;
  }, {});

  const invalidValues = uniqueIds.filter((id) => {
    const price = priceMap[id];
    return !price || price.high == null || price.low == null;
  });

  if (invalidValues.length > 0) {
    const invalidNames = invalidValues.map(formatItemLabel).join(', ');
    throw new Error(`Live price values are unavailable for ${invalidNames}. Some items may not currently have GE trade history.`);
  }

  return priceMap;
};

const buildMaterialRow = ({ id, name, qty, high, subtotal }) => {
  return `
    <div class="detail-row">
      <div>${name || formatItemName(id)}</div>
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

  const materials = rows
    .map((row) => {
      const id = row.querySelector('.item-id').value.trim();
      const qty = Number(row.querySelector('.item-qty').value) || 0;
      const name = itemById.get(id)?.name || '';
      return { id, qty, name };
    })
    .filter((entry) => entry.id && entry.qty > 0);

  if (!outputItemId) {
    showMessage('Select the crafted item from search suggestions.', 'error');
    return;
  }

  if (materials.length === 0) {
    showMessage('Add at least one ingredient with a selected item and quantity.', 'error');
    return;
  }

  const allIds = [...new Set(materials.map((item) => item.id).concat(outputItemId))];

  try {
    const priceMap = await fetchPrices(allIds);

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
    const outputName = formatItemName(outputItemId);

    const resultElement = document.querySelector('#calculator-result');
    resultElement.innerHTML = `
      <div class="result-grid">
        <div class="result-label">Crafted item</div>
        <div>${outputName}</div>
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
          <div>Item</div>
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

const findSearchWrap = (element) => element.closest('.search-wrap');

const handleSearchInput = (event) => {
  const input = event.target.closest('.item-search');
  if (!input) return;
  const searchWrap = findSearchWrap(input);
  if (!searchWrap) return;

  const query = input.value.trim();
  const results = query ? getMatches(query) : [];
  renderSuggestions(searchWrap, results);
};

const handleSuggestionClick = (event) => {
  const suggestion = event.target.closest('.search-suggestion');
  if (!suggestion) return;
  const searchWrap = findSearchWrap(suggestion);
  const item = {
    id: suggestion.dataset.id,
    name: suggestion.dataset.name,
    icon: suggestion.dataset.icon,
  };
  setSelectedItem(searchWrap, item);
};

const handleGlobalClick = (event) => {
  const isInsideSearch = event.target.closest('.search-wrap');
  if (!isInsideSearch) {
    document.querySelectorAll('.search-suggestions').forEach((list) => {
      list.innerHTML = '';
    });
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  await fetchMapping();
  const materials = document.querySelector('#materials');
  materials.appendChild(createMaterialRow());

  document.querySelector('#add-material').addEventListener('click', (event) => {
    event.preventDefault();
    materials.appendChild(createMaterialRow());
    showMessage('Added a new ingredient row.', 'info');
  });

  const debouncedSearch = debounce(handleSearchInput, 100);

  materials.addEventListener('input', debouncedSearch);

  document.querySelector('#output-search').addEventListener('input', debouncedSearch);
  document.querySelector('#output-search').addEventListener('click', handleSearchInput);

  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('click', (event) => {
    if (event.target.closest('.search-suggestion')) handleSuggestionClick(event);
  });

  document.querySelector('#calculate-profit').addEventListener('click', (event) => {
    event.preventDefault();
    calculateProfit();
  });
  document.querySelector('#calculate-profit').disabled = false;
});
