// Builds docs/review/improvements.html from docs/context/improvements.md.
// Run from the repo root:  node scripts/make-improvements-sheet.js
// The markdown file is the source of truth; the HTML is only a friendly way to
// give Approve / Later / Reject / Discuss and comments, then copy them back.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'docs', 'context', 'improvements.md');
const out = path.join(root, 'docs', 'review', 'improvements.html');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');

const lines = fs.readFileSync(src, 'utf8').split(/\r?\n/);
const updated = (lines.find((l) => l.startsWith('Last updated:')) || '').replace('Last updated:', '').trim();

const sections = [];
let sec = null;
let item = null;
for (const raw of lines) {
  const line = raw.trimEnd();
  if (line.startsWith('## ')) {
    sec = { title: line.slice(3), intro: [], items: [] };
    sections.push(sec);
    item = null;
    continue;
  }
  if (!sec) continue;
  if (line.startsWith('### ')) {
    const m = line.slice(4).match(/^([A-Z]+\d+)\.\s*(.*)$/);
    item = { id: m ? m[1] : line.slice(4), title: m ? m[2] : line.slice(4), f: {} };
    sec.items.push(item);
    continue;
  }
  if (line === '---') continue;
  const kv = line.match(/^- \*\*([^:]+):\*\*\s*(.*)$/);
  if (item && kv) {
    item.f[kv[1].trim()] = kv[2].trim();
  } else if (!item && line) {
    sec.intro.push(line);
  } else if (item && line && !kv) {
    // free text under an item (rare): keep it with the item
    item.f.Note = ((item.f.Note || '') + ' ' + line).trim();
  }
}

const decisionWords = ['Approve', 'Later', 'Reject', 'Discuss'];
const norm = (d) => {
  const hit = decisionWords.find((w) => w.toLowerCase() === (d || '').trim().toLowerCase());
  return hit || '';
};

const allItems = [];
let body = '';
for (const s of sections) {
  const real = s.items.filter((i) => i.f.Area);
  if (/^How Tirth decides/.test(s.title)) continue;
  if (!real.length) {
    if (!s.intro.length) continue;
    body += `<section class="plain"><h2>${inline(s.title)}</h2>${s.intro
      .map((l) => (l.startsWith('- ') ? `<p class="li">${inline(l.slice(2))}</p>` : `<p>${inline(l)}</p>`))
      .join('')}</section>`;
    continue;
  }
  body += `<section><h2>${inline(s.title)}</h2>${s.intro.map((l) => `<p class="note">${inline(l)}</p>`).join('')}`;
  for (const it of real) {
    allItems.push(it);
    const f = it.f;
    const prio = (f.Priority || '').split(/[ (]/)[0].toLowerCase().replace(/[^a-z]/g, '');
    const needs = /^yes/i.test(f['Needs Drashti'] || '');
    body += `
<article class="item" data-id="${esc(it.id)}" data-prio="${esc(prio)}" data-status="${esc((f.Status || 'Open').toLowerCase())}">
  <header>
    <span class="id">${esc(it.id)}</span>
    <h3>${inline(it.title)}</h3>
  </header>
  <p class="chips">
    <span class="chip prio-${esc(prio)}">${esc(f.Priority || '')}</span>
    <span class="chip">${esc(f.Area || '')}</span>
    <span class="chip">${esc(f['Suggested for'] || '')}</span>
    ${needs ? '<span class="chip drashti">Needs Drashti</span>' : ''}
    <span class="chip status">${esc(f.Status || 'Open')}</span>
  </p>
  <div class="two">
    <div><h4>Happening now</h4><p>${inline(f.Now || '')}</p></div>
    <div><h4>What we will change</h4><p>${inline(f.Change || '')}</p></div>
  </div>
  <p class="src">Source: ${inline(f.Source || '')}</p>
  <fieldset class="choices" aria-label="Your decision for ${esc(it.id)}">
    ${decisionWords
      .map(
        (w) =>
          `<label class="opt o-${w.toLowerCase()}"><input type="radio" name="d-${esc(it.id)}" value="${w}"${
            norm(f.Decision) === w ? ' checked' : ''
          }><span>${w}</span></label>`,
      )
      .join('')}
    <button type="button" class="clear" data-clear="${esc(it.id)}">Clear</button>
  </fieldset>
  <textarea rows="2" placeholder="Your comment (optional), e.g. &quot;yes but only for under 20s&quot;" aria-label="Comment for ${esc(
    it.id,
  )}">${esc(f.Comment || '')}</textarea>
</article>`;
  }
  body += '</section>';
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cycle Saathi: improvements</title>
<style>
:root{--bg:#fbf7f6;--card:#fff;--ink:#2a2226;--mute:#6b5f65;--line:#e8dde0;--brand:#b4425f;--ok:#2f7d5b;--warn:#a8650b;--no:#a33a3a;--q:#4a5fa8;--chip:#f3ebed}
@media (prefers-color-scheme:dark){:root{--bg:#1d171a;--card:#272024;--ink:#f3eaed;--mute:#b9aab0;--line:#3b3237;--brand:#e58aa3;--ok:#6fcf9f;--warn:#e9b361;--no:#f08a8a;--q:#9db0f2;--chip:#33292e}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,Segoe UI,Roboto,sans-serif}
.wrap{max-width:900px;margin:0 auto;padding:16px}
h1{font-size:1.5rem;margin:.2em 0}
h2{font-size:1.2rem;margin:1.6em 0 .4em;border-bottom:2px solid var(--line);padding-bottom:.2em}
h3{font-size:1.05rem;margin:0}
h4{font-size:.8rem;text-transform:uppercase;letter-spacing:.05em;color:var(--mute);margin:.2em 0}
p{margin:.3em 0}
code{background:var(--chip);padding:0 .25em;border-radius:4px;font-size:.92em}
.how{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);padding:8px 0;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.bar .count{color:var(--mute);font-size:.9rem;margin-right:auto}
button,select{font:inherit;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink)}
button.primary{background:var(--brand);color:#fff;border-color:var(--brand);font-weight:600}
.item{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:12px 0}
.item header{display:flex;gap:10px;align-items:baseline}
.id{font-weight:700;color:var(--brand);min-width:2.6em}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin:.4em 0}
.chip{background:var(--chip);border-radius:999px;padding:1px 10px;font-size:.8rem}
.chip.drashti{outline:1px solid var(--warn);color:var(--warn)}
.chip.prio-critical{background:var(--no);color:#fff}
.chip.prio-high{outline:1px solid var(--no);color:var(--no)}
.two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:640px){.two{grid-template-columns:1fr}}
.src{color:var(--mute);font-size:.85rem}
.choices{border:0;padding:0;margin:.6em 0 .4em;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.opt{position:relative}
.opt input{position:absolute;opacity:0;inset:0;cursor:pointer}
.opt span{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:10px;border:2px solid var(--line);font-weight:600}
.opt input:focus-visible+span{outline:3px solid var(--q)}
.o-approve input:checked+span{background:var(--ok);border-color:var(--ok);color:#fff}
.o-later input:checked+span{background:var(--warn);border-color:var(--warn);color:#fff}
.o-reject input:checked+span{background:var(--no);border-color:var(--no);color:#fff}
.o-discuss input:checked+span{background:var(--q);border-color:var(--q);color:#fff}
textarea{width:100%;font:inherit;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--ink)}
.plain p.li:before{content:"• "}
.note{color:var(--mute)}
.item.hidden{display:none}
#toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:10px 16px;border-radius:10px;opacity:0;transition:opacity .2s;pointer-events:none}
#toast.show{opacity:1}
</style>
</head>
<body>
<div class="wrap">
<h1>Cycle Saathi: improvements</h1>
<p class="note">Built from <code>docs/context/improvements.md</code> (${esc(updated)}). Nothing here is built until you approve it.</p>
<div class="how">
  <p><b>How to use:</b> for each item read <i>Happening now</i> and <i>What we will change</i>, then pick one:</p>
  <p><b>Approve</b> = build it (items marked "Needs Drashti" wait for her yes first) · <b>Later</b> = keep on the list · <b>Reject</b> = drop it · <b>Discuss</b> = talk before building. Add a comment if you want. Your picks are saved in this browser while you work. When done press <b>Copy my decisions</b> and paste it to Claude.</p>
</div>
<div class="bar">
  <span class="count" id="count"></span>
  <select id="filter" aria-label="Show">
    <option value="all">Show all</option>
    <option value="undecided">Not decided yet</option>
    <option value="critical">Critical</option>
    <option value="high">High</option>
    <option value="drashti">Needs Drashti</option>
  </select>
  <button class="primary" id="copy">Copy my decisions</button>
</div>
${body}
</div>
<div id="toast" role="status"></div>
<script>
const KEY='cs-improvements-v1';
const items=[...document.querySelectorAll('.item')];
let saved={};try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
const state=(art)=>{
  const id=art.dataset.id;
  const r=art.querySelector('input:checked');
  return {id,title:art.querySelector('h3').textContent,decision:r?r.value:'',comment:art.querySelector('textarea').value.trim()};
};
items.forEach(art=>{
  const id=art.dataset.id,s=saved[id];
  if(s){
    if(s.decision){const r=art.querySelector('input[value="'+s.decision+'"]');if(r)r.checked=true}
    if(s.comment!==undefined&&s.comment!==''){art.querySelector('textarea').value=s.comment}
  }
});
function persist(){
  const o={};items.forEach(a=>{const s=state(a);o[s.id]={decision:s.decision,comment:s.comment}});
  try{localStorage.setItem(KEY,JSON.stringify(o))}catch(e){}
  refresh();
}
function refresh(){
  const f=document.getElementById('filter').value;
  let done=0;
  items.forEach(a=>{
    const s=state(a);if(s.decision)done++;
    let show=true;
    if(f==='undecided')show=!s.decision;
    else if(f==='critical'||f==='high')show=a.dataset.prio===f;
    else if(f==='drashti')show=!!a.querySelector('.drashti');
    a.classList.toggle('hidden',!show);
  });
  document.getElementById('count').textContent=done+' of '+items.length+' decided';
}
document.addEventListener('change',e=>{if(e.target.matches('input[type=radio]')||e.target.id==='filter')persist()});
document.addEventListener('input',e=>{if(e.target.matches('textarea'))persist()});
document.addEventListener('click',e=>{
  const c=e.target.closest('[data-clear]');
  if(c){const a=c.closest('.item');a.querySelectorAll('input').forEach(i=>i.checked=false);persist()}
});
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2500)}
document.getElementById('copy').addEventListener('click',async()=>{
  const rows=items.map(state).filter(s=>s.decision||s.comment);
  if(!rows.length){toast('Nothing to copy yet: pick a decision first');return}
  const d=new Date().toISOString().slice(0,10);
  const text='Improvement decisions ('+d+')\\n'+rows.map(s=>s.id+' '+s.title+': '+(s.decision||'(no decision)')+(s.comment?' - '+s.comment:'')).join('\\n');
  try{await navigator.clipboard.writeText(text);toast('Copied '+rows.length+' decisions. Paste them to Claude.')}
  catch(e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();toast('Copied '+rows.length+' decisions. Paste them to Claude.')}
});
refresh();
</script>
</body>
</html>
`;

fs.writeFileSync(out, html, 'utf8');
console.log('Wrote', path.relative(root, out), '-', allItems.length, 'items');
