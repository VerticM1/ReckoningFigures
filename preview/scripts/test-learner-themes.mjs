import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const dom=new JSDOM('<meta name="theme-color"><button id="anchor"></button><div id="dialog"></div>',{url:'https://reckoningfigures.com/preview/'});
const {document,localStorage}=dom.window;
const source=readFileSync('preview/learner-themes.js','utf8').replace('export function','function');
function boot(){return new Function('document','localStorage',source+';return mountThemePicker;')(document,localStorage);}
const mount=boot();mount(document.querySelector('#anchor'),html=>document.querySelector('#dialog').innerHTML=html);
document.querySelector('.appearance-button').click();document.querySelector('[data-palette="pink"]').click();
assert.equal(localStorage.getItem('rfLearnerTheme'),'pink');assert.equal(document.documentElement.style.getPropertyValue('--flame'),'#ff8fc5');assert.equal(document.querySelector('[data-palette="pink"]').getAttribute('aria-pressed'),'true');
boot();assert.equal(document.documentElement.dataset.learnerTheme,'pink');
document.querySelector('[data-palette="seasonal"]').click();assert.equal(document.documentElement.dataset.learnerTheme,'seasonal');assert.match(document.documentElement.style.getPropertyValue('--bg'),/^#[a-f0-9]{6}$/);
localStorage.setItem('rfLearnerTheme','invalid');boot();assert.equal(document.documentElement.dataset.learnerTheme,'original');dom.window.close();console.log('Themes passed: selection, pink flame, persistence, seasonal palette and invalid preference fallback.');
