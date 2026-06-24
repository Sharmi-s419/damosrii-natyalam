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
    'grade-exam': 'jpg',
    'salanga-pooja': 'jpg',
    'competition': 'jpg',
    'backstage-preparation': 'jpg'
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
    const basePath = '/images/';

    if (category === 'backstage-preparation') {
        const backstageImages = [
            'JOHN6809.jpg', 'JOHN6816.jpg', 'JOHN6817.jpg', 'JOHN6819.jpg',
            'JOHN6823.jpg', 'JOHN6825.jpg', 'JOHN6826.jpg', 'JOHN6827.jpg',
            'JOHN6831.jpg', 'JOHN6833.jpg', 'JOHN6838.jpg', 'JOHN6842.jpg',
            'JOHN6843.jpg', 'JOHN6846.jpg', 'JOHN6857.jpg', 'JOHN6860.jpg',
            'JOHN6863.jpg', 'JOHN7570.jpg', 'JOHN7571.jpg', 'JOHN7572.jpg',
            'JOHN7601.jpg', 'JOHN7606.jpg', 'JOHN7610.jpg', 'JOHN9180.jpg'
        ];
        currentImages = backstageImages.map(img => `${basePath}backstage-preparation/${img}`);
    } else if (category === 'group-highlights') {
        const groupImages = [
            '14.jpg', '2.jpg', 'JOHN4649.jpg', 'JOHN4957.jpg', 'JOHN4963.jpg',
            'JOHN4969.jpg', 'JOHN4975.jpg', 'JOHN4978.jpg', 'JOHN7246.jpg', 'JOHN7258.jpg',
            'JOHN7267.jpg', 'JOHN7273.jpg', 'JOHN7282.jpg', 'JOHN7289.jpg', 'JOHN8072.jpg',
            'JOHN8081.jpg', 'JOHN8094.jpg', 'JOHN8112.jpg', 'JOHN8127.jpg', 'JOHN8180.jpg',
            'JOHN8198.jpg', 'JOHN8217.jpg', 'JOHN8242.jpg', 'JOHN8267.jpg', 'JOHN8273.jpg',
            'JOHN8307.jpg', 'JOHN8346.jpg', 'JOHN8376 (1).jpg', 'JOHN8376.jpg'
        ];
        currentImages = groupImages.map(img => `${basePath}group-highlights/${img}`);
    } else if (category === 'student-portraits') {
        const studentImages = [
            '17.jpg', 'JOHN6895.jpg', 'JOHN6913.jpg', 'JOHN6924.jpg', 'JOHN6963.jpg',
            'JOHN6969.jpg', 'JOHN6993.jpg', 'JOHN7002.jpg', 'JOHN7012.jpg', 'JOHN7014.jpg',
            'JOHN7025.jpg', 'JOHN7034.jpg', 'JOHN7035.jpg', 'JOHN7050.jpg', 'JOHN7058.jpg',
            'JOHN7062.jpg', 'JOHN7064.jpg', 'JOHN7079.jpg', 'JOHN7080.jpg', 'JOHN7097.jpg',
            'JOHN7101.jpg', 'JOHN7110.jpg', 'JOHN7121.jpg', 'JOHN7124.jpg', 'JOHN7147.jpg',
            'JOHN7148.jpg', 'JOHN7159.jpg', 'JOHN7168.jpg', 'JOHN7178.jpg', 'JOHN7202.jpg',
            'JOHN7219.jpg', 'JOHN7235.jpg', 'JOHN7240.jpg', 'JOHN7294.jpg', 'JOHN7302.jpg',
            'JOHN7306.jpg', 'JOHN7309.jpg', 'JOHN7314.jpg', 'JOHN7317.jpg', 'JOHN7319.jpg',
            'JOHN7327.jpg', 'JOHN7330.jpg', 'JOHN7336.jpg', 'JOHN7338.jpg', 'JOHN7345.jpg',
            'JOHN7349.jpg', 'JOHN7353.jpg', 'JOHN7356.jpg', 'JOHN7372.jpg', 'JOHN7375.jpg',
            'JOHN7391.jpg', 'JOHN7398.jpg', 'JOHN7414.jpg', 'JOHN7435.jpg', 'JOHN7440.jpg',
            'JOHN7530.jpg', 'JOHN7540.jpg', 'JOHN7551.jpg', 'JOHN7558.jpg', 'JOHN7579.jpg',
            'JOHN7587.jpg', 'JOHN7596.jpg', 'JOHN7618.jpg', 'JOHN7624.jpg', 'JOHN7633.jpg',
            'JOHN7643.jpg', 'JOHN7654.jpg', 'JOHN7670.jpg', 'JOHN7673.jpg', 'JOHN7698.jpg',
            'JOHN7713.jpg', 'JOHN7719.jpg', 'JOHN7728.jpg', 'JOHN7734.jpg', 'JOHN7750.jpg',
            'JOHN7759.jpg', 'JOHN7773.jpg', 'JOHN7783.jpg', 'JOHN7810.jpg', 'JOHN7820.jpg',
            'JOHN7824.jpg', 'JOHN7833.jpg', 'JOHN7843.jpg', 'JOHN7857.jpg', 'JOHN7900.jpg',
            'JOHN7911.jpg', 'JOHN7936.jpg', 'JOHN7962.jpg', 'JOHN7983.jpg', 'JOHN8004 (1).jpg',
            'JOHN8004.jpg', 'JOHN8009.jpg', 'JOHN8013.jpg', 'JOHN8022.jpg', 'JOHN8026.jpg',
            'JOHN8034.jpg', 'JOHN8042.jpg', 'JOHN8067.jpg', 'JOHN8278.jpg', 'JOHN8284.jpg',
            'JOHN8290.jpg', 'JOHN8300.jpg', 'JOHN8309.jpg', 'JOHN8312.jpg', 'JOHN8321.jpg',
            'JOHN8338.jpg', 'JOHN8446.jpg', 'JOHN8598.jpg', 'JOHN8634.jpg', 'JOHN8671.jpg',
            'JOHN8726.jpg', 'JOHN8740.jpg', 'JOHN8776.jpg', 'JOHN8786.jpg', 'JOHN8840.jpg',
            'JOHN8880.jpg', 'JOHN8975.jpg', 'JOHN9058.jpg', 'JOHN9074.jpg', 'JOHN9083.jpg',
            'JOHN9098.jpg', 'JOHN9107.jpg', 'JOHN9134.jpg', 'JOHN9149.jpg', 'JOHN9184.jpg'
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
