import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Имя репозитория на GitHub Pages: https://popovdk.github.io/English-trainer/
const base = process.env.BASE_PATH ?? '/English-trainer/';

// Общие теги <head> для всех страниц: иконки, манифест, режим «на экран Домой» в Safari.
function sharedHead() {
  return {
    name: 'shared-head',
    transformIndexHtml() {
      const meta = (name, content) => ({ tag: 'meta', attrs: { name, content }, injectTo: 'head' });
      const link = (attrs) => ({ tag: 'link', attrs, injectTo: 'head' });
      return [
        meta('theme-color', '#ffffff'),
        meta('apple-mobile-web-app-capable', 'yes'),
        meta('mobile-web-app-capable', 'yes'),
        meta('apple-mobile-web-app-status-bar-style', 'default'),
        meta('apple-mobile-web-app-title', 'English'),
        meta('application-name', 'English Trainer'),
        link({ rel: 'icon', href: `${base}favicon.svg`, type: 'image/svg+xml' }),
        link({ rel: 'icon', href: `${base}favicon-32.png`, sizes: '32x32', type: 'image/png' }),
        link({ rel: 'apple-touch-icon', href: `${base}apple-touch-icon.png` }),
        link({ rel: 'manifest', href: `${base}manifest.webmanifest` }),
        link({ rel: 'preconnect', href: 'https://fonts.googleapis.com' }),
        link({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }),
        link({
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700;800&display=swap',
        }),
      ];
    },
  };
}

export default defineConfig({
  base,
  plugins: [sharedHead()],
  build: {
    rolldownOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        time: resolve(import.meta.dirname, 'time/index.html'),
        timeQuiz: resolve(import.meta.dirname, 'time-quiz/index.html'),
      },
    },
  },
});
