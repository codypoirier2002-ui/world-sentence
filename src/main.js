import './style.css';
import { App } from './app.js';

function boot() {
  try {
    window.app = new App();
  } catch (err) {
    console.error(err);
    const note = document.getElementById('title-note');
    if (note) note.textContent = 'This browser could not start 3D (WebGL2 is needed).';
  }
}
boot();
