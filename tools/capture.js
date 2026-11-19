// Captures annotated screenshots of the Recipe Finder prototype for the POE report.
// Usage: node capture.js <playwright-module-dir>   (output goes to ../screenshots/raw)
const path = require('path');
const { chromium } = require(path.join(process.argv[2], 'playwright'));
const ROOT = path.resolve(__dirname, '..');
const base = 'file://' + path.join(ROOT, 'prototype') + '/';
const OUT = path.join(ROOT, 'screenshots', 'raw');
require('fs').mkdirSync(OUT, { recursive: true });

// Draws a solid outline around each element and a numbered badge beside it (not on top of its text).
async function annotate(page, items) {
  await page.evaluate((items) => {
    const layer = document.createElement('div');
    layer.id = 'annot-layer';
    layer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:99999;pointer-events:none';
    document.body.appendChild(layer);
    const fixed = document.createElement('div');
    fixed.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;z-index:99999;pointer-events:none';
    document.body.appendChild(fixed);
    items.forEach(({ sel, n, pos, idx, pad, inFixed, noBox }) => {
      const els = document.querySelectorAll(sel);
      const el = els[idx || 0];
      if (!el) { console.log('MISSING ' + sel); return; }
      const r = el.getBoundingClientRect();
      const sx = inFixed ? 0 : window.scrollX, sy = inFixed ? 0 : window.scrollY;
      const p = pad === undefined ? 4 : pad;
      const box = document.createElement('div');
      box.style.cssText = `position:absolute;left:${r.left + sx - p}px;top:${r.top + sy - p}px;width:${r.width + 2 * p}px;height:${r.height + 2 * p}px;border:3px solid #1A56DB;border-radius:10px;box-sizing:border-box`;
      const b = document.createElement('div');
      const S = 30, g = 6;
      let x, y;
      const cx = r.left + sx, cy = r.top + sy;
      switch (pos) {
        case 'left': x = cx - p - S - g; y = cy + r.height / 2 - S / 2; break;
        case 'right': x = cx + r.width + p + g; y = cy + r.height / 2 - S / 2; break;
        case 'top': x = cx + r.width / 2 - S / 2; y = cy - p - S - g; break;
        case 'bottom': x = cx + r.width / 2 - S / 2; y = cy + r.height + p + g; break;
        case 'top-left': x = cx - p - S / 2; y = cy - p - S / 2; break;
        case 'top-right': x = cx + r.width + p - S / 2; y = cy - p - S / 2; break;
        default: x = cx - p - S - g; y = cy + r.height / 2 - S / 2;
      }
      b.textContent = n;
      b.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${S}px;height:${S}px;border-radius:50%;background:#1A56DB;color:#fff;font:700 16px/30px Arial,sans-serif;text-align:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)`;
      if (!noBox) (inFixed ? fixed : layer).appendChild(box);
      (inFixed ? fixed : layer).appendChild(b);
    });
  }, items);
}

async function clipOf(page, sel, m) {
  m = m || {};
  const r = await page.evaluate((sel) => { const e = document.querySelector(sel); const b = e.getBoundingClientRect(); return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height }; }, sel);
  const l = m.l ?? 50, t = m.t ?? 30, rr = m.r ?? 50, bb = m.b ?? 30;
  return { x: Math.max(0, r.x - l), y: Math.max(0, r.y - t), width: r.w + l + rr, height: r.h + t + bb };
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  async function ctx(opts) {
    const c = await browser.newContext(Object.assign({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 }, opts || {}));
    return c;
  }
  async function open(c, url, store) {
    const p = await c.newPage();
    if (store) await p.addInitScript((s) => { for (const k in s) localStorage.setItem('rf_' + k, JSON.stringify(s[k])); }, store);
    await p.goto(base + url);
    await p.waitForTimeout(350);
    return p;
  }
  const shot = (p, name, o) => p.screenshot(Object.assign({ path: path.join(OUT, name + '.png') }, (o && o.clip) ? { fullPage: true } : {}, o || {}));
  let c, p;

  // ---- Fig: Home page
  c = await ctx(); p = await open(c, 'index.html');
  await annotate(p, [
    { sel: '#reminder', n: 1, pos: 'left' },
    { sel: '.input-row', n: 2, pos: 'left' },
    { sel: '#use-pantry', n: 3, pos: 'right' },
    { sel: '.option-grid', n: 4, pos: 'left' },
    { sel: '.row-2.field', n: 5, pos: 'left' },
    { sel: '#find-btn', n: 6, pos: 'left' },
    { sel: '#first-hint', n: 7, pos: 'right' },
    { sel: '.toggle-row', n: 8, pos: 'right' },
    { sel: '.main-nav ul', n: 9, pos: 'left' },
  ]);
  const hf = await clipOf(p, '#search-form', { l: 0, t: 0, r: 0, b: 0 });
  await shot(p, 'home', { clip: { x: 0, y: 0, width: 1280, height: hf.y + hf.height + 24 } });
  await c.close();

  // ---- Fig: Results
  c = await ctx(); p = await open(c, 'results.html?ing=egg,rice,onion&eq=stove,microwave&time=30&cost=20');
  await annotate(p, [
    { sel: '#results .match', n: 1, pos: 'right' },
    { sel: '.filters fieldset, .filters .check', n: 2, pos: 'right', idx: 0 },
    { sel: '[data-time]', n: 3, pos: 'right', idx: 3 },
    { sel: '#f-cost', n: 4, pos: 'right' },
    { sel: '#sort', n: 5, pos: 'right' },
    { sel: '#results .save-btn', n: 6, pos: 'left', idx: 1 },
    { sel: '#result-count', n: 7, pos: 'right' },
  ]);
  await shot(p, 'results', { clip: { x: 60, y: 80, width: 1160, height: 840 } });
  await c.close();

  // ---- Fig: Safety (confirm + undo)
  c = await ctx(); p = await open(c, 'kitchen.html');
  await p.click('#clear-pantry'); await p.waitForTimeout(250);
  await annotate(p, [
    { sel: '#confirm-modal [data-close].btn', n: 1, pos: 'bottom', inFixed: true },
    { sel: '#confirm-clear', n: 2, pos: 'bottom', inFixed: true },
  ]);
  await shot(p, 'safety_confirm', { clip: await (async () => { const r = await p.evaluate(() => { const b = document.querySelector('#confirm-modal .modal').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; }); return { x: r.x - 30, y: r.y - 30, width: r.w + 60, height: r.h + 80 }; })() });
  await c.close();
  c = await ctx(); p = await open(c, 'kitchen.html');
  await p.click('[data-pr="0"]'); await p.waitForTimeout(250);
  await annotate(p, [{ sel: '#undo-btn', n: 1, pos: 'right', inFixed: true }, { sel: '#pantry-list', n: 2, pos: 'left' }]);
  await shot(p, 'safety_undo', { clip: { x: 60, y: 330, width: 1160, height: 530 } });
  await c.close();

  // ---- Fig: Cook step with timer
  c = await ctx({ viewport: { width: 860, height: 860 } }); p = await open(c, 'cook.html?id=egg-fried-rice&step=2');
  await p.click('#t-btn'); await p.waitForTimeout(2200);
  await annotate(p, [
    { sel: '.progress', n: 1, pos: 'right' },
    { sel: '.timer', n: 2, pos: 'right' },
    { sel: '#next', n: 3, pos: 'right' },
    { sel: '#prev', n: 4, pos: 'left' },
  ]);
  await shot(p, 'cook_step', { clip: await clipOf(p, '.cook', { l: 70, t: 20, r: 70, b: 30 }) });
  await c.close();

  // ---- Fig: Finish screen
  c = await ctx({ viewport: { width: 860, height: 860 } }); p = await open(c, 'cook.html?id=egg-fried-rice&step=7');
  await p.waitForTimeout(1600);
  await annotate(p, [
    { sel: '#done-h', n: 1, pos: 'left' },
    { sel: '.saved-money', n: 2, pos: 'left' },
    { sel: '.step-card.done .btn-primary', n: 3, pos: 'left' },
  ]);
  await shot(p, 'finish', { clip: await clipOf(p, '.cook', { l: 70, t: 20, r: 70, b: 30 }) });
  await c.close();

  // ---- Fig: Recipe page (design principles)
  c = await ctx({ viewport: { width: 1280, height: 1100 } }); p = await open(c, 'recipe.html?id=egg-fried-rice');
  await p.click('#r-save'); await p.waitForTimeout(200);
  await p.evaluate(() => { document.getElementById('toast').innerHTML = ''; });
  await annotate(p, [
    { sel: '#start-cook', n: 1, pos: 'top-left' },
    { sel: '#r-save', n: 2, pos: 'top-right' },
    { sel: '.stepper', n: 3, pos: 'top-left' },
    { sel: '.ing-status.have', n: 4, pos: 'left' },
    { sel: '.ing-status.need', n: 5, pos: 'left' },
    { sel: '#shop-wa', n: 6, pos: 'right' },
    { sel: '.breadcrumb a', n: 7, pos: 'right', idx: 1 },
  ]);
  await shot(p, 'recipe', { clip: { x: 60, y: 84, width: 1160, height: 970 } });
  await c.close();

  // ---- Fig: Constraint (empty search)
  c = await ctx(); p = await open(c, 'index.html#empty', { hintDone: true, reminderDone: true });
  await annotate(p, [
    { sel: '#chips', n: 1, pos: 'right' },
    { sel: '#find-btn', n: 2, pos: 'left' },
    { sel: '#find-why', n: 3, pos: 'right' },
  ]);
  await shot(p, 'constraint', { clip: await clipOf(p, '#search-form', { l: 60, t: 20, r: 20, b: 20 }) });
  await c.close();

  // ---- Fig: Kitchen Helper
  c = await ctx({ viewport: { width: 1280, height: 980 } }); p = await open(c, 'helper.html');
  await annotate(p, [
    { sel: '.msg.user', n: 1, pos: 'left', idx: 1 },
    { sel: '.mini-card', n: 2, pos: 'right', idx: 0 },
    { sel: '.quick-replies', n: 3, pos: 'left' },
    { sel: '#chat-input', n: 4, pos: 'left' },
    { sel: '.stack .panel', n: 5, pos: 'right', idx: 1 },
  ]);
  await shot(p, 'helper', { clip: { x: 40, y: 84, width: 1200, height: 860 } });
  await c.close();

  // ---- Fig: Reviews
  c = await ctx(); p = await open(c, 'recipe.html?id=egg-fried-rice');
  const rv = await clipOf(p, '#rev-h', { l: 30, t: 30, r: 30, b: 0 });
  await annotate(p, [
    { sel: '.review p', n: 1, pos: 'left', idx: 0 },
    { sel: '.review .who', n: 2, pos: 'left', idx: 0 },
    { sel: '.star-input', n: 3, pos: 'right' },
    { sel: '#rt-help', n: 4, pos: 'right' },
  ]);
  const revBox = await clipOf(p, '#review-form', { l: 0, t: 0, r: 0, b: 0 });
  await shot(p, 'reviews', { clip: { x: 60, y: rv.y, width: 1160, height: revBox.y + revBox.height - rv.y + 40 } });
  await c.close();

  // ---- Fig: Cook together + Share
  c = await ctx(); p = await open(c, 'recipe.html?id=egg-fried-rice');
  await p.click('#r-together'); await p.waitForTimeout(250);
  await annotate(p, [
    { sel: '#people', n: 1, pos: 'top-left', inFixed: true },
    { sel: '#invite-preview', n: 2, pos: 'left', inFixed: true },
    { sel: '#invite-wa', n: 3, pos: 'right', inFixed: true },
  ]);
  let mb = await p.evaluate(() => { const b = document.querySelector('#together-modal .modal').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  await shot(p, 'together', { clip: { x: mb.x - 50, y: mb.y - 25, width: mb.w + 100, height: mb.h + 50 } });
  await c.close();
  c = await ctx(); p = await open(c, 'recipe.html?id=egg-fried-rice');
  await p.click('#r-share'); await p.waitForTimeout(200); await p.click('#copy-link'); await p.waitForTimeout(200);
  await annotate(p, [
    { sel: '#wa-share', n: 4, pos: 'left', inFixed: true },
    { sel: '#copy-link', n: 5, pos: 'right', inFixed: true },
    { sel: '#copy-status', n: 6, pos: 'right', inFixed: true, pad: 2 },
  ]);
  mb = await p.evaluate(() => { const b = document.querySelector('#share-modal .modal').getBoundingClientRect(); return { x: b.left, y: b.top, w: b.width, h: b.height }; });
  await shot(p, 'share', { clip: { x: mb.x - 50, y: mb.y - 25, width: mb.w + 100, height: mb.h + 50 } });
  await c.close();

  // ---- Fig: Popular with IIE students
  c = await ctx(); p = await open(c, 'index.html');
  await annotate(p, [
    { sel: '#popular .social-proof', n: 1, pos: 'bottom', idx: 0 },
    { sel: '.section-title .small', n: 2, pos: 'left' },
  ]);
  const st = await clipOf(p, '.section-title', { l: 0, t: 0, r: 0, b: 0 });
  const pp = await clipOf(p, '#popular', { l: 0, t: 0, r: 0, b: 0 });
  await shot(p, 'popular', { clip: { x: 60, y: st.y - 20, width: 1160, height: pp.y + pp.height - st.y + 60 } });
  await c.close();

  // ---- Fig: Empty result + review error
  c = await ctx(); p = await open(c, 'results.html?ing=egg&eq=kettle&time=10&cost=5');
  await annotate(p, [
    { sel: '.empty h2', n: 1, pos: 'left' },
    { sel: '#relax-time', n: 2, pos: 'bottom' },
    { sel: '#relax-cost', n: 3, pos: 'bottom' },
  ]);
  await shot(p, 'empty', { clip: await clipOf(p, '.empty', { l: 30, t: 30, r: 30, b: 50 }) });
  await c.close();
  c = await ctx(); p = await open(c, 'recipe.html?id=egg-fried-rice');
  await p.click('#review-form button[type=submit]'); await p.waitForTimeout(200);
  await annotate(p, [{ sel: '#star-error', n: 4, pos: 'left' }]);
  await shot(p, 'error', { clip: await clipOf(p, '#review-form', { l: 50, t: 20, r: 20, b: 20 }) });
  await c.close();

  // ---- Fig: Settings with large text + high contrast
  c = await ctx({ viewport: { width: 1280, height: 1000 } }); p = await open(c, 'settings.html', { settings: { text: 'large', contrast: true, motion: false } });
  await annotate(p, [
    { sel: '.seg', n: 1, pos: 'right' },
    { sel: '#contrast', n: 2, pos: 'right', pad: 10 },
    { sel: '#motion', n: 3, pos: 'right', pad: 10 },
  ]);
  const sp = await clipOf(p, 'main', { l: 0, t: 0, r: 0, b: 0 });
  await shot(p, 'settings', { clip: { x: sp.x - 10, y: sp.y, width: 900, height: sp.height } });
  await c.close();

  // ---- Fig: Skip link + focus outline
  c = await ctx(); p = await open(c, 'index.html', { hintDone: true });
  await p.keyboard.press('Tab'); await p.waitForTimeout(150);
  await annotate(p, [{ sel: '.skip-link', n: 1, pos: 'bottom' }]);
  await shot(p, 'skip', { clip: { x: 0, y: 0, width: 760, height: 230 } });
  await c.close();
  c = await ctx(); p = await open(c, 'results.html?ing=egg,rice,onion&eq=stove,microwave&time=30&cost=20');
  await p.focus('#results .card h3 a'); await p.keyboard.press('Shift+Tab'); await p.keyboard.press('Tab'); await p.waitForTimeout(150);
  await annotate(p, [{ sel: '#results .card h3 a', n: 2, pos: 'right', noBox: true }]);
  await shot(p, 'focus', { clip: await clipOf(p, '#results .card', { l: 20, t: 20, r: 60, b: 20 }) });
  await c.close();

  // ---- Walkthrough: mobile screens (390 x 844)
  const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  const mob = [
    ['m1_home', 'index.html', { hintDone: true, reminderDone: true }, async (p) => { await p.evaluate(() => window.scrollTo(0, 0)); }],
    ['m2_results', 'results.html?ing=egg,rice,onion&eq=stove,microwave&time=30&cost=20', null, async (p) => { const y = await p.evaluate(() => document.querySelector('#results').getBoundingClientRect().top + scrollY - 160); await p.evaluate((y) => window.scrollTo(0, y), y); }],
    ['m3_recipe', 'recipe.html?id=egg-fried-rice', null, async (p) => { await p.evaluate(() => window.scrollTo(0, 250)); }],
    ['m4_cook', 'cook.html?id=egg-fried-rice&step=5', null, null],
    ['m5_finish', 'cook.html?id=egg-fried-rice&step=7', null, async (p) => { await p.waitForTimeout(1600); }],
    ['m6_kitchen', 'kitchen.html', null, null],
  ];
  for (const [name, url, store, fn] of mob) {
    c = await ctx(phone); p = await open(c, url, store);
    if (fn) await fn(p);
    await p.waitForTimeout(200);
    await shot(p, name);
    await c.close();
  }

  await browser.close();
  console.log('done');
})();
