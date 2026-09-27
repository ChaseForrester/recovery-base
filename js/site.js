const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  const original = button.textContent;
  button.addEventListener("click", async () => {
    const target = document.querySelector(button.getAttribute("data-copy"));
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.innerText.trim());
      button.textContent = "Copied";
    } catch {
      button.textContent = "Select the text below";
    }
    setTimeout(() => {
      button.textContent = original;
    }, 2200);
  });
});

document.querySelectorAll("form[data-local]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const lines = [];
    new FormData(form).forEach((value, key) => {
      const text = String(value).trim();
      if (text) lines.push(`${key}: ${text}`);
    });
    const subject = form.dataset.subject || "Recovery Base enquiry";
    window.location.href = `mailto:hello@recoverybase.com.au?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    const note = form.querySelector(".form-note");
    if (note) note.classList.add("show");
  });
});
