// Инлайн-иконки (stroke = currentColor).

const svg = (body, size = 24) =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  logo: `<svg viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    <rect width="64" height="64" rx="18" fill="var(--primary)"/>
    <path d="M16 20a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H29l-8 7v-7h1a6 6 0 0 1-6-6z" fill="#fff"/>
    <text x="32" y="34.5" text-anchor="middle" font-family="Onest, Inter, Arial, sans-serif" font-size="15" font-weight="800" fill="var(--primary)">En</text>
  </svg>`,
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', 28),
  target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>', 28),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  home: svg('<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>', 22),
  arrowRight: svg('<path d="M5 12h14M13 6l6 6-6 6"/>', 20),
  minus: svg('<path d="M5 12h14"/>', 22),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 22),
  shuffle: svg('<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>', 20),
  sound: svg('<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>', 22),
  sparkle: svg('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>', 28),
};
