const canvas = document.getElementById("skyline");
const ctx = canvas.getContext("2d");
const links = [...document.querySelectorAll(".nav a")];
const sections = [...document.querySelectorAll("[data-view]")];
const certificateButtons = [...document.querySelectorAll("[data-certificate]")];
const certificateLightbox = document.getElementById("certificateLightbox");
const certificatePreview = document.getElementById("certificatePreview");
const lightboxClose = document.querySelector(".lightbox-close");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const particles = [];
let width = 0;
let height = 0;
let dpr = 1;
let frame = 0;

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  particles.length = 0;
  const count = Math.max(18, Math.min(44, Math.floor(width / 34)));
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.22 + Math.random() * 0.55,
      size: 1.5 + Math.random() * 2.8,
      drift: Math.random() * Math.PI * 2,
      color: i % 3 === 0 ? "rgba(255,140,25,0.52)" : i % 3 === 1 ? "rgba(8,125,0,0.42)" : "rgba(49,88,165,0.48)"
    });
  }
}

function drawDrone(x, y, size, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.globalAlpha = 0.72;
  ctx.beginPath();
  ctx.moveTo(-size, 0);
  ctx.lineTo(size, 0);
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();

  ctx.fillStyle = color;
  for (const [px, py] of [[-size, 0], [size, 0], [0, -size], [0, size]]) {
    ctx.beginPath();
    ctx.arc(px, py, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  frame += 0.006;

  const horizon = height * 0.66;
  const glass = ctx.createLinearGradient(0, 0, width, height);
  glass.addColorStop(0, "rgba(255,255,255,0.18)");
  glass.addColorStop(0.44, "rgba(49,88,165,0.05)");
  glass.addColorStop(1, "rgba(8,125,0,0.08)");
  ctx.fillStyle = glass;
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(49,88,165,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 9; i += 1) {
    const y = horizon + i * 34;
    ctx.beginPath();
    ctx.moveTo(width * 0.08, y);
    ctx.lineTo(width * 0.92, y + Math.sin(frame + i) * 9);
    ctx.stroke();
  }

  for (const p of particles) {
    p.x += Math.cos(p.drift + frame) * 0.22 + p.speed;
    p.y += Math.sin(p.drift + frame * 2) * 0.18;
    if (p.x > width + 40) p.x = -40;
    if (p.y > height + 30) p.y = -30;
    if (p.y < -30) p.y = height + 30;

    drawDrone(p.x, p.y, p.size * 3.2, p.color);
  }

  if (!prefersReducedMotion) {
    requestAnimationFrame(animate);
  }
}

function setActiveSection(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
      const id = entry.target.getAttribute("id");
      links.forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    }
  });
}

const observer = new IntersectionObserver(setActiveSection, {
  threshold: 0.05,
  rootMargin: "-10% 0px -10% 0px"
});

sections.forEach(section => observer.observe(section));

links.forEach(link => {
  link.addEventListener("click", event => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", link.getAttribute("href"));
  });
});

function closeCertificate() {
  certificateLightbox.classList.remove("open");
  certificateLightbox.setAttribute("aria-hidden", "true");
  certificatePreview.src = "";
  certificatePreview.alt = "";
}

certificateButtons.forEach(button => {
  button.addEventListener("click", () => {
    const image = button.querySelector("img");
    certificatePreview.src = button.dataset.certificate;
    certificatePreview.alt = image ? image.alt : "Certificate of Appreciation";
    certificateLightbox.classList.add("open");
    certificateLightbox.setAttribute("aria-hidden", "false");
  });
});

lightboxClose.addEventListener("click", closeCertificate);

certificateLightbox.addEventListener("click", event => {
  if (event.target === certificateLightbox) {
    closeCertificate();
  }
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && certificateLightbox.classList.contains("open")) {
    closeCertificate();
  }
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();
animate();

if (prefersReducedMotion) {
  animate();
}
