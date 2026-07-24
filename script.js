document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const marcasDropdown = document.querySelector('.marcas-dropdown');
    const marcasLink = marcasDropdown?.querySelector(':scope > a');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        document.querySelectorAll('video[autoplay]').forEach((video) => {
            video.removeAttribute('autoplay');
            video.pause();
        });
    }

    if (!mobileMenuToggle || !mainNav) {
        return;
    }

    const menuIcon = mobileMenuToggle.querySelector('i');

    const setBrandsOpen = (isOpen) => {
        if (!marcasDropdown || !marcasLink) {
            return;
        }

        marcasDropdown.classList.toggle('mobile-open', isOpen);
        marcasLink.setAttribute('aria-expanded', String(isOpen));
    };

    const setMenuOpen = (isOpen, returnFocus = false) => {
        mainNav.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

        if (menuIcon) {
            menuIcon.classList.toggle('fa-bars', !isOpen);
            menuIcon.classList.toggle('fa-times', isOpen);
        }

        if (!isOpen) {
            setBrandsOpen(false);
            if (returnFocus) {
                mobileMenuToggle.focus();
            }
            return;
        }

        window.requestAnimationFrame(() => {
            mainNav.querySelector('a')?.focus();
        });
    };

    mobileMenuToggle.addEventListener('click', () => {
        setMenuOpen(!mainNav.classList.contains('active'));
    });

    marcasLink?.addEventListener('click', (event) => {
        if (window.innerWidth <= 1170) {
            event.preventDefault();
            setBrandsOpen(!marcasDropdown.classList.contains('mobile-open'));
        }
    });

    marcasDropdown?.addEventListener('focusin', () => {
        if (window.innerWidth > 1170) {
            marcasLink?.setAttribute('aria-expanded', 'true');
        }
    });

    marcasDropdown?.addEventListener('focusout', () => {
        window.requestAnimationFrame(() => {
            if (window.innerWidth > 1170 && !marcasDropdown.contains(document.activeElement)) {
                marcasLink?.setAttribute('aria-expanded', 'false');
            }
        });
    });

    mainNav.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (link && link !== marcasLink && window.innerWidth <= 1170) {
            setMenuOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mainNav.classList.contains('active')) {
            setMenuOpen(false, true);
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 1170 && mainNav.classList.contains('active')) {
            setMenuOpen(false);
        }
    });
});
