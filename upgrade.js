const fs = require('fs');
const path = require('path');

const files = [
  'index.html',
  'buyers-and-sellers.html',
  'family-wealth-preservation.html',
  'mls-search.html'
];

const premiumCSS = `
    /* --- PREMIUM UPGRADES --- */
    ::selection {
      background: rgba(184, 139, 82, 0.2);
      color: var(--ink);
    }

    ::-webkit-scrollbar {
      width: 8px;
    }

    ::-webkit-scrollbar-track {
      background: var(--sand-soft);
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(184, 139, 82, 0.4);
      border-radius: 999px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(184, 139, 82, 0.6);
    }

    #scroll-progress {
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: 3px;
      background: linear-gradient(90deg, #c79b63, var(--gold));
      z-index: 1000;
      transition: width 0.1s ease-out;
    }

    @keyframes ambientShift {
      0% { background-position: 0% 0%; }
      50% { background-position: 100% 100%; }
      100% { background-position: 0% 0%; }
    }

    body {
      background-size: 200% 200%;
      animation: ambientShift 30s ease-in-out infinite;
    }

    .hero-photo {
      animation: kenBurns 20s ease-out infinite alternate;
      transform-origin: center;
    }

    @keyframes kenBurns {
      0% { transform: scale(1); }
      100% { transform: scale(1.05); }
    }

    .glow-card {
      position: relative;
    }

    .glow-card::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(184, 139, 82, 0.08), transparent 40%);
      opacity: 0;
      transition: opacity 0.5s ease;
      pointer-events: none;
      z-index: -1;
    }

    .glow-card:hover::before {
      opacity: 1;
    }
    /* ------------------------ */
  </style>
`;

const premiumJS = `
    // --- PREMIUM UPGRADES JS ---
    const scrollProgress = document.createElement('div');
    scrollProgress.id = 'scroll-progress';
    document.body.prepend(scrollProgress);

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.offsetHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      scrollProgress.style.width = scrollPercent * 100 + '%';
    });

    const glowCards = document.querySelectorAll('.hero-card, .service-card, .promise-card, .story-card, .contact-card, .lead-form, .pillar-card, .faq-card, .wealth-card');
    glowCards.forEach(card => {
      card.classList.add('glow-card');
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', \`\${x}px\`);
        card.style.setProperty('--mouse-y', \`\${y}px\`);
      });
    });
    // ---------------------------
  </script>
`;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add CSS before </style>
    if (!content.includes('/* --- PREMIUM UPGRADES --- */')) {
      content = content.replace('</style>', premiumCSS);
    }
    
    // Add JS before </body>
    if (!content.includes('// --- PREMIUM UPGRADES JS ---')) {
      content = content.replace('</body>', "<script>\n" + premiumJS + "\n</body>");
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Updated " + file);
  }
});
