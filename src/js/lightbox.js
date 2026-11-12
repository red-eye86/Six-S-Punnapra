// lightbox.js: image modal with prev/next, swipe, and keyboard (← → Esc).
// Thumbnails open the high-resolution version from data-full when present.

export function initLightbox() {
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const btnClose = modal?.querySelector('.modal-close');
  const btnPrev = modal?.querySelector('.modal-prev');
  const btnNext = modal?.querySelector('.modal-next');
  if (!modal || !modalImg || !btnClose) return;

  let images = [];
  let index = 0;
  let lastFocus = null;

  const show = (i) => {
    index = (i + images.length) % images.length;
    const img = images[index];
    modalImg.src = img.dataset.full || img.currentSrc || img.src;
    modalImg.alt = img.alt;
    const single = images.length < 2;
    btnPrev.hidden = single;
    btnNext.hidden = single;
  };

  const open = (group, i) => {
    images = group;
    lastFocus = document.activeElement;
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    show(i);
    btnClose.focus();
  };

  const close = () => {
    modal.style.display = 'none';
    modalImg.removeAttribute('src');
    lastFocus?.focus();
  };

  const isOpen = () => modal.style.display === 'flex';

  const makeClickable = (img, group, i) => {
    // Keyboard users can open images too
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => open(group, i));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(group, i);
      }
    });
  };

  // Group images by grid so the slideshow stays within the current tab
  document.querySelectorAll('.team-photo-grid').forEach((grid) => {
    const group = [...grid.querySelectorAll('.team-photo')];
    group.forEach((img, i) => makeClickable(img, group, i));
  });
  document.querySelectorAll('.standalone-photo').forEach((img) => makeClickable(img, [img], 0));

  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); show(index - 1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); show(index + 1); });
  btnClose.addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog
      const focusables = [btnClose, btnPrev, btnNext].filter((b) => !b.hidden);
      const pos = focusables.indexOf(document.activeElement);
      e.preventDefault();
      focusables[(pos + (e.shiftKey ? -1 : 1) + focusables.length) % focusables.length].focus();
    }
  });

  // Touch swipe
  let startX = 0;
  modal.addEventListener('touchstart', (e) => { startX = e.changedTouches[0].screenX; }, { passive: true });
  modal.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].screenX;
    if (endX < startX - 40) show(index + 1);
    if (endX > startX + 40) show(index - 1);
  }, { passive: true });
}

