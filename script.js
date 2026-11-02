// ===== Menu data =====
// Each meal is an object. Later this could come from a backend.
const meals = [
  { id: 1, name: "Chicken burrito bowl", calories: 620, protein: 48, tag: "High protein", image: "images/chicken-burrito-bowl.jpg" },
  { id: 2, name: "Teriyaki salmon & rice", calories: 580, protein: 40, tag: "High protein", image: "images/teriyaki-salmon.jpg" },
  { id: 3, name: "Turkey meatballs & pasta", calories: 650, protein: 45, tag: "Comfort", image: "images/turkey-meatballs.jpg" },
  { id: 4, name: "Chickpea curry", calories: 520, protein: 22, tag: "Vegetarian", image: "images/chickpea-curry.jpg" },
  { id: 5, name: "Steak & sweet potato", calories: 700, protein: 52, tag: "High protein", image: "images/steak-sweet-potato.jpg" },
  { id: 6, name: "Tofu stir fry", calories: 480, protein: 28, tag: "Vegetarian", image: "images/tofu-stir-fry.jpg" }
];

// Meals the user has added to their plan
const plan = [];

// ===== Grab the empty containers from index.html =====
const mealGrid = document.getElementById("meal-grid");
const planList = document.getElementById("plan-list");
const planTotals = document.getElementById("plan-totals");

// ===== Show every meal as a card =====
function renderMenu() {
  mealGrid.innerHTML = meals.map(meal => `
    <article class="meal">
      <img src="${meal.image}" alt="${meal.name}" loading="lazy">
      <span class="tag">${meal.tag}</span>
      <h3>${meal.name}</h3>
      <p class="macros">${meal.calories} cal, ${meal.protein}g protein</p>
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

// ===== "Add to plan" buttons =====
mealGrid.addEventListener("click", e => {
  const id = Number(e.target.dataset.id);
  if (!id) return;
  plan.push(meals.find(m => m.id === id));
  renderPlan();
});

// ===== "Remove" buttons =====
planList.addEventListener("click", e => {
  const index = e.target.dataset.index;
  if (index === undefined) return;
  plan.splice(Number(index), 1);
  renderPlan();
});

// ===== Start the page =====
renderMenu();
renderPlan();