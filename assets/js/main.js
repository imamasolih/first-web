const header = document.querySelector(".site-header");

if (header) {
  const toggleHeaderShadow = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  const setHeaderHeight = () => {
    document.documentElement.style.setProperty(
      "--header-height",
      `${header.offsetHeight}px`
    );
  };

  toggleHeaderShadow();
  setHeaderHeight();
  window.addEventListener("scroll", toggleHeaderShadow, { passive: true });
  window.addEventListener("resize", setHeaderHeight);
}

const initPanelWidthFromMenu = () => {
  const menuButton = document.querySelector(".header-cta .btn");
  if (!menuButton) {
    return;
  }
  const heroVisual = document.querySelector(".hero-visual");
  const nav = document.querySelector(".nav");
  const goldTrack = document.querySelector(".marquee-track--gold");

  const updatePanelWidth = () => {
    const rect = menuButton.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const rightWidth = Math.max(
      0,
      Math.min(window.innerWidth, window.innerWidth - centerX)
    );
    document.documentElement.style.setProperty(
      "--panel-right-width",
      `${rightWidth}px`
    );

    if (heroVisual) {
      const visualRect = heroVisual.getBoundingClientRect();
      const localCenterX = centerX - visualRect.left;
      heroVisual.style.setProperty("--plate-center-x", `${localCenterX}px`);

      if (nav && goldTrack) {
        const navRect = nav.getBoundingClientRect();
        const goldRect = goldTrack.getBoundingClientRect();
        const targetCenterY = (navRect.bottom + goldRect.top) / 2;
        const localCenterY = targetCenterY - visualRect.top;
        heroVisual.style.setProperty("--plate-center-y", `${localCenterY}px`);
      }
    }
  };

  updatePanelWidth();
  window.addEventListener("resize", updatePanelWidth);
};

const initPanelVerticalText = () => {
  const textEl = document.querySelector(".panel-vertical-text__content");
  if (!textEl) {
    return;
  }

  const word = textEl.getAttribute("data-word") || "DON'S";

  const updateText = () => {
    const panel = textEl.closest(".page-panel");
    const panelHeight = panel
      ? panel.getBoundingClientRect().height
      : window.innerHeight;
    const fontSize = parseFloat(getComputedStyle(textEl).fontSize) || 16;
    const approxUnit = fontSize * (word.length + 3);
    const count = Math.max(6, Math.ceil(panelHeight / approxUnit));
    textEl.innerHTML = Array.from({ length: count })
      .map((_, index) => {
        const outlineClass =
          index % 2 === 1 ? " panel-vertical-text__word--outline" : "";
        return `<span class="panel-vertical-text__word${outlineClass}">${word}</span>`;
      })
      .join("");
  };

  updateText();
  window.addEventListener("resize", updateText);
};

const initRatingSlider = () => {
  const slider = document.querySelector(".rating-slider");
  if (!slider) {
    return;
  }

  const cards = Array.from(slider.querySelectorAll(".rating-card"));
  if (cards.length <= 1) {
    return;
  }

  let current = cards.findIndex((card) => card.classList.contains("is-active"));
  if (current < 0) {
    current = 0;
    cards[0].classList.add("is-active");
  }

  const setHeight = () => {
    slider.style.height = `${cards[current].offsetHeight}px`;
  };

  const showNext = () => {
    cards[current].classList.remove("is-active");
    current = (current + 1) % cards.length;
    cards[current].classList.add("is-active");
    setHeight();
  };

  setHeight();
  window.addEventListener("resize", setHeight);
  setInterval(showNext, 4500);
};

const initRatingStars = () => {
  const rows = document.querySelectorAll(".rating-row");
  if (rows.length === 0) {
    return;
  }

  const starPath = "assets/img/rating-stars";

  const getPartialStar = (fraction) => {
    if (fraction >= 1) {
      return "star-10.svg";
    }
    if (fraction >= 0.8) {
      return "star-08-09.svg";
    }
    if (fraction >= 0.7) {
      return "star-07.svg";
    }
    if (fraction >= 0.6) {
      return "star-06.svg";
    }
    if (fraction >= 0.5) {
      return "star-05.svg";
    }
    if (fraction >= 0.4) {
      return "star-04.svg";
    }
    if (fraction >= 0.3) {
      return "star-03.svg";
    }
    if (fraction >= 0.1) {
      return "star-01-02.svg";
    }
    return "star-00.svg";
  };

  const createStar = (fileName) => {
    const img = document.createElement("img");
    img.className = "rating-star";
    img.src = `${starPath}/${fileName}`;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    return img;
  };

  rows.forEach((row) => {
    const scoreEl = row.querySelector(".rating-score");
    const starsEl = row.querySelector(".rating-stars");
    if (!scoreEl || !starsEl) {
      return;
    }

    const rating = parseFloat(scoreEl.textContent.replace(",", "."));
    if (!Number.isFinite(rating)) {
      return;
    }

    starsEl.innerHTML = "";
    const fullCount = Math.floor(rating);
    const fraction = Math.round((rating - fullCount) * 10) / 10;

    const totalStars = 5;
    for (let i = 0; i < Math.min(fullCount, totalStars); i += 1) {
      starsEl.appendChild(createStar("star-10.svg"));
    }

    if (starsEl.children.length < totalStars) {
      const partialStar = getPartialStar(fraction);
      if (partialStar !== "star-00.svg") {
        starsEl.appendChild(createStar(partialStar));
      }
    }

  while (starsEl.children.length < totalStars) {
    starsEl.appendChild(createStar("star-00.svg"));
  }
});
};

const initReviewStars = () => {
  const ratings = document.querySelectorAll(".review-rating");
  if (ratings.length === 0) {
    return;
  }

  const starPath = "assets/img/rating-stars";

  const createStar = (fileName) => {
    const img = document.createElement("img");
    img.className = "review-star";
    img.src = `${starPath}/${fileName}`;
    img.alt = "";
    img.setAttribute("aria-hidden", "true");
    return img;
  };

  ratings.forEach((ratingEl) => {
    const target =
      ratingEl.querySelector(".review-rating-link") || ratingEl;
    const ratingValue = parseInt(target.dataset.rating || "", 10);
    const text = target.textContent || "";
    const count = (text.match(/★/g) || []).length;
    const filled = Number.isFinite(ratingValue) && ratingValue > 0
      ? Math.min(5, ratingValue)
      : count;
    const totalStars = 5;

    target.innerHTML = "";
    for (let i = 0; i < filled; i += 1) {
      target.appendChild(createStar("star-10.svg"));
    }
    while (target.children.length < totalStars) {
      target.appendChild(createStar("star-00.svg"));
    }
  });
};

const initBelts = () => {
  const marqBand = document.querySelector(".marquee-band");
  if (!marqBand) {
    return;
  }

  const darkTrack = document.querySelector(".marquee-track--dark");
  const goldTrack = document.querySelector(".marquee-track--gold");
  const darkRuns = darkTrack ? darkTrack.querySelectorAll(".marquee-run") : [];
  const goldRuns = goldTrack ? goldTrack.querySelectorAll(".marquee-run") : [];
  let latestScroll = window.scrollY;
  let ticking = false;

  const setBeltOffsets = () => {
    const updateOffset = (track, runs) => {
      if (!track || runs.length === 0) {
        return;
      }
      runs.forEach((run, index) => {
        run.classList.toggle("is-second", index === 1);
      });
      const gap = parseFloat(getComputedStyle(track).gap || "0");
      const runWidth = runs[0].scrollWidth;
      const trackWidth = track.getBoundingClientRect().width;
      const baseOffset = (trackWidth - runWidth) / 2;
      track.style.setProperty("--belt-run-offset", `${runWidth + gap}px`);
      track.style.setProperty("--belt-base", `${baseOffset}px`);
    };

    updateOffset(darkTrack, darkRuns);
    updateOffset(goldTrack, goldRuns);
  };

  const updateBelt = () => {
    const beltSpeed = 0.81;
    document.documentElement.style.setProperty(
      "--belt-dark",
      `${-(latestScroll * beltSpeed)}px`
    );
    document.documentElement.style.setProperty(
      "--belt-gold",
      `${latestScroll * beltSpeed}px`
    );
    ticking = false;
  };

  const handleScroll = () => {
    latestScroll = window.scrollY;
    if (!ticking) {
      window.requestAnimationFrame(updateBelt);
      ticking = true;
    }
  };

  setBeltOffsets();
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", setBeltOffsets);
};

const initHeroSlider = () => {
  const images = document.querySelectorAll(".hero-image");
  if (images.length <= 1) {
    return;
  }
  let current = 0;

  setInterval(() => {
    images[current].classList.remove("is-active");
    current = (current + 1) % images.length;
    images[current].classList.add("is-active");
  }, 5000);
};

const initTestimonialsAvatars = () => {
  const avatars = document.querySelectorAll(
    ".testimonial-card .reviewer-avatar"
  );
  if (avatars.length === 0) {
    return;
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const palette = [
    "--avatar-1",
    "--avatar-2",
    "--avatar-3",
    "--avatar-4",
    "--avatar-5",
    "--avatar-6",
    "--avatar-7",
    "--avatar-8",
    "--avatar-9",
    "--avatar-10",
    "--avatar-11",
    "--avatar-12",
    "--avatar-13",
    "--avatar-14",
    "--avatar-15",
  ]
    .map((name) => rootStyle.getPropertyValue(name).trim())
    .filter(Boolean);

  const fallback = [
    "#f59e0b",
    "#22c55e",
    "#3b82f6",
    "#ef4444",
    "#14b8a6",
    "#f97316",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#84cc16",
    "#fb7185",
    "#6366f1",
    "#a855f7",
    "#0ea5e9",
    "#eab308",
  ];
  const colors = palette.length ? palette : fallback;

  const rows = document.querySelectorAll(".slider-row");
  const groups = rows.length > 0 ? rows : [document];

  groups.forEach((group) => {
    let lastColor = "";
    const rowAvatars =
      group === document
        ? avatars
        : group.querySelectorAll(".reviewer-avatar");

    rowAvatars.forEach((avatar) => {
      const existingColor = avatar.style
        .getPropertyValue("--avatar-color")
        .trim();
      if (existingColor) {
        lastColor = existingColor;
        return;
      }

      const options =
        colors.length > 1
          ? colors.filter((color) => color !== lastColor)
          : colors;
      const color = options[Math.floor(Math.random() * options.length)];
      avatar.style.setProperty("--avatar-color", color);
      lastColor = color;
    });
  });
};

const initTestimonialsMarquee = () => {
  const rows = document.querySelectorAll(".slider-row");
  if (rows.length === 0) {
    return;
  }

  const getRowGap = (row) => {
    const styles = getComputedStyle(row);
    const gapValue = styles.gap || styles.columnGap || "0";
    const gap = parseFloat(gapValue);
    return Number.isNaN(gap) ? 0 : gap;
  };

  const updateRow = (row) => {
    if (!row.__baseNodes) {
      row.__baseNodes = Array.from(row.children);
    }
    if (row.__baseNodes.length === 0) {
      return;
    }

    const gap = getRowGap(row);
    const baseWidth =
      row.__baseNodes.reduce(
        (sum, node) => sum + node.getBoundingClientRect().width,
        0
      ) +
      gap * Math.max(0, row.__baseNodes.length - 1);

    if (!baseWidth) {
      return;
    }

    row.style.setProperty("--marquee-shift", `${baseWidth}px`);

    const parentWidth = row.parentElement
      ? row.parentElement.clientWidth
      : window.innerWidth;
    const targetWidth = parentWidth + baseWidth;

    let safety = 0;
    while (row.scrollWidth < targetWidth && safety < 20) {
      row.__baseNodes.forEach((node) => {
        row.appendChild(node.cloneNode(true));
      });
      safety += 1;
    }
  };

  rows.forEach(updateRow);
  window.addEventListener("resize", () => rows.forEach(updateRow));
};

const initTestimonialsReviews = () => {
  const section =
    document.querySelector(".testimonials-section") ||
    document.getElementById("reviews");
  if (!section) {
    return;
  }

  const baseCards = Array.from(section.querySelectorAll(".testimonial-card"));
  if (baseCards.length === 0) {
    return;
  }

  const mapEl = document.getElementById("locations-map");
  const apiKey = mapEl ? mapEl.dataset.apiKey : "";
  if (!apiKey) {
    return;
  }

  const locations = Array.isArray(window.kebabLocations)
    ? window.kebabLocations
    : [];
  if (locations.length === 0) {
    return;
  }

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const escapeAttr = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const truncateReview = (text, maxLength = 60) => {
      const normalized = String(text || "").replace(/\s+/g, " ").trim();
      if (normalized.length <= maxLength) {
        return normalized;
      }
      const snippet = normalized.slice(0, maxLength + 1);
      const lastSpace = snippet.lastIndexOf(" ");
      const trimmed =
        lastSpace > 0 ? snippet.slice(0, lastSpace) : normalized.slice(0, maxLength);
      return `${trimmed.trim()} ...`;
    };

    let emojiRegex = null;
    try {
      emojiRegex = new RegExp(
        "(\\p{Extended_Pictographic}|\\p{Emoji_Presentation})",
        "gu"
      );
    } catch (error) {
      emojiRegex = null;
    }

    const formatReviewText = (text) => {
      const escaped = escapeHtml(text);
      if (!emojiRegex) {
        return escaped;
      }
      return escaped.replace(
        emojiRegex,
        '<span class="review-emoji">$1</span>'
      );
    };

  const shuffle = (list) => {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  let loaded = false;

  const loadReviews = () => {
    if (loaded) {
      return;
    }
    loaded = true;

    loadGoogleMapsScript(apiKey)
      .then(() => {
        ensurePlacesService();
        return Promise.all(
          locations.map((location) =>
            fetchPlaceDetails(location, detailsFieldsWithReviews).then(
              (place) => ({ place })
            )
          )
        );
      })
      .then((results) => {
        const allReviews = [];
        results.forEach(({ place }) => {
          const reviews = Array.isArray(place?.reviews) ? place.reviews : [];
          reviews.forEach((review) => {
            const rating = Number(review?.rating);
            const text = (review?.text || "").trim();
            if (!Number.isFinite(rating) || !text) {
              return;
            }
            allReviews.push({ review, place, rating });
          });
        });

        if (allReviews.length === 0) {
          return;
        }

        const high = allReviews.filter((item) => item.rating >= 4);
        const mid = allReviews.filter(
          (item) => item.rating >= 3 && item.rating < 4
        );

        let selected = shuffle(high);
        if (selected.length < baseCards.length) {
          selected = selected.concat(shuffle(mid));
        }

        if (selected.length === 0) {
          return;
        }

        const cards = Array.from(section.querySelectorAll(".testimonial-card"));
        cards.forEach((card, index) => {
          const item = selected[index % selected.length];
          if (!item) {
            return;
          }

          const reviewTextEl = card.querySelector(".review-text");
          const avatarEl = card.querySelector(".reviewer-avatar");
          const nameEl = card.querySelector(".reviewer-name-text");
          const ratingEl = card.querySelector(".review-rating");

          const authorName = (item.review?.author_name || "Guest").trim();
          const initial = authorName ? authorName.charAt(0).toUpperCase() : "?";
          const ratingValue = Math.round(item.rating);
          const reviewText = truncateReview(
            item.review?.text || "Great food!"
          );

          if (reviewTextEl) {
            reviewTextEl.innerHTML = `&ldquo;${formatReviewText(
              reviewText
            )}&rdquo;`;
          }
          if (avatarEl) {
            avatarEl.textContent = initial;
          }
          if (nameEl) {
            nameEl.textContent = authorName;
          }
          if (ratingEl) {
            const link =
              item.review?.author_url || item.place?.url || "";
            const ratingMarkup = link
              ? `<a class="review-rating-link" href="${escapeAttr(
                  link
                )}" target="_blank" rel="noopener" data-rating="${ratingValue}" aria-label="View review on Google Maps"></a>`
              : `<span class="review-rating-link" data-rating="${ratingValue}" aria-label="Review rating"></span>`;
            ratingEl.innerHTML = ratingMarkup;
          }
        });

        initReviewStars();
        initTestimonialsAvatars();
      })
      .catch((error) => {
        console.error("Reviews failed to load.", error);
      });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadReviews();
        }
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(section);
  } else {
    loadReviews();
  }
};

const getSkewYRadians = (element) => {
  const transform = getComputedStyle(element).transform;
  if (!transform || transform === "none") {
    return 0;
  }

  const values = transform
    .replace("matrix3d(", "")
    .replace("matrix(", "")
    .replace(")", "")
    .split(",")
    .map((value) => parseFloat(value));

  const b = transform.startsWith("matrix3d") ? values[1] : values[1];
  if (Number.isNaN(b)) {
    return 0;
  }
  return Math.atan(b);
};

const initPanelCut = () => {
  const panel = document.querySelector(".page-panel--full .page-slicer");
  const goldTrack = document.querySelector(".marquee-track--gold");
  if (!panel || !goldTrack) {
    return;
  }

  let ticking = false;

  const updateCut = () => {
    const goldRect = goldTrack.getBoundingClientRect();
    const angle = getSkewYRadians(goldTrack);
    const overlap = Math.max(24, Math.round(goldRect.height * 0.9));
    const panelRect = panel.getBoundingClientRect();
    const cutY = goldRect.top - panelRect.top;
    const rise = Math.tan(angle) * panelRect.width;

    panel.style.setProperty("--panel-cut-y", `${cutY}px`);
    panel.style.setProperty("--panel-cut-rise", `${rise}px`);
    panel.style.setProperty("--panel-cut-overlap", `${overlap}px`);
    ticking = false;
  };

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateCut);
      ticking = true;
    }
  };

  updateCut();
  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", updateCut);
};

let googleMapsScriptPromise = null;
let placesService = null;
const placeCache = new Map();
const placeCacheWithReviews = new Map();
const detailsFieldsBase = [
  "name",
  "rating",
  "user_ratings_total",
  "formatted_address",
  "formatted_phone_number",
  "url",
];
const detailsFieldsWithReviews = [...detailsFieldsBase, "reviews"];

const ensurePlacesService = (map) => {
  if (placesService) {
    return placesService;
  }
  if (!window.google || !google.maps || !google.maps.places) {
    return null;
  }
  const host = map || document.createElement("div");
  placesService = new google.maps.places.PlacesService(host);
  return placesService;
};

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

const getLocationKey = (location) =>
  location.placeId ||
  location.url ||
  location.name ||
  JSON.stringify(location.position);

const getQueryForLocation = (locationName) => {
  const base = "DON's Gemuse Kebab";
  return locationName ? `${base} ${locationName}` : base;
};

const fetchPlaceDetails = (location, fields = detailsFieldsBase) =>
  new Promise((resolve) => {
    const cacheKey = getLocationKey(location);
    const wantsReviews = fields.includes("reviews");
    if (!wantsReviews && placeCacheWithReviews.has(cacheKey)) {
      resolve(placeCacheWithReviews.get(cacheKey));
      return;
    }
    const activeCache = wantsReviews ? placeCacheWithReviews : placeCache;
    if (activeCache.has(cacheKey)) {
      resolve(activeCache.get(cacheKey));
      return;
    }

    const service = ensurePlacesService();
    if (!service) {
      resolve(null);
      return;
    }

    const finalize = (place) => {
      activeCache.set(cacheKey, place);
      if (place) {
        placeCache.set(cacheKey, place);
        if (wantsReviews) {
          placeCacheWithReviews.set(cacheKey, place);
        }
      }
      resolve(place);
    };

    if (location.placeId) {
        service.getDetails(
          { placeId: location.placeId, fields },
          (place, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              finalize(place);
            } else {
              finalize(null);
          }
        }
      );
      return;
    }

    const query = getQueryForLocation(location.name);
    service.findPlaceFromQuery(
      {
        query,
        fields: ["place_id"],
        locationBias: location.position,
      },
      (results, status) => {
        if (
          status !== google.maps.places.PlacesServiceStatus.OK ||
          !results ||
          results.length === 0
        ) {
          finalize(null);
          return;
        }

        const placeId = results[0].place_id;
        if (!placeId) {
          finalize(null);
          return;
        }

          service.getDetails(
            { placeId, fields },
            (place, detailStatus) => {
              if (
                detailStatus === google.maps.places.PlacesServiceStatus.OK &&
                place
            ) {
              finalize(place);
            } else {
              finalize(null);
            }
          }
        );
      }
    );
  });

const loadGoogleMapsScript = (apiKey) => {
  if (window.google && google.maps && google.maps.Map) {
    return Promise.resolve();
  }

  if (googleMapsScriptPromise) {
    return googleMapsScriptPromise;
  }

  googleMapsScriptPromise = new Promise((resolve, reject) => {
    window.__initGoogleMaps = () => {
      resolve();
    };

    const existing = document.querySelector("script[data-google-maps]");
    if (existing) {
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__initGoogleMaps&libraries=marker,places&loading=async`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "true";
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  return googleMapsScriptPromise;
};

const initKebabMap = () => {
  const mapEl = document.getElementById("locations-map");
  if (!mapEl || !window.google || !google.maps) {
    return;
  }

  const fallbackLocations = [
    {
      name: "Don's Kebab Prague",
      position: { lat: 50.0755, lng: 14.4378 },
    },
  ];
  const locations =
    Array.isArray(window.kebabLocations) && window.kebabLocations.length > 0
      ? window.kebabLocations
      : fallbackLocations;
  const center = locations[0]?.position || fallbackLocations[0].position;

  const mapId = mapEl.dataset.mapId || "";
  const map = new google.maps.Map(mapEl, {
    center,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapId: mapId || undefined,
  });

  const bounds = new google.maps.LatLngBounds();

  const infoWindow = new google.maps.InfoWindow();
  ensurePlacesService(map);
  const iconUrl = new URL(
    "assets/img/main-page/pin.svg",
    window.location.href
  ).href;
  const markerSize = 31;
  let infoNonce = 0;

  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const buildInfoContent = (name, url, placeDetails, isLoading = false) => {
    const displayName =
      placeDetails?.name || `DON's Gemuse Kebab${name ? ` ${name}` : ""}`;
    const rating = Number.isFinite(placeDetails?.rating)
      ? placeDetails.rating.toFixed(1)
      : null;
    const reviews = placeDetails?.user_ratings_total
      ? ` (${placeDetails.user_ratings_total})`
      : "";
    const address = placeDetails?.formatted_address;
    const phone = placeDetails?.formatted_phone_number;
    const mapLink = placeDetails?.url || url;

    return `
      <div style="font-family: 'Source Sans 3', sans-serif; font-size: 14px; line-height: 1.4; min-width: 180px; padding-right: 36px;">
        <strong style="display:block; margin-bottom:6px;">${escapeHtml(
          displayName
        )}</strong>
          ${
            rating
              ? `<div style="margin-bottom:6px; color:#2b2e2f;">
                  <img class="map-info-star" src="assets/img/rating-stars/star-10.svg" alt="" aria-hidden="true" />
                  ${rating}${reviews}
                </div>`
              : ""
          }
        ${
          address
            ? `<div style="margin-bottom:6px; color:#5c5c5c; font-size:12px;">${escapeHtml(
                address
              )}</div>`
            : ""
        }
        ${
          phone
            ? `<div style="margin-bottom:6px; color:#5c5c5c; font-size:12px;">${escapeHtml(
                phone
              )}</div>`
            : ""
        }
        ${
          isLoading
            ? `<div style="margin-top:6px; color:#6f6f6f; font-size:12px;">Loading details...</div>`
            : ""
        }
          ${
            mapLink
              ? `<a href="${mapLink}" target="_blank" rel="noopener" class="map-info-link" style="font-size:12px;">Open in Google Maps</a>`
              : ""
          }
      </div>
    `;
  };

  const createMarkerContent = () => {
    const wrapper = document.createElement("div");
    wrapper.style.width = `${markerSize}px`;
    wrapper.style.height = `${markerSize}px`;
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    wrapper.style.background = "transparent";
    wrapper.style.border = "none";
    wrapper.style.boxShadow = "none";
    wrapper.style.padding = "0";
    wrapper.style.margin = "0";
    wrapper.style.borderRadius = "0";
    wrapper.style.overflow = "visible";

    const img = document.createElement("img");
    img.src = iconUrl;
    img.alt = "";
    img.width = markerSize;
    img.height = markerSize;
    img.style.display = "block";
    img.style.background = "transparent";
    img.style.border = "none";
    img.style.boxShadow = "none";

    wrapper.appendChild(img);
    return wrapper;
  };

  const styleAdvancedMarker = (marker) => {
    const element = marker.element;
    if (!element) {
      return;
    }
    element.style.background = "transparent";
    element.style.border = "0";
    element.style.boxShadow = "none";
    element.style.setProperty("--marker-background", "transparent");
    element.style.setProperty("--marker-border-color", "transparent");
    element.style.setProperty("--marker-glyph-color", "transparent");
    element.style.setProperty("--marker-shadow", "none");
  };

  const useAdvanced =
    mapId &&
    google.maps.marker &&
    google.maps.marker.AdvancedMarkerElement;

  locations.forEach((location) => {
    const { name, position, url } = location;
    let marker;

    if (useAdvanced) {
      marker = new google.maps.marker.AdvancedMarkerElement({
        position,
        map,
        title: name,
        content: createMarkerContent(),
      });
      styleAdvancedMarker(marker);
    } else {
      marker = new google.maps.Marker({
        position,
        map,
        title: name,
        icon: {
          url: iconUrl,
          scaledSize: new google.maps.Size(markerSize, markerSize),
          anchor: new google.maps.Point(markerSize / 2, markerSize),
        },
        optimized: false,
      });
    }

    marker.addListener("click", () => {
      const currentNonce = (infoNonce += 1);
      infoWindow.setContent(buildInfoContent(name, url, null, true));
      infoWindow.open({ map, anchor: marker });

      fetchPlaceDetails(location).then((place) => {
        if (currentNonce !== infoNonce) {
          return;
        }
        infoWindow.setContent(buildInfoContent(name, url, place, false));
        infoWindow.open({ map, anchor: marker });
      });
    });
    bounds.extend(position);
  });

  if (locations.length > 1) {
    map.fitBounds(bounds);
  }
};

const initHeroRatingPlaces = () => {
  const cards = document.querySelectorAll(".rating-card");
  if (cards.length === 0) {
    return;
  }

  const mapEl = document.getElementById("locations-map");
  const apiKey = mapEl ? mapEl.dataset.apiKey : "";
  if (!apiKey) {
    return;
  }

  const locations = Array.isArray(window.kebabLocations)
    ? window.kebabLocations
    : [];
  if (locations.length === 0) {
    return;
  }

  const locationIndex = new Map();
  locations.forEach((location) => {
    if (location.name) {
      locationIndex.set(normalizeKey(location.name), location);
    }
  });

  loadGoogleMapsScript(apiKey)
    .then(() => {
      ensurePlacesService();
      const updates = [];

      cards.forEach((card) => {
        const locationEl = card.querySelector(".rating-location");
        const scoreEl = card.querySelector(".rating-score");
        const countEl = card.querySelector(".rating-count");
        if (!locationEl || !scoreEl || !countEl) {
          return;
        }

        const locationKey = normalizeKey(locationEl.textContent);
        const location = locationIndex.get(locationKey);
        if (!location) {
          return;
        }

        updates.push(
          fetchPlaceDetails(location).then((place) => {
            if (!place) {
              return;
            }
            if (Number.isFinite(place.rating)) {
              scoreEl.textContent = place.rating.toFixed(1);
            }
            if (Number.isFinite(place.user_ratings_total)) {
              countEl.textContent = `(${place.user_ratings_total})`;
            }
          })
        );
      });

      return Promise.all(updates);
    })
    .then(() => {
      initRatingStars();
    })
    .catch((error) => {
      console.error("Hero ratings failed to load.", error);
    });
};

const initLazyMap = () => {
  const mapEl = document.getElementById("locations-map");
  if (!mapEl) {
    return;
  }

  const apiKey = mapEl.dataset.apiKey;
  if (!apiKey) {
    console.warn("Missing Google Maps API key on #locations-map.");
    return;
  }

  const loadMap = () => {
    if (mapEl.dataset.mapLoaded) {
      return;
    }
    mapEl.dataset.mapLoaded = "true";
    loadGoogleMapsScript(apiKey)
      .then(() => {
        initKebabMap();
      })
      .catch((error) => {
        console.error("Google Maps failed to load.", error);
      });
  };

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          loadMap();
        }
      },
      { rootMargin: "120px 0px" }
    );
    observer.observe(mapEl);
  } else {
    loadMap();
  }
};

const includeTargets = document.querySelectorAll("[data-include]");
const includeJobs = Array.from(includeTargets).map((target) => {
  const file = target.getAttribute("data-include");
  if (!file) {
    return Promise.resolve();
  }
  return fetch(file)
    .then((response) => response.text())
    .then((html) => {
      target.outerHTML = html;

      const partialLoadedEvent = new CustomEvent('partialLoaded', {
        detail: { partialKey: file }
      });

      document.dispatchEvent(partialLoadedEvent);
    })
    .catch((error) => {
      console.error("Include failed:", file, error);
    });
});

Promise.all(includeJobs).then(() => {
  initPanelWidthFromMenu();
  initPanelVerticalText();
  initRatingStars();
  initRatingSlider();
  initBelts();
  initPanelCut();
  initHeroSlider();
  initReviewStars();
  initTestimonialsAvatars();
  initTestimonialsReviews();
  initTestimonialsMarquee();
  initHeroRatingPlaces();
  initLazyMap();
});
