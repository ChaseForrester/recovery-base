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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => { });
  });
}

const installed = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
const installHidden = localStorage.getItem("rb-install-hidden") === "1";
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

if (!installed && !installHidden) {
  let deferredPrompt = null;
  const pop = document.createElement("div");
  pop.className = "install-pop";
  pop.hidden = true;
  pop.innerHTML = `
    <div class="install-card" role="dialog" aria-labelledby="install-title">
      <img src="/icons/icon-192.png" alt="">
      <h2 id="install-title">Add Recovery Base</h2>
      <p class="install-lead">Keep the studio on your home screen and open it like an app.</p>
      <ol class="install-steps" hidden>
        <li>Tap the Share button in Safari.</li>
        <li>Choose Add to Home Screen.</li>
        <li>Tap Add.</li>
      </ol>
      <div class="install-actions">
        <button class="btn install-go" type="button">Install app</button>
        <button class="btn btn-ghost install-later" type="button">Not now</button>
      </div>
    </div>
  `;
  document.body.appendChild(pop);

  const steps = pop.querySelector(".install-steps");
  const lead = pop.querySelector(".install-lead");
  const go = pop.querySelector(".install-go");

  const show = () => {
    pop.hidden = false;
  };
  const hide = () => {
    localStorage.setItem("rb-install-hidden", "1");
    pop.remove();
  };

  pop.querySelector(".install-later").addEventListener("click", hide);
  pop.addEventListener("click", (event) => {
    if (event.target === pop) hide();
  });

  go.addEventListener("click", async () => {
    if (!deferredPrompt) {
      lead.hidden = false;
      lead.textContent = "Use the install icon in the address bar, or the browser menu, then choose Install app.";
      return;
    }
    deferredPrompt.prompt();
    await deferredPrompt.userChoice.catch(() => { });
    deferredPrompt = null;
    hide();
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    go.hidden = false;
    show();
  });

  if (ios) {
    lead.hidden = true;
    steps.hidden = false;
    go.hidden = true;
  }

  setTimeout(show, 700);
}
