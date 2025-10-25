const grid = document.getElementById("product-grid");
const dialog = document.getElementById("addDialog");
const fetchBtn = document.getElementById("fetch-product");
const closeBtn = document.getElementById("close-dialog");
const input = document.getElementById("product-url");

let allItems = [];
let activeFilter = null; // aktueller Verein (icon) für Filter

async function loadProducts() {
  try {
    const response = await fetch("products.json");
    allItems = await response.json();
    renderGrid();
  } catch (err) {
    console.warn("Could not load products.json", err);
    allItems = [];
    renderGrid();
  }
}

function renderGrid() {
  grid.innerHTML = "";

  // Gefilterte Liste, falls aktiv
  const items = activeFilter
    ? allItems.filter((i) => i.icon === activeFilter)
    : allItems;

  items.forEach((item, index) => addProductBox(item, index));
  addPlusTile();
}

// === Produktkachel erstellen ===
function addProductBox(item, index) {
  const div = document.createElement("div");
  div.className = "product";

  // Link-Click
  div.onclick = (e) => {
    if (e.target.classList.contains("team-icon") || e.target.classList.contains("delete-btn")) return;
    if (item.link) window.open(item.link, "_blank");
  };

  // Team Icon
  const teamIcon = document.createElement("img");
  teamIcon.src = item.icon || "";
  teamIcon.className = "team-icon";
  teamIcon.onclick = (e) => {
    e.stopPropagation();
    activeFilter = activeFilter === item.icon ? null : item.icon;
    renderGrid();
  };

  // Delete Button
  const del = document.createElement("button");
  del.className = "delete-btn";
  del.innerHTML = "×";

  // **Hier: Übergabe über Closure**
  del.addEventListener("click", async (e) => {
    e.stopPropagation();
    await deleteProduct(item.link); // wir übergeben nur den Link
    loadProducts();
  });

  const image = item.image
    ? `<img src="${item.image}" class="main-img" alt="${item.title}">`
    : "";
  const title = `<p>${item.title}</p>`;

  div.innerHTML = `${image}${title}`;
  div.appendChild(teamIcon);
  div.appendChild(del);

  grid.appendChild(div);
}

// === Plus-Tile ===
function addPlusTile() {
  const addTile = document.createElement("div");
  addTile.className = "add-tile";
  addTile.textContent = "+";
  addTile.onclick = () => dialog.showModal();
  grid.appendChild(addTile);
}

// === Produkt hinzufügen ===
fetchBtn.onclick = async () => {
  const url = input.value.trim();
  if (!url) return alert("Bitte einen gültigen Link eingeben!");

  try {
    const response = await fetch(
      `https://api.microlink.io?url=${encodeURIComponent(url)}`
    );
    const data = await response.json();
    const meta = data.data;

    const newItem = {
      title: meta.title,
      image: meta.image?.url || "",
      icon: meta.logo?.url || "",
      link: url,
    };

    await saveProduct(newItem);
    dialog.close();
    input.value = "";
    loadProducts();
  } catch (error) {
    alert("Fehler beim Laden der Produktdaten.");
  }
};

closeBtn.onclick = () => dialog.close();

// === Produkt speichern ===
async function saveProduct(item) {
  await fetch("/save-product", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
}

// === Produkt löschen ===
async function deleteProduct(link) {
  await fetch(`/delete-product`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ link }),
  });
}

// === Initialisierung ===
loadProducts();
