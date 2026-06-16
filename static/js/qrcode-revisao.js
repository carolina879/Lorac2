
const QRTurma = (() => {

  const QRCODEJS_CDN = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
  const JSQR_CDN     = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';

  let mediaStream  = null;  
  let rafId        = null;  
  let scanCanvas   = null;   
  let scanCtx      = null;
  let overlayEl    = null;
  let jsFn         = null;   

  
  function _injectStyles() {
    if (document.getElementById('qrturma-styles')) return;
    const s = document.createElement('style');
    s.id = 'qrturma-styles';
    s.textContent = `
      #qrturma-overlay {
        position:fixed;inset:0;z-index:10010;
        background:rgba(10,8,6,0.88);backdrop-filter:blur(14px);
        display:flex;align-items:center;justify-content:center;
        animation:qrFadeIn .22s ease;
      }
      @keyframes qrFadeIn{from{opacity:0}to{opacity:1}}

      #qrturma-card {
        background:var(--bg-1,#181410);border:1px solid var(--border,#3a3228);
        border-radius:20px;width:min(400px,94vw);padding:26px 22px 22px;
        position:relative;box-shadow:0 32px 80px rgba(0,0,0,.65);
        animation:qrSlideUp .28s cubic-bezier(.22,1,.36,1);
      }
      @keyframes qrSlideUp{from{transform:translateY(28px);opacity:0}to{transform:translateY(0);opacity:1}}

      #qrturma-tabs {
        display:flex;gap:5px;background:var(--bg-3,#211d18);
        border-radius:11px;padding:4px;margin-bottom:20px;
      }
      .qrturma-tab {
        flex:1;padding:8px;border:none;border-radius:8px;
        font-size:13px;font-weight:600;cursor:pointer;
        background:transparent;color:var(--text-2,#8a7a6a);transition:all .17s;
      }
      .qrturma-tab.active {
        background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);
        box-shadow:0 2px 8px rgba(232,160,74,.3);
      }

     
      #qrturma-panel-gerar{display:flex;flex-direction:column;align-items:center;gap:14px;}
      #qrturma-qr-wrap{background:#fff;border-radius:12px;padding:12px;line-height:0;}
      #qrturma-qr-wrap img,#qrturma-qr-wrap canvas{display:block;border-radius:6px;}
      #qrturma-code-badge {
        background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);
        border-radius:10px;padding:10px 18px;text-align:center;width:100%;box-sizing:border-box;
        font-size:24px;font-weight:700;letter-spacing:6px;
        color:var(--accent,#e8a04a);font-family:'DM Mono',monospace;
      }
      #qrturma-code-hint{font-size:12px;color:var(--text-3,#5a4e44);text-align:center;}

      
      #qrturma-panel-scan{display:flex;flex-direction:column;align-items:center;gap:12px;}
      #qrturma-video-wrap {
        position:relative;width:260px;height:260px;
        border-radius:16px;overflow:hidden;background:#000;
        border:2px solid var(--border,#3a3228);flex-shrink:0;
      }
      #qrturma-video{width:100%;height:100%;object-fit:cover;display:block;}

      #qrturma-finder{position:absolute;inset:0;pointer-events:none;}
      .qr-corner{position:absolute;width:34px;height:34px;border-color:var(--accent,#e8a04a);border-style:solid;border-width:0;}
      .qr-corner.tl{top:14px;left:14px;border-top-width:3px;border-left-width:3px;border-radius:4px 0 0 0;}
      .qr-corner.tr{top:14px;right:14px;border-top-width:3px;border-right-width:3px;border-radius:0 4px 0 0;}
      .qr-corner.bl{bottom:14px;left:14px;border-bottom-width:3px;border-left-width:3px;border-radius:0 0 0 4px;}
      .qr-corner.br{bottom:14px;right:14px;border-bottom-width:3px;border-right-width:3px;border-radius:0 0 4px 0;}
      .qr-scan-line {
        position:absolute;left:14px;right:14px;height:2px;
        background:linear-gradient(90deg,transparent,var(--accent,#e8a04a),transparent);
        border-radius:2px;animation:qrScan 2s ease-in-out infinite;
      }
      @keyframes qrScan{
        0%{top:18px;opacity:0}10%{opacity:1}90%{opacity:1}100%{top:calc(100% - 18px);opacity:0}
      }

      #qrturma-scan-status{font-size:13px;color:var(--text-2,#8a7a6a);text-align:center;min-height:18px;}
      #qrturma-scan-status.ok{color:#7bc47f;font-weight:600;}
      #qrturma-scan-status.err{color:#e07060;font-weight:600;}

      #qrturma-manual-row{display:flex;gap:8px;width:100%;}
      #qrturma-manual-input {
        flex:1;background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);
        border-radius:8px;padding:9px 10px;font-size:15px;font-weight:700;letter-spacing:5px;
        color:var(--text-0,#f0e8df);outline:none;font-family:'DM Mono',monospace;
        text-transform:uppercase;text-align:center;
      }
      #qrturma-manual-btn {
        padding:9px 14px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);
        border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;
      }
      #qrturma-manual-btn:hover{opacity:.85;}

      #qrturma-close {
        position:absolute;top:13px;right:13px;background:none;border:none;
        color:var(--text-2,#8a7a6a);font-size:20px;cursor:pointer;
        line-height:1;padding:4px;border-radius:6px;transition:color .15s;
      }
      #qrturma-close:hover{color:var(--text-0,#f0e8df);}
    `;
    document.head.appendChild(s);
  }

 
  function _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
      const el = document.createElement('script');
      el.src = src;
      el.onload  = resolve;
      el.onerror = () => reject(new Error('Falha ao carregar ' + src));
      document.head.appendChild(el);
    });
  }

 
  function _buildOverlayHTML(tab) {
    const gShow = tab === 'gerar' ? 'flex' : 'none';
    const sShow = tab === 'scan'  ? 'flex' : 'none';
    return `
      <div id="qrturma-card">
        <button id="qrturma-close" onclick="QRTurma.fechar()">&#10005;</button>

        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
          <span style="font-size:22px;">&#128247;</span>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--text-0,#f0e8df);">QR Code de Turma</div>
            <div style="font-size:11px;color:var(--text-2,#8a7a6a);">Gerar ou escanear c&oacute;digo</div>
          </div>
        </div>

        <div id="qrturma-tabs">
          <button class="qrturma-tab${tab==='gerar'?' active':''}" id="qrtab-gerar"
            onclick="QRTurma._switchTab('gerar')">&#128190; Gerar QR</button>
          <button class="qrturma-tab${tab==='scan'?' active':''}" id="qrtab-scan"
            onclick="QRTurma._switchTab('scan')">&#128247; Escanear</button>
        </div>


        <div id="qrturma-panel-gerar" style="display:${gShow};">
          <div id="qrturma-qr-wrap">
            <div id="qrturma-qr-inner" style="width:220px;height:220px;display:flex;align-items:center;justify-content:center;color:var(--text-3,#5a4e44);font-size:13px;">Gerando...</div>
          </div>
          <div id="qrturma-code-badge">------</div>
          <div id="qrturma-code-hint">Mostre este QR Code para os alunos escanearem</div>
        </div>

      
        <div id="qrturma-panel-scan" style="display:${sShow};flex-direction:column;align-items:center;gap:12px;">
          <div id="qrturma-video-wrap">
            <video id="qrturma-video" autoplay playsinline muted></video>
            <div id="qrturma-finder">
              <div class="qr-corner tl"></div><div class="qr-corner tr"></div>
              <div class="qr-corner bl"></div><div class="qr-corner br"></div>
              <div class="qr-scan-line"></div>
            </div>
          </div>
          <div id="qrturma-scan-status">Aponte a c&acirc;mera para o QR Code</div>
          <div style="font-size:11px;color:var(--text-3,#5a4e44);">ou insira o c&oacute;digo manualmente</div>
          <div id="qrturma-manual-row">
            <input id="qrturma-manual-input" maxlength="6" placeholder="ABC123" type="text"
              oninput="this.value=this.value.toUpperCase()"
              onkeydown="if(event.key==='Enter')QRTurma._entrar(this.value)"/>
            <button id="qrturma-manual-btn"
              onclick="QRTurma._entrar(document.getElementById('qrturma-manual-input').value)">Entrar</button>
          </div>
        </div>
      </div>`;
  }

  
  function _mount(tab) {
    _fechar();
    _injectStyles();
    overlayEl = document.createElement('div');
    overlayEl.id = 'qrturma-overlay';
    overlayEl.innerHTML = _buildOverlayHTML(tab);
    overlayEl.addEventListener('click', e => { if (e.target === overlayEl) _fechar(); });
    document.body.appendChild(overlayEl);
  }


  async function abrirGerar(codigoTurma) {
    const codigo = (codigoTurma || '').trim().toUpperCase();
    _mount('gerar');

  
    const badge = document.getElementById('qrturma-code-badge');
    if (badge) badge.textContent = codigo;

    const inner = document.getElementById('qrturma-qr-inner');

    try {
      
      await _loadScript(QRCODEJS_CDN);

      
      if (inner && window.QRCode) {
        inner.innerHTML = '';
        inner.style.cssText = 'width:220px;height:220px;';
        new window.QRCode(inner, {
          text: codigo,
          width: 220,
          height: 220,
          colorDark: '#1a1612',
          colorLight: '#ffffff',
          correctLevel: window.QRCode.CorrectLevel.H,
        });
      }
    } catch (err) {
     
      if (inner) {
        inner.style.cssText = 'width:220px;height:220px;';
        inner.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(codigo)}&ecc=H&margin=1"
          width="220" height="220" style="border-radius:6px;display:block;"
          onerror="this.parentElement.innerHTML='<span style=color:#e07060;font-size:12px;>Erro ao gerar QR</span>'" />`;
      }
    }
  }


  async function abrirScan() {
    _mount('scan');
    await _loadScript(JSQR_CDN).catch(() => null); // tenta carregar; falha silenciosa
    
    jsFn = window.jsQR || null;
    await _iniciarCamera();
  }


  async function _switchTab(tab) {
    document.querySelectorAll('.qrturma-tab').forEach(b => b.classList.remove('active'));
    document.getElementById('qrtab-' + tab)?.classList.add('active');
    document.getElementById('qrturma-panel-gerar').style.display = tab === 'gerar' ? 'flex' : 'none';
    document.getElementById('qrturma-panel-scan').style.display  = tab === 'scan'  ? 'flex' : 'none';

    if (tab === 'scan') {
      if (!jsFn) {
        await _loadScript(JSQR_CDN).catch(() => null);
        jsFn = window.jsQR || null;
      }
      await _iniciarCamera();
    } else {
      _pararCamera();
    }
  }

  
  async function _iniciarCamera() {
    const video  = document.getElementById('qrturma-video');
    const status = document.getElementById('qrturma-scan-status');
    if (!video) return;

    try {
          let constraints = { video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 640 } } };
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      video.srcObject = mediaStream;
      await video.play();

      
      if (!scanCanvas) {
        scanCanvas = document.createElement('canvas');
        scanCtx    = scanCanvas.getContext('2d', { willReadFrequently: true });
      }

      if (status) { status.className = ''; status.textContent = 'Aponte a câmera para o QR Code'; }
      _loopScan();
    } catch (e) {
      if (status) { status.className = 'err'; status.textContent = 'Câmera indisponível — use o campo manual.'; }
    }
  }

  function _pararCamera() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    if (mediaStream) { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
  }

 
  let _lastScanTs = 0;
  function _loopScan(ts = 0) {
    
    if (ts - _lastScanTs < 66) { rafId = requestAnimationFrame(_loopScan); return; }
    _lastScanTs = ts;

    const video = document.getElementById('qrturma-video');
    if (!video || !mediaStream) return; // câmera parou

    const fn = jsFn || window.jsQR;
    if (!fn) { rafId = requestAnimationFrame(_loopScan); return; } 

    if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
      const w = video.videoWidth;
      const h = video.videoHeight;
      scanCanvas.width  = w;
      scanCanvas.height = h;
      scanCtx.drawImage(video, 0, 0, w, h);

      let imageData;
      try { imageData = scanCtx.getImageData(0, 0, w, h); } catch { rafId = requestAnimationFrame(_loopScan); return; }

      const result = fn(imageData.data, w, h, { inversionAttempts: 'attemptBoth' });
      if (result && result.data && result.data.trim()) {
        _pararCamera();
        _entrar(result.data.trim());
        return;
      }
    }
    rafId = requestAnimationFrame(_loopScan);
  }


  function _entrar(rawCodigo) {
    const clean = (rawCodigo || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    const status = document.getElementById('qrturma-scan-status');

    if (clean.length !== 6) {
      if (status) { status.className = 'err'; status.textContent = 'Código inválido — deve ter 6 caracteres.'; }
      return;
    }

    if (status) { status.className = 'ok'; status.textContent = `✓ Código ${clean} — entrando…`; }

  
    setTimeout(() => {
      _fechar();

      if (typeof App === 'undefined') return;


      if (typeof App.openEntrarTurmaModal === 'function') App.openEntrarTurmaModal();


      const _tentarPreencher = (tentativas) => {
        const input = document.getElementById('codigo-turma');
        if (input) {
          input.value = clean;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          if (typeof App.entrarTurma === 'function') App.entrarTurma();
        } else if (tentativas > 0) {
          setTimeout(() => _tentarPreencher(tentativas - 1), 80);
        }
      };
      setTimeout(() => _tentarPreencher(10), 80);
    }, 600);
  }


  function _fechar() {
    _pararCamera();
    scanCanvas = null; scanCtx = null; 
    if (overlayEl) { overlayEl.remove(); overlayEl = null; }
  }

  return {
    abrirGerar,
    abrirScan,
    fechar:    _fechar,
    _switchTab,
    _entrar,
   
    _entrarComCodigo: _entrar,
  };
})();

window.QRTurma = QRTurma;




const RevisaoRapida = (() => {
  const API = 'http://localhost:8000';

  let state = {
    cards: [],       
    queue: [],        
    index: 0,
    revealed: false,
    sabia: 0,
    naoSabia: 0,
    aiCards: [],     
    loading: false,
    overlayEl: null,
  };

  function injectStyles() {
    if (document.getElementById('revisao-styles')) return;
    const s = document.createElement('style');
    s.id = 'revisao-styles';
    s.textContent = `
    
      #revisao-overlay {
        position: fixed; inset: 0; z-index: 10020;
        background: rgba(10,8,6,0.92);
        backdrop-filter: blur(16px);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        padding: 20px;
        animation: revFadeIn 0.3s ease;
      }
      @keyframes revFadeIn { from { opacity:0 } to { opacity:1 } }

      
      #revisao-header {
        width: 100%; max-width: 640px; display: flex;
        align-items: center; justify-content: space-between;
        margin-bottom: 20px;
      }
      #revisao-progress-wrap {
        flex: 1; margin: 0 16px; height: 8px;
        background: var(--bg-3, #211d18); border-radius: 20px; overflow: hidden;
      }
      #revisao-progress-bar {
        height: 100%; border-radius: 20px;
        background: linear-gradient(90deg, var(--accent, #e8a04a), #f0c060);
        transition: width 0.4s cubic-bezier(.22,1,.36,1);
        box-shadow: 0 0 8px rgba(232,160,74,0.4);
      }
      #revisao-counter {
        font-size: 13px; font-weight: 600; color: var(--text-2, #8a7a6a);
        min-width: 54px; text-align: right; font-family: 'DM Mono', monospace;
      }
      #revisao-close-btn {
        background: none; border: none; color: var(--text-2, #8a7a6a);
        font-size: 22px; cursor: pointer; padding: 2px 6px; border-radius: 6px;
        transition: color 0.15s; line-height: 1;
      }
      #revisao-close-btn:hover { color: var(--text-0, #f0e8df); }


      #revisao-score-chips {
        display: flex; gap: 10px; margin-bottom: 20px;
      }
      .rev-chip {
        display: flex; align-items: center; gap: 5px;
        padding: 5px 12px; border-radius: 20px;
        font-size: 13px; font-weight: 700; font-family: 'DM Mono', monospace;
      }
      .rev-chip.sabia   { background: rgba(123,196,127,0.15); color: #7bc47f; border: 1px solid rgba(123,196,127,0.3); }
      .rev-chip.nao-sabia { background: rgba(224,112,96,0.15); color: #e07060; border: 1px solid rgba(224,112,96,0.3); }

      
      #revisao-card-scene {
        width: 100%; max-width: 540px;
        perspective: 1200px;
        margin-bottom: 28px;
        min-height: 200px;
      }
      #revisao-card {
        position: relative; width: 100%;
        transform-style: preserve-3d;
        transition: transform 0.5s cubic-bezier(.22,1,.36,1);
        cursor: pointer;
      }
      #revisao-card.flipped { transform: rotateY(180deg); }

      .rev-face {
        position: absolute; width: 100%; backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        background: var(--bg-1, #181410);
        border: 1px solid var(--border, #3a3228);
        border-radius: 20px; padding: 32px 28px;
        min-height: 180px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        text-align: center;
      }
      .rev-face-back { transform: rotateY(180deg); }


      #revisao-card-front {
        position: relative;
        background: var(--bg-1, #181410);
        border: 1px solid var(--border, #3a3228);
        border-radius: 20px; padding: 32px 28px;
        min-height: 180px;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        box-shadow: 0 16px 48px rgba(0,0,0,0.4);
        text-align: center;
        width: 100%; max-width: 540px;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      #revisao-card-front:hover {
        border-color: var(--accent, #e8a04a);
        box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 0 1px var(--accent, #e8a04a);
      }
      #revisao-card-front.revealed {
        cursor: default;
        border-color: var(--border, #3a3228);
        box-shadow: 0 16px 48px rgba(0,0,0,0.4);
      }

      .rev-label {
        font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
        color: var(--text-3, #5a4e44); margin-bottom: 12px;
      }
      .rev-text-front {
        font-size: 22px; font-weight: 600; color: var(--text-0, #f0e8df);
        line-height: 1.4; font-family: 'DM Serif Display', serif;
      }
      .rev-text-back {
        font-size: 17px; color: var(--text-0, #f0e8df); line-height: 1.6;
        margin-top: 12px;
      }
      .rev-divider {
        width: 40px; height: 2px; background: var(--accent, #e8a04a);
        border-radius: 2px; margin: 14px auto;
        opacity: 0;
        transition: opacity 0.3s 0.1s;
      }
      .rev-divider.show { opacity: 1; }

      .rev-reveal-hint {
        font-size: 12px; color: var(--text-3, #5a4e44);
        margin-top: 16px; display: flex; align-items: center; gap: 5px;
        animation: revPulse 2s ease-in-out infinite;
      }
      @keyframes revPulse { 0%,100%{opacity:0.6} 50%{opacity:1} }

      
      #revisao-btns {
        display: flex; gap: 14px; width: 100%; max-width: 540px;
        animation: revBtnsIn 0.3s ease;
      }
      @keyframes revBtnsIn { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }

      .rev-btn {
        flex: 1; padding: 14px; border-radius: 14px;
        border: 2px solid; font-size: 15px; font-weight: 700;
        cursor: pointer; display: flex; flex-direction: column;
        align-items: center; gap: 4px; transition: all 0.15s;
      }
      .rev-btn-sub { font-size: 11px; font-weight: 400; opacity: 0.7; }

      .rev-btn-nao {
        background: rgba(224,112,96,0.1); border-color: rgba(224,112,96,0.4);
        color: #e07060;
      }
      .rev-btn-nao:hover { background: rgba(224,112,96,0.2); border-color: #e07060; transform: translateY(-2px); }

      .rev-btn-sabia {
        background: rgba(123,196,127,0.1); border-color: rgba(123,196,127,0.4);
        color: #7bc47f;
      }
      .rev-btn-sabia:hover { background: rgba(123,196,127,0.2); border-color: #7bc47f; transform: translateY(-2px); }


      #revisao-loading {
        display: flex; flex-direction: column; align-items: center; gap: 16px;
        color: var(--text-2, #8a7a6a);
      }
      .rev-spinner {
        width: 40px; height: 40px; border-radius: 50%;
        border: 3px solid var(--bg-3, #211d18);
        border-top-color: var(--accent, #e8a04a);
        animation: revSpin 0.8s linear infinite;
      }
      @keyframes revSpin { to { transform: rotate(360deg); } }

     
      #revisao-result {
        display: flex; flex-direction: column; align-items: center;
        gap: 20px; width: 100%; max-width: 480px; text-align: center;
      }
      .rev-result-emoji {
        font-size: 72px; line-height: 1;
        animation: revBounce 0.5s cubic-bezier(.22,1,.36,1);
      }
      @keyframes revBounce { from { transform:scale(0.4); opacity:0 } to { transform:scale(1); opacity:1 } }

      .rev-result-title {
        font-size: 28px; font-weight: 700; color: var(--text-0, #f0e8df);
        font-family: 'DM Serif Display', serif;
      }
      .rev-result-subtitle { font-size: 14px; color: var(--text-2, #8a7a6a); }

      .rev-result-stats {
        display: flex; gap: 16px; margin: 4px 0;
      }
      .rev-stat-box {
        flex: 1; padding: 16px 12px; border-radius: 14px;
        border: 1px solid; display: flex; flex-direction: column;
        align-items: center; gap: 4px;
      }
      .rev-stat-box.s { border-color: rgba(123,196,127,0.3); background: rgba(123,196,127,0.08); }
      .rev-stat-box.n { border-color: rgba(224,112,96,0.3); background: rgba(224,112,96,0.08); }
      .rev-stat-num { font-size: 32px; font-weight: 700; font-family: 'DM Mono', monospace; }
      .rev-stat-box.s .rev-stat-num { color: #7bc47f; }
      .rev-stat-box.n .rev-stat-num { color: #e07060; }
      .rev-stat-label { font-size: 12px; color: var(--text-2, #8a7a6a); font-weight: 600; }

      .rev-result-bar-wrap {
        width: 100%; height: 10px; background: var(--bg-3, #211d18);
        border-radius: 20px; overflow: hidden;
      }
      .rev-result-bar {
        height: 100%; border-radius: 20px;
        background: linear-gradient(90deg, #7bc47f, #50b455);
        transition: width 1s cubic-bezier(.22,1,.36,1);
      }

      .rev-result-pct {
        font-size: 48px; font-weight: 700; color: var(--accent, #e8a04a);
        font-family: 'DM Mono', monospace; line-height: 1;
      }

      .rev-result-btns { display: flex; gap: 10px; width: 100%; }
      .rev-result-btn {
        flex: 1; padding: 12px; border-radius: 12px;
        font-size: 14px; font-weight: 600; cursor: pointer;
        border: 1px solid var(--border, #3a3228);
        background: var(--bg-3, #211d18); color: var(--text-1, #c8b89a);
        transition: all 0.15s;
      }
      .rev-result-btn:hover { background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a); border-color: var(--accent, #e8a04a); }
      .rev-result-btn.primary {
        background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a);
        border-color: var(--accent, #e8a04a);
      }
      .rev-result-btn.primary:hover { opacity: 0.85; }

      
      @keyframes revSwipeRight { to { transform: translateX(120%) rotate(15deg); opacity: 0; } }
      @keyframes revSwipeLeft  { to { transform: translateX(-120%) rotate(-15deg); opacity: 0; } }
      .rev-exit-right { animation: revSwipeRight 0.35s ease forwards; }
      .rev-exit-left  { animation: revSwipeLeft  0.35s ease forwards; }
    `;
    document.head.appendChild(s);
  }

  
  function _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }


  async function _buscarFlashcards(roomId) {
    try {
      const res = await fetch(`${API}/api/rooms/${roomId}/flashcards`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.flashcards || data || []).map(fc => ({
        front: fc.front || fc.pergunta || fc.question || '',
        back: fc.back || fc.resposta || fc.answer || '',
        source: 'sala',
      }));
    } catch { return []; }
  }

 
  async function _gerarFlashcardsIA(topico, quantidade = 5) {
    try {
      const prompt = `Gere exatamente ${quantidade} flashcards de estudo sobre "${topico}". Responda APENAS com JSON válido no formato:
[{"front":"pergunta","back":"resposta"},...]
Sem texto extra, sem markdown, sem explicações.`;

      const res = await fetch(`${API}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          context: 'Você é um gerador de flashcards educacionais. Responda apenas com JSON puro.'
        })
      });
      if (!res.ok) return [];
      const data = await res.json();
      const texto = data.response || '';

    
      const match = texto.match(/\[[\s\S]*\]/);
      if (!match) return [];
      const cards = JSON.parse(match[0]);
      return cards.map(c => ({
        front: c.front || '',
        back: c.back || '',
        source: 'ia',
      })).filter(c => c.front && c.back);
    } catch { return []; }
  }

 
  async function abrir(opcoes = {}) {
    
    injectStyles();


    state.cards = [];
    state.queue = [];
    state.index = 0;
    state.revealed = false;
    state.sabia = 0;
    state.naoSabia = 0;

    
    _criarOverlayLoading(opcoes.titulo || 'Revisão Rápida');


    const [cardsSala, cardsIA] = await Promise.all([
      opcoes.roomId ? _buscarFlashcards(opcoes.roomId) : Promise.resolve([]),
      opcoes.topico ? _gerarFlashcardsIA(opcoes.topico, 6) : Promise.resolve([]),
    ]);

    const extras = opcoes.flashcardsExtras || [];

    let cardsApp = [];
    if (!opcoes.roomId && typeof App !== 'undefined') {
      const appState = App.getState ? App.getState() : App.state;
      if (appState?.flashcards?.length) {
        cardsApp = appState.flashcards.map(fc => ({
          front: fc.front || fc.question || '',
          back: fc.back || fc.answer || '',
          source: 'app',
        })).filter(c => c.front);
      }
    }

    state.cards = _shuffle([...cardsSala, ...cardsApp, ...extras, ...cardsIA]);

    if (state.cards.length === 0) {
      
      _fechar();
      if (typeof App !== 'undefined') App.toast('Nenhum flashcard encontrado para revisar.', 'error');
      return;
    }

    state.queue = [...state.cards];
    state.index = 0;

    _renderSessao(opcoes.titulo || 'Revisão Rápida');
  }

  
  function _criarOverlayLoading(titulo) {
    _fechar();
    state.overlayEl = document.createElement('div');
    state.overlayEl.id = 'revisao-overlay';
    state.overlayEl.innerHTML = `
      <div id="revisao-loading">
        <div class="rev-spinner"></div>
        <div style="font-size:16px;font-weight:600;color:var(--text-0,#f0e8df);">${_esc(titulo)}</div>
        <div style="font-size:13px;">Preparando seus flashcards...</div>
      </div>
    `;
    document.body.appendChild(state.overlayEl);
  }


  function _renderSessao(titulo) {
    if (!state.overlayEl) return;

    const total = state.queue.length;
    const atual = state.index;
    const pct = total > 0 ? Math.round((atual / total) * 100) : 0;
    const card = state.queue[atual];

    state.overlayEl.innerHTML = `
      <div id="revisao-header">
        <button id="revisao-close-btn" onclick="RevisaoRapida.fechar()" title="Fechar">&#10005;</button>
        <div id="revisao-progress-wrap">
          <div id="revisao-progress-bar" style="width:${pct}%"></div>
        </div>
        <div id="revisao-counter">${atual}/${total}</div>
      </div>

      <div id="revisao-score-chips">
        <div class="rev-chip sabia">&#10003; <span id="rev-sabia-count">${state.sabia}</span></div>
        <div class="rev-chip nao-sabia">&#10007; <span id="rev-nao-sabia-count">${state.naoSabia}</span></div>
      </div>

      <div id="revisao-card-scene">
        <div id="revisao-card-front" onclick="RevisaoRapida.revelar()">
          <div class="rev-label">&#128196; ${card.source === 'ia' ? 'Gerado pela IA' : 'Flashcard'}</div>
          <div class="rev-text-front" id="rev-texto-frente">${_esc(card.front)}</div>
          <div class="rev-divider" id="rev-divider"></div>
          <div class="rev-text-back" id="rev-texto-verso" style="display:none">${_esc(card.back)}</div>
          <div class="rev-reveal-hint" id="rev-hint">
            <span>&#128065;</span> Clique para revelar a resposta
          </div>
        </div>
      </div>

      <div id="revisao-btns" style="display:none">
        <button class="rev-btn rev-btn-nao" onclick="RevisaoRapida.avaliar(false)">
          &#10007;
          <span class="rev-btn-sub">Não sabia</span>
        </button>
        <button class="rev-btn rev-btn-sabia" onclick="RevisaoRapida.avaliar(true)">
          &#10003;
          <span class="rev-btn-sub">Sabia!</span>
        </button>
      </div>
    `;


    requestAnimationFrame(() => {
      const bar = document.getElementById('revisao-progress-bar');
      if (bar) bar.style.width = pct + '%';
    });
  }


  function revelar() {
    if (state.revealed) return;
    state.revealed = true;

    const cardEl = document.getElementById('revisao-card-front');
    const verso = document.getElementById('rev-texto-verso');
    const divider = document.getElementById('rev-divider');
    const hint = document.getElementById('rev-hint');
    const btns = document.getElementById('revisao-btns');

    if (verso) verso.style.display = 'block';
    if (divider) divider.classList.add('show');
    if (hint) hint.style.display = 'none';
    if (cardEl) cardEl.classList.add('revealed');
    if (btns) {
      btns.style.display = 'flex';

      btns.style.animation = 'none';
      requestAnimationFrame(() => { btns.style.animation = ''; });
    }
  }


  function avaliar(soube) {
    if (!state.revealed) return;

    if (soube) state.sabia++;
    else state.naoSabia++;

   
    const sEl = document.getElementById('rev-sabia-count');
    const nEl = document.getElementById('rev-nao-sabia-count');
    if (sEl) sEl.textContent = state.sabia;
    if (nEl) nEl.textContent = state.naoSabia;

  
    const cardEl = document.getElementById('revisao-card-front');
    if (cardEl) {
      cardEl.classList.add(soube ? 'rev-exit-right' : 'rev-exit-left');
    }

    setTimeout(() => {
      state.index++;
      state.revealed = false;

      if (state.index >= state.queue.length) {
        _renderResultado();
      } else {
        _renderSessao('Revisão Rápida');
      }
    }, 320);
  }

  
  function _renderResultado() {
    if (!state.overlayEl) return;

    const total = state.sabia + state.naoSabia;
    const pct = total > 0 ? Math.round((state.sabia / total) * 100) : 0;

    let emoji = '😅';
    let titulo = 'Continue praticando!';
    let subtitulo = 'A repetição é o caminho do aprendizado.';

    if (pct >= 90)      { emoji = '🏆'; titulo = 'Incrível!'; subtitulo = 'Você domina esse conteúdo!'; }
    else if (pct >= 70) { emoji = '🎉'; titulo = 'Muito bem!'; subtitulo = 'Quase lá — mais um pouco!'; }
    else if (pct >= 50) { emoji = '💪'; titulo = 'Bom esforço!'; subtitulo = 'Revise os que errou e tente de novo.'; }

    state.overlayEl.innerHTML = `
      <div id="revisao-result">
        <div class="rev-result-emoji">${emoji}</div>
        <div>
          <div class="rev-result-title">${_esc(titulo)}</div>
          <div class="rev-result-subtitle">${_esc(subtitulo)}</div>
        </div>

        <div class="rev-result-pct">${pct}%</div>
        <div class="rev-result-bar-wrap">
          <div class="rev-result-bar" id="rev-final-bar" style="width:0%"></div>
        </div>

        <div class="rev-result-stats">
          <div class="rev-stat-box s">
            <div class="rev-stat-num">${state.sabia}</div>
            <div class="rev-stat-label">&#10003; Sabia</div>
          </div>
          <div class="rev-stat-box n">
            <div class="rev-stat-num">${state.naoSabia}</div>
            <div class="rev-stat-label">&#10007; N&atilde;o sabia</div>
          </div>
        </div>

        <div class="rev-result-btns">
          <button class="rev-result-btn" onclick="RevisaoRapida.reiniciar()">&#8635; Tentar de novo</button>
          <button class="rev-result-btn primary" onclick="RevisaoRapida.fechar()">Concluir &#10003;</button>
        </div>
      </div>
    `;

    requestAnimationFrame(() => {
      const bar = document.getElementById('rev-final-bar');
      if (bar) {
        setTimeout(() => { bar.style.width = pct + '%'; }, 100);
      }
    });

   
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(`Revisão concluída: ${pct}% (${state.sabia}/${total})`, pct >= 70 ? 'success' : 'info');
    }
  }

  function reiniciar() {
    state.queue = _shuffle([...state.cards]);
    state.index = 0;
    state.revealed = false;
    state.sabia = 0;
    state.naoSabia = 0;
    _renderSessao('Revisão Rápida');
  }

  
  function _fechar() {
    if (state.overlayEl) { state.overlayEl.remove(); state.overlayEl = null; }
  }

  
  function _esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  
  return {
    abrir,
    revelar,
    avaliar,
    reiniciar,
    fechar: _fechar,
  };
})();

window.RevisaoRapida = RevisaoRapida;




document.addEventListener('DOMContentLoaded', () => {


  const observer = new MutationObserver(() => {
    
    const turmaBtnsRow = document.getElementById('turmas-btns-row') ||
                         document.querySelector('.turmas-actions') ||
                         document.querySelector('[data-section="turmas"] .screen-actions');

    if (turmaBtnsRow && !document.getElementById('btn-scan-qr-turma')) {
      const btnScan = document.createElement('button');
      btnScan.id = 'btn-scan-qr-turma';
      btnScan.className = 'btn-secondary btn-scan-qr';
      btnScan.innerHTML = '&#128247; Escanear QR';
      btnScan.onclick = () => QRTurma.abrirScan();
      turmaBtnsRow.appendChild(btnScan);
    }

    
    document.querySelectorAll('.turma-card[data-code]').forEach(card => {
      if (card.querySelector('.btn-gerar-qr')) return;
      const code = card.dataset.code;
      const btn = document.createElement('button');
      btn.className = 'btn-secondary btn-scan-qr btn-gerar-qr';
      btn.innerHTML = '&#128190; QR Code';
      btn.style.cssText = 'padding:5px 10px;font-size:12px;margin-top:6px;';
      btn.onclick = (e) => { e.stopPropagation(); QRTurma.abrirGerar(code); };
      card.appendChild(btn);
    });


    const fcTabs = document.getElementById('fc-tabs') || document.querySelector('.fc-tabs');
    if (fcTabs && !document.getElementById('btn-revisao-rapida')) {
      const btnRev = document.createElement('button');
      btnRev.id = 'btn-revisao-rapida';
      btnRev.className = 'btn-secondary';
      btnRev.innerHTML = '&#9889; Revisão Rápida';
      btnRev.style.cssText = 'font-size:12px;padding:5px 12px;border-radius:20px;';
      btnRev.onclick = () => {
        const appState = typeof App !== 'undefined' && (App.getState ? App.getState() : App.state);
        RevisaoRapida.abrir({
          roomId: appState?.currentRoom?.id,
          topico: appState?.currentRoom?.subject || appState?.currentRoom?.name,
          titulo: 'Revisão Rápida',
        });
      };
      fcTabs.appendChild(btnRev);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});


window.abrirRevisaoTurma = function(turmaId, topico) {
  RevisaoRapida.abrir({
    roomId: turmaId,
    topico: topico || '',
    titulo: `Revisão: ${topico || 'Flashcards'}`,
  });
};


window.gerarQRTurma = function(codigo) {
  QRTurma.abrirGerar(codigo);
};