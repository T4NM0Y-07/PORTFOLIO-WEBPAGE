const canvas = document.getElementById("cinema");
const ctx = canvas.getContext("2d");
const spotlight = document.querySelector(".spotlight");
const copyButton = document.getElementById("copyEmail");
const certificateModal = document.getElementById("certificateModal");
const certificateFrame = document.getElementById("certificateFrame");
const modalTitle = document.getElementById("modalTitle");

const portfolioData = {
  email: "tanmoy@example.com",
};

let width = 0;
let height = 0;
let particles = [];
let beams = [];
let nodes = [];
let pointer = { x: 0.5, y: 0.36 };

function resize() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(145, Math.max(70, Math.floor(width / 10)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: 0.35 + Math.random() * 1.4,
    r: 0.6 + Math.random() * 2.2,
    hue: Math.random() > 0.55 ? "255, 122, 47" : Math.random() > 0.5 ? "100, 217, 209" : "225, 92, 116",
  }));

  beams = Array.from({ length: 10 }, (_, index) => ({
    x: (index / 9) * width,
    drift: Math.random() * 400,
    alpha: 0.07 + Math.random() * 0.11,
  }));

  const nodeCount = Math.min(42, Math.max(22, Math.floor(width / 38)));
  nodes = Array.from({ length: nodeCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * 0.82,
    vx: (Math.random() - 0.5) * 0.22,
    vy: (Math.random() - 0.5) * 0.18,
    pulse: Math.random() * Math.PI * 2,
  }));
}

function draw(now) {
  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(255, 122, 47, 0.12)");
  gradient.addColorStop(0.45, "rgba(225, 92, 116, 0.055)");
  gradient.addColorStop(1, "rgba(100, 217, 209, 0.16)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  beams.forEach((beam, index) => {
    const x = beam.x + Math.sin(now * 0.00025 + beam.drift) * 80;
    ctx.save();
    ctx.translate(x, height * 0.08);
    ctx.rotate(-0.18 + index * 0.015);
    const beamGradient = ctx.createLinearGradient(0, 0, 0, height * 0.8);
    beamGradient.addColorStop(0, `rgba(255, 247, 230, ${beam.alpha})`);
    beamGradient.addColorStop(1, "rgba(255, 247, 230, 0)");
    ctx.fillStyle = beamGradient;
    ctx.fillRect(-8, 0, 16, height);
    ctx.restore();
  });

  const focusX = pointer.x * width;
  const focusY = pointer.y * height;

  nodes.forEach((node) => {
    node.x += node.vx + (pointer.x - 0.5) * 0.035;
    node.y += node.vy + (pointer.y - 0.5) * 0.025;

    if (node.x < -40) node.x = width + 40;
    if (node.x > width + 40) node.x = -40;
    if (node.y < -40) node.y = height * 0.84;
    if (node.y > height * 0.9) node.y = -20;
  });

  for (let a = 0; a < nodes.length; a += 1) {
    for (let b = a + 1; b < nodes.length; b += 1) {
      const first = nodes[a];
      const second = nodes[b];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);
      const limit = Math.min(190, width * 0.16);

      if (distance < limit) {
        const alpha = (1 - distance / limit) * 0.18;
        const lineGradient = ctx.createLinearGradient(first.x, first.y, second.x, second.y);
        lineGradient.addColorStop(0, `rgba(100, 217, 209, ${alpha})`);
        lineGradient.addColorStop(1, `rgba(226, 184, 92, ${alpha * 0.8})`);
        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }

  nodes.forEach((node) => {
    const pulse = 0.55 + Math.sin(now * 0.002 + node.pulse) * 0.45;
    const distance = Math.hypot(node.x - focusX, node.y - focusY);
    const glow = Math.max(0.2, 1 - distance / Math.max(width * 0.7, height));
    ctx.beginPath();
    ctx.fillStyle = `rgba(100, 217, 209, ${0.22 + glow * 0.35})`;
    ctx.arc(node.x, node.y, 1.6 + pulse * 2.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = `rgba(255, 247, 230, ${0.08 + glow * 0.12})`;
    ctx.arc(node.x, node.y, 8 + pulse * 10, 0, Math.PI * 2);
    ctx.stroke();
  });

  particles.forEach((particle) => {
    particle.y -= particle.z * 0.24;
    particle.x += Math.sin(now * 0.00042 + particle.y * 0.012) * particle.z * 0.38;

    if (particle.y < -20) {
      particle.y = height + 20;
      particle.x = Math.random() * width;
    }

    const distance = Math.hypot(particle.x - focusX, particle.y - focusY);
    const glow = Math.max(0.18, 1 - distance / Math.max(width, height));
    ctx.beginPath();
    ctx.fillStyle = `rgba(${particle.hue}, ${0.16 + glow * 0.32})`;
    ctx.arc(particle.x, particle.y, particle.r * particle.z, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.strokeStyle = "rgba(226, 184, 92, 0.26)";
  ctx.lineWidth = 1;
  const horizon = height * 0.72;
  for (let i = 0; i < 11; i += 1) {
    const y = horizon + i * i * 2.5;
    ctx.beginPath();
    ctx.moveTo(width * 0.02, y);
    ctx.lineTo(width * 0.98, y + Math.sin(now * 0.0008 + i) * 7);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(100, 217, 209, 0.14)";
  for (let i = -5; i < 8; i += 1) {
    const startX = width * 0.5 + i * width * 0.08;
    ctx.beginPath();
    ctx.moveTo(startX, horizon - 10);
    ctx.lineTo(width * 0.5 + i * width * 0.26, height + 70);
    ctx.stroke();
  }

  requestAnimationFrame(draw);
}

function updatePointer(event) {
  pointer = {
    x: event.clientX / window.innerWidth,
    y: event.clientY / window.innerHeight,
  };
  spotlight.style.setProperty("--mx", `${event.clientX}px`);
  spotlight.style.setProperty("--my", `${event.clientY}px`);
}

function animateCounters() {
  const counters = document.querySelectorAll("[data-count]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = Number(entry.target.dataset.count);
        const start = performance.now();
        const duration = 1100;

        function step(now) {
          const progress = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - progress, 3);
          entry.target.textContent = Math.round(target * eased);
          if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.35 },
  );

  counters.forEach((counter) => observer.observe(counter));
}

function initTiltCards() {
  const cards = document.querySelectorAll(".tilt-card");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!canHover) return;

  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 12;
      const rotateX = ((0.5 - y / rect.height)) * 12;

      card.style.setProperty("--tilt-x", `${x}px`);
      card.style.setProperty("--tilt-y", `${y}px`);
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
    });
  });
}

function openCertificate(title, src) {
  modalTitle.textContent = title;
  certificateFrame.src = src;
  certificateModal.classList.add("is-open");
  certificateModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeCertificate() {
  certificateModal.classList.remove("is-open");
  certificateModal.setAttribute("aria-hidden", "true");
  certificateFrame.src = "";
  document.body.style.overflow = "";
}

document.querySelectorAll("[data-cert-src]").forEach((button) => {
  button.addEventListener("click", () => {
    openCertificate(button.dataset.certTitle, button.dataset.certSrc);
  });
});

document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", closeCertificate);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && certificateModal.classList.contains("is-open")) {
    closeCertificate();
  }
});

copyButton.addEventListener("click", async () => {
  const email = portfolioData.email;
  try {
    await navigator.clipboard.writeText(email);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy Email";
    }, 1400);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

window.addEventListener("resize", resize);
window.addEventListener("pointermove", updatePointer);

resize();
animateCounters();
initTiltCards();
requestAnimationFrame(draw);
