/* main.js */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 40,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": ["#00d2ff", "#ff5722"]
                },
                "shape": {
                    "type": "circle"
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 2,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.1,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1,
                    "direction": "top",
                    "random": true,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.5
                        }
                    },
                    "push": {
                        "particles_nb": 4
                    }
                }
            },
            "retina_detect": true
        });
    }

    // Translation logic
    const langSwitch = document.getElementById('langSwitch');
    
    const translateTo = (lang) => {
        if (lang === 'ml') {
            document.body.classList.add('lang-ml');
            document.body.classList.remove('lang-en');
        } else {
            document.body.classList.add('lang-en');
            document.body.classList.remove('lang-ml');
        }

        document.querySelectorAll('[data-en]').forEach(el => {
            if (lang === 'ml') {
                el.innerText = el.getAttribute('data-ml');
            } else {
                el.innerText = el.getAttribute('data-en');
            }
        });

        document.querySelectorAll('input[data-placeholder-ml]').forEach(el => {
            if (lang === 'ml') {
                if (!el.getAttribute('data-placeholder-en')) {
                    el.setAttribute('data-placeholder-en', el.getAttribute('placeholder'));
                }
                el.setAttribute('placeholder', el.getAttribute('data-placeholder-ml'));
            } else {
                if (el.getAttribute('data-placeholder-en')) {
                    el.setAttribute('placeholder', el.getAttribute('data-placeholder-en'));
                }
            }
        });
    };

    langSwitch.addEventListener('change', (e) => {
        if (e.target.checked) {
            translateTo('ml'); // Malayalam
        } else {
            translateTo('en'); // English
        }
    });

    // Parallax scrolling for floating items
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        document.querySelectorAll('.float-item').forEach((item, index) => {
            // Apply slight vertical movement on scroll to enhance anti-gravity feel
            const speed = (index + 1) * 0.15;
            item.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Dropdown toggle for mobile/touch
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const btn = dropdown.querySelector('.dropbtn');
        if(btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                dropdown.classList.toggle('active-dropdown');
            });
        }
    });

    // Close dropdown when clicking outside
    window.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active-dropdown');
            });
        }
    });

    // Hamburger Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when a link is clicked
        navLinks.querySelectorAll('a:not(.dropbtn)').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active to current
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // Image Modal Logic (Slideshow & Swipe)
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImage");
    const modalClose = document.getElementsByClassName("modal-close")[0];
    const modalPrev = document.querySelector(".modal-prev");
    const modalNext = document.querySelector(".modal-next");
    
    if(modal && modalImg && modalClose) {
        let currentImageIndex = 0;
        let galleryImages = [];

        const showImage = (index) => {
            if (index >= galleryImages.length) { currentImageIndex = 0; }
            else if (index < 0) { currentImageIndex = galleryImages.length - 1; }
            else { currentImageIndex = index; }
            
            modalImg.src = galleryImages[currentImageIndex].src;
        };

        // Group images by their container grid so slideshow stays within the current tab
        document.querySelectorAll('.team-photo-grid').forEach(grid => {
            const images = Array.from(grid.querySelectorAll('.team-photo'));
            images.forEach((img, index) => {
                img.addEventListener('click', function() {
                    galleryImages = images;
                    currentImageIndex = index;
                    modal.style.display = "flex";
                    modal.style.justifyContent = "center";
                    modal.style.alignItems = "center";
                    showImage(currentImageIndex);
                });
            });
        });

        if (modalPrev) modalPrev.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex - 1); });
        if (modalNext) modalNext.addEventListener('click', (e) => { e.stopPropagation(); showImage(currentImageIndex + 1); });

        // Touch Swipe logic
        let touchstartX = 0;
        let touchendX = 0;
        
        modal.addEventListener('touchstart', e => {
            touchstartX = e.changedTouches[0].screenX;
        }, {passive: true});

        modal.addEventListener('touchend', e => {
            touchendX = e.changedTouches[0].screenX;
            if (touchendX < touchstartX - 40) { showImage(currentImageIndex + 1); } // Swiped left
            if (touchendX > touchstartX + 40) { showImage(currentImageIndex - 1); } // Swiped right
        }, {passive: true});

        modalClose.addEventListener('click', () => {
            modal.style.display = "none";
        });

        modal.addEventListener('click', (e) => {
            if(e.target === modal) {
                modal.style.display = "none";
            }
        });
    }
});

// Toast Notification
window.showToast = function() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
};
