const SITE_SETTINGS_KEY = "capewaySiteSettings";
const PASSWORD_RESETS_KEY = "capewayPasswordResetRequests";

const defaultSiteSettings = {
  businessName: "Capeway Inn & Suites",
  logoUrl: "assets/images/capeway-logo-inn-suites.webp",
  address: "11 Main Street, Route 100, St. Bride's, NL A0B 2Z0",
  phone: "(709) 337-2163",
  tollFree: "1-866-337-2163",
  email: "jk.cruz@inboxeen.com"
};

const businessForm = document.getElementById("businessSettingsForm");
const passwordResetForm = document.getElementById("passwordResetForm");
const settingsStatus = document.getElementById("settingsStatus");
const resetStatus = document.getElementById("resetStatus");
const resetSettingsButton = document.getElementById("resetSettings");

function readSiteSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(SITE_SETTINGS_KEY) || "null");
    return { ...defaultSiteSettings, ...(stored || {}) };
  } catch (error) {
    return { ...defaultSiteSettings };
  }
}

function writeSiteSettings(settings) {
  localStorage.setItem(SITE_SETTINGS_KEY, JSON.stringify(settings));
}

function readPasswordResetRequests() {
  try {
    return JSON.parse(localStorage.getItem(PASSWORD_RESETS_KEY) || "[]");
  } catch (error) {
    return [];
  }
}

function getBusinessFormValues() {
  return {
    businessName: businessForm.businessName.value.trim(),
    logoUrl: businessForm.logoUrl.value.trim(),
    address: businessForm.address.value.trim(),
    phone: businessForm.phone.value.trim(),
    tollFree: businessForm.tollFree.value.trim(),
    email: businessForm.email.value.trim()
  };
}

function fillBusinessForm(settings) {
  businessForm.businessName.value = settings.businessName;
  businessForm.logoUrl.value = settings.logoUrl;
  businessForm.address.value = settings.address;
  businessForm.phone.value = settings.phone;
  businessForm.tollFree.value = settings.tollFree;
  businessForm.email.value = settings.email;
  updatePreview(settings);
}

function updatePreview(settings) {
  document.querySelectorAll('[data-admin-preview="businessName"]').forEach((element) => {
    element.textContent = settings.businessName;
  });

  document.querySelectorAll('[data-admin-preview="address"]').forEach((element) => {
    element.textContent = settings.address;
  });

  document.querySelectorAll('[data-admin-preview="phone"]').forEach((element) => {
    element.textContent = settings.tollFree ? `${settings.phone} / ${settings.tollFree}` : settings.phone;
  });

  document.querySelectorAll('[data-admin-preview="email"]').forEach((element) => {
    element.textContent = settings.email;
  });

  document.querySelectorAll('[data-admin-preview="logo"]').forEach((image) => {
    image.src = settings.logoUrl;
    image.alt = `${settings.businessName} logo`;
  });
}

function showStatus(element, message) {
  element.textContent = message;
  window.setTimeout(() => {
    if (element.textContent === message) element.textContent = "";
  }, 4000);
}

businessForm.addEventListener("input", () => {
  updatePreview({ ...readSiteSettings(), ...getBusinessFormValues() });
});

businessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const settings = getBusinessFormValues();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
    showStatus(settingsStatus, "Enter a valid email address.");
    return;
  }

  writeSiteSettings(settings);
  updatePreview(settings);
  showStatus(settingsStatus, "Business details saved.");
});

resetSettingsButton.addEventListener("click", () => {
  localStorage.removeItem(SITE_SETTINGS_KEY);
  fillBusinessForm(defaultSiteSettings);
  showStatus(settingsStatus, "Business details reset to defaults.");
});

passwordResetForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = passwordResetForm.resetEmail.value.trim();
  const note = passwordResetForm.resetNote.value.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showStatus(resetStatus, "Enter a valid account email.");
    return;
  }

  const requests = readPasswordResetRequests();
  requests.unshift({
    email,
    note,
    requestedAt: new Date().toISOString(),
    status: "pending"
  });

  localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(requests.slice(0, 20)));
  passwordResetForm.reset();
  showStatus(resetStatus, "Password reset request saved locally.");
});

fillBusinessForm(readSiteSettings());
