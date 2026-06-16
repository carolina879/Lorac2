
const QuimicaVisual = (() => {
  const MODAL_ID = 'modal-quimica-visual';

 
  const REACOES_DB = [
    {
      reagentes: ['H₂', 'O₂'],
      produto: 'H₂O',
      titulo: 'Síntese da Água',
      eq: '2 H₂ + O₂ → 2 H₂O',
      tipo: 'síntese',
      descricao: 'Reação de síntese exotérmica. Hidrogênio e oxigênio se combinam formando água.',
      cor: '#3b82f6',
      corLiquido: 'rgba(59,130,246,0.55)',
      emoji: '💧',
      efeito: 'chamas',
      deltaH: '−484 kJ/mol'
    },
    {
      reagentes: ['Na', 'Cl₂'],
      produto: 'NaCl',
      titulo: 'Síntese do Sal de Cozinha',
      eq: '2 Na + Cl₂ → 2 NaCl',
      tipo: 'síntese',
      descricao: 'Metal alcalino reage violentamente com gás cloro formando cloreto de sódio.',
      cor: '#f1f5f9',
      corLiquido: 'rgba(241,245,249,0.45)',
      emoji: '🧂',
      efeito: 'explosao',
      deltaH: '−822 kJ/mol'
    },
    {
      reagentes: ['HCl', 'NaOH'],
      produto: 'NaCl + H₂O',
      titulo: 'Neutralização Ácido-Base',
      eq: 'HCl + NaOH → NaCl + H₂O',
      tipo: 'neutralização',
      descricao: 'Reação de neutralização entre ácido clorídrico e hidróxido de sódio.',
      cor: '#a3e635',
      corLiquido: 'rgba(163,230,53,0.45)',
      emoji: '⚗️',
      efeito: 'bolhas',
      deltaH: '−57.3 kJ/mol'
    },
    {
      reagentes: ['Fe', 'O₂'],
      produto: 'Fe₂O₃',
      titulo: 'Oxidação do Ferro (Ferrugem)',
      eq: '4 Fe + 3 O₂ → 2 Fe₂O₃',
      tipo: 'oxidação',
      descricao: 'Processo lento de corrosão. Ferro reage com oxigênio formando óxido de ferro III.',
      cor: '#c2410c',
      corLiquido: 'rgba(194,65,12,0.55)',
      emoji: '🔩',
      efeito: 'fumaca',
      deltaH: '−824 kJ/mol'
    },
    {
      reagentes: ['C', 'O₂'],
      produto: 'CO₂',
      titulo: 'Combustão do Carbono',
      eq: 'C + O₂ → CO₂',
      tipo: 'combustão',
      descricao: 'Combustão completa do carbono. Base da respiração celular e combustíveis fósseis.',
      cor: '#6366f1',
      corLiquido: 'rgba(99,102,241,0.45)',
      emoji: '🔥',
      efeito: 'chamas',
      deltaH: '−393.5 kJ/mol'
    },
    {
      reagentes: ['H₂SO₄', 'CaCO₃'],
      produto: 'CaSO₄ + H₂O + CO₂',
      titulo: 'Ácido Sulfúrico com Calcário',
      eq: 'H₂SO₄ + CaCO₃ → CaSO₄ + H₂O + CO₂',
      tipo: 'dupla troca',
      descricao: 'Reação entre ácido sulfúrico e carbonato de cálcio liberando CO₂ visível.',
      cor: '#f59e0b',
      corLiquido: 'rgba(245,158,11,0.45)',
      emoji: '🧬',
      efeito: 'bolhas',
      deltaH: '−12 kJ/mol'
    },
    {
      reagentes: ['Mg', 'O₂'],
      produto: 'MgO',
      titulo: 'Combustão do Magnésio',
      eq: '2 Mg + O₂ → 2 MgO',
      tipo: 'combustão',
      descricao: 'Combustão intensa com chama branca brilhante. Usada em fogos de artifício.',
      cor: '#e2e8f0',
      corLiquido: 'rgba(226,232,240,0.45)',
      emoji: '✨',
      efeito: 'explosao',
      deltaH: '−601 kJ/mol'
    },
    {
      reagentes: ['NH₃', 'HCl'],
      produto: 'NH₄Cl',
      titulo: 'Síntese do Cloreto de Amônio',
      eq: 'NH₃ + HCl → NH₄Cl',
      tipo: 'síntese',
      descricao: 'Gases amônia e cloreto de hidrogênio reagem produzindo névoa branca sólida.',
      cor: '#d1d5db',
      corLiquido: 'rgba(209,213,219,0.35)',
      emoji: '🌫️',
      efeito: 'fumaca',
      deltaH: '−176 kJ/mol'
    }
  ];

  
  const SUBSTANCIAS = [
    { id: 'H₂',    nome: 'Hidrogênio', grupo: 'gás',    cor: '#93c5fd' },
    { id: 'O₂',    nome: 'Oxigênio',   grupo: 'gás',    cor: '#fb923c' },
    { id: 'Na',    nome: 'Sódio',      grupo: 'metal',  cor: '#c084fc' },
    { id: 'Cl₂',   nome: 'Cloro',      grupo: 'gás',    cor: '#86efac' },
    { id: 'HCl',   nome: 'Ác. Clorídrico', grupo: 'ácido', cor: '#fde68a' },
    { id: 'NaOH',  nome: 'Soda Cáustica',  grupo: 'base',  cor: '#a5f3fc' },
    { id: 'Fe',    nome: 'Ferro',      grupo: 'metal',  cor: '#d97706' },
    { id: 'C',     nome: 'Carbono',    grupo: 'sólido', cor: '#6b7280' },
    { id: 'Mg',    nome: 'Magnésio',   grupo: 'metal',  cor: '#e2e8f0' },
    { id: 'H₂SO₄', nome: 'Ác. Sulfúrico', grupo: 'ácido', cor: '#fbbf24' },
    { id: 'CaCO₃', nome: 'Calcário',   grupo: 'sólido', cor: '#d4d4d8' },
    { id: 'NH₃',   nome: 'Amônia',     grupo: 'gás',    cor: '#bef264' },
  ];

  
  const MOLECULAS_3D = {
    'H₂O': {
      nome: 'Água',
      formula: 'H₂O',
      descricao: 'Molécula polar angular. Ângulo H-O-H: 104,5°',
      geometria: 'Angular',
      polaridade: 'Polar',
      atomos: [
        { t: 'O', pos: [0, 0, 0], r: 0.55 },
        { t: 'H', pos: [-0.8, -0.6, 0], r: 0.3 },
        { t: 'H', pos: [0.8, -0.6, 0], r: 0.3 },
      ],
      conexoes: [[0, 1], [0, 2]]
    },
    'CO₂': {
      nome: 'Dióxido de Carbono',
      formula: 'CO₂',
      descricao: 'Molécula linear. Ângulo O-C-O: 180°',
      geometria: 'Linear',
      polaridade: 'Apolar',
      atomos: [
        { t: 'C', pos: [0, 0, 0], r: 0.45 },
        { t: 'O', pos: [-1.2, 0, 0], r: 0.55 },
        { t: 'O', pos: [1.2, 0, 0], r: 0.55 },
      ],
      conexoes: [[0, 1], [0, 2]]
    },
    'CH₄': {
      nome: 'Metano',
      formula: 'CH₄',
      descricao: 'Geometria tetraédrica perfeita. Ângulo H-C-H: 109,5°',
      geometria: 'Tetraédrica',
      polaridade: 'Apolar',
      atomos: [
        { t: 'C', pos: [0, 0, 0], r: 0.45 },
        { t: 'H', pos: [0.9, 0.9, 0.9], r: 0.28 },
        { t: 'H', pos: [-0.9, -0.9, 0.9], r: 0.28 },
        { t: 'H', pos: [-0.9, 0.9, -0.9], r: 0.28 },
        { t: 'H', pos: [0.9, -0.9, -0.9], r: 0.28 },
      ],
      conexoes: [[0,1],[0,2],[0,3],[0,4]]
    },
    'NH₃': {
      nome: 'Amônia',
      formula: 'NH₃',
      descricao: 'Geometria piramidal trigonal. Ângulo H-N-H: 107°',
      geometria: 'Piramidal',
      polaridade: 'Polar',
      atomos: [
        { t: 'N', pos: [0, 0.3, 0], r: 0.5 },
        { t: 'H', pos: [-0.9, -0.4, 0.5], r: 0.28 },
        { t: 'H', pos: [0.9, -0.4, 0.5], r: 0.28 },
        { t: 'H', pos: [0, -0.4, -1.0], r: 0.28 },
      ],
      conexoes: [[0,1],[0,2],[0,3]]
    },
    'O₂': {
      nome: 'Oxigênio Molecular',
      formula: 'O₂',
      descricao: 'Molécula diatômica homonuclear. Ligação dupla.',
      geometria: 'Linear',
      polaridade: 'Apolar',
      atomos: [
        { t: 'O', pos: [-0.6, 0, 0], r: 0.55 },
        { t: 'O', pos: [0.6, 0, 0], r: 0.55 },
      ],
      conexoes: [[0, 1]]
    },
    'NaCl': {
      nome: 'Cloreto de Sódio',
      formula: 'NaCl',
      descricao: 'Ligação iônica entre sódio (Na⁺) e cloro (Cl⁻). Sal de cozinha.',
      geometria: 'Linear (iônica)',
      polaridade: 'Iônica',
      atomos: [
        { t: 'Na', pos: [-0.8, 0, 0], r: 0.6 },
        { t: 'Cl', pos: [0.8, 0, 0], r: 0.65 },
      ],
      conexoes: [[0, 1]]
    },
    'C₆H₆': {
      nome: 'Benzeno',
      formula: 'C₆H₆',
      descricao: 'Anel aromático planar com deslocalização eletrônica. Ângulo C-C-C: 120°',
      geometria: 'Planar trigonal',
      polaridade: 'Apolar',
      atomos: [
        { t: 'C', pos: [1.2, 0, 0], r: 0.4 },
        { t: 'C', pos: [0.6, 1.04, 0], r: 0.4 },
        { t: 'C', pos: [-0.6, 1.04, 0], r: 0.4 },
        { t: 'C', pos: [-1.2, 0, 0], r: 0.4 },
        { t: 'C', pos: [-0.6, -1.04, 0], r: 0.4 },
        { t: 'C', pos: [0.6, -1.04, 0], r: 0.4 },
        { t: 'H', pos: [2.2, 0, 0], r: 0.25 },
        { t: 'H', pos: [1.1, 1.9, 0], r: 0.25 },
        { t: 'H', pos: [-1.1, 1.9, 0], r: 0.25 },
        { t: 'H', pos: [-2.2, 0, 0], r: 0.25 },
        { t: 'H', pos: [-1.1, -1.9, 0], r: 0.25 },
        { t: 'H', pos: [1.1, -1.9, 0], r: 0.25 },
      ],
      conexoes: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]]
    }
  };

 
  const ATOM_COLORS = {
    'H':  0xffffff,
    'O':  0xff2200,
    'C':  0x333333,
    'Na': 0xaa33ff,
    'Cl': 0x22dd22,
    'N':  0x2255ff,
    'Fe': 0xdd6600,
    'Mg': 0x33bb33,
    'S':  0xffdd00,
    'Ca': 0xaaaaaa,
  };

  const ATOM_LABELS = {
    'H':'Hidrogênio','O':'Oxigênio','C':'Carbono','Na':'Sódio',
    'Cl':'Cloro','N':'Nitrogênio','Fe':'Ferro','Mg':'Magnésio',
    'S':'Enxofre','Ca':'Cálcio'
  };

  
  let labState = {
    reagentesNoConteiner: new Set(),
    particulas: [],
    animFrameId: null
  };

  let builderState = { atomos: [], conexoes: [], selectedIdx: null };
  let threeState = { scene: null, camera: null, renderer: null, group: null, animFrameId: null, isDragging: false, lastMouse: null };
  let moleculaAtiva = null;

 
  function abrir(tipo) {
    document.getElementById(MODAL_ID)?.remove();
    cancelAnimations();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText = `
      position:fixed; inset:0; z-index:100005;
      background: rgba(0,0,0,0.82);
      display:flex; align-items:center; justify-content:center;
      backdrop-filter: blur(6px);
      animation: qvFadeIn 0.25s ease;
    `;

    let content = '';
    if (tipo === 'laboratorio') content = _renderLaboratorio();
    else if (tipo === 'moleculas') content = _renderMoleculas();
    else if (tipo === 'builder') content = _renderBuilder();

    const titles = {
      laboratorio: '⚗️ Laboratório Virtual de Reações',
      moleculas:   '🧬 Visualizador 3D de Moléculas',
      builder:     '🔬 Construtor Molecular 3D'
    };

    modal.innerHTML = `
      <style>
        @keyframes qvFadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        @keyframes qvParticle { 0%{transform:translateY(0) scale(1);opacity:1} 100%{transform:translateY(-120px) scale(0.2);opacity:0} }
        @keyframes qvBubble { 0%{transform:translateY(0) scale(0.5);opacity:0.8} 100%{transform:translateY(-100px) scale(1.5);opacity:0} }
        @keyframes qvChama { 0%,100%{transform:scale(1) rotate(-2deg);opacity:1} 50%{transform:scale(1.2) rotate(2deg);opacity:0.85} }
        @keyframes qvShake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        @keyframes qvPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.4)} 50%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }
        @keyframes qvSlideUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes qvGlow { 0%,100%{filter:drop-shadow(0 0 8px currentColor)} 50%{filter:drop-shadow(0 0 20px currentColor)} }

        #${MODAL_ID} * { box-sizing:border-box; }
        #qv-box {
          width:96vw; max-width:1100px; height:90vh; max-height:820px;
          background: linear-gradient(145deg, #0f1117 0%, #111827 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          display:flex; flex-direction:column;
          overflow:hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05);
        }
        #qv-header {
          display:flex; align-items:center; justify-content:space-between;
          padding: 18px 28px;
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          flex-shrink:0;
        }
        #qv-title {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 20px; color: #f1f5f9; letter-spacing: -0.3px;
          display:flex; align-items:center; gap:10px;
        }
        #qv-tabs {
          display:flex; gap:6px;
          background:rgba(255,255,255,0.05); border-radius:12px; padding:4px;
        }
        .qv-tab {
          padding:7px 16px; border:none; border-radius:8px; cursor:pointer;
          font-size:12px; font-weight:600; letter-spacing:0.3px;
          transition: all 0.2s; color: rgba(255,255,255,0.4);
          background: transparent;
        }
        .qv-tab.active { background: rgba(99,102,241,0.9); color:#fff; }
        .qv-tab:hover:not(.active) { background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.7); }
        #qv-close {
          width:34px; height:34px; border:none; border-radius:50%; cursor:pointer;
          background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6);
          font-size:18px; display:flex; align-items:center; justify-content:center;
          transition: all 0.2s;
        }
        #qv-close:hover { background:rgba(239,68,68,0.7); color:#fff; }
        #qv-body { flex:1; overflow:hidden; display:flex; }

      
        .qv-shelf-item {
          display:flex; align-items:center; gap:8px;
          padding:8px 12px; border-radius:10px; cursor:pointer;
          border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.04);
          transition: all 0.2s; user-select:none;
        }
        .qv-shelf-item:hover { background:rgba(255,255,255,0.09); transform:translateX(3px); }
        .qv-shelf-item.in-container { background:rgba(99,102,241,0.2); border-color:rgba(99,102,241,0.5); }
        .qv-shelf-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        .qv-shelf-id { font-family:'DM Mono',monospace; font-size:13px; font-weight:600; color:#f1f5f9; }
        .qv-shelf-nome { font-size:10px; color:rgba(255,255,255,0.35); }

        .qv-container-area {
          flex:1; position:relative;
          background: radial-gradient(ellipse at 50% 80%, rgba(20,30,60,0.8) 0%, rgba(8,12,24,0.95) 100%);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:18px; overflow:hidden;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
        }
        #qv-vessel-wrap { position:relative; cursor:default; }
        #qv-vessel-svg { width:180px; height:220px; filter:drop-shadow(0 20px 40px rgba(0,0,0,0.6)); }
        #qv-particles-canvas {
          position:absolute; inset:0; pointer-events:none; z-index:10;
        }
        #qv-reaction-card {
          position:absolute; bottom:20px; left:20px; right:20px;
          animation: qvSlideUp 0.35s ease;
        }
        .qv-rc-inner {
          background: rgba(15,17,23,0.92);
          border:1px solid rgba(255,255,255,0.1);
          border-radius:14px; padding:16px 20px;
          backdrop-filter:blur(10px);
        }
        .qv-rc-tipo { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#6366f1; margin-bottom:4px; }
        .qv-rc-titulo { font-family:'DM Serif Display',serif; font-size:16px; color:#f1f5f9; margin-bottom:6px; }
        .qv-rc-eq { font-family:'DM Mono',monospace; font-size:14px; color:#a5b4fc; margin-bottom:8px; }
        .qv-rc-desc { font-size:11px; color:rgba(255,255,255,0.45); line-height:1.5; }
        .qv-rc-meta { display:flex; gap:12px; margin-top:10px; }
        .qv-rc-badge { padding:4px 10px; border-radius:6px; font-size:10px; font-weight:600; background:rgba(99,102,241,0.2); color:#a5b4fc; border:1px solid rgba(99,102,241,0.3); }

        #qv-mol-list { display:flex; flex-direction:column; gap:4px; }
        .qv-mol-item {
          padding:10px 14px; border-radius:10px; cursor:pointer;
          border:1px solid rgba(255,255,255,0.06); transition:all 0.2s;
          background:rgba(255,255,255,0.03);
        }
        .qv-mol-item:hover { background:rgba(255,255,255,0.07); }
        .qv-mol-item.active { background:rgba(99,102,241,0.2); border-color:rgba(99,102,241,0.4); }
        .qv-mol-formula { font-family:'DM Mono',monospace; font-size:13px; font-weight:600; color:#f1f5f9; }
        .qv-mol-nome { font-size:10px; color:rgba(255,255,255,0.35); margin-top:2px; }

        #qv-mol-info { padding:16px; border-top:1px solid rgba(255,255,255,0.06); }
        .qv-info-row { display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
        .qv-info-label { font-size:10px; color:rgba(255,255,255,0.35); }
        .qv-info-val { font-size:11px; font-weight:600; color:#f1f5f9; }

        .qv-3d-hint { position:absolute; bottom:14px; right:14px; font-size:10px; color:rgba(255,255,255,0.25); pointer-events:none; }


        .qv-atom-btn {
          display:flex; align-items:center; gap:6px;
          padding:7px 10px; border-radius:8px; border:1px solid rgba(255,255,255,0.07);
          background:rgba(255,255,255,0.04); cursor:pointer; transition:all 0.2s;
          font-size:11px; font-weight:600; color:#f1f5f9;
        }
        .qv-atom-btn:hover { background:rgba(255,255,255,0.1); }
        .qv-dot { width:12px; height:12px; border-radius:50%; }
        .qv-atom-sel-btn {
          padding:5px 8px; font-size:10px; border-radius:6px; border:none;
          cursor:pointer; transition:all 0.2s;
          background:rgba(255,255,255,0.05); color:rgba(255,255,255,0.5);
        }
        .qv-atom-sel-btn.selected { background:rgba(250,204,21,0.3); color:#fbbf24; border:1px solid #fbbf24; }
        .qv-atom-sel-btn:hover:not(.selected) { background:rgba(255,255,255,0.1); }
        .qv-sec-label { font-size:9px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:rgba(255,255,255,0.2); margin-bottom:8px; }
      </style>

      <div id="qv-box">
        <div id="qv-header">
          <div id="qv-title">${titles[tipo]}</div>
          <div id="qv-tabs">
            <button class="qv-tab ${tipo==='laboratorio'?'active':''}" onclick="QuimicaVisual._trocarAba('laboratorio')">⚗️ Reações</button>
            <button class="qv-tab ${tipo==='moleculas'?'active':''}" onclick="QuimicaVisual._trocarAba('moleculas')">🧬 Moléculas 3D</button>
            <button class="qv-tab ${tipo==='builder'?'active':''}" onclick="QuimicaVisual._trocarAba('builder')">🔬 Construtor</button>
          </div>
          <button id="qv-close" onclick="QuimicaVisual.fechar()">✕</button>
        </div>
        <div id="qv-body">${content}</div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if(e.target === modal) fechar(); });

    if (tipo === 'laboratorio') _initLab();
    else if (tipo === 'moleculas') _initMoleculas();
    else if (tipo === 'builder') _initBuilderThree();
  }

  function _trocarAba(tipo) {
    const body = document.getElementById('qv-body');
    if (!body) return;
    cancelAnimations();

    let content = '';
    if (tipo === 'laboratorio') content = _renderLaboratorio();
    else if (tipo === 'moleculas') content = _renderMoleculas();
    else if (tipo === 'builder') content = _renderBuilder();

    document.querySelectorAll('.qv-tab').forEach(t => {
      t.classList.toggle('active', t.textContent.toLowerCase().includes(
        tipo === 'laboratorio' ? 'reações' : tipo === 'moleculas' ? 'moléc' : 'constr'
      ));
    });

    const titles = {
      laboratorio: '⚗️ Laboratório Virtual de Reações',
      moleculas:   '🧬 Visualizador 3D de Moléculas',
      builder:     '🔬 Construtor Molecular 3D'
    };
    document.getElementById('qv-title').textContent = titles[tipo];
    body.innerHTML = content;

    if (tipo === 'laboratorio') _initLab();
    else if (tipo === 'moleculas') _initMoleculas();
    else if (tipo === 'builder') _initBuilderThree();
  }

  function cancelAnimations() {
    if (labState.animFrameId) cancelAnimationFrame(labState.animFrameId);
    if (threeState.animFrameId) cancelAnimationFrame(threeState.animFrameId);
    if (threeState.renderer) { threeState.renderer.dispose(); threeState.renderer = null; }
    labState.animFrameId = null;
    threeState.animFrameId = null;
  }

  function fechar() {
    cancelAnimations();
    document.getElementById(MODAL_ID)?.remove();
  }

 
  function _renderLaboratorio() {
    const grupos = [...new Set(SUBSTANCIAS.map(s => s.grupo))];
    return `
      <div style="display:flex; width:100%; height:100%; gap:0; overflow:hidden;">
        <!-- Prateleira -->
        <div style="width:240px; flex-shrink:0; padding:18px; overflow-y:auto; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; gap:16px;">
          <div>
            <div class="qv-sec-label">Substâncias disponíveis</div>
            <div id="qv-shelf" style="display:flex; flex-direction:column; gap:5px;"></div>
          </div>
          <div style="padding-top:14px; border-top:1px solid rgba(255,255,255,0.06);">
            <button onclick="QuimicaVisual._limparLab()" style="width:100%; padding:9px; border:1px solid rgba(239,68,68,0.3); border-radius:9px; background:rgba(239,68,68,0.08); color:#f87171; font-size:12px; font-weight:600; cursor:pointer; transition:all 0.2s;"
              onmouseover="this.style.background='rgba(239,68,68,0.18)'" onmouseout="this.style.background='rgba(239,68,68,0.08)'">
              🗑 Esvaziar béquer
            </button>
          </div>
          <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:12px;">
            <div class="qv-sec-label">Legenda</div>
            ${['gás','metal','ácido','base','sólido'].map(g => `
              <div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;">
                <div style="width:8px;height:8px;border-radius:2px;background:${g==='gás'?'#93c5fd':g==='metal'?'#c084fc':g==='ácido'?'#fde68a':g==='base'?'#a5f3fc':'#9ca3af'};"></div>
                <span style="font-size:10px;color:rgba(255,255,255,0.35);text-transform:capitalize;">${g}</span>
              </div>
            `).join('')}
          </div>
        </div>


        <div style="flex:1; display:flex; gap:0; overflow:hidden;">
       
          <div style="flex:1; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;">
            <div class="qv-container-area" style="width:100%; height:100%; position:relative;">
            
              <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px);background-size:32px 32px;pointer-events:none;"></div>

            
              <div id="qv-vessel-wrap" style="position:relative; margin-bottom:80px;">
                <canvas id="qv-particles-canvas" width="360" height="320" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);pointer-events:none;z-index:10;width:360px;height:320px;"></canvas>
                <svg id="qv-vessel-svg" viewBox="0 0 180 220" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stop-color="rgba(255,255,255,0.06)"/>
                      <stop offset="30%" stop-color="rgba(255,255,255,0.14)"/>
                      <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
                    </linearGradient>
                    <linearGradient id="liquidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="rgba(59,130,246,0.3)" id="lg-top"/>
                      <stop offset="100%" stop-color="rgba(59,130,246,0.7)" id="lg-bot"/>
                    </linearGradient>
                    <clipPath id="beakerClip">
                      <path d="M48 30 L30 195 Q30 205 40 205 L140 205 Q150 205 150 195 L132 30 Z"/>
                    </clipPath>
                  </defs>

                  <g clip-path="url(#beakerClip)">
                    <rect id="qv-liquid" x="30" y="170" width="120" height="35" fill="url(#liquidGrad)" style="transition:y 0.6s ease, height 0.6s ease, fill 0.5s ease;"/>
                    <!-- Superfície do líquido -->
                    <ellipse id="qv-liquid-surf" cx="90" cy="170" rx="60" ry="6" fill="rgba(59,130,246,0.4)" style="transition:cy 0.6s ease, fill 0.5s ease;"/>
                  </g>

                  <path d="M48 30 L30 195 Q30 205 40 205 L140 205 Q150 205 150 195 L132 30 Z" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>

                  <path d="M38 30 Q45 22 55 26 L60 30" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>

         
                  <ellipse cx="90" cy="30" rx="45" ry="8" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>

                
                  <path d="M53 35 L38 185" stroke="rgba(255,255,255,0.12)" stroke-width="2.5" stroke-linecap="round"/>

                
                  ${[1,2,3,4].map(i => `
                    <line x1="${38+i*1}" y1="${195 - i*35}" x2="${48+i*1}" y2="${195 - i*35}" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
                    <text x="${50+i*1}" y="${195 - i*35 + 3}" font-size="6" fill="rgba(255,255,255,0.2)" font-family="monospace">${i*25}mL</text>
                  `).join('')}
                </svg>
              </div>

              <div id="qv-reagentes-badges" style="position:absolute; top:16px; right:16px; display:flex; flex-direction:column; gap:5px; max-width:140px; z-index:5;"></div>

             
              <div id="qv-reaction-card" style="position:absolute; bottom:16px; left:16px; right:16px; display:none;"></div>

       
              <div id="qv-empty-hint" style="position:absolute; bottom:24px; left:0; right:0; text-align:center; color:rgba(255,255,255,0.18); font-size:12px; pointer-events:none;">
                ← Clique nas substâncias para adicioná-las
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function _initLab() {
    labState.reagentesNoConteiner = new Set();
    _renderShelf();
    _updateLab();
    _startParticleLoop();
  }

  function _renderShelf() {
    const shelf = document.getElementById('qv-shelf');
    if (!shelf) return;
    shelf.innerHTML = SUBSTANCIAS.map(s => `
      <div class="qv-shelf-item" id="si-${s.id.replace(/[^a-zA-Z0-9]/g,'_')}" onclick="QuimicaVisual._toggleSubstancia('${s.id}')">
        <div class="qv-shelf-dot" style="background:${s.cor};"></div>
        <div>
          <div class="qv-shelf-id">${s.id}</div>
          <div class="qv-shelf-nome">${s.nome}</div>
        </div>
      </div>
    `).join('');
  }

  function _toggleSubstancia(id) {
    if (labState.reagentesNoConteiner.has(id)) {
      labState.reagentesNoConteiner.delete(id);
    } else {
      labState.reagentesNoConteiner.add(id);
    }
    _updateLab();
  }

  function _limparLab() {
    labState.reagentesNoConteiner.clear();
    _updateLab();
  }

  function _updateLab() {
    const reagentes = Array.from(labState.reagentesNoConteiner);

    SUBSTANCIAS.forEach(s => {
      const el = document.getElementById('si-' + s.id.replace(/[^a-zA-Z0-9]/g,'_'));
      if (el) el.classList.toggle('in-container', labState.reagentesNoConteiner.has(s.id));
    });

    
    const badges = document.getElementById('qv-reagentes-badges');
    if (badges) {
      badges.innerHTML = reagentes.map(r => {
        const s = SUBSTANCIAS.find(x => x.id === r);
        return `<div style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:8px;background:rgba(15,17,23,0.85);border:1px solid rgba(255,255,255,0.1);font-size:12px;font-weight:700;color:#f1f5f9;backdrop-filter:blur(6px);">
          <div style="width:7px;height:7px;border-radius:50%;background:${s?.cor||'#888'};"></div>${r}
        </div>`;
      }).join('');
    }

    
    const hint = document.getElementById('qv-empty-hint');
    if (hint) hint.style.display = reagentes.length === 0 ? 'block' : 'none';

    const level = Math.min(reagentes.length / 5, 0.85);
    const liquidY = 205 - level * 170;
    const liquidH = level * 170;
    const liq = document.getElementById('qv-liquid');
    const surf = document.getElementById('qv-liquid-surf');

    
    const reacao = REACOES_DB.find(rec =>
      rec.reagentes.length === reagentes.length &&
      rec.reagentes.every(r => labState.reagentesNoConteiner.has(r))
    );

    let corLiquido = 'rgba(59,130,246,0.5)';
    if (reacao) corLiquido = reacao.corLiquido;

    if (liq) {
      liq.setAttribute('y', liquidY);
      liq.setAttribute('height', Math.max(0, liquidH));
      liq.setAttribute('fill', corLiquido);
    }
    if (surf) {
      surf.setAttribute('cy', liquidY);
      surf.setAttribute('fill', corLiquido.replace(/[\d.]+\)$/, '0.5)'));
    }


    const card = document.getElementById('qv-reaction-card');
    if (card) {
      if (reacao && reagentes.length > 0) {
        card.style.display = 'block';
        card.innerHTML = `
          <div class="qv-rc-inner">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
              <div style="flex:1;">
                <div class="qv-rc-tipo">✅ Reação detectada · ${reacao.tipo}</div>
                <div class="qv-rc-titulo">${reacao.titulo}</div>
                <div class="qv-rc-eq">${reacao.eq}</div>
                <div class="qv-rc-desc">${reacao.descricao}</div>
                <div class="qv-rc-meta">
                  <div class="qv-rc-badge">ΔH: ${reacao.deltaH}</div>
                  <div class="qv-rc-badge">Produto: ${reacao.produto}</div>
                </div>
              </div>
              <div style="font-size:36px; flex-shrink:0;">${reacao.emoji}</div>
            </div>
          </div>
        `;
        _dispararEfeito(reacao.efeito);
      } else if (reagentes.length > 0) {
        card.style.display = 'block';
        card.innerHTML = `
          <div class="qv-rc-inner">
            <div class="qv-rc-tipo">🔎 Analisando mistura...</div>
            <div style="font-size:13px;color:rgba(255,255,255,0.4);">Mistura atual: <span style="color:#a5b4fc;font-family:'DM Mono',monospace;">${reagentes.join(' + ')}</span></div>
            <div style="font-size:11px;color:rgba(255,255,255,0.25);margin-top:4px;">Nenhuma reação conhecida detectada. Tente outra combinação.</div>
          </div>
        `;
      } else {
        card.style.display = 'none';
      }
    }
  }

  function _dispararEfeito(tipo) {
    const canvas = document.getElementById('qv-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2 + 40;

    const particles = [];
    const count = tipo === 'explosao' ? 60 : tipo === 'chamas' ? 40 : 30;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = tipo === 'explosao' ? (Math.random() * 5 + 2) : (Math.random() * 2 + 0.5);
      const colors = {
        bolhas: ['rgba(147,197,253,', 'rgba(165,243,252,', 'rgba(255,255,255,'],
        chamas: ['rgba(255,100,0,', 'rgba(255,200,0,', 'rgba(255,50,0,'],
        explosao: ['rgba(255,200,50,', 'rgba(255,100,30,', 'rgba(255,255,200,'],
        fumaca: ['rgba(180,180,180,', 'rgba(150,150,150,', 'rgba(200,200,200,'],
      };
      const colorArr = colors[tipo] || colors.bolhas;
      const color = colorArr[Math.floor(Math.random() * colorArr.length)];
      const size = tipo === 'bolhas' ? Math.random() * 10 + 4 : Math.random() * 8 + 2;
      particles.push({
        x: cx + (Math.random()-0.5)*60, y: cy,
        vx: Math.cos(angle) * speed * (tipo==='bolhas'?0.3:1),
        vy: -Math.abs(Math.sin(angle)) * speed - (tipo==='bolhas'?1.5:0),
        life: 1, decay: Math.random() * 0.02 + 0.015,
        color, size, tipo
      });
    }

    let running = true;
    setTimeout(() => running = false, 2000);

    function draw() {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      particles.forEach(p => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08; 
        p.life -= p.decay;
        if (p.tipo === 'bolhas') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
          ctx.strokeStyle = p.color + p.life * 0.8 + ')';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI*2);
          ctx.fillStyle = p.color + p.life + ')';
          ctx.fill();
        }
      });
      if (alive && running) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, W, H);
    }
    draw();
  }

  function _startParticleLoop() {}


  function _renderMoleculas() {
    const keys = Object.keys(MOLECULAS_3D);
    return `
      <div style="display:flex; width:100%; height:100%; overflow:hidden;">
        <!-- Lista lateral -->
        <div style="width:210px; flex-shrink:0; padding:16px; overflow-y:auto; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; gap:12px;">
          <div>
            <div class="qv-sec-label">Biblioteca</div>
            <div id="qv-mol-list" style="display:flex;flex-direction:column;gap:4px;">
              ${keys.map(k => `
                <div class="qv-mol-item" id="mol-item-${k.replace(/[^a-zA-Z0-9]/g,'_')}" onclick="QuimicaVisual._carregarMolecula('${k}')">
                  <div class="qv-mol-formula">${k}</div>
                  <div class="qv-mol-nome">${MOLECULAS_3D[k].nome}</div>
                </div>
              `).join('')}
            </div>
          </div>
          <div id="qv-mol-info" style="display:none; background:rgba(255,255,255,0.03); border-radius:10px; padding:12px;">
            <div class="qv-sec-label">Propriedades</div>
            <div id="qv-mol-props"></div>
          </div>
        </div>

  
        <div style="flex:1; position:relative; background:#060810;">
          <div id="qv-mol-canvas" style="width:100%; height:100%; position:relative;">
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.15);font-size:14px;flex-direction:column;gap:8px;">
              <div style="font-size:40px;">🧬</div>
              <div>Selecione uma molécula para visualizar</div>
            </div>
          </div>
          <div class="qv-3d-hint">🖱 Arraste para rotacionar</div>
          <div id="qv-mol-title-overlay" style="position:absolute;top:16px;left:50%;transform:translateX(-50%);display:none;background:rgba(8,12,24,0.85);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 18px;text-align:center;backdrop-filter:blur(6px);">
            <div id="qv-mol-ov-formula" style="font-family:'DM Mono',monospace;font-size:18px;font-weight:700;color:#f1f5f9;"></div>
            <div id="qv-mol-ov-nome" style="font-size:11px;color:rgba(255,255,255,0.4);margin-top:2px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  function _initMoleculas() {
    moleculaAtiva = null;
   
    setTimeout(() => _carregarMolecula('H₂O'), 100);
  }

  function _carregarMolecula(key) {
    moleculaAtiva = key;
    const mol = MOLECULAS_3D[key];
    if (!mol) return;


    document.querySelectorAll('.qv-mol-item').forEach(el => el.classList.remove('active'));
    const activeEl = document.getElementById('mol-item-' + key.replace(/[^a-zA-Z0-9]/g,'_'));
    if (activeEl) activeEl.classList.add('active');


    const infoBox = document.getElementById('qv-mol-info');
    const props = document.getElementById('qv-mol-props');
    if (infoBox && props) {
      infoBox.style.display = 'block';
      props.innerHTML = `
        <div class="qv-info-row"><span class="qv-info-label">Geometria</span><span class="qv-info-val">${mol.geometria}</span></div>
        <div class="qv-info-row"><span class="qv-info-label">Polaridade</span><span class="qv-info-val">${mol.polaridade}</span></div>
        <div class="qv-info-row"><span class="qv-info-label">Átomos</span><span class="qv-info-val">${mol.atomos.length}</span></div>
        <div class="qv-info-row"><span class="qv-info-label">Ligações</span><span class="qv-info-val">${mol.conexoes.length}</span></div>
        <div style="margin-top:8px;font-size:10px;color:rgba(255,255,255,0.3);line-height:1.5;">${mol.descricao}</div>
      `;
    }

    const ov = document.getElementById('qv-mol-title-overlay');
    const ovF = document.getElementById('qv-mol-ov-formula');
    const ovN = document.getElementById('qv-mol-ov-nome');
    if (ov) { ov.style.display = 'block'; ovF.textContent = mol.formula; ovN.textContent = mol.nome; }

   
    const container = document.getElementById('qv-mol-canvas');
    if (!container || typeof THREE === 'undefined') return;

    cancelAnimations();
    container.innerHTML = '';

    threeState.scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    threeState.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 1000);
    threeState.camera.position.z = _calcCameraZ(mol);

    threeState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeState.renderer.setSize(container.clientWidth, container.clientHeight);
    threeState.renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(threeState.renderer.domElement);

    threeState.scene.add(new THREE.AmbientLight(0x8888aa, 0.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 8);
    threeState.scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0x4466ff, 0.4);
    fill.position.set(-8, -4, -4);
    threeState.scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffeedd, 0.6);
    rim.position.set(0, -10, -5);
    threeState.scene.add(rim);

    threeState.group = new THREE.Group();
    _buildMoleculeGroup(mol, threeState.group);
    threeState.scene.add(threeState.group);

   
    _setupMolDrag(threeState.renderer.domElement);

    const animate = () => {
      threeState.animFrameId = requestAnimationFrame(animate);
      if (!threeState.isDragging && threeState.group) {
        threeState.group.rotation.y += 0.005;
      }
      threeState.renderer?.render(threeState.scene, threeState.camera);
    };
    animate();
  }

  function _calcCameraZ(mol) {
    let maxDist = 0;
    mol.atomos.forEach(a => {
      const d = Math.sqrt(a.pos[0]**2 + a.pos[1]**2 + a.pos[2]**2);
      if (d > maxDist) maxDist = d;
    });
    return Math.max(5, maxDist * 3.5);
  }

  function _buildMoleculeGroup(mol, group) {

    mol.atomos.forEach((atom, i) => {
      const color = ATOM_COLORS[atom.t] || 0xcccccc;
      const geo = new THREE.SphereGeometry(atom.r, 64, 64);
      const mat = new THREE.MeshStandardMaterial({
        color,
        metalness: 0.1,
        roughness: 0.25,
        envMapIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...atom.pos);
      group.add(mesh);

    
      const glowGeo = new THREE.SphereGeometry(atom.r * 1.12, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.08, side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(...atom.pos);
      group.add(glow);
    });

    
    mol.conexoes.forEach(conn => {
      const p1 = new THREE.Vector3(...mol.atomos[conn[0]].pos);
      const p2 = new THREE.Vector3(...mol.atomos[conn[1]].pos);
      const dist = p1.distanceTo(p2);
      const geo = new THREE.CylinderGeometry(0.08, 0.08, dist, 24);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xbbbbcc, metalness: 0.3, roughness: 0.4
      });
      const mesh = new THREE.Mesh(geo, mat);
      const mid = p1.clone().lerp(p2, 0.5);
      mesh.position.copy(mid);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0,1,0),
        p2.clone().sub(p1).normalize()
      );
      group.add(mesh);
    });
  }

  function _setupMolDrag(canvas) {
    threeState.isDragging = false;
    threeState.lastMouse = null;

    canvas.addEventListener('mousedown', e => {
      threeState.isDragging = true;
      threeState.lastMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mousemove', e => {
      if (!threeState.isDragging || !threeState.lastMouse) return;
      const dx = e.clientX - threeState.lastMouse.x;
      const dy = e.clientY - threeState.lastMouse.y;
      if (threeState.group) {
        threeState.group.rotation.y += dx * 0.01;
        threeState.group.rotation.x += dy * 0.01;
      }
      threeState.lastMouse = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('mouseup', () => { threeState.isDragging = false; });


    canvas.addEventListener('touchstart', e => {
      threeState.isDragging = true;
      threeState.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchmove', e => {
      if (!threeState.isDragging) return;
      const dx = e.touches[0].clientX - threeState.lastMouse.x;
      const dy = e.touches[0].clientY - threeState.lastMouse.y;
      if (threeState.group) {
        threeState.group.rotation.y += dx * 0.01;
        threeState.group.rotation.x += dy * 0.01;
      }
      threeState.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    canvas.addEventListener('touchend', () => { threeState.isDragging = false; });
  }

 
  function _renderBuilder() {
    return `
      <div style="display:flex; width:100%; height:100%; overflow:hidden;">
        <!-- Painel de controle -->
        <div style="width:220px; flex-shrink:0; padding:16px; overflow-y:auto; border-right:1px solid rgba(255,255,255,0.06); display:flex; flex-direction:column; gap:16px;">
          <div>
            <div class="qv-sec-label">Adicionar Átomo</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:5px;">
              ${Object.entries(ATOM_COLORS).map(([sym, col]) => `
                <button class="qv-atom-btn" onclick="QuimicaVisual._addAtomBuilder('${sym}')">
                  <div class="qv-dot" style="background:#${col.toString(16).padStart(6,'0')};"></div>
                  <div>
                    <div style="font-size:12px;font-weight:700;">${sym}</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.3);">${ATOM_LABELS[sym]||''}</div>
                  </div>
                </button>
              `).join('')}
            </div>
          </div>

          <div>
            <div class="qv-sec-label">Criar Ligação</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.3);margin-bottom:6px;">Selecione 2 átomos</div>
            <div id="qv-builder-atoms" style="display:flex;flex-direction:column;gap:4px;max-height:180px;overflow-y:auto;"></div>
          </div>

          <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;display:flex;flex-direction:column;gap:6px;">
            <button onclick="QuimicaVisual._limparBuilder()" style="width:100%; padding:8px; border:1px solid rgba(239,68,68,0.3); border-radius:8px; background:rgba(239,68,68,0.08); color:#f87171; font-size:11px; font-weight:600; cursor:pointer;"
              onmouseover="this.style.background='rgba(239,68,68,0.18)'" onmouseout="this.style.background='rgba(239,68,68,0.08)'">
              🗑 Limpar tudo
            </button>
          </div>

          <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:10px;">
            <div class="qv-sec-label">Legenda de Cores (CPK)</div>
            ${Object.entries(ATOM_COLORS).map(([sym, col]) => `
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
                <div style="width:8px;height:8px;border-radius:50%;background:#${col.toString(16).padStart(6,'0')};"></div>
                <span style="font-size:10px;color:rgba(255,255,255,0.35);">${sym} — ${ATOM_LABELS[sym]||''}</span>
              </div>
            `).join('')}
          </div>
        </div>

 
        <div style="flex:1; position:relative; background:#060810;">
          <div id="qv-builder-canvas" style="width:100%; height:100%;"></div>
          <div class="qv-3d-hint">🖱 Arraste para rotacionar</div>
          <div style="position:absolute;top:16px;left:16px;background:rgba(8,12,24,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px 14px;font-size:11px;color:rgba(255,255,255,0.4);">
            Construtor Livre — <span id="qv-builder-count" style="color:#a5b4fc;">0 átomos, 0 ligações</span>
          </div>
        </div>
      </div>
    `;
  }

  function _initBuilderThree() {
    builderState = { atomos: [], conexoes: [], selectedIdx: null };
    const container = document.getElementById('qv-builder-canvas');
    if (!container || typeof THREE === 'undefined') return;

    threeState.scene = new THREE.Scene();
    threeState.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    threeState.camera.position.z = 8;

    threeState.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    threeState.renderer.setSize(container.clientWidth, container.clientHeight);
    threeState.renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(threeState.renderer.domElement);

    threeState.scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const kl = new THREE.DirectionalLight(0xffffff, 1.1);
    kl.position.set(8, 12, 8);
    threeState.scene.add(kl);
    const fl = new THREE.DirectionalLight(0x4466aa, 0.4);
    fl.position.set(-8, -4, -4);
    threeState.scene.add(fl);

    _setupMolDrag(threeState.renderer.domElement);
    _rebuildBuilderVisuals();

    const animate = () => {
      threeState.animFrameId = requestAnimationFrame(animate);
      if (!threeState.isDragging && threeState.group) threeState.group.rotation.y += 0.004;
      threeState.renderer?.render(threeState.scene, threeState.camera);
    };
    animate();
  }

  function _addAtomBuilder(type) {
    const spread = Math.max(2, builderState.atomos.length * 0.5);
    const pos = [
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread
    ];
    builderState.atomos.push({ t: type, pos, r: type === 'H' ? 0.3 : 0.45 });
    _rebuildBuilderVisuals();
  }

  let _builderBondSel = null;
  function _selectBuilderAtom(idx) {
    if (_builderBondSel === null) {
      _builderBondSel = idx;
    } else {
      if (_builderBondSel !== idx) {
        const already = builderState.conexoes.some(c => (c[0]===_builderBondSel&&c[1]===idx)||(c[0]===idx&&c[1]===_builderBondSel));
        if (!already) builderState.conexoes.push([_builderBondSel, idx]);
      }
      _builderBondSel = null;
    }
    builderState.selectedIdx = _builderBondSel;
    _rebuildBuilderVisuals();
  }

  function _limparBuilder() {
    builderState = { atomos: [], conexoes: [], selectedIdx: null };
    _builderBondSel = null;
    _rebuildBuilderVisuals();
  }

  function _rebuildBuilderVisuals() {
    const list = document.getElementById('qv-builder-atoms');
    if (list) {
      list.innerHTML = builderState.atomos.map((a, i) => `
        <button class="qv-atom-sel-btn ${i === _builderBondSel ? 'selected' : ''}" onclick="QuimicaVisual._selectBuilderAtom(${i})">
          <span style="color:#${(ATOM_COLORS[a.t]||0xcccccc).toString(16).padStart(6,'0')}">●</span>
          #${i+1} ${a.t}${i === _builderBondSel ? ' ← selecionado' : ''}
        </button>
      `).join('') || '<div style="font-size:10px;color:rgba(255,255,255,0.2);">Nenhum átomo adicionado</div>';
    }

    const counter = document.getElementById('qv-builder-count');
    if (counter) counter.textContent = `${builderState.atomos.length} átomos, ${builderState.conexoes.length} ligações`;

    if (!threeState.scene) return;
    if (threeState.group) threeState.scene.remove(threeState.group);
    threeState.group = new THREE.Group();

    builderState.atomos.forEach((atom, i) => {
      const color = ATOM_COLORS[atom.t] || 0xcccccc;
      const geo = new THREE.SphereGeometry(atom.r, 48, 48);
      const mat = new THREE.MeshStandardMaterial({
        color, metalness: 0.15, roughness: 0.25,
        emissive: i === _builderBondSel ? 0xffee00 : 0x000000,
        emissiveIntensity: i === _builderBondSel ? 0.4 : 0
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(...atom.pos);
      threeState.group.add(mesh);
    });

    builderState.conexoes.forEach(conn => {
      const p1 = new THREE.Vector3(...builderState.atomos[conn[0]].pos);
      const p2 = new THREE.Vector3(...builderState.atomos[conn[1]].pos);
      const dist = p1.distanceTo(p2);
      const geo = new THREE.CylinderGeometry(0.07, 0.07, dist, 20);
      const mat = new THREE.MeshStandardMaterial({ color: 0xaaaacc, metalness: 0.3, roughness: 0.4 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(p1.clone().lerp(p2, 0.5));
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), p2.clone().sub(p1).normalize());
      threeState.group.add(mesh);
    });

    threeState.scene.add(threeState.group);
  }

  (function injetarNoMundo() {
    function add() {
      const menus = document.querySelectorAll('.mt-dropdown-content:not(.qv-processed)');
      if (!menus.length) return;
      menus.forEach(menu => {
        menu.classList.add('qv-processed');
        const closeMenu = () => menu.classList.remove('show');
        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--border,#3a3228);margin:4px 10px;opacity:0.3;';
        const b1 = document.createElement('button');
        b1.innerHTML = '⚗️ Lab de Reações';
        b1.onclick = e => { e.stopPropagation(); closeMenu(); QuimicaVisual.abrir('laboratorio'); };
        const b2 = document.createElement('button');
        b2.innerHTML = '🧬 Moléculas 3D';
        b2.onclick = e => { e.stopPropagation(); closeMenu(); QuimicaVisual.abrir('moleculas'); };
        const b3 = document.createElement('button');
        b3.innerHTML = '🔬 Construtor 3D';
        b3.onclick = e => { e.stopPropagation(); closeMenu(); QuimicaVisual.abrir('builder'); };
        const dashBtn = Array.from(menu.querySelectorAll('button')).find(b => b.innerText.includes('Dashboard'));
        const ref = dashBtn || null;
        [sep, b1, b2, b3].forEach(el => ref ? menu.insertBefore(el, ref) : menu.appendChild(el));
      });
    }
    const observer = new MutationObserver(add);
    observer.observe(document.body, { childList: true, subtree: true });
    add();
  })();

  return {
    abrir, fechar,
    _trocarAba,
    _toggleSubstancia,
    _limparLab,
    _carregarMolecula,
    _addAtomBuilder,
    _selectBuilderAtom,
    _limparBuilder,
  };
})();

window.QuimicaVisual = QuimicaVisual;


if (window._qvQueue && window._qvQueue.length) {
  window._qvQueue.forEach(t => QuimicaVisual.abrir(t));
  window._qvQueue = [];
}
window.abrirQuimica = function(t) { QuimicaVisual.abrir(t); };