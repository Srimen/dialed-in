// ===== Menu data =====
// Each meal has full macros (calories, protein, carbs, fat in grams)
// plus a category tag for filtering and a list of diet/allergen tags.
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

// Which filter is selected right now
let activeTag = "All";

// ===== Grab the empty containers from index.html =====
const filterBar = document.getElementById("filter-bar");
const mealGrid = document.getElementById("meal-grid");
const planList = document.getElementById("plan-list");
const planTotals = document.getElementById("plan-totals");

// ===== Show the filter buttons =====
// The tags come from the meal data, so adding a meal with a new tag
// creates a new filter button automatically.
function renderFilters() {
  const tags = ["All", ...new Set(meals.map(meal => meal.tag))];

  filterBar.innerHTML = tags.map(tag => `
    <button class="filter-btn" data-tag="${tag}" aria-pressed="${tag === activeTag}">${tag}</button>
  `).join("");
}

// ===== Show the meals that match the selected filter =====
function renderMenu() {
  const visibleMeals = activeTag === "All"
    ? meals
    : meals.filter(meal => meal.tag === activeTag);

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

// ===== Filter buttons =====
filterBar.addEventListener("click", e => {
  const tag = e.target.dataset.tag;
  if (!tag) return;
  activeTag = tag;
  renderFilters();
  renderMenu();
});

// ===== "Add to plan" buttons =====
mealGrid.addEventListener("click", e => {
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

