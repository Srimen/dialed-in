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

// ===== Saving the plan between visits =====
const STORAGE_KEY = "dialedInPlan";

// Load the saved plan. Only meal IDs are stored, so we look up
// the full meal for each ID. If a meal was removed from the menu,
// filter(Boolean) drops it instead of crashing.
function loadPlan() {
  try {
    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return savedIds
      .map(id => meals.find(meal => meal.id === id))
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Save just the IDs of the meals in the plan
function savePlan() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan.map(meal => meal.id)));
  } catch {
    // If storage is blocked (e.g. private browsing), the site still works,
    // the plan just won't be remembered.
  }
}

// Meals the user has added to their plan (starts with whatever was saved)
const plan = loadPlan();

// ===== Grab the empty containers from index.html =====
const filterBar = document.getElementById("filter-bar");
const mealGrid = document.getElementById("meal-grid");
const planList = document.getElementById("plan-list");
const planTotals = document.getElementById("plan-totals");

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

// ===== Show the user's plan and totals =====
function renderPlan() {
  if (plan.length === 0) {
    planList.innerHTML = `<li class="plan-empty">No meals yet. Add some from the menu above.</li>`;
    planTotals.textContent = "";
    return;
  }

  planList.innerHTML = plan.map((meal, index) => `
    <li>
      <span>${meal.name}</span>
      <button data-index="${index}">Remove</button>
    </li>
  `).join("");

  const totalCalories = plan.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = plan.reduce((sum, m) => sum + m.protein, 0);
  planTotals.textContent = `${plan.length} meals: ${totalCalories} cal, ${totalProtein}g protein`;
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

// ===== Start the page =====
renderFilters();
renderMenu();
renderPlan();

