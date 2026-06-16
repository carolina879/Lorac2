const FisicaInterativa = (() => {
  const MODAL_ID = 'modal-fisica-interativa';
  let _activeTab = 'projetil';
  let _loops = {}; 

  
  function abrir(tab) {
    document.getElementById(MODAL_ID)?.remove();
    _stopAll();
    _injectStyles();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'ex-modal-overlay';
    modal.style.cssText = 'z-index:100005;display:flex;align-items:center;justify-content:center;';

    modal.innerHTML = `
      <div class="fi-box">
        <div class="fi-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;">⚛️</span>
            <span class="fi-title">Física Interativa</span>
          </div>
          <div class="fi-tabs">
            <button class="fi-tab" id="tab-projetil"   onclick="FisicaInterativa.setTab('projetil')">🏀 Projétil</button>
            <button class="fi-tab" id="tab-queda"      onclick="FisicaInterativa.setTab('queda')">🍎 Queda Livre</button>
            <button class="fi-tab" id="tab-ondas"      onclick="FisicaInterativa.setTab('ondas')">〰️ Ondas</button>
            <button class="fi-tab" id="tab-circuitos"  onclick="FisicaInterativa.setTab('circuitos')">⚡ Circuitos</button>
          </div>
          <button class="fi-close" onclick="FisicaInterativa.fechar()">✕</button>
        </div>
        <div class="fi-body" id="fi-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    setTab(tab || 'projetil');
  }

  function fechar() {
    _stopAll();
    document.getElementById(MODAL_ID)?.remove();
  }

  function _stopAll() {
    Object.values(_loops).forEach(id => cancelAnimationFrame(id));
    _loops = {};
  }

  function setTab(tab) {
    _stopAll();
    _activeTab = tab;
    document.querySelectorAll('.fi-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`)?.classList.add('active');

    const body = document.getElementById('fi-body');
    if (!body) return;

    if (tab === 'projetil')  { body.innerHTML = _htmlProjetil();  _initProjetil(); }
    if (tab === 'queda')     { body.innerHTML = _htmlQueda();     _initQueda(); }
    if (tab === 'ondas')     { body.innerHTML = _htmlOndas();     _initOndas(); }
    if (tab === 'circuitos') { body.innerHTML = _htmlCircuitos(); _initCircuitos(); }
  }

  function _htmlProjetil() {
    return `
      <div class="fi-layout">
        <div class="fi-controls">
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Parâmetros</div>
            <div class="fi-slider-row">
              <label>Velocidade inicial</label>
              <input type="range" id="pj-v0" min="10" max="100" value="50" step="1" oninput="FisicaInterativa._pjUpdate()"/>
              <span id="pj-v0-val">50 m/s</span>
            </div>
            <div class="fi-slider-row">
              <label>Ângulo (θ)</label>
              <input type="range" id="pj-ang" min="1" max="89" value="45" step="1" oninput="FisicaInterativa._pjUpdate()"/>
              <span id="pj-ang-val">45°</span>
            </div>
            <div class="fi-slider-row">
              <label>Gravidade (g)</label>
              <input type="range" id="pj-g" min="1" max="25" value="10" step="0.5" oninput="FisicaInterativa._pjUpdate()"/>
              <span id="pj-g-val">10 m/s²</span>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Resultados</div>
            <div class="fi-result-grid" id="pj-results"></div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Fórmulas</div>
            <div class="fi-formula">
              x(t) = v₀·cos(θ)·t<br>
              y(t) = v₀·sin(θ)·t - ½g·t²<br>
              Alcance = v₀²·sin(2θ)/g<br>
              H_max = v₀²·sin²(θ)/(2g)
            </div>
          </div>
          <button class="fi-btn-launch" onclick="FisicaInterativa._pjLaunch()">▶ Lançar</button>
          <button class="fi-btn-launch" onclick="FisicaInterativa._explicarIA()" style="margin-top:8px;background:var(--bg-3);color:var(--accent);border:1px solid var(--accent)">🤖 Explicar com IA</button>
        </div>
        <div class="fi-canvas-wrap">
          <canvas id="pj-canvas"></canvas>
        </div>
      </div>
    `;
  }

  let _pjState = { animating: false, t: 0, trail: [] };

  function _pjUpdate() {
    const v0  = parseFloat(document.getElementById('pj-v0')?.value  || 50);
    const ang = parseFloat(document.getElementById('pj-ang')?.value || 45);
    const g   = parseFloat(document.getElementById('pj-g')?.value   || 10);

    document.getElementById('pj-v0-val').textContent  = `${v0} m/s`;
    document.getElementById('pj-ang-val').textContent = `${ang}°`;
    document.getElementById('pj-g-val').textContent   = `${g} m/s²`;

    const rad = ang * Math.PI / 180;
    const alcance  = (v0 * v0 * Math.sin(2 * rad) / g).toFixed(1);
    const hmax     = (v0 * v0 * Math.sin(rad) ** 2 / (2 * g)).toFixed(1);
    const tTotal   = (2 * v0 * Math.sin(rad) / g).toFixed(2);
    const vx       = (v0 * Math.cos(rad)).toFixed(1);
    const vy0      = (v0 * Math.sin(rad)).toFixed(1);

    const el = document.getElementById('pj-results');
    if (el) el.innerHTML = `
      <div class="fi-res"><span>Alcance</span><b>${alcance} m</b></div>
      <div class="fi-res"><span>Altura máx.</span><b>${hmax} m</b></div>
      <div class="fi-res"><span>Tempo total</span><b>${tTotal} s</b></div>
      <div class="fi-res"><span>Vx</span><b>${vx} m/s</b></div>
      <div class="fi-res"><span>Vy₀</span><b>${vy0} m/s</b></div>
    `;
    _pjDrawStatic();
  }

  function _pjDrawStatic() {
    const canvas = document.getElementById('pj-canvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    canvas.width  = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const v0  = parseFloat(document.getElementById('pj-v0')?.value  || 50);
    const ang = parseFloat(document.getElementById('pj-ang')?.value || 45);
    const g   = parseFloat(document.getElementById('pj-g')?.value   || 10);
    const rad = ang * Math.PI / 180;
    const tTotal = 2 * v0 * Math.sin(rad) / g;
    const xMax   = v0 * v0 * Math.sin(2 * rad) / g;
    const yMax   = v0 * v0 * Math.sin(rad) ** 2 / (2 * g);

    const pad = 48;
    const scaleX = (W - pad * 2) / (xMax * 1.15);
    const scaleY = (H - pad * 2) / (yMax * 1.4);
    const ox = pad, oy = H - pad;

    ctx.clearRect(0, 0, W, H);

    ctx.strokeStyle = '#ffffff0d'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(ox, 10); ctx.lineTo(ox, oy); ctx.lineTo(W - 10, oy); ctx.stroke();
    ctx.fillStyle = '#ffffff55'; ctx.font = '11px monospace';
    ctx.fillText('x (m)', W - 38, oy - 8);
    ctx.fillText('y (m)', ox + 8, 22);

    const nX = 5, nY = 4;
    ctx.fillStyle = '#ffffff44'; ctx.font = '10px monospace';
    for (let i = 1; i <= nX; i++) {
      const px = ox + (i / nX) * xMax * scaleX;
      ctx.fillText((xMax * i / nX).toFixed(0), px - 10, oy + 14);
    }
    for (let i = 1; i <= nY; i++) {
      const py = oy - (i / nY) * yMax * scaleY;
      ctx.fillText((yMax * i / nY).toFixed(0), ox - 36, py + 4);
    }

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#e8a04a55'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tTotal;
      const px = ox + v0 * Math.cos(rad) * t * scaleX;
      const py = oy - (v0 * Math.sin(rad) * t - 0.5 * g * t * t) * scaleY;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    if (_pjState.trail.length > 1) {
      ctx.strokeStyle = '#e8a04a'; ctx.lineWidth = 2.5;
      ctx.beginPath();
      _pjState.trail.forEach((p, i) => {
        const px = ox + p.x * scaleX;
        const py = oy - p.y * scaleY;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    if (_pjState.animating || _pjState.trail.length) {
      const last = _pjState.trail[_pjState.trail.length - 1] || { x: 0, y: 0 };
      const bx = ox + last.x * scaleX;
      const by = oy - last.y * scaleY;
      ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#e8a04a'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    } else {
      ctx.beginPath(); ctx.arc(ox, oy, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#e8a04a'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      const arrowLen = 40;
      ctx.strokeStyle = '#7dcb7d'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + arrowLen * Math.cos(rad), oy - arrowLen * Math.sin(rad));
      ctx.stroke();
    }
  }

  function _pjLaunch() {
    if (_pjState.animating) return;
    const v0  = parseFloat(document.getElementById('pj-v0')?.value  || 50);
    const ang = parseFloat(document.getElementById('pj-ang')?.value || 45);
    const g   = parseFloat(document.getElementById('pj-g')?.value   || 10);
    const rad = ang * Math.PI / 180;
    const tTotal = 2 * v0 * Math.sin(rad) / g;

    _pjState = { animating: true, t: 0, trail: [], tTotal, v0, rad, g };

    let last = performance.now();
    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      _pjState.t += dt * 1.5;

      if (_pjState.t >= tTotal) {
        _pjState.t = tTotal;
        _pjState.animating = false;
      }

      const t = _pjState.t;
      const x = v0 * Math.cos(rad) * t;
      const y = Math.max(0, v0 * Math.sin(rad) * t - 0.5 * g * t * t);
      _pjState.trail.push({ x, y });
      if (_pjState.trail.length > 300) _pjState.trail.shift();
      _pjDrawStatic();

      if (_pjState.animating) _loops.projetil = requestAnimationFrame(step);
    }
    _loops.projetil = requestAnimationFrame(step);
  }

  function _initProjetil() {
    setTimeout(() => { _pjState = { animating: false, t: 0, trail: [] }; _pjUpdate(); }, 50);
  }

  function _htmlQueda() {
    return `
      <div class="fi-layout">
        <div class="fi-controls">
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Parâmetros</div>
            <div class="fi-slider-row">
              <label>Altura inicial (h)</label>
              <input type="range" id="ql-h" min="10" max="500" value="100" step="5" oninput="FisicaInterativa._qlUpdate()"/>
              <span id="ql-h-val">100 m</span>
            </div>
            <div class="fi-slider-row">
              <label>Gravidade (g)</label>
              <input type="range" id="ql-g" min="1" max="25" value="10" step="0.5" oninput="FisicaInterativa._qlUpdate()"/>
              <span id="ql-g-val">10 m/s²</span>
            </div>
            <div class="fi-slider-row">
              <label>Velocidade inicial</label>
              <input type="range" id="ql-v0" min="0" max="50" value="0" step="1" oninput="FisicaInterativa._qlUpdate()"/>
              <span id="ql-v0-val">0 m/s</span>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Resultados</div>
            <div class="fi-result-grid" id="ql-results"></div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Fórmulas</div>
            <div class="fi-formula">
              y(t) = h - v₀t - ½g·t²<br>
              v(t) = v₀ + g·t<br>
              t_queda = √(2h/g)<br>
              v_impacto = √(v₀²+2gh)
            </div>
          </div>
          <button class="fi-btn-launch" onclick="FisicaInterativa._qlLaunch()">▶ Soltar</button>
          <button class="fi-btn-launch" onclick="FisicaInterativa._explicarIA()" style="margin-top:8px;background:var(--bg-3);color:var(--accent);border:1px solid var(--accent)">🤖 Explicar com IA</button>
        </div>
        <div class="fi-canvas-wrap" style="display:flex;gap:0;">
          <canvas id="ql-canvas" style="flex:1;"></canvas>
          <canvas id="ql-graph" style="flex:1;border-left:1px solid var(--border,#3a3228);"></canvas>
        </div>
      </div>
    `;
  }

  let _qlState = { animating: false, t: 0 };

  function _qlUpdate() {
    const h  = parseFloat(document.getElementById('ql-h')?.value  || 100);
    const g  = parseFloat(document.getElementById('ql-g')?.value  || 10);
    const v0 = parseFloat(document.getElementById('ql-v0')?.value || 0);
    document.getElementById('ql-h-val').textContent  = `${h} m`;
    document.getElementById('ql-g-val').textContent  = `${g} m/s²`;
    document.getElementById('ql-v0-val').textContent = `${v0} m/s`;

    const tQueda   = ((-v0 + Math.sqrt(v0*v0 + 2*g*h)) / g).toFixed(2);
    const vImpacto = Math.sqrt(v0*v0 + 2*g*h).toFixed(1);
    const eMec     = (0.5 * 1 * v0*v0 + 1 * g * h).toFixed(1);

    const el = document.getElementById('ql-results');
    if (el) el.innerHTML = `
      <div class="fi-res"><span>Tempo queda</span><b>${tQueda} s</b></div>
      <div class="fi-res"><span>Vel. impacto</span><b>${vImpacto} m/s</b></div>
      <div class="fi-res"><span>Energia (1kg)</span><b>${eMec} J</b></div>
    `;
    _qlDraw(0);
  }

  function _qlDraw(t_atual) {
    const canvas = document.getElementById('ql-canvas');
    const graph  = document.getElementById('ql-graph');
    if (!canvas || !graph) return;

    const h  = parseFloat(document.getElementById('ql-h')?.value  || 100);
    const g  = parseFloat(document.getElementById('ql-g')?.value  || 10);
    const v0 = parseFloat(document.getElementById('ql-v0')?.value || 0);
    const tTotal = (-v0 + Math.sqrt(v0*v0 + 2*g*h)) / g;

    canvas.width  = canvas.parentElement.clientWidth / 2;
    canvas.height = canvas.parentElement.clientHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const pad = 40;
    const scaleY = (H - pad * 2) / h;

    ctx.clearRect(0, 0, W, H);
    
    ctx.strokeStyle = '#ffffff0d'; ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    ctx.fillStyle = '#5a4a3a44';
    ctx.fillRect(0, H - pad, W, pad);
    ctx.strokeStyle = '#e8a04a66'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H - pad); ctx.lineTo(W, H - pad); ctx.stroke();
    ctx.fillStyle = '#ffffff33'; ctx.font = '11px monospace'; ctx.fillText('Solo', 8, H - pad + 16);

    const y_atual = h - v0 * t_atual - 0.5 * g * t_atual * t_atual;
    const by = pad + (h - Math.max(0, y_atual)) * scaleY;
    const bx = W / 2;

   
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(bx, pad); ctx.lineTo(bx, H - pad); ctx.stroke();
    ctx.setLineDash([]);

    
    ctx.beginPath(); ctx.arc(bx, by, 14, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(bx - 4, by - 4, 2, bx, by, 14);
    grad.addColorStop(0, '#ffcc66'); grad.addColorStop(1, '#c87820');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();

    const v_atual = v0 + g * t_atual;
    const arrowLen = Math.min(v_atual * 2, 80);
    ctx.strokeStyle = '#7dcb7d'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(bx + 20, by); ctx.lineTo(bx + 20, by + arrowLen); ctx.stroke();
    if (arrowLen > 5) {
      ctx.fillStyle = '#7dcb7d';
      ctx.beginPath(); ctx.moveTo(bx + 15, by + arrowLen); ctx.lineTo(bx + 25, by + arrowLen); ctx.lineTo(bx + 20, by + arrowLen + 8); ctx.fill();
    }
    ctx.fillStyle = '#7dcb7d'; ctx.font = '10px monospace';
    ctx.fillText(`v=${v_atual.toFixed(1)}`, bx + 26, by + arrowLen / 2 + 4);

    ctx.fillStyle = '#5d9de8'; ctx.font = '10px monospace';
    ctx.fillText(`h=${Math.max(0, y_atual).toFixed(1)}m`, 8, by - 4);

    
    graph.width  = canvas.parentElement.clientWidth / 2;
    graph.height = canvas.parentElement.clientHeight;
    const gctx = graph.getContext('2d');
    const GW = graph.width, GH = graph.height;
    const gpad = 44;
    gctx.clearRect(0, 0, GW, GH);

    gctx.strokeStyle = '#ffffff0d'; gctx.lineWidth = 1;
    for (let x = 0; x < GW; x += 40) { gctx.beginPath(); gctx.moveTo(x,0); gctx.lineTo(x,GH); gctx.stroke(); }
    for (let y = 0; y < GH; y += 40) { gctx.beginPath(); gctx.moveTo(0,y); gctx.lineTo(GW,y); gctx.stroke(); }

  
    gctx.strokeStyle = '#ffffff33'; gctx.lineWidth = 1.5;
    gctx.beginPath(); gctx.moveTo(gpad, 10); gctx.lineTo(gpad, GH - gpad); gctx.lineTo(GW - 10, GH - gpad); gctx.stroke();
    gctx.fillStyle = '#ffffff55'; gctx.font = '11px monospace';
    gctx.fillText('t (s)', GW - 36, GH - gpad - 8);
    gctx.fillText('y (m)', gpad + 8, 22);

    const sX = (GW - gpad * 2) / (tTotal * 1.1);
    const sY = (GH - gpad * 2) / (h * 1.1);

    
    gctx.strokeStyle = '#e8a04a'; gctx.lineWidth = 2;
    gctx.beginPath();
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tTotal;
      const y = h - v0 * t - 0.5 * g * t * t;
      const px = gpad + t * sX;
      const py = GH - gpad - Math.max(0, y) * sY;
      i === 0 ? gctx.moveTo(px, py) : gctx.lineTo(px, py);
    }
    gctx.stroke();

    gctx.strokeStyle = '#7dcb7d'; gctx.lineWidth = 1.5; gctx.setLineDash([4, 3]);
    gctx.beginPath();
    const vMax = v0 + g * tTotal;
    for (let i = 0; i <= 200; i++) {
      const t = (i / 200) * tTotal;
      const v = v0 + g * t;
      const px = gpad + t * sX;
      const py = GH - gpad - (v / vMax) * (GH - gpad * 2);
      i === 0 ? gctx.moveTo(px, py) : gctx.lineTo(px, py);
    }
    gctx.stroke();
    gctx.setLineDash([]);

    if (t_atual > 0) {
      const px = gpad + t_atual * sX;
      const py = GH - gpad - Math.max(0, y_atual) * sY;
      gctx.beginPath(); gctx.arc(px, py, 6, 0, Math.PI * 2);
      gctx.fillStyle = '#e8a04a'; gctx.fill();
    }

    gctx.font = '11px monospace';
    gctx.fillStyle = '#e8a04a'; gctx.fillText('— y(t)', GW - 70, 22);
    gctx.fillStyle = '#7dcb7d'; gctx.fillText('-- v(t)', GW - 70, 36);
  }

  function _qlLaunch() {
    if (_qlState.animating) return;
    const g  = parseFloat(document.getElementById('ql-g')?.value  || 10);
    const h  = parseFloat(document.getElementById('ql-h')?.value  || 100);
    const v0 = parseFloat(document.getElementById('ql-v0')?.value || 0);
    const tTotal = (-v0 + Math.sqrt(v0*v0 + 2*g*h)) / g;
    _qlState = { animating: true, t: 0, tTotal };

    let last = performance.now();
    function step(now) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      _qlState.t += dt * 1.2;
      if (_qlState.t >= tTotal) { _qlState.t = tTotal; _qlState.animating = false; }
      _qlDraw(_qlState.t);
      if (_qlState.animating) _loops.queda = requestAnimationFrame(step);
    }
    _loops.queda = requestAnimationFrame(step);
  }

  function _initQueda() {
    setTimeout(() => { _qlState = { animating: false, t: 0 }; _qlUpdate(); }, 50);
  }

  function _htmlOndas() {
    return `
      <div class="fi-layout">
        <div class="fi-controls">
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Onda 1 (laranja)</div>
            <div class="fi-slider-row">
              <label>Amplitude (A)</label>
              <input type="range" id="on-a1" min="10" max="100" value="60" step="1" oninput="FisicaInterativa._onUpdate()"/>
              <span id="on-a1-val">60</span>
            </div>
            <div class="fi-slider-row">
              <label>Frequência (f)</label>
              <input type="range" id="on-f1" min="1" max="10" value="2" step="0.5" oninput="FisicaInterativa._onUpdate()"/>
              <span id="on-f1-val">2 Hz</span>
            </div>
            <div class="fi-slider-row">
              <label>Fase (φ)</label>
              <input type="range" id="on-p1" min="0" max="360" value="0" step="5" oninput="FisicaInterativa._onUpdate()"/>
              <span id="on-p1-val">0°</span>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Onda 2 (azul)</div>
            <div class="fi-slider-row">
              <label>Amplitude (A)</label>
              <input type="range" id="on-a2" min="10" max="100" value="40" step="1" oninput="FisicaInterativa._onUpdate()"/>
              <span id="on-a2-val">40</span>
            </div>
            <div class="fi-slider-row">
              <label>Frequência (f)</label>
              <input type="range" id="on-f2" min="1" max="10" value="3" step="0.5" oninput="FisicaInterativa._onUpdate()"/>
              <span id="on-f2-val">3 Hz</span>
            </div>
            <div class="fi-slider-row">
              <label>Fase (φ)</label>
              <input type="range" id="on-p2" min="0" max="360" value="90" step="5" oninput="FisicaInterativa._onUpdate()"/>
              <span id="on-p2-val">90°</span>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Fórmulas</div>
            <div class="fi-formula">
              y(x,t) = A·sin(kx - ωt + φ)<br>
              ω = 2πf (freq. angular)<br>
              k = 2π/λ (nº de onda)<br>
              v = λ·f (vel. de fase)
            </div>
          </div>
          <label class="fi-check"><input type="checkbox" id="on-soma" checked oninput="FisicaInterativa._onUpdate()"> Mostrar superposição</label>
          <button class="fi-btn-launch" onclick="FisicaInterativa._explicarIA()" style="margin-top:8px;background:var(--bg-3);color:var(--accent);border:1px solid var(--accent)">🤖 Explicar com IA</button>
        </div>
        <div class="fi-canvas-wrap">
          <canvas id="on-canvas"></canvas>
        </div>
      </div>
    `;
  }

  let _onTime = 0;

  function _onUpdate() {
    const v = id => parseFloat(document.getElementById(id)?.value);
    document.getElementById('on-a1-val').textContent = v('on-a1');
    document.getElementById('on-f1-val').textContent = `${v('on-f1')} Hz`;
    document.getElementById('on-p1-val').textContent = `${v('on-p1')}°`;
    document.getElementById('on-a2-val').textContent = v('on-a2');
    document.getElementById('on-f2-val').textContent = `${v('on-f2')} Hz`;
    document.getElementById('on-p2-val').textContent = `${v('on-p2')}°`;
  }

  function _onDraw(t) {
    const canvas = document.getElementById('on-canvas');
    if (!canvas) return;
    canvas.width  = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const v = id => parseFloat(document.getElementById(id)?.value || 0);
    const A1 = v('on-a1'), f1 = v('on-f1'), p1 = v('on-p1') * Math.PI / 180;
    const A2 = v('on-a2'), f2 = v('on-f2'), p2 = v('on-p2') * Math.PI / 180;
    const soma = document.getElementById('on-soma')?.checked;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = '#ffffff0d'; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

    ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
    ctx.fillStyle = '#ffffff33'; ctx.font = '10px monospace';
    ctx.fillText('0', 4, H/2 - 4);

    const drawWave = (A, f, phase, color, label) => {
      ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const xNorm = x / W * Math.PI * 4;
        const y = H / 2 - A * Math.sin(2 * Math.PI * f * (xNorm / (Math.PI * 4)) - 2 * Math.PI * f * t + phase);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = color; ctx.font = '12px monospace';
      ctx.fillText(label, 8, 20 + (label.includes('1') ? 0 : 18));
    };

    drawWave(A1, f1, p1, '#e8a04a', 'Onda 1');
    drawWave(A2, f2, p2, '#5d9de8', 'Onda 2');

    if (soma) {
      ctx.strokeStyle = '#7dcb7d'; ctx.lineWidth = 2; ctx.setLineDash([5, 3]);
      ctx.beginPath();
      for (let x = 0; x <= W; x++) {
        const xNorm = x / W * Math.PI * 4;
        const y1 = A1 * Math.sin(2 * Math.PI * f1 * (xNorm / (Math.PI * 4)) - 2 * Math.PI * f1 * t + p1);
        const y2 = A2 * Math.sin(2 * Math.PI * f2 * (xNorm / (Math.PI * 4)) - 2 * Math.PI * f2 * t + p2);
        const y = H / 2 - (y1 + y2);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#7dcb7d'; ctx.font = '12px monospace';
      ctx.fillText('Superposição', 8, 54);
    }
  }

  function _initOndas() {
    setTimeout(() => {
      _onUpdate();
      let last = performance.now();
      function step(now) {
        _onTime += (now - last) / 1000;
        last = now;
        _onDraw(_onTime);
        _loops.ondas = requestAnimationFrame(step);
      }
      _loops.ondas = requestAnimationFrame(step);
    }, 50);
  }

  function _htmlCircuitos() {
    return `
      <div class="fi-layout">
        <div class="fi-controls">
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Fonte</div>
            <div class="fi-slider-row">
              <label>Tensão (V)</label>
              <input type="range" id="ci-v" min="1" max="220" value="12" step="1" oninput="FisicaInterativa._ciUpdate()"/>
              <span id="ci-v-val">12 V</span>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Resistores</div>
            <div class="fi-slider-row">
              <label>R₁ (Ω)</label>
              <input type="range" id="ci-r1" min="1" max="1000" value="100" step="1" oninput="FisicaInterativa._ciUpdate()"/>
              <span id="ci-r1-val">100 Ω</span>
            </div>
            <div class="fi-slider-row">
              <label>R₂ (Ω)</label>
              <input type="range" id="ci-r2" min="1" max="1000" value="200" step="1" oninput="FisicaInterativa._ciUpdate()"/>
              <span id="ci-r2-val">200 Ω</span>
            </div>
            <div class="fi-slider-row">
              <label>R₃ (Ω)</label>
              <input type="range" id="ci-r3" min="1" max="1000" value="300" step="1" oninput="FisicaInterativa._ciUpdate()"/>
              <span id="ci-r3-val">300 Ω</span>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Ligação</div>
            <div class="fi-toggle" style="display:flex;gap:6px;">
              <button class="fi-tab-sm active" id="ci-serie-btn" onclick="FisicaInterativa._ciSetMode('serie')">Série</button>
              <button class="fi-tab-sm" id="ci-para-btn"  onclick="FisicaInterativa._ciSetMode('paralelo')">Paralelo</button>
              <button class="fi-tab-sm" id="ci-mist-btn"  onclick="FisicaInterativa._ciSetMode('misto')">Misto</button>
            </div>
          </div>
          <div class="fi-ctrl-group">
            <div class="fi-section-lbl">Fórmulas</div>
            <div class="fi-formula" id="ci-formulas">
              Série: Req = R1+R2+R3<br>
              I = V/Req<br>
              P = V·I = I²R
            </div>
          </div>
          <div class="fi-result-grid" id="ci-results" style="margin-top:8px;"></div>
          <button class="fi-btn-launch" onclick="FisicaInterativa._explicarIA()" style="margin-top:8px;background:var(--bg-3);color:var(--accent);border:1px solid var(--accent)">🤖 Explicar com IA</button>
        </div>
        <div class="fi-canvas-wrap">
          <canvas id="ci-canvas"></canvas>
        </div>
      </div>
    `;
  }

  let _ciMode = 'serie';

  function _ciSetMode(mode) {
    _ciMode = mode;
    ['serie','para','mist'].forEach(m => document.getElementById(`ci-${m}-btn`)?.classList.remove('active'));
    const map = { serie: 'serie', paralelo: 'para', misto: 'mist' };
    document.getElementById(`ci-${map[mode]}-btn`)?.classList.add('active');
    _ciUpdate();
  }

  function _ciUpdate() {
    const V  = parseFloat(document.getElementById('ci-v')?.value  || 12);
    const R1 = parseFloat(document.getElementById('ci-r1')?.value || 100);
    const R2 = parseFloat(document.getElementById('ci-r2')?.value || 200);
    const R3 = parseFloat(document.getElementById('ci-r3')?.value || 300);

    document.getElementById('ci-v-val').textContent  = `${V} V`;
    document.getElementById('ci-r1-val').textContent = `${R1} Ω`;
    document.getElementById('ci-r2-val').textContent = `${R2} Ω`;
    document.getElementById('ci-r3-val').textContent = `${R3} Ω`;

    let Req, I, formulas;
    if (_ciMode === 'serie') {
      Req = R1 + R2 + R3;
      I = V / Req;
      formulas = `Série: Req = R1+R2+R3<br>Req = ${Req.toFixed(1)} Ω<br>I = V/Req = ${I.toFixed(3)} A`;
    } else if (_ciMode === 'paralelo') {
      Req = 1 / (1/R1 + 1/R2 + 1/R3);
      I = V / Req;
      formulas = `Paralelo: 1/Req = 1/R1+1/R2+1/R3<br>Req = ${Req.toFixed(1)} Ω<br>I_total = ${I.toFixed(3)} A`;
    } else {
      const Rpar = 1 / (1/R2 + 1/R3);
      Req = R1 + Rpar;
      I = V / Req;
      formulas = `Misto: R1 série com (R2∥R3)<br>R2∥R3 = ${Rpar.toFixed(1)} Ω<br>Req = ${Req.toFixed(1)} Ω`;
    }

    const P = V * I;
    document.getElementById('ci-formulas').innerHTML = formulas;
    document.getElementById('ci-results').innerHTML = `
      <div class="fi-res"><span>Req</span><b>${Req.toFixed(1)} Ω</b></div>
      <div class="fi-res"><span>Corrente total</span><b>${I.toFixed(3)} A</b></div>
      <div class="fi-res"><span>Potência</span><b>${P.toFixed(2)} W</b></div>
      <div class="fi-res"><span>V em R1</span><b>${(I*R1).toFixed(2)} V</b></div>
    `;
    _ciDraw(V, R1, R2, R3, I, Req);
  }

  function _ciDraw(V, R1, R2, R3, I, Req) {
    const canvas = document.getElementById('ci-canvas');
    if (!canvas) return;
    canvas.width  = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    const cx = W / 2, cy = H / 2;
    const pad = 60;

    const wireColor  = '#5d9de8';
    const resColor   = '#e8a04a';
    const srcColor   = '#7dcb7d';
    const textColor  = '#c8b89a';

    ctx.lineWidth = 3;
    ctx.strokeStyle = wireColor;
    ctx.lineCap = 'round';

    const drawResistor = (x, y, horiz, label, value, current) => {
      const len = horiz ? 60 : 40;
      const h   = horiz ? 16 : 26;
      ctx.fillStyle = resColor + '33';
      ctx.strokeStyle = resColor;
      ctx.lineWidth = 2;
      if (horiz) {
        ctx.beginPath(); ctx.rect(x - len/2, y - h/2, len, h); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - len/2 - 20, y); ctx.lineTo(x - len/2, y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x + len/2, y); ctx.lineTo(x + len/2 + 20, y); ctx.stroke();
      } else {
        ctx.beginPath(); ctx.rect(x - h/2, y - len/2, h, len); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, y - len/2 - 16); ctx.lineTo(x, y - len/2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + len/2); ctx.lineTo(x, y + len/2 + 16); ctx.stroke();
      }
      ctx.fillStyle = resColor; ctx.font = 'bold 12px monospace';
      ctx.fillText(label, x + (horiz ? -8 : 16), y + (horiz ? -22 : 4));
      ctx.fillStyle = textColor; ctx.font = '10px monospace';
      ctx.fillText(`${value}Ω`, x + (horiz ? -12 : 16), y + (horiz ? -10 : 18));
      if (current) {
        ctx.fillStyle = '#7dcb7d'; ctx.font = '10px monospace';
        ctx.fillText(`${current}A`, x + (horiz ? -12 : 16), y + (horiz ? 26 : 32));
      }
    };

    const drawBattery = (x, y) => {
      ctx.strokeStyle = srcColor; ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const w = i % 2 === 0 ? 28 : 18;
        ctx.beginPath(); ctx.moveTo(x - w/2, y - 28 + i * 19); ctx.lineTo(x + w/2, y - 28 + i * 19); ctx.stroke();
      }
      ctx.fillStyle = srcColor; ctx.font = 'bold 11px monospace';
      ctx.fillText(`${V}V`, x - 14, y + 28);
      ctx.fillText('+', x - 5, y - 36);
      ctx.fillText('−', x - 5, y + 22);
    };

    if (_ciMode === 'serie') {
      const top = cy - 100, bot = cy + 100, left = cx - 180, right = cx + 180;
      ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(left, top); ctx.lineTo(right, top);
      ctx.moveTo(left, bot); ctx.lineTo(right, bot);
      ctx.moveTo(left, top); ctx.lineTo(left, bot);
      ctx.moveTo(right, top); ctx.lineTo(right, bot);
      ctx.stroke();
      drawResistor(cx - 90, top, true, 'R1', R1, I.toFixed(3));
      drawResistor(cx,      top, true, 'R2', R2, I.toFixed(3));
      drawResistor(cx + 90, top, true, 'R3', R3, I.toFixed(3));
      drawBattery(left, cy);
      ctx.strokeStyle = '#7dcb7d'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx - 20, bot); ctx.lineTo(cx + 20, bot); ctx.stroke();
      ctx.fillStyle = '#7dcb7d';
      ctx.beginPath(); ctx.moveTo(cx + 20, bot - 5); ctx.lineTo(cx + 28, bot); ctx.lineTo(cx + 20, bot + 5); ctx.fill();
      ctx.font = '11px monospace'; ctx.fillText(`I=${I.toFixed(3)}A`, cx + 32, bot + 4);

    } else if (_ciMode === 'paralelo') {
      const top = cy - 110, bot = cy + 110, left = cx - 160, right = cx + 160;
      ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(left, top); ctx.lineTo(right, top);
      ctx.moveTo(left, bot); ctx.lineTo(right, bot);
      ctx.moveTo(left, top); ctx.lineTo(left, bot);
      ctx.stroke();
      const xs = [cx - 80, cx, cx + 80];
      const Rs = [R1, R2, R3];
      const labels = ['R1','R2','R3'];
      xs.forEach((x, i) => {
        ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke();
        drawResistor(x, cy, false, labels[i], Rs[i], (V / Rs[i]).toFixed(3));
      });
      drawBattery(right, cy);
      ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(right, top); ctx.lineTo(right, bot); ctx.stroke();

    } else {
      const top = cy - 110, bot = cy + 110, left = cx - 180, right = cx + 160;
      ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(left, top); ctx.lineTo(right, top);
      ctx.moveTo(left, bot); ctx.lineTo(right, bot);
      ctx.moveTo(left, top); ctx.lineTo(left, bot);
      ctx.stroke();
      drawResistor(cx - 80, top, true, 'R1', R1, I.toFixed(3));
      const nodeX = cx + 20;
      ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(nodeX - 40, top); ctx.lineTo(nodeX, top); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nodeX, top); ctx.lineTo(nodeX, top + 30); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(nodeX, top); ctx.lineTo(nodeX, top - 0); ctx.stroke();
      [{ x: nodeX - 30, dy: 0 }, { x: nodeX + 30, dy: 0 }].forEach(({ x }, i) => {
        ctx.strokeStyle = wireColor; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(nodeX, top); ctx.lineTo(x, top); ctx.lineTo(x, bot); ctx.lineTo(nodeX, bot); ctx.stroke();
      });
      drawResistor(nodeX - 30, cy, false, 'R2', R2, (V - I*R1).toFixed(2) + '/' + R2 + '≈' + ((V - I*R1)/R2).toFixed(3));
      drawResistor(nodeX + 30, cy, false, 'R3', R3, (V - I*R1).toFixed(2) + '/' + R3 + '≈' + ((V - I*R1)/R3).toFixed(3));
      ctx.beginPath(); ctx.moveTo(nodeX, bot); ctx.lineTo(right, bot); ctx.stroke();
      drawBattery(left, cy);
    }
  }

  function _initCircuitos() {
    _ciMode = 'serie';
    setTimeout(() => _ciUpdate(), 50);
  }

  function _injectStyles() {
    if (document.getElementById('fi-styles')) return;
    const s = document.createElement('style');
    s.id = 'fi-styles';
    s.textContent = `
      .fi-box {
        width: 94vw; max-width: 1120px; height: 88vh;
        background: var(--bg-2, #1a1612); border-radius: 20px;
        display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid var(--border, #3a3228);
        box-shadow: 0 24px 80px rgba(0,0,0,.75);
      }
      .fi-header {
        padding: 12px 20px; border-bottom: 1px solid var(--border, #3a3228);
        display: flex; justify-content: space-between; align-items: center; gap: 12px;
        background: var(--bg-1, #120f0b); flex-wrap: wrap;
      }
      .fi-title { font-size: 16px; font-weight: 700; color: var(--text-0, #f0e6d3); white-space: nowrap; }
      .fi-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
      .fi-tab {
        padding: 6px 14px; border-radius: 10px; border: 1px solid var(--border, #3a3228);
        background: none; color: var(--text-2, #8a7a6a); font-size: 12px; font-weight: 600; cursor: pointer;
        transition: all .15s;
      }
      .fi-tab.active { background: var(--accent, #e8a04a); color: #1a0f00; border-color: var(--accent, #e8a04a); }
      .fi-tab-sm {
        padding: 5px 10px; border-radius: 8px; border: 1px solid var(--border, #3a3228);
        background: none; color: var(--text-2, #8a7a6a); font-size: 11px; font-weight: 600; cursor: pointer;
        transition: all .15s;
      }
      .fi-tab-sm.active { background: var(--accent, #e8a04a); color: #1a0f00; border-color: var(--accent, #e8a04a); }
      .fi-close { background: none; border: none; color: var(--text-2); font-size: 22px; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
      .fi-close:hover { background: var(--bg-3, #211d18); }
      .fi-body { flex: 1; overflow: hidden; }
      .fi-layout { display: grid; grid-template-columns: 220px 1fr; height: 100%; overflow: hidden; }
      .fi-controls {
        background: var(--bg-1, #120f0b); border-right: 1px solid var(--border, #3a3228);
        padding: 14px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 4px;
      }
      .fi-canvas-wrap { background: #0d0d0d; overflow: hidden; position: relative; }
      .fi-canvas-wrap canvas { width: 100% !important; height: 100% !important; display: block; }
      .fi-ctrl-group { margin-bottom: 4px; }
      .fi-section-lbl { font-size: 10px; font-weight: 700; color: var(--text-3, #5a4a3a); text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px; }
      .fi-slider-row { display: flex; flex-direction: column; gap: 2px; margin-bottom: 8px; }
      .fi-slider-row label { font-size: 11px; color: var(--text-2, #8a7a6a); }
      .fi-slider-row input[type=range] { width: 100%; accent-color: var(--accent, #e8a04a); }
      .fi-slider-row span { font-size: 11px; color: var(--accent, #e8a04a); font-weight: 600; text-align: right; }
      .fi-result-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
      .fi-res { background: var(--bg-3, #211d18); border-radius: 8px; padding: 8px; border: 1px solid var(--border, #3a3228); }
      .fi-res span { font-size: 10px; color: var(--text-3, #5a4a3a); display: block; }
      .fi-res b { font-size: 13px; color: var(--accent, #e8a04a); }
      .fi-formula { background: var(--bg-3, #211d18); border-radius: 8px; padding: 10px; font-size: 11px; color: var(--text-2, #8a7a6a); line-height: 1.9; font-family: var(--font-mono, monospace); border: 1px solid var(--border, #3a3228); }
      .fi-btn-launch { margin-top: auto; padding: 10px; background: var(--accent, #e8a04a); color: #1a0f00; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .15s; }
      .fi-btn-launch:hover { opacity: .85; }
      .fi-check { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-2, #8a7a6a); cursor: pointer; padding: 4px 0; }
      .fi-check input { accent-color: var(--accent, #e8a04a); }
    `;
    document.head.appendChild(s);
  }

  async function _explicarIA() {
    let prompt = `Explique brevemente o fenômeno físico de ${_activeTab} no contexto de um simulador. `;
    
    if (_activeTab === 'projetil') {
      const v0 = document.getElementById('pj-v0').value;
      const ang = document.getElementById('pj-ang').value;
      prompt += `Parâmetros: Velocidade ${v0}m/s, Ângulo ${ang}°. Explique como o ângulo afeta o alcance.`;
    } else if (_activeTab === 'queda') {
      const h = document.getElementById('ql-h').value;
      prompt += `Parâmetros: Altura ${h}m. Explique por que a massa não afeta o tempo de queda no vácuo.`;
    } else if (_activeTab === 'circuitos') {
      prompt += `Circuito em modo ${_ciMode}. Explique a diferença entre série e paralelo para a resistência equivalente.`;
    }

    try {
      if (window.App && App.toast) App.toast("🤖 IA está analisando os dados...", "info");
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: "Você é um professor de física didático e encorajador." })
      });
      const data = await res.json();
      if (window.App && App.toast) App.toast("🤖 " + data.response, "success");
      else alert(data.response);
    } catch (e) {
      console.error(e);
    }
  }

  return { abrir, fechar, setTab, _pjUpdate, _pjLaunch, _qlUpdate, _qlLaunch, _onUpdate, _ciUpdate, _ciSetMode, _explicarIA };
})();

window.FisicaInterativa = FisicaInterativa;
window.abrirFisica = function(t) { FisicaInterativa.abrir(t); };
