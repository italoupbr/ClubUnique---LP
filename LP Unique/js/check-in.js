(() => {
  "use strict";

  const editions = {
    "2026-08-22": {
      label: "Experience Edition · Agosto",
      date: "Sábado, 22 de agosto de 2026",
      place: "Reserva Laguna · Alphaville Nova Lima",
    },
    "2026-10-18": {
      label: "Experience Edition · Outubro",
      date: "Domingo, 18 de outubro de 2026",
      place: "Reserva Laguna · Alphaville Nova Lima",
    },
  };

  const DEFAULT_EDITION = "2026-10-18";

  const params = new URLSearchParams(window.location.search);
  const editionKey = params.get("edicao") || DEFAULT_EDITION;
  const edition = editions[editionKey] || editions[DEFAULT_EDITION];

  const editionLabel = document.getElementById("checkin-edition-label");
  const editionDate = document.getElementById("checkin-edition-date");
  const editionPlace = document.getElementById("checkin-edition-place");
  const editionInput = document.getElementById("edition");
  const checkinIntro = document.getElementById("checkin-intro");
  const checkinFlow = document.getElementById("checkin-flow");
  const checkinSuccess = document.getElementById("checkin-success");
  const checkinSuccessMeta = document.getElementById("checkin-success-meta");
  const form = document.getElementById("checkin-form");
  const feedback = document.getElementById("checkin-feedback");
  const submitBtn = document.getElementById("checkin-submit");
  const phoneInput = document.getElementById("phone");
  const emailInput = document.getElementById("email");
  const termsInput = document.getElementById("terms_accepted");
  const termsFieldset = document.getElementById("checkin-terms");

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (editionLabel) editionLabel.textContent = edition.label;
  if (editionDate) editionDate.textContent = edition.date;
  if (editionPlace) editionPlace.textContent = edition.place;
  if (editionInput) editionInput.value = editionKey in editions ? editionKey : DEFAULT_EDITION;

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      phoneInput.value = formatPhone(phoneInput.value);
    });
  }

  if (emailInput) {
    emailInput.addEventListener("input", () => {
      emailInput.value = sanitizeEmail(emailInput.value, false);
    });

    emailInput.addEventListener("blur", () => {
      emailInput.value = sanitizeEmail(emailInput.value, true);
    });
  }

  if (termsInput) {
    termsInput.addEventListener("change", syncSubmitState);
    syncSubmitState();
  }

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!window.ClubUniqueApi) {
      showFeedback("error", "Integração com Supabase indisponível. Verifique a configuração.");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      full_name: String(formData.get("full_name") || "").trim(),
      phone: formatPhone(String(formData.get("phone") || "")),
      email: sanitizeEmail(String(formData.get("email") || ""), true),
      company: String(formData.get("company") || "").trim(),
      edition: String(formData.get("edition") || editionKey),
      terms_accepted_at: new Date().toISOString(),
    };

    if (!payload.full_name || !payload.company) {
      showFeedback("error", "Preencha todos os campos para confirmar sua presença.");
      return;
    }

    if (!isValidPhone(payload.phone)) {
      showFeedback("error", "Informe um telefone válido com DDD.");
      phoneInput?.focus();
      return;
    }

    if (!EMAIL_PATTERN.test(payload.email)) {
      showFeedback("error", "Informe um e-mail válido.");
      emailInput?.focus();
      return;
    }

    if (!termsInput?.checked) {
      showFeedback("error", "Aceite o termo de autorização para confirmar sua presença.");
      termsFieldset?.classList.add("is-invalid");
      termsInput?.focus();
      return;
    }

    termsFieldset?.classList.remove("is-invalid");

    setLoading(true);
    showFeedback("", "");

    try {
      await window.ClubUniqueApi.insertPresence(payload);
      showSuccessState(payload);
    } catch (err) {
      showFeedback("error", err.message || "Não foi possível confirmar sua presença. Tente novamente.");
      setLoading(false);
    }
  });

  function showSuccessState(payload) {
    if (checkinIntro) checkinIntro.hidden = true;
    if (checkinFlow) checkinFlow.classList.add("is-complete");
    if (checkinSuccessMeta) {
      checkinSuccessMeta.textContent = `${payload.full_name} · ${edition.date}`;
    }

    if (!checkinSuccess) return;

    checkinSuccess.hidden = false;
    requestAnimationFrame(() => {
      checkinSuccess.classList.add("is-visible");
      checkinSuccess.classList.add("is-animated");
    });

    document.title = "Presença confirmada · Club Unique";
  }

  function setLoading(isLoading) {
    if (!submitBtn) return;
    submitBtn.classList.toggle("is-loading", isLoading);
    submitBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
    syncSubmitState(isLoading);
  }

  function syncSubmitState(forceDisabled) {
    if (!submitBtn || !termsInput) return;
    const blocked = forceDisabled === true || !termsInput.checked;
    submitBtn.disabled = blocked;
    submitBtn.setAttribute("aria-disabled", blocked ? "true" : "false");
    if (termsInput.checked) {
      termsFieldset?.classList.remove("is-invalid");
    }
  }

  function showFeedback(state, message) {
    if (!feedback) return;
    feedback.hidden = !message;
    feedback.dataset.state = state;
    feedback.textContent = message;
  }

  function formatPhone(value) {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function isValidPhone(value) {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
  }

  function sanitizeEmail(value, trimEdges) {
    let next = String(value || "").replace(/\s/g, "").toLowerCase();
    if (trimEdges) next = next.trim();
    return next;
  }
})();
