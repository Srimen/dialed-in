// ===== Macro calculator =====
// Wrapped in a function that runs immediately (an IIFE) so its variables
// don't clash with the ones in script.js.
(() => {
  const PROFILE_KEY = "dialedInProfile";
  const TARGETS_KEY = "dialedInTargets";

  const form = document.getElementById("calc-form");
  const result = document.getElementById("calc-result");
  const weightUnit = document.getElementById("weight-unit");
  const weightInput = document.getElementById("weight");

  const PHASES = {
    cut: {
      name: "Cut",
      text: "A moderate calorie deficit, about 20% below maintenance, to lose fat while keeping protein high to protect muscle."
    },
    recomp: {
      name: "Recomp",
      text: "Eat around maintenance with high protein to build muscle and slowly lose fat at the same time."
    },
    bulk: {
      name: "Lean bulk",
      text: "A small surplus, about 10% above maintenance, to build muscle without gaining much fat."
    }
  };

  // ----- Saving and loading -----
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  // ----- Switch between metric and imperial inputs -----
  function setUnits(units) {
    document.querySelectorAll("[data-units]").forEach(el => {
      const active = el.dataset.units === units;
      el.hidden = !active;
      // Only the visible height inputs are required
      el.querySelectorAll("input").forEach(input => { input.required = active; });
    });

    weightUnit.textContent = units === "metric" ? "kg" : "lb";
    weightInput.min = units === "metric" ? 35 : 80;
    weightInput.max = units === "metric" ? 250 : 550;
  }

  // ----- Read the form and convert everything to cm and kg -----
  function readForm() {
    const data = new FormData(form);
    const units = data.get("units");

    const heightCm = units === "metric"
      ? Number(data.get("heightCm"))
      : (Number(data.get("heightFt")) * 12 + Number(data.get("heightIn"))) * 2.54;

    const weightKg = units === "metric"
      ? Number(data.get("weight"))
      : Number(data.get("weight")) * 0.453592;

    return {
      sex: data.get("sex"),
      age: Number(data.get("age")),
      heightCm,
      weightKg,
      activity: Number(data.get("activity")),
      goal: data.get("goal")
    };
  }

  // ----- The math -----
  function calculateMacros(p) {
    // Mifflin-St Jeor: calories your body burns at rest
    const bmr = 10 * p.weightKg + 6.25 * p.heightCm - 5 * p.age + (p.sex === "male" ? 5 : -161);

    // Total daily energy expenditure: resting calories x activity level
    const tdee = bmr * p.activity;

    const heightM = p.heightCm / 100;
    const bmi = p.weightKg / (heightM * heightM);

    let phase;
    let calories;
    let note = "";

    if (p.goal === "lose") {
      if (bmi < 18.5) {
        // Don't recommend a deficit to someone who is already underweight
        phase = "recomp";
        calories = tdee;
        note = "Your weight is already on the low side for your height, so we're recommending maintenance calories instead of a cut. It's worth checking with a doctor before trying to lose weight.";
      } else {
        phase = "cut";
        calories = Math.max(tdee * 0.8, bmr); // never go below resting calories
      }
    } else if (p.goal === "gain") {
      if (bmi >= 27) {
        phase = "recomp";
        calories = tdee;
        note = "From here, a recomp usually works better than a bulk: you can build muscle at maintenance while gradually losing fat.";
      } else {
        phase = "bulk";
        calories = tdee * 1.1;
      }
    } else {
      phase = "recomp";
      calories = tdee;
    }

    calories = Math.round(calories / 10) * 10;

    // Protein by bodyweight, fat as 25% of calories, carbs fill the rest
    const protein = Math.round(p.weightKg * (phase === "cut" ? 2.0 : 1.8));
    const fat = Math.round((calories * 0.25) / 9);
    const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

    return { phase, calories, protein, carbs, fat, note };
  }

  // ----- Show the result -----
  function renderResult(t) {
    const phase = PHASES[t.phase];
    result.classList.remove("is-empty");

    result.innerHTML = `
      <h3>Recommended: ${phase.name}</h3>
      <p>${phase.text}</p>
      <dl class="target-grid">
        <div><dt>Calories</dt><dd>${t.calories}</dd></div>
        <div><dt>Protein</dt><dd>${t.protein}g</dd></div>
        <div><dt>Carbs</dt><dd>${t.carbs}g</dd></div>
        <div><dt>Fat</dt><dd>${t.fat}g</dd></div>
      </dl>
      ${t.note ? `<p class="result-note">${t.note}</p>` : ""}
      <p class="disclaimer">These are estimates from a standard formula, not medical advice. Adjust after 2–3 weeks based on how your weight changes.</p>
    `;
  }

  // ----- Events -----
  form.addEventListener("change", e => {
    if (e.target.name === "units") setUnits(e.target.value);
  });

  form.addEventListener("submit", e => {
    e.preventDefault(); // stop the page from reloading
    const targets = calculateMacros(readForm());
    save(PROFILE_KEY, Object.fromEntries(new FormData(form)));
    save(TARGETS_KEY, targets);
    renderResult(targets);

    // NEW: tell the rest of the site (the plan tracker) that targets changed
    window.dispatchEvent(new CustomEvent("targets-updated"));
  });

  // ----- On page load: restore anything saved -----
  const savedProfile = load(PROFILE_KEY);
  if (savedProfile) {
    Object.entries(savedProfile).forEach(([name, value]) => {
      if (form.elements[name]) form.elements[name].value = value;
    });
  }
  setUnits(form.elements.units.value);

  const savedTargets = load(TARGETS_KEY);
  if (savedTargets) renderResult(savedTargets);
})();

