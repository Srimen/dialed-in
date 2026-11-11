// ===== Build-your-own bowl =====
// Wrapped in an IIFE so its variables stay private, like calculator.js.
(() => {
  const GF = "Gluten-free", DF = "Dairy-free", NF = "Nut-free", HAL = "Halal", VEG = "Vegetarian";
  const ALL_DIET = [VEG, GF, DF, NF, HAL];

  // ----- Ingredient data (macros per portion) -----
  const INGREDIENTS = {
    protein: [
      { id: "chicken", name: "Grilled chicken", portion: "150g", calories: 240, protein: 46, carbs: 0, fat: 6,  diet: [GF, DF, NF, HAL] },
      { id: "steak",   name: "Lean steak",      portion: "150g", calories: 270, protein: 40, carbs: 0, fat: 12, diet: [GF, DF, NF, HAL] },
      { id: "salmon",  name: "Salmon",          portion: "150g", calories: 300, protein: 34, carbs: 0, fat: 18, diet: [GF, DF, NF, HAL] },
      { id: "tofu",    name: "Crispy tofu",     portion: "200g", calories: 280, protein: 28, carbs: 6, fat: 16, diet: [VEG, GF, DF, NF, HAL] }
    ],
    carb: [
      { id: "white-rice",   name: "White rice",        portion: "1 cup", calories: 200, protein: 4, carbs: 45, fat: 0, diet: [VEG, GF, DF, NF, HAL] },
      { id: "brown-rice",   name: "Brown rice",        portion: "1 cup", calories: 220, protein: 5, carbs: 45, fat: 2, diet: [VEG, GF, DF, NF, HAL] },
      { id: "sweet-potato", name: "Sweet potato",      portion: "200g",  calories: 170, protein: 3, carbs: 40, fat: 0, diet: [VEG, GF, DF, NF, HAL] },
      { id: "quinoa",       name: "Quinoa",            portion: "1 cup", calories: 220, protein: 8, carbs: 39, fat: 4, diet: [VEG, GF, DF, NF, HAL] },
      { id: "pasta",        name: "Whole wheat pasta", portion: "1 cup", calories: 180, protein: 7, carbs: 37, fat: 1, diet: [VEG, DF, NF, HAL] }
    ],
    veg: [
      { id: "broccoli", name: "Broccoli",                portion: "1 cup", calories: 40, protein: 3, carbs: 7,  fat: 0, diet: ALL_DIET },
      { id: "greens",   name: "Mixed greens",            portion: "2 cups", calories: 25, protein: 2, carbs: 4,  fat: 0, diet: ALL_DIET },
      { id: "peppers",  name: "Roasted peppers & onions", portion: "1 cup", calories: 80, protein: 2, carbs: 12, fat: 3, diet: ALL_DIET },
      { id: "stir-fry", name: "Stir-fry veggies",        portion: "1 cup", calories: 80, protein: 3, carbs: 10, fat: 3, diet: ALL_DIET }
    ]
  };

  const GROUPS = [
    { key: "protein", title: "Pick a protein" },
    { key: "carb",    title: "Pick a carb" },
    { key: "veg",     title: "Pick a veggie" }
  ];

  const form = document.getElementById("bowl-form");
  const summary = document.getElementById("bowl-summary");
  const addButton = document.getElementById("add-bowl");
  const status = document.getElementById("bowl-status");

  // ----- Build the option buttons from the data -----
  function renderOptions() {
    form.innerHTML = GROUPS.map(group => `
      <fieldset class="bowl-group">
        <legend>${group.title}</legend>
        <div class="bowl-choices">
          ${INGREDIENTS[group.key].map((item, i) => `
            <label class="choice bowl-choice">
              <input type="radio" name="${group.key}" value="${item.id}" ${i === 0 ? "checked" : ""}>
              <span class="choice-text">
                <strong>${item.name}</strong>
                <small>${item.portion}, ${item.calories} cal, ${item.protein}g protein</small>
              </span>
            </label>
          `).join("")}
        </div>
      </fieldset>
    `).join("");
  }

  // ----- Combine the three picks into one bowl -----
  function buildBowl() {
    const parts = GROUPS.map(group =>
      INGREDIENTS[group.key].find(item => item.id === form.elements[group.key].value)
    );
    const [proteinPick, carbPick, vegPick] = parts;

    const sum = key => parts.reduce((total, part) => total + part[key], 0);

    // A bowl only gets a diet tag if EVERY ingredient has it
    const diet = ALL_DIET.filter(tag => parts.every(part => part.diet.includes(tag)));

    return {
      custom: true,
      name: `${proteinPick.name} bowl with ${carbPick.name.toLowerCase()} and ${vegPick.name.toLowerCase()}`,
      calories: sum("calories"),
      protein: sum("protein"),
      carbs: sum("carbs"),
      fat: sum("fat"),
      diet
    };
  }

  // ----- Live preview -----
  function renderSummary() {
    const bowl = buildBowl();

    summary.innerHTML = `
      <p class="bowl-name">${bowl.name}</p>
      <dl class="macro-row">
        <div><dt>Cal</dt><dd>${bowl.calories}</dd></div>
        <div><dt>Protein</dt><dd>${bowl.protein}g</dd></div>
        <div><dt>Carbs</dt><dd>${bowl.carbs}g</dd></div>
        <div><dt>Fat</dt><dd>${bowl.fat}g</dd></div>
      </dl>
      <ul class="diet-tags">
        ${bowl.diet.map(d => `<li>${d}</li>`).join("")}
      </ul>
    `;
  }

  // ----- Events -----
  let statusTimer;

  form.addEventListener("change", () => {
    status.textContent = "";
    renderSummary();
  });

  addButton.addEventListener("click", () => {
    // Tell script.js to add this bowl to the plan
    window.dispatchEvent(new CustomEvent("add-to-plan", { detail: buildBowl() }));

    status.textContent = "Added to your plan.";
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => { status.textContent = ""; }, 2500);
  });

  // ----- Start -----
  renderOptions();
  renderSummary();
})();

