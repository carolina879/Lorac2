
const LibrasDictionary = (() => {
  'use strict';

  function abrir() {
    console.log("[LibrasDictionary] Abrindo modal...");
    const id = 'modal-libras-dict';
    if (document.getElementById(id)) return;

    const modal = document.createElement('div');
    modal.id = id;
    modal.className = 'ex-modal-overlay';
    modal.style.zIndex = '100003';
    modal.innerHTML = `
      <div class="ex-modal-box" style="max-width: 480px; background: var(--bg-2, #1a1612); border-radius: 20px; overflow: hidden; border: 1px solid var(--border, #3a3228);">
        <div class="ex-modal-header" style="padding: 18px 24px; border-bottom: 1px solid var(--border, #3a3228); display: flex; justify-content: space-between; align-items: center; background: var(--bg-1, #120f0b);">
          <h3 style="margin:0; font-family: var(--font-display, serif); color: var(--text-0, #f0e6d3);">🤟 Tradutor de Libras</h3>
          <button class="ex-modal-close" onclick="document.getElementById('${id}').remove()" style="background: none; border: none; color: var(--text-2, #8a7a6a); font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <div class="ex-modal-body" style="padding: 24px; background: var(--bg-1, #120f0b);">
          <div style="margin-bottom: 20px;">
            <label style="display: block; font-size: 11px; font-weight: 700; color: var(--text-3, #5a4a3a); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Palavra ou frase para traduzir</label>
            <div style="display: flex; gap: 8px;">
              <input id="ld-input" type="text" placeholder="Ex: oi, obrigado, amor..."
                style="flex: 1; background: var(--bg-3, #211d18); border: 1px solid var(--border, #3a3228); border-radius: 10px; padding: 12px 14px; color: var(--text-0, #f0e6d3); outline: none; font-size: 14px;"
                onkeydown="if(event.key==='Enter') window.LibrasDictionary.traduzir()" />
              <button class="btn-primary" onclick="window.LibrasDictionary.traduzir()" style="padding: 0 20px; border-radius:10px; font-weight:700; cursor:pointer;">Traduzir</button>
              <button id="ld-btn-cam" class="btn-secondary" onclick="window.LibrasHandTracking.toggle()" style="padding: 0 12px; border-radius:10px; cursor:pointer;" title="Reconhecimento gestual">📷</button>
            </div>
          </div>
          <div id="ld-result" style="min-height: 60px; padding: 16px; background: rgba(0,0,0,0.2); border-radius: 12px; color: var(--text-1, #c8b89a); font-size: 14px; border: 1px dashed var(--border, #3a3228); line-height: 1.6;">
            Digite uma palavra para ver o avatar sinalizar.
          </div>
          <div id="ld-camera-container" style="display:none; position:relative; width:100%; aspect-ratio:4/3; border-radius:12px; overflow:hidden; margin-top:20px; background:#000; border: 1px solid var(--border, #3a3228);">
            <video id="ld-video" style="width:100%; height:100%; object-fit:cover; transform: scaleX(-1);" autoplay playsinline muted></video>
            <canvas id="ld-tracking-canvas" style="position:absolute; inset:0; width:100%; height:100%; transform: scaleX(-1);"></canvas>
            <div id="ld-detection-result" style="position:absolute; top:10px; left:10px; background:rgba(0,0,0,0.7); color:var(--accent, #e8a04a); padding:5px 15px; border-radius:8px; font-weight:800; font-size:32px; border:2px solid var(--accent, #e8a04a); pointer-events:none; display:none; font-family:'DM Mono', monospace; min-width:50px; text-align:center;"></div>
            <!-- Indicador de gesto pendente / estabilidade -->
            <div id="ld-gesture-pending" style="position:absolute; bottom:10px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.75); border-radius:10px; padding:6px 14px; display:none; pointer-events:none;">
              <div style="display:flex; align-items:center; gap:8px;">
                <span id="ld-pending-letter" style="font-family:monospace; font-weight:800; font-size:20px; color:#fff;"></span>
                <div id="ld-stability-bar-wrap" style="width:60px; height:6px; background:rgba(255,255,255,0.15); border-radius:3px; overflow:hidden;">
                  <div id="ld-stability-bar" style="height:100%; width:0%; background:#e8a04a; border-radius:3px; transition:width 0.08s linear;"></div>
                </div>
                <span id="ld-pending-conf" style="font-size:10px; color:rgba(255,255,255,0.5); font-family:monospace;"></span>
              </div>
            </div>
          </div>

          <div id="ld-phrase-panel" style="display:none; margin-top:14px; background:rgba(0,0,0,0.25); border:1px solid var(--border,#3a3228); border-radius:14px; overflow:hidden;">
       
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 14px; border-bottom:1px solid rgba(255,255,255,0.06);">
              <span style="font-size:10px; font-weight:700; color:var(--text-3,#5a4a3a); text-transform:uppercase; letter-spacing:1px;">✍️ Frase detectada</span>
              <div style="display:flex; gap:6px;">
                <button onclick="window.LibrasHandTracking.phraseDeleteLetter()" title="Apagar última letra"
                  style="background:rgba(255,255,255,0.07); border:none; border-radius:6px; color:var(--text-2,#8a7a6a); font-size:11px; padding:3px 9px; cursor:pointer;">⌫ Letra</button>
                <button onclick="window.LibrasHandTracking.phraseDeleteWord()" title="Apagar última palavra"
                  style="background:rgba(255,255,255,0.07); border:none; border-radius:6px; color:var(--text-2,#8a7a6a); font-size:11px; padding:3px 9px; cursor:pointer;">⌫ Palavra</button>
                <button onclick="window.LibrasHandTracking.phraseReset()" title="Limpar tudo"
                  style="background:rgba(255,80,80,0.12); border:none; border-radius:6px; color:#e87070; font-size:11px; padding:3px 9px; cursor:pointer;">✕ Limpar</button>
              </div>
            </div>
        
            <div id="ld-phrase-text" style="min-height:52px; padding:12px 16px; font-size:22px; font-weight:700; font-family:'DM Mono',monospace; color:var(--text-0,#f0e6d3); letter-spacing:2px; word-break:break-word; line-height:1.4;">
              <span id="ld-phrase-committed" style="color:var(--text-0,#f0e6d3);"></span><span id="ld-phrase-current" style="color:var(--accent,#e8a04a); border-right:2px solid var(--accent,#e8a04a); animation:ld-cursor-blink 1s steps(1) infinite;"></span>
            </div>

            <div style="padding:6px 14px 10px; border-top:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:9px; color:var(--text-3,#5a4a3a); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">Últimos sinais</div>
              <div id="ld-gesture-history" style="display:flex; gap:5px; flex-wrap:wrap; min-height:22px;"></div>
            </div>
            
            <div id="ld-suggestions-wrap" style="display:none; padding:6px 14px 10px; border-top:1px solid rgba(255,255,255,0.05);">
              <div style="font-size:9px; color:var(--text-3,#5a4a3a); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">💡 Sugestões</div>
              <div id="ld-suggestions" style="display:flex; gap:5px; flex-wrap:wrap;"></div>
            </div>
          </div>
          <style>
            @keyframes ld-cursor-blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
            @keyframes ld-letter-pop { 0%{transform:scale(1.6) translateY(-4px);opacity:0} 100%{transform:scale(1) translateY(0);opacity:1} }
            .ld-history-chip { display:inline-flex; align-items:center; background:rgba(232,160,74,0.12); border:1px solid rgba(232,160,74,0.25); border-radius:5px; padding:2px 7px; font-family:monospace; font-weight:700; font-size:13px; color:var(--accent,#e8a04a); animation:ld-letter-pop 0.18s ease-out; }
            .ld-history-chip.dynamic { background:rgba(74,232,160,0.12); border-color:rgba(74,232,160,0.3); color:#4ae8a0; }
            .ld-suggestion-chip { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:8px; padding:4px 12px; font-size:12px; color:var(--text-1,#c8b89a); cursor:pointer; transition:background 0.15s; }
            .ld-suggestion-chip:hover { background:rgba(232,160,74,0.18); color:var(--accent,#e8a04a); }
          </style>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    
    setTimeout(() => document.getElementById('ld-input')?.focus(), 100);
  }

  async function traduzirTexto(texto) {
    const res = document.getElementById('ld-result');
    if (res) {
      res.innerHTML = `<div style="color:var(--text-1,#c8b89a);">🤟 Sinal para: <strong>${texto}</strong></div>`;
    }
    return true;
  }

  async function traduzir() {
    const input = document.getElementById('ld-input');
    if (input?.value) {
      await traduzirTexto(input.value.trim());
    }
  }

  return { abrir, traduzirTexto, traduzir };
})();

window.LibrasDictionary = LibrasDictionary;


const LibrasClassifier = (() => {
  
  const WRIST = 0, THUMB_CMC = 1, THUMB_MCP = 2, THUMB_IP = 3, THUMB_TIP = 4;
  const INDEX_MCP = 5, INDEX_PIP = 6, INDEX_DIP = 7, INDEX_TIP = 8;
  const MIDDLE_MCP = 9, MIDDLE_PIP = 10, MIDDLE_DIP = 11, MIDDLE_TIP = 12;
  const RING_MCP = 13, RING_PIP = 14, RING_DIP = 15, RING_TIP = 16;
  const PINKY_MCP = 17, PINKY_PIP = 18, PINKY_DIP = 19, PINKY_TIP = 20;

  const Vec = {
    sub: (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: (a.z || 0) - (b.z || 0) }),
    dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
    cross: (a, b) => ({
      x: a.y * (b.z || 0) - (a.z || 0) * b.y,
      y: (a.z || 0) * b.x - a.x * (b.z || 0),
      z: a.x * b.y - a.y * b.x
    }),
    mag: (a) => Math.sqrt(a.x * a.x + a.y * a.y + (a.z || 0) * (a.z || 0)),
    normalize: (a) => {
      const m = Math.sqrt(a.x * a.x + a.y * a.y + (a.z || 0) * (a.z || 0)) || 1;
      return { x: a.x / m, y: a.y / m, z: (a.z || 0) / m };
    },
    angle: (a, b) => {
      const dot = a.x * b.x + a.y * b.y + (a.z || 0) * (b.z || 0);
      const m1 = Math.sqrt(a.x * a.x + a.y * a.y + (a.z || 0) * (a.z || 0));
      const m2 = Math.sqrt(b.x * b.x + b.y * b.y + (b.z || 0) * (b.z || 0));
      const d = dot / (m1 * m2 || 1);
      return Math.acos(Math.min(1, Math.max(-1, d))) * 180 / Math.PI;
    },
    dist: (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow((a.z || 0) - (b.z || 0), 2))
  };

  function extractFeatures(lm) {
    const origin = lm[WRIST];
    const scale = Vec.dist(lm[WRIST], lm[MIDDLE_MCP]) || 1;
    const normalized = lm.map(p => ({
      x: (p.x - origin.x) / scale,
      y: (p.y - origin.y) / scale,
      z: (p.z || 0) / scale
    }));

    const fingerCurls = [
      _calcCurl(normalized, [0, 1, 2, 3, 4]),
      _calcCurl(normalized, [5, 6, 7, 8]),
      _calcCurl(normalized, [9, 10, 11, 12]),
      _calcCurl(normalized, [13, 14, 15, 16]),
      _calcCurl(normalized, [17, 18, 19, 20])
    ];

    const v1 = Vec.sub(normalized[INDEX_MCP], normalized[WRIST]);
    const v2 = Vec.sub(normalized[PINKY_MCP], normalized[WRIST]);
    const palmNormal = Vec.normalize(Vec.cross(v1, v2));

    const fingerDirs = [
      Vec.normalize(Vec.sub(normalized[THUMB_TIP], normalized[THUMB_CMC])),
      Vec.normalize(Vec.sub(normalized[INDEX_TIP], normalized[INDEX_MCP])),
      Vec.normalize(Vec.sub(normalized[MIDDLE_TIP], normalized[MIDDLE_MCP])),
      Vec.normalize(Vec.sub(normalized[RING_TIP], normalized[RING_MCP])),
      Vec.normalize(Vec.sub(normalized[PINKY_TIP], normalized[PINKY_MCP]))
    ];

    return { normalized, fingerCurls, palmNormal, fingerDirs };
  }

  function _calcCurl(lm, indices) {
    let totalAngle = 0;
    for (let i = 0; i < indices.length - 2; i++) {
      const v1 = Vec.sub(lm[indices[i+1]], lm[indices[i]]);
      const v2 = Vec.sub(lm[indices[i+2]], lm[indices[i+1]]);
      totalAngle += Vec.angle(v1, v2);
    }
    return totalAngle;
  }

  function detectStaticLetter(lm) {
    const f = extractFeatures(lm);
    const { normalized: n, fingerCurls: curls, palmNormal: palm, fingerDirs: dirs } = f;

   
    const isExt    = (i) => curls[i] < 35;          
    const isFolded = (i) => curls[i] > 100;          
    const isBent   = (i) => curls[i] >= 35 && curls[i] <= 100;

    const dist      = (a, b) => Vec.dist(n[a], n[b]);
    const thumbNear = (target, thr = 0.22) => dist(THUMB_TIP, target) < thr;

   
    const palmFront = palm.z < -0.4;
    const palmBack  = palm.z >  0.4;
    const palmUp    = palm.y < -0.4;
    const palmDown  = palm.y >  0.4;

    
    const indexUp    = dirs[1].y < -0.5;
    const indexSide  = Math.abs(dirs[1].x) > 0.55;
    const indexDown  = dirs[1].y >  0.5;
    const indexFwd   = dirs[1].z < -0.4;

    
    if (isFolded(1) && isFolded(2) && isFolded(3) && isFolded(4)) {

      
      if (dist(THUMB_TIP, PINKY_MCP) < 0.28 && n[THUMB_TIP].x < n[INDEX_MCP].x) return "M";


      if (dist(THUMB_TIP, RING_MCP) < 0.26 && n[THUMB_TIP].x < n[MIDDLE_MCP].x) return "N";

      
      if (dist(THUMB_TIP, INDEX_PIP) < 0.20) return "T";

      if (dist(THUMB_TIP, MIDDLE_PIP) < 0.24 || dist(THUMB_TIP, INDEX_PIP) < 0.24) return "S";

    
      if (n[THUMB_TIP].y > n[INDEX_MCP].y - 0.05) return "E";

     
      return "A";
    }

   
    if (isBent(1) && isBent(2) && isBent(3) && isBent(4)) {

      
      if (dist(THUMB_TIP, INDEX_TIP) < 0.18) return "O";

      if (dist(THUMB_TIP, INDEX_TIP) < 0.28 && curls[0] > 50) return "Ç";

      
      return "C";
    }

    if (isExt(1) && isExt(2) && isExt(3) && isExt(4)) {

   
      if (dist(THUMB_TIP, INDEX_TIP) < 0.16) return "F";

    
      return "B";
    }


    if (isExt(1) && isExt(4) && isFolded(2) && isFolded(3)) {
     
      if (isExt(0)) return "Y";
      return "Y";
    }

    
    if (isExt(4) && isFolded(1) && isFolded(2) && isFolded(3)) {
      
      if (isExt(0)) return "Y";
     
      return "I";
    }

  
    if (isBent(1) && isFolded(2) && isFolded(3) && isFolded(4)) return "X";

  
    if (isExt(1) && isFolded(2) && isFolded(3) && isFolded(4)) {

    
      if (isExt(0) && indexUp && n[THUMB_TIP].x > n[INDEX_MCP].x) return "L";

      
      if (isExt(0) && indexSide) return "G";

     
      if (isExt(0) && indexDown) return "Q";

     
      if ((isBent(0) || isFolded(0)) && dist(THUMB_TIP, MIDDLE_PIP) < 0.28) return "D";

     
      if (indexUp) return "D";

      return "D";
    }

   
    if (isExt(1) && isExt(2) && isFolded(3) && isFolded(4)) {

    
      if (dist(INDEX_TIP, MIDDLE_TIP) < 0.13 && n[MIDDLE_TIP].x < n[INDEX_TIP].x) return "R";

      
      if (palmDown && indexDown) return "P";

      if (indexSide && palmFront) return "H";

     
      if (dist(THUMB_TIP, MIDDLE_PIP) < 0.28 && indexUp) return "K";

   
      if (dist(INDEX_TIP, MIDDLE_TIP) > 0.22 && indexUp) return "V";

    
      return "U";
    }

  
    if (isExt(1) && isExt(2) && isExt(3) && isFolded(4)) return "W";

   
    if (isBent(1) && isFolded(2) && isFolded(3) && isFolded(4) && isExt(0)) return "A";

    if (isExt(0) && isFolded(1) && isFolded(2) && isFolded(3) && isFolded(4)) return "A";

   
    if (isFolded(1) && isBent(2) && isExt(3) && isExt(4) && dist(THUMB_TIP, MIDDLE_TIP) < 0.18) return "F";

    return "";
  }

  function drawDebug(ctx, f, canvasW, canvasH) {
    const { normalized: n, palmNormal: palm } = f;
    ctx.save();
    ctx.strokeStyle = '#4ae8a0';
    ctx.lineWidth = 4;

    ctx.beginPath();
    ctx.moveTo(n[WRIST].x * canvasW, n[WRIST].y * canvasH);
    ctx.lineTo((n[WRIST].x + palm.x * 0.5) * canvasW, (n[WRIST].y + palm.y * 0.5) * canvasH);
    ctx.stroke();
    ctx.restore();
  }

  return { extractFeatures, detectStaticLetter, drawDebug, Vec };
})();

window.LibrasClassifier = LibrasClassifier;


const LibrasHandTracking = (() => {
  let hands = null;
  let camera = null;
  let active = false;

  
  const MotionTracker = (() => {
    const HISTORY_SIZE      = 45;  
    const SMOOTHING_WINDOW  = 5;   
    const MIN_MOTION_DIST   = 0.012; 
    const GESTURE_COOLDOWN  = 900; 
    const TRAIL_FADE_MS     = 1200;

    let history = [];         
    let smoothedPos = null;
    let lastGestureTime = 0;
    let pendingGesture = null;
    let trailPoints = [];        

   
    function smooth(rawX, rawY) {
      if (!smoothedPos) { smoothedPos = { x: rawX, y: rawY }; return smoothedPos; }
   
      const alpha = 0.35;
      smoothedPos.x += alpha * (rawX - smoothedPos.x);
      smoothedPos.y += alpha * (rawY - smoothedPos.y);
      return { ...smoothedPos };
    }

   
    function push(lm) {
      const raw = lm[8]; 
      const pos = smooth(raw.x, raw.y);
      const entry = { x: pos.x, y: pos.y, z: raw.z || 0, t: performance.now() };
      history.push(entry);
      trailPoints.push({ x: pos.x, y: pos.y, t: entry.t });
      if (history.length > HISTORY_SIZE)   history.shift();
      if (trailPoints.length > HISTORY_SIZE) trailPoints.shift();
    }

  
    function delta(a, b) {
      return { dx: b.x - a.x, dy: b.y - a.y };
    }

    
    function pathLength(pts) {
      let len = 0;
      for (let i = 1; i < pts.length; i++) {
        len += Math.hypot(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
      }
      return len;
    }

    
    function segment(pts, n) {
      if (pts.length < 2) return [];
      const size = Math.floor(pts.length / n);
      const segs = [];
      for (let i = 0; i < n; i++) {
        const sl = pts.slice(i * size, (i + 1) * size + 1);
        if (sl.length < 2) continue;
        const d = delta(sl[0], sl[sl.length - 1]);
        segs.push(d);
      }
      return segs;
    }

  
    function angle(dx, dy) { return Math.atan2(dy, dx) * 180 / Math.PI; }

    
    function directionChanges(pts, threshold = 45) {
      let changes = 0;
      for (let i = 2; i < pts.length; i++) {
        const a1 = angle(pts[i-1].x - pts[i-2].x, pts[i-1].y - pts[i-2].y);
        const a2 = angle(pts[i].x - pts[i-1].x, pts[i].y - pts[i-1].y);
        let diff = Math.abs(a2 - a1);
        if (diff > 180) diff = 360 - diff;
        if (diff > threshold) changes++;
      }
      return changes;
    }
    function bbox(pts) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      pts.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
      return { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY };
    }

   
    function curvatureSign(pts) {
      
      let sum = 0;
      for (let i = 1; i < pts.length - 1; i++) {
        const ax = pts[i].x - pts[i-1].x, ay = pts[i].y - pts[i-1].y;
        const bx = pts[i+1].x - pts[i].x, by = pts[i+1].y - pts[i].y;
        sum += (ax * by - ay * bx);
      }
      return sum;
    }

    function detect() {
      const now = performance.now();
      if (now - lastGestureTime < GESTURE_COOLDOWN) return null;

     
      const window_ms = 1200;
      const recent = history.filter(p => now - p.t < window_ms);
      if (recent.length < 12) return null;

      const pLen = pathLength(recent);
      if (pLen < MIN_MOTION_DIST * 8) return null; // praticamente parado

      const bb   = bbox(recent);
      const segs = segment(recent, 4);
      const dchg = directionChanges(recent, 50);
      const curv = curvatureSign(recent);

      const overall = delta(recent[0], recent[recent.length - 1]);
      const overallAngle = angle(overall.dx, overall.dy);
      const totalDisp = Math.hypot(overall.dx, overall.dy);

      
      if (
        bb.h > bb.w * 1.1 &&               
        bb.h > 0.06 &&                      
        pLen > 0.08 &&                     
        overallAngle > 60 && overallAngle < 130 && 
        Math.abs(curv) > 0.001 &&           
        dchg <= 3                         
      ) {
        lastGestureTime = now;
        return { letter: 'J', confidence: _confidence(bb.h / Math.max(bb.w, 0.001), 1.1, 3.0) };
      }

     
      if (
        dchg >= 3 &&                        
        bb.w > 0.06 &&                    
        pLen > 0.12 &&                      
        bb.w > bb.h * 0.6                 
      ) {
        
        if (segs.length >= 3) {
          const s1Right   = segs[0].dx > 0;
          const s2Leftward= segs[1].dx < 0 || (segs[1].dx > 0 && segs[1].dy > 0);
          const s3Down    = segs[2].dy > 0 || segs[2].dx > 0;
          if (s1Right && s2Leftward && s3Down) {
            lastGestureTime = now;
            return { letter: 'Z', confidence: _confidence(dchg, 3, 6) };
          }
        }
        
        if (dchg >= 4) {
          lastGestureTime = now;
          return { letter: 'Z', confidence: 0.7 };
        }
      }

      return null;
    }

    function _confidence(val, min, max) {
      return Math.min(1.0, Math.max(0.5, (val - min) / (max - min)));
    }


    function drawTrail(ctx, canvasW, canvasH) {
      const now = performance.now();
      const visible = trailPoints.filter(p => now - p.t < TRAIL_FADE_MS);
      if (visible.length < 2) return;

      ctx.save();
      for (let i = 1; i < visible.length; i++) {
        const age  = now - visible[i].t;
        const fade = 1 - age / TRAIL_FADE_MS;
        const thick = Math.max(1, 5 * fade);
        const alpha = fade * 0.85;

      
        const r = Math.round(232 + (220 - 232) * (i / visible.length));
        const g = Math.round(160 - 160 * (i / visible.length));
        const b = 50;

        ctx.beginPath();
        ctx.moveTo(visible[i-1].x * canvasW, visible[i-1].y * canvasH);
        ctx.lineTo(visible[i].x   * canvasW, visible[i].y   * canvasH);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = thick;
        ctx.lineCap = 'round';
        ctx.stroke();
      }


      const tip = visible[visible.length - 1];
      ctx.beginPath();
      ctx.arc(tip.x * canvasW, tip.y * canvasH, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,220,80,0.9)';
      ctx.fill();
      ctx.restore();
    }

    function reset() {
      history = [];
      trailPoints = [];
      smoothedPos = null;
    }

    return { push, detect, drawTrail, reset };
  })();

  const PhraseBuilder = (() => {
    
    const STABILITY_FRAMES   = 12;  
    const LETTER_COOLDOWN_MS = 700; 
    const DIFF_LETTER_CD_MS  = 350;  
    const WORD_PAUSE_MS      = 1800; 
    const MAX_HISTORY        = 20; 
    const MAX_SUGGESTIONS    = 4;

   
    let committedText  = '';    
    let currentWord    = '';  
    let gestureHistory = [];   
    let lastLetter     = '';
    let lastLetterTime = 0;
    let lastAnyGesture = 0;     
    let wordPauseTimer = null;

    
    let stableCount   = 0;
    let stableCandidate = '';
    let stableConf    = 0;

   
    const VOCAB = [
      'OI','OLA','BOM','DIA','BOA','TARDE','NOITE','OBRIGADO','OBRIGADA',
      'SIM','NAO','POR','FAVOR','TUDO','BEM','MAL','EU','TU','ELE','ELA',
      'NOS','VOS','AMOR','CASA','AGUA','COMIDA','AJUDA','LIBRAS','BRASIL',
      'NOME','QUAL','COMO','ONDE','QUANDO','VOCE','MEU','SUA'
    ];

   
    function feed(letter, confidence, isDynamic) {
      const now = performance.now();

    
      if (letter === '' && currentWord.length > 0) {
        if (!wordPauseTimer) {
          wordPauseTimer = setTimeout(_commitWord, WORD_PAUSE_MS);
        }
      } else if (letter !== '') {
        if (wordPauseTimer) { clearTimeout(wordPauseTimer); wordPauseTimer = null; }
      }

      _updatePendingUI(letter, confidence, isDynamic);

     
      if (isDynamic && letter) {
        stableCandidate = '';
        stableCount = 0;
        _confirmLetter(letter, true, confidence, now);
        return;
      }


      if (letter && letter === stableCandidate) {
        stableCount++;
        stableConf = confidence;
        if (stableCount >= STABILITY_FRAMES) {
          const cd = (letter === lastLetter) ? LETTER_COOLDOWN_MS : DIFF_LETTER_CD_MS;
          if (now - lastLetterTime >= cd) {
            _confirmLetter(letter, false, stableConf, now);
            stableCount = 0; 
          }
        }
      } else {
    
        stableCandidate = letter;
        stableCount = letter ? 1 : 0;
        stableConf  = confidence;
      }
    }

    
    function _confirmLetter(letter, isDynamic, confidence, now) {
      lastLetter     = letter;
      lastLetterTime = now;
      lastAnyGesture = now;

      currentWord += letter;

      gestureHistory.push({ letter, isDynamic, conf: confidence });
      if (gestureHistory.length > MAX_HISTORY) gestureHistory.shift();

      _renderUI();
    }

    function _commitWord() {
      if (!currentWord) return;
      committedText += (committedText ? ' ' : '') + currentWord;
      currentWord = '';
      _renderUI();
    }

   
    function _getSuggestions() {
      if (!currentWord) return [];
      const prefix = currentWord.toUpperCase();
      return VOCAB
        .filter(w => w.startsWith(prefix) && w !== prefix)
        .slice(0, MAX_SUGGESTIONS);
    }

    function _renderUI() {
      const panel     = document.getElementById('ld-phrase-panel');
      const committed = document.getElementById('ld-phrase-committed');
      const current   = document.getElementById('ld-phrase-current');
      const histEl    = document.getElementById('ld-gesture-history');
      const sugWrap   = document.getElementById('ld-suggestions-wrap');
      const sugEl     = document.getElementById('ld-suggestions');

      if (!panel) return;
      panel.style.display = 'block';

      
      if (committed) committed.textContent = committedText + (committedText && currentWord ? ' ' : '');
      if (current)   current.textContent   = currentWord;


      if (histEl) {
        histEl.innerHTML = gestureHistory.map(g =>
          `<span class="ld-history-chip${g.isDynamic ? ' dynamic' : ''}">${g.letter}</span>`
        ).join('');
      }

    
      const sugs = _getSuggestions();
      if (sugEl && sugWrap) {
        if (sugs.length > 0) {
          sugWrap.style.display = 'block';
          sugEl.innerHTML = sugs.map(s =>
            `<button class="ld-suggestion-chip" onclick="window.LibrasHandTracking.phraseSuggest('${s}')">${s}</button>`
          ).join('');
        } else {
          sugWrap.style.display = 'none';
        }
      }
    }

    
    function _updatePendingUI(letter, confidence, isDynamic) {
      const wrap  = document.getElementById('ld-gesture-pending');
      const lbl   = document.getElementById('ld-pending-letter');
      const bar   = document.getElementById('ld-stability-bar');
      const conf  = document.getElementById('ld-pending-conf');
      if (!wrap) return;

      if (letter && !isDynamic) {
        wrap.style.display = 'block';
        if (lbl)  lbl.textContent  = letter;
        if (bar)  bar.style.width  = Math.min(100, (stableCount / STABILITY_FRAMES) * 100) + '%';
        if (bar)  bar.style.background = stableCount >= STABILITY_FRAMES ? '#4ae8a0' : '#e8a04a';
        if (conf) conf.textContent = confidence ? Math.round(confidence * 100) + '%' : '';
      } else {
        wrap.style.display = 'none';
      }
    }

    
    function reset() {
      committedText  = '';
      currentWord    = '';
      gestureHistory = [];
      lastLetter     = '';
      lastLetterTime = 0;
      stableCount    = 0;
      stableCandidate = '';
      if (wordPauseTimer) { clearTimeout(wordPauseTimer); wordPauseTimer = null; }
      _renderUI();
      const panel = document.getElementById('ld-phrase-panel');
      if (panel) panel.style.display = 'none';
    }

    function deleteLetter() {
      if (wordPauseTimer) { clearTimeout(wordPauseTimer); wordPauseTimer = null; }
      if (currentWord.length > 0) {
        currentWord = currentWord.slice(0, -1);
      } else if (committedText.length > 0) {
       
        committedText = committedText.trimEnd();
        committedText = committedText.slice(0, -1);
      }
      gestureHistory.pop();
      _renderUI();
    }

    function deleteWord() {
      if (wordPauseTimer) { clearTimeout(wordPauseTimer); wordPauseTimer = null; }
      if (currentWord) {
        currentWord = '';
      } else {
     
        const words = committedText.trim().split(' ');
        words.pop();
        committedText = words.join(' ');
      }
      _renderUI();
    }

    function applySuggestion(word) {
      if (wordPauseTimer) { clearTimeout(wordPauseTimer); wordPauseTimer = null; }
      committedText += (committedText ? ' ' : '') + word;
      currentWord    = '';
      _renderUI();
    }

    function getFullPhrase() {
      return (committedText + (committedText && currentWord ? ' ' : '') + currentWord).trim();
    }

    return { feed, reset, deleteLetter, deleteWord, applySuggestion, getFullPhrase };
  })();

  async function toggle() {
    const video = document.getElementById('ld-video');
    const container = document.getElementById('ld-camera-container');
    const btn = document.getElementById('ld-btn-cam');

    if (!window.Hands || !window.Camera) {
      alert("As bibliotecas de rastreamento não foram carregadas. Verifique sua conexão com a internet.");
      return;
    }
    
    if (!video || !container) return;

    if (active && camera) {
      active = false;
      container.style.display = 'none';
      btn.style.background = '';
      btn.style.color = ''; 
      MotionTracker.reset();
      PhraseBuilder.reset();
      const panel = document.getElementById('ld-phrase-panel');
      if (panel) panel.style.display = 'none';
      if (camera) await camera.stop();
      return;
    }

    active = true;
    container.style.display = 'block';
    btn.style.background = 'var(--accent, #e8a04a)';
    btn.style.color = '#000';

    if (!hands) {
      hands = new window.Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
      hands.onResults(_onResults);
    }

    if (!camera) {
      camera = new window.Camera(video, {
        onFrame: async () => {
          if (active) await hands.send({ image: video });
        },
        width: 640, height: 480
      });
    }

    try {
      await camera.start();
    } catch (e) {
      console.error("Erro ao abrir a câmera:", e);
      alert("Não foi possível acessar a câmera. Verifique as permissões do seu navegador.");
      active = false;
      container.style.display = 'none';
      btn.style.background = '';
    }
  }

  
  let _dynamicGestureDisplay = { letter: '', until: 0, confidence: 0 };

  function _onResults(results) {
    const canvas = document.getElementById('ld-tracking-canvas');
    const detectionEl = document.getElementById('ld-detection-result');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

   
    if (!results.multiHandLandmarks?.length) {
      MotionTracker.reset();
      PhraseBuilder.feed('', 0, false);
      ctx.restore();
      if (detectionEl) detectionEl.style.display = 'none';
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const W = canvas.width, H = canvas.height;

    
    MotionTracker.push(landmarks);

    
    const dynamic = MotionTracker.detect();
    if (dynamic) {
      _dynamicGestureDisplay = {
        letter:     dynamic.letter,
        confidence: dynamic.confidence,
        until:      performance.now() + 1500   // exibe por 1.5s
      };
    }

    
    if (window.drawConnectors && window.HAND_CONNECTIONS) {
      window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, { color: '#e8a04a', lineWidth: 2 });
    }
    if (window.drawLandmarks) {
      window.drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
    }

  
    MotionTracker.drawTrail(ctx, W, H);

   
    const now = performance.now();
    let displayLetter = '';
    let isDynamic = false;

    if (_dynamicGestureDisplay.until > now) {

      displayLetter = _dynamicGestureDisplay.letter;
      isDynamic = true;
    } else {
  
      displayLetter = _detectLetter(landmarks);
    }

    
    if (detectionEl) {
      if (displayLetter) {
        detectionEl.textContent = displayLetter;
        detectionEl.style.display = 'block';
     
        if (isDynamic) {
          detectionEl.style.borderColor = '#4ae8a0';
          detectionEl.style.color       = '#4ae8a0';
          detectionEl.style.boxShadow   = '0 0 16px rgba(74,232,160,0.5)';
        } else {
          detectionEl.style.borderColor = 'var(--accent, #e8a04a)';
          detectionEl.style.color       = 'var(--accent, #e8a04a)';
          detectionEl.style.boxShadow   = '';
        }
      } else {
        detectionEl.style.display = 'none';
      }
    }

    
    if (isDynamic && _dynamicGestureDisplay.until > now) {
      _drawGestureConfirmation(ctx, W, H, _dynamicGestureDisplay);
    }
    

    if (window.LibrasDebugMode) {
      const features = window.LibrasClassifier.extractFeatures(landmarks);
      window.LibrasClassifier.drawDebug(ctx, features, W, H);
    }

    
    const confValue = isDynamic
      ? (_dynamicGestureDisplay.confidence || 0.85)
      : (displayLetter ? 0.75 : 0);
    PhraseBuilder.feed(displayLetter, confValue, isDynamic);

    ctx.restore();
  }


  function _drawGestureConfirmation(ctx, W, H, gesture) {
    const age  = performance.now() - (gesture.until - 1500);
    const fade = Math.max(0, 1 - age / 1500);

    ctx.save();
    const cx = 50, cy = 50; 
    ctx.beginPath();
    ctx.arc(cx, cy, 32 + (1 - fade) * 10, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(74,232,160,${fade * 0.6})`;
    ctx.lineWidth = 3;
    ctx.stroke();


    ctx.font = '700 11px monospace';
    ctx.fillStyle = `rgba(74,232,160,${fade * 0.9})`;
    ctx.textAlign = 'center';
    ctx.fillText('MOVIMENTO', cx, cy + 52);
    const confPct = Math.round((gesture.confidence || 0.8) * 100);
    ctx.font = '600 10px monospace';
    ctx.fillStyle = `rgba(74,232,160,${fade * 0.7})`;
    ctx.fillText(`${confPct}%`, cx, cy + 64);
    ctx.restore();
  }

  function _detectLetter(lm) {
    const isExtended = (tip, mcp) => lm[tip].y < lm[mcp].y - 0.02;
    const dist = (p1, p2) => Math.hypot(lm[p1].x - lm[p2].x, lm[p1].y - lm[p2].y);
    
    const iExt = isExtended(8, 5);
    const mExt = isExtended(12, 9); 
    const rExt = isExtended(16, 13);
    const pExt = isExtended(20, 17); 
    const tExt = lm[4].x > lm[3].x + 0.03; 

 
    if (!iExt && !mExt && !rExt && !pExt && !tExt) return "A";

    if (iExt && mExt && rExt && pExt && dist(8,12) < 0.05) return "B";
  
    if (iExt && !mExt && !rExt && !pExt && tExt) return "L";

    if (iExt && mExt && !rExt && !pExt && dist(8,12) > 0.06) return "V";

    if (iExt && mExt && !rExt && !pExt && dist(8,12) <= 0.06) return "U";
  
    if (iExt && mExt && rExt && !pExt) return "W";

    if (!iExt && !mExt && !rExt && pExt) return "I";

    return "";
  }

  return {
    toggle,
    phraseReset:        () => PhraseBuilder.reset(),
    phraseDeleteLetter: () => PhraseBuilder.deleteLetter(),
    phraseDeleteWord:   () => PhraseBuilder.deleteWord(),
    phraseSuggest:      (w) => PhraseBuilder.applySuggestion(w),
    phraseGetText:      () => PhraseBuilder.getFullPhrase()
  };
})();

window.LibrasHandTracking = LibrasHandTracking;

