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
      initMenuDetailsToggle();
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

    const result = await response.text();
    return result;
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
        recommended: String(row.recommended || "").toLowerCase() === "1",
        allergens: String(row.allergens || "").split(",").map((a) => a.trim()).filter((a) => a !== ""),
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
    const cardTracker = document.createElement("div");
    cardTracker.className = "card-slider";
    const cardFront = document.createElement("div");
    cardFront.className = "card-side front";

    const cardBack = document.createElement("div");
    cardBack.className = "card-side back";

    const body = document.createElement("div");
    body.className = "menu-csv-body";

    body.appendChild(createMenuNameElement(item));
    body.appendChild(createMenuDescriptionElement(item));
    cardFront.appendChild(createMenuMediaElement(item));
    cardFront.appendChild(body);

    cardBack.appendChild(createMoreDetailsElement(item));
    
    cardTracker.appendChild(cardFront);
    cardTracker.appendChild(cardBack);
    card.appendChild(cardTracker);
    card.appendChild(createSliderDots());
    return card;
  }

  createMediaPlaceholder() {
    const placeholder = document.createElement("div");
    placeholder.className = "menu-csv-media-placeholder";
    placeholder.textContent = "Image unavailable";
    return placeholder;
  }
}

const createSliderDots = () => {
  const dots = document.createElement("div");
  dots.innerHTML = `<div class="dots">
    <span class="dot active"></span>
    <span class="dot"></span>
  </div>`;
  
  return dots;
}

const createMenuMediaElement = (item) => {
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
    return mediaWrap
};

const createMoreDetailsElement = (item) => {
  const details = document.createElement("div");
  details.className = "menu-csv-more-details";
  details.innerHTML = `<div class="card-details">
      <p class="full-desc">
        Freshly grilled chicken, beef or mixed meat served in homemade pita bread...
      </p>
      <hr class="menu-devider"/>
      <div class="allergens">
        <span class="allergen contains"><icon><icon/>🌾 Gluten</span>
        <span class="allergen green">🥛 Dairy</span>
        <span class="allergen warning">🌰 Sesame</span>
      </div>
      <hr class="menu-devider"/>
      <div class="nutrition">
        <div class="nutrition-row">
          <span>Protein:</span>
          <div class="bar high"></div>
        </div>
        <div class="nutrition-row">
          <span>Calories:</span>
          <div class="bar medium"></div>
        </div>
        <div class="nutrition-row">
          <span>Fat:</span>
          <div class="bar medium"></div>
        </div>
      </div>
    </div>`;
  return details;
}

const createMenuDescriptionElement = (item) => {
  const description = document.createElement("p");
  description.className = "menu-csv-description";
  if(item.description.length > 100){
    description.textContent = item.description.substring(0, 100) + "...";
  } else {
    description.textContent = item.description || "No description available.";
  }

  return description;
}

const createMenuNameElement = (item) => {
   const name = document.createElement("h4");
    const nameDiv = document.createElement("div");
    nameDiv.className = "menu-csv-name-wrap";
    const weRecommendDiv = document.createElement("div");

    name.className = "menu-csv-name";
    nameDiv.textContent = item.name;

    if(item.recommended) {
      const weRecommendLogo = document.createElement("img");
      weRecommendLogo.src = "assets/img/icons/recommended.png";
      weRecommendLogo.className = "menu-csv-we-recommend-img";

      weRecommendDiv.appendChild(weRecommendLogo);
    }

    name.appendChild(nameDiv);
    name.appendChild(weRecommendDiv);
    return name;
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

const initSidebarToggle = () => {
  const sidebar = document.getElementById("menu-sidebar");
  const toggleBtn = document.getElementById("menu-sidebar-toggle");

  if (!sidebar || !toggleBtn) return;

  // Create backdrop overlay
  const backdrop = document.createElement("div");
  backdrop.className = "menu-sidebar-backdrop";
  backdrop.style.display = "none";
  backdrop.style.zIndex = "-1";

  document.body.appendChild(backdrop);

  const openSidebar = () => {
    sidebar.classList.add("is-expanded");
    backdrop.style.display = "block";
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  const closeSidebar = () => {
    sidebar.classList.remove("is-expanded");
    backdrop.style.display = "none";
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (sidebar.classList.contains("is-expanded")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  // Close on backdrop click
  backdrop.addEventListener("click", closeSidebar);

  // Close when clicking outside the sidebar (on the content area)
  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("is-expanded")) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // Close when a category is selected
  const updateCategoryListeners = () => {
    const categories = document.querySelectorAll(".menu-category-btn");
    categories.forEach((btn) => {
      btn.removeEventListener("click", closeSidebar);
      btn.addEventListener("click", closeSidebar);
    });
  };

  updateCategoryListeners();

  // Watch for new category buttons added dynamically
  const observer = new MutationObserver(() => {
    updateCategoryListeners();
  });

  const categoriesContainer = document.getElementById("menu-categories");
  if (categoriesContainer) {
    observer.observe(categoriesContainer, { childList: true });
  }
};

const initMenuDetailsToggle = function () {
  document.querySelectorAll('.menu-csv-card').forEach(card => {

    const dots = card.querySelectorAll('.dot');

    card.addEventListener('click', function(e) {

      // Prevent toggling if clicking on button or link
      if (e.target.closest('button, a')) return;

      card.classList.toggle('active');

      const isActive = card.classList.contains('active');

      dots[0].classList.toggle('active', !isActive);
      dots[1].classList.toggle('active', isActive);
    });

  });
};


if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initCsvMenuPage();
    initSidebarToggle();
  });
} else {
  initCsvMenuPage();
  initSidebarToggle();
}
