const APPS_SCRIPT_ROOM_DATA_URL = "https://script.google.com/macros/s/AKfycbwhMgdV9eVMkcKvfGoxqQrgjKzDheOX8qM8hOu78v_H20OCd8vfGrcn2QDZt9Cc-cRY/exec?action=getPublicRoomTypes";

let roomCatalog = [
  {
    id: "deluxe",
    name: "Deluxe Room",
    rate: 139,
    totalRooms: 1,
    availableRooms: 0,
    image: "assets/gallery-enhanced/img_0836-enhanced.webp",
    imageAlt: "Deluxe Capeway Inn guest room with warm lighting",
    description: "Spacious room with premium furnishings and a quiet coastal base.",
    amenities: ["Free WiFi", "Cable TV", "Mini Bar", "Balcony"]
  },
  {
    id: "standard",
    name: "Standard Room",
    rate: 119,
    totalRooms: 1,
    availableRooms: 1,
    image: "assets/gallery-enhanced/img_0844-enhanced.webp",
    imageAlt: "Standard Capeway Inn room with sofa and kitchenette",
    description: "Comfortable and cozy room with essential amenities for a pleasant stay.",
    amenities: ["Free WiFi", "A/C", "TV", "Room Service"]
  },
  {
    id: "family",
    name: "Family Suite",
    rate: 159,
    totalRooms: 1,
    availableRooms: 1,
    image: "assets/gallery-enhanced/img_0835-enhanced.webp",
    imageAlt: "Family suite living area with sofa at Capeway Inn",
    description: "Flexible suite for families or small groups who want more room to settle in.",
    amenities: ["Free WiFi", "Kitchenette", "Cable TV", "Sleeper Sofa"]
  },
  {
    id: "extended",
    name: "Extended Stay Suite",
    rate: 169,
    totalRooms: 1,
    availableRooms: 1,
    image: "assets/gallery-enhanced/img_0834-enhanced.webp",
    imageAlt: "Capeway Inn extended stay room corridor and sitting bench",
    description: "A longer-stay option with extra comfort for work trips and coastal visits.",
    amenities: ["Free WiFi", "Workspace", "Weekly Rate", "Monthly Rate"]
  }
];

let roomRates = createRoomRates(roomCatalog);

const CONTACT_WEBHOOK_URL = "https://n8n.srv1291312.hstgr.cloud/webhook/6b7482c4-1562-4069-86e6-68638fa1fd7c";
const QUICK_BOOKING_WEBHOOK_URL = "https://n8n.srv1291312.hstgr.cloud/webhook/Reservation-Inquiries";
const HERO_VIDEO_URL = "https://killerplayer.com/watch/video/4c544c8a-f1a1-4965-bf84-5bda1e6a5bc1";
const SITE_SETTINGS_KEY = "capewaySiteSettings";
let quickBookingFlipTimer;
let contactFlipTimer;

const selectors = {
  header: document.getElementById("siteHeader"),
  menuToggle: document.getElementById("menuToggle"),
  primaryMenu: document.getElementById("primaryMenu"),
  heroBookingPanel: document.getElementById("heroBookingPanel"),
  bookingSection: document.getElementById("reservation-request"),
  quickBookingForm: document.getElementById("quickBookingForm"),
  quickBookingStatus: document.getElementById("quickBookingStatus"),
  quickBookingInquiryId: document.getElementById("quickBookingInquiryId"),
  contactForm: document.getElementById("contactForm"),
  contactStatus: document.getElementById("contactStatus"),
  contactSuccessHeading: document.getElementById("contactSuccessHeading"),
  heroVideoOpen: document.getElementById("heroVideoOpen"),
  heroVideoModal: document.getElementById("heroVideoModal"),
  heroVideoClose: document.getElementById("heroVideoClose"),
  heroVideoFrame: document.getElementById("heroVideoFrame"),
  reservationModal: document.getElementById("reservationModal"),
  reservationModalPanel: document.getElementById("reservationModalPanel"),
  reservationModalClose: document.getElementById("reservationModalClose"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxClose: document.getElementById("lightboxClose"),
  cookieConsent: document.getElementById("cookieConsent"),
  cookiePreferencesModal: document.getElementById("cookiePreferencesModal"),
  scrollTopButton: document.getElementById("scrollTopButton"),
  roomsLiveGrid: document.getElementById("roomsLiveGrid"),
  calculatorRoomType: document.getElementById("calculatorRoomType"),
  calculatorDuration: document.getElementById("calculatorDuration"),
  calculatorQuantity: document.getElementById("calculatorQuantity"),
  calculatorRate: document.getElementById("calculatorRate"),
  calculatorNights: document.getElementById("calculatorNights"),
  calculatorSubtotal: document.getElementById("calculatorSubtotal"),
  calculatorDiscount: document.getElementById("calculatorDiscount"),
  calculatorTotal: document.getElementById("calculatorTotal"),
  calculatorBookNow: document.getElementById("calculatorBookNow")
};

const COOKIE_CONSENT_KEY = "capewayCookieConsent";
const defaultCookieConsent = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false
};

const defaultSiteSettings = {
  businessName: "Capeway Inn & Suites",
  logoUrl: "assets/images/capeway-logo-inn-suites.webp",
  address: "11 Main Street, Route 100, St. Bride's, NL A0B 2Z0",
  phone: "(709) 337-2163",
  tollFree: "1-866-337-2163",
  email: "jk.cruz@inboxeen.com"
};

function readSiteSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SITE_SETTINGS_KEY) || "null");
    return { ...defaultSiteSettings, ...(stored || {}) };
  } catch (error) {
    return { ...defaultSiteSettings };
  }
}

function toPhoneHref(value) {
  const phone = String(value || "").replace(/[^\d+]/g, "");
  if (!phone) return "#contact";
  if (phone.startsWith("+")) return `tel:${phone}`;
  if (phone.length === 11 && phone.startsWith("1")) return `tel:+${phone}`;
  return `tel:+1${phone}`;
}

function applySiteSettings() {
  const settings = readSiteSettings();

  document.querySelectorAll('[data-site-setting="businessName"]').forEach((element) => {
    element.textContent = settings.businessName;
  });

  document.querySelectorAll('[data-site-setting="address"]').forEach((element) => {
    element.textContent = settings.address;
  });

  document.querySelectorAll('[data-site-setting="phone"]').forEach((element) => {
    element.textContent = element.closest("address") ? `Tel: ${settings.phone}` : settings.phone;
    element.setAttribute("href", toPhoneHref(settings.phone));
  });

  document.querySelectorAll('[data-site-setting="tollFree"]').forEach((element) => {
    element.textContent = element.closest("address") ? `Toll Free: ${settings.tollFree}` : settings.tollFree;
    element.setAttribute("href", toPhoneHref(settings.tollFree));
  });

  document.querySelectorAll('[data-site-setting="email"]').forEach((element) => {
    element.textContent = settings.email;
    element.setAttribute("href", `mailto:${settings.email}`);
  });

  document.querySelectorAll('[data-site-setting="logo"]').forEach((image) => {
    image.src = settings.logoUrl;
    image.alt = `${settings.businessName} logo`;
  });
}

function generateInquiryId() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("");
  const randomValues = new Uint8Array(3);
  crypto.getRandomValues(randomValues);
  const randomPart = Array.from(randomValues, (value) => value.toString(36).padStart(2, "0"))
    .join("")
    .toUpperCase();

  return `INQ-${datePart}-${randomPart}`;
}

async function getInquiryIdFromResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return "";

  try {
    const data = await response.json();
    return data.inquiryId || data.inquiryID || data.id || "";
  } catch (error) {
    return "";
  }
}

function setContactSuccessHeading(greeting) {
  selectors.contactSuccessHeading.replaceChildren();

  const greetingLine = document.createElement("span");
  greetingLine.textContent = greeting;

  const messageLine = document.createElement("span");
  messageLine.textContent = "appreciate you reaching out!";

  selectors.contactSuccessHeading.append(greetingLine, messageLine);
}

function readCookieConsent() {
  try {
    const stored = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) || "null");
    if (!stored) return null;
    return {
      ...defaultCookieConsent,
      ...stored,
      necessary: true
    };
  } catch (error) {
    return null;
  }
}

function publishCookieConsent(consent) {
  window.CapewayCookieConsent = {
    consent,
    hasConsent: (category) => Boolean(consent?.[category])
  };
  window.dispatchEvent(new CustomEvent("capewayCookieConsentChange", { detail: consent }));
}

function saveCookieConsent(consent) {
  const nextConsent = {
    ...defaultCookieConsent,
    ...consent,
    necessary: true,
    savedAt: new Date().toISOString()
  };
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(nextConsent));
  publishCookieConsent(nextConsent);
  return nextConsent;
}

function setCookieToggleState(consent) {
  document.querySelectorAll("[data-cookie-toggle]").forEach((toggle) => {
    toggle.checked = Boolean(consent?.[toggle.dataset.cookieToggle]);
  });
}

function getCookieToggleState() {
  const consent = { ...defaultCookieConsent };
  document.querySelectorAll("[data-cookie-toggle]").forEach((toggle) => {
    consent[toggle.dataset.cookieToggle] = toggle.checked;
  });
  return consent;
}

function hideCookieConsent() {
  selectors.cookieConsent?.setAttribute("hidden", "");
  closeCookiePreferences();
}

function openCookiePreferences() {
  if (!selectors.cookiePreferencesModal) return;

  setCookieToggleState(readCookieConsent() || defaultCookieConsent);
  selectors.cookiePreferencesModal.classList.add("active");
  selectors.cookiePreferencesModal.setAttribute("aria-hidden", "false");
  selectors.cookiePreferencesModal.querySelector("[data-cookie-toggle], button")?.focus();
}

function closeCookiePreferences() {
  if (!selectors.cookiePreferencesModal) return;

  selectors.cookiePreferencesModal.classList.remove("active");
  selectors.cookiePreferencesModal.setAttribute("aria-hidden", "true");
}

function setupCookieConsent() {
  const storedConsent = readCookieConsent();
  publishCookieConsent(storedConsent || defaultCookieConsent);
  setCookieToggleState(storedConsent || defaultCookieConsent);

  if (!storedConsent && selectors.cookieConsent) {
    selectors.cookieConsent.removeAttribute("hidden");
  }

  document.querySelectorAll("[data-cookie-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.cookieAction;

      if (action === "accept") {
        saveCookieConsent({ analytics: true, marketing: true, preferences: true });
        hideCookieConsent();
      }

      if (action === "reject") {
        saveCookieConsent({ analytics: false, marketing: false, preferences: false });
        hideCookieConsent();
      }

      if (action === "manage") {
        openCookiePreferences();
      }

      if (action === "save") {
        saveCookieConsent(getCookieToggleState());
        hideCookieConsent();
      }

      if (action === "close-preferences") {
        closeCookiePreferences();
        selectors.cookieConsent?.querySelector('[data-cookie-action="manage"]')?.focus();
      }
    });
  });

  selectors.cookiePreferencesModal?.addEventListener("click", (event) => {
    if (event.target === selectors.cookiePreferencesModal) {
      closeCookiePreferences();
    }
  });

  selectors.cookiePreferencesModal?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCookiePreferences();
      selectors.cookieConsent?.querySelector('[data-cookie-action="manage"]')?.focus();
    }

    if (event.key === "Tab") {
      const focusable = Array.from(
        selectors.cookiePreferencesModal.querySelectorAll('button, input, a, [tabindex]:not([tabindex="-1"])')
      ).filter((element) => !element.disabled && element.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function init() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
  applySiteSettings();
  setupRoomsExperience();
  setDateMinimums();
  setupDatePickerActivation();
  setupHeroBookingPanel();
  setupFooterReservationModal();
  setupNavigation();
  handleHeaderScroll();
  setupQuickBooking();
  setupContactForm();
  setupGallery();
  setupHeroVideo();
  setupFaq();
  setupInfoFlipCards();
  setupAmenityCards();
  setupDetailsPanel();
  setupScrollTopButton();
  setupRevealObserver();
  setupCookieConsent();
}

function createRoomRates(rooms) {
  return rooms.reduce((rates, room) => {
    rates[room.id] = { name: room.name, rate: room.rate };
    return rates;
  }, {});
}

function normalizeRoomType(room, index) {
  const type = String(room.type || room.id || room.name || `room-${index + 1}`).trim();
  const id = type.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `room-${index + 1}`;
  const nightlyRate = Number(room.pricePerNight || room.nightlyRate || room.rate || 0);
  const totalRooms = Number(room.totalRooms || room.total || 0);
  const availableRooms = Number(room.availableRooms || room.available || 0);
  const fallback = roomCatalog.find((item) => item.id === id) || roomCatalog[index] || roomCatalog[0];

  return {
    id,
    sourceType: type,
    name: room.name || `${type} Room`,
    rate: nightlyRate || fallback?.rate || 0,
    totalRooms,
    availableRooms,
    image: room.image || room.imageUrl || fallback?.image || "",
    imageAlt: `${room.name || type} at Capeway Inn`,
    description: room.description || fallback?.description || "Comfortable accommodation with essential amenities for a pleasant stay.",
    amenities: Array.isArray(room.amenities)
      ? room.amenities
      : String(room.amenities || "")
        .split(",")
        .map((amenity) => amenity.trim())
        .filter(Boolean),
    pricePerWeek: Number(room.pricePerWeek || room.weeklyRate || 0),
    pricePerMonth: Number(room.pricePerMonth || room.monthlyRate || 0)
  };
}

async function loadRoomCatalogFromAppsScript() {
  try {
    const response = await fetch(APPS_SCRIPT_ROOM_DATA_URL, {
      headers: { "Accept": "application/json" },
      cache: "no-store"
    });
    const contentType = response.headers.get("content-type") || "";
    if (!response.ok || !contentType.includes("application/json")) return null;

    const result = await response.json();
    const rows = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result.roomTypes)
        ? result.roomTypes
        : Array.isArray(result)
          ? result
          : [];

    return rows.length ? rows.map(normalizeRoomType) : null;
  } catch (error) {
    console.warn("Could not load Apps Script room data:", error);
    return null;
  }
}

async function setupRoomsExperience() {
  if (!selectors.roomsLiveGrid && !selectors.calculatorRoomType) return;

  const liveRooms = await loadRoomCatalogFromAppsScript();
  if (liveRooms) {
    roomCatalog = liveRooms;
    roomRates = createRoomRates(roomCatalog);
    syncQuickRoomOptions();
  }

  setupRoomsShowcase();
  setupPriceCalculator();
}

function syncQuickRoomOptions() {
  const select = document.getElementById("quickRoomType");
  if (!select || !roomCatalog.length) return;

  const currentValue = select.value;
  select.innerHTML = [
    '<option value="">Select room</option>',
    ...roomCatalog.map((room) => `<option value="${escapeHtml(room.id)}">${escapeHtml(room.name)}</option>`)
  ].join("");
  if (roomCatalog.some((room) => room.id === currentValue)) {
    select.value = currentValue;
  }
}

function formatMoney(value, options = {}) {
  const amount = Number(value) || 0;
  const minimumFractionDigits = options.forceCents ? 2 : 0;
  const maximumFractionDigits = options.forceCents ? 2 : 2;
  return `$${amount.toLocaleString("en-US", { minimumFractionDigits, maximumFractionDigits })}`;
}

function getRoomBadge(room) {
  const totalRooms = Number(room.totalRooms) || 0;
  const availableRooms = Number(room.availableRooms) || 0;

  if (totalRooms > 0 && availableRooms <= 0) {
    return { label: "Fully Booked", type: "danger" };
  }

  return {
    label: totalRooms > 0 ? `${availableRooms}/${totalRooms} Available` : "Available",
    type: totalRooms > 0 && availableRooms < totalRooms ? "warning" : "success"
  };
}

function getRoomPricing(room) {
  const nightly = Number(room.rate) || 0;
  const weekly = Number(room.pricePerWeek) || nightly * 7 * 0.9;
  const monthly = Number(room.pricePerMonth) || nightly * 30 * 0.8;
  return { nightly, weekly, monthly };
}

function setupRoomsShowcase() {
  if (!selectors.roomsLiveGrid) return;

  selectors.roomsLiveGrid.innerHTML = roomCatalog.map((room) => {
    const badge = getRoomBadge(room);
    const pricing = getRoomPricing(room);
    const amenities = room.amenities.map((amenity) => (
      `<span class="live-room-amenity">${escapeHtml(amenity)}</span>`
    )).join("");

    return `
      <article class="live-room-card reveal">
        <div class="live-room-image">
          <img width="1800" height="1200" src="${escapeHtml(room.image)}" alt="${escapeHtml(room.imageAlt)}" decoding="async" loading="lazy">
          <span class="live-room-badge live-room-badge-${badge.type}">${escapeHtml(badge.label)}</span>
        </div>
        <div class="live-room-body">
          <h3>${escapeHtml(room.name)}</h3>
          <p>${escapeHtml(room.description)}</p>
          <div class="live-room-amenities">${amenities}</div>
          <div class="live-room-prices">
            <div><span>Per Night</span><strong>${formatMoney(pricing.nightly)}</strong></div>
            <div><span>Weekly (10% off)</span><strong>${formatMoney(pricing.weekly, { forceCents: true })}</strong></div>
            <div><span>Monthly (20% off)</span><strong>${formatMoney(pricing.monthly, { forceCents: true })}</strong></div>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function calculateRoomStay(room, duration, quantity) {
  const count = Math.max(1, Number.parseInt(quantity, 10) || 1);
  const nightlyRate = Number(room.rate) || 0;
  const durationMap = {
    nightly: { nights: count, discountRate: 0 },
    weekly: { nights: count * 7, discountRate: 0.1 },
    monthly: { nights: count * 30, discountRate: 0.2 }
  };
  const details = durationMap[duration] || durationMap.nightly;
  const subtotal = nightlyRate * details.nights;
  const discount = subtotal * details.discountRate;

  return {
    nightlyRate,
    nights: details.nights,
    subtotal,
    discount,
    total: subtotal - discount
  };
}

function setupPriceCalculator() {
  if (!selectors.calculatorRoomType || !selectors.calculatorDuration || !selectors.calculatorQuantity) return;

  const currentValue = selectors.calculatorRoomType.value;
  selectors.calculatorRoomType.innerHTML = roomCatalog.map((room) => (
    `<option value="${escapeHtml(room.id)}">${escapeHtml(room.name)} - ${formatMoney(room.rate)}/night</option>`
  )).join("");
  if (roomCatalog.some((room) => room.id === currentValue)) {
    selectors.calculatorRoomType.value = currentValue;
  }

  const updateCalculator = () => {
    const room = roomCatalog.find((item) => item.id === selectors.calculatorRoomType.value) || roomCatalog[0];
    const pricing = calculateRoomStay(room, selectors.calculatorDuration.value, selectors.calculatorQuantity.value);

    selectors.calculatorRate.textContent = formatMoney(pricing.nightlyRate);
    selectors.calculatorNights.textContent = String(pricing.nights);
    selectors.calculatorSubtotal.textContent = formatMoney(pricing.subtotal, { forceCents: true });
    selectors.calculatorDiscount.textContent = pricing.discount > 0
      ? `-${formatMoney(pricing.discount, { forceCents: true })}`
      : "-";
    selectors.calculatorTotal.textContent = formatMoney(pricing.total, { forceCents: true });
  };

  [selectors.calculatorRoomType, selectors.calculatorDuration, selectors.calculatorQuantity].forEach((control) => {
    control.addEventListener("input", updateCalculator);
    control.addEventListener("change", updateCalculator);
  });

  selectors.calculatorBookNow?.addEventListener("click", () => {
    const selectedRoom = document.getElementById("quickRoomType");
    if (selectedRoom) selectedRoom.value = selectors.calculatorRoomType.value;
  });

  updateCalculator();
}

function setDateMinimums() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = addDays(today, 1);
  const todayValue = toDateInputValue(today);
  const tomorrowValue = toDateInputValue(tomorrow);

  ["quickCheckIn"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.min = todayValue;
  });

  ["quickCheckOut"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.min = tomorrowValue;
  });
}

function setupHeroBookingPanel() {
  if (!selectors.heroBookingPanel || !selectors.quickBookingForm) return;

  selectors.heroBookingPanel.append(selectors.quickBookingForm);
  selectors.quickBookingForm.classList.remove("reveal");
  selectors.bookingSection?.setAttribute("hidden", "");

  const scrollPanelIntoView = () => {
    const headerHeight = selectors.header?.offsetHeight || 0;
    const topPadding = 72;
    const panelTop = selectors.heroBookingPanel.getBoundingClientRect().top + window.scrollY;

    window.scrollTo({
      top: Math.max(0, panelTop - headerHeight - topPadding),
      behavior: "smooth"
    });
  };

  const openPanel = (shouldScroll = true) => {
    selectors.heroBookingPanel.classList.add("is-open");
    selectors.heroBookingPanel.setAttribute("aria-hidden", "false");
    document.querySelectorAll('a[href="#reservation-request"]:not([data-footer-reservation-modal])').forEach((link) => {
      link.setAttribute("aria-expanded", "true");
    });

    if (shouldScroll) {
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollPanelIntoView);
      });
    }
  };

  document.querySelectorAll('a[href="#reservation-request"]:not([data-footer-reservation-modal])').forEach((link) => {
    link.setAttribute("aria-controls", "heroBookingPanel");
    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openPanel();
    });
  });
}

function setupFooterReservationModal() {
  if (!selectors.reservationModal || !selectors.reservationModalPanel || !selectors.quickBookingForm) return;

  const footerButtons = document.querySelectorAll("[data-footer-reservation-modal]");
  if (!footerButtons.length) return;

  const closeModal = () => {
    selectors.reservationModal.classList.remove("active");
    selectors.reservationModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("reservation-modal-open");
    selectors.heroBookingPanel?.append(selectors.quickBookingForm);
  };

  const openModal = () => {
    selectors.reservationModalPanel.append(selectors.quickBookingForm);
    selectors.reservationModal.classList.add("active");
    selectors.reservationModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("reservation-modal-open");
    selectors.quickBookingForm.querySelector("input, select, textarea, button")?.focus({ preventScroll: true });
  };

  footerButtons.forEach((button) => {
    button.setAttribute("aria-controls", "reservationModal");
    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal();
    });
  });

  selectors.reservationModalClose?.addEventListener("click", closeModal);
  selectors.reservationModal.addEventListener("click", (event) => {
    if (event.target === selectors.reservationModal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectors.reservationModal.classList.contains("active")) {
      closeModal();
    }
  });
}

function setupDatePickerActivation() {
  ["quickCheckIn", "quickCheckOut"].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    const openPicker = () => {
      try {
        input.focus({ preventScroll: true });
      } catch (error) {
        input.focus();
      }

      if (typeof input.showPicker === "function") {
        try {
          input.showPicker();
          return true;
        } catch (error) {
          input.focus();
        }
      }

      return false;
    };

    input.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      if (openPicker()) event.preventDefault();
    });

    input.addEventListener("click", () => {
      openPicker();
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openPicker();
      }
    });
  });
}

function setupNavigation() {
  const setMenuState = (isOpen) => {
    selectors.menuToggle?.setAttribute("aria-expanded", String(isOpen));
    selectors.primaryMenu?.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  };

  selectors.menuToggle?.addEventListener("click", () => {
    const isOpen = selectors.menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  selectors.primaryMenu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) setMenuState(false);
  });
}

function setupFaq() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const button = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");
    if (!button || !answer) return;

    const sync = () => {
      answer.style.maxHeight = item.classList.contains("open") ? `${answer.scrollHeight}px` : "0px";
    };

    button.addEventListener("click", () => {
      const shouldOpen = !item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach((openItem) => {
        if (openItem === item) return;
        openItem.classList.remove("open");
        openItem.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        const openAnswer = openItem.querySelector(".faq-answer");
        if (openAnswer) openAnswer.style.maxHeight = "0px";
      });
      item.classList.toggle("open", shouldOpen);
      button.setAttribute("aria-expanded", String(shouldOpen));
      sync();
    });

    sync();
    window.addEventListener("resize", sync, { passive: true });
  });
}

function setupAmenityCards() {
  document.querySelectorAll(".amenity-flip-card").forEach((card) => {
    const flip = () => {
      const isFlipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(isFlipped));
    };

    card.addEventListener("click", flip);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      flip();
    });
  });
}

function setupInfoFlipCards() {
  document.querySelectorAll(".info-flip-card").forEach((card) => {
    const flip = () => {
      const isFlipped = card.classList.toggle("is-flipped");
      card.setAttribute("aria-pressed", String(isFlipped));
    };

    card.addEventListener("click", flip);
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      flip();
    });
  });
}

function setupDetailsPanel() {
  document.querySelectorAll(".details-flip-panel").forEach((panel) => {
    const flip = () => {
      const isFlipped = panel.classList.toggle("is-flipped");
      panel.setAttribute("aria-pressed", String(isFlipped));
    };

    panel.addEventListener("click", flip);
    panel.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      flip();
    });
  });
}

function setupScrollTopButton() {
  if (!selectors.scrollTopButton) return;

  const sync = () => {
    selectors.scrollTopButton.classList.toggle("is-visible", window.scrollY > 520);
  };

  selectors.scrollTopButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  sync();
  window.addEventListener("scroll", sync, { passive: true });
}

function handleHeaderScroll() {
  if (!selectors.header) return;

  const syncHeader = () => {
    selectors.header.classList.toggle("scrolled", window.scrollY > 24);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function setupQuickBooking() {
  selectors.quickBookingForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(selectors.quickBookingForm);

    const checkIn = document.getElementById("quickCheckIn").value;
    const checkOut = document.getElementById("quickCheckOut").value;
    const guests = document.getElementById("quickGuests").value;
    const roomType = document.getElementById("quickRoomType").value;
    const firstName = document.getElementById("quickFirstName");
    const lastName = document.getElementById("quickLastName");
    const contact = document.getElementById("quickContact");
    const email = document.getElementById("quickEmail");
    const specialRequest = document.getElementById("quickSpecialRequest");
    const submitButton = selectors.quickBookingForm.querySelector('button[type="submit"]');

    const requiredFields = [
      { input: document.getElementById("quickCheckIn"), message: "Please select a check-in date." },
      { input: document.getElementById("quickCheckOut"), message: "Please select a check-out date." },
      { input: document.getElementById("quickGuests"), message: "Please choose the number of guests." },
      { input: document.getElementById("quickRoomType"), message: "Please select a room type." },
      { input: firstName, message: "Please enter your first name." },
      { input: lastName, message: "Please enter your last name." },
      { input: contact, message: "Please enter your contact number." },
      { input: email, message: "Please enter your email address." }
    ];

    let hasError = false;

    requiredFields.forEach(({ input, message }) => {
      if (!input.value.trim()) {
        showError(input, message);
        hasError = true;
      }
    });

    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, "Enter a valid email address.");
      hasError = true;
    }

    if (hasError) {
      selectors.quickBookingStatus.textContent = "Please complete all fields before checking availability.";
      return;
    }

    const nights = calculateNights(checkIn, checkOut);
    if (nights <= 0) {
      selectors.quickBookingStatus.textContent = "Check-out must be after check-in.";
      return;
    }

    const room = roomRates[roomType];
    const payload = {
      checkIn,
      checkOut,
      guests,
      roomType,
      roomName: room.name,
      nightlyRate: room.rate,
      nights,
      estimatedTotal: room.rate * nights,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      contact: contact.value.trim(),
      email: email.value.trim(),
      specialRequest: specialRequest.value.trim(),
      source: "Capeway quick booking form",
      submittedAt: new Date().toISOString()
    };

    selectors.quickBookingStatus.textContent = "Sending your availability request...";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const inquiryId = generateInquiryId();
      const requestPayload = {
        ...payload,
        inquiryId,
        requestId: inquiryId
      };

      const response = await fetch(QUICK_BOOKING_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestPayload)
      });

      if (!response.ok) {
        throw new Error(`Quick booking webhook request failed with status ${response.status}.`);
      }

      const confirmedInquiryId = await getInquiryIdFromResponse(response) || inquiryId;
      if (selectors.quickBookingInquiryId) {
        selectors.quickBookingInquiryId.textContent = confirmedInquiryId;
      }
      selectors.quickBookingStatus.textContent = "";
      selectors.quickBookingForm.classList.add("is-flipped");
      clearTimeout(quickBookingFlipTimer);
      quickBookingFlipTimer = window.setTimeout(() => {
        selectors.quickBookingForm.reset();
        clearErrors(selectors.quickBookingForm);
        selectors.quickBookingStatus.textContent = "";
        setDateMinimums();
        selectors.quickBookingForm.classList.remove("is-flipped");
      }, 8000);
    } catch (error) {
      selectors.quickBookingStatus.textContent = "We couldn't send your availability request right now. Please try again in a moment.";
      console.error("Quick booking webhook error:", error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Check Availability";
      }
    }
  });
}

function setupContactForm() {
  selectors.contactForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(selectors.contactForm);

    const requiredFields = [
      { id: "contactName", message: "Please enter your name." },
      { id: "contactEmail", message: "Please enter your email address." },
      { id: "contactSubject", message: "Please add a subject." },
      { id: "contactMessage", message: "Please enter your inquiry." }
    ];

    let hasError = false;

    requiredFields.forEach((field) => {
      const input = document.getElementById(field.id);
      if (!input.value.trim()) {
        showError(input, field.message);
        hasError = true;
      }
    });

    const email = document.getElementById("contactEmail");
    if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      showError(email, "Enter a valid email address.");
      hasError = true;
    }

    const phone = document.getElementById("contactPhone");
    if (phone.value && !/^\d+$/.test(phone.value.trim())) {
      showError(phone, "Enter numbers only.");
      hasError = true;
    }

    if (hasError) {
      selectors.contactStatus.textContent = "Please complete the highlighted fields before sending.";
      return;
    }

    const submitButton = selectors.contactForm.querySelector('button[type="submit"]');
    const firstName = document.getElementById("contactName").value.trim();
    const payload = {
      name: firstName,
      firstName,
      email: email.value.trim(),
      phone: phone.value.trim(),
      subject: document.getElementById("contactSubject").value.trim(),
      message: document.getElementById("contactMessage").value.trim(),
      source: "Capeway contact form",
      submittedAt: new Date().toISOString()
    };

    selectors.contactStatus.textContent = "Sending your message...";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const response = await fetch(CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed with status ${response.status}.`);
      }

      selectors.contactStatus.textContent = "";
      setContactSuccessHeading(`Hey ${firstName},`);
      selectors.contactForm.classList.add("is-flipped");
      clearTimeout(contactFlipTimer);
      contactFlipTimer = window.setTimeout(() => {
        selectors.contactForm.reset();
        clearErrors(selectors.contactForm);
        selectors.contactStatus.textContent = "";
        setContactSuccessHeading("Hey there,");
        selectors.contactForm.classList.remove("is-flipped");
      }, 8000);
    } catch (error) {
      selectors.contactStatus.textContent = "We couldn't send your message right now. Please try again in a moment.";
      console.error("Contact form webhook error:", error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Send Message";
      }
    }
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

function setupGallery() {
  document.querySelectorAll(".gallery-item").forEach((button) => {
    button.addEventListener("click", () => {
      selectors.lightboxImage.src = button.getAttribute("data-full");
      selectors.lightboxImage.alt = button.getAttribute("data-alt");
      selectors.lightbox.classList.add("active");
      selectors.lightbox.setAttribute("aria-hidden", "false");
    });
  });

  selectors.lightboxClose?.addEventListener("click", closeLightbox);
  selectors.lightbox?.addEventListener("click", (event) => {
    if (event.target === selectors.lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLightbox();
  });
}

function closeLightbox() {
  if (!selectors.lightbox || !selectors.lightboxImage) return;

  selectors.lightbox.classList.remove("active");
  selectors.lightbox.setAttribute("aria-hidden", "true");
  selectors.lightboxImage.src = "";
  selectors.lightboxImage.alt = "";
}

function setupHeroVideo() {
  selectors.heroVideoOpen?.addEventListener("click", openHeroVideo);
  selectors.heroVideoClose?.addEventListener("click", closeHeroVideo);
  selectors.heroVideoModal?.addEventListener("click", (event) => {
    if (event.target === selectors.heroVideoModal) closeHeroVideo();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeHeroVideo();
  });
}

function openHeroVideo() {
  if (!selectors.heroVideoModal || !selectors.heroVideoFrame) return;

  selectors.heroVideoFrame.innerHTML = `<iframe src="${HERO_VIDEO_URL}" allow="autoplay; gyroscope; picture-in-picture;" allowfullscreen title="Capeway Inn video"></iframe>`;
  selectors.heroVideoModal.classList.add("active");
  selectors.heroVideoModal.setAttribute("aria-hidden", "false");
  selectors.heroVideoClose?.focus();
}

function closeHeroVideo() {
  if (!selectors.heroVideoModal || !selectors.heroVideoFrame) return;

  selectors.heroVideoModal.classList.remove("active");
  selectors.heroVideoModal.setAttribute("aria-hidden", "true");
  selectors.heroVideoFrame.innerHTML = "";
}

function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
}

function showError(input, message) {
  input.classList.add("input-error");
  const hint = input.parentElement.querySelector(".error-message");
  if (hint) hint.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll(".input-error").forEach((input) => input.classList.remove("input-error"));
  form.querySelectorAll(".error-message").forEach((message) => {
    message.textContent = "";
  });
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = parseDate(checkIn);
  const end = parseDate(checkOut);
  return Math.round((end - start) / 86400000);
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 10);
}

function formatDate(value) {
  return parseDate(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

init();
