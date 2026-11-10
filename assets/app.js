/* Séances du mois de Ramadân — script commun à toutes les pages */
(function(){
'use strict';
const TOC = window.TOC || [];
const K = 'majalis-ramadan-v1';
const ROOT = document.body.dataset.root || '';
const CUR = document.body.dataset.id || 'accueil';
const S = (() => { let d = {}; try { d = JSON.parse(localStorage.getItem(K) || '{}'); } catch (e) {} return Object.assign({read:{}, pos:{}, bm:[], theme:null, fs:19, last:null}, d); })();
function save(){ try { localStorage.setItem(K, JSON.stringify(S)); } catch (e) {} }
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const url = id => ROOT + 'chapitres/' + id + '.html';
const BMI = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
const BMF = '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
function toast(t){ const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(e._t); e._t = setTimeout(() => e.classList.remove('on'), 1800); }

/* thème & taille du texte */
function applyTheme(){ const t = S.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); document.documentElement.dataset.theme = t; $('#bTheme').innerHTML = t === 'dark' ? SUN : MOON; }
function applyFs(){ document.documentElement.style.setProperty('--fs', S.fs + 'px'); }
$('#bTheme').onclick = () => { S.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; save(); applyTheme(); };
$('#fPlus').onclick = () => { S.fs = Math.min(26, S.fs + 1); save(); applyFs(); };
$('#fMinus').onclick = () => { S.fs = Math.max(15, S.fs - 1); save(); applyFs(); };

/* sommaire */
function buildToc(){
  const parts = {1:'Partie I — Les séances (Majâlis)', 2:'Partie II — Ithâf Ahl al-Îmân'}; let h = '', cur = 0;
  const bmset = new Set(S.bm.map(b => b.c));
  TOC.forEach(c => {
    if (c.part !== cur) { cur = c.part; h += `<h5>${parts[cur]}</h5>`; }
    h += `<a class="it${c.id === CUR ? ' cur' : ''}" href="${url(c.id)}" data-id="${c.id}" data-s="${(c.label + ' ' + c.title).toLowerCase()}"><span class="n">${c.label}</span><span class="t">${c.title}${bmset.has(c.id) ? ' <span class="bm">🔖</span>' : ''}</span><span class="st">${S.read[c.id] ? '✓' : ''}</span></a>`;
  });
  $('#toc').innerHTML = h;
  const q = $('#q').value; if (q) $('#q').oninput({target: $('#q')});
}
$('#q').oninput = e => { const v = e.target.value.toLowerCase().trim(); $$('#toc a.it').forEach(a => a.style.display = !v || a.dataset.s.includes(v) ? '' : 'none'); };
function progress(){
  const n = TOC.filter(c => S.read[c.id]).length, p = TOC.length ? Math.round(100 * n / TOC.length) : 0;
  $('#progTxt').textContent = p + ' %'; $('#progBar').style.width = p + '%'; $('#progCnt').textContent = `${n} / ${TOC.length} chapitres lus`;
  $('#bmCount').textContent = S.bm.length || '';
  const r = $('#bResume'); if (r) r.textContent = S.last ? 'Reprendre la lecture' : 'Commencer la lecture';
}
function setReadBtn(){ const b = $('.mark-read'); if (!b) return; const r = !!S.read[CUR]; b.classList.toggle('on', r); b.textContent = r ? '✓ Lu' : '✓ Marquer comme lu'; }

/* lecture : position, barre de progression, marquage automatique */
let tick = 0, lock = CUR !== 'accueil';
function onScroll(){
  if (lock) return;
  const d = document.documentElement, max = d.scrollHeight - innerHeight, p = max > 0 ? scrollY / max : 1;
  $('#pbar').style.width = (CUR === 'accueil' ? 0 : Math.round(p * 100)) + '%';
  if (CUR !== 'accueil') {
    S.pos[CUR] = scrollY;
    if (p > .97 && !S.read[CUR] && max > 200) { S.read[CUR] = 1; setReadBtn(); buildToc(); progress(); toast('Chapitre marqué comme lu'); }
    clearTimeout(tick); tick = setTimeout(save, 300);
  }
}
addEventListener('scroll', onScroll, {passive:true});
function flash(id){ const t = document.getElementById(id); if (!t) return false; t.scrollIntoView({behavior:'instant', block:'center'}); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1700); return true; }
if (CUR !== 'accueil') {
  S.last = CUR; save();
  history.scrollRestoration = 'manual';
  const go = () => { const h = decodeURIComponent(location.hash.slice(1)); if (!(h && flash(h))) scrollTo(0, S.pos[CUR] || 0); setTimeout(() => { lock = false; onScroll(); }, 150); };
  if (document.readyState === 'complete') setTimeout(go, 30); else addEventListener('load', () => setTimeout(go, 30));
  addEventListener('hashchange', () => { const h = decodeURIComponent(location.hash.slice(1)); if (h) flash(h); });
}
document.addEventListener('click', e => {
  const b = e.target.closest('.mark-read');
  if (b) { if (S.read[CUR]) delete S.read[CUR]; else S.read[CUR] = 1; save(); setReadBtn(); buildToc(); progress(); }
});
const res = $('#bResume'); if (res) res.onclick = () => { location.href = url(S.last || TOC[0].id); };

/* réinitialisation */
$('#bReset').onclick = () => $('#modal').classList.add('open');
$('#mNo').onclick = () => $('#modal').classList.remove('open');
$('#mYes').onclick = () => {
  S.read = {}; S.pos = {}; S.last = null;
  if ($('#alsoBm').checked) { S.bm = []; refreshBm(); }
  save(); $('#modal').classList.remove('open'); setReadBtn(); buildToc(); progress(); toast('Progression réinitialisée');
};

/* marque-pages */
const chapOf = id => TOC.find(c => c.id === id);
function excerpt(el){ const t = (el.querySelector('p') || el).innerText.replace(/\s+/g, ' ').replace(/^(Texte arabe|Traduction française)\s*/, '').trim(); return t.length > 170 ? t.slice(0, 170) + '…' : t; }
const isBm = a => S.bm.some(b => b.a === a);
function toggleBm(a, c, x){ const i = S.bm.findIndex(b => b.a === a); if (i >= 0) { S.bm.splice(i, 1); toast('Marque-page retiré'); } else { S.bm.unshift({a, c, x, t: Date.now()}); toast('Marque-page ajouté'); } save(); refreshBm(); }
function refreshBm(){
  $$('.bmk').forEach(b => { const on = isBm(b.dataset.a); b.classList.toggle('on', on); b.innerHTML = on ? BMF : BMI; b.parentElement.classList.toggle('marked', on); });
  const L = $('#bmList');
  if (!S.bm.length) L.innerHTML = '<div class="empty">Aucun marque-page pour l’instant.<br>Survolez ou touchez un paragraphe puis cliquez sur l’icône 🔖, ou utilisez le bouton du haut pour marquer tout un chapitre.</div>';
  else L.innerHTML = S.bm.map((b, i) => { const c = chapOf(b.c) || {label:'', title:''}; return `<div class="bmi" data-a="${b.a}" data-c="${b.c}"><div class="c">${c.label} — ${c.title}</div><div class="x">${b.x.replace(/</g, '&lt;')}</div><div class="d"><span>${new Date(b.t).toLocaleDateString('fr-FR')}</span><button data-del="${i}">Supprimer</button></div></div>`; }).join('');
  updChapBm(); progress(); buildToc();
}
function updChapBm(){ const b = $('#bChapBm'); if (CUR === 'accueil') { b.style.visibility = 'hidden'; return; } const on = isBm(CUR); b.innerHTML = on ? BMF : BMI; b.style.color = on ? 'var(--accent2)' : ''; }
$('#bChapBm').onclick = () => { if (CUR === 'accueil') return; toggleBm(CUR, CUR, 'Chapitre entier : ' + chapOf(CUR).title); };
$('#bmList').onclick = e => {
  const d = e.target.closest('[data-del]');
  if (d) { e.stopPropagation(); S.bm.splice(+d.dataset.del, 1); save(); refreshBm(); return; }
  const it = e.target.closest('.bmi'); if (!it) return;
  $('#drawer').classList.remove('open');
  const a = it.dataset.a, c = it.dataset.c;
  if (c === CUR) { if (a === c) scrollTo(0, 0); else { history.replaceState(null, '', '#' + a); flash(a); } }
  else location.href = url(c) + (a === c ? '' : '#' + a);
};
const openBm = () => $('#drawer').classList.toggle('open');
$('#bBm').onclick = openBm; const b2 = $('#bBm2'); if (b2) b2.onclick = openBm;
$('#bClose').onclick = () => $('#drawer').classList.remove('open');
$('#bMenu').onclick = () => document.body.classList.toggle('nav');
$('#scrim').onclick = () => document.body.classList.remove('nav');
$('#tHome').onclick = () => { location.href = ROOT + 'index.html'; };

/* bouton de marque-page sur chaque bloc */
$$('.chap .cbody>[id]').forEach(el => {
  const b = document.createElement('button'); b.className = 'bmk'; b.dataset.a = el.id; b.title = 'Marque-page'; b.innerHTML = BMI;
  b.onclick = ev => { ev.stopPropagation(); toggleBm(el.id, CUR, excerpt(el)); }; el.prepend(b);
});

applyTheme(); applyFs(); setReadBtn(); refreshBm();
const c = $('#toc .cur'), sd = $('#side'); if (c) sd.scrollTop = c.offsetTop - sd.clientHeight / 2;
})();

/* fenêtre de note au clic sur un numéro */
(function(){
  const pop = document.createElement('div'); pop.className = 'npop'; pop.setAttribute('role', 'dialog'); document.body.appendChild(pop);
  let openFor = null;
  function close(){ pop.classList.remove('on'); openFor = null; }
  function open(a){
    const id = a.getAttribute('href').slice(1), n = document.getElementById(id); if (!n) return;
    const c = n.cloneNode(true); c.querySelectorAll('.nb,.bmk').forEach(x => x.remove());
    pop.innerHTML = `<div class="nh"><span>Note ${a.textContent}</span><button class="nx" aria-label="Fermer">×</button></div><div class="nb2">${c.innerHTML.trim()}</div><a class="ng" href="#${id}">Voir dans les notes ↓</a>`;
    pop.querySelector('.nx').onclick = close;
    pop.querySelector('.ng').onclick = e => { e.preventDefault(); close(); history.replaceState(null, '', '#' + id); const t = document.getElementById(id); t.scrollIntoView({behavior:'instant', block:'center'}); t.classList.add('flash'); setTimeout(() => t.classList.remove('flash'), 1700); };
    pop.classList.add('on'); openFor = a;
    const r = a.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    let left = Math.min(Math.max(16, r.left - w / 2), innerWidth - w - 16);
    let top = r.bottom + 8; if (top + h > innerHeight - 12) top = Math.max(70, r.top - h - 8);
    pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('sup.fn a');
    if (a) { e.preventDefault(); e.stopPropagation(); if (openFor === a) close(); else open(a); return; }
    if (openFor && !pop.contains(e.target)) close();
  }, true);
  addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  addEventListener('scroll', () => { if (openFor && innerWidth > 600) close(); }, {passive:true});
})();
