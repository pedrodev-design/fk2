document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const marcasDropdown = document.querySelector('.marcas-dropdown');
    const marcasLink = marcasDropdown?.querySelector(':scope > a');
    const languageSwitchers = document.querySelectorAll('.language-switcher');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportedLanguages = ['pt-BR'];
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
        const options = Array.from(switcher.querySelectorAll('.language-option:not(:disabled)'));

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
    } else if ('IntersectionObserver' in window) {
        const autoplayVideos = document.querySelectorAll('video[autoplay]');
        const autoplayObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                const video = entry.target;
                if (entry.isIntersecting) {
                    video.play().catch(() => {
                        // Browsers may still defer autoplay; muted video remains usable.
                    });
                } else {
                    video.pause();
                }
            });
        }, {
            rootMargin: '180px 0px',
            threshold: 0.01
        });

        autoplayVideos.forEach((video) => autoplayObserver.observe(video));
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
                    Consulte nossa <a href="https://fkgrupo.com/politica-de-privacidade/" target="_blank"
                        rel="noopener">Política de Privacidade</a>.
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

    const normalizeSearchText = (value) => value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR')
        .trim();

    const searchableElements = Array.from(document.querySelectorAll(
        'main h1, main h2, main h3, main h4, main p, main .home-section-label, main .f-label'
    ));

    document.querySelectorAll('.search-bar input').forEach((input) => {
        input.addEventListener('input', () => input.setCustomValidity(''));
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') {
                return;
            }

            event.preventDefault();
            const query = normalizeSearchText(input.value);
            if (!query) {
                input.setCustomValidity('Digite um termo para pesquisar.');
                input.reportValidity();
                return;
            }

            const match = searchableElements.find((element) =>
                element.offsetParent !== null &&
                normalizeSearchText(element.textContent || '').includes(query)
            );

            if (!match) {
                input.setCustomValidity('Nenhum resultado encontrado nesta página.');
                input.reportValidity();
                return;
            }

            input.setCustomValidity('');
            match.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'center'
            });
            match.classList.remove('search-result-focus');
            window.requestAnimationFrame(() => match.classList.add('search-result-focus'));
            window.setTimeout(() => match.classList.remove('search-result-focus'), 1300);
        });
    });

    const historyViewport = document.querySelector('.home-history-viewport');
    const historyItems = Array.from(document.querySelectorAll('.home-history-item'));
    const historyPrevious = document.querySelector('.home-history-prev');
    const historyNext = document.querySelector('.home-history-next');
    const historyCount = document.querySelector('.home-history-count');
    const historyProgress = document.querySelector('.home-history-progress span');

    if (historyViewport && historyItems.length) {
        let historyActiveIndex = 0;
        let historyFrame = 0;
        let historyDragging = false;
        let historyDragStartX = 0;
        let historyDragStartScroll = 0;
        let historyDragged = false;

        const scrollToHistoryItem = (index) => {
            const nextIndex = Math.max(0, Math.min(historyItems.length - 1, index));
            historyViewport.scrollTo({
                left: historyItems[nextIndex].offsetLeft,
                behavior: prefersReducedMotion ? 'auto' : 'smooth'
            });
        };

        const updateHistoryState = () => {
            historyFrame = 0;
            const viewportLeft = historyViewport.getBoundingClientRect().left;
            let closestDistance = Number.POSITIVE_INFINITY;
            let closestIndex = 0;

            historyItems.forEach((item, index) => {
                const distance = Math.abs(item.getBoundingClientRect().left - viewportLeft);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            historyActiveIndex = closestIndex;
            historyItems.forEach((item, index) => {
                item.classList.toggle('is-active', index === historyActiveIndex);
            });

            historyPrevious?.toggleAttribute('disabled', historyActiveIndex === 0);
            historyNext?.toggleAttribute('disabled', historyActiveIndex === historyItems.length - 1);

            if (historyCount) {
                historyCount.textContent =
                    `${historyActiveIndex + 1} de ${historyItems.length}`;
            }

            if (historyProgress) {
                historyProgress.style.width = `${((historyActiveIndex + 1) / historyItems.length) * 100}%`;
            }
        };

        const requestHistoryUpdate = () => {
            if (!historyFrame) {
                historyFrame = window.requestAnimationFrame(updateHistoryState);
            }
        };

        historyPrevious?.addEventListener('click', () => {
            scrollToHistoryItem(historyActiveIndex - 1);
        });

        historyNext?.addEventListener('click', () => {
            scrollToHistoryItem(historyActiveIndex + 1);
        });

        historyViewport.addEventListener('scroll', requestHistoryUpdate, { passive: true });
        historyViewport.addEventListener('pointerdown', (event) => {
            if (event.pointerType !== 'mouse' || event.button !== 0) {
                return;
            }

            historyDragging = true;
            historyDragged = false;
            historyDragStartX = event.clientX;
            historyDragStartScroll = historyViewport.scrollLeft;
            historyViewport.classList.add('is-dragging');
            historyViewport.setPointerCapture?.(event.pointerId);
        });

        historyViewport.addEventListener('pointermove', (event) => {
            if (!historyDragging) {
                return;
            }

            const distance = event.clientX - historyDragStartX;
            if (Math.abs(distance) > 4) {
                historyDragged = true;
            }
            historyViewport.scrollLeft = historyDragStartScroll - distance;
        });

        const finishHistoryDrag = (event) => {
            if (!historyDragging) {
                return;
            }

            historyDragging = false;
            historyViewport.classList.remove('is-dragging');
            if (historyViewport.hasPointerCapture?.(event.pointerId)) {
                historyViewport.releasePointerCapture(event.pointerId);
            }
            updateHistoryState();

            if (historyDragged) {
                scrollToHistoryItem(historyActiveIndex);
            }
        };

        historyViewport.addEventListener('pointerup', finishHistoryDrag);
        historyViewport.addEventListener('pointercancel', finishHistoryDrag);
        historyViewport.addEventListener('dragstart', (event) => event.preventDefault());
        historyViewport.addEventListener('wheel', (event) => {
            const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
                ? event.deltaX
                : event.deltaY;
            const maxScroll = historyViewport.scrollWidth - historyViewport.clientWidth;
            const canMoveBack = delta < 0 && historyViewport.scrollLeft > 1;
            const canMoveForward = delta > 0 && historyViewport.scrollLeft < maxScroll - 1;

            if (Math.abs(delta) < 2 || (!canMoveBack && !canMoveForward)) {
                return;
            }

            event.preventDefault();
            historyViewport.scrollLeft += delta;
        }, { passive: false });
        historyViewport.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                scrollToHistoryItem(historyActiveIndex + 1);
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault();
                scrollToHistoryItem(historyActiveIndex - 1);
            } else if (event.key === 'Home') {
                event.preventDefault();
                scrollToHistoryItem(0);
            } else if (event.key === 'End') {
                event.preventDefault();
                scrollToHistoryItem(historyItems.length - 1);
            }
        });

        window.addEventListener('resize', requestHistoryUpdate);
        window.addEventListener('pageshow', requestHistoryUpdate);
        window.setTimeout(requestHistoryUpdate, 120);
        updateHistoryState();
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
        if (event.key === 'Tab' && mainNav.classList.contains('active')) {
            const focusableElements = [mobileMenuToggle, ...mainNav.querySelectorAll('a, button')]
                .filter((element) => {
                    const styles = window.getComputedStyle(element);
                    return !element.hasAttribute('disabled') &&
                        styles.display !== 'none' &&
                        styles.visibility !== 'hidden';
                });

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstFocusable) {
                event.preventDefault();
                lastFocusable?.focus();
            } else if (!event.shiftKey && document.activeElement === lastFocusable) {
                event.preventDefault();
                firstFocusable?.focus();
            }
        }

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
