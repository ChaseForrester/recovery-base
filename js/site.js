const motionOK = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (motionOK) {
  document.documentElement.classList.add("js");
  const revealSelector = [
    ".page-hero .wrap > *",
    ".section .split > *",
    ".section .center",
    ".dark .center",
    ".tool",
    ".option",
    ".review",
    ".step",
    ".value",
    ".post-card",
    ".band .wrap > *",
    ".faq details",
    ".form",
    ".facts",
    ".map",
    ".copy-block",
    ".info-list",
    ".login-card",
    ".article-hero",
    ".article > .meta",
    ".article > h1",
    ".site-footer .footer-grid > *",
  ].join(",");

  const revealNodes = [...document.querySelectorAll(revealSelector)];
  const groups = new Map();
  revealNodes.forEach((el) => {
    el.classList.add("reveal");
    const reversed = el.parentElement && el.parentElement.classList.contains("reverse");
    if (el.matches(".split > img, .article-hero")) el.classList.add(reversed ? "from-left" : "from-right");
    if (el.matches(".split > div")) el.classList.add(reversed ? "from-right" : "from-left");
    const siblings = groups.get(el.parentElement) || [];
    siblings.push(el);
    groups.set(el.parentElement, siblings);
  });
  groups.forEach((siblings) => {
    siblings.forEach((el, index) => {
      el.style.transitionDelay = `${Math.min(index, 7) * 80}ms`;
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
  );
  revealNodes.forEach((el) => observer.observe(el));
}

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
