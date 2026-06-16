
const CienciasVida = (() => {
  const MODAL_ID = 'modal-ciencias-vida';

  let state = {
    tab: 'evolucao',
    animId: null,
    timers: [],
    three: { scene: null, camera: null, renderer: null, group: null },
    pop: [], food: [], gen: 0, genTimer: 0,
    bioTime: 0, bioRunning: false,
    cellPhase: 'interf',
    imunoPathogens: [], imunoNeutralized: 0,
  };

 
  function abrir(aba = 'evolucao') {
    document.getElementById(MODAL_ID)?.remove();
    _stopAnims();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText = `
      position:fixed; inset:0; z-index:100010;
      background: rgba(6, 8, 18, 0.97);
      display:flex; align-items:center; justify-content:center;
      backdrop-filter: blur(12px); animation: cvFadeIn 0.3s ease;
    `;

    modal.innerHTML = `
      <style>
        @keyframes cvFadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes cvPulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes cellGrow { from{transform:scale(0.85);opacity:0} to{transform:scale(1);opacity:1} }

        #cv-box {
          width:96vw; max-width:1280px; height:92vh;
          background: linear-gradient(135deg, #0c1525 0%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; display:flex; flex-direction:column; overflow:hidden;
          box-shadow: 0 50px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03) inset;
        }
        .cv-header {
          padding: 14px 24px;
          background: linear-gradient(90deg, rgba(16,185,129,0.06) 0%, transparent 60%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:space-between;
        }
        .cv-tabs {
          display:flex; gap:2px; padding: 8px 16px;
          background: rgba(0,0,0,0.3); overflow-x:auto; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .cv-tab {
          padding: 7px 14px; border:none; background:transparent;
          color:#64748b; cursor:pointer; font-size:12px; font-weight:600;
          border-radius:8px; white-space:nowrap; transition:all 0.2s; letter-spacing:0.2px;
        }
        .cv-tab:hover { background: rgba(255,255,255,0.05); color:#94a3b8; }
        .cv-tab.active { background: rgba(34,197,94,0.12); color:#4ade80; box-shadow: 0 0 0 1px rgba(34,197,94,0.2) inset; }
        .cv-body { flex:1; position:relative; overflow:hidden; display:flex; }
        .cv-panel { flex:1; display:flex; flex-direction:column; padding:20px; gap:16px; overflow:hidden; }
        .cv-sidebar {
          width:270px; background: rgba(0,0,0,0.25);
          border-left: 1px solid rgba(255,255,255,0.05);
          padding:18px; overflow-y:auto; display:flex; flex-direction:column; gap:12px;
        }
        .cv-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px; padding:14px;
        }
        .cv-btn {
          background: rgba(255,255,255,0.06); color:#e2e8f0;
          border: 1px solid rgba(255,255,255,0.08); padding: 9px 12px;
          border-radius: 8px; cursor: pointer; width: 100%;
          transition: all 0.2s; font-size: 12px; font-weight: 600;
          text-align:left;
        }
        .cv-btn:hover { background: rgba(255,255,255,0.1); }
        .cv-btn-danger {
          background: rgba(239,68,68,0.12); color: #fca5a5;
          border: 1px solid rgba(239,68,68,0.2); padding: 9px 12px;
          border-radius: 8px; cursor: pointer; width: 100%;
          transition: all 0.2s; font-size: 12px; font-weight: 600;
        }
        .cv-btn-danger:hover { background: rgba(239,68,68,0.2); }
        .cv-label { font-size:10px; color:#475569; font-weight:600; letter-spacing:0.5px; text-transform:uppercase; }
        .cv-stat-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.03); }
        .cv-stat-val { font-family:'DM Mono',monospace; font-size:12px; color:#4ade80; }
        canvas { border-radius: 10px; background: #020617; }

       
        #cell-svg * { transition: all 0.6s ease; }
        .cell-phase-btn { padding:8px 14px; border:none; font-size:11px; font-weight:700; border-radius:8px; cursor:pointer; transition:0.2s; }
        .cell-phase-btn.active { background:rgba(168,85,247,0.2); color:#c084fc; box-shadow: 0 0 0 1px rgba(168,85,247,0.3) inset; }
        .cell-phase-btn:not(.active) { background:rgba(255,255,255,0.04); color:#64748b; }

       
        .filo-node { cursor:pointer; }
        .filo-node circle { transition:0.2s; }
        .filo-node:hover circle { filter:brightness(1.4); }
        .filo-tooltip {
          position:absolute; background:#1e293b; border:1px solid rgba(255,255,255,0.1);
          border-radius:8px; padding:10px 14px; font-size:11px; color:#e2e8f0;
          pointer-events:none; max-width:200px; line-height:1.5; z-index:10;
          box-shadow:0 8px 24px rgba(0,0,0,0.5);
        }

     
        #tank-liquid { transition: height 0.8s ease, background 0.8s ease; }
        .bio-phase-badge {
          display:inline-block; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700;
        }
      </style>
      <div id="cv-box">
        <div class="cv-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#10b981,#3b82f6);display:flex;align-items:center;justify-content:center;font-size:18px;">🧬</div>
            <div>
              <h2 style="font-family:'DM Serif Display',serif; color:#f1f5f9; margin:0; font-size:18px;">Ciências da Vida PRO</h2>
              <div style="font-size:10px; color:#475569; margin-top:1px;">Laboratório Virtual Interativo · v2.0</div>
            </div>
          </div>
          <button onclick="CienciasVida.fechar()" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08); color:#94a3b8; padding:8px 14px; border-radius:8px; cursor:pointer; transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.05)'">✕ Fechar</button>
        </div>
        <div class="cv-tabs">
          <button class="cv-tab" data-tab="evolucao"    onclick="CienciasVida.setTab('evolucao')">🐒 Evolução</button>
          <button class="cv-tab" data-tab="fisiologia"  onclick="CienciasVida.setTab('fisiologia')">🫀 Fisiologia</button>
          <button class="cv-tab" data-tab="celula"      onclick="CienciasVida.setTab('celula')">🔬 Divisão Celular</button>
          <button class="cv-tab" data-tab="biorreator"  onclick="CienciasVida.setTab('biorreator')">🧪 Biorreator</button>
          <button class="cv-tab" data-tab="filogenia"   onclick="CienciasVida.setTab('filogenia')">🌳 Filogenia</button>
          <button class="cv-tab" data-tab="imuno"       onclick="CienciasVida.setTab('imuno')">🛡️ Imunologia</button>
        </div>
        <div class="cv-body" id="cv-content"></div>
      </div>
    `;
    document.body.appendChild(modal);
    setTab(aba);
  }

  function setTab(t) {
    state.tab = t;
    _stopAnims();
    document.querySelectorAll('.cv-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === t));
    const content = document.getElementById('cv-content');
    if (!content) return;
    const map = { evolucao: _renderEvolucao, fisiologia: _renderFisiologia, celula: _renderCelula, biorreator: _renderBiorreator, filogenia: _renderFilogenia, imuno: _renderImuno };
    map[t]?.(content);
  }

 
  function _renderEvolucao(container) {
    container.innerHTML = `
      <div class="cv-panel" style="padding:0;">
        <canvas id="cv-evol-canvas" style="width:100%;height:100%;border-radius:0;"></canvas>
      </div>
      <div class="cv-sidebar">
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Algoritmo Genético</div>
          <p style="font-size:11px; color:#64748b; line-height:1.6; margin:0;">Seleção natural em tempo real. Organismos mais eficientes se reproduzem, herdando velocidade e cor com mutações aleatórias.</p>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Estatísticas</div>
          <div id="cv-evol-stats" style="display:flex;flex-direction:column;gap:4px;"></div>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Legenda</div>
          <div style="font-size:11px;color:#64748b;line-height:1.8;">
            🟢 Comida (nutriente)<br>
            ● Organismo (cor = genótipo)<br>
            ━ Barra de energia
          </div>
        </div>
        <button onclick="CienciasVida.resetEvol()" class="cv-btn">🔄 Reiniciar População</button>
      </div>`;
    _initEvolEngine();
  }

  function _initEvolEngine() {
    const canvas = document.getElementById('cv-evol-canvas'); if (!canvas) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    state.gen = 0; state.genTimer = 0;

    state.pop = Array.from({ length: 20 }, (_, i) => _newOrganism(W, H));
    state.food = Array.from({ length: 80 }, () => ({ x: Math.random() * W, y: Math.random() * H }));

    function loop() {
      if (state.tab !== 'evolucao') return;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.22)'; ctx.fillRect(0, 0, W, H);

      state.food.forEach(f => {
        ctx.beginPath(); ctx.arc(f.x, f.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e'; ctx.fill();
      });

     
      const children = [];
      state.pop.forEach(p => {
        p.energy -= p.speed * 0.07;
        p.age = (p.age || 0) + 1;

        
        let target = null, minDist = 200;
        state.food.forEach(f => {
          const d = Math.hypot(f.x - p.x, f.y - p.y);
          if (d < minDist) { minDist = d; target = f; }
        });

        if (target) {
          const angle = Math.atan2(target.y - p.y, target.x - p.x);
          p.vx += Math.cos(angle) * 0.25; p.vy += Math.sin(angle) * 0.25;
        } else {
          p.vx += (Math.random() - 0.5) * 0.25; p.vy += (Math.random() - 0.5) * 0.25;
        }

        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx * p.speed; p.y += p.vy * p.speed;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > W) { p.x = W; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > H) { p.y = H; p.vy *= -1; }

        
        if (target && minDist < 9) {
          p.energy = Math.min(200, p.energy + 50);
          state.food = state.food.filter(f => f !== target);
          state.food.push({ x: Math.random() * W, y: Math.random() * H });
        }

       
        if (p.energy > 160) {
          p.energy = 80;
          const hue = parseInt(p.color.match(/\d+/)[0]);
          children.push({
            ...p,
            x: p.x + (Math.random() - 0.5) * 10,
            y: p.y + (Math.random() - 0.5) * 10,
            energy: 80,
            vx: (Math.random() - 0.5), vy: (Math.random() - 0.5),
            age: 0,
            speed: Math.max(0.4, Math.min(4.5, p.speed + (Math.random() - 0.5) * 0.6)),
            color: `hsl(${(hue + (Math.random() * 30 - 15) + 360) % 360}, 70%, 60%)`
          });
          state.gen++;
        }

     
        const alpha = Math.min(1, p.energy / 80);
        ctx.globalAlpha = 0.3 + alpha * 0.7;
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.fillStyle = p.color; ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.globalAlpha = 1;

       
        const barW = 14;
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(p.x - barW / 2, p.y - 11, barW, 2);
        ctx.fillStyle = p.energy > 80 ? '#22c55e' : '#f97316';
        ctx.fillRect(p.x - barW / 2, p.y - 11, (p.energy / 200) * barW, 2);
      });

      state.pop = [...state.pop.filter(p => p.energy > 0), ...children];

      
      while (state.pop.length < 5) state.pop.push(_newOrganism(W, H));
      if (state.pop.length > 80) state.pop = state.pop.slice(-60);

   
      const statEl = document.getElementById('cv-evol-stats');
      if (statEl && state.pop.length > 0) {
        const avgSpeed = (state.pop.reduce((a, b) => a + b.speed, 0) / state.pop.length).toFixed(2);
        const maxSpeed = Math.max(...state.pop.map(p => p.speed)).toFixed(2);
        statEl.innerHTML = `
          <div class="cv-stat-row"><span style="font-size:11px;color:#64748b;">População</span><span class="cv-stat-val">${state.pop.length}</span></div>
          <div class="cv-stat-row"><span style="font-size:11px;color:#64748b;">Gerações</span><span class="cv-stat-val">${state.gen}</span></div>
          <div class="cv-stat-row"><span style="font-size:11px;color:#64748b;">Vel. Média</span><span class="cv-stat-val">${avgSpeed}px/f</span></div>
          <div class="cv-stat-row" style="border:none;"><span style="font-size:11px;color:#64748b;">Vel. Máx</span><span class="cv-stat-val">${maxSpeed}px/f</span></div>
        `;
      }

      state.animId = requestAnimationFrame(loop);
    }
    loop();
  }

  function _newOrganism(W, H) {
    const hue = Math.random() * 360;
    return {
      x: Math.random() * W, y: Math.random() * H,
      speed: 1 + Math.random() * 2, energy: 100, size: 5, age: 0,
      color: `hsl(${hue}, 70%, 60%)`,
      vx: (Math.random() - 0.5), vy: (Math.random() - 0.5)
    };
  }

 
  function _renderFisiologia(container) {
    container.innerHTML = `
      <div class="cv-panel" style="background:#020617; overflow:auto; align-items:center; justify-content:center;">
        <svg id="cv-body-svg" viewBox="0 0 340 520" style="height:100%;max-height:480px;width:auto;" xmlns="http://www.w3.org/2000/svg">
         
          <defs>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
          </defs>
         
          <ellipse cx="170" cy="52" rx="38" ry="46" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        
          <rect x="158" y="93" width="24" height="22" rx="4" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
         
          <rect x="110" y="112" width="120" height="170" rx="18" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
          
          <rect x="68" y="116" width="36" height="110" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
         
          <rect x="236" y="116" width="36" height="110" rx="14" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
         
          <ellipse cx="86" cy="236" rx="16" ry="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
         
          <ellipse cx="254" cy="236" rx="16" ry="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
        
          <rect x="108" y="278" width="124" height="48" rx="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
          
          <rect x="112" y="322" width="46" height="130" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
       
          <rect x="182" y="322" width="46" height="130" rx="16" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
       
          <ellipse cx="135" cy="460" rx="26" ry="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
          
          <ellipse cx="205" cy="460" rx="26" ry="12" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>

         
          <g id="sys-circulatorio" opacity="0" style="transition:opacity 0.5s;">
          
            <path d="M155 148 C155 138 170 132 170 145 C170 132 185 138 185 148 C185 162 170 175 170 175 C170 175 155 162 155 148Z" fill="rgba(239,68,68,0.7)" filter="url(#glow)"/>
            
            <path d="M170 145 L170 115 Q170 108 178 108" stroke="#ef4444" stroke-width="3" fill="none" opacity="0.8"/>
            
            <path d="M165 165 Q145 185 140 210 Q138 240 140 260" stroke="#ef4444" stroke-width="2" fill="none" opacity="0.6"/>
            <path d="M175 165 Q195 185 200 210 Q202 240 200 260" stroke="#ef4444" stroke-width="2" fill="none" opacity="0.6"/>
            
            <path d="M140 260 Q138 290 136 330 Q134 390 136 450" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.5"/>
            <path d="M200 260 Q202 290 204 330 Q206 390 204 450" stroke="#3b82f6" stroke-width="2" fill="none" opacity="0.5"/>
           
            <path d="M162 113 Q158 100 162 55" stroke="#ef4444" stroke-width="2" fill="none" opacity="0.7"/>
            <path d="M178 113 Q182 100 178 55" stroke="#ef4444" stroke-width="2" fill="none" opacity="0.7"/>
          </g>

         
          <g id="sys-nervoso" opacity="0" style="transition:opacity 0.5s;">
          
            <ellipse cx="170" cy="45" rx="30" ry="32" fill="rgba(99,102,241,0.4)" filter="url(#glow)"/>
            <path d="M145 38 Q155 28 165 38 Q175 48 185 38 Q178 28 170 25" stroke="#a5b4fc" stroke-width="1.5" fill="none"/>
           
            <path d="M170 88 L170 280" stroke="#6366f1" stroke-width="4" opacity="0.7" filter="url(#glow)"/>
           
            <path d="M165 140 Q130 155 90 145 Q80 160 86 200" stroke="#818cf8" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M175 140 Q210 155 250 145 Q260 160 254 200" stroke="#818cf8" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M165 280 Q140 300 125 380 Q122 420 130 460" stroke="#818cf8" stroke-width="1.5" fill="none" opacity="0.6"/>
            <path d="M175 280 Q200 300 215 380 Q218 420 210 460" stroke="#818cf8" stroke-width="1.5" fill="none" opacity="0.6"/>
          </g>

         
          <g id="sys-digestivo" opacity="0" style="transition:opacity 0.5s;">
          
            <path d="M170 100 L170 140" stroke="#fb923c" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
          
            <path d="M155 152 Q140 155 138 175 Q138 200 158 205 Q178 208 185 195 Q190 178 183 160 Z" fill="rgba(249,115,22,0.35)" stroke="#f97316" stroke-width="1.5"/>
          
            <path d="M160 208 Q128 215 130 240 Q130 260 155 262 Q180 264 182 242 Q184 220 165 218" stroke="#fb923c" stroke-width="2.5" fill="none" opacity="0.7"/>
        
            <path d="M165 218 Q158 240 158 262 Q158 285 170 286 Q182 285 182 262 Q182 240 175 218" stroke="#ea580c" stroke-width="3" fill="none" opacity="0.6"/>
         
            <path d="M170 286 L170 310" stroke="#ea580c" stroke-width="3" opacity="0.6"/>
          </g>

         
          <g id="sys-respiratorio" opacity="0" style="transition:opacity 0.5s;">
           
            <path d="M170 98 L170 135" stroke="#94a3b8" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
           
            <path d="M170 135 Q155 140 145 148" stroke="#94a3b8" stroke-width="3" fill="none" opacity="0.8"/>
            <path d="M170 135 Q185 140 195 148" stroke="#94a3b8" stroke-width="3" fill="none" opacity="0.8"/>
         
            <path d="M120 145 Q112 155 112 190 Q112 235 138 248 Q155 255 162 240 Q165 220 162 195 Q158 160 148 148 Z" fill="rgba(148,163,184,0.2)" stroke="#94a3b8" stroke-width="1.5" filter="url(#glow)"/>
          
            <path d="M220 145 Q228 155 228 190 Q228 235 202 248 Q185 255 178 240 Q175 220 178 195 Q182 160 192 148 Z" fill="rgba(148,163,184,0.2)" stroke="#94a3b8" stroke-width="1.5" filter="url(#glow)"/>
            
            <circle cx="135" cy="185" r="5" fill="rgba(148,163,184,0.4)"/>
            <circle cx="128" cy="200" r="5" fill="rgba(148,163,184,0.4)"/>
            <circle cx="138" cy="210" r="5" fill="rgba(148,163,184,0.4)"/>
            <circle cx="215" cy="185" r="5" fill="rgba(148,163,184,0.4)"/>
            <circle cx="222" cy="200" r="5" fill="rgba(148,163,184,0.4)"/>
            <circle cx="212" cy="210" r="5" fill="rgba(148,163,184,0.4)"/>
          </g>

       
          <text id="sys-label" x="170" y="505" text-anchor="middle" fill="#475569" font-size="11" font-family="DM Sans, sans-serif">Clique em um sistema para visualizar</text>
        </svg>
      </div>
      <div class="cv-sidebar">
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Sistemas do Corpo</div>
          <p style="font-size:11px; color:#64748b; line-height:1.6; margin:0;">Modelo anatômico com sistemas reais em SVG. Clique para isolar cada sistema.</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;">
          <button onclick="CienciasVida.highlightSys('circulatorio')" class="cv-btn">❤️ Circulatório</button>
          <button onclick="CienciasVida.highlightSys('nervoso')" class="cv-btn">🧠 Nervoso</button>
          <button onclick="CienciasVida.highlightSys('digestivo')" class="cv-btn">🫁 Digestivo</button>
          <button onclick="CienciasVida.highlightSys('respiratorio')" class="cv-btn">💨 Respiratório</button>
          <button onclick="CienciasVida.highlightSys(null)" class="cv-btn" style="color:#475569;">✕ Ocultar Sistemas</button>
        </div>
        <div class="cv-card">
          <div id="sys-desc" style="font-size:11px; color:#94a3b8; line-height:1.6;">Selecione um sistema para ver detalhes técnicos.</div>
        </div>
      </div>`;
  }

  function highlightSys(sys) {
    const systems = ['circulatorio', 'nervoso', 'digestivo', 'respiratorio'];
    const info = {
      circulatorio: "❤️ <b style='color:#ef4444'>Circulatório</b><br>Coração bombeia ~5L/min. Ciclo cardíaco: sístole + diástole. Batimentos: 60–100 bpm. Transporta O₂, CO₂, hormônios e nutrientes.",
      nervoso: "🧠 <b style='color:#818cf8'>Nervoso</b><br>Cérebro ≈ 86 bilhões de neurônios. Impulsos a 120 m/s. Divisão: SNC (cérebro + medula) e SNP (nervos periféricos).",
      digestivo: "🍊 <b style='color:#f97316'>Digestivo</b><br>Trato GI mede ~9m. Digestão inicia na boca (ptialina). Absorção de nutrientes ocorre no intestino delgado via vilosidades.",
      respiratorio: "💨 <b style='color:#94a3b8'>Respiratório</b><br>Hematose ocorre nos alvéolos pulmonares. ~300 milhões de alvéolos por pulmão. Capacidade total: ~6L de ar.",
    };
    const colors = { circulatorio: '#ef4444', nervoso: '#6366f1', digestivo: '#f97316', respiratorio: '#94a3b8' };
    systems.forEach(s => {
      const el = document.getElementById(`sys-${s}`);
      if (el) el.style.opacity = s === sys ? '1' : '0';
    });
    const label = document.getElementById('sys-label');
    if (label) label.setAttribute('fill', sys ? colors[sys] : '#475569');
    if (label) label.textContent = sys ? Object.keys(info).includes(sys) ? sys.charAt(0).toUpperCase() + sys.slice(1) : '' : 'Clique em um sistema para visualizar';
    const desc = document.getElementById('sys-desc');
    if (desc) desc.innerHTML = sys ? info[sys] : 'Selecione um sistema para ver detalhes técnicos.';
  }


  function _renderCelula(container) {
    container.innerHTML = `
      <div class="cv-panel">
        <div style="flex:1;display:flex;align-items:center;justify-content:center;background:#020617;border-radius:12px;position:relative;overflow:hidden;" id="cell-wrap">
          <svg id="cell-svg" viewBox="0 0 260 260" style="width:280px;height:280px;" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <radialGradient id="cellGrad" cx="50%" cy="50%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0f172a"/></radialGradient>
              <filter id="cellGlow"><feGaussianBlur stdDeviation="4" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
            </defs>
          </svg>
        </div>
        <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;">
          <button onclick="CienciasVida.cellStep('interf')" class="cell-phase-btn" id="phbtn-interf">Interfase</button>
          <button onclick="CienciasVida.cellStep('pro')"   class="cell-phase-btn" id="phbtn-pro">Prófase</button>
          <button onclick="CienciasVida.cellStep('met')"   class="cell-phase-btn" id="phbtn-met">Metáfase</button>
          <button onclick="CienciasVida.cellStep('ana')"   class="cell-phase-btn" id="phbtn-ana">Anáfase</button>
          <button onclick="CienciasVida.cellStep('tel')"   class="cell-phase-btn" id="phbtn-tel">Telófase</button>
        </div>
      </div>
      <div class="cv-sidebar">
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Mitose Animada</div>
          <p style="font-size:11px; color:#64748b; line-height:1.6; margin:0;">Ciclo completo de divisão celular. Observe o comportamento dos cromossomos em cada fase.</p>
        </div>
        <div class="cv-card">
          <div id="cell-phase-name" style="font-size:13px;font-weight:700;color:#c084fc;margin-bottom:6px;"></div>
          <div id="cell-desc" style="font-size:11px; color:#e2e8f0; line-height:1.6;"></div>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Duração Relativa</div>
          <div style="display:flex;flex-direction:column;gap:4px;font-size:10px;color:#64748b;">
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:60px;height:6px;background:#4ade80;border-radius:3px;"></div> Interfase (90%)</div>
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:6px;height:6px;background:#c084fc;border-radius:3px;"></div> Prófase</div>
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:4px;height:6px;background:#818cf8;border-radius:3px;"></div> Metáfase</div>
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:4px;height:6px;background:#60a5fa;border-radius:3px;"></div> Anáfase</div>
            <div style="display:flex;align-items:center;gap:6px;"><div style="width:5px;height:6px;background:#f472b6;border-radius:3px;"></div> Telófase</div>
          </div>
        </div>
      </div>`;
    cellStep('interf');
  }

  function cellStep(fase) {
    state.cellPhase = fase;
    const svg = document.getElementById('cell-svg'); if (!svg) return;
    document.querySelectorAll('.cell-phase-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`phbtn-${fase}`)?.classList.add('active');

    const phases = {
      interf: {
        name: 'Interfase (G1 → S → G2)',
        desc: 'A célula cresce e replica seu DNA. O núcleo é visível e a cromatina está descondensada. Fase mais longa do ciclo celular (~90% do tempo).',
        svg: `
          <circle cx="130" cy="130" r="115" fill="url(#cellGrad)" stroke="#334155" stroke-width="1.5"/>
          <circle cx="130" cy="130" r="55" fill="rgba(30,41,59,0.8)" stroke="#475569" stroke-width="1.5"/>
          <circle cx="130" cy="130" r="52" fill="none" stroke="rgba(168,85,247,0.3)" stroke-width="4" stroke-dasharray="6 3"/>
        
          <path d="M110 115 Q125 105 140 115 Q155 125 145 135 Q135 145 120 138 Q108 130 110 115Z" fill="rgba(168,85,247,0.25)" stroke="#a855f7" stroke-width="1"/>
          <path d="M118 140 Q130 133 142 140 Q150 148 143 155 Q133 162 122 157 Q113 150 118 140Z" fill="rgba(168,85,247,0.25)" stroke="#a855f7" stroke-width="1"/>
       
          <circle cx="130" cy="130" r="10" fill="rgba(168,85,247,0.4)"/>
         
          <circle cx="90" cy="80" r="5" fill="#60a5fa" opacity="0.8"/>
          <circle cx="170" cy="80" r="5" fill="#60a5fa" opacity="0.8"/>
         
          <ellipse cx="75" cy="140" rx="14" ry="7" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1" transform="rotate(-20 75 140)"/>
          <ellipse cx="188" cy="150" rx="12" ry="6" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1" transform="rotate(25 188 150)"/>
          <ellipse cx="160" cy="195" rx="12" ry="6" fill="rgba(249,115,22,0.3)" stroke="#f97316" stroke-width="1" transform="rotate(-10 160 195)"/>
        `
      },
      pro: {
        name: 'Prófase',
        desc: 'Cromossomos se condensam e ficam visíveis. O nucléolo desaparece e o fuso mitótico começa a se formar a partir dos centrossomos.',
        svg: `
          <circle cx="130" cy="130" r="115" fill="url(#cellGrad)" stroke="#334155" stroke-width="1.5"/>
       
          <circle cx="130" cy="130" r="55" fill="none" stroke="#475569" stroke-width="1" stroke-dasharray="8 6" opacity="0.5"/>
         
          <path d="M116 110 Q122 100 128 110 L128 148 Q122 158 116 148 Z" fill="#ef4444" rx="4"/>
          <path d="M132 110 Q138 100 144 110 L144 148 Q138 158 132 148 Z" fill="#ef4444" rx="4"/>
          <path d="M108 122 Q118 116 128 122 L128 138 Q118 144 108 138 Z" fill="#f87171" rx="4"/>
          <path d="M132 122 Q142 116 152 122 L152 138 Q142 144 132 138 Z" fill="#f87171" rx="4"/>
         
          <circle cx="90" cy="80" r="6" fill="#60a5fa" filter="url(#cellGlow)"/>
          <circle cx="170" cy="80" r="6" fill="#60a5fa" filter="url(#cellGlow)"/>
        
          <line x1="90" y1="86" x2="130" y2="130" stroke="#60a5fa" stroke-width="1" opacity="0.4"/>
          <line x1="170" y1="86" x2="130" y2="130" stroke="#60a5fa" stroke-width="1" opacity="0.4"/>
        `
      },
      met: {
        name: 'Metáfase',
        desc: 'Cromossomos se alinham na placa metafásica (equatorial). Fuso mitótico completamente formado. Fase usada no cariótipo.',
        svg: `
          <circle cx="130" cy="130" r="115" fill="url(#cellGrad)" stroke="#334155" stroke-width="1.5"/>
        
          <line x1="30" y1="130" x2="230" y2="130" stroke="#334155" stroke-width="1" stroke-dasharray="3 2"/>
          <line x1="40" y1="130" x2="120" y2="90" stroke="#60a5fa" stroke-width="1.2" opacity="0.5"/>
          <line x1="40" y1="130" x2="120" y2="130" stroke="#60a5fa" stroke-width="1.2" opacity="0.5"/>
          <line x1="40" y1="130" x2="120" y2="170" stroke="#60a5fa" stroke-width="1.2" opacity="0.5"/>
          <line x1="220" y1="130" x2="140" y2="90" stroke="#60a5fa" stroke-width="1.2" opacity="0.5"/>
          <line x1="220" y1="130" x2="140" y2="130" stroke="#60a5fa" stroke-width="1.2" opacity="0.5"/>
          <line x1="220" y1="130" x2="140" y2="170" stroke="#60a5fa" stroke-width="1.2" opacity="0.5"/>
          
          <circle cx="40" cy="130" r="7" fill="#60a5fa" filter="url(#cellGlow)"/>
          <circle cx="220" cy="130" r="7" fill="#60a5fa" filter="url(#cellGlow)"/>
       
          <rect x="117" y="82" width="10" height="28" rx="5" fill="#ef4444"/>
          <rect x="133" y="82" width="10" height="28" rx="5" fill="#f87171"/>
          <rect x="117" y="118" width="10" height="28" rx="5" fill="#a855f7"/>
          <rect x="133" y="118" width="10" height="28" rx="5" fill="#c084fc"/>
          <rect x="117" y="154" width="10" height="28" rx="5" fill="#fb923c"/>
          <rect x="133" y="154" width="10" height="28" rx="5" fill="#fbbf24"/>
        `
      },
      ana: {
        name: 'Anáfase',
        desc: 'Cromátides irmãs são separadas pelo fuso e migram para polos opostos da célula. A célula começa a se alongar.',
        svg: `
          <ellipse cx="130" cy="130" rx="115" ry="100" fill="url(#cellGrad)" stroke="#334155" stroke-width="1.5"/>
        
          <line x1="15" y1="130" x2="245" y2="130" stroke="#334155" stroke-width="1" stroke-dasharray="3 2"/>
          <circle cx="15" cy="130" r="7" fill="#60a5fa" filter="url(#cellGlow)"/>
          <circle cx="245" cy="130" r="7" fill="#60a5fa" filter="url(#cellGlow)"/>
        
          <rect x="50" y="98" width="9" height="24" rx="4" fill="#ef4444" opacity="0.9"/>
          <rect x="64" y="98" width="9" height="24" rx="4" fill="#f87171" opacity="0.9"/>
          <rect x="50" y="126" width="9" height="24" rx="4" fill="#a855f7" opacity="0.9"/>
          <rect x="64" y="126" width="9" height="24" rx="4" fill="#c084fc" opacity="0.9"/>
       
          <rect x="187" y="98" width="9" height="24" rx="4" fill="#ef4444" opacity="0.9"/>
          <rect x="201" y="98" width="9" height="24" rx="4" fill="#f87171" opacity="0.9"/>
          <rect x="187" y="126" width="9" height="24" rx="4" fill="#a855f7" opacity="0.9"/>
          <rect x="201" y="126" width="9" height="24" rx="4" fill="#c084fc" opacity="0.9"/>
          <!-- Fios do fuso -->
          <line x1="22" y1="130" x2="59" y2="110" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
          <line x1="22" y1="130" x2="59" y2="138" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
          <line x1="238" y1="130" x2="196" y2="110" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
          <line x1="238" y1="130" x2="196" y2="138" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
          
          <path d="M130 45 Q145 130 130 215" stroke="rgba(255,255,255,0.08)" stroke-width="8" fill="none"/>
        `
      },
      tel: {
        name: 'Telófase + Citocinese',
        desc: 'Dois núcleos se formam. A carioteca se reconstitui. O sulco de clivagem aparece e divide o citoplasma, originando duas células filhas.',
        svg: `
          <g>
          
            <ellipse cx="75" cy="130" rx="70" ry="100" fill="url(#cellGrad)" stroke="#334155" stroke-width="1.5"/>
            <circle cx="75" cy="130" r="32" fill="none" stroke="#a855f7" stroke-width="1.5" opacity="0.7"/>
            <circle cx="75" cy="130" r="10" fill="rgba(168,85,247,0.4)"/>
            
            <path d="M62 120 Q72 113 82 120 Q86 128 80 135 Q70 140 62 135 Z" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1"/>
            
            <ellipse cx="185" cy="130" rx="70" ry="100" fill="url(#cellGrad)" stroke="#334155" stroke-width="1.5"/>
            <circle cx="185" cy="130" r="32" fill="none" stroke="#a855f7" stroke-width="1.5" opacity="0.7"/>
            <circle cx="185" cy="130" r="10" fill="rgba(168,85,247,0.4)"/>
            <path d="M172 120 Q182 113 192 120 Q196 128 190 135 Q180 140 172 135 Z" fill="rgba(168,85,247,0.2)" stroke="#a855f7" stroke-width="1"/>
           
            <path d="M130 32 Q118 82 118 130 Q118 178 130 228" stroke="#f472b6" stroke-width="3" fill="none" stroke-linecap="round"/>
          </g>
        `
      }
    };

    const p = phases[fase];
    svg.innerHTML = `
      <defs>
        <radialGradient id="cellGrad" cx="50%" cy="50%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#0a0f1e"/></radialGradient>
        <filter id="cellGlow"><feGaussianBlur stdDeviation="3" result="blur"/><feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
      </defs>
      <g style="animation:cellGrow 0.4s ease;">
        ${p.svg}
      </g>`;

    const nameEl = document.getElementById('cell-phase-name');
    const descEl = document.getElementById('cell-desc');
    if (nameEl) nameEl.textContent = p.name;
    if (descEl) descEl.textContent = p.desc;
  }

  
  function _renderBiorreator(container) {
    state.bioTime = 0; state.bioRunning = true;
    container.innerHTML = `
      <div class="cv-panel">
        <div style="display:flex;gap:16px;flex:1;min-height:0;">
         
          <div style="display:flex;flex-direction:column;align-items:center;gap:10px;width:80px;">
            <div style="font-size:10px;color:#64748b;font-weight:600;letter-spacing:0.5px;">BIORREATOR</div>
            <div style="flex:1;width:64px;border:3px solid #475569;border-radius:12px 12px 40px 40px;position:relative;overflow:hidden;background:#020617;min-height:140px;">
              <div id="tank-liquid" style="position:absolute;bottom:0;width:100%;height:30%;background:rgba(34,197,94,0.35);border-radius:0 0 37px 37px;"></div>
              <div id="tank-foam"   style="position:absolute;bottom:30%;width:100%;height:8%;background:rgba(255,255,255,0.06);"></div>
            </div>
            <div style="display:flex;flex-direction:column;gap:4px;width:100%;text-align:center;">
              <div style="font-size:9px;color:#475569;">pH</div>
              <div id="bio-ph" style="font-size:12px;color:#4ade80;font-weight:700;font-family:monospace;">7.0</div>
              <div style="font-size:9px;color:#475569;margin-top:4px;">O₂</div>
              <div id="bio-o2" style="font-size:12px;color:#60a5fa;font-weight:700;font-family:monospace;">98%</div>
            </div>
          </div>
         
          <div style="flex:1;position:relative;min-height:0;">
            <canvas id="cv-bio-chart" style="width:100%;height:100%;background:transparent;border-radius:8px;"></canvas>
            <div style="position:absolute;bottom:8px;left:8px;display:flex;gap:14px;">
              <span style="font-size:10px;color:#4ade80;">━ Biomassa</span>
              <span style="font-size:10px;color:#f97316;">━ Substrato</span>
              <span style="font-size:10px;color:#60a5fa;">━ O₂</span>
            </div>
          </div>
        </div>
      </div>
      <div class="cv-sidebar">
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Biorreator Industrial</div>
          <p style="font-size:11px; color:#64748b; line-height:1.6; margin:0;">Curva de crescimento bacteriano completa: Lag → Log → Estacionária → Declínio.</p>
        </div>
        <div class="cv-card">
          <div id="bio-phase-label" class="bio-phase-badge" style="background:rgba(99,102,241,0.15);color:#818cf8;margin-bottom:8px;">FASE LAG</div>
          <div id="bio-stats" style="font-size:11px;color:#94a3b8;line-height:1.6;"></div>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Fases de Crescimento</div>
          <div style="font-size:10px;color:#64748b;line-height:2;">
            🔵 <b style="color:#818cf8">Lag</b> — adaptação ao meio<br>
            🟢 <b style="color:#4ade80">Log</b> — divisão exponencial<br>
            🟡 <b style="color:#fbbf24">Estacionária</b> — equilíbrio<br>
            🔴 <b style="color:#f87171">Declínio</b> — morte celular
          </div>
        </div>
        <button onclick="CienciasVida.resetBio()" class="cv-btn">🔄 Reiniciar Cultivo</button>
      </div>`;
    _initBioSim();
  }

  function _initBioSim() {
    const canvas = document.getElementById('cv-bio-chart'); if (!canvas) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    let biomass = 0.5, substrate = 100, o2 = 98;
    const histB = [], histS = [], histO = [];
    state.bioTime = 0;

    const phaseLabels = {
      lag: ['FASE LAG', 'rgba(99,102,241,0.15)', '#818cf8'],
      log: ['FASE LOG', 'rgba(34,197,94,0.15)', '#4ade80'],
      est: ['ESTACIONÁRIA', 'rgba(251,191,36,0.15)', '#fbbf24'],
      dec: ['DECLÍNIO', 'rgba(239,68,68,0.15)', '#f87171']
    };

    function getPhase(t) {
      if (t < 15) return 'lag';
      if (t < 55) return 'log';
      if (t < 80) return 'est';
      return 'dec';
    }

    function update() {
      if (state.tab !== 'biorreator' || !state.bioRunning) return;
      state.bioTime++;
      const t = state.bioTime;
      const phase = getPhase(t);

     
      const mu = phase === 'lag' ? 0.01 : phase === 'log' ? 0.06 : phase === 'est' ? 0.005 : -0.02;
      const substrateConsumption = phase === 'log' ? biomass * 0.8 : phase === 'est' ? biomass * 0.2 : 0;
      biomass = Math.max(0, Math.min(100, biomass + biomass * mu));
      substrate = Math.max(0, substrate - substrateConsumption * 0.2);
      o2 = Math.max(0, 98 - biomass * 0.8 + (phase === 'dec' ? biomass * 0.3 : 0));

      histB.push(biomass); histS.push(substrate); histO.push(o2);
      if (histB.length > 80) { histB.shift(); histS.shift(); histO.shift(); }

     
      const liq = document.getElementById('tank-liquid');
      if (liq) {
        const h = Math.min(90, 15 + biomass * 0.75);
        const color = phase === 'dec' ? 'rgba(239,68,68,0.25)' : phase === 'est' ? 'rgba(251,191,36,0.25)' : 'rgba(34,197,94,0.35)';
        liq.style.height = h + '%'; liq.style.background = color;
      }

      
      const phLabel = document.getElementById('bio-phase-label');
      if (phLabel) {
        const [label, bg, color] = phaseLabels[phase];
        phLabel.textContent = label; phLabel.style.background = bg; phLabel.style.color = color;
      }

      
      const stats = document.getElementById('bio-stats');
      if (stats) stats.innerHTML = `
        Biomassa: <b style="color:#4ade80">${biomass.toFixed(1)} g/L</b><br>
        Substrato: <b style="color:#f97316">${substrate.toFixed(1)} g/L</b><br>
        O₂ Dissolvido: <b style="color:#60a5fa">${o2.toFixed(1)}%</b><br>
        Tempo: <b style="color:#e2e8f0">${t} min</b>`;

      
      const phEl = document.getElementById('bio-ph');
      if (phEl) phEl.textContent = (7.2 - biomass * 0.02 + (substrate / 100) * 0.3).toFixed(1);
      const o2El = document.getElementById('bio-o2');
      if (o2El) o2El.textContent = o2.toFixed(0) + '%';

     
      if (canvas.width > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      
        ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
          ctx.beginPath(); ctx.moveTo(0, (i / 4) * canvas.height); ctx.lineTo(canvas.width, (i / 4) * canvas.height); ctx.stroke();
        }
        const L = histB.length;
        const drawLine = (data, color, scale = 1) => {
          if (!data.length) return;
          ctx.strokeStyle = color; ctx.lineWidth = 2.5;
          ctx.shadowBlur = 5; ctx.shadowColor = color;
          ctx.beginPath();
          data.forEach((v, i) => {
            const x = (i / 79) * canvas.width;
            const y = canvas.height - 12 - ((v * scale) / 100) * (canvas.height - 24);
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.stroke(); ctx.shadowBlur = 0;
        };
        drawLine(histB, '#4ade80', 1);
        drawLine(histS, '#f97316', 1);
        drawLine(histO, '#60a5fa', 1);
      }

      state.timers.push(setTimeout(update, 150));
    }
    update();
  }

  const filoInfo = {
    luca: { name: 'LUCA', desc: 'Last Universal Common Ancestor. Viveu há ~3,8 bilhões de anos. Organismo procariótico ancestral de toda a vida na Terra.', color: '#f8fafc' },
    bacteria: { name: 'Bacteria', desc: 'Procariontes sem carioteca. Incluem E. coli, Cyanobacteria (produtoras de O₂) e bactérias patogênicas. ~10³⁰ células na Terra.', color: '#ef4444' },
    archaea: { name: 'Archaea', desc: 'Extremófilos: vivem em fontes hidrotermais, lagos hipersalinos e permafrost. DNA circular sem introns. Mais próximos dos Eucariontes.', color: '#f97316' },
    eukarya: { name: 'Eukarya', desc: 'Células com núcleo verdadeiro (carioteca), mitocôndrias e retículo endoplasmático. Origem: endossimbiose entre Archaea e Bacteria.', color: '#22c55e' },
    fungi: { name: 'Fungi', desc: 'Heterotróficos por absorção. Parede celular de quitina. Incluem leveduras (fermentação) e cogumelos. Decompositores essenciais.', color: '#fbbf24' },
    plantae: { name: 'Plantae', desc: 'Autótrofos fotossintéticos. Cloroplastos com clorofila a e b. ~400 mil espécies. Base da maioria das cadeias alimentares terrestres.', color: '#4ade80' },
    animalia: { name: 'Animalia', desc: 'Heterotróficos multicelulares com mobilidade. ~8,7 milhões de espécies estimadas. Inclui Porifera, Cnidaria, Arthropoda e Chordata.', color: '#60a5fa' },
    chordata: { name: 'Chordata', desc: 'Possuem notocorda, corda nervosa dorsal e fendas branquiais em algum estágio. Inclui Peixes, Anfíbios, Répteis, Aves e Mamíferos.', color: '#a78bfa' },
    mammalia: { name: 'Mammalia', desc: 'Endotermos com pelos e glândulas mamárias. ~6.400 espécies. Subclasses: Prototheria (Ornitorrinco), Metatheria (Marsupiais) e Eutheria (Placentários).', color: '#f472b6' },
    homo: { name: 'Homo sapiens', desc: 'Primata da família Hominidae. Surgiu há ~300.000 anos na África. Único ser com linguagem simbólica e capacidade de ciência acumulativa.', color: '#c084fc' },
  };

  function _renderFilogenia(container) {
    container.innerHTML = `
      <div class="cv-panel" style="padding:0;position:relative;overflow:hidden;">
        <svg id="filo-svg" viewBox="0 0 720 480" style="width:100%;height:100%;" xmlns="http://www.w3.org/2000/svg">
          ${_buildFiloSVG()}
        </svg>
        <div id="filo-tooltip" class="filo-tooltip" style="display:none; position:absolute;"></div>
      </div>
      <div class="cv-sidebar">
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Árvore Filogenética</div>
          <p style="font-size:11px; color:#64748b; line-height:1.6; margin:0;">Clique em qualquer nó para ver detalhes sobre o grupo taxonômico.</p>
        </div>
        <div class="cv-card" id="filo-detail">
          <div id="filo-name" style="font-size:13px;font-weight:700;color:#4ade80;margin-bottom:6px;">Clique num nó</div>
          <div id="filo-desc" style="font-size:11px;color:#94a3b8;line-height:1.6;">Selecione qualquer grupo na árvore para ver informações detalhadas.</div>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Domínios da Vida</div>
          <div style="font-size:11px;line-height:1.9;">
            <span style="color:#ef4444;">●</span> Bacteria<br>
            <span style="color:#f97316;">●</span> Archaea<br>
            <span style="color:#22c55e;">●</span> Eukarya (Fungi, Plantae, Animalia)
          </div>
        </div>
      </div>`;

   
    document.querySelectorAll('.filo-node').forEach(node => {
      const key = node.dataset.key;
      node.addEventListener('click', () => {
        const d = filoInfo[key];
        const nameEl = document.getElementById('filo-name');
        const descEl = document.getElementById('filo-desc');
        if (nameEl) { nameEl.textContent = d.name; nameEl.style.color = d.color; }
        if (descEl) descEl.textContent = d.desc;
      });
    });
  }

  function _buildFiloSVG() {
    const nodes = {
      luca:     { x: 360, y: 40  },
      bacteria: { x: 140, y: 140 },
      archaea:  { x: 360, y: 140 },
      eukarya:  { x: 580, y: 140 },
      fungi:    { x: 460, y: 240 },
      plantae:  { x: 560, y: 240 },
      animalia: { x: 660, y: 240 },
      chordata: { x: 620, y: 340 },
      mammalia: { x: 580, y: 420 },
      homo:     { x: 650, y: 420 },
    };
    const edges = [
      ['luca','bacteria'],['luca','archaea'],['luca','eukarya'],
      ['eukarya','fungi'],['eukarya','plantae'],['eukarya','animalia'],
      ['animalia','chordata'],['chordata','mammalia'],['chordata','homo']
    ];
    let svg = `<defs><filter id="fglow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter></defs>`;
    svg += `<rect width="720" height="480" fill="#020617" rx="0"/>`;

   
    edges.forEach(([a, b]) => {
      const n1 = nodes[a], n2 = nodes[b];
      const color = filoInfo[b]?.color || '#334155';
      svg += `<path d="M${n1.x},${n1.y + 12} C${n1.x},${(n1.y + n2.y) / 2} ${n2.x},${(n1.y + n2.y) / 2} ${n2.x},${n2.y - 14}" stroke="${color}" stroke-width="1.5" fill="none" opacity="0.5"/>`;
    });

    
    Object.entries(nodes).forEach(([key, { x, y }]) => {
      const d = filoInfo[key];
      const r = key === 'luca' ? 16 : key === 'homo' ? 12 : 13;
      svg += `
        <g class="filo-node" data-key="${key}" style="cursor:pointer;">
          <circle cx="${x}" cy="${y}" r="${r + 6}" fill="${d.color}" opacity="0.08"/>
          <circle cx="${x}" cy="${y}" r="${r}" fill="${d.color}" opacity="0.85" filter="url(#fglow)"/>
          <circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${d.color}" stroke-width="1.5" opacity="0.5"/>
          <text x="${x}" y="${y + r + 14}" text-anchor="middle" fill="${d.color}" font-size="${key === 'homo' ? 9 : 10}" font-family="DM Sans,sans-serif" opacity="0.9">${d.name}</text>
        </g>`;
    });

    return svg;
  }

 
  function _renderImuno(container) {
    state.imunoPathogens = []; state.imunoNeutralized = 0;
    container.innerHTML = `
      <div class="cv-panel" style="padding:0;">
        <canvas id="cv-imuno-canvas" style="width:100%;height:100%;border-radius:0;background:#020617;"></canvas>
      </div>
      <div class="cv-sidebar">
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Resposta Imune</div>
          <p style="font-size:11px; color:#64748b; line-height:1.6; margin:0;">Simula fagocitose por Macrófagos e ativação de Células T. Anticorpos se ligam aos patógenos marcando-os para destruição.</p>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Contagem</div>
          <div id="imuno-stats" style="display:flex;flex-direction:column;gap:4px;"></div>
        </div>
        <div>
          <div class="cv-label" style="margin-bottom:8px;">Intervenções</div>
          <button onclick="CienciasVida.spawnPathogen()" class="cv-btn-danger" style="margin-bottom:6px;">💉 Injetar Bactérias 🦠</button>
          <button onclick="CienciasVida.spawnVirus()"    class="cv-btn-danger" style="margin-bottom:6px;">🧫 Injetar Vírus 🔴</button>
          <button onclick="CienciasVida.boostImune()"   class="cv-btn">💊 Reforço Imune</button>
        </div>
        <div class="cv-card">
          <div class="cv-label" style="margin-bottom:8px;">Legenda</div>
          <div style="font-size:10px;color:#64748b;line-height:2;">
            🔵 Macrófago<br>
            🟢 Célula T<br>
            🔴 Bactéria<br>
            🟠 Vírus<br>
            ✦ Anticorpo
          </div>
        </div>
      </div>`;
    _initImunoSim();
  }

  function _initImunoSim() {
    const canvas = document.getElementById('cv-imuno-canvas'); if (!canvas) return;
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    let macrophages = [
      { x: W * 0.3, y: H * 0.5, r: 32, energy: 100 },
      { x: W * 0.7, y: H * 0.35, r: 28, energy: 100 }
    ];
    let tCells = [
      { x: W * 0.5, y: H * 0.7, r: 12 },
      { x: W * 0.2, y: H * 0.3, r: 12 }
    ];
    let antibodies = [];
    state.imunoPathogens = [];
    state.imunoNeutralized = 0;
    let tick = 0;

    window.CienciasVida.spawnPathogen = () => {
      for (let i = 0; i < 12; i++) {
        state.imunoPathogens.push({ x: Math.random() * W, y: Math.random() * H, type: 'bacteria', vx: (Math.random() - 0.5) * 1.5, vy: (Math.random() - 0.5) * 1.5, tagged: false });
      }
    };
    window.CienciasVida.spawnVirus = () => {
      for (let i = 0; i < 8; i++) {
        state.imunoPathogens.push({ x: Math.random() * W, y: Math.random() * H, type: 'virus', vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2, tagged: false });
      }

      for (let i = 0; i < 6; i++) {
        antibodies.push({ x: Math.random() * W * 0.5 + W * 0.25, y: Math.random() * H * 0.5 + H * 0.25, vx: (Math.random() - 0.5) * 1, vy: (Math.random() - 0.5) * 1, target: null });
      }
    };
    window.CienciasVida.boostImune = () => {
      macrophages.forEach(m => { m.r = Math.min(50, m.r + 6); m.energy = 100; });
      tCells.push({ x: Math.random() * W, y: Math.random() * H, r: 12 });
      for (let i = 0; i < 10; i++) {
        antibodies.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), target: null });
      }
    };

    function loop() {
      if (state.tab !== 'imuno') return;
      tick++;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; ctx.fillRect(0, 0, W, H);

     
      antibodies = antibodies.filter(ab => {
        if (!ab.target || !state.imunoPathogens.includes(ab.target)) {
          const nearest = state.imunoPathogens.find(p => !p.tagged && Math.hypot(p.x - ab.x, p.y - ab.y) < 120);
          if (nearest) ab.target = nearest;
        }
        if (ab.target) {
          ab.vx += (ab.target.x - ab.x) * 0.04; ab.vy += (ab.target.y - ab.y) * 0.04;
          const d = Math.hypot(ab.target.x - ab.x, ab.target.y - ab.y);
          if (d < 8) { ab.target.tagged = true; return false; }
        }
        ab.vx *= 0.9; ab.vy *= 0.9;
        ab.x += ab.vx; ab.y += ab.vy;
        ab.x = Math.max(0, Math.min(W, ab.x)); ab.y = Math.max(0, Math.min(H, ab.y));

        
        ctx.save(); ctx.translate(ab.x, ab.y); ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.moveTo(0, 6); ctx.lineTo(0, -2); ctx.lineTo(-5, -8); ctx.moveTo(0, -2); ctx.lineTo(5, -8); ctx.stroke();
        ctx.restore(); ctx.globalAlpha = 1;
        return true;
      });

     
      state.imunoPathogens.forEach(p => {
        p.vx += (Math.random() - 0.5) * 0.1; p.vy += (Math.random() - 0.5) * 0.1;
        p.vx *= 0.98; p.vy *= 0.98;
        p.x += p.vx; p.y += p.vy;
        p.x = Math.max(0, Math.min(W, p.x)); p.y = Math.max(0, Math.min(H, p.y));

        if (p.type === 'bacteria') {
          ctx.fillStyle = p.tagged ? '#fbbf24' : '#ef4444';
          ctx.shadowBlur = p.tagged ? 8 : 4; ctx.shadowColor = p.tagged ? '#fbbf24' : '#ef4444';
          ctx.beginPath(); ctx.ellipse(p.x, p.y, 6, 4, tick * 0.02, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.strokeStyle = p.tagged ? '#fbbf24' : '#f97316';
          ctx.lineWidth = 1.5; ctx.shadowBlur = 6; ctx.shadowColor = ctx.strokeStyle;
          ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.stroke();
         
          for (let s = 0; s < 6; s++) {
            const angle = (s / 6) * Math.PI * 2 + tick * 0.03;
            ctx.beginPath(); ctx.moveTo(p.x + Math.cos(angle) * 5, p.y + Math.sin(angle) * 5);
            ctx.lineTo(p.x + Math.cos(angle) * 9, p.y + Math.sin(angle) * 9); ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
      });

      
      tCells.forEach(t => {
        const target = state.imunoPathogens.find(p => !p.tagged && Math.hypot(p.x - t.x, p.y - t.y) < 150);
        if (target) {
          t.x += (target.x - t.x) * 0.02; t.y += (target.y - t.y) * 0.02;
          if (Math.hypot(target.x - t.x, target.y - t.y) < t.r + 5) {
            state.imunoPathogens = state.imunoPathogens.filter(p => p !== target);
            state.imunoNeutralized++;
          }
        } else {
          t.x += Math.sin(tick * 0.02 + t.r) * 0.5; t.y += Math.cos(tick * 0.015 + t.r) * 0.5;
        }
        const pulse = Math.sin(tick * 0.05) * 2;
        ctx.fillStyle = 'rgba(74,222,128,0.2)'; ctx.beginPath(); ctx.arc(t.x, t.y, t.r + 4 + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1.5; ctx.shadowBlur = 6; ctx.shadowColor = '#4ade80';
        ctx.beginPath(); ctx.arc(t.x, t.y, t.r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = '#4ade80'; ctx.font = '9px DM Mono'; ctx.textAlign = 'center';
        ctx.fillText('T', t.x, t.y + 3);
      });

     
      macrophages.forEach(m => {
        const pulse = Math.sin(tick * 0.04 + m.r) * 3;
        ctx.fillStyle = 'rgba(59,130,246,0.15)'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r + 8 + pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#3b82f6'; ctx.lineWidth = 2; ctx.shadowBlur = 12; ctx.shadowColor = '#3b82f6';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(59,130,246,0.3)'; ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#93c5fd'; ctx.font = '10px DM Mono'; ctx.textAlign = 'center';
        ctx.fillText('MΦ', m.x, m.y + 3);

      
        state.imunoPathogens = state.imunoPathogens.filter(p => {
          if (Math.hypot(p.x - m.x, p.y - m.y) < m.r) {
            state.imunoNeutralized++;
            m.energy = Math.min(100, m.energy + 5);
            return false;
          }
          return true;
        });
      });

      
      const st = document.getElementById('imuno-stats');
      if (st) st.innerHTML = `
        <div class="cv-stat-row"><span style="font-size:11px;color:#ef4444;">🦠 Patógenos</span><span class="cv-stat-val">${state.imunoPathogens.length}</span></div>
        <div class="cv-stat-row"><span style="font-size:11px;color:#4ade80;">🛡️ Neutralizados</span><span class="cv-stat-val">${state.imunoNeutralized}</span></div>
        <div class="cv-stat-row"><span style="font-size:11px;color:#fbbf24;">✦ Anticorpos</span><span class="cv-stat-val">${antibodies.length}</span></div>
        <div class="cv-stat-row" style="border:none;"><span style="font-size:11px;color:#60a5fa;">🔵 Macrófagos</span><span class="cv-stat-val">${macrophages.length}</span></div>`;

      state.animId = requestAnimationFrame(loop);
    }
    loop();
  }


  function _stopAnims() {
    if (state.animId) cancelAnimationFrame(state.animId);
    state.animId = null;
    state.timers.forEach(t => clearTimeout(t));
    state.timers = [];
    state.bioRunning = false;
    if (state.three.renderer) { state.three.renderer.dispose(); state.three.renderer = null; }
  }

  function fechar() { _stopAnims(); document.getElementById(MODAL_ID)?.remove(); }

 
  (function injetarNoMundo() {
    function add() {
      const menus = document.querySelectorAll('.mt-dropdown-content:not(.cv-processed)');
      if (!menus.length) return;
      menus.forEach(menu => {
        menu.classList.add('cv-processed');
        const closeMenu = () => menu.classList.remove('show');
        const b = document.createElement('button');
        b.innerHTML = '🧬 Ciências da Vida PRO';
        b.onclick = e => { e.stopPropagation(); closeMenu(); CienciasVida.abrir(); };
        const dashBtn = Array.from(menu.querySelectorAll('button')).find(btn => btn.innerText.includes('Dashboard'));
        if (dashBtn) menu.insertBefore(b, dashBtn);
        else menu.appendChild(b);
      });
    }
    const observer = new MutationObserver(add);
    observer.observe(document.body, { childList: true, subtree: true });
    add();
  })();

  return {
    abrir, fechar, setTab, cellStep, highlightSys,
    resetEvol: () => _initEvolEngine(),
    resetBio: () => { _stopAnims(); state.bioRunning = true; _initBioSim(); },
    spawnPathogen: () => {}, spawnVirus: () => {}, boostImune: () => {}
  };
})();

window.CienciasVida = CienciasVida;