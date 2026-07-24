/**
 * FK GRUPO — PREMIUM ANIMATION SYSTEM
 * GSAP + ScrollTrigger + Lenis Smooth Scroll
 * Estilo Awwwards
 */

(function () {
    'use strict';

    /* =========================================================================
       1. LENIS SMOOTH SCROLL INIT
    ========================================================================= */
    const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2
    });

    // Sync Lenis with GSAP ticker
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    /* =========================================================================

       3. SCROLL PROGRESS BAR
    ========================================================================= */
    const progressBar = document.getElementById('scroll-progress');
    if (progressBar) {
        gsap.to(progressBar, {
            width: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.body,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3
            }
        });
    }

    /* =========================================================================
       4. HEADER — SMART ADAPTIVE COLOR + HIDE/SHOW ON SCROLL
    ========================================================================= */
    const header = document.querySelector('.glass-header');
    let lastScrollY = 0;
    let headerVisible = true;

    // Mark dark sections with data-theme="dark"
    // They will be auto-detected by background color
    const darkSections = document.querySelectorAll(
        '.home-capacity-section, [data-theme="dark"], .hero-section, .footer-section, .f-statement'
    );
    darkSections.forEach(s => s.setAttribute('data-theme', 'dark'));

    function updateHeaderTheme() {
        const scrollY = window.scrollY || lenis.scroll;
        const headerBottom = header.getBoundingClientRect().bottom;

        // Find which section the header is currently over
        let overDark = false;
        document.querySelectorAll('[data-theme="dark"]').forEach((section) => {
            const rect = section.getBoundingClientRect();
            // If the middle of the header overlaps a dark section
            if (rect.top < headerBottom + 10 && rect.bottom > 10) {
                overDark = true;
            }
        });

        if (overDark) {
            // Header over dark background → use white/transparent style
            header.classList.add('header-light-text');
            header.classList.remove('header-dark-text');
        } else {
            // Header over light background → use dark text for contrast
            header.classList.remove('header-light-text');
            header.classList.add('header-dark-text');
        }
    }

    lenis.on('scroll', ({ scroll }) => {
        const scrollY = scroll;
        const delta = scrollY - lastScrollY;

        // Shrink after 80px
        if (scrollY > 80) {
            header.classList.add('header-shrunk');
        } else {
            header.classList.remove('header-shrunk');
        }

        // Hide on scroll down, show on scroll up
        if (delta > 5 && scrollY > 200 && headerVisible) {
            gsap.to(header, { y: '-110%', duration: 0.5, ease: 'power3.in' });
            headerVisible = false;
        } else if (delta < -5 && !headerVisible) {
            gsap.to(header, { y: '0%', duration: 0.6, ease: 'power3.out' });
            headerVisible = true;
        }

        updateHeaderTheme();
        lastScrollY = scrollY;
    });

    // Run once on load
    setTimeout(updateHeaderTheme, 200);


    /* =========================================================================
       5. HERO SECTION — CINEMATIC TEXT ENTRANCE
    ========================================================================= */
    function initHeroAnimations() {
        const tl = gsap.timeline({ delay: 0.2 });

        // Hero text title lines (split by <br>)
        const titleEl = document.querySelector('.hero-section .title');
        if (titleEl) {
            // Create split lines from the h1
            const text = titleEl.innerHTML;
            const lines = text.split('<br>');
            titleEl.innerHTML = lines.map(line =>
                `<span class="split-line"><span class="inner">${line}</span></span>`
            ).join('');

            tl.to('.hero-section .split-line .inner', {
                translateY: '0%',
                duration: 1.2,
                stagger: 0.12,
                ease: 'power4.out'
            });
        }

        // Subtitle & description fade
        tl.from('.hero-section .subtitle', {
            opacity: 0, y: 15, filter: 'blur(8px)', duration: 1, ease: 'power3.out'
        }, '-=0.8')
        .from('.hero-section .description', {
            opacity: 0, y: 20, filter: 'blur(8px)', duration: 1, ease: 'power3.out'
        }, '-=0.7')
        .from('.hero-section .hero-cta', {
            opacity: 0, y: 20, duration: 0.8, ease: 'power3.out'
        }, '-=0.6');
    }

    /* =========================================================================
       6. UNIVERSAL BLUR-UP REVEAL ON SCROLL
    ========================================================================= */
    function setupScrollReveals() {

        // Section labels
        gsap.utils.toArray('.home-section-label').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%' },
                opacity: 0,
                x: -20,
                duration: 0.8,
                ease: 'power3.out'
            });
        });

        // Headings — blur + translate
        gsap.utils.toArray('.home-stats-section h2, .home-brands-header h2, .home-solutions-section h2, .capacity-content h2, .about-content h2, .sust-text h2').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 85%' },
                opacity: 0,
                y: 50,
                filter: 'blur(16px)',
                duration: 1.2,
                ease: 'power4.out'
            });
        });

        // Paragraphs — staggered soft blur
        gsap.utils.toArray('.about-content > p, .capacity-content > p, .sust-text p, .home-brands-desc p').forEach((el) => {
            gsap.from(el, {
                scrollTrigger: { trigger: el, start: 'top 88%' },
                opacity: 0,
                y: 30,
                filter: 'blur(8px)',
                duration: 1,
                ease: 'power3.out'
            });
        });
    }

    /* =========================================================================
       7. STATS — STAGGER + NUMBER COUNTER
    ========================================================================= */
    function setupStatsAnimation() {
        const stats = gsap.utils.toArray('.home-stat');
        if (!stats.length) return;

        // Stagger in from below with blur
        gsap.from(stats, {
            scrollTrigger: {
                trigger: '.home-stats-section',
                start: 'top 80%'
            },
            opacity: 0,
            y: 60,
            filter: 'blur(12px)',
            stagger: 0.12,
            duration: 1,
            ease: 'power4.out'
        });

        // Animated number counter
        stats.forEach((stat) => {
            const numEl = stat.querySelector('h3');
            if (!numEl) return;

            const raw = numEl.textContent;
            const prefix = raw.match(/^[+]?/)?.[0] || '';
            const numMatch = raw.match(/[\d.,]+/);
            if (!numMatch) return;
            const numStr = numMatch[0].replace('.', '').replace(',', '.');
            const num = parseFloat(numStr);
            const suffix = raw.replace(prefix, '').replace(numMatch[0], '');

            const obj = { val: 0 };
            ScrollTrigger.create({
                trigger: stat,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(obj, {
                        val: num,
                        duration: 2,
                        ease: 'power2.out',
                        onUpdate: () => {
                            const display = Number.isInteger(num)
                                ? Math.floor(obj.val).toLocaleString('pt-BR')
                                : obj.val.toFixed(0).toLocaleString('pt-BR');
                            numEl.textContent = prefix + display + suffix;
                        }
                    });
                }
            });
        });
    }

    /* =========================================================================
       8. BRANDS LOGOS — CASCADE REVEAL + PARALLAX
    ========================================================================= */
    function setupBrandsAnimation() {
        const logos = gsap.utils.toArray('.home-brands-logos a');
        if (!logos.length) return;

        gsap.from(logos, {
            scrollTrigger: {
                trigger: '.home-brands-logos',
                start: 'top 85%'
            },
            opacity: 0,
            y: 40,
            filter: 'blur(12px)',
            stagger: 0.15,
            duration: 1.2,
            ease: 'power4.out'
        });
    }

    /* =========================================================================
       9. SOLUTION CARDS — STAGGER WITH SCALE + BLUR
    ========================================================================= */
    function setupCardsAnimation() {
        const cards = gsap.utils.toArray('.solution-card');
        if (!cards.length) return;

        gsap.from(cards, {
            scrollTrigger: {
                trigger: '.home-solutions-grid',
                start: 'top 80%'
            },
            opacity: 0,
            y: 80,
            scale: 0.92,
            filter: 'blur(14px)',
            stagger: 0.1,
            duration: 1,
            ease: 'power4.out'
        });
    }

    /* =========================================================================
       10. CAPACITY SECTION — SPLIT REVEAL (TEXT LEFT, IMAGE RIGHT)
    ========================================================================= */
    function setupCapacityAnimation() {
        const content = document.querySelector('.capacity-content');
        const image = document.querySelector('.capacity-image');
        if (!content || !image) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.home-capacity-section',
                start: 'top 70%'
            }
        });

        tl.from(content, {
            opacity: 0,
            x: -80,
            filter: 'blur(16px)',
            duration: 1.2,
            ease: 'power4.out'
        })
        .from(image, {
            opacity: 0,
            x: 80,
            filter: 'blur(16px)',
            duration: 1.2,
            ease: 'power4.out'
        }, '-=0.9')
        .from('.cap-feat', {
            opacity: 0,
            y: 30,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.6');
    }

    /* =========================================================================
       11. ABOUT SECTION — VIDEO LEFT, TEXT RIGHT REVEAL
    ========================================================================= */
    function setupAboutAnimation() {
        const aboutImg = document.querySelector('.about-image');
        const aboutText = document.querySelector('.about-content');
        if (!aboutImg || !aboutText) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: '.home-about-section',
                start: 'top 72%'
            }
        });

        tl.from(aboutImg, {
            opacity: 0,
            x: -70,
            filter: 'blur(20px)',
            duration: 1.3,
            ease: 'power4.out'
        })
        .from(aboutText, {
            opacity: 0,
            x: 50,
            filter: 'blur(12px)',
            duration: 1.1,
            ease: 'power4.out'
        }, '-=0.9')
        .from('.abt-feat', {
            opacity: 0,
            y: 25,
            stagger: 0.12,
            duration: 0.7,
            ease: 'power3.out'
        }, '-=0.5');
    }

    /* =========================================================================
       12. SUSTAINABILITY SECTION — PREMIUM EDITORIAL REVEAL
    ========================================================================= */
    function setupSustainabilityAnimation() {
        const sust = document.querySelector('.home-sustainability-section');
        if (!sust) return;

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: sust,
                start: 'top 70%'
            }
        });

        tl.from('.sust-left .home-section-label', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power3.out'
        })
        .from('.sust-left h2', {
            opacity: 0,
            y: 40,
            filter: 'blur(14px)',
            duration: 1.1,
            ease: 'power4.out'
        }, '-=0.5')
        .from('.sust-left p', {
            opacity: 0,
            y: 20,
            filter: 'blur(8px)',
            duration: 1,
            ease: 'power3.out'
        }, '-=0.7')
        .from('.sust-pillar', {
            opacity: 0,
            x: -30,
            stagger: 0.15,
            duration: 0.9,
            ease: 'power4.out'
        }, '-=0.6')
        .from('.sust-stat', {
            opacity: 0,
            scale: 0.9,
            y: 40,
            filter: 'blur(12px)',
            stagger: 0.15,
            duration: 1.2,
            ease: 'back.out(1.2)'
        }, '-=1.2')
        .from('.sust-cta', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power3.out'
        }, '-=0.8');
    }

    /* =========================================================================
       13. CTA BANNER — PARALLAX ON SCROLL
    ========================================================================= */
    function setupCTAAnimation() {
        const cta = document.querySelector('.home-cta-banner');
        if (!cta) return;

        gsap.from('.home-cta-banner h2', {
            scrollTrigger: { trigger: cta, start: 'top 80%' },
            opacity: 0,
            y: 50,
            filter: 'blur(18px)',
            duration: 1.3,
            ease: 'power4.out'
        });
        gsap.from('.cta-banner-buttons', {
            scrollTrigger: { trigger: cta, start: 'top 80%' },
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 0.3,
            ease: 'power3.out'
        });
    }

    /* =========================================================================
       14. MARQUEE PARALLAX (speed increase on scroll)
    ========================================================================= */
    function setupMarqueeParallax() {
        const inner = document.querySelector('.marquee-inner');
        if (!inner) return;
        // Lenis velocity affects marquee speed
        lenis.on('scroll', ({ velocity }) => {
            const speed = 25 - Math.min(Math.abs(velocity) * 0.5, 20);
            inner.style.animationDuration = `${speed}s`;
        });
    }

    /* =========================================================================
       15. PARALLAX on CAPACITY IMAGE
    ========================================================================= */
    function setupParallax() {
        const capImg = document.querySelector('.capacity-image img');
        if (capImg) {
            gsap.to(capImg, {
                yPercent: -15,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.home-capacity-section',
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1.5
                }
            });
        }
    }

    /* =========================================================================
       16. FRISOKAR PAGE ANIMATIONS
    ========================================================================= */
    function setupFrisokarAnimations() {
        // Only run on frisokar page
        if (!document.querySelector('.frisokar-page')) return;

        // Hero title - split lines entrance
        const heroTitle = document.querySelector('.f-hero-title');
        if (heroTitle) {
            const lines = heroTitle.innerHTML.split('<br>');
            heroTitle.innerHTML = lines.map(l => `<span class="split-line"><span class="inner">${l}</span></span>`).join('<br>');
            gsap.to('.f-hero-title .split-line .inner', {
                translateY: '0%',
                duration: 1.3,
                stagger: 0.15,
                ease: 'power4.out',
                delay: 0.3
            });
        }

        gsap.from('.f-hero-sub', {
            opacity: 0, y: 20, filter: 'blur(8px)', duration: 1, delay: 0.7, ease: 'power3.out'
        });

        // Hero banner image slides in from right
        gsap.from('.f-hero-banner', {
            opacity: 0, x: 80, filter: 'blur(14px)', duration: 1.4, delay: 0.2, ease: 'power4.out'
        });

        // Intro section
        gsap.from('.f-intro-left', {
            scrollTrigger: { trigger: '.f-intro', start: 'top 80%' },
            opacity: 0, x: -60, filter: 'blur(14px)', duration: 1.2, ease: 'power4.out'
        });
        gsap.from('.f-intro-right', {
            scrollTrigger: { trigger: '.f-intro', start: 'top 80%' },
            opacity: 0, x: 60, filter: 'blur(10px)', duration: 1.2, delay: 0.2, ease: 'power4.out'
        });
        gsap.from('.f-intro-right p', {
            scrollTrigger: { trigger: '.f-intro', start: 'top 75%' },
            opacity: 0, y: 30, stagger: 0.2, duration: 1, delay: 0.4, ease: 'power3.out'
        });

        // Statement section (dark)
        const stmtTl = gsap.timeline({
            scrollTrigger: { trigger: '.f-statement', start: 'top 75%' }
        });
        stmtTl.from('.f-statement-text', {
            opacity: 0, y: 50, filter: 'blur(16px)', duration: 1.3, ease: 'power4.out'
        }).from('.f-statement-img', {
            opacity: 0, x: 60, filter: 'blur(12px)', duration: 1.1, ease: 'power4.out'
        }, '-=0.8');

        // Parallax on statement image
        gsap.to('.f-statement-img img', {
            yPercent: -10,
            ease: 'none',
            scrollTrigger: {
                trigger: '.f-statement',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.5
            }
        });

        // Vision section
        gsap.from('.f-vision-text', {
            scrollTrigger: { trigger: '.f-vision', start: 'top 80%' },
            opacity: 0, y: 40, filter: 'blur(12px)', duration: 1.1, ease: 'power4.out'
        });

        // Campaign section — images cascade then text
        const campTl = gsap.timeline({
            scrollTrigger: { trigger: '.f-campaign', start: 'top 75%' }
        });
        campTl.from('.f-camp-img-box', {
            opacity: 0, y: 70, scale: 0.94, filter: 'blur(14px)',
            stagger: 0.15, duration: 1.1, ease: 'power4.out'
        }).from('.f-camp-text p', {
            opacity: 0, y: 30, filter: 'blur(8px)',
            stagger: 0.15, duration: 0.9, ease: 'power3.out'
        }, '-=0.6')
        .from('.f-camp-text h3', {
            opacity: 0, y: 20, filter: 'blur(8px)', duration: 0.9, ease: 'power3.out'
        }, '-=0.5');
    }

    /* =========================================================================
       INIT ALL
    ========================================================================= */
    window.addEventListener('DOMContentLoaded', () => {


        // Run all animations
        initHeroAnimations();
        setupScrollReveals();
        setupStatsAnimation();
        setupBrandsAnimation();
        setupCardsAnimation();
        setupCapacityAnimation();
        setupAboutAnimation();
        setupSustainabilityAnimation();
        setupCTAAnimation();
        setupMarqueeParallax();
        setupParallax();
        setupFrisokarAnimations();

        // Refresh ScrollTrigger after DOM is ready
        ScrollTrigger.refresh();
    });

})();
