// ============================================
// GLOBAL VARIABLES
// ============================================

const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const galleryCategories = document.getElementById('gallery-categories');
const galleryImages = document.getElementById('gallery-images');
const imagesGrid = document.getElementById('images-grid');
const backBtn = document.getElementById('back-btn');
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const lightboxClose = document.getElementById('lightbox-close');
const contactForm = document.getElementById('contact-form');

let currentGalleryCategory = '';
let currentImageIndex = 0;
let currentImages = [];
let touchStartX = 0;
let touchEndX = 0;

const imageCounts = {
    'grade-exam': 45,
    'salanga-pooja': 36,
    'competition': 17,
    'backstage-preparation': 24,
    'group-highlights': 29,
    'student-portraits': 125
};

// Image extensions for each category
const imageExtensions = {
    'grade-exam': 'JPG',
    'salanga-pooja': 'JPG',
    'competition': 'jpeg',
    'backstage-preparation': 'JPG'
};

// ============================================
// NAVIGATION EVENTS
// ============================================

// Sticky navbar on scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
});

// Hamburger menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu when a link is clicked
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Active nav link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    let currentSection = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 120;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ============================================
// CLASSES TAB PANEL
// ============================================

const classTabs = document.querySelectorAll('.class-tab');
const classPanels = document.querySelectorAll('.class-panel');

classTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');

        // Update active tab
        classTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show correct panel
        classPanels.forEach(panel => {
            panel.classList.remove('active');
        });

        const targetPanel = document.getElementById(`panel-${target}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// ============================================
// MOBILE ACCORDION (Classes)
// ============================================

const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const bodyId = header.getAttribute('data-acc');
        const body = document.getElementById(bodyId);
        const isOpen = body.classList.contains('open');

        // Close all
        document.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
        document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));

        // Open clicked if it was closed
        if (!isOpen) {
            body.classList.add('open');
            header.classList.add('active');
        }
    });
});

// ============================================
// GALLERY FUNCTIONALITY & HASH ROUTING
// ============================================

let savedScrollPosition = 0;
const galleryHeaderSection = document.getElementById('gallery-header-section');
const galleryDetailHeaderSection = document.getElementById('gallery-detail-header-section');
const categoryDetailTitle = document.getElementById('category-detail-title');
const categoryDetailCount = document.getElementById('category-detail-count');

// Progressive image loading variables to handle large file sizes (5MB - 9MB per photo)
const galleryBatchSize = 12;
let galleryRenderedCount = 0;
let infiniteScrollObserver = null;

function formatCategoryName(category) {
    const names = {
        'grade-exam': 'Grade Exam',
        'salanga-pooja': 'Salangai Pooja',
        'competition': 'Competition',
        'backstage-preparation': 'Backstage Preparations',
        'group-highlights': 'Group Highlights',
        'student-portraits': 'Student Portfolio'
    };
    return names[category] || category;
}

// Load images progressively for selected category
function loadGalleryCategoryImages(category) {
    currentGalleryCategory = category;
    currentImageIndex = 0;

    // Clear previous images
    imagesGrid.innerHTML = '';
    currentImages = [];
    galleryRenderedCount = 0;

    // Disconnect existing observer if active
    if (infiniteScrollObserver) {
        infiniteScrollObserver.disconnect();
        infiniteScrollObserver = null;
    }

    // Remove previous sentinel if present
    const prevSentinel = document.getElementById('gallery-sentinel');
    if (prevSentinel && prevSentinel.parentNode) {
        prevSentinel.parentNode.removeChild(prevSentinel);
    }

    // Generate image array
    const count = imageCounts[category];
    const ext = imageExtensions[category];

    let startNum = 1;
    const basePath = window.location.pathname.includes('/gallery/') ? '../images/' : 'images/';

    if (category === 'backstage-preparation') {
        const backstageImages = [
            'JOHN6809.JPG', 'JOHN6816.JPG', 'JOHN6817.JPG', 'JOHN6819.JPG',
            'JOHN6823.JPG', 'JOHN6825.JPG', 'JOHN6826.JPG', 'JOHN6827.JPG',
            'JOHN6831.JPG', 'JOHN6833.JPG', 'JOHN6838.JPG', 'JOHN6842.JPG',
            'JOHN6843.JPG', 'JOHN6846.JPG', 'JOHN6857.JPG', 'JOHN6860.JPG',
            'JOHN6863.JPG', 'JOHN7570.JPG', 'JOHN7571.JPG', 'JOHN7572.JPG',
            'JOHN7601.JPG', 'JOHN7606.JPG', 'JOHN7610.JPG', 'JOHN9180.JPG'
        ];
        currentImages = backstageImages.map(img => `${basePath}backstage-preparation/${img}`);
    } else if (category === 'group-highlights') {
        const groupImages = [
            '14.jpeg', '2.jpeg', 'JOHN4649.JPG', 'JOHN4957.JPG', 'JOHN4963.JPG',
            'JOHN4969.JPG', 'JOHN4975.JPG', 'JOHN4978.JPG', 'JOHN7246.JPG', 'JOHN7258.JPG',
            'JOHN7267.JPG', 'JOHN7273.JPG', 'JOHN7282.JPG', 'JOHN7289.JPG', 'JOHN8072.JPG',
            'JOHN8081.JPG', 'JOHN8094.JPG', 'JOHN8112.JPG', 'JOHN8127.JPG', 'JOHN8180.JPG',
            'JOHN8198.JPG', 'JOHN8217.JPG', 'JOHN8242.JPG', 'JOHN8267.JPG', 'JOHN8273.JPG',
            'JOHN8307.JPG', 'JOHN8346.JPG', 'JOHN8376 (1).JPG', 'JOHN8376.JPG'
        ];
        currentImages = groupImages.map(img => `${basePath}group-highlights/${img}`);
    } else if (category === 'student-portraits') {
        const studentImages = [
            '17.jpeg', 'JOHN6895.JPG', 'JOHN6913.JPG', 'JOHN6924.JPG', 'JOHN6963.JPG',
            'JOHN6969.JPG', 'JOHN6993.JPG', 'JOHN7002.JPG', 'JOHN7012.JPG', 'JOHN7014.JPG',
            'JOHN7025.JPG', 'JOHN7034.JPG', 'JOHN7035.JPG', 'JOHN7050.JPG', 'JOHN7058.JPG',
            'JOHN7062.JPG', 'JOHN7064.JPG', 'JOHN7079.JPG', 'JOHN7080.JPG', 'JOHN7097.JPG',
            'JOHN7101.JPG', 'JOHN7110.JPG', 'JOHN7121.JPG', 'JOHN7124.JPG', 'JOHN7147.JPG',
            'JOHN7148.JPG', 'JOHN7159.JPG', 'JOHN7168.JPG', 'JOHN7178.JPG', 'JOHN7202.JPG',
            'JOHN7219.JPG', 'JOHN7235.JPG', 'JOHN7240.JPG', 'JOHN7294.JPG', 'JOHN7302.JPG',
            'JOHN7306.JPG', 'JOHN7309.JPG', 'JOHN7314.JPG', 'JOHN7317.JPG', 'JOHN7319.JPG',
            'JOHN7327.JPG', 'JOHN7330.JPG', 'JOHN7336.JPG', 'JOHN7338.JPG', 'JOHN7345.JPG',
            'JOHN7349.JPG', 'JOHN7353.JPG', 'JOHN7356.JPG', 'JOHN7372.JPG', 'JOHN7375.JPG',
            'JOHN7391.JPG', 'JOHN7398.JPG', 'JOHN7414.JPG', 'JOHN7435.JPG', 'JOHN7440.JPG',
            'JOHN7530.JPG', 'JOHN7540.JPG', 'JOHN7551.JPG', 'JOHN7558.JPG', 'JOHN7579.JPG',
            'JOHN7587.JPG', 'JOHN7596.JPG', 'JOHN7618.JPG', 'JOHN7624.JPG', 'JOHN7633.JPG',
            'JOHN7643.JPG', 'JOHN7654.JPG', 'JOHN7670.JPG', 'JOHN7673.JPG', 'JOHN7698.JPG',
            'JOHN7713.JPG', 'JOHN7719.JPG', 'JOHN7728.JPG', 'JOHN7734.JPG', 'JOHN7750.JPG',
            'JOHN7759.JPG', 'JOHN7773.JPG', 'JOHN7783.JPG', 'JOHN7810.JPG', 'JOHN7820.JPG',
            'JOHN7824.JPG', 'JOHN7833.JPG', 'JOHN7843.JPG', 'JOHN7857.JPG', 'JOHN7900.JPG',
            'JOHN7911.JPG', 'JOHN7936.JPG', 'JOHN7962.JPG', 'JOHN7983.JPG', 'JOHN8004 (1).JPG',
            'JOHN8004.JPG', 'JOHN8009.JPG', 'JOHN8013.JPG', 'JOHN8022.JPG', 'JOHN8026.JPG',
            'JOHN8034.JPG', 'JOHN8042.JPG', 'JOHN8067.JPG', 'JOHN8278.JPG', 'JOHN8284.JPG',
            'JOHN8290.JPG', 'JOHN8300.JPG', 'JOHN8309.JPG', 'JOHN8312.JPG', 'JOHN8321.JPG',
            'JOHN8338.JPG', 'JOHN8446.JPG', 'JOHN8598.JPG', 'JOHN8634.JPG', 'JOHN8671.JPG',
            'JOHN8726.JPG', 'JOHN8740.JPG', 'JOHN8776.JPG', 'JOHN8786.JPG', 'JOHN8840.JPG',
            'JOHN8880.JPG', 'JOHN8975.JPG', 'JOHN9058.JPG', 'JOHN9074.JPG', 'JOHN9083.JPG',
            'JOHN9098.JPG', 'JOHN9107.JPG', 'JOHN9134.JPG', 'JOHN9149.JPG', 'JOHN9184.JPG'
        ];
        currentImages = studentImages.map(img => `${basePath}student-portraits/${img}`);
    } else {
        // For other categories, use numbered format
        for (let i = startNum; i <= count; i++) {
            currentImages.push(`${basePath}${category}/${i}.${ext}`);
        }
    }

    // Render first batch of images
    renderNextGalleryBatch();

    // Setup scroll observer for subsequent batches
    setupInfiniteScroll();
}

function renderNextGalleryBatch() {
    if (currentImages.length === 0) return;

    const nextBatchEnd = Math.min(galleryRenderedCount + galleryBatchSize, currentImages.length);

    for (let i = galleryRenderedCount; i < nextBatchEnd; i++) {
        const imagePath = currentImages[i];
        const index = i;

        const imageEl = document.createElement('div');
        imageEl.className = 'gallery-image';
        imageEl.innerHTML = `<img src="${imagePath}" alt="Gallery image ${index + 1}" loading="lazy">`;
        imageEl.addEventListener('click', () => openLightbox(index));
        imagesGrid.appendChild(imageEl);
    }

    galleryRenderedCount = nextBatchEnd;
}

function setupInfiniteScroll() {
    if (galleryRenderedCount >= currentImages.length) return;

    // Create sentinel element at the bottom of the grid
    let sentinel = document.getElementById('gallery-sentinel');
    if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.id = 'gallery-sentinel';
        sentinel.style.height = '20px';
        sentinel.style.width = '100%';
        sentinel.style.clear = 'both';
        galleryImages.appendChild(sentinel);
    }

    infiniteScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                renderNextGalleryBatch();

                // If all images loaded, clean up sentinel and observer
                if (galleryRenderedCount >= currentImages.length) {
                    infiniteScrollObserver.disconnect();
                    infiniteScrollObserver = null;
                    if (sentinel && sentinel.parentNode) {
                        sentinel.parentNode.removeChild(sentinel);
                    }
                }
            }
        });
    }, {
        rootMargin: '300px' // Load next batch early when within 300px of viewport bottom
    });

    infiniteScrollObserver.observe(sentinel);
}

document.addEventListener('DOMContentLoaded', () => {
    const galleryPageCategory = document.body.getAttribute('data-gallery-category');
    if (galleryPageCategory) {
        loadGalleryCategoryImages(galleryPageCategory);
    }
});

// ============================================
// LIGHTBOX FUNCTIONALITY
// ============================================

function openLightbox(index) {
    currentImageIndex = index;
    lightboxModal.classList.add('active');
    updateLightboxImage();
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function updateLightboxImage() {
    if (currentImages.length === 0) return;

    lightboxImage.src = currentImages[currentImageIndex];
    document.getElementById('current-image').textContent = currentImageIndex + 1;
    document.getElementById('total-images').textContent = currentImages.length;
}

function nextImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % currentImages.length;
    updateLightboxImage();
}

function prevImage() {
    if (currentImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    updateLightboxImage();
}

// Lightbox event listeners
lightboxClose.addEventListener('click', closeLightbox);
lightboxNext.addEventListener('click', nextImage);
lightboxPrev.addEventListener('click', prevImage);

// Close lightbox on background click
lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
        closeLightbox();
    }
});

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;

    switch(e.key) {
        case 'ArrowRight':
            nextImage();
            break;
        case 'ArrowLeft':
            prevImage();
            break;
        case 'Escape':
            closeLightbox();
            break;
    }
});

// Touch/Swipe support for lightbox
lightboxModal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

lightboxModal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            nextImage();
        } else {
            prevImage();
        }
    }
}

// ============================================
// TESTIMONIALS — AVATAR-BASED NAVIGATION
// ============================================

const testimonialData = [];
document.querySelectorAll('.testimonials-data .testimonial-card').forEach(card => {
    testimonialData.push({
        name: card.getAttribute('data-name'),
        role: card.getAttribute('data-role'),
        img: card.getAttribute('data-img'),
        text: card.querySelector('.testimonial-text').textContent
    });
});

let currentTestimonialIndex = 0;
let testimonialInterval;
const totalTestimonials = testimonialData.length;

function buildStars() {
    return `<i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i>`;
}

function showTestimonial(index) {
    if (testimonialData.length === 0) return;

    currentTestimonialIndex = index;
    const data = testimonialData[index];

    const displayEl = document.getElementById('testimonial-display');
    if (displayEl) {
        displayEl.innerHTML = `
            <p class="testimonial-text">"${data.text}"</p>
            <div class="reviewer-info">
                <div class="rating">${buildStars()}</div>
                <span class="reviewer-name">${data.name}</span>
                <span class="reviewer-role">${data.role}</span>
            </div>
        `;
        displayEl.style.animation = 'none';
        void displayEl.offsetWidth; // reflow to restart animation
        displayEl.style.animation = '';
    }

    // Update avatar active state
    document.querySelectorAll('.testimonial-avatar-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    startTestimonialSlider();
}

function startTestimonialSlider() {
    stopTestimonialSlider();
    testimonialInterval = setInterval(() => {
        const nextIndex = (currentTestimonialIndex + 1) % totalTestimonials;
        showTestimonial(nextIndex);
    }, 8000);
}

function stopTestimonialSlider() {
    if (testimonialInterval) {
        clearInterval(testimonialInterval);
    }
}

// Initialize testimonials
showTestimonial(0);

// Pause on hover over testimonials stage
const testimonialsStage = document.querySelector('.testimonials-stage');
if (testimonialsStage) {
    testimonialsStage.addEventListener('mouseenter', stopTestimonialSlider);
    testimonialsStage.addEventListener('mouseleave', startTestimonialSlider);
}

// ============================================
// CONTACT FORM
// ============================================

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate form
        if (!name || !phone || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Validate phone (allowing spaces and +, min 10 chars)
        const phoneRegex = /^[0-9+\s-]{10,15}$/;
        if (!phoneRegex.test(phone.replace(/[^\d+]/g, ''))) {
            alert('Please enter a valid phone number');
            return;
        }

        const whatsappMessage = `Hello,

My Name: ${name}

Phone Number: ${phone}

Message:
${message}

I visited your website and would like to know more about your classes.`;

        const whatsappUrl = `https://wa.me/918825849967?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');

        // Show success message
        const submitBtn = contactForm.querySelector('.contact-submit-btn');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Opening WhatsApp...</span> <i class="fas fa-check"></i>';
        submitBtn.style.background = '#2ecc71';

        setTimeout(() => {
            submitBtn.innerHTML = originalContent;
            submitBtn.style.background = '';
            contactForm.reset();
        }, 3000);
    });
}

// ============================================
// ANIMATED COUNTERS
// ============================================

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const increment = Math.ceil(target / 60);
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current;
    }, 25);
}

// Trigger counters when they come into view
function countersInView() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                entry.target.classList.add('counted');
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

countersInView();

// ============================================
// SCROLL REVEAL ANIMATIONS (GSAP)
// ============================================

if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // Fade in elements on scroll
    gsap.utils.toArray('[data-aos]').forEach(element => {
        const delay = parseFloat(element.getAttribute('data-aos-delay') || 0) / 1000;

        gsap.from(element, {
            opacity: 0,
            y: 40,
            duration: 0.75,
            delay: delay,
            ease: "power2.out",
            scrollTrigger: {
                trigger: element,
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        });
    });

    // Parallax-style glow blobs
    gsap.utils.toArray('.about::before, .classes::before').forEach(el => {
        if (!el) return;
        gsap.to(el, {
            y: -40,
            ease: "none",
            scrollTrigger: {
                trigger: el,
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    });
}

// ============================================
// LAZY LOADING
// ============================================

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.getAttribute('data-src')) {
                img.src = img.getAttribute('data-src');
                img.removeAttribute('data-src');
            }
            observer.unobserve(img);
        }
    });
});

document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});

// ============================================
// SMOOTH SCROLL FOR HASH LINKS
// ============================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.startsWith('#gallery/')) return;

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function isTouchDevice() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0));
}

function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// ACCESSIBILITY ENHANCEMENTS
// ============================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const focused = document.activeElement;
        if (focused.classList.contains('category-card')) {
            focused.click();
        }
    }
});

document.querySelectorAll('[role="button"]').forEach(el => {
    if (!el.getAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
    }
});

// ============================================
// PAGE LOAD OPTIMIZATION
// ============================================

function preloadImages(urls) {
    urls.forEach(url => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = url;
        document.head.appendChild(link);
    });
}

preloadImages([
    'images/hero.png',
    'images/logo.png'
]);

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Damosrii Natyalam Website Loaded ✨');

    // Initialize routing on page load based on current hash
    handleRouting();

    // Initialize animations
    initializeAnimations();

    // Set focus management
    if (!isTouchDevice()) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-nav');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-nav');
        });
    }
});

// Initialize animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// ERROR HANDLING
// ============================================

window.addEventListener('error', (event) => {
    console.error('Error occurred:', event.error);
});

document.addEventListener('error', (event) => {
    if (event.target.tagName === 'IMG') {
        console.warn('Image failed to load:', event.target.src);
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23222" width="100" height="100"/%3E%3Ctext x="50" y="50" font-size="10" fill="%23888" text-anchor="middle" dy=".3em"%3EImage unavailable%3C/text%3E%3C/svg%3E';
    }
}, true);

// ============================================
// EXPORT FUNCTIONS FOR EXTERNAL USE
// ============================================

window.galleryFunctions = {
    openLightbox,
    closeLightbox,
    nextImage,
    prevImage,
    showTestimonial,
    loadGalleryCategory: (category) => { window.location.hash = `#gallery/${category}`; }
};
