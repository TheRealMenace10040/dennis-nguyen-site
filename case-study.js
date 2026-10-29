// Synthetic environmental-monitoring demo. No real data; generated in the browser with a fixed seed.
(function () {
  const ZONES = [
    { name: 'Zone A · ISO 5', mean: 0.6, alert: 3, action: 5 },
    { name: 'Zone B · ISO 7', mean: 3, alert: 8, action: 12 },
    { name: 'Zone C · ISO 7', mean: 5, alert: 12, action: 18 },
    { name: 'Zone D · ISO 8', mean: 8, alert: 18, action: 25 },
  ];
  const WEEKS = 52;

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function poisson(rand, lambda) {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= rand(); } while (p > L);
    return k - 1;
  }

  const rand = rng(20261028);
  const data = ZONES.map((z) => Array.from({ length: WEEKS }, () => poisson(rand, z.mean)));
  // Planted excursions so the demo has something to find.
  data[0][17] = 4; data[0][38] = 6;
  data[1][9] = 10; data[1][27] = 14; data[1][44] = 9;
  data[2][21] = 15; data[2][33] = 20;
  data[3][12] = 21; data[3][30] = 27; data[3][47] = 19;

  function level(zone, v) {
    if (v > zone.action) return 'ACTION';
    if (v > zone.alert) return 'ALERT';
    return 'OK';
  }

  // ---- Trend chart ----
  const svg = document.getElementById('trend');
  const tip = document.getElementById('tip');
  const readout = document.getElementById('readout');
  const excBody = document.querySelector('#exc-table tbody');
  const chips = Array.from(document.querySelectorAll('.chip'));
  const M = { l: 36, r: 12, t: 12, b: 28 };
  let W = 800, H = 300;
  let current = 0;

  function el(name, attrs) {
    const n = document.createElementNS('http://www.w3.org/2000/svg', name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function drawTrend() {
    const zone = ZONES[current];
    const vals = data[current];
    // Match the viewBox to the rendered width so labels and dots keep their size on phones.
    W = Math.max(320, Math.round(svg.parentElement.clientWidth || 800));
    H = W < 520 ? 260 : 300;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    const max = Math.max(zone.action * 1.2, ...vals) + 1;
    const x = (i) => M.l + (i / (WEEKS - 1)) * (W - M.l - M.r);
    const y = (v) => H - M.b - (v / max) * (H - M.t - M.b);
    svg.innerHTML = '';

    const ticks = 4;
    for (let t = 0; t <= ticks; t++) {
      const v = Math.round((max / ticks) * t);
      svg.appendChild(el('line', { x1: M.l, x2: W - M.r, y1: y(v), y2: y(v), stroke: 'rgba(255,255,255,.08)' }));
      const lab = el('text', { x: M.l - 6, y: y(v) + 4, 'text-anchor': 'end' });
      lab.textContent = v;
      svg.appendChild(lab);
    }
    [1, 13, 26, 39, 52].forEach((wk) => {
      const lab = el('text', { x: x(wk - 1), y: H - 8, 'text-anchor': 'middle' });
      lab.textContent = 'W' + wk;
      svg.appendChild(lab);
    });

    svg.appendChild(el('line', { x1: M.l, x2: W - M.r, y1: y(zone.alert), y2: y(zone.alert), stroke: '#f2c14e', 'stroke-dasharray': '6 4' }));
    svg.appendChild(el('line', { x1: M.l, x2: W - M.r, y1: y(zone.action), y2: y(zone.action), stroke: '#ff6b6b', 'stroke-dasharray': '6 4' }));

    const d = vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1)).join(' ');
    svg.appendChild(el('path', { d, fill: 'none', stroke: '#7ee6c5', 'stroke-width': 2, 'vector-effect': 'non-scaling-stroke' }));

    vals.forEach((v, i) => {
      const lv = level(zone, v);
      const c = el('circle', {
        cx: x(i), cy: y(v), r: lv === 'OK' ? 3 : 5,
        fill: lv === 'ACTION' ? '#ff6b6b' : lv === 'ALERT' ? '#f2c14e' : '#0d0f10',
        stroke: lv === 'OK' ? '#7ee6c5' : 'none', 'stroke-width': 1.5,
      });
      c.addEventListener('mouseenter', () => showTip(x(i), y(v), i, v, lv));
      c.addEventListener('mouseleave', () => { tip.hidden = true; });
      svg.appendChild(c);
    });

    const counts = { ALERT: 0, ACTION: 0 };
    excBody.innerHTML = '';
    vals.forEach((v, i) => {
      const lv = level(zone, v);
      if (lv === 'OK') return;
      counts[lv]++;
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>Week ' + (i + 1) + '</td><td>' + v + '</td><td><span class="badge ' + (lv === 'ACTION' ? 'b-out' : 'b-soon') + '">' + lv + '</span></td>';
      excBody.appendChild(tr);
    });
    if (!excBody.children.length) {
      excBody.innerHTML = '<tr><td colspan="3" class="empty">No excursions this year.</td></tr>';
    }
    readout.innerHTML = '<strong>' + zone.name + '</strong>: alert limit ' + zone.alert + ' CFU, action limit ' + zone.action +
      ' CFU. ' + counts.ALERT + (counts.ALERT === 1 ? ' alert' : ' alerts') + ' and ' + counts.ACTION + (counts.ACTION === 1 ? ' action' : ' actions') + ' in ' + WEEKS + ' weeks.';
  }

  function showTip(px, py, i, v, lv) {
    tip.hidden = false;
    tip.textContent = 'Week ' + (i + 1) + ': ' + v + ' CFU (' + lv + ')';
    const r = svg.getBoundingClientRect();
    tip.style.left = (px / W) * r.width + 'px';
    tip.style.top = (py / H) * r.height + 'px';
  }

  chips.forEach((chip) => chip.addEventListener('click', () => {
    current = Number(chip.dataset.zone);
    chips.forEach((c) => {
      const on = c === chip;
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    drawTrend();
  }));

  // ---- Frequency board ----
  // days = SOP frequency window; last = days since last run at day 0 of the demo.
  const TESTS = [
    { name: 'Settle plates, Zone A', freq: 7, last: 2 },
    { name: 'Contact plates, gowning room', freq: 7, last: 4 },
    { name: 'Air sampling, Zone B', freq: 7, last: 5 },
    { name: 'Surface monitoring, Zone C', freq: 14, last: 9 },
    { name: 'Compressed-air line sampling', freq: 30, last: 24 },
    { name: 'Water system bioburden', freq: 7, last: 6 },
    { name: 'Personnel monitoring', freq: 7, last: 1 },
    { name: 'Endotoxin, purified water', freq: 30, last: 12 },
    { name: 'Incubator temperature check', freq: 1, last: 0 },
  ];
  const adv = document.getElementById('adv');
  const advVal = document.getElementById('adv-val');
  const freqBody = document.querySelector('#freq-table tbody');

  function drawFreq() {
    const day = Number(adv.value);
    advVal.textContent = 'day ' + day;
    freqBody.innerHTML = '';
    TESTS.forEach((t) => {
      const left = t.freq - (t.last + day);
      let cls = 'b-ok', label = 'On track';
      if (left < 0) { cls = 'b-out'; label = 'Out of frequency'; }
      else if (left <= 1 && t.freq > 1) { cls = 'b-risk'; label = 'At risk'; }
      else if (left <= Math.max(2, Math.round(t.freq * 0.2))) { cls = 'b-soon'; label = 'Due soon'; }
      const lastRun = t.last + day;
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + t.name + '</td><td>every ' + t.freq + ' d</td><td>' + lastRun + ' d ago</td><td>' + left + '</td><td><span class="badge ' + cls + '">' + label + '</span></td>';
      freqBody.appendChild(tr);
    });
  }
  adv.addEventListener('input', drawFreq);

  let lastW = 0;
  window.addEventListener('resize', () => {
    const w = svg.parentElement.clientWidth;
    if (w !== lastW) { lastW = w; drawTrend(); }
  });

  drawTrend();
  drawFreq();
})();
