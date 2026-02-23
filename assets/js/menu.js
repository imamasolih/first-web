class CsvMenuPage {
  constructor(config) {
    this.csvUrl = config.csvUrl;
    this.categoryListEl = config.categoryListEl;
    this.itemsGridEl = config.itemsGridEl;
    this.stateEl = config.stateEl;
    this.activeCategoryEl = config.activeCategoryEl;

    this.items = [];
    this.categories = [];
    this.activeCategory = "";
  }

  async init() {
    if (
      !this.categoryListEl ||
      !this.itemsGridEl ||
      !this.stateEl ||
      !this.activeCategoryEl
    ) {
      return;
    }

    this.setState("loading", "Loading menu...");

    try {
      const csvText = await this.fetchCsv();
      const parsedRows = this.parseCsv(csvText);
      this.items = this.normalizeItems(parsedRows);
      this.categories = this.getCategories(this.items);

      if (this.categories.length === 0) {
        this.itemsGridEl.innerHTML = "";
        this.categoryListEl.innerHTML = "";
        this.activeCategoryEl.textContent = "Menu";
        this.setState("empty", "No items available");
        return;
      }

      this.activeCategory = this.categories[0];
      this.renderCategories();
      this.renderItems();
    } catch (error) {
      console.error("Menu load failed.", error);
      this.itemsGridEl.innerHTML = "";
      this.categoryListEl.innerHTML = "";
      this.activeCategoryEl.textContent = "Menu";
      this.setState("error", "Failed to load menu.");
    }
  }

  async fetchCsv() {
    const response = await fetch(this.csvUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`CSV HTTP ${response.status}`);
    }
    return response.text();
  }

  parseCsv(rawText) {
    const text = String(rawText || "").replace(/^\uFEFF/, "");
    const rows = [];

    let row = [];
    let value = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];

      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          value += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === "," && !inQuotes) {
        row.push(value);
        value = "";
        continue;
      }

      if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && text[i + 1] === "\n") {
          i += 1;
        }
        row.push(value);
        value = "";

        if (row.some((cell) => cell.trim() !== "")) {
          rows.push(row);
        }
        row = [];
        continue;
      }

      value += char;
    }

    row.push(value);
    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }

    if (rows.length === 0) {
      return [];
    }

    const headers = rows[0].map((cell) => cell.trim());
    return rows.slice(1).map((cells) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = (cells[index] || "").trim();
      });
      return item;
    });
  }

  normalizeItems(rows) {
    return rows
      .map((row) => ({
        category: String(row.category || "").trim(),
        name: String(row.name || "").trim(),
        description: String(row.description || "").trim(),
        photo: String(row.photo || "").trim(),
      }))
      .filter((item) => item.category && item.name);
  }

  getCategories(items) {
    const categories = [];
    const seen = new Set();

    items.forEach((item) => {
      if (!seen.has(item.category)) {
        seen.add(item.category);
        categories.push(item.category);
      }
    });

    return categories;
  }

  setState(type, message) {
    this.stateEl.hidden = false;
    this.stateEl.className = `menu-page-state is-${type}`;
    this.stateEl.textContent = message;
  }

  clearState() {
    this.stateEl.hidden = true;
  }

  renderCategories() {
    this.categoryListEl.innerHTML = "";

    this.categories.forEach((category) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "menu-category-btn";
      button.textContent = category;
      button.dataset.category = category;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", String(category === this.activeCategory));
      button.classList.toggle("is-active", category === this.activeCategory);

      button.addEventListener("click", () => {
        if (this.activeCategory === category) {
          return;
        }
        this.activeCategory = category;
        this.renderCategories();
        this.renderItems();
      });

      this.categoryListEl.appendChild(button);
    });
  }

  renderItems() {
    this.activeCategoryEl.textContent = this.activeCategory || "Menu";
    this.itemsGridEl.innerHTML = "";

    const categoryItems = this.items.filter(
      (item) => item.category === this.activeCategory
    );

    if (categoryItems.length === 0) {
      this.setState("empty", "No items available");
      return;
    }

    this.clearState();
    categoryItems.forEach((item) => {
      this.itemsGridEl.appendChild(this.createMealCard(item));
    });
  }

  createMealCard(item) {
    const card = document.createElement("article");
    card.className = "menu-csv-card card";

    const mediaWrap = document.createElement("div");
    mediaWrap.className = "menu-csv-media-wrap";

    if (item.photo) {
      const image = document.createElement("img");
      image.className = "menu-csv-media";
      image.src = item.photo;
      image.alt = item.name;
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => {
        mediaWrap.innerHTML = "";
        mediaWrap.appendChild(this.createMediaPlaceholder());
      });
      mediaWrap.appendChild(image);
    } else {
      mediaWrap.appendChild(this.createMediaPlaceholder());
    }

    const body = document.createElement("div");
    body.className = "menu-csv-body";

    const name = document.createElement("h4");
    name.className = "menu-csv-name";
    name.textContent = item.name;

    const description = document.createElement("p");
    description.className = "menu-csv-description";
    description.textContent = item.description || "No description available.";

    body.appendChild(name);
    body.appendChild(description);

    
    card.appendChild(body);
    card.appendChild(mediaWrap);
    
    return card;
  }

  createMediaPlaceholder() {
    const placeholder = document.createElement("div");
    placeholder.className = "menu-csv-media-placeholder";
    placeholder.textContent = "Image unavailable";
    return placeholder;
  }
}

const initCsvMenuPage = () => {
  const app = new CsvMenuPage({
    csvUrl: "assets/data/menu.csv",
    categoryListEl: document.getElementById("menu-categories"),
    itemsGridEl: document.getElementById("menu-items-grid"),
    stateEl: document.getElementById("menu-state"),
    activeCategoryEl: document.getElementById("menu-active-category"),
  });

  app.init();
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCsvMenuPage);
} else {
  initCsvMenuPage();
}
