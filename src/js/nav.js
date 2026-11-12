// nav.js: hamburger menu + "Overview" dropdown, with ARIA state and keyboard support.

export function initNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const dropdowns = [...document.querySelectorAll('.dropdown')];

  const setDropdown = (dropdown, open) => {
    dropdown.classList.toggle('active-dropdown', open);
    dropdown.querySelector('.dropbtn')?.setAttribute('aria-expanded', String(open));
  };

  const setMenu = (open) => {
    if (!hamburger || !navLinks) return;
    navLinks.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
  };

  dropdowns.forEach((dropdown) => {
    const btn = dropdown.querySelector('.dropbtn');
    btn?.addEventListener('click', (e) => {
      e.preventDefault();
      setDropdown(dropdown, !dropdown.classList.contains('active-dropdown'));
    });
    // Close when keyboard focus leaves the dropdown
    dropdown.addEventListener('focusout', (e) => {
      if (!dropdown.contains(e.relatedTarget)) setDropdown(dropdown, false);
    });
  });

  // Close dropdowns when clicking outside
  window.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) dropdowns.forEach((d) => setDropdown(d, false));
  });

  hamburger?.addEventListener('click', () => setMenu(!navLinks.classList.contains('active')));

  // Close the mobile menu when a link is chosen
  navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

  // Escape closes the open dropdown first, then the mobile menu, and returns focus to its trigger
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = dropdowns.find((d) => d.classList.contains('active-dropdown'));
    if (open) {
      setDropdown(open, false);
      open.querySelector('.dropbtn')?.focus();
    } else if (navLinks?.classList.contains('active')) {
      setMenu(false);
      hamburger.focus();
    }
  });
}

