// Регулярні вирази для строгого формату номера телефону та електронної пошти.
const REGEX_PHONE = /^\+380\d{9}$/;
const REGEX_EMAIL = /^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

const form = document.getElementById("feedbackForm");
const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const messageInput = document.getElementById("message");
const agreementInput = document.getElementById("agreement");

const usernameError = document.getElementById("usernameError");
const emailError = document.getElementById("emailError");
const phoneError = document.getElementById("phoneError");
const messageError = document.getElementById("messageError");
const agreementError = document.getElementById("agreementError");
const successModal = document.getElementById("successModal");
const closeSuccessModalButton = document.getElementById("closeSuccessModal");

let lastFocusedElement = null;
let previouslyInertElements = [];

function closeSuccessModal() {
  if (!(successModal instanceof HTMLElement) || successModal.classList.contains("hidden")) {
    return;
  }

  successModal.classList.add("hidden");
  successModal.classList.remove("flex");
  document.body.style.removeProperty("overflow");
  previouslyInertElements.forEach(({ element, wasInert }) => {
    element.inert = wasInert;
  });
  previouslyInertElements = [];

  if (lastFocusedElement instanceof HTMLElement && lastFocusedElement.isConnected) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function openSuccessModal() {
  if (!(successModal instanceof HTMLElement) || !(closeSuccessModalButton instanceof HTMLButtonElement)) {
    return;
  }

  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previouslyInertElements = Array.from(document.body.children)
    .filter((element) => element !== successModal && element instanceof HTMLElement)
    .map((element) => ({ element, wasInert: element.inert }));
  previouslyInertElements.forEach(({ element }) => {
    element.inert = true;
  });

  document.body.style.overflow = "hidden";
  successModal.classList.remove("hidden");
  successModal.classList.add("flex");
  closeSuccessModalButton.focus();
}

if (closeSuccessModalButton instanceof HTMLButtonElement) {
  closeSuccessModalButton.addEventListener("click", closeSuccessModal);
}

if (successModal instanceof HTMLElement) {
  successModal.addEventListener("click", (event) => {
    if (event.target === successModal) {
      closeSuccessModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (!(successModal instanceof HTMLElement) || successModal.classList.contains("hidden")) {
    return;
  }

  if (event.key === "Escape") {
    closeSuccessModal();
  } else if (event.key === "Tab") {
    const focusableElements = Array.from(successModal.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element instanceof HTMLElement && !element.hidden);
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    if (!firstFocusableElement || !lastFocusableElement) {
      event.preventDefault();
      closeSuccessModalButton.focus();
    } else if (
      event.shiftKey &&
      (document.activeElement === firstFocusableElement || !successModal.contains(document.activeElement))
    ) {
      event.preventDefault();
      lastFocusableElement.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === lastFocusableElement || !successModal.contains(document.activeElement))
    ) {
      event.preventDefault();
      firstFocusableElement.focus();
    }
  }
});

// Показує помилку та підсвічує відповідне поле червоною рамкою.
function showError(input, errorElement, message) {
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
  input.setAttribute("aria-invalid", "true");
  input.classList.remove("border-green-500", "border-[#22252A]/20");
  input.classList.add("border-red-500");
}

// Приховує повідомлення про помилку та підсвічує валідне поле зеленим.
function showSuccess(input, errorElement) {
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
  input.setAttribute("aria-invalid", "false");
  input.classList.remove("border-red-500", "border-[#22252A]/20");
  input.classList.add("border-green-500");
}

function clearError(input, errorElement) {
  errorElement.textContent = "";
  errorElement.classList.add("hidden");
  input.setAttribute("aria-invalid", "false");
  input.classList.remove("border-green-500", "border-red-500");

  if (input !== agreementInput) {
    input.classList.add("border-[#22252A]/20");
  }
}

function validateName() {
  if (usernameInput.value.trim().length < 2) {
    showError(usernameInput, usernameError, "Ім'я має містити щонайменше 2 символи.");
    return false;
  }

  showSuccess(usernameInput, usernameError);
  return true;
}

function validateEmail() {
  if (!REGEX_EMAIL.test(emailInput.value)) {
    showError(emailInput, emailError, "Вкажіть коректну електронну пошту.");
    return false;
  }

  showSuccess(emailInput, emailError);
  return true;
}

function validatePhone() {
  const normalizedPhone = normalizePhoneValue(phoneInput.value);

  if (!REGEX_PHONE.test(normalizedPhone)) {
    if (normalizedPhone.startsWith("+380")) {
      const digitsAfterPrefix = normalizedPhone.slice(4);
      const message = /\D/.test(digitsAfterPrefix)
        ? "Після +380 допускаються лише цифри."
        : "Після +380 має бути рівно 9 цифр.";
      showError(phoneInput, phoneError, message);
      return false;
    }

    showError(phoneInput, phoneError, "Вкажіть номер у форматі +380XXXXXXXXX.");
    return false;
  }

  showSuccess(phoneInput, phoneError);
  return true;
}

function normalizePhoneValue(value) {
  const cleanedPhone = value.replace(/[\s()-]/g, "");

  if (/^0\d{9}$/.test(cleanedPhone)) {
    return `+38${cleanedPhone}`;
  }

  return cleanedPhone;
}

function normalizePhoneInput() {
  phoneInput.value = normalizePhoneValue(phoneInput.value);
}

function validateMessage() {
  if (messageInput.value.trim().length < 10) {
    showError(messageInput, messageError, "Повідомлення має містити щонайменше 10 символів.");
    return false;
  }

  showSuccess(messageInput, messageError);
  return true;
}

function validateAgreement() {
  if (!agreementInput.checked) {
    showError(agreementInput, agreementError, "Необхідно погодитися з політикою конфіденційності.");
    return false;
  }

  showSuccess(agreementInput, agreementError);
  return true;
}

function bindFieldValidation(input, validate, normalize) {
  input.addEventListener("blur", () => {
    input.dataset.touched = "true";
    if (normalize) {
      normalize();
    }
    validate();
  });

  input.addEventListener("input", () => {
    if (input.dataset.touched === "true" || input.classList.contains("border-green-500")) {
      validate();
    }
  });
}

function resetFieldValidationState() {
  const fields = [usernameInput, emailInput, phoneInput, messageInput, agreementInput];
  const errors = [usernameError, emailError, phoneError, messageError, agreementError];

  fields.forEach((input, index) => {
    delete input.dataset.touched;
    clearError(input, errors[index]);
  });
}

bindFieldValidation(usernameInput, validateName);
bindFieldValidation(emailInput, validateEmail);
bindFieldValidation(phoneInput, validatePhone, normalizePhoneInput);
bindFieldValidation(messageInput, validateMessage);

agreementInput.addEventListener("change", () => {
  agreementInput.dataset.touched = "true";
  validateAgreement();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  normalizePhoneInput();

  const fields = [usernameInput, emailInput, phoneInput, messageInput, agreementInput];
  fields.forEach((input) => {
    input.dataset.touched = "true";
  });

  // Виконуємо всі перевірки, щоб показати кожну помилку одночасно.
  const validationResults = [
    validateName(),
    validateEmail(),
    validatePhone(),
    validateMessage(),
    validateAgreement(),
  ];

  if (validationResults.includes(false)) {
    const firstInvalidInput = fields.find((input, index) => !validationResults[index]);

    if (firstInvalidInput) {
      firstInvalidInput.focus();
    }
  } else {
    form.reset();
    resetFieldValidationState();
    openSuccessModal();
  }
});