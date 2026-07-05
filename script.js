// =========================================================
// Footer year
// =========================================================
document.getElementById("year").textContent = new Date().getFullYear();

// =========================================================
// Mobile nav toggle
// =========================================================
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

// =========================================================
// Scroll-spy: highlight active nav link
// =========================================================
const sections = document.querySelectorAll("main .section[id]");
const navAnchors = document.querySelectorAll(".nav-link");

const spyObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navAnchors.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
        });
      }
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);
sections.forEach((s) => spyObserver.observe(s));

// =========================================================
// Hero terminal — simulated typing sequence
// =========================================================
const terminalBody = document.getElementById("terminalBody");

const sequence = [
  { cmd: "whoami", out: "zainab_qureshi" },
  { cmd: "cat role.txt", out: "SOC & Incident Response | Malware Analysis" },
  { cmd: "ls certifications/", out: "isc2_cc.crt  soc_fundamentals.crt  grc_fundamentals.crt" },
  { cmd: "ls projects/", out: "androx/  wireguard-vpn/  vulnbot/  devops-cloud/" },
  { cmd: "echo $STATUS", out: "open_to_work = true" },
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderStatic() {
  terminalBody.innerHTML = sequence
    .map(
      (s) =>
        `<p class="line"><span class="prompt-sym">$</span>${s.cmd}</p><p class="line out">${s.out}</p>`
    )
    .join("");
}

async function typeLine(el, text, speed = 28) {
  for (let i = 0; i <= text.length; i++) {
    el.textContent = text.slice(0, i);
    await new Promise((r) => setTimeout(r, speed));
  }
}

async function runSequence() {
  terminalBody.innerHTML = "";
  for (const step of sequence) {
    const cmdLine = document.createElement("p");
    cmdLine.className = "line";
    const promptSym = document.createElement("span");
    promptSym.className = "prompt-sym";
    promptSym.textContent = "$";
    const cmdText = document.createElement("span");
    cmdLine.appendChild(promptSym);
    cmdLine.appendChild(cmdText);
    terminalBody.appendChild(cmdLine);
    await typeLine(cmdText, step.cmd);

    const outLine = document.createElement("p");
    outLine.className = "line out";
    outLine.textContent = step.out;
    terminalBody.appendChild(outLine);
    await new Promise((r) => setTimeout(r, 260));
  }
  const caretLine = document.createElement("p");
  caretLine.className = "line";
  caretLine.innerHTML = `<span class="prompt-sym">$</span><span class="caret"></span>`;
  terminalBody.appendChild(caretLine);
}

if (prefersReducedMotion) {
  renderStatic();
} else {
  runSequence();
}

// =========================================================
// Project detail modals
// =========================================================
const modalOverlay = document.getElementById("modalOverlay");
const detailButtons = document.querySelectorAll(".btn-details");

function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;

  // Pull the repo placeholder/link from the parent project card and
  // apply it to this modal's "View Repository" button.
  const card = document.querySelector(`[data-target="${id}"]`)?.closest(".proj-card");
  const repoLink = modal.querySelector(".repo-link");
  if (card && repoLink) {
    const repo = card.getAttribute("data-repo");
    if (repo && repo !== "#" && !repo.startsWith("ADD_")) {
      repoLink.href = repo;
      repoLink.textContent = "View Repository →";
    } else {
      repoLink.removeAttribute("href");
      repoLink.setAttribute("aria-disabled", "true");
      repoLink.textContent = "Repository link coming soon";
      repoLink.style.opacity = "0.55";
      repoLink.style.pointerEvents = "none";
    }
  }

  document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
  modal.classList.add("open");
  modalOverlay.classList.add("open");
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.querySelectorAll(".modal.open").forEach((m) => m.classList.remove("open"));
}

detailButtons.forEach((btn) => {
  btn.addEventListener("click", () => openModal(btn.getAttribute("data-target")));
});

modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.querySelectorAll("[data-close]").forEach((btn) => {
  btn.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// =========================================================
// Contact form — submit via fetch so the visitor stays on
// the portfolio instead of being redirected to Formspree.
// =========================================================
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const contactSubmit = document.getElementById("contactSubmit");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const action = contactForm.getAttribute("action") || "";
    if (!action || action.includes("ADD_YOUR_FORMSPREE_ID_HERE")) {
      formStatus.textContent = "Contact form isn't set up yet — add your Formspree ID in index.html (see README).";
      formStatus.classList.add("is-error");
      return;
    }

    contactSubmit.disabled = true;
    contactSubmit.textContent = "Sending…";
    formStatus.classList.remove("is-error", "is-success");
    formStatus.textContent = "";

    try {
      const response = await fetch(action, {
        method: "POST",
        body: new FormData(contactForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        contactForm.reset();
        formStatus.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
        formStatus.classList.add("is-success");
      } else {
        formStatus.textContent = "Something went wrong sending that. Please try again or email me directly.";
        formStatus.classList.add("is-error");
      }
    } catch (err) {
      formStatus.textContent = "Something went wrong sending that. Please try again or email me directly.";
      formStatus.classList.add("is-error");
    } finally {
      contactSubmit.disabled = false;
      contactSubmit.textContent = "Send Message";
    }
  });
}
