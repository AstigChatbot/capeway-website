const roomRates = {
  standard: { name: "Standard Room", rate: 119 },
  deluxe: { name: "Deluxe Room", rate: 139 },
  family: { name: "Family Suite", rate: 159 },
  extended: { name: "Extended Stay Suite", rate: 169 }
};

const CONTACT_WEBHOOK_URL = "https://n8n.srv1291312.hstgr.cloud/webhook/fe3be99e-0d2a-4405-895b-75d6475603a5";
const QUICK_BOOKING_WEBHOOK_URL = "https://n8n.srv1291312.hstgr.cloud/webhook/eabceb79-b9d8-4ace-8b22-588fd2cdffa4";
let quickBookingFlipTimer;
let contactFlipTimer;

const selectors = {
  header: document.getElementById("siteHeader"),
  menuToggle: document.getElementById("menuToggle"),
  primaryMenu: document.getElementById("primaryMenu"),
  quickBookingForm: document.getElementById("quickBookingForm"),
  quickBookingStatus: document.getElementById("quickBookingStatus"),
  contactForm: document.getElementById("contactForm"),
  contactStatus: document.getElementById("contactStatus"),
  contactSuccessHeading: document.getElementById("contactSuccessHeading"),
  lightbox: document.getElementById("lightbox"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxClose: document.getElementById("lightboxClose")
};

function init() {
  document.getElementById("year").textContent = new Date().getFullYear();
  setDateMinimums();
  setupNavigation();
  handleHeaderScroll();
  setupQuickBooking();
  setupContactForm();
  setupGallery();
  setupRevealObserver();
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

function handleHeaderScroll() {
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
      const webhookUrl = new URL(QUICK_BOOKING_WEBHOOK_URL);
      Object.entries(payload).forEach(([key, value]) => {
        webhookUrl.searchParams.set(key, String(value));
      });
      webhookUrl.searchParams.set("requestId", crypto.randomUUID());

      const response = await fetch(webhookUrl.toString(), {
        method: "GET",
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error(`Quick booking webhook request failed with status ${response.status}.`);
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
      { id: "contactName", message: "Please enter your first name." },
      { id: "contactLastName", message: "Please enter your last name." },
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
    const lastName = document.getElementById("contactLastName").value.trim();
    const payload = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
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
      selectors.contactSuccessHeading.textContent = `Hey ${firstName}, Appreciate you reaching out!`;
      selectors.contactForm.classList.add("is-flipped");
      clearTimeout(contactFlipTimer);
      contactFlipTimer = window.setTimeout(() => {
        selectors.contactForm.reset();
        clearErrors(selectors.contactForm);
        selectors.contactStatus.textContent = "";
        selectors.contactSuccessHeading.textContent = "Hey there, Appreciate you reaching out!";
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
  selectors.lightbox.classList.remove("active");
  selectors.lightbox.setAttribute("aria-hidden", "true");
  selectors.lightboxImage.src = "";
  selectors.lightboxImage.alt = "";
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
