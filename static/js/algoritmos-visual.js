const AlgoritmosVisual = (() => {
  const MODAL_ID = 'modal-algoritmos-visual';

  let _state = {
    abaAtiva: 'menu', 
    animacaoRodando: false,
    dados: [],
    passoAtual: 0,
    velocidade: 1,
    timerAnimacao: null,
    array: [],      
    stack: [],       
    comparando: [-1, -1],
    pivotIndex: -1,  
    tree: null,      
    lastAction: '',
    dpr: window.devicePixelRatio || 1
  };

  function abrir(aba = 'menu') {
    document.getElementById(MODAL_ID)?.remove();
    _stopAnimacao();
    _injectStyles();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'ex-modal-overlay av-overlay';
    modal.style.cssText = 'z-index:100005;display:flex;align-items:center;justify-content:center;';

    modal.innerHTML = `
      <div class="av-box">
        <div class="av-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;">💻</span>
            <span class="av-title">Visualizador de Algoritmos</span>
          </div>
          <div class="av-tabs">
            <button class="av-tab" id="tab-menu"         onclick="AlgoritmosVisual.setTab('menu')">Menu</button>
            <button class="av-tab" id="tab-bubble-sort"  onclick="AlgoritmosVisual.setTab('bubble-sort')">Bubble Sort</button>
            <button class="av-tab" id="tab-quick-sort"   onclick="AlgoritmosVisual.setTab('quick-sort')">Quick Sort</button>
            <button class="av-tab" id="tab-stack"        onclick="AlgoritmosVisual.setTab('stack')">Pilha</button>
            <button class="av-tab" id="tab-binary-tree"  onclick="AlgoritmosVisual.setTab('binary-tree')">Árvore Binária</button>
          </div>
          <button class="av-close" onclick="AlgoritmosVisual.fechar()">✕</button>
        </div>
        <div class="av-body" id="av-body"></div>
      </div>
    `;
    document.body.appendChild(modal);
    setTab(aba);

    window.addEventListener('resize', _handleResize);
  }

  function _handleResize() {
    if (document.getElementById(MODAL_ID)) _draw();
  }

  function fechar() {
    _stopAnimacao();
    document.getElementById(MODAL_ID)?.remove();
  }

  function _stopAnimacao() {
    if (_state.timerAnimacao) {
      clearTimeout(_state.timerAnimacao);
      _state.timerAnimacao = null;
    }
    _state.animacaoRodando = false;
  }

  
  
  function setTab(tab) {
    _stopAnimacao();
    _state.abaAtiva = tab;
    document.querySelectorAll('.av-tab').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${tab}`)?.classList.add('active');

    const body = document.getElementById('av-body');
    if (!body) return;
    
    _state.lastAction = '';
    _state.comparando = [-1, -1];
    _state.pivotIndex = -1;

    
    if (tab === 'menu') {
      body.innerHTML = _renderMenu();
    } else {
      body.innerHTML = _renderSimulador(tab);
      if (tab === 'bubble-sort')      _initBubbleSort();
      else if (tab === 'quick-sort')  _initQuickSort();
      else if (tab === 'stack')       _initStack();
      else if (tab === 'binary-tree') _initBinaryTree();
    }
  }

  function _renderMenu() {
    return `
      <div class="av-menu-wrap">
        <div class="av-menu-intro">
          <div class="av-menu-icon">🧠</div>
          <h3>Visualizador de Algoritmos e Estruturas de Dados</h3>
          <p>Explore como os algoritmos funcionam passo a passo e visualize estruturas de dados complexas. Escolha uma opção acima para começar!</p>
        </div>
        <div class="av-menu-grid">
          <button class="av-menu-card" onclick="AlgoritmosVisual.setTab('bubble-sort')">
            <span>Bubble Sort</span>
            <small>Algoritmo de Ordenação</small>
          </button>
          <button class="av-menu-card" onclick="AlgoritmosVisual.setTab('quick-sort')">
            <span>Quick Sort</span>
            <small>Algoritmo de Ordenação</small>
          </button>
          <button class="av-menu-card" onclick="AlgoritmosVisual.setTab('stack')">
            <span>Pilha (Stack)</span>
            <small>Estrutura de Dados</small>
          </button>
          <button class="av-menu-card" onclick="AlgoritmosVisual.setTab('binary-tree')">
            <span>Árvore Binária</span>
            <small>Estrutura de Dados</small>
          </button>
        </div>
      </div>
    `;
  }

  function _renderSimulador(algoritmo) {
    let htmlControles = '';
    
    if (algoritmo === 'stack') {
      htmlControles = `
        <div class="av-field-group">
          <input type="number" id="stack-val" placeholder="Valor" style="width:70px" />
          <button class="av-btn-action small" onclick="AlgoritmosVisual.stackPush()">Push</button>
          <button class="av-btn-action small sec" onclick="AlgoritmosVisual.stackPop()">Pop</button>
        </div>
      `;
    } else if (algoritmo === 'binary-tree') {
      htmlControles = `
        <div class="av-field-group">
          <input type="number" id="tree-val" placeholder="Valor" style="width:70px" />
          <button class="av-btn-action small" onclick="AlgoritmosVisual.treeInsert()">Inserir</button>
          <button class="av-btn-action small sec" onclick="AlgoritmosVisual.resetSim()">Reset</button>
        </div>
      `;
    } else if (algoritmo.includes('sort')) {
      htmlControles = `
        <button class="av-btn-action" id="btn-play" onclick="AlgoritmosVisual.toggleAnimacao()">▶ Iniciar Animação</button>
        <button class="av-btn-action sec" onclick="AlgoritmosVisual.resetSim()">↺ Gerar Novo Array</button>
      `;
    }

    return `
      <div class="av-sim-layout">
        <div class="av-sim-controls">
          <div class="av-section-lbl">Controles</div>
          <p style="color:var(--text-2);font-size:12px;margin-bottom:12px;">Módulo: <strong>${algoritmo.replace('-', ' ').toUpperCase()}</strong></p>
          ${htmlControles}
          <button class="av-btn-action" onclick="AlgoritmosVisual.explicarIA()" style="background:var(--bg-3);color:var(--accent);border:1px solid var(--accent);margin-top:8px">🤖 Explicar Teoria</button>
          <div style="flex:1"></div>
          <div class="av-section-lbl">Explicação</div>
          <div id="av-explain" class="av-explain-box"></div>
        </div>
        <div class="av-sim-canvas-wrap">
          <canvas id="av-sim-canvas"></canvas>
        </div>
      </div>
    `;
  }

  
  function _initBubbleSort() {
    _state.array = Array.from({length: 15}, () => Math.floor(Math.random() * 90) + 10);
    _state.passoAtual = 0;
    _state.comparando = [-1, -1];
    _state.pivotIndex = -1;
    _draw();
    _updateExplain("O <b>Bubble Sort</b> percorre o array comparando elementos adjacentes e trocando-os se estiverem na ordem errada. O maior elemento 'flutua' como uma bolha para o final.");
  }

  function _resetSim() {
    _stopAnimacao();
    const btn = document.getElementById('btn-play');
    if (btn) btn.innerHTML = '▶ Iniciar Animação';
    if (_state.abaAtiva === 'bubble-sort') _initBubbleSort();
    else if (_state.abaAtiva === 'quick-sort') _initQuickSort();
    else if (_state.abaAtiva === 'binary-tree') _initBinaryTree();
    _draw();
  }

  function _stepBubbleSort() {
    let arr = _state.array;
    let n = arr.length;
    let i = Math.floor(_state.passoAtual / n);
    let j = _state.passoAtual % (n - 1);

    if (i >= n - 1) {
      _stopAnimacao();
      _state.comparando = [-1, -1];
      document.getElementById('btn-play').innerHTML = '▶ Iniciar Animação';
      _updateExplain("Ordenação concluída!");
      _draw();
      return;
    }

    _state.comparando = [j, j + 1];

    if (arr[j] > arr[j + 1]) {
      [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      _updateExplain(`Trocando ${arr[j+1]} por ${arr[j]} pois ${arr[j+1]} > ${arr[j]}.`);
    } else {
      _updateExplain(`Elementos ${arr[j]} e ${arr[j+1]} já estão na ordem correta.`);
    }

    _state.passoAtual++;
    _draw();
  }

 
  function _initStack() {
    _state.stack = [20, 45, 70];
    _draw();
    _updateExplain("Uma <b>Pilha (Stack)</b> segue o princípio <b>LIFO</b> (Last In, First Out). O último a entrar é o primeiro a sair.");
  }

  function stackPush() {
    const val = parseInt(document.getElementById('stack-val').value);
    if (isNaN(val)) return;
    if (_state.stack.length > 8) { alert("Pilha cheia!"); return; }
    _state.stack.push(val);
    _draw();
    _updateExplain(`Inserindo (PUSH) o valor ${val} no topo da pilha.`);
  }

  function stackPop() {
    if (_state.stack.length === 0) return;
    const val = _state.stack.pop();
    _draw();
    _updateExplain(`Removendo (POP) o valor ${val} do topo da pilha.`);
  }

  function treeInsert() {
    const val = parseInt(document.getElementById('tree-val').value);
    if (isNaN(val)) return;
    _insertNode(_state.tree, val);
    _draw();
    _updateExplain(`Inserindo valor ${val} na árvore respeitando a regra da BST.`);
  }

  function _insertNode(node, val) {
    if (!node) return { val, left: null, right: null };
    if (val < node.val) {
      if (!node.left) node.left = { val, left: null, right: null };
      else _insertNode(node.left, val);
    } else if (val > node.val) {
      if (!node.right) node.right = { val, left: null, right: null };
      else _insertNode(node.right, val);
    }
    return node;
  }

  async function explicarIA() {
    const algoritmo = _state.abaAtiva.replace('-', ' ');
    const prompt = `Explique de forma técnica mas didática como o algoritmo "${algoritmo}" funciona, suas vantagens e sua complexidade de tempo Big O.`;

    try {
      if (window.App && App.toast) App.toast("🤖 IA está analisando a complexidade...", "info");
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: "Você é um tutor de ciência da computação especializado em algoritmos." })
      });
      const data = await res.json();
      
      const box = document.getElementById('av-explain');
      if (box) box.innerHTML = `<strong>🤖 IA:</strong> ${data.response}`;
    } catch (e) { console.error(e); }
  }

  function toggleAnimacao() {
    _state.animacaoRodando = !_state.animacaoRodando;
    const btn = document.getElementById('btn-play');
    if (btn) btn.innerHTML = _state.animacaoRodando ? '⏸ Pausar' : '▶ Continuar';
    if (_state.animacaoRodando) _loop();
  }

 
  function _draw() {
    const canvas = document.getElementById('av-sim-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = _state.dpr;
    const wrap = canvas.parentElement;
    
    canvas.width = wrap.clientWidth * dpr;
    canvas.height = wrap.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (_state.abaAtiva.includes('sort')) _drawBars(ctx, wrap);
    if (_state.abaAtiva === 'stack')       _drawStackItems(ctx, wrap);
    if (_state.abaAtiva === 'binary-tree') _drawTree(ctx, wrap);
  }

  function _drawBars(ctx, cvs) {
    const gap = 10;
    const barWidth = (cvs.width - (gap * (_state.array.length + 1))) / _state.array.length;
    const scale = (cvs.height - 60) / 100;

    _state.array.forEach((val, i) => {
      const isComparing = _state.comparando.includes(i);
      const isPivot = _state.pivotIndex === i;
      
      ctx.fillStyle = isPivot ? '#6366f1' : (isComparing ? 'var(--accent)' : '#2a241e');
      const x = gap + i * (barWidth + gap);
      const h = val * scale;
      const y = cvs.height - h - 20;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, h, [4, 4, 0, 0]);
      ctx.fill();
      
      ctx.fillStyle = (isComparing || isPivot) ? '#fff' : 'rgba(255,255,255,0.3)';
      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(val, x + barWidth/2, y - 5);
    });
  }

  function _drawStackItems(ctx, cvs) {
    const w = 120;
    const h = 40;
    const x = cvs.width / 2 - w / 2;
    
    _state.stack.forEach((val, i) => {
      const y = cvs.height - 50 - (i * (h + 8));
      const isTop = i === _state.stack.length - 1;
      ctx.fillStyle = isTop ? 'rgba(232,160,74,0.1)' : 'var(--bg-2)';
      ctx.strokeStyle = i === _state.stack.length - 1 ? 'var(--accent)' : 'var(--border)';
      ctx.lineWidth = 1.5;
      
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(val, x + w/2, y + h/2);

      if (isTop) {
        ctx.fillStyle = 'var(--accent)';
        ctx.font = '10px monospace';
        ctx.fillText("← TOPO", x + w + 30, y + h/2);
      }
    });
  }

  function _drawTree(ctx, cvs) {
    if (!_state.tree) return;
    _drawNode(ctx, _state.tree, cvs.width / 2, 40, cvs.width / 4);
  }

  function _drawNode(ctx, node, x, y, spacing) {
    if (node.left) {
      ctx.strokeStyle = 'var(--border)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - spacing, y + 60); ctx.stroke();
      _drawNode(ctx, node.left, x - spacing, y + 60, spacing / 2);
    }
    if (node.right) {
      ctx.strokeStyle = 'var(--border)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + spacing, y + 60); ctx.stroke();
      _drawNode(ctx, node.right, x + spacing, y + 60, spacing / 2);
    }

    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1612';
    ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.fill();
    ctx.strokeStyle = 'var(--accent)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(node.val, x, y);
  }

  function _loop() {
    if (!_state.animacaoRodando) return;
    if (_state.abaAtiva === 'bubble-sort') _stepBubbleSort();
    if (_state.abaAtiva === 'quick-sort')  _stepQuickSort();
    _state.timerAnimacao = setTimeout(() => _loop(), 400);
  }

  function _updateExplain(txt) {
    const box = document.getElementById('av-explain');
    if (box) box.innerHTML = txt;
  }

  function _injectStyles() {
    if (document.getElementById('av-styles')) return;
    const s = document.createElement('style');
    s.id = 'av-styles';
    s.textContent = `
      .av-box {
        width: 94vw; max-width: 940px; height: 85vh;
        background: var(--bg-2, #1a1612); border-radius: 20px;
        display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid var(--border, #3a3228);
        box-shadow: 0 24px 80px rgba(0,0,0,.75);
      }
      .av-header {
        padding: 12px 20px; border-bottom: 1px solid var(--border, #3a3228);
        display: flex; justify-content: space-between; align-items: center; gap: 12px;
        background: var(--bg-1, #120f0b); flex-wrap: wrap;
      }
      .av-title { font-size: 16px; font-weight: 700; color: var(--text-0, #f0e6d3); white-space: nowrap; }
      .av-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
      .av-tab {
        padding: 6px 14px; border-radius: 10px; border: 1px solid var(--border, #3a3228);
        background: none; color: var(--text-2, #8a7a6a); font-size: 12px; font-weight: 600; cursor: pointer;
        transition: all .15s;
      }
      .av-tab.active { background: var(--accent, #e8a04a); color: #1a0f00; border-color: var(--accent, #e8a04a); }
      .av-close { background: none; border: none; color: var(--text-2); font-size: 22px; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
      .av-close:hover { background: var(--bg-3, #211d18); }
      .av-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

      
      .av-menu-wrap { padding: 24px; text-align: center; }
      .av-menu-intro { margin-bottom: 32px; }
      .av-menu-icon { font-size: 48px; margin-bottom: 16px; }
      .av-menu-intro h3 { font-family: var(--font-display); font-size: 24px; color: var(--text-0); margin-bottom: 12px; }
      .av-menu-intro p { font-size: 14px; color: var(--text-2); line-height: 1.6; max-width: 600px; margin: 0 auto; }
      .av-menu-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
      .av-menu-card {
        background: var(--bg-3); border: 1px solid var(--border); border-radius: 12px;
        padding: 20px; cursor: pointer; transition: all 0.2s;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 8px; color: var(--text-0);
      }
      .av-menu-card:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.3); }
      .av-menu-card span { font-size: 18px; font-weight: 600; }
      .av-menu-card small { font-size: 11px; color: var(--text-2); }

      
      .av-sim-layout { display: grid; grid-template-columns: 220px 1fr; height: 100%; overflow: hidden; }
      .av-sim-controls {
        background: rgba(0,0,0,0.2); border-right: 1px solid var(--border);
        padding: 14px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;
      }
      .av-section-lbl { font-size: 10px; font-weight: 700; color: var(--text-3); text-transform: uppercase; letter-spacing: 1px; padding: 6px 0 2px; }
      .av-btn-action { padding: 11px; background: var(--accent); color: var(--bg-0); border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; margin-bottom:4px; }
      .av-btn-action.sec { background: var(--bg-3); color: var(--text-1); border: 1px solid var(--border); }
      .av-btn-action.small { padding: 6px 10px; font-size: 11px; margin-bottom:0; }
      .av-btn-action:hover { opacity: 0.85; }
      .av-sim-canvas-wrap { flex: 1; background: #080a12; position: relative; overflow: hidden; padding: 20px; }
      .av-sim-canvas-wrap canvas { width: 100%; height: 100%; display: block; }
      .av-explain-box { font-size: 12px; color: var(--text-2); line-height: 1.6; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; border-left: 3px solid var(--accent); }
      .av-field-group { display: flex; gap: 5px; margin-bottom: 12px; align-items: center; }
      .av-field-group input { background: var(--bg-2); border: 1px solid var(--border); border-radius: 6px; padding: 5px; color: #fff; font-family: var(--font-mono); outline:none; }
    `;
    document.head.appendChild(s);
  }

  (function injetarNoMundo() {
    function add() {
      const menus = document.querySelectorAll('.mt-dropdown-content:not(.av-processed)');
      if (!menus.length) return;

      menus.forEach(menu => {
        menu.classList.add('av-processed');

        const btn = document.createElement('button');
        btn.innerHTML = '💻 Visualizador de Algoritmos';
        btn.onclick = (e) => {
          e.stopPropagation();
          menu.classList.remove('show');
          AlgoritmosVisual.abrir();
        };

       
        const refBtn = Array.from(menu.querySelectorAll('button')).find(b => b.innerText.includes('Simulador de Circuitos'));
        if (refBtn) {
          menu.insertBefore(btn, refBtn.nextSibling);
        } else {
        
          const techLabel = Array.from(menu.querySelectorAll('.mt-dropdown-label')).find(l => l.innerText.includes('Tecnologia'));
          if (techLabel) {
            let nextSibling = techLabel.nextElementSibling;
            while (nextSibling && !nextSibling.classList.contains('mt-dropdown-sep')) {
              nextSibling = nextSibling.nextElementSibling;
            }
            menu.insertBefore(btn, nextSibling);
          } else {
            menu.appendChild(btn);
          }
        }
      });
    }

    const observer = new MutationObserver(() => add());
    observer.observe(document.body, { childList: true, subtree: true });
    add();
  })();

  return {
    abrir,
    fechar,
    setTab,
    toggleAnimacao,
    resetSim: _resetSim,
    stackPush, stackPop,
    treeInsert,
    explicarIA
  };
})();

window.AlgoritmosVisual = AlgoritmosVisual;