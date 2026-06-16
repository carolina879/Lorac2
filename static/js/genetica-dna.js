const GeneticaDNA = (() => {
  const MODAL_ID = 'modal-genetica-dna';

  
  
  
  const BASES = {
    A: { nome: 'Adenina',   par: 'T', rna: 'U', cor: '#ef4444', corClaro: 'rgba(239,68,68,0.2)' },
    T: { nome: 'Timina',    par: 'A', rna: 'A', cor: '#3b82f6', corClaro: 'rgba(59,130,246,0.2)' },
    G: { nome: 'Guanina',   par: 'C', rna: 'C', cor: '#22c55e', corClaro: 'rgba(34,197,94,0.2)'  },
    C: { nome: 'Citosina',  par: 'G', rna: 'G', cor: '#f59e0b', corClaro: 'rgba(245,158,11,0.2)' },
    U: { nome: 'Uracila',   par: 'A', rna: 'A', cor: '#a855f7', corClaro: 'rgba(168,85,247,0.2)' },
  };

  
  
  
  const CODONS = {
    UUU:'Phe', UUC:'Phe', UUA:'Leu', UUG:'Leu',
    CUU:'Leu', CUC:'Leu', CUA:'Leu', CUG:'Leu',
    AUU:'Ile', AUC:'Ile', AUA:'Ile', AUG:'Met(Início)',
    GUU:'Val', GUC:'Val', GUA:'Val', GUG:'Val',
    UCU:'Ser', UCC:'Ser', UCA:'Ser', UCG:'Ser',
    CCU:'Pro', CCC:'Pro', CCA:'Pro', CCG:'Pro',
    ACU:'Thr', ACC:'Thr', ACA:'Thr', ACG:'Thr',
    GCU:'Ala', GCC:'Ala', GCA:'Ala', GCG:'Ala',
    UAU:'Tyr', UAC:'Tyr', UAA:'STOP', UAG:'STOP',
    CAU:'His', CAC:'His', CAA:'Gln', CAG:'Gln',
    AAU:'Asn', AAC:'Asn', AAA:'Lys', AAG:'Lys',
    GAU:'Asp', GAC:'Asp', GAA:'Glu', GAG:'Glu',
    UGU:'Cys', UGC:'Cys', UGA:'STOP', UGG:'Trp',
    CGU:'Arg', CGC:'Arg', CGA:'Arg', CGG:'Arg',
    AGU:'Ser', AGC:'Ser', AGA:'Arg', AGG:'Arg',
    GGU:'Gly', GGC:'Gly', GGA:'Gly', GGG:'Gly',
  };

  const AA_CORES = {
    'Phe':'#ec4899','Leu':'#f97316','Ile':'#eab308','Met(Início)':'#22c55e',
    'Val':'#06b6d4','Ser':'#3b82f6','Pro':'#8b5cf6','Thr':'#f43f5e',
    'Ala':'#84cc16','Tyr':'#0ea5e9','His':'#a78bfa','Gln':'#fb923c',
    'Asn':'#34d399','Lys':'#60a5fa','Asp':'#f87171','Glu':'#fbbf24',
    'Cys':'#4ade80','Trp':'#c084fc','Arg':'#f472b6','Gly':'#94a3b8',
    'STOP':'#ef4444',
  };

  
  
  
  const GENES_EXEMPLO = [
    { nome: 'Anemia Falciforme', seq: 'ATGGTGCACCTGACTCCTGAGGAGAAGTCT', desc: 'Mutação no gene HBB (Hemoglobina Beta). Uma única substituição (A→T) no códon 6 causa polimerização da hemoglobina.', tipo: 'substituicao', pos: 17 },
    { nome: 'Fenilcetonúria (PKU)', seq: 'ATGAAACCCAGCACCGGCTCC', desc: 'Mutação no gene PAH (Fenilalanina Hidroxilase). Acúmulo de fenilalanina causa danos cerebrais.', tipo: 'substituicao', pos: 6 },
    { nome: 'Fibrose Cística', seq: 'ATCGATCTTCTCAGAGGAGGTCATCA', desc: 'Deleção de 3 nucleotídeos no gene CFTR. Ausência do aminoácido Phe508 causa mal funcionamento do canal de cloro.', tipo: 'delecao', pos: 12 },
    { nome: 'Síndrome de Huntington', seq: 'CAGCAGCAGCAGCAGCAGCAGCAGCAGCAG', desc: 'Expansão de repetição CAG no gene HTT. Repetições >36 causam a doença. Herança autossômica dominante.', tipo: 'insercao', pos: 18 },
  ];

  
  
  
  const TRACOS = [
    { nome: 'Cor dos olhos', desc: 'Olhos castanhos (B) é dominante sobre olhos azuis (b)', dom: 'B', rec: 'b', domLabel: 'Castanho', recLabel: 'Azul', icon: '👁️' },
    { nome: 'Tipo sanguíneo ABO', desc: 'A e B são codominantes; O é recessivo', dom: 'I', rec: 'i', domLabel: 'A/B', recLabel: 'O', icon: '🩸' },
    { nome: 'Lóbulo da orelha', desc: 'Lóbulo solto (L) é dominante sobre lóbulo preso (l)', dom: 'L', rec: 'l', domLabel: 'Solto', recLabel: 'Preso', icon: '👂' },
    { nome: 'Cor do cabelo', desc: 'Cabelo escuro (D) é dominante sobre cabelo claro (d)', dom: 'D', rec: 'd', domLabel: 'Escuro', recLabel: 'Claro', icon: '💇' },
    { nome: 'Polidactilia', desc: 'Polidactilia (P) dominante — dedos extras', dom: 'P', rec: 'p', domLabel: 'Polidactilia', recLabel: 'Normal', icon: '🖐️' },
    { nome: 'Daltonismo', desc: 'Ligado ao X. X^D = visão normal, X^d = daltônico', dom: 'D', rec: 'd', domLabel: 'Normal', recLabel: 'Daltônico', icon: '🎨', ligadoX: true },
  ];

  
  
  
  const QUIZ = [
    { q: 'Qual é o par complementar da base Adenina no DNA?', ops: ['Timina', 'Guanina', 'Citosina', 'Uracila'], resp: 0, exp: 'No DNA: A-T e G-C. No RNA: A emparelha com U (Uracila).' },
    { q: 'Quantos nucleotídeos formam um códon?', ops: ['2', '3', '4', '5'], resp: 1, exp: 'Um códon é formado por 3 nucleotídeos e codifica um aminoácido específico.' },
    { q: 'Qual molécula é produzida durante a Transcrição?', ops: ['Proteína', 'DNA filho', 'mRNA', 'Ribossomo'], resp: 2, exp: 'A Transcrição converte DNA → mRNA (RNA mensageiro), que levará a informação ao ribossomo.' },
    { q: 'O processo de síntese proteica nos ribossomos é chamado de:', ops: ['Replicação', 'Transcrição', 'Tradução', 'Mutação'], resp: 2, exp: 'Tradução: mRNA → Proteína (cadeia de aminoácidos). Ocorre nos ribossomos.' },
    { q: 'Um indivíduo com genótipo Bb para um traço autossômico dominante é chamado de:', ops: ['Homozigoto dominante', 'Homozigoto recessivo', 'Heterozigoto', 'Hemizigoto'], resp: 2, exp: 'Heterozigoto possui dois alelos diferentes para o mesmo gene (Bb). Homozigotos têm BB ou bb.' },
    { q: 'Na Anemia Falciforme, qual tipo de mutação ocorre?', ops: ['Deleção', 'Inserção', 'Substituição de base', 'Duplicação'], resp: 2, exp: 'Uma única substituição de base (GAG→GTG) no gene da hemoglobina causa a doença falciforme.' },
    { q: 'Qual célula NÃO tem núcleo e portanto não tem DNA nuclear?', ops: ['Neurônio', 'Hemácia (glóbulo vermelho)', 'Célula muscular', 'Hepatócito'], resp: 1, exp: 'As hemácias maduras perdem o núcleo durante a maturação para maximizar o espaço para hemoglobina.' },
    { q: 'A proporção fenotípica clássica de um cruzamento Aa × Aa é:', ops: ['1:1', '3:1', '1:2:1', '2:1'], resp: 1, exp: 'Aa × Aa gera: 1 AA : 2 Aa : 1 aa (proporção genotípica). Fenotipicamente: 3 dominantes : 1 recessivo.' },
  ];

  
  
  
  let state = {
    abaAtiva: 'helice',
    dnaSeq: 'ATGCGATCGTAGCTAGCTAGCTAGCTAGCT',
    heliceAnim: null,
    heliceCanvas: null,
    quizIdx: 0,
    quizAcertos: 0,
    quizRespondida: false,
    punnettTraco: 0,
    punnettPai: 'Aa',
    punnettMae: 'Aa',
    mutacaoOriginal: '',
    mutacaoAtual: '',
    mutacaoTipo: 'substituicao',
    mutacaoPosicao: 5,
    transcricaoStep: 0,
    transcricaoAnim: null,
  };

  
  
  
  function abrir(aba = 'helice') {
    document.getElementById(MODAL_ID)?.remove();
    _injectStyles();
    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText = `
      position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;
      display:flex;align-items:center;justify-content:center;
      backdrop-filter:blur(6px);animation:gdFadeIn 0.25s ease;
    `;
    modal.innerHTML = _renderShell();
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) fechar(); });
    setAba(aba);
  }

  function fechar() {
    _stopAll();
    document.getElementById(MODAL_ID)?.remove();
  }

  function _stopAll() {
    if (state.heliceAnim) { cancelAnimationFrame(state.heliceAnim); state.heliceAnim = null; }
    if (state.transcricaoAnim) { clearInterval(state.transcricaoAnim); state.transcricaoAnim = null; }
  }

  
  
  
  function _renderShell() {
    return `
    <div style="width:min(1100px,97vw);height:min(720px,96vh);background:#080e1c;border:1px solid rgba(255,255,255,0.08);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 32px 80px rgba(0,0,0,0.7);">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.07);background:#0b1220;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-size:1.5rem;">🧬</span>
          <span style="font-family:'DM Serif Display',serif;font-size:1.2rem;color:#e2e8f0;letter-spacing:-0.3px;">Genética &amp; DNA Visual</span>
          <span style="font-family:'DM Mono',monospace;font-size:0.65rem;background:rgba(34,197,94,0.15);color:#22c55e;border:1px solid rgba(34,197,94,0.3);padding:2px 8px;border-radius:20px;">BIOLOGIA MOLECULAR</span>
        </div>
        <button onclick="GeneticaDNA.fechar()" style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#94a3b8;font-size:1.1rem;width:32px;height:32px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;" onmouseover="this.style.background='rgba(239,68,68,0.2)';this.style.color='#ef4444'" onmouseout="this.style.background='rgba(255,255,255,0.05)';this.style.color='#94a3b8'">✕</button>
      </div>
      <!-- Tabs -->
      <div style="display:flex;gap:2px;padding:10px 16px 0;background:#0b1220;flex-shrink:0;overflow-x:auto;">
        ${[
          ['helice','🔬','Dupla Hélice'],
          ['transcricao','🔄','Transcrição'],
          ['punnett','🧮','Punnett'],
          ['mutacoes','⚠️','Mutações'],
          ['doencas','🏥','Doenças'],
          ['quiz','🎯','Quiz'],
        ].map(([id, ic, lb]) => `
          <button id="gd-tab-${id}" onclick="GeneticaDNA.setAba('${id}')"
            style="display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:8px 8px 0 0;border:none;background:transparent;color:#64748b;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:500;cursor:pointer;transition:all 0.2s;white-space:nowrap;border-bottom:2px solid transparent;"
            onmouseover="if(!this.classList.contains('gd-tab-active'))this.style.color='#e2e8f0'"
            onmouseout="if(!this.classList.contains('gd-tab-active'))this.style.color='#64748b'">
            <span>${ic}</span><span>${lb}</span>
          </button>
        `).join('')}
      </div>

      <div id="gd-body" style="flex:1;overflow:hidden;"></div>
    </div>`;
  }

  
  
  
  function setAba(aba) {
    _stopAll();
    state.abaAtiva = aba;
    document.querySelectorAll(`#${MODAL_ID} button[id^='gd-tab-']`).forEach(b => {
      const isActive = b.id === `gd-tab-${aba}`;
      b.style.background = isActive ? 'rgba(34,197,94,0.12)' : 'transparent';
      b.style.color = isActive ? '#22c55e' : '#64748b';
      b.style.borderBottomColor = isActive ? '#22c55e' : 'transparent';
      if (isActive) b.classList.add('gd-tab-active');
      else b.classList.remove('gd-tab-active');
    });
    const body = document.getElementById('gd-body');
    if (!body) return;
    if (aba === 'helice')      { body.innerHTML = _renderHelice();      _initHelice(); }
    else if (aba === 'transcricao') { body.innerHTML = _renderTranscricao(); _initTranscricao(); }
    else if (aba === 'punnett')    { body.innerHTML = _renderPunnett();    _initPunnett(); }
    else if (aba === 'mutacoes')   { body.innerHTML = _renderMutacoes();   _initMutacoes(); }
    else if (aba === 'doencas')    { body.innerHTML = _renderDoencas(); }
    else if (aba === 'quiz')       { body.innerHTML = _renderQuiz();       _initQuiz(); }
  }

  
  
  
  function _renderHelice() {
    return `
    <div style="display:flex;height:100%;overflow:hidden;">
      <!-- Canvas -->
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;padding:16px;">
        <canvas id="gd-helice-canvas" style="border-radius:12px;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.06);"></canvas>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;justify-content:center;">
          <button onclick="GeneticaDNA.heliceSetSpeed(0.5)" style="${_btnStyle('#1e293b')}🐢 Lento</button>
          <button onclick="GeneticaDNA.heliceSetSpeed(1)" style="${_btnStyle('#1e293b')}▶ Normal</button>
          <button onclick="GeneticaDNA.heliceSetSpeed(2)" style="${_btnStyle('#1e293b')}⚡ Rápido</button>
          <button onclick="GeneticaDNA.heliceTogglePausa()" id="gd-pause-btn" style="${_btnStyle('#0f172a')}⏸ Pausar</button>
        </div>
      </div>

      <div style="width:260px;background:#0b1220;border-left:1px solid rgba(255,255,255,0.07);padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;">
        <div>
          <div style="font-family:'DM Serif Display',serif;font-size:1rem;color:#e2e8f0;margin-bottom:8px;">Estrutura do DNA</div>
          <div style="font-size:0.78rem;color:#64748b;line-height:1.6;">A dupla hélice de DNA foi descrita por Watson &amp; Crick em 1953. As duas fitas se complementam através de ligações de hidrogênio entre as bases nitrogenadas.</div>
        </div>
        <div>
          <div style="font-size:0.7rem;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin-bottom:8px;">Pares de Bases</div>
          ${['A-T','G-C'].map(par => {
            const [b1, b2] = par.split('-');
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;background:rgba(255,255,255,0.03);border-radius:8px;padding:8px;">
              <span style="background:${BASES[b1].cor};color:#000;font-family:'DM Mono',monospace;font-weight:700;font-size:0.8rem;width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;">${b1}</span>
              <span style="color:#475569;font-size:1rem;">—</span>
              <span style="background:${BASES[b2].cor};color:#000;font-family:'DM Mono',monospace;font-weight:700;font-size:0.8rem;width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center;">${b2}</span>
              <span style="font-size:0.75rem;color:#94a3b8;">${par === 'A-T' ? '2 ligações H' : '3 ligações H'}</span>
            </div>`;
          }).join('')}
        </div>
        <div>
          <div style="font-size:0.7rem;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin-bottom:8px;">Legenda de Cores</div>
          ${Object.entries(BASES).filter(([k])=>k!=='U').map(([b,d]) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
              <div style="width:14px;height:14px;border-radius:3px;background:${d.cor};flex-shrink:0;"></div>
              <span style="font-family:'DM Mono',monospace;font-size:0.75rem;color:#e2e8f0;">${b}</span>
              <span style="font-size:0.72rem;color:#64748b;">${d.nome}</span>
            </div>`).join('')}
        </div>
        <div style="background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.15);border-radius:10px;padding:10px;">
          <div style="font-size:0.7rem;color:#22c55e;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">💡 Curiosidade</div>
          <div style="font-size:0.75rem;color:#94a3b8;line-height:1.5;">O DNA humano tem ~3,2 bilhões de pares de bases. Se esticado, mediria cerca de 2 metros por célula — mas está compactado em apenas 6 micrômetros.</div>
        </div>
      </div>
    </div>`;
  }

  let _heliceSpeed = 1;
  let _helicePaused = false;

  function _initHelice() {
    const canvas = document.getElementById('gd-helice-canvas');
    if (!canvas) return;
    const wrap = canvas.parentElement;
    const W = wrap.clientWidth - 32;
    const H = Math.min(wrap.clientHeight - 80, 500);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const seq = 'ATGCGATCGTAGCTAGCGCTAGCTAGATCG';
    let t = 0;
    const BASES_LIST = seq.split('');
    const N = BASES_LIST.length;
    const cx = W / 2;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const stride = H / (N - 1);
      const amp = Math.min(W * 0.3, 100);

      
      for (let s = 0; s < 2; s++) {
        ctx.beginPath();
        for (let i = 0; i < N; i++) {
          const y = i * stride;
          const phase = s === 0 ? t : t + Math.PI;
          const x = cx + Math.sin(i * 0.4 + phase) * amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = s === 0 ? 'rgba(99,102,241,0.5)' : 'rgba(236,72,153,0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      
      for (let i = 0; i < N; i++) {
        const y = i * stride;
        const b1 = BASES_LIST[i];
        const b2 = BASES[b1]?.par || 'A';
        const x1 = cx + Math.sin(i * 0.4 + t) * amp;
        const x2 = cx + Math.sin(i * 0.4 + t + Math.PI) * amp;

        
        ctx.beginPath();
        ctx.moveTo(x1, y);
        ctx.lineTo(x2, y);
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        
        ctx.beginPath();
        ctx.arc(x1, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = BASES[b1]?.cor || '#888';
        ctx.fill();
        ctx.font = 'bold 7px DM Mono, monospace';
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b1, x1, y);

        
        ctx.beginPath();
        ctx.arc(x2, y, 7, 0, Math.PI * 2);
        ctx.fillStyle = BASES[b2]?.cor || '#888';
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillText(b2, x2, y);
      }

      if (!_helicePaused) t += 0.012 * _heliceSpeed;
      state.heliceAnim = requestAnimationFrame(draw);
    }
    draw();
  }

  function heliceSetSpeed(s) { _heliceSpeed = s; }
  function heliceTogglePausa() {
    _helicePaused = !_helicePaused;
    const btn = document.getElementById('gd-pause-btn');
    if (btn) btn.textContent = _helicePaused ? '▶ Continuar' : '⏸ Pausar';
  }

  
  
  
  function _renderTranscricao() {
    return `
    <div style="display:flex;flex-direction:column;height:100%;overflow:hidden;">
   
      <div style="padding:14px 20px;border-bottom:1px solid rgba(255,255,255,0.07);background:#0b1220;flex-shrink:0;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <span style="font-size:0.78rem;color:#64748b;font-family:'DM Mono',monospace;">SEQ. DNA 5'→3':</span>
        <input id="gd-dna-input" value="${state.dnaSeq}" maxlength="60"
          oninput="GeneticaDNA.dnaInputChange(this.value)"
          style="flex:1;min-width:200px;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px 12px;font-family:'DM Mono',monospace;font-size:0.82rem;color:#e2e8f0;outline:none;"
          placeholder="Ex: ATGCGATCG..." />
        <button onclick="GeneticaDNA.dnaInputChange(document.getElementById('gd-dna-input').value)"
          style="${_btnStyle('#22c55e','#000')}🔄 Processar</button>
        ${GENES_EXEMPLO.map((g,i) => `<button onclick="GeneticaDNA.carregarGene(${i})" style="${_btnStyle('#1e293b')}">${g.nome.split(' ')[0]}</button>`).join('')}
      </div>
    
      <div style="flex:1;overflow-y:auto;padding:16px 20px;display:flex;flex-direction:column;gap:16px;" id="gd-trans-output"></div>
    </div>`;
  }

  function _initTranscricao() {
    dnaInputChange(state.dnaSeq);
  }

  function dnaInputChange(val) {
    state.dnaSeq = val.toUpperCase().replace(/[^ATGC]/g, '').substring(0, 60);
    const inp = document.getElementById('gd-dna-input');
    if (inp) inp.value = state.dnaSeq;
    _renderTransOutput();
  }

  function carregarGene(i) {
    dnaInputChange(GENES_EXEMPLO[i].seq);
  }

  function _renderTransOutput() {
    const out = document.getElementById('gd-trans-output');
    if (!out || !state.dnaSeq) return;
    const dna = state.dnaSeq;

    const fita_molde = dna.split('').map(b => BASES[b]?.par || b).join('');

    const mrna = fita_molde.split('').map(b => b === 'T' ? 'U' : b).join('');

    const proteina = [];
    let iniciou = false;
    for (let i = 0; i + 2 < mrna.length; i += 3) {
      const codon = mrna.substring(i, i + 3);
      const aa = CODONS[codon] || '???';
      if (aa === 'Met(Início)' && !iniciou) iniciou = true;
      if (iniciou) proteina.push({ codon, aa });
      if (iniciou && aa === 'STOP') break;
    }

    function renderSeq(seq, tipo) {
      return seq.split('').map(b => {
        const cor = tipo === 'rna' ? (BASES[b]?.cor || '#888') : (BASES[b]?.cor || '#888');
        return `<span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:4px;background:${cor};color:#000;font-family:'DM Mono',monospace;font-size:0.7rem;font-weight:700;margin:1px;">${b}</span>`;
      }).join('');
    }

    out.innerHTML = `
      
      <div style="${_stepCard('#6366f1')}">
        <div style="${_stepHeader()}"><span style="background:#6366f1;${_badgeStyle()}">ETAPA 1</span><span style="font-size:0.9rem;font-weight:600;color:#e2e8f0;">🧬 DNA Original (Fita Codificante)</span></div>
        <div style="margin:8px 0;font-size:0.7rem;color:#64748b;font-family:'DM Mono',monospace;">5' → 3'</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;">${renderSeq(dna, 'dna')}</div>
      </div>
  
      <div style="text-align:center;font-size:0.75rem;color:#475569;">⬇ Complementação das Bases (A↔T, G↔C)</div>
      <div style="${_stepCard('#475569')}">
        <div style="${_stepHeader()}"><span style="background:#475569;${_badgeStyle()}">ETAPA 2</span><span style="font-size:0.9rem;font-weight:600;color:#e2e8f0;">🔗 Fita Molde (3' → 5')</span></div>
        <div style="margin:8px 0;font-size:0.7rem;color:#64748b;font-family:'DM Mono',monospace;">3' → 5'</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;">${renderSeq(fita_molde, 'dna')}</div>
      </div>
     
      <div style="text-align:center;font-size:0.75rem;color:#475569;">⬇ Transcrição: RNA Polimerase lê fita molde → produz mRNA (T→U)</div>
      <div style="${_stepCard('#06b6d4')}">
        <div style="${_stepHeader()}"><span style="background:#06b6d4;color:#000;${_badgeStyle()}">ETAPA 3</span><span style="font-size:0.9rem;font-weight:600;color:#e2e8f0;">📋 mRNA (RNA Mensageiro)</span></div>
        <div style="margin:8px 0;font-size:0.7rem;color:#64748b;font-family:'DM Mono',monospace;">5' → 3' (Timina substituída por Uracila)</div>
        <div style="display:flex;flex-wrap:wrap;gap:2px;">${renderSeq(mrna, 'rna')}</div>
      </div>

      <div style="text-align:center;font-size:0.75rem;color:#475569;">⬇ Tradução: Ribossomo lê mRNA em códons de 3 bases → cadeia de aminoácidos</div>
      <div style="${_stepCard('#22c55e')}">
        <div style="${_stepHeader()}"><span style="background:#22c55e;color:#000;${_badgeStyle()}">ETAPA 4</span><span style="font-size:0.9rem;font-weight:600;color:#e2e8f0;">🧪 Proteína (Cadeia de Aminoácidos)</span></div>
        <div style="margin:8px 0;font-size:0.7rem;color:#64748b;font-family:'DM Mono',monospace;">${proteina.length === 0 ? 'Nenhum códon AUG (Met) encontrado — sem proteína sintetizada.' : `${proteina.length} aminoácido(s)`}</div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">
          ${proteina.map(({codon, aa}) => `
            <div style="display:flex;flex-direction:column;align-items:center;gap:2px;margin-bottom:4px;">
              <div style="display:flex;gap:1px;">
                ${codon.split('').map(b => `<span style="width:16px;height:16px;border-radius:3px;background:${BASES[b]?.cor||'#888'};color:#000;font-family:'DM Mono',monospace;font-size:0.55rem;font-weight:700;display:flex;align-items:center;justify-content:center;">${b}</span>`).join('')}
              </div>
              <div style="background:${AA_CORES[aa] || '#64748b'};color:#000;font-family:'DM Mono',monospace;font-size:0.6rem;font-weight:700;padding:2px 5px;border-radius:4px;max-width:58px;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${aa}">${aa === 'STOP' ? '🛑' : aa.substring(0,5)}</div>
            </div>
          `).join('')}
          ${proteina.length === 0 ? '<span style="color:#475569;font-size:0.8rem;">Sem ORF encontrado na sequência</span>' : ''}
        </div>
      </div>
    `;
  }

  function _renderPunnett() {
    const t = TRACOS[state.punnettTraco];
    return `
    <div style="display:flex;height:100%;overflow:hidden;">
      
      <div style="width:280px;background:#0b1220;border-right:1px solid rgba(255,255,255,0.07);padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:14px;flex-shrink:0;">
        <div>
          <div style="font-size:0.7rem;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin-bottom:8px;">Traço Genético</div>
          <div style="display:flex;flex-direction:column;gap:6px;">
            ${TRACOS.map((tr, i) => `
              <button onclick="GeneticaDNA.setPunnettTraco(${i})"
                style="text-align:left;padding:8px 12px;border-radius:8px;border:1px solid ${state.punnettTraco === i ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.07)'};background:${state.punnettTraco === i ? 'rgba(34,197,94,0.08)' : 'transparent'};color:${state.punnettTraco === i ? '#22c55e' : '#94a3b8'};font-size:0.78rem;cursor:pointer;display:flex;align-items:center;gap:8px;">
                <span>${tr.icon}</span><span>${tr.nome}</span>
              </button>`).join('')}
          </div>
        </div>
        <div>
          <div style="font-size:0.7rem;font-family:'DM Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin-bottom:8px;">Genótipo dos Pais</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            <div>
              <label style="font-size:0.75rem;color:#64748b;display:block;margin-bottom:4px;">👨 Pai</label>
              <select id="gd-pai" onchange="GeneticaDNA.setPunnettGenotipos(this.value,document.getElementById('gd-mae').value)"
                style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:0.82rem;outline:none;">
                ${_genotipOpts(t).map(g => `<option value="${g}" ${g===state.punnettPai?'selected':''}>${g}</option>`).join('')}
              </select>
            </div>
            <div>
              <label style="font-size:0.75rem;color:#64748b;display:block;margin-bottom:4px;">👩 Mãe</label>
              <select id="gd-mae" onchange="GeneticaDNA.setPunnettGenotipos(document.getElementById('gd-pai').value,this.value)"
                style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:8px;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:0.82rem;outline:none;">
                ${_genotipOpts(t).map(g => `<option value="${g}" ${g===state.punnettMae?'selected':''}>${g}</option>`).join('')}
              </select>
            </div>
          </div>
        </div>
        <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:10px;">
          <div style="font-size:0.7rem;color:#22c55e;font-family:'DM Mono',monospace;margin-bottom:6px;">ℹ️ ${t.nome}</div>
          <div style="font-size:0.72rem;color:#64748b;line-height:1.5;">${t.desc}</div>
          <div style="margin-top:8px;display:flex;gap:6px;">
            <span style="background:rgba(34,197,94,0.15);color:#22c55e;border-radius:5px;padding:2px 7px;font-size:0.68rem;font-family:'DM Mono',monospace;">${t.dom} = ${t.domLabel}</span>
            <span style="background:rgba(239,68,68,0.15);color:#f87171;border-radius:5px;padding:2px 7px;font-size:0.68rem;font-family:'DM Mono',monospace;">${t.rec} = ${t.recLabel}</span>
          </div>
        </div>
      </div>
    
      <div style="flex:1;padding:20px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;" id="gd-punnett-out"></div>
    </div>`;
  }

  function _genotipOpts(traco) {
    const d = traco.dom, r = traco.rec;
    return [`${d}${d}`, `${d}${r}`, `${r}${r}`];
  }

  function _initPunnett() {
    _renderPunnettOutput();
  }

  function setPunnettTraco(i) {
    state.punnettTraco = i;
    const t = TRACOS[i];
    state.punnettPai = `${t.dom}${t.rec}`;
    state.punnettMae = `${t.dom}${t.rec}`;
    setAba('punnett');
  }

  function setPunnettGenotipos(pai, mae) {
    state.punnettPai = pai;
    state.punnettMae = mae;
    _renderPunnettOutput();
  }

  function _renderPunnettOutput() {
    const out = document.getElementById('gd-punnett-out');
    if (!out) return;
    const t = TRACOS[state.punnettTraco];
    const pai = state.punnettPai.split('');
    const mae = state.punnettMae.split('');
    const comb = [];
    for (const p of pai) for (const m of mae) {
      const sorted = [p, m].sort((a,b) => {
        const order = [t.dom, t.rec];
        return order.indexOf(a) - order.indexOf(b);
      }).join('');
      comb.push(sorted);
    }

    const fenotipo = (gen) => {
      if (gen.includes(t.dom)) return { label: t.domLabel, cor: '#22c55e' };
      return { label: t.recLabel, cor: '#ef4444' };
    };

    const contagem = {};
    comb.forEach(g => { contagem[g] = (contagem[g] || 0) + 1; });
    const fenoCont = { [t.domLabel]: 0, [t.recLabel]: 0 };
    comb.forEach(g => { fenoCont[fenotipo(g).label]++; });

    out.innerHTML = `
      <div>
        <div style="font-family:'DM Serif Display',serif;font-size:1rem;color:#e2e8f0;margin-bottom:4px;">Quadro de Punnett</div>
        <div style="font-size:0.75rem;color:#64748b;">${t.icon} ${t.nome} — ${state.punnettPai} × ${state.punnettMae}</div>
      </div>
     
      <div style="overflow-x:auto;">
        <table style="border-collapse:collapse;font-family:'DM Mono',monospace;">
          <tr>
            <td style="width:60px;height:60px;background:#0f172a;border:1px solid rgba(255,255,255,0.07);"></td>
            ${mae.map(m => `<td style="width:80px;height:60px;text-align:center;background:#0f172a;border:1px solid rgba(255,255,255,0.07);font-size:1.1rem;font-weight:700;color:#a78bfa;">${m}</td>`).join('')}
          </tr>
          ${pai.map((p, pi) => `
            <tr>
              <td style="width:60px;height:80px;text-align:center;background:#0f172a;border:1px solid rgba(255,255,255,0.07);font-size:1.1rem;font-weight:700;color:#60a5fa;">${p}</td>
              ${mae.map((m, mi) => {
                const gen = comb[pi * mae.length + mi];
                const fn = fenotipo(gen);
                return `<td style="width:80px;height:80px;text-align:center;border:1px solid rgba(255,255,255,0.07);background:${fn.cor}18;vertical-align:middle;cursor:default;" title="${gen} = ${fn.label}">
                  <div style="font-size:1rem;font-weight:700;color:#e2e8f0;">${gen}</div>
                  <div style="font-size:0.62rem;color:${fn.cor};margin-top:2px;">${fn.label}</div>
                </td>`;
              }).join('')}
            </tr>`).join('')}
        </table>
      </div>
     
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="${_stepCard('#6366f1')}">
          <div style="font-size:0.7rem;font-family:'DM Mono',monospace;text-transform:uppercase;color:#6366f1;margin-bottom:8px;">Proporção Genotípica</div>
          ${Object.entries(contagem).map(([g, n]) => `
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-family:'DM Mono',monospace;font-size:0.85rem;color:#e2e8f0;">${g}</span>
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:${n * 25}px;height:6px;border-radius:3px;background:#6366f1;transition:width 0.3s;"></div>
                <span style="font-size:0.75rem;color:#94a3b8;">${n}/4 (${Math.round(n/4*100)}%)</span>
              </div>
            </div>`).join('')}
        </div>
        <div style="${_stepCard('#22c55e')}">
          <div style="font-size:0.7rem;font-family:'DM Mono',monospace;text-transform:uppercase;color:#22c55e;margin-bottom:8px;">Proporção Fenotípica</div>
          ${Object.entries(fenoCont).map(([f, n]) => {
            const cor = f === t.domLabel ? '#22c55e' : '#ef4444';
            return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:0.82rem;color:#e2e8f0;">${f}</span>
              <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:${n*25}px;height:6px;border-radius:3px;background:${cor};transition:width 0.3s;"></div>
                <span style="font-size:0.75rem;color:${cor};">${n}/4</span>
              </div>
            </div>`;}).join('')}
          <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.07);font-size:0.72rem;color:#64748b;">
            Proporção: ${Object.entries(fenoCont).map(([f,n]) => `${n} ${f}`).join(' : ')}
          </div>
        </div>
      </div>
    `;
  }

  function _renderMutacoes() {
    const seq = state.dnaSeq || 'ATGCGATCGTAGCTAGCTAGCT';
    return `
    <div style="display:flex;height:100%;overflow:hidden;">
      <div style="flex:1;padding:18px;overflow-y:auto;display:flex;flex-direction:column;gap:16px;">
   
        <div style="${_stepCard('#f59e0b')}">
          <div style="font-family:'DM Serif Display',serif;font-size:1rem;color:#e2e8f0;margin-bottom:12px;">⚠️ Simulador de Mutações</div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px;">
            <div>
              <label style="font-size:0.72rem;color:#64748b;display:block;margin-bottom:4px;">Tipo de Mutação</label>
              <select id="gd-mut-tipo" onchange="GeneticaDNA.setMutacaoTipo(this.value)"
                style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px;color:#e2e8f0;font-size:0.8rem;outline:none;">
                <option value="substituicao">🔄 Substituição</option>
                <option value="delecao">❌ Deleção</option>
                <option value="insercao">➕ Inserção</option>
              </select>
            </div>
            <div>
              <label style="font-size:0.72rem;color:#64748b;display:block;margin-bottom:4px;">Posição (1–${seq.length})</label>
              <input type="number" id="gd-mut-pos" value="${state.mutacaoPosicao}" min="1" max="${seq.length}"
                oninput="GeneticaDNA.setMutacaoPosicao(parseInt(this.value))"
                style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px;color:#e2e8f0;font-size:0.8rem;outline:none;" />
            </div>
            <div>
              <label style="font-size:0.72rem;color:#64748b;display:block;margin-bottom:4px;">Sequência Original</label>
              <input id="gd-mut-seq" value="${seq}" maxlength="40"
                oninput="GeneticaDNA.setMutacaoSeq(this.value)"
                style="width:100%;background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:7px;color:#e2e8f0;font-family:'DM Mono',monospace;font-size:0.78rem;outline:none;" />
            </div>
          </div>
          <button onclick="GeneticaDNA.aplicarMutacao()" style="${_btnStyle('#f59e0b','#000')}⚡ Aplicar Mutação</button>
        </div>

        <div id="gd-mut-output"></div>
      </div>

      <div style="width:240px;background:#0b1220;border-left:1px solid rgba(255,255,255,0.07);padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;flex-shrink:0;">
        ${[
          { tipo:'substituicao', nome:'Substituição', icon:'🔄', cor:'#f59e0b', desc:'Uma base é trocada por outra. Pode ser silenciosa, missense (troca aminoácido) ou nonsense (cria STOP prematuro).' },
          { tipo:'delecao', nome:'Deleção', icon:'❌', cor:'#ef4444', desc:'Uma ou mais bases são removidas. Causa frameshift — desloca toda a leitura dos códons seguintes.' },
          { tipo:'insercao', nome:'Inserção', icon:'➕', cor:'#22c55e', desc:'Uma ou mais bases são inseridas. Também causa frameshift e pode alterar completamente a proteína.' },
        ].map(m => `
          <div style="background:${m.cor}10;border:1px solid ${m.cor}30;border-radius:10px;padding:10px;">
            <div style="font-size:0.8rem;font-weight:600;color:${m.cor};margin-bottom:4px;">${m.icon} ${m.nome}</div>
            <div style="font-size:0.72rem;color:#64748b;line-height:1.5;">${m.desc}</div>
          </div>`).join('')}
        <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:10px;">
          <div style="font-size:0.7rem;color:#818cf8;font-family:'DM Mono',monospace;margin-bottom:4px;">💡 Frameshift</div>
          <div style="font-size:0.72rem;color:#64748b;line-height:1.5;">Inserções e deleções (que não sejam múltiplas de 3) deslocam toda a leitura dos códons, geralmente produzindo proteínas completamente não funcionais.</div>
        </div>
      </div>
    </div>`;
  }

  function _initMutacoes() {
    state.mutacaoSeq = state.dnaSeq || 'ATGCGATCGTAGCTAGCTAGCT';
    state.mutacaoOriginal = state.mutacaoSeq;
  }

  function setMutacaoTipo(t) { state.mutacaoTipo = t; }
  function setMutacaoPosicao(p) { state.mutacaoPosicao = p; }
  function setMutacaoSeq(s) { state.mutacaoSeq = s.toUpperCase().replace(/[^ATGC]/g,''); state.mutacaoOriginal = state.mutacaoSeq; }

  function aplicarMutacao() {
    const seq = (document.getElementById('gd-mut-seq')?.value || state.mutacaoSeq || 'ATGCGATCG').toUpperCase().replace(/[^ATGC]/g,'');
    const pos = Math.max(0, (parseInt(document.getElementById('gd-mut-pos')?.value) || state.mutacaoPosicao) - 1);
    const tipo = document.getElementById('gd-mut-tipo')?.value || state.mutacaoTipo;
    const BASESLIST = ['A','T','G','C'];
    let mutada = seq;
    let descricao = '';

    if (tipo === 'substituicao') {
      const baseAtual = seq[pos];
      const novaBase = BASESLIST.find(b => b !== baseAtual) || 'G';
      mutada = seq.substring(0, pos) + novaBase + seq.substring(pos + 1);
      descricao = `Base na posição ${pos+1}: <strong style="color:#f59e0b">${baseAtual} → ${novaBase}</strong>`;
    } else if (tipo === 'delecao') {
      mutada = seq.substring(0, pos) + seq.substring(pos + 1);
      descricao = `Base <strong style="color:#ef4444">${seq[pos]}</strong> na posição ${pos+1} foi <strong style="color:#ef4444">deletada</strong>`;
    } else if (tipo === 'insercao') {
      const ins = BASESLIST[Math.floor(Math.random() * 4)];
      mutada = seq.substring(0, pos) + ins + seq.substring(pos);
      descricao = `Base <strong style="color:#22c55e">${ins}</strong> inserida na posição ${pos+1}`;
    }

    
    const prot1 = _seqToProteina(seq);
    const prot2 = _seqToProteina(mutada);

    const out = document.getElementById('gd-mut-output');
    if (!out) return;

    out.innerHTML = `
      <div style="${_stepCard('#475569')}">
        <div style="font-size:0.8rem;color:#e2e8f0;margin-bottom:10px;">📊 Comparação antes/depois da mutação</div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-bottom:10px;">${descricao}</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div>
            <div style="font-size:0.68rem;color:#22c55e;font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:4px;">ORIGINAL</div>
            <div style="display:flex;flex-wrap:wrap;gap:1px;">${_renderSeqComDiff(seq, mutada, false)}</div>
          </div>
          <div>
            <div style="font-size:0.68rem;color:#f59e0b;font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:4px;">MUTADA</div>
            <div style="display:flex;flex-wrap:wrap;gap:1px;">${_renderSeqComDiff(seq, mutada, true)}</div>
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:4px;">
        <div style="${_stepCard('#22c55e')}">
          <div style="font-size:0.7rem;color:#22c55e;font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:6px;">Proteína Original</div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;">${_renderProteina(prot1)}</div>
        </div>
        <div style="${_stepCard(tipo === 'substituicao' ? '#f59e0b' : '#ef4444')}">
          <div style="font-size:0.7rem;color:${tipo === 'substituicao' ? '#f59e0b' : '#ef4444'};font-family:'DM Mono',monospace;text-transform:uppercase;margin-bottom:6px;">Proteína Mutada ${tipo !== 'substituicao' ? '⚠️ FRAMESHIFT' : ''}</div>
          <div style="display:flex;flex-wrap:wrap;gap:3px;">${_renderProteina(prot2)}</div>
        </div>
      </div>
      <div style="background:${JSON.stringify(prot1) === JSON.stringify(prot2) ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'};border:1px solid ${JSON.stringify(prot1) === JSON.stringify(prot2) ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'};border-radius:10px;padding:12px;">
        <div style="font-size:0.82rem;font-weight:600;color:${JSON.stringify(prot1) === JSON.stringify(prot2) ? '#22c55e' : '#ef4444'};">
          ${JSON.stringify(prot1) === JSON.stringify(prot2) ? '✅ Mutação Silenciosa — proteína idêntica!' : '⚠️ Mutação Não-Silenciosa — proteína alterada!'}
        </div>
        <div style="font-size:0.75rem;color:#64748b;margin-top:4px;">${JSON.stringify(prot1) === JSON.stringify(prot2) ? 'O código genético é degenerado: diferentes códons podem codificar o mesmo aminoácido.' : tipo !== 'substituicao' ? 'Frameshift desloca toda a leitura — praticamente todos os aminoácidos são alterados.' : 'A substituição resultou em um aminoácido diferente na cadeia polipeptídica.'}</div>
      </div>
    `;
  }

  function _renderSeqComDiff(orig, mut, showMut) {
    const seq = showMut ? mut : orig;
    return seq.split('').map((b, i) => {
      const isDiff = orig[i] !== mut[i] || orig.length !== mut.length && i >= Math.min(orig.length, mut.length) - 1;
      const highlight = showMut && (orig[i] !== mut[i]);
      return `<span style="display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:3px;background:${highlight ? '#f59e0b' : (BASES[b]?.cor||'#888')};color:#000;font-family:'DM Mono',monospace;font-size:0.65rem;font-weight:700;${highlight?'box-shadow:0 0 6px #f59e0b;':''}">${b}</span>`;
    }).join('');
  }

  function _seqToProteina(dna) {
    const molde = dna.split('').map(b => BASES[b]?.par || b).join('');
    const mrna = molde.split('').map(b => b === 'T' ? 'U' : b).join('');
    const prot = [];
    let iniciou = false;
    for (let i = 0; i + 2 < mrna.length; i += 3) {
      const c = mrna.substring(i, i+3);
      const aa = CODONS[c] || '???';
      if (aa === 'Met(Início)') iniciou = true;
      if (iniciou) { prot.push(aa); if (aa === 'STOP') break; }
    }
    return prot;
  }

  function _renderProteina(prot) {
    if (prot.length === 0) return '<span style="color:#475569;font-size:0.75rem;">Sem ORF</span>';
    return prot.map(aa => `<span style="background:${AA_CORES[aa]||'#64748b'};color:#000;font-family:'DM Mono',monospace;font-size:0.6rem;font-weight:700;padding:2px 5px;border-radius:4px;white-space:nowrap;">${aa === 'STOP' ? '🛑' : aa.substring(0,4)}</span>`).join('');
  }

  
  
  
  const DOENCAS = [
    { nome:'Anemia Falciforme', gene:'HBB', tipo:'Autossômica Recessiva', crom:'11', prevalencia:'1:500 (afrodescendentes)', mutacao:'Substituição GAG→GTG (Glu→Val)', icone:'🩸', cor:'#ef4444', desc:'Mutação no gene da hemoglobina beta causa deformação das hemácias em foice. Células em foice bloqueiam vasos sanguíneos, causando dor intensa, anemia e danos a órgãos. Muito prevalente em populações de origem africana por conferir proteção parcial contra malária.', heranca:'Recessiva: indivíduos Aa são portadores saudáveis. Apenas aa desenvolve a doença. Risco de 25% a cada filho de dois portadores.'},
    { nome:'Fenilcetonúria (PKU)', gene:'PAH', tipo:'Autossômica Recessiva', crom:'12', prevalencia:'1:10.000', mutacao:'Substituição no gene PAH', icone:'🧠', cor:'#a855f7', desc:'Deficiência da enzima fenilalanina hidroxilase impede conversão de fenilalanina em tirosina. Acúmulo de fenilalanina causa dano cerebral severo. Detectada pelo Teste do Pezinho; tratada com dieta especial isenta de fenilalanina.', heranca:'Recessiva autossômica. Portadores heterozigotos não apresentam sintomas.'},
    { nome:'Fibrose Cística', gene:'CFTR', tipo:'Autossômica Recessiva', crom:'7', prevalencia:'1:2.500 (caucasianos)', mutacao:'Deleção ΔF508 (3 nucleotídeos)', icone:'🫁', cor:'#06b6d4', desc:'Deleção de 3 nucleotídeos no gene CFTR causa ausência do aminoácido Fenilalanina 508. O canal de cloro defeituoso causa acúmulo de muco espesso nos pulmões e pâncreas. Uma das doenças genéticas mais comuns em europeus.', heranca:'Recessiva. Dois pais portadores têm 25% de chance de ter filho afetado.'},
    { nome:'Síndrome de Down', gene:'Trissomia 21', tipo:'Aberração Cromossômica', crom:'21', prevalencia:'1:700', mutacao:'Cromossomo 21 extra (47,XX/XY,+21)', icone:'💛', cor:'#f59e0b', desc:'Presença de um cromossomo 21 extra (trissomia). Resulta em características físicas distintas e graus variáveis de deficiência intelectual. Geralmente por não-disjunção meiótica. Risco aumenta com a idade materna.', heranca:'Não hereditária na maioria dos casos. Erro na divisão celular.'},
    { nome:'Daltonismo', gene:'OPN1LW/OPN1MW', tipo:'Recessiva Ligada ao X', crom:'X', prevalencia:'8% homens / 0.5% mulheres', mutacao:'Substituição em genes de opsinas', icone:'🎨', cor:'#22c55e', desc:'Deficiência na percepção de cores, principalmente vermelho-verde. Ligada ao cromossomo X: homens (XY) com um alelo afetado desenvolvem a condição; mulheres (XX) precisam de dois alelos afetados. Mulheres heterozigotas são portadoras.', heranca:'Recessiva ligada ao X. Homens afetados têm mãe portadora.'},
    { nome:'Hemofilia A', gene:'F8', tipo:'Recessiva Ligada ao X', crom:'X', prevalencia:'1:5.000 homens', mutacao:'Diversas mutações no gene F8', icone:'💉', cor:'#f43f5e', desc:'Deficiência do Fator VIII da coagulação. Causa sangramento prolongado após ferimentos. Famosa na família real europeia do séc. XIX. A rainha Vitória era portadora e transmitiu para vários descendentes.', heranca:'Ligada ao X. Quase exclusivamente em homens; mulheres raramente afetadas.'},
    { nome:'Síndrome de Huntington', gene:'HTT', tipo:'Autossômica Dominante', crom:'4', prevalencia:'1:10.000', mutacao:'Expansão de repetições CAG (>36)', icone:'🧬', cor:'#8b5cf6', desc:'Expansão anormal de repetições do tripleto CAG no gene HTT. Causa degeneração progressiva de neurônios, levando a movimentos involuntários (coreia), declínio cognitivo e alterações psiquiátricas. Sintomas tipicamente começam entre 30-50 anos.', heranca:'Dominante: um único alelo afetado causa a doença. 50% de chance de transmissão.'},
    { nome:'Síndrome de Klinefelter', gene:'47,XXY', tipo:'Aberração Cromossômica', crom:'X/Y', prevalencia:'1:500 homens', mutacao:'Cromossomo X extra em homens (47,XXY)', icone:'🔵', cor:'#60a5fa', desc:'Homens com cromossomo X extra. Causa hipogonadismo, infertilidade, ginecomastia e estatura alta. Sintomas frequentemente sutis — muitos só descobrem ao investigar infertilidade. A inteligência geralmente não é afetada de forma significativa.', heranca:'Não hereditária. Erro na separação cromossômica durante meiose.'},
  ];

  function _renderDoencas() {
    return `
    <div style="height:100%;overflow-y:auto;padding:16px 20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;align-content:start;">
      ${DOENCAS.map((d,i) => `
        <div onclick="GeneticaDNA.expandirDoenca(${i})" id="gd-doenca-${i}"
          style="background:#0b1220;border:1px solid ${d.cor}25;border-radius:12px;padding:14px;cursor:pointer;transition:all 0.2s;position:relative;overflow:hidden;"
          onmouseover="this.style.borderColor='${d.cor}60';this.style.background='${d.cor}08'"
          onmouseout="this.style.borderColor='${d.cor}25';this.style.background='#0b1220'">
          <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${d.cor};"></div>
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:1.5rem;">${d.icone}</span>
            <div>
              <div style="font-size:0.85rem;font-weight:600;color:#e2e8f0;">${d.nome}</div>
              <div style="font-size:0.68rem;color:${d.cor};font-family:'DM Mono',monospace;margin-top:1px;">${d.tipo}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            <span style="background:rgba(255,255,255,0.05);border-radius:5px;padding:2px 7px;font-size:0.65rem;color:#94a3b8;font-family:'DM Mono',monospace;">Gene: ${d.gene}</span>
            <span style="background:rgba(255,255,255,0.05);border-radius:5px;padding:2px 7px;font-size:0.65rem;color:#94a3b8;font-family:'DM Mono',monospace;">Crom. ${d.crom}</span>
          </div>
          <div style="font-size:0.72rem;color:#64748b;line-height:1.5;">${d.desc.substring(0,100)}... <span style="color:${d.cor};">ver mais →</span></div>
          <div id="gd-doenca-exp-${i}" style="display:none;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.07);">
            <div style="font-size:0.75rem;color:#e2e8f0;line-height:1.6;margin-bottom:8px;">${d.desc}</div>
            <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px;">
              <div style="font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.08em;font-family:'DM Mono',monospace;margin-bottom:4px;">Herança</div>
              <div style="font-size:0.73rem;color:#94a3b8;line-height:1.5;">${d.heranca}</div>
            </div>
            <div style="margin-top:8px;background:${d.cor}10;border-radius:8px;padding:8px;">
              <div style="font-size:0.68rem;color:${d.cor};text-transform:uppercase;letter-spacing:0.08em;font-family:'DM Mono',monospace;margin-bottom:3px;">Mutação</div>
              <div style="font-size:0.73rem;color:#94a3b8;">${d.mutacao}</div>
              <div style="font-size:0.72rem;color:#64748b;margin-top:3px;">Prevalência: ${d.prevalencia}</div>
            </div>
          </div>
        </div>`).join('')}
    </div>`;
  }

  function expandirDoenca(i) {
    const exp = document.getElementById(`gd-doenca-exp-${i}`);
    if (!exp) return;
    const visible = exp.style.display !== 'none';
    exp.style.display = visible ? 'none' : 'block';
  }

  
  
  
  function _renderQuiz() {
    return `
    <div style="height:100%;overflow-y:auto;padding:20px;display:flex;flex-direction:column;gap:16px;max-width:700px;margin:0 auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="font-family:'DM Serif Display',serif;font-size:1.1rem;color:#e2e8f0;">🎯 Quiz de Genética</div>
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="font-family:'DM Mono',monospace;font-size:0.75rem;color:#64748b;" id="gd-quiz-progress">0/${QUIZ.length}</span>
          <span style="background:rgba(34,197,94,0.15);color:#22c55e;border-radius:20px;padding:4px 12px;font-size:0.75rem;font-family:'DM Mono',monospace;" id="gd-quiz-score">⭐ 0 pts</span>
        </div>
      </div>
      <div id="gd-quiz-barra" style="height:4px;background:#1e293b;border-radius:2px;overflow:hidden;">
        <div id="gd-quiz-barra-fill" style="height:100%;background:linear-gradient(90deg,#22c55e,#06b6d4);width:0%;transition:width 0.4s;border-radius:2px;"></div>
      </div>
      <div id="gd-quiz-card"></div>
    </div>`;
  }

  function _initQuiz() {
    state.quizIdx = 0;
    state.quizAcertos = 0;
    state.quizRespondida = false;
    _renderQuizCard();
  }

  function _renderQuizCard() {
    const card = document.getElementById('gd-quiz-card');
    if (!card) return;
    const prog = document.getElementById('gd-quiz-progress');
    const score = document.getElementById('gd-quiz-score');
    const barra = document.getElementById('gd-quiz-barra-fill');
    if (prog) prog.textContent = `${state.quizIdx}/${QUIZ.length}`;
    if (score) score.textContent = `⭐ ${state.quizAcertos * 10} pts`;
    if (barra) barra.style.width = `${(state.quizIdx / QUIZ.length) * 100}%`;

    if (state.quizIdx >= QUIZ.length) {
      const pct = Math.round(state.quizAcertos / QUIZ.length * 100);
      card.innerHTML = `
        <div style="text-align:center;padding:30px;background:#0b1220;border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
          <div style="font-size:4rem;margin-bottom:16px;">${pct >= 80 ? '🏆' : pct >= 60 ? '😊' : '📚'}</div>
          <div style="font-family:'DM Serif Display',serif;font-size:1.4rem;color:#e2e8f0;margin-bottom:8px;">Quiz Finalizado!</div>
          <div style="font-size:0.9rem;color:#64748b;margin-bottom:20px;">${state.quizAcertos}/${QUIZ.length} corretas — ${pct}%</div>
          <div style="font-size:2rem;font-weight:700;color:${pct>=80?'#22c55e':pct>=60?'#f59e0b':'#ef4444'};margin-bottom:20px;">${state.quizAcertos * 10} pontos</div>
          <div style="font-size:0.8rem;color:#64748b;margin-bottom:20px;">${pct>=80?'Excelente! Você domina Genética!':pct>=60?'Bom trabalho! Continue estudando.':'Revise o conteúdo e tente novamente.'}</div>
          <button onclick="GeneticaDNA._initQuiz()" style="${_btnStyle('#22c55e','#000')}🔄 Tentar Novamente</button>
        </div>`;
      return;
    }

    const q = QUIZ[state.quizIdx];
    state.quizRespondida = false;
    card.innerHTML = `
      <div style="background:#0b1220;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;animation:gdSlideIn 0.3s ease;">
        <div style="font-family:'DM Mono',monospace;font-size:0.68rem;color:#475569;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:12px;">Pergunta ${state.quizIdx + 1} de ${QUIZ.length}</div>
        <div style="font-size:0.95rem;color:#e2e8f0;line-height:1.6;margin-bottom:20px;font-weight:500;">${q.q}</div>
        <div style="display:flex;flex-direction:column;gap:8px;" id="gd-quiz-opts">
          ${q.ops.map((op, i) => `
            <button onclick="GeneticaDNA.responderQuiz(${i})" id="gd-qopt-${i}"
              style="text-align:left;padding:12px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);background:#0f172a;color:#94a3b8;font-size:0.83rem;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:10px;"
              onmouseover="if(!this.disabled)this.style.borderColor='rgba(99,102,241,0.4)';this.style.color='#e2e8f0'"
              onmouseout="if(!this.disabled&&!this.classList.contains('selected'))this.style.borderColor='rgba(255,255,255,0.08)';this.style.color='#94a3b8'">
              <span style="width:24px;height:24px;border-radius:6px;border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;font-family:'DM Mono',monospace;font-size:0.72rem;flex-shrink:0;">${String.fromCharCode(65+i)}</span>
              ${op}
            </button>`).join('')}
        </div>
        <div id="gd-quiz-exp" style="display:none;margin-top:14px;background:rgba(34,197,94,0.06);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:12px;">
          <div style="font-size:0.7rem;color:#22c55e;font-family:'DM Mono',monospace;margin-bottom:4px;">💡 Explicação</div>
          <div style="font-size:0.8rem;color:#94a3b8;line-height:1.5;">${q.exp}</div>
          <button onclick="GeneticaDNA.proximaQuiz()" style="${_btnStyle('#22c55e','#000')}margin-top:10px;">Próxima →</button>
        </div>
      </div>`;
  }

  function responderQuiz(i) {
    if (state.quizRespondida) return;
    state.quizRespondida = true;
    const q = QUIZ[state.quizIdx];
    const correta = q.resp === i;
    if (correta) state.quizAcertos++;

    for (let j = 0; j < q.ops.length; j++) {
      const btn = document.getElementById(`gd-qopt-${j}`);
      if (!btn) continue;
      btn.disabled = true;
      btn.style.cursor = 'default';
      if (j === q.resp) { btn.style.background = 'rgba(34,197,94,0.15)'; btn.style.borderColor = '#22c55e'; btn.style.color = '#22c55e'; }
      else if (j === i && !correta) { btn.style.background = 'rgba(239,68,68,0.15)'; btn.style.borderColor = '#ef4444'; btn.style.color = '#ef4444'; }
    }

    const exp = document.getElementById('gd-quiz-exp');
    if (exp) exp.style.display = 'block';
  }

  function proximaQuiz() {
    state.quizIdx++;
    _renderQuizCard();
  }

  function _btnStyle(bg, cor = '#e2e8f0') {
    return `background:${bg};color:${cor};border:none;border-radius:8px;padding:7px 14px;font-family:'DM Sans',sans-serif;font-size:0.78rem;font-weight:500;cursor:pointer;transition:all 0.2s;`;
  }
  function _stepCard(cor) {
    return `background:#0b1220;border:1px solid ${cor}25;border-left:3px solid ${cor};border-radius:10px;padding:14px;`;
  }
  function _stepHeader() {
    return `display:flex;align-items:center;gap:10px;margin-bottom:10px;`;
  }
  function _badgeStyle() {
    return `color:#fff;font-family:'DM Mono',monospace;font-size:0.65rem;font-weight:700;padding:2px 8px;border-radius:20px;letter-spacing:0.06em;`;
  }

  function _injectStyles() {
    if (document.getElementById('gd-styles')) return;
    const s = document.createElement('style');
    s.id = 'gd-styles';
    s.textContent = `
      @keyframes gdFadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
      @keyframes gdSlideIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      #${MODAL_ID} * { box-sizing:border-box; }
      #${MODAL_ID} select option { background:#0f172a; color:#e2e8f0; }
      #${MODAL_ID} ::-webkit-scrollbar { width:4px; height:4px; }
      #${MODAL_ID} ::-webkit-scrollbar-track { background:transparent; }
      #${MODAL_ID} ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.1);border-radius:2px; }
    `;
    document.head.appendChild(s);
  }

  return {
    abrir, fechar, setAba,
    heliceSetSpeed, heliceTogglePausa,
    dnaInputChange, carregarGene,
    setPunnettTraco, setPunnettGenotipos,
    setMutacaoTipo, setMutacaoPosicao, setMutacaoSeq, aplicarMutacao,
    expandirDoenca,
    responderQuiz, proximaQuiz, _initQuiz,
  };
})();