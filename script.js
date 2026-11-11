// ===== Menu data =====
// Each meal has full macros (calories, protein, carbs, fat in grams)
// plus a category tag and a list of diet/allergen tags.
const meals = [
  {
    id: 1, name: "Chicken burrito bowl", tag: "High protein",
    calories: 620, protein: 48, carbs: 65, fat: 19,
    diet: ["Gluten-free", "Nut-free", "Halal"],
    image: "images/chicken-burrito-bowl.jpg"
  },
  {
    id: 2, name: "Teriyaki salmon & rice", tag: "High protein",
    calories: 580, protein: 40, carbs: 60, fat: 20,
    diet: ["Dairy-free", "Nut-free"],
    image: "images/teriyaki-salmon.jpg"
  },
  {
    id: 3, name: "Turkey meatballs & pasta", tag: "Comfort",
    calories: 650, protein: 45, carbs: 70, fat: 21,
    diet: ["Nut-free"],
    image: "images/turkey-meatballs.jpg"
  },
  {
    id: 4, name: "Chickpea curry", tag: "Vegetarian",
    calories: 520, protein: 22, carbs: 68, fat: 18,
    diet: ["Vegetarian", "Gluten-free", "Dairy-free", "Nut-free", "Halal"],
    image: "images/chickpea-curry.jpg"
  },
  {
    id: 5, name: "Steak & sweet potato", tag: "High protein",
    calories: 700, protein: 52, carbs: 55, fat: 30,
    diet: ["Gluten-free", "Dairy-free", "Nut-free", "Halal"],
    image: "images/steak-sweet-potato.jpg"
  },
  {
    id: 6, name: "Tofu stir fry", tag: "Vegetarian",
    calories: 480, protein: 28, carbs: 45, fat: 21,
    diet: ["Vegetarian", "Dairy-free", "Nut-free"],
    image: "images/tofu-stir-fry.jpg"
  }
];

// ===== Filters =====
// Each filter has a test function that returns true if a meal matches.
// To add a new filter, just add one object to this list.
const DIET_TAGS = ["Vegetarian", "Gluten-free", "Dairy-free", "Nut-free", "Halal"];

const FILTERS = [
  { id: "high-protein", group: "Goals", label: "High protein (40g+)", test: m => m.protein >= 40 },
  { id: "low-carb",     group: "Goals", label: "Low carb (50g or less)", test: m => m.carbs <= 50 },
  { id: "under-500",    group: "Goals", label: "Under 500 cal", test: m => m.calories < 500 },
  ...DIET_TAGS.map(tag => ({
    id: tag, group: "Diet", label: tag, test: m => m.diet.includes(tag)
  }))
];

// The IDs of every filter the user has turned on
const activeFilters = new Set();

// A meal shows up only if it passes EVERY active filter
function getVisibleMeals() {
  return meals.filter(meal =>
    [...activeFilters].every(id => FILTERS.find(f => f.id === id).test(meal))
  );
}

// ===== Saving and loading =====
const STORAGE_KEY = "dialedInPlan";
const TARGETS_KEY = "dialedInTargets"; // written by calculator.js
const DAYS_KEY = "dialedInDays";

// The plan is saved as a list where:
//  - menu meals are saved as just their ID (a number)
//  - custom bowls are saved as the full object, since they aren't on the menu
function loadPlan() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return saved
      .map(entry => {
        if (typeof entry === "number") return meals.find(meal => meal.id === entry);
        if (entry && entry.custom && typeof entry.calories === "number") return entry;
        return null;
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function savePlan() {
  try {
    const toSave = plan.map(item => (item.custom ? item : item.id));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // If storage is blocked (e.g. private browsing), the site still works,
    // the plan just won't be remembered.
  }
}

function loadTargets() {
  try {
    return JSON.parse(localStorage.getItem(TARGETS_KEY));
  } catch {
    return null;
  }
}

function loadDays() {
  try {
    const days = Number(localStorage.getItem(DAYS_KEY));
    return days >= 1 && days <= 7 ? days : 1;
  } catch {
    return 1;
  }
}

// Meals the user has added to their plan (starts with whatever was saved)
const plan = loadPlan();

// How many days the plan is spread over
let planDays = loadDays();

// ===== Grab the elements from index.html =====
const filterBar = document.getElementById("filter-bar");
const mealGrid = document.getElementById("meal-grid");
const planList = document.getElementById("plan-list");
const planTotals = document.getElementById("plan-totals");
const daysSelect = document.getElementById("plan-days");

daysSelect.value = String(planDays);

// ===== Show the filter buttons, grouped =====
function renderFilters() {
  const groups = ["Goals", "Diet"];

  const groupsHtml = groups.map(group => `
    <div class="filter-group">
      <span class="filter-group-label">${group}</span>
      ${FILTERS.filter(f => f.group === group).map(f => `
        <button class="filter-btn" data-filter="${f.id}" aria-pressed="${activeFilters.has(f.id)}">${f.label}</button>
      `).join("")}
    </div>
  `).join("");

  const visibleCount = getVisibleMeals().length;
  const clearButton = activeFilters.size > 0
    ? `<button class="clear-filters" data-action="clear">Clear filters</button>`
    : "";

  filterBar.innerHTML = `
    ${groupsHtml}
    <div class="filter-footer">
      <span class="filter-count">Showing ${visibleCount} of ${meals.length} meals</span>
      ${clearButton}
    </div>
  `;
}

// ===== Show the meals that match the active filters =====
function renderMenu() {
  const visibleMeals = getVisibleMeals();

  if (visibleMeals.length === 0) {
    mealGrid.innerHTML = `
      <div class="menu-empty">
        <p>No meals match all of these filters. Try turning one off.</p>
        <button class="clear-filters" data-action="clear">Clear filters</button>
      </div>
    `;
    return;
  }

  mealGrid.innerHTML = visibleMeals.map(meal => `
    <article class="meal">
      <img src="${meal.image}" alt="${meal.name}" loading="lazy">
      <span class="tag">${meal.tag}</span>
      <h3>${meal.name}</h3>

      <dl class="macro-row">
        <div><dt>Cal</dt><dd>${meal.calories}</dd></div>
        <div><dt>Protein</dt><dd>${meal.protein}g</dd></div>
        <div><dt>Carbs</dt><dd>${meal.carbs}g</dd></div>
        <div><dt>Fat</dt><dd>${meal.fat}g</dd></div>
      </dl>

      <ul class="diet-tags">
        ${meal.diet.map(d => `<li>${d}</li>`).join("")}
      </ul>

      <button data-id="${meal.id}">Add to plan</button>
    </article>
  `).join("");
}

// ===== Show the user's plan =====
function renderPlan() {
  if (plan.length === 0) {
    planList.innerHTML = `<li class="plan-empty">No meals yet. Add some from the menu or build a bowl.</li>`;
  } else {
    planList.innerHTML = plan.map((meal, index) => `
      <li>
        <span class="plan-item-name">
          ${meal.name}
          ${meal.custom ? `<small class="plan-badge">Custom bowl, ${meal.calories} cal</small>` : ""}
        </span>
        <button data-index="${index}">Remove</button>
      </li>
    `).join("");
  }

  renderTracker();
}

// ===== Daily macro tracker =====
const MACROS = [
  { key: "calories", label: "Calories", unit: " cal" },
  { key: "protein",  label: "Protein",  unit: "g" },
  { key: "carbs",    label: "Carbs",    unit: "g" },
  { key: "fat",      label: "Fat",      unit: "g" }
];

function renderTracker() {
  const targets = loadTargets();

  // Add up each macro across every meal in the plan,
  // then divide by the number of days to get a daily average
  const perDay = key =>
    Math.round(plan.reduce((sum, meal) => sum + meal[key], 0) / planDays);

  const mealText = plan.length === 1 ? "1 meal" : `${plan.length} meals`;
  const dayText = planDays === 1 ? "1 day" : `${planDays} days`;

  // No targets yet: show plain totals and point to the calculator
  if (!targets) {
    planTotals.innerHTML = `
      <div class="tracker">
        <h3>Daily macros</h3>
        <p class="tracker-sub">${mealText} over ${dayText}, per day</p>
        <dl class="tracker-simple">
          ${MACROS.map(m => `<div><dt>${m.label}</dt><dd>${perDay(m.key)}${m.unit}</dd></div>`).join("")}
        </dl>
        <p class="tracker-cta"><a href="#calculator">Set your daily targets</a> to see your progress.</p>
      </div>
    `;
    return;
  }

  // Targets set: show a progress bar for each macro
  const rows = MACROS.map(m => {
    const value = perDay(m.key);
    const target = targets[m.key];
    const percent = target > 0 ? Math.round((value / target) * 100) : 0;

    let status;
    let statusText;
    if (percent < 90) {
      status = "under";
      statusText = `${target - value}${m.unit} to go`;
    } else if (percent <= 110) {
      status = "on";
      statusText = "On target";
    } else {
      status = "over";
      statusText = `Over by ${value - target}${m.unit}`;
    }

    return `
      <div class="tracker-row">
        <div class="tracker-label">
          <span>${m.label}</span>
          <span>${value} / ${target}${m.unit}</span>
        </div>
        <div class="bar" role="progressbar" aria-label="${m.label}"
             aria-valuemin="0" aria-valuemax="${target}" aria-valuenow="${value}">
          <div class="bar-fill ${status}" style="width: ${Math.min(percent, 100)}%"></div>
        </div>
        <p class="tracker-status">${statusText}</p>
      </div>
    `;
  }).join("");

  planTotals.innerHTML = `
    <div class="tracker">
      <h3>Daily macro tracker</h3>
      <p class="tracker-sub">${mealText} over ${dayText}, compared with your daily targets</p>
      ${rows}
      <p class="tracker-cta"><a href="#calculator">Update your targets</a></p>
    </div>
  `;
}

// ===== Turning filters on, off, or clearing them =====
function clearFilters() {
  activeFilters.clear();
  renderFilters();
  renderMenu();
}

filterBar.addEventListener("click", e => {
  if (e.target.dataset.action === "clear") return clearFilters();

  const id = e.target.dataset.filter;
  if (!id) return;

  // Toggle: if it's on, turn it off; if it's off, turn it on
  if (activeFilters.has(id)) {
    activeFilters.delete(id);
  } else {
    activeFilters.add(id);
  }

  renderFilters();
  renderMenu();
});

// ===== "Add to plan" buttons (and "Clear filters" in the empty state) =====
mealGrid.addEventListener("click", e => {
  if (e.target.dataset.action === "clear") return clearFilters();

  const id = Number(e.target.dataset.id);
  if (!id) return;
  plan.push(meals.find(m => m.id === id));
  savePlan();
  renderPlan();
});

// ===== "Remove" buttons =====
planList.addEventListener("click", e => {
  const index = e.target.dataset.index;
  if (index === undefined) return;
  plan.splice(Number(index), 1);
  savePlan();
  renderPlan();
});

// ===== Day picker =====
daysSelect.addEventListener("change", () => {
  planDays = Number(daysSelect.value);
  try { localStorage.setItem(DAYS_KEY, planDays); } catch {}
  renderTracker();
});

// ===== Events from other files =====
// calculator.js: new targets were saved
window.addEventListener("targets-updated", renderTracker);

// bowl.js: a custom bowl was added
window.addEventListener("add-to-plan", e => {
  plan.push(e.detail);
  savePlan();
  renderPlan();
});

// ===== Start the page =====
renderFilters();
renderMenu();
renderPlan();

