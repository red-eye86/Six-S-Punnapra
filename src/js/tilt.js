// tilt.js: Realistic 3D Tilt & Sheen on Glassmorphism Cards
// Driven by pointer-tracking with perspective and smooth recovery.
// Automatically disabled for touch screens and users with prefers-reduced-motion.

export function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  // Disable on mobile/touch pointers to preserve clean swipe & scrolling
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // Exclude navbar from 3D tilt so it stays pinned and centered
  const cards = document.querySelectorAll('.floating-card:not(.navbar), .sport-card, .official-card');

  cards.forEach((card) => {
    // Add sheen reflection layer if not present
    if (!card.querySelector('.card-sheen')) {
      const sheen = document.createElement('div');
      sheen.className = 'card-sheen';
      card.appendChild(sheen);
    }

    let bounds;

    const onMouseEnter = () => {
      bounds = card.getBoundingClientRect();
      card.style.transition = 'transform 120ms ease-out, box-shadow 120ms ease-out';
    };

    const onMouseMove = (e) => {
      if (!bounds) bounds = card.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const xPct = (mouseX / bounds.width - 0.5) * 2; // -1 to 1
      const yPct = (mouseY / bounds.height - 0.5) * 2; // -1 to 1

      const maxTilt = 7; // max degrees
      const tiltX = -yPct * maxTilt;
      const tiltY = xPct * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-6px)`;

      // Move sheen
      const sheen = card.querySelector('.card-sheen');
      if (sheen) {
        sheen.style.background = `radial-gradient(circle at ${(mouseX / bounds.width) * 100}% ${(mouseY / bounds.height) * 100}%, rgba(255, 255, 255, 0.16) 0%, transparent 65%)`;
      }
    };

    const onMouseLeave = () => {
      card.style.transition = 'transform 400ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 400ms ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      const sheen = card.querySelector('.card-sheen');
      if (sheen) {
        sheen.style.background = 'transparent';
      }
      bounds = null;
    };

    card.addEventListener('mouseenter', onMouseEnter);
    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
  });
}

