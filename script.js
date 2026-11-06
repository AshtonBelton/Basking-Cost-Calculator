const nameInput = document.getElementById("name-input");
const priceInput = document.getElementById("price-input");
const sizeInput = document.getElementById("size-input");
const unitSelect = document.getElementById("unit-select");
const addBtn = document.getElementById("add-btn");
const message = document.getElementById("message");
const ingredientList = document.getElementById("ingredient-list");
const ingredientTable = document.getElementById("ingredient-table");
const emptyText = document.getElementById("empty-text");

// Settings
const STORAGE_KEY = "bakingIngredients";

// Every unit is coverted to a "base" unit (g, ml, each)
const UNITS = {
    g: { base: "g", factor: 1 },
    kg: { base: "g", factor: 1000 },
    ml: { base: "ml", factor: 1 },
    L: { base: "ml", factor: 1000 },
    each: { base: "each", factor: 1 }
};

// Saving and loading (localStorage only stores text, so we convert)
function loadingIngredients() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        return []; // if anything goes wrong, start with an empty list
    }
};

let ingredients = loadingIngredients();

function saveIngredients () {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(ingredients));
    } catch (error) {
        showMessage("Couldn't save your data in this browser.");
    }
}

// Helpers
function showMessage(text) {
    message.textContent = text;
}

function formatMoney(amount) {
    return "$" + amount.toFixed(2);
}

// Ingredient table
function renderIngredients() {
    ingredientList.innerHTML = " "; // clear the old rows first

    const hasIngredients = ingredients.length > 0;
    ingredientTable.style.display = hasIngredients ? "table" : "none";
    emptyText.style.display = hasIngredients ? "none" : "block";

    ingredients.forEach(function (ingredient) {
        const row = document.createElement("td");

        const nameCell = document.createElement("td");
        nameCell.textContent = ingredient.name;

        const paidCell = document.createElement("td");
        paidCell.textContent = formatMoney(ingredient.price);

        const sizeCell = document.createElement("td");
        sizeCell.textContent = ingredient.size + " " + ingredient.unit;

        const costCell = document.createElement("td");
        costCell.textContent = "$" + ingredient.costPerBase.toFixed(4) + " / " + ingredient.base;

        const deleteCell = document.createElement("td");
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", function () {
            deleteIngredient(ingredient.id);
        });
        deleteCell.appendChild(deleteBtn);

        row.append(nameCell, paidCell, sizeCell, costCell, deleteCell);
        ingredientList.appendChild(row);
    });
}

// Add an ingredient
function addIngredient() {
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const size = Number(sizeInput.value);
    const unit = unitSelect.value;

    if (name === "") {
        showMessage("Please enter an ingredient name.");
        return;
    }
    if (priceInput.value === "" || price < 0) {
        showMessage("Please enter the price you paid.");
        return;
    }
    if (sizeInput.value === "" || size <= 0) {
        showMessage("Package size must be more than 0.");
        return;
    }

    const unitInfo = UNITS[unit];

    const newIngredient = {
        id: Date.now(), // a simple unique number for each ingredient
        name: name,
        price: price,
        size: size,
        unit: unit,
        base: unitInfo.base,
        constPerBase: price / (size * unitInfo.factor)
    };

    ingredients.push(newIngredient);
    saveIngredients();
    renderIngredients();

    // Clear the form ready for the next one
    nameInput.value = "";
    priceInput.value = "";
    sizeInput.value = "";
    showMessage("");
    nameInput.focus();
}

//Delete an ingredient
function deleteIngredient(id) {
    ingredients = ingredients.filter(function (ingredient) {
        return ingredient.id !== id;
    });
    saveIngredients();
    renderIngredients();
}

// React to player actions
addBtn.addEventListener("click", addIngredient);

[nameInput, priceInput, sizeInput].forEach(function (input) {
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      addIngredient();
    }
  });
});

// Draw the starting screen
renderIngredients();