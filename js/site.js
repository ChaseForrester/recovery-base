const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
}

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
