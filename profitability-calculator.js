const hiddenOperationalCost = 30000;
const calculatorTopbar = document.querySelector(".calculator-topbar");
const calculatorNav = document.querySelector(".calculator-nav");
const calculatorNavLinks = [...document.querySelectorAll(".calculator-nav a")];
const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");

function closeMobileMenu() {
  if (!calculatorTopbar || !mobileMenuToggle) return;
  calculatorTopbar.classList.remove("menu-open");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
}

function moveCalculatorNavGlass(link) {
  if (!calculatorNav || !link) return;
  const navRect = calculatorNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const padX = 4;
  const padY = 2;
  calculatorNav.style.setProperty("--glass-x", `${linkRect.left - navRect.left - padX}px`);
  calculatorNav.style.setProperty("--glass-y", `${linkRect.top - navRect.top - padY}px`);
  calculatorNav.style.setProperty("--glass-w", `${linkRect.width + padX * 2}px`);
  calculatorNav.style.setProperty("--glass-h", `${linkRect.height + padY * 2}px`);
  calculatorNav.style.setProperty("--glass-opacity", "1");
}

if (calculatorNav) {
  calculatorNavLinks.forEach(link => {
    link.addEventListener("pointerenter", () => moveCalculatorNavGlass(link));
    link.addEventListener("focus", () => moveCalculatorNavGlass(link));
  });
  calculatorNav.addEventListener("pointerleave", () => {
    calculatorNav.style.setProperty("--glass-opacity", "0");
  });
  calculatorNav.addEventListener("focusout", event => {
    if (!calculatorNav.contains(event.relatedTarget)) {
      calculatorNav.style.setProperty("--glass-opacity", "0");
    }
  });
}

if (mobileMenuToggle && calculatorTopbar) {
  mobileMenuToggle.addEventListener("click", () => {
    const isOpen = calculatorTopbar.classList.toggle("menu-open");
    mobileMenuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

calculatorNavLinks.forEach(link => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

document.addEventListener("click", event => {
  if (!calculatorTopbar || !calculatorTopbar.classList.contains("menu-open")) return;
  if (!calculatorTopbar.contains(event.target)) {
    closeMobileMenu();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMobileMenu();
  }
});

const fieldRules = {
  rent: {
    required: true,
    max: 1000000,
    excessiveMessage: "This rent is excessively high for operating an RPTO."
  },
  utilities: {
    required: true,
    max: 1000000,
    excessiveMessage: "This value exceeds the standard monthly limit for RPTO utility bills."
  },
  materials: {
    required: true,
    max: 1000000,
    excessiveMessage: "This value exceeds the standard monthly limit for RPTO training materials and student expenses."
  },
  instructorOne: {
    required: true,
    max: 1000000,
    advisoryRanges: [
      {
        min: 40000,
        max: 50000,
        message: "Typically aligned with experienced instructors holding 200+ instructional hours."
      },
      {
        min: 50001,
        max: 65000,
        message: "Typically applicable for instructors capable of independently handling ACM-level operational responsibilities."
      },
      {
        min: 65001,
        max: 1000000,
        message: "Typically applicable for instructors contributing to proposals, presentations, MOUs, and student enrolment initiatives."
      }
    ],
    excessiveMessage: "This salary exceeds the accepted input limit."
  },
  instructorTwo: {
    required: true,
    max: 1000000,
    advisoryRanges: [
      {
        min: 40000,
        max: 50000,
        message: "Typically aligned with experienced instructors holding 200+ instructional hours."
      },
      {
        min: 50001,
        max: 65000,
        message: "Typically applicable for instructors capable of independently handling ACM-level operational responsibilities."
      },
      {
        min: 65001,
        max: 1000000,
        message: "Typically applicable for instructors contributing to proposals, presentations, MOUs, and student enrolment initiatives."
      }
    ],
    excessiveMessage: "This salary exceeds the accepted input limit."
  },
  staff: {
    required: true,
    max: 1000000,
    advisoryThreshold: 150000,
    advisoryMessage: "Exceeds standard salary.",
    excessiveMessage: "This salary exceeds the accepted input limit."
  },
  misc: {
    required: false,
    max: 100000,
    excessiveMessage: "Miscellaneous expenses for running the RPTO are excessively high."
  },
  fee: {
    required: true,
    max: 1000000,
    excessiveMessage: "This training fee exceeds the accepted input limit."
  },
  candidates: {
    required: true,
    max: 70,
    advisoryThreshold: 31,
    advisoryMessage: "The number of candidates cannot exceed 31 with 2 RPIs per month.",
    excessiveMessage: "The number of candidates cannot exceed 70 per month."
  }
};

const form = document.getElementById("profitabilityForm");
const resultArea = document.getElementById("resultArea");
const resultCard = document.getElementById("resultCard");
const resultText = document.getElementById("resultText");
const includeHiddenOperationalCost = document.getElementById("includeHiddenOperationalCost");
const hiddenCostNote = document.getElementById("hiddenCostNote");
const hiddenCostIncludedMessage = "An additional ₹30,000 has been allocated to the monthly RPTO operational expenses to cover hidden operational costs, including maintenance agreements, insurance, drone equipment and spare parts, battery replacement upon completion of lifecycle usage, and other servicing and upkeep expenses.";
const hiddenCostExcludedMessage = "RPTO has chosen not to include additional operational costs in the monthly expenses, as these costs may already be managed internally by the organisation, such as in the case of an in-house drone manufacturing or maintenance setup.";
const fields = Object.keys(fieldRules).reduce((items, key) => {
  items[key] = document.getElementById(key);
  return items;
}, {});

function toDigits(value) {
  return value.replace(/\D/g, "");
}

function parseFieldValue(input) {
  const digits = toDigits(input.value);
  return digits === "" ? null : Number(digits);
}

function formatIndianNumber(value) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
}

function formatAmountInput(input) {
  const digits = toDigits(input.value);
  input.value = digits === "" ? "" : formatIndianNumber(Number(digits));
}

function getErrorElement(key) {
  return document.getElementById(`${key}Error`);
}

function getNoticeElement(key) {
  return document.getElementById(`${key}Notice`);
}

function setError(key, message, isBlocking = true) {
  const group = fields[key].closest(".field-group");
  const errorElement = getErrorElement(key);
  errorElement.textContent = message;
  errorElement.classList.toggle("advisory", Boolean(message) && !isBlocking);
  group.classList.toggle("has-error", Boolean(message) && isBlocking);
  group.classList.toggle("has-advisory", Boolean(message) && !isBlocking);
  fields[key].setAttribute("aria-invalid", message && isBlocking ? "true" : "false");
}

function setNotice(key, message) {
  const notice = getNoticeElement(key);
  if (notice) {
    notice.textContent = message;
  }
}

function validateField(key) {
  const input = fields[key];
  const rules = fieldRules[key];
  const value = parseFieldValue(input);

  if (!rules.required && value === null) {
    setError(key, "");
    return true;
  }

  if (rules.required && value === null) {
    setError(key, "This field is required.");
    return false;
  }

  if (value < 0) {
    setError(key, "Negative values are not allowed.");
    return false;
  }

  if (value > rules.max) {
    setError(key, rules.excessiveMessage);
    return false;
  }

  if (rules.advisoryRanges) {
    const advisory = rules.advisoryRanges.find(range => value >= range.min && value <= range.max);
    if (advisory) {
      setError(key, advisory.message, false);
      return true;
    }
  }

  if (rules.advisoryThreshold && value > rules.advisoryThreshold) {
    setError(key, rules.advisoryMessage, false);
    return true;
  }

  setError(key, "");
  return true;
}

function updateFeeNotice() {
  const value = parseFieldValue(fields.fee);
  let message = "";

  if (value !== null && value > 50000) {
    message = "Expected to provide 100% placement after training completion.";
  } else if (value !== null && value > 40000) {
    message = "RPTO is expected to provide standard training with additional drone-related skills.";
  } else if (value !== null && value >= 36000 && value <= 39999) {
    message = "Candidates are expected to gain more than just five days of training.";
  }

  setNotice("fee", message);
}

function updateCandidatesNotice() {
  const value = parseFieldValue(fields.candidates);
  const message = value === 30 || value === 31
    ? "For 30 candidates per month, the RPTO should have at least 2 instructors, 2 flying areas, 2 drones, and 8 batteries."
    : "";

  setNotice("candidates", message);
}

function updateHiddenCostNote() {
  if (!includeHiddenOperationalCost || !hiddenCostNote) return;
  const isIncluded = includeHiddenOperationalCost.checked;
  hiddenCostNote.textContent = isIncluded ? hiddenCostIncludedMessage : hiddenCostExcludedMessage;
  hiddenCostNote.classList.toggle("included", isIncluded);
  hiddenCostNote.classList.toggle("excluded", !isIncluded);
}

function validateForm() {
  return Object.keys(fieldRules).map(validateField).every(Boolean);
}

function getValue(key) {
  return parseFieldValue(fields[key]) || 0;
}

function getHiddenOperationalCostAmount() {
  return includeHiddenOperationalCost?.checked ? hiddenOperationalCost : 0;
}

function calculateProfitability() {
  const expense =
    getValue("rent") +
    getValue("utilities") +
    getValue("materials") +
    getValue("instructorOne") +
    getValue("instructorTwo") +
    getValue("staff") +
    getValue("misc") +
    getHiddenOperationalCostAmount();

  const revenue = getValue("fee") * getValue("candidates");
  return revenue - expense;
}

function renderProfitabilityResult(animateSparkle = false) {
  const monthlyDifference = calculateProfitability();
  const formattedAmount = formatIndianNumber(Math.abs(monthlyDifference));

  resultCard.classList.remove("profit", "loss", "sparkle");
  if (monthlyDifference >= 0) {
    resultCard.classList.add("profit");
    resultText.textContent = `RPTO is ₹${formattedAmount} monthly profitable, provided the entered values are accurate.`;
    if (animateSparkle) {
      window.setTimeout(() => {
        resultCard.classList.add("sparkle");
      }, 20);
      window.setTimeout(() => {
        resultCard.classList.remove("sparkle");
      }, 4100);
    }
  } else {
    resultCard.classList.add("loss");
    resultText.textContent = `The RPTO is operating at a monthly loss of ₹${formattedAmount}, provided the entered values are accurate.`;
  }
}

Object.entries(fields).forEach(([key, input]) => {
  input.addEventListener("input", () => {
    if (key === "candidates") {
      input.value = toDigits(input.value);
    } else {
      formatAmountInput(input);
    }
    validateField(key);

    if (key === "fee") {
      updateFeeNotice();
    }

    if (key === "candidates") {
      updateCandidatesNotice();
    }
  });

  input.addEventListener("paste", event => {
    event.preventDefault();
    const text = (event.clipboardData || window.clipboardData).getData("text");
    input.value = toDigits(text);
    if (key !== "candidates") {
      formatAmountInput(input);
    }
    validateField(key);

    if (key === "fee") updateFeeNotice();
    if (key === "candidates") updateCandidatesNotice();
  });
});

includeHiddenOperationalCost?.addEventListener("change", () => {
  updateHiddenCostNote();
  if (!resultArea.hidden && validateForm()) {
    renderProfitabilityResult();
  }
});

updateHiddenCostNote();

form.addEventListener("submit", event => {
  event.preventDefault();
  updateFeeNotice();
  updateCandidatesNotice();
  updateHiddenCostNote();

  if (!validateForm()) {
    resultArea.hidden = true;
    const firstInvalid = form.querySelector("[aria-invalid='true']");
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return;
  }

  renderProfitabilityResult(true);

  resultArea.hidden = false;
  resultArea.scrollIntoView({ behavior: "smooth", block: "center" });
});
