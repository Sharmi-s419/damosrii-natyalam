import re
import sys

def main():
    try:
        with open('style.css', 'r', encoding='utf-8') as f:
            content = f.read()
            
        # 1. Truncate the file at the start of the old media queries
        marker = "/* ============================================\n   RESPONSIVE — TABLET (max 1024px)\n   ============================================ */"
        idx = content.find(marker)
        if idx == -1:
            print("Could not find marker")
            return
            
        base_css = content[:idx]
        old_media_css = content[idx:]
        
        # 2. Modify base styles to be mobile-first
        replacements = [
            # Root vars
            (r'--section-pad: 120px;', r'--section-pad: var(--section-pad-mobile, 70px);'),
            
            # Typography clamp()
            (r'\.section-title-left \{\n\s*font-family: var\(--font-display\);\n\s*font-size: 54px;',
             r'.section-title-left {\n    font-family: var(--font-display);\n    font-size: clamp(30px, 6vw, 54px);'),
            
            (r'\.hero-title \{\n\s*font-family: var\(--font-serif\);\n\s*font-size: 84px;',
             r'.hero-title {\n    font-family: var(--font-serif);\n    font-size: clamp(38px, 8vw, 84px);'),
             
            (r'\.hero-tagline \{\n\s*font-size: 28px;',
             r'.hero-tagline {\n    font-size: clamp(17px, 4vw, 28px);'),
            
            # Nav Menu
            (r'\.nav-menu \{\n\s*display: flex;\n\s*list-style: none;\n\s*gap: 35px;\n\s*align-items: center;\n\}',
             r'''.nav-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.98);
    backdrop-filter: blur(20px);
    justify-content: center;
    align-items: center;
    gap: 36px;
    z-index: 998;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
    list-style: none;
}
.nav-menu.active {
    opacity: 1;
    pointer-events: all;
}'''),

            (r'\.nav-link \{\n\s*color: rgba\(248, 245, 240, 0\.85\);\n\s*text-decoration: none;\n\s*font-weight: 500;\n\s*position: relative;\n\s*transition: var\(--transition\);\n\s*font-size: 13px;\n\s*letter-spacing: 0\.5px;\n\s*font-family: var\(--font-body\);\n\s*text-transform: uppercase;\n\}',
             r'''.nav-link {
    color: var(--color-background);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    transition: var(--transition);
    font-size: 24px;
    letter-spacing: 2px;
    font-family: var(--font-display);
    text-transform: capitalize;
}'''),

            (r'\.hamburger \{\n\s*display: none;', r'.hamburger {\n    display: flex;\n    margin-right: 16px;'),
            
            # Hero Content
            (r'\.hero-content \{\n\s*position: relative;\n\s*z-index: 3;\n\s*text-align: left;\n\s*color: var\(--color-background\);\n\s*animation: fadeIn 1s ease-out 0\.5s both;\n\s*display: flex;\n\s*flex-direction: column;\n\s*align-items: flex-start;\n\s*padding-left: 15%;\n\s*max-width: 700px;\n\}',
             r'''.hero-content {
    position: relative;
    z-index: 3;
    text-align: center;
    color: var(--color-background);
    animation: fadeIn 1s ease-out 0.5s both;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 24px;
    max-width: 100%;
    width: 100%;
}'''),
            (r'\.hero-buttons \{\n\s*display: flex;\n\s*gap: 30px;\n\s*justify-content: flex-start;\n\s*flex-wrap: wrap;\n\}',
             r'''.hero-buttons {
    display: flex;
    flex-direction: column;
    gap: 14px;
    align-items: center;
    width: 100%;
}'''),

            # Manifesto Grid
            (r'\.about-manifesto-grid \{\n\s*display: grid;\n\s*grid-template-columns: 1fr auto 1fr auto 1fr;',
             r'.about-manifesto-grid {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 40px;'),
            (r'\.about-manifesto-divider \{\n\s*width: 1px;',
             r'.about-manifesto-divider {\n    display: none;\n    width: 1px;'),
             
            # Features Grid
            (r'\.features-list \{\n\s*display: grid;\n\s*grid-template-columns: 1fr 1fr;\n\s*gap: 0;\n\}',
             r'.features-list {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 0;\n}'),
            (r'\.feature-item \{\n\s*display: flex;\n\s*align-items: flex-start;\n\s*gap: 24px;\n\s*padding: 36px 40px;\n\s*border-bottom: 1px solid rgba\(212, 175, 55, 0\.08\);\n\s*border-right: 1px solid rgba\(212, 175, 55, 0\.08\);',
             r'.feature-item {\n    display: flex;\n    align-items: flex-start;\n    gap: 24px;\n    padding: 28px 20px;\n    border-bottom: 1px solid rgba(212, 175, 55, 0.08);\n    border-right: none;'),
            
            # Classes Panel & Accordion
            (r'\.classes-panel \{\n\s*display: grid;\n\s*grid-template-columns: 260px 1fr;',
             r'.classes-panel {\n    display: none;\n    grid-template-columns: 260px 1fr;'),
            (r'\.classes-accordion \{\n\s*display: none;\n\}',
             r'.classes-accordion {\n    display: block;\n}'),
            
            # Gallery
            (r'\.gallery-categories \{\n\s*display: grid;\n\s*grid-template-columns: repeat\(3, 1fr\);',
             r'.gallery-categories {\n    display: grid;\n    grid-template-columns: 1fr;'),
            (r'\.category-card--featured \{\n\s*grid-column: span 2;\n\s*grid-row: span 2;',
             r'.category-card--featured {\n    grid-column: span 1;\n    grid-row: span 1;'),
             
            # Stats Strip
            (r'\.stats-strip-inner \{\n\s*display: grid;\n\s*grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;',
             r'.stats-strip-inner {\n    display: grid;\n    grid-template-columns: 1fr 1fr;\n    gap: 0;'),
            (r'\.stat-divider \{\n\s*width: 1px;',
             r'.stat-divider {\n    display: none;\n    width: 1px;'),
             
            # Achievements
            (r'\.achievements-editorial \{\n\s*display: grid;\n\s*grid-template-columns: 1fr 1fr;',
             r'.achievements-editorial {\n    display: grid;\n    grid-template-columns: 1fr;'),
             
            # Footer
            (r'\.footer-grid \{\n\s*display: grid;\n\s*grid-template-columns: 2fr 1fr 1fr 1\.2fr;\n\s*gap: 60px;\n\s*padding: 60px 0 50px;\n\}',
             r'.footer-grid {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 36px;\n    padding: 50px 0 40px;\n}'),
             
            # Images grid (gallery)
            (r'\.images-grid \{\n\s*columns: 3;\n\s*column-gap: 20px;',
             r'.images-grid {\n    columns: 1;\n    column-gap: 10px;'),
             
            # Contact Grid
            (r'\.contact-grid \{\n\s*display: grid;\n\s*grid-template-columns: 1\.2fr 1fr;\n\s*gap: 80px;\n\s*align-items: start;\n\}',
             r'.contact-grid {\n    display: grid;\n    grid-template-columns: 1fr;\n    gap: 50px;\n    align-items: start;\n}'),
             
             # Testimonial Quotes
            (r'\.testimonial-quote-mark \{\n\s*position: absolute;\n\s*top: -40px;\n\s*left: -20px;\n\s*font-family: var\(--font-display\);\n\s*font-size: 180px;',
             r'.testimonial-quote-mark {\n    position: absolute;\n    top: -40px;\n    left: 0;\n    font-family: var(--font-display);\n    font-size: 120px;'),
        ]
        
        for old, new in replacements:
            base_css = re.sub(old, new, base_css)
            
        # 3. Create the new Desktop Media Queries
        desktop_css = """
/* ============================================
   RESPONSIVE — MIN 768px (TABLET)
   ============================================ */
@media (min-width: 768px) {
    :root {
        --section-pad: 90px;
    }
    .hamburger { display: none; }
    .nav-menu {
        position: static;
        flex-direction: row;
        background: transparent;
        backdrop-filter: none;
        gap: 35px;
        opacity: 1;
        pointer-events: all;
    }
    .nav-link {
        font-size: 13px;
        letter-spacing: 0.5px;
        font-family: var(--font-body);
        text-transform: uppercase;
    }
    .hero-content {
        text-align: left;
        align-items: flex-start;
        padding-left: 15%;
        max-width: 700px;
    }
    .hero-buttons {
        flex-direction: row;
        gap: 30px;
        width: auto;
    }
    .features-list { grid-template-columns: 1fr 1fr; }
    .gallery-categories { grid-template-columns: 1fr 1fr; }
    .category-card--featured { grid-column: span 2; grid-row: span 1; }
    .stats-strip-inner { grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr; }
    .stat-divider { display: block; }
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 40px; }
    .images-grid { columns: 2; column-gap: 20px; }
    .testimonial-quote-mark { left: -20px; font-size: 150px; }
}

/* ============================================
   RESPONSIVE — MIN 1024px (LAPTOP / DESKTOP)
   ============================================ */
@media (min-width: 1024px) {
    :root {
        --section-pad: 120px;
    }
    .about-manifesto-grid { grid-template-columns: 1fr auto 1fr auto 1fr; gap: 0; }
    .about-manifesto-divider { display: block; }
    .feature-item { border-right: 1px solid rgba(212, 175, 55, 0.08); padding: 36px 40px; }
    .feature-item:nth-child(2n) { border-right: none; }
    .classes-panel { display: grid; }
    .classes-accordion { display: none; }
    .gallery-categories { grid-template-columns: repeat(3, 1fr); }
    .category-card--featured { grid-column: span 2; grid-row: span 2; }
    .achievements-editorial { grid-template-columns: 1fr 1fr; }
    .footer-grid { grid-template-columns: 2fr 1fr 1fr 1.2fr; gap: 60px; }
    .images-grid { columns: 3; }
    .contact-grid { grid-template-columns: 1.2fr 1fr; gap: 80px; }
    .testimonial-quote-mark { font-size: 180px; }
}

/* ============================================
   RESPONSIVE — MIN 1440px (LARGE DESKTOP)
   ============================================ */
@media (min-width: 1440px) {
    .container { max-width: 1320px; }
}

/* WhatsApp Z-Index Fix */
.whatsapp-button { z-index: 9999; }
"""

        with open('style.css', 'w', encoding='utf-8') as f:
            f.write(base_css + desktop_css)
            
        print("CSS successfully refactored to Mobile-First!")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
