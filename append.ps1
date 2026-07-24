$css = @"

/* ==========================================================================
   FULL SCREEN LAYOUT & HEADER ENHANCEMENTS
   ========================================================================== */

/* Make Header taller */
.glass-header {
    padding: 30px 0 !important;
}
.header-container {
    min-height: 80px !important;
}
.logo img {
    max-height: 55px !important;
    transition: all 0.3s ease;
}

/* Make Sections Full Screen (100vh) */
.home-stats-section, 
.home-brands-section, 
.home-solutions-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.home-capacity-section, 
.home-about-section,
.home-sustainability-section {
    min-height: 100vh;
}

/* Adjust inner containers to handle vertical centering perfectly */
.home-stats-container,
.home-solutions-container {
    width: 100%;
}

/* For brands section, group header and logos */
.home-brands-section {
    justify-content: center;
}

/* For capacity and about sections which are row-flex */
.home-capacity-section, 
.home-about-section {
    align-items: center; 
}
"@
Add-Content -Path 'home-redesign.css' -Value $css -Encoding UTF8
