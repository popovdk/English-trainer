import './styles/main.css';
import { renderHeader } from './components/header.js';

/** Общая инициализация страницы. */
export function initPage(activeId) {
  renderHeader(document.getElementById('app-header'), activeId);

  if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    const base = import.meta.env.BASE_URL;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {});
    });
  }
}
