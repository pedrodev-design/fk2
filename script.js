document.addEventListener("DOMContentLoaded", () => {
    
    const header = document.querySelector('.glass-header');
    
    /* ==========================================================================
       MOBILE MENU & DROPDOWN LOGIC
       ========================================================================== */
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const marcasDropdown = document.querySelector('.marcas-dropdown');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            
            // Toggle icon
            const icon = mobileMenuToggle.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    if (marcasDropdown) {
        const marcasLink = marcasDropdown.querySelector('a');
        marcasLink.addEventListener('click', (e) => {
            // Only toggle via JS on mobile
            if (window.innerWidth <= 1024) {
                e.preventDefault();
                marcasDropdown.classList.toggle('mobile-open');
            }
        });
    }
    
    /* ==========================================================================
       HEADER SCROLL EFFECT (Vanilla JS)
       ========================================================================== */
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       DYNAMIC HEADER THEME (Smart Contrast)
       ========================================================================== */
    const darkSections = document.querySelectorAll('[data-theme="dark"]');
    
    if (darkSections.length > 0) {
        window.addEventListener('scroll', () => {
            // Header is roughly 80px tall. We check if a dark section covers y=40 (middle of header).
            let isOverDark = Array.from(darkSections).some(section => {
                const rect = section.getBoundingClientRect();
                return rect.top <= 40 && rect.bottom >= 40;
            });
            if (isOverDark) {
                // User requested inverted contrast: Light header on dark sections
                header.classList.remove('dark-theme');
            } else {
                // Dark header on light sections
                header.classList.add('dark-theme');
            }
        });
    }

    /* ==========================================================================
       NATIVE CSS REVEALS (Substituindo o GSAP para algo mais limpo e leve)
       ========================================================================== */
    // Select elements to reveal on scroll
    const reveals = document.querySelectorAll('.animate-up, .brand-logo, .social-link, .footer-column, .footer-bottom');
    
    // Add base transition CSS dynamically if not present, though it's better handled in CSS
    // For simplicity, we just add a class 'visible' when they intersect
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        // Initial state for simple fade up
        reveal.style.opacity = '0';
        reveal.style.transform = 'translateY(30px)';
        reveal.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        revealOnScroll.observe(reveal);
    });

    // Add styles for the visible class dynamically
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        /* Keep original opacity limits for specific elements if needed */
        .brands-container .brand-logo.visible {
            opacity: 0.6 !important;
        }
        .brands-container .brand-logo:hover {
            opacity: 1 !important;
        }
    `;
    document.head.appendChild(style);

    /* ==========================================================================
       SCROLLYTELLING TIMELINE (O FK Grupo)
       ========================================================================== */
    const timelineWrapper = document.querySelector('.timeline-wrapper');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timelineWrapper && timelineItems.length > 0) {
        const timelineStyle = document.createElement('style');
        document.head.appendChild(timelineStyle);

        window.addEventListener('scroll', () => {
            const wrapperRect = timelineWrapper.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Start line growth when top of wrapper reaches middle of viewport
            const startScroll = wrapperRect.top - (windowHeight / 2);
            const wrapperHeight = wrapperRect.height;
            
            let progress = 0;
            if (startScroll < 0) {
                // Calculate percentage, multiply by 1.1 to ensure it reaches the very end
                progress = Math.min(100, Math.max(0, (Math.abs(startScroll) / wrapperHeight) * 110));
            }
            
            timelineStyle.innerHTML = `
                .timeline-progress-line::after {
                    height: ${Math.min(100, progress)}% !important;
                }
            `;

            // Activate timeline items as scroll passes them
            timelineItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                // 0.6 = trigger slightly below center of screen
                if (itemRect.top < windowHeight * 0.65) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
        
        // Trigger once on load in case user refreshed halfway down
        window.dispatchEvent(new Event('scroll'));
    }

});
