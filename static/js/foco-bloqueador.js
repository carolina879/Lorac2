
const FocoBloqueador = (() => {

  let _isBlocking = false;
  let _phase = 'focus'; // 'focus' | 'break'
  let _duration = 0;
  let _remaining = 0;
  let _ticker = null;
  let _ambientSound = 'none';
  let _audio = null;

  const AMBIENT_TRACKS = {
    rain:    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cafe:    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    forest:  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    library: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  };

 
  function init() {
    _injectOverlay();
    _injectStyles();
    _patchApp();
    _addNavigationGuard();
  }


  function _injectOverlay() {
    if (document.getElementById('fb-overlay')) return;

    const el = document.createElement('div');
    el.id = 'fb-overlay';
    el.innerHTML = `
   
      <div class="fb-particles" id="fb-particles"></div>

      
      <div class="fb-center" id="fb-center">
        
        <div class="fb-phase-badge" id="fb-phase-badge">FOCO</div>

     
        <div class="fb-ring-wrap">
          <svg class="fb-ring-svg" viewBox="0 0 200 200">
            <circle class="fb-ring-bg" cx="100" cy="100" r="88"/>
            <circle class="fb-ring-progress" id="fb-ring-prog" cx="100" cy="100" r="88"
              stroke-dasharray="553" stroke-dashoffset="0"/>
          </svg>
          <div class="fb-ring-inner">
            <div class="fb-time-display" id="fb-time-display">25:00</div>
            <div class="fb-time-label" id="fb-time-label">restantes</div>
          </div>
        </div>

      
        <h2 class="fb-heading" id="fb-heading">Modo Foco Ativo</h2>
        <p class="fb-sub" id="fb-sub">O chat e a navegação estão bloqueados.<br>Concentre-se nos estudos.</p>

        
        <div class="fb-breathe" id="fb-breathe" style="display:none;">
          <div class="fb-breathe-circle" id="fb-breathe-circle"></div>
          <div class="fb-breathe-text" id="fb-breathe-text">INSPIRE</div>
        </div>

        
        <div class="fb-ambient-row" id="fb-ambient-row">
          <span class="fb-ambient-label">🎵 Som ambiente</span>
          <div class="fb-ambient-btns">
            <button class="fb-amb-btn active" data-sound="none"   onclick="FocoBloqueador.setAmbient('none')">Silêncio</button>
            <button class="fb-amb-btn"        data-sound="rain"   onclick="FocoBloqueador.setAmbient('rain')">☔ Chuva</button>
            <button class="fb-amb-btn"        data-sound="cafe"   onclick="FocoBloqueador.setAmbient('cafe')">☕ Café</button>
            <button class="fb-amb-btn"        data-sound="forest" onclick="FocoBloqueador.setAmbient('forest')">🌿 Floresta</button>
          </div>
        </div>

   
        <div class="fb-quote" id="fb-quote"></div>

        
        <div class="fb-controls">
          <button class="fb-ctrl-btn fb-ctrl-skip" id="fb-ctrl-skip" onclick="FocoBloqueador.skipToBreak()" style="display:none;">
            Pular para Pausa
          </button>
          <button class="fb-ctrl-btn fb-ctrl-stop" onclick="FocoBloqueador._tryStop()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
            Encerrar Sessão
          </button>
        </div>

       
        <div class="fb-warning" id="fb-warning" style="display:none;">
          ⚠️ Sessão em andamento. Tem certeza?
          <div style="display:flex;gap:8px;margin-top:10px;justify-content:center;">
            <button class="fb-warn-btn fb-warn-yes" onclick="FocoBloqueador._confirmStop()">Sim, encerrar</button>
            <button class="fb-warn-btn fb-warn-no"  onclick="FocoBloqueador._hideWarning()">Continuar focando</button>
          </div>
        </div>
      </div>

    
      <div class="fb-stats-corner" id="fb-stats-corner"></div>
    `;
    document.body.appendChild(el);

    _injectParticles();
    _setQuote();
  }

  function _injectParticles() {
    const container = document.getElementById('fb-particles');
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'fb-particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        top:  ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 8}s;
        animation-duration: ${6 + Math.random() * 8}s;
        width:  ${4 + Math.random() * 8}px;
        height: ${4 + Math.random() * 8}px;
        opacity: ${0.05 + Math.random() * 0.15};
      `;
      container.appendChild(p);
    }
  }

  const QUOTES = [
    '"A concentração é a chave que abre todas as portas." — Paulo Coelho',
    '"O sucesso é a soma de pequenos esforços repetidos dia após dia." — Robert Collier',
    '"Foco. É tudo o que você precisa para transformar sonhos em realidade."',
    '"A disciplina é a ponte entre metas e conquistas." — Jim Rohn',
    '"Uma hora de concentração vale dez horas de dispersão."',
    '"O aprendizado é um tesouro que acompanha seu dono em toda parte." — Provérbio chinês',
    '"Cada minuto de estudo hoje é um passo em direção ao seu futuro."',
  ];

  function _setQuote() {
    const el = document.getElementById('fb-quote');
    if (el) el.textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  
  function _injectStyles() {
    if (document.getElementById('fb-styles')) return;
    const style = document.createElement('style');
    style.id = 'fb-styles';
    style.textContent = `
     
      #fb-overlay {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99990;
        background: radial-gradient(ellipse at 50% 30%, #1e1a14 0%, #0d0b08 100%);
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      #fb-overlay.active { display: flex; }

      .fb-particles { position: absolute; inset: 0; pointer-events: none; }
      .fb-particle {
        position: absolute;
        border-radius: 50%;
        background: var(--accent, #e8a04a);
        animation: fb-float linear infinite;
      }
      @keyframes fb-float {
        0%   { transform: translateY(0) rotate(0deg); }
        50%  { transform: translateY(-30px) rotate(180deg); }
        100% { transform: translateY(0) rotate(360deg); }
      }

      .fb-center {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
        max-width: 480px;
        padding: 0 24px;
        animation: fb-enter .4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      @keyframes fb-enter {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }

     
      .fb-phase-badge {
        padding: 4px 16px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .14em;
        background: rgba(232,160,74,.15);
        color: var(--accent, #e8a04a);
        border: 1px solid rgba(232,160,74,.25);
        font-family: var(--font-mono, 'DM Mono', monospace);
      }
      .fb-phase-badge.break {
        background: rgba(122,158,126,.15);
        color: #7abc8a;
        border-color: rgba(122,158,126,.25);
      }

   
      .fb-ring-wrap {
        position: relative;
        width: 200px;
        height: 200px;
        flex-shrink: 0;
      }
      .fb-ring-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
      .fb-ring-bg {
        fill: none;
        stroke: rgba(255,255,255,.05);
        stroke-width: 8;
      }
      .fb-ring-progress {
        fill: none;
        stroke: var(--accent, #e8a04a);
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 1s linear, stroke .5s;
        filter: drop-shadow(0 0 8px rgba(232,160,74,.5));
      }
      .fb-ring-progress.break {
        stroke: #7abc8a;
        filter: drop-shadow(0 0 8px rgba(122,188,138,.5));
      }
      .fb-ring-inner {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }
      .fb-time-display {
        font-family: var(--font-mono, 'DM Mono', monospace);
        font-size: 42px;
        font-weight: 500;
        color: var(--text-0, #f0ece4);
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .fb-time-label {
        font-size: 11px;
        color: var(--text-3, #6b6460);
        letter-spacing: .06em;
        text-transform: uppercase;
      }

      
      .fb-heading {
        font-family: var(--font-display, 'DM Serif Display', serif);
        font-size: 26px;
        color: var(--text-0, #f0ece4);
        margin: 0;
      }
      .fb-sub {
        font-size: 14px;
        color: var(--text-2, #9b9188);
        line-height: 1.6;
        margin: 0;
      }

   
      .fb-breathe {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .fb-breathe-circle {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(122,188,138,.4), rgba(122,188,138,.1));
        border: 2px solid rgba(122,188,138,.3);
        animation: fb-breathe-anim 8s ease-in-out infinite;
      }
      @keyframes fb-breathe-anim {
        0%,100% { transform: scale(1); opacity: .5; }
        40%     { transform: scale(1.4); opacity: 1; }
        60%     { transform: scale(1.4); opacity: 1; }
      }
      .fb-breathe-text {
        font-size: 11px;
        letter-spacing: .14em;
        color: #7abc8a;
        font-family: var(--font-mono, 'DM Mono', monospace);
        animation: fb-breathe-text-anim 8s ease-in-out infinite;
      }
      @keyframes fb-breathe-text-anim {
        0%,100% { opacity: .6; content: "INSPIRE"; }
        40%,60% { opacity: 1; }
      }

     
      .fb-ambient-row {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .fb-ambient-label {
        font-size: 12px;
        color: var(--text-3, #6b6460);
      }
      .fb-ambient-btns {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .fb-amb-btn {
        padding: 5px 12px;
        border-radius: 20px;
        border: 1px solid var(--border, rgba(255,255,255,.1));
        background: var(--bg-3, #2a2520);
        color: var(--text-2, #9b9188);
        font-size: 12px;
        cursor: pointer;
        transition: all .2s;
      }
      .fb-amb-btn:hover { border-color: var(--accent, #e8a04a); color: var(--accent, #e8a04a); }
      .fb-amb-btn.active {
        background: rgba(232,160,74,.15);
        border-color: rgba(232,160,74,.4);
        color: var(--accent, #e8a04a);
      }

      
      .fb-quote {
        font-size: 12px;
        color: var(--text-3, #6b6460);
        font-style: italic;
        max-width: 360px;
        line-height: 1.6;
        padding: 0 16px;
      }

   
      .fb-controls {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
        justify-content: center;
      }
      .fb-ctrl-btn {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 9px 20px;
        border-radius: 10px;
        border: 1px solid var(--border, rgba(255,255,255,.1));
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all .2s;
      }
      .fb-ctrl-stop {
        background: rgba(220,80,60,.1);
        border-color: rgba(220,80,60,.25);
        color: #e07060;
      }
      .fb-ctrl-stop:hover { background: rgba(220,80,60,.2); }
      .fb-ctrl-skip {
        background: rgba(122,188,138,.1);
        border-color: rgba(122,188,138,.25);
        color: #7abc8a;
      }
      .fb-ctrl-skip:hover { background: rgba(122,188,138,.2); }

      
      .fb-warning {
        background: rgba(220,80,60,.12);
        border: 1px solid rgba(220,80,60,.3);
        border-radius: 12px;
        padding: 16px 24px;
        color: #e07060;
        font-size: 14px;
        animation: fb-enter .2s ease;
      }
      .fb-warn-btn {
        padding: 7px 16px;
        border-radius: 8px;
        border: 1px solid;
        font-size: 13px;
        cursor: pointer;
        transition: all .2s;
      }
      .fb-warn-yes {
        background: rgba(220,80,60,.15);
        border-color: rgba(220,80,60,.35);
        color: #e07060;
      }
      .fb-warn-yes:hover { background: rgba(220,80,60,.3); }
      .fb-warn-no {
        background: rgba(122,188,138,.1);
        border-color: rgba(122,188,138,.25);
        color: #7abc8a;
      }
      .fb-warn-no:hover { background: rgba(122,188,138,.2); }

     
      .fb-stats-corner {
        position: absolute;
        top: 24px;
        right: 24px;
        text-align: right;
        font-size: 12px;
        color: var(--text-3, #6b6460);
        font-family: var(--font-mono, 'DM Mono', monospace);
      }


      body.fb-active .nav-btn:not(.fb-allowed) {
        pointer-events: none !important;
        opacity: 0.3 !important;
      }
      body.fb-active #chat-input,
      body.fb-active .chat-area,
      body.fb-active .messages-container {
        pointer-events: none !important;
        filter: blur(4px);
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }


  function _patchApp() {
    const originalStart = window.App?.startFocus;
    const originalStop  = window.App?.stopFocus;

    if (window.App && originalStart) {
    
      const newStart = function() {
        const durEl = document.getElementById('focus-duration');
        const soundEl = document.getElementById('focus-ambient-select');
        const dur = parseInt(durEl?.value) || 25;
        const sound = soundEl?.value || 'none';
        FocoBloqueador.startBlocking(dur, sound);
      };
      window.App.startFocus = newStart;

      const newStop = function() {
        FocoBloqueador.stopBlocking();
      };
      window.App.stopFocus = newStop;
    } else {
     
    }
  }

  
  function _addNavigationGuard() {
    window.addEventListener('beforeunload', (e) => {
      if (_isBlocking && _phase === 'focus') {
        e.preventDefault();
        e.returnValue = 'Você tem uma sessão de foco ativa. Tem certeza que deseja sair?';
      }
    });
  }

 
  function startBlocking(durationMin, soundType = 'none') {
    _isBlocking = true;
    _phase = 'focus';
    _duration = durationMin * 60;
    _remaining = _duration;
    _ambientSound = soundType;
    _setQuote();

    
    if (soundType !== 'none' && AMBIENT_TRACKS[soundType]) {
      _audio = new Audio(AMBIENT_TRACKS[soundType]);
      _audio.loop = true;
      _audio.volume = 0.4;
      _audio.play().catch(() => {});
    }

    _syncOriginalUI(true);


    _setPhaseUI('focus');
    document.getElementById('fb-overlay')?.classList.add('active');
    document.body.classList.add('fb-active');

   
    _updateStatsCorner();

    
    if (_ticker) clearInterval(_ticker);
    _ticker = setInterval(_tick, 1000);

  
    _updateAmbientBtns(soundType);

    window.App?.state && (window.App.state.focusActive = true);
    window.App?.state && (window.App.state.focusPhase = 'focus');
  }

  function stopBlocking(silent = false) {
    _isBlocking = false;
    _phase = 'focus';
    if (_ticker) { clearInterval(_ticker); _ticker = null; }
    if (_audio)  { _audio.pause(); _audio = null; }

    document.getElementById('fb-overlay')?.classList.remove('active');
    document.body.classList.remove('fb-active');
    document.getElementById('fb-warning').style.display = 'none';

    _syncOriginalUI(false);

    if (!silent) {
      window.App?.toast('Sessão encerrada.', '');
      window.App?.state && (window.App.state.focusActive = false);
    }
  }

  function skipToBreak() {
    if (_phase !== 'focus') return;
    _startBreak();
  }

  function setAmbient(soundType) {
    if (_audio) { _audio.pause(); _audio = null; }
    _ambientSound = soundType;
    if (soundType !== 'none' && AMBIENT_TRACKS[soundType]) {
      _audio = new Audio(AMBIENT_TRACKS[soundType]);
      _audio.loop = true;
      _audio.volume = 0.4;
      _audio.play().catch(() => {});
    }
    _updateAmbientBtns(soundType);
  }

  function _tryStop() {
    const warning = document.getElementById('fb-warning');
    if (warning) {
      warning.style.display = 'block';
      warning.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function _hideWarning() {
    const warning = document.getElementById('fb-warning');
    if (warning) warning.style.display = 'none';
  }

  function _confirmStop() {
    stopBlocking();
  }

  
  function _tick() {
    if (_remaining > 0) {
      _remaining--;
      _updateTimerUI();
    } else {
      clearInterval(_ticker);
      _ticker = null;
      if (_phase === 'focus') {
        _startBreak();
      } else {
        _endBreak();
      }
    }
  }

  function _startBreak() {
    if (_audio) { _audio.pause(); _audio = null; }
   
    new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3').play().catch(() => {});

    _phase = 'break';
    const appState = window.App?.getState?.() || window.App?.state;
    const breakDur = appState?.focusBreakDuration || 5;
    _duration = breakDur * 60;
    _remaining = _duration;

    _setPhaseUI('break');
    window.App?.toast(`Pausa de ${breakDur} min! 🌿`, 'success');
    window.App?.pushNotif?.('🌿', 'Hora da pausa! Descanse os olhos.', true);

    if (_ticker) clearInterval(_ticker);
    _ticker = setInterval(_tick, 1000);

    
    document.body.classList.remove('fb-active');
  }

  function _endBreak() {
    stopBlocking(true);
    window.App?.toast('Sessão completa! 🎉', 'success');
    window.App?.pushNotif?.('🎉', 'Sessão de foco concluída!', true);

    if (window.App?.showSubjectPickerModal) {
      window.App.showSubjectPickerModal(_duration);
    }
    window.App?.checkAndUnlockBadges?.();
  }

  
  function _setPhaseUI(phase) {
    const badge    = document.getElementById('fb-phase-badge');
    const prog     = document.getElementById('fb-ring-prog');
    const heading  = document.getElementById('fb-heading');
    const sub      = document.getElementById('fb-sub');
    const breathe  = document.getElementById('fb-breathe');
    const ambRow   = document.getElementById('fb-ambient-row');
    const skipBtn  = document.getElementById('fb-ctrl-skip');

    if (phase === 'focus') {
      if (badge)   { badge.textContent = 'FOCO'; badge.className = 'fb-phase-badge'; }
      if (prog)    prog.className = 'fb-ring-progress';
      if (heading) heading.textContent = 'Modo Foco Ativo';
      if (sub)     sub.innerHTML = 'O chat e a navegação estão bloqueados.<br>Concentre-se nos estudos.';
      if (breathe) breathe.style.display = 'none';
      if (ambRow)  ambRow.style.display = 'flex';
      if (skipBtn) skipBtn.style.display = 'flex';
    } else {
      if (badge)   { badge.textContent = 'PAUSA'; badge.className = 'fb-phase-badge break'; }
      if (prog)    prog.className = 'fb-ring-progress break';
      if (heading) heading.textContent = 'Pausa Restauradora';
      if (sub)     sub.innerHTML = 'Siga o ritmo da respiração. O foco retorna em breve.';
      if (breathe) breathe.style.display = 'flex';
      if (ambRow)  ambRow.style.display = 'none';
      if (skipBtn) skipBtn.style.display = 'none';
    }

    _updateTimerUI();
  }

  function _updateTimerUI() {
    const m = Math.floor(_remaining / 60).toString().padStart(2, '0');
    const s = (_remaining % 60).toString().padStart(2, '0');
    const timeStr = `${m}:${s}`;

   
    const displayEl = document.getElementById('fb-time-display');
    if (displayEl) displayEl.textContent = timeStr;

    const prog = document.getElementById('fb-ring-prog');
    if (prog) {
      const CIRCUMFERENCE = 553; 
      const pct = _duration > 0 ? _remaining / _duration : 0;
      prog.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
    }

  
    const timerEl = document.getElementById('focus-timer');
    if (timerEl) timerEl.textContent = timeStr;

    const overlayTimer = document.getElementById('focus-overlay-timer');
    if (overlayTimer) overlayTimer.textContent = timeStr;

    const progBar = document.getElementById('focus-progress-bar');
    if (progBar && _duration > 0) {
      progBar.style.width = ((_remaining / _duration) * 100) + '%';
    }

    if (window.App?.state) {
      window.App.state.focusRemaining = _remaining;
    }
  }

  function _updateStatsCorner() {
    const corner = document.getElementById('fb-stats-corner');
    if (!corner) return;
    const appState = window.App?.getState?.() || window.App?.state;
    const streak = appState?.studySessions?.length || 0;
    corner.innerHTML = `
      <div style="font-size:18px;margin-bottom:4px;">🔥</div>
      <div>${streak} sessão(ões)</div>
    `;
  }

  function _updateAmbientBtns(soundType) {
    document.querySelectorAll('.fb-amb-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sound === soundType);
    });
  }


  function _syncOriginalUI(starting) {
    const startBtn = document.getElementById('btn-focus-start');
    const stopBtn  = document.getElementById('btn-focus-stop');
    const durInput = document.getElementById('focus-duration');

    if (startBtn) startBtn.style.display = starting ? 'none' : '';
    if (stopBtn)  stopBtn.style.display  = starting ? '' : 'none';
    if (durInput) durInput.disabled = starting;

    
    const oldOverlay = document.getElementById('focus-overlay');
    if (oldOverlay) oldOverlay.classList.remove('active'); // Usamos nosso overlay

    if (starting) {
      
      const phaseBadge = document.getElementById('focus-phase-badge');
      if (phaseBadge) phaseBadge.textContent = 'FOCO';
    } else {
      const phaseBadge = document.getElementById('focus-phase-badge');
      if (phaseBadge) phaseBadge.textContent = '';
      const timerEl = document.getElementById('focus-timer');
      if (timerEl) {
        const dur = parseInt(document.getElementById('focus-duration')?.value || 25) * 60;
        const m = Math.floor(dur / 60).toString().padStart(2, '0');
        timerEl.textContent = `${m}:00`;
      }
      const progBar = document.getElementById('focus-progress-bar');
      if (progBar) progBar.style.width = '100%';
    }
  }

  return {
    init,
    startBlocking,
    stopBlocking,
    skipToBreak,
    setAmbient,
    _tryStop,
    _hideWarning,
    _confirmStop,
  };
})();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => FocoBloqueador.init());
} else {
  FocoBloqueador.init();
}
