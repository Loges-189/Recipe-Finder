const popup = document.querySelector(".popup");
const popupDetails = document.querySelector(".popup-details");
const form = document.querySelector(".input-container");
const input = form.querySelector("input");
const itemsContainer = document.querySelector(".items-container");
const msg = document.querySelector(".message");
const randomBtn = document.querySelector(".random button");

const API = {
  search: q => `https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`,
  byId: id => `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`,
  random: `https://www.themealdb.com/api/json/v1/1/random.php`
};

const fetchJSON = async url => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Network error");
  return res.json();
};

const showMessage = (text = "", type = "") => {
  msg.textContent = text;
  msg.className = `message ${type}`;
};
randomBtn.addEventListener("click", async () => {
  showMessage("Searching random recipe...", "loading");
  try {
    const data = await fetchJSON(API.random);
    showMessage();
    showRecipeDetails(data.meals[0]);
  } catch {
    showMessage("Something went wrong", "error");
  }
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  
  const query = input.value.trim();
  input.value = ""
  if (!query) return showMessage("Search any recipe!", "error");

  showMessage(`Searching "${query}"...`, "loading");
  itemsContainer.innerHTML = "";

  try {
    const data = await fetchJSON(API.search(query));
    showMessage();
    data.meals ? renderRecipes(data.meals) : showMessage("No recipe found", "error");
  } catch {
    showMessage("Something went wrong", "error");
  }
});

itemsContainer.addEventListener("click", async e => {
  const item = e.target.closest(".item");
  if (!item) return;

  try {
    const data = await fetchJSON(API.byId(item.dataset.id));
    showRecipeDetails(data.meals[0]);
  } catch {
    showMessage("Failed to load recipe", "error");
  }
});
const renderRecipes = meals => {
  itemsContainer.innerHTML = meals
    .map(
      meal => `
      <div class="item" data-id="${meal.idMeal}">
        <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
        <h3>${meal.strMeal}</h3>
      </div>
    `
    )
    .join("");
};

const showRecipeDetails = meal => {
  popup.classList.remove("hidden");

  const ingredients = Array.from({ length: 20 }, (_, i) => {
    const ing = meal[`strIngredient${i + 1}`];
    const mea = meal[`strMeasure${i + 1}`];
    return ing ? `<li>${mea} ${ing}</li>` : "";
  }).join("");

  popupDetails.innerHTML = `
    <div class="close-btn">
      <i class="fa-solid fa-circle-xmark"></i>
    </div>
    <div class="item-details">
      <h2>${meal.strMeal}</h2>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>Category: ${meal.strCategory}</h3>
      <h3>Area: ${meal.strArea}</h3>
      <h3>Ingredients</h3>
      <ul>${ingredients}</ul>
      <h3>Instructions</h3>
      <p>${meal.strInstructions}</p>
      <h3>Video Recipe</h3>
      <a href="${meal.strYoutube}" target="_blank">Watch on YouTube</a>
    </div>
  `;

  popupDetails.querySelector(".close-btn").onclick = () =>
    popup.classList.add("hidden");
};
