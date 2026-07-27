document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const marcasDropdown = document.querySelector('.marcas-dropdown');
    const marcasLink = marcasDropdown?.querySelector(':scope > a');
    const languageSwitchers = document.querySelectorAll('.language-switcher');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportedLanguages = ['pt-BR', 'en', 'es', 'it'];
    const languageNames = {
        'pt-BR': 'Português',
        en: 'English',
        es: 'Español',
        it: 'Italiano'
    };

    let selectedLanguage = 'pt-BR';
    try {
        const savedLanguage = window.localStorage.getItem('fk-selected-language');
        if (supportedLanguages.includes(savedLanguage)) {
            selectedLanguage = savedLanguage;
        }
    } catch (error) {
        // The selector still works when storage is blocked by the browser.
    }

    const setLanguageMenuOpen = (switcher, isOpen, focusOption = false) => {
        const trigger = switcher?.querySelector('.language-trigger');
        const menu = switcher?.querySelector('.language-menu');
        if (!trigger || !menu) {
            return;
        }

        switcher.classList.toggle('is-open', isOpen);
        trigger.setAttribute('aria-expanded', String(isOpen));
        window.dispatchEvent(new CustomEvent('fk:language-menu-toggle', {
            detail: { open: isOpen }
        }));

        if (isOpen && focusOption) {
            window.requestAnimationFrame(() => {
                const activeOption = menu.querySelector('.language-option.is-active');
                (activeOption || menu.querySelector('.language-option'))?.focus();
            });
        }
    };

    const closeLanguageMenus = (returnFocus = false) => {
        languageSwitchers.forEach((switcher) => {
            const wasOpen = switcher.classList.contains('is-open');
            setLanguageMenuOpen(switcher, false);
            if (wasOpen && returnFocus) {
                switcher.querySelector('.language-trigger')?.focus();
            }
        });
    };

    const updateLanguageSelection = (languageCode) => {
        if (!supportedLanguages.includes(languageCode)) {
            return;
        }

        selectedLanguage = languageCode;
        document.documentElement.dataset.selectedLanguage = languageCode;

        languageSwitchers.forEach((switcher) => {
            const trigger = switcher.querySelector('.language-trigger');
            switcher.querySelectorAll('.language-option').forEach((option) => {
                const isSelected = option.dataset.language === languageCode;
                option.classList.toggle('is-active', isSelected);
                option.setAttribute('aria-checked', String(isSelected));
            });

            trigger?.setAttribute(
                'aria-label',
                `Idioma selecionado: ${languageNames[languageCode]}. Alterar idioma`
            );
        });
    };

    updateLanguageSelection(selectedLanguage);

    languageSwitchers.forEach((switcher) => {
        const trigger = switcher.querySelector('.language-trigger');
        const menu = switcher.querySelector('.language-menu');
        const options = Array.from(switcher.querySelectorAll('.language-option'));

        trigger?.addEventListener('click', () => {
            const willOpen = !switcher.classList.contains('is-open');
            closeLanguageMenus();
            setLanguageMenuOpen(switcher, willOpen);
        });

        trigger?.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setLanguageMenuOpen(switcher, true, true);
            }
        });

        options.forEach((option) => {
            option.addEventListener('click', () => {
                const languageCode = option.dataset.language;
                updateLanguageSelection(languageCode);

                try {
                    window.localStorage.setItem('fk-selected-language', languageCode);
                } catch (error) {
                    // Keep the current selection for this page when storage is unavailable.
                }

                setLanguageMenuOpen(switcher, false);
                trigger?.focus();
                window.dispatchEvent(new CustomEvent('fk:language-change', {
                    detail: { language: languageCode }
                }));
            });
        });

        menu?.addEventListener('keydown', (event) => {
            const currentIndex = options.indexOf(document.activeElement);
            let nextIndex = currentIndex;

            if (event.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % options.length;
            } else if (event.key === 'ArrowUp') {
                nextIndex = (currentIndex - 1 + options.length) % options.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = options.length - 1;
            } else if (event.key === 'Escape') {
                event.preventDefault();
                setLanguageMenuOpen(switcher, false);
                trigger?.focus();
                return;
            } else {
                return;
            }

            event.preventDefault();
            options[nextIndex]?.focus();
        });
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.language-switcher')) {
            closeLanguageMenus();
        }
    });

    if (prefersReducedMotion) {
        document.querySelectorAll('video[autoplay]').forEach((video) => {
            video.removeAttribute('autoplay');
            video.pause();
        });
    }

    const cookieConsentKey = 'fk-cookie-consent-v1';
    let cookieConsentAccepted = false;

    try {
        cookieConsentAccepted = window.localStorage.getItem(cookieConsentKey) === 'accepted';
    } catch (error) {
        // The notice remains functional when browser storage is unavailable.
    }

    if (!cookieConsentAccepted) {
        const cookieNotice = document.createElement('aside');
        cookieNotice.className = 'cookie-notice';
        cookieNotice.setAttribute('role', 'region');
        cookieNotice.setAttribute('aria-labelledby', 'cookie-notice-title');
        cookieNotice.setAttribute('aria-describedby', 'cookie-notice-description');
        cookieNotice.innerHTML = `
            <div class="cookie-notice__copy">
                <span class="cookie-notice__eyebrow">Privacidade</span>
                <h2 id="cookie-notice-title">Uma experiência do seu jeito.</h2>
                <p id="cookie-notice-description">
                    Usamos cookies essenciais para lembrar suas preferências e tornar sua navegação mais fluida.
                </p>
            </div>
            <button class="cookie-notice__accept" type="button">
                <span>Aceitar</span>
                <span class="cookie-notice__accept-icon" aria-hidden="true">→</span>
            </button>
        `;

        document.body.appendChild(cookieNotice);

        window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
                cookieNotice.classList.add('is-visible');
            });
        });

        cookieNotice.querySelector('.cookie-notice__accept')?.addEventListener('click', () => {
            try {
                window.localStorage.setItem(cookieConsentKey, 'accepted');
            } catch (error) {
                // Closing the notice still works for the current page.
            }

            cookieNotice.classList.remove('is-visible');
            cookieNotice.classList.add('is-leaving');

            window.setTimeout(() => {
                cookieNotice.remove();
            }, prefersReducedMotion ? 0 : 450);
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
        if (isOpen) {
            window.dispatchEvent(new CustomEvent('fk:mobile-menu-toggle', {
                detail: { open: true }
            }));
        }

        mainNav.classList.toggle('active', isOpen);
        document.body.classList.toggle('menu-open', isOpen);
        mobileMenuToggle.setAttribute('aria-expanded', String(isOpen));
        mobileMenuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');

        if (!isOpen) {
            window.dispatchEvent(new CustomEvent('fk:mobile-menu-toggle', {
                detail: { open: false }
            }));
        }

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
        closeLanguageMenus();
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
        if (event.key === 'Escape') {
            closeLanguageMenus(true);
            if (mainNav.classList.contains('active')) {
                setMenuOpen(false, true);
            }
        }
    });

    window.addEventListener('resize', () => {
        closeLanguageMenus();
        if (window.innerWidth > 1170 && mainNav.classList.contains('active')) {
            setMenuOpen(false);
        }
    });

    window.addEventListener('pageshow', (event) => {
        if (!event.persisted) {
            return;
        }
        closeLanguageMenus();
        setMenuOpen(false);
    });
});
