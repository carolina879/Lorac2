
const FerramentasExtras = (() => {

 
  var rascunhoTexto = localStorage.getItem('studysync_rascunho') || '';
  var calcDisplay = '0';
  var calcExpressao = '';
  var calcHistorico = [];


  var FORMULAS = {
    'Matemática': [
      { nome: 'Bhaskara', formula: 'x = (-b ± √(b²-4ac)) / 2a', desc: 'Raízes de equação do 2º grau ax²+bx+c=0' },
      { nome: 'Área do triângulo', formula: 'A = (base × altura) / 2', desc: '' },
      { nome: 'Pitágoras', formula: 'a² = b² + c²', desc: 'Triângulo retângulo: a=hipotenusa' },
      { nome: 'Área do círculo', formula: 'A = π × r²', desc: '' },
      { nome: 'Circunferência', formula: 'C = 2 × π × r', desc: '' },
      { nome: 'Progressão Aritmética (termo)', formula: 'aₙ = a₁ + (n-1)×r', desc: '' },
      { nome: 'PA — soma', formula: 'Sₙ = n×(a₁+aₙ)/2', desc: '' },
      { nome: 'Progressão Geométrica (termo)', formula: 'aₙ = a₁ × q^(n-1)', desc: '' },
      { nome: 'PG — soma', formula: 'Sₙ = a₁×(qⁿ-1)/(q-1)', desc: 'q ≠ 1' },
      { nome: 'Logaritmo', formula: 'logₐb = c  ↔  aᶜ = b', desc: '' },
      { nome: 'Combinação', formula: 'C(n,k) = n! / (k! × (n-k)!)', desc: '' },
      { nome: 'Permutação', formula: 'P(n,k) = n! / (n-k)!', desc: '' },
      { nome: 'Média aritmética', formula: 'M = (x₁+x₂+...+xₙ) / n', desc: '' },
      { nome: 'Distância entre pontos', formula: 'd = √((x₂-x₁)²+(y₂-y₁)²)', desc: '' },
    ],
    'Física': [
      { nome: 'Velocidade média', formula: 'v = Δs / Δt', desc: '' },
      { nome: 'Aceleração média', formula: 'a = Δv / Δt', desc: '' },
      { nome: 'MRU', formula: 's = s₀ + v×t', desc: 'Movimento Retilíneo Uniforme' },
      { nome: 'MRUV — posição', formula: 's = s₀ + v₀t + at²/2', desc: '' },
      { nome: 'MRUV — velocidade', formula: 'v = v₀ + a×t', desc: '' },
      { nome: 'Torricelli', formula: 'v² = v₀² + 2×a×Δs', desc: '' },
      { nome: '2ª Lei de Newton', formula: 'F = m × a', desc: '' },
      { nome: 'Peso', formula: 'P = m × g', desc: 'g ≈ 10 m/s²' },
      { nome: 'Trabalho', formula: 'W = F × d × cos(θ)', desc: '' },
      { nome: 'Energia cinética', formula: 'Ec = m×v² / 2', desc: '' },
      { nome: 'Energia potencial', formula: 'Ep = m × g × h', desc: '' },
      { nome: 'Lei de Ohm', formula: 'V = R × I', desc: '' },
      { nome: 'Potência elétrica', formula: 'P = V × I = R×I²', desc: '' },
      { nome: 'Lei de Coulomb', formula: 'F = k×|q₁×q₂| / d²', desc: 'k = 9×10⁹ N·m²/C²' },
      { nome: 'Velocidade do som/luz', formula: 'v = λ × f', desc: '' },
      { nome: 'Dilatação térmica', formula: 'ΔL = L₀ × α × ΔT', desc: '' },
    ],
    'Química': [
      { nome: 'Número de mol', formula: 'n = m / M', desc: 'm=massa(g), M=massa molar' },
      { nome: 'Número de partículas', formula: 'N = n × Nₐ', desc: 'Nₐ = 6,02×10²³' },
      { nome: 'Densidade', formula: 'ρ = m / V', desc: '' },
      { nome: 'Concentração molar', formula: 'C = n / V', desc: 'V em litros' },
      { nome: 'Concentração comum', formula: 'Cg = m / V', desc: 'g/L' },
      { nome: 'pH', formula: 'pH = -log[H⁺]', desc: '' },
      { nome: 'pOH', formula: 'pOH = -log[OH⁻]', desc: '' },
      { nome: 'pH + pOH', formula: 'pH + pOH = 14', desc: 'a 25°C' },
      { nome: 'Lei dos gases (Clapeyron)', formula: 'PV = nRT', desc: 'R = 8,314 J/(mol·K)' },
      { nome: 'Lei de Gay-Lussac', formula: 'P₁/T₁ = P₂/T₂', desc: 'Volume constante' },
      { nome: 'Lei de Boyle', formula: 'P₁×V₁ = P₂×V₂', desc: 'Temperatura constante' },
      { nome: 'Rendimento', formula: 'η = (produto real / teórico) × 100%', desc: '' },
    ],
    'Física Moderna': [
      { nome: 'Energia de fóton', formula: 'E = h × f', desc: 'h = 6,626×10⁻³⁴ J·s' },
      { nome: 'Einstein — massa-energia', formula: 'E = m × c²', desc: 'c = 3×10⁸ m/s' },
      { nome: 'De Broglie', formula: 'λ = h / (m×v)', desc: '' },
      { nome: 'Efeito fotoelétrico', formula: 'E = hf - φ', desc: 'φ = função trabalho' },
    ],
    'Trigonometria': [
      { nome: 'Seno', formula: 'sen(θ) = cateto oposto / hipotenusa', desc: '' },
      { nome: 'Cosseno', formula: 'cos(θ) = cateto adjacente / hipotenusa', desc: '' },
      { nome: 'Tangente', formula: 'tg(θ) = sen(θ) / cos(θ)', desc: '' },
      { nome: 'Identidade fundamental', formula: 'sen²(θ) + cos²(θ) = 1', desc: '' },
      { nome: 'Lei dos senos', formula: 'a/sen(A) = b/sen(B) = c/sen(C)', desc: '' },
      { nome: 'Lei dos cossenos', formula: 'a² = b²+c²-2bc×cos(A)', desc: '' },
      { nome: 'Arco duplo — seno', formula: 'sen(2θ) = 2×sen(θ)×cos(θ)', desc: '' },
      { nome: 'Arco duplo — cosseno', formula: 'cos(2θ) = cos²(θ)-sen²(θ)', desc: '' },
    ],
    'Estatística': [
      { nome: 'Média', formula: 'x̄ = Σxᵢ / n', desc: '' },
      { nome: 'Mediana', formula: 'Valor central dos dados ordenados', desc: '' },
      { nome: 'Variância', formula: 'σ² = Σ(xᵢ-x̄)² / n', desc: '' },
      { nome: 'Desvio padrão', formula: 'σ = √(variância)', desc: '' },
      { nome: 'Coef. de variação', formula: 'CV = (σ / x̄) × 100%', desc: '' },
      { nome: 'Probabilidade', formula: 'P(A) = casos favoráveis / total', desc: '' },
    ],
    'Geometria Espacial': [
      { nome: 'Volume do cubo', formula: 'V = a³', desc: '' },
      { nome: 'Volume do paralelepípedo', formula: 'V = a × b × c', desc: '' },
      { nome: 'Volume da esfera', formula: 'V = (4/3) × π × r³', desc: '' },
      { nome: 'Área da esfera', formula: 'A = 4 × π × r²', desc: '' },
      { nome: 'Volume do cilindro', formula: 'V = π × r² × h', desc: '' },
      { nome: 'Volume do cone', formula: 'V = (1/3) × π × r² × h', desc: '' },
      { nome: 'Volume da pirâmide', formula: 'V = (1/3) × A_base × h', desc: '' },
    ],
  };


  function openPanel(aba) {
    var old = document.getElementById('extras-panel');
    if (old) { old.remove(); return; }

    var panel = document.createElement('div');
    panel.id = 'extras-panel';
    panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.75);z-index:9998;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(6px);';
    panel.innerHTML = buildPanel();
    document.body.appendChild(panel);
    panel.addEventListener('click', function(e) { if (e.target === panel) closePanel(); });
    switchAba(aba || 'rascunho');

  
    var ta = document.getElementById('rascunho-textarea');
    if (ta) ta.value = rascunhoTexto;
  }

  function closePanel() {
    var p = document.getElementById('extras-panel');
    if (p) p.remove();
  }

  function buildPanel() {
    var h = '<div style="background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:20px;width:100%;max-width:720px;max-height:90vh;display:flex;flex-direction:column;box-shadow:0 24px 64px rgba(0,0,0,0.6);overflow:hidden;">';

    
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">';
    h += '<h2 style="font-family:var(--font-display,serif);font-size:20px;color:var(--text-0,#f0e8df);margin:0;">&#128295; Ferramentas R&aacute;pidas</h2>';
    h += '<button onclick="FerramentasExtras.closePanel()" style="background:none;border:none;color:var(--text-2,#8a7a6a);cursor:pointer;font-size:22px;line-height:1;padding:4px;">&times;</button>';
    h += '</div>';

    
    h += '<div style="display:flex;border-bottom:1px solid var(--border,#3a3228);flex-shrink:0;">';
    h += abaBtn('rascunho', '&#9997; Rascunho');
    h += abaBtn('calc', '&#129518; Calculadora');
    h += abaBtn('formulas', '&#128218; F&oacute;rmulas');
    h += '</div>';

    
    h += '<div style="flex:1;overflow:hidden;display:flex;flex-direction:column;">';
    h += buildRascunho();
    h += buildCalc();
    h += buildFormulas();
    h += '</div>';

    h += '</div>';
    return h;
  }

  function abaBtn(id, label) {
    return '<button id="extras-tab-' + id + '" onclick="FerramentasExtras.switchAba(\'' + id + '\')" style="flex:1;padding:13px 8px;border:none;cursor:pointer;font-size:13px;font-weight:600;background:transparent;color:var(--text-2,#8a7a6a);border-bottom:2px solid transparent;">' + label + '</button>';
  }

  function switchAba(id) {
    ['rascunho','calc','formulas'].forEach(function(t) {
      var btn = document.getElementById('extras-tab-' + t);
      var content = document.getElementById('extras-content-' + t);
      var active = t === id;
      if (btn) {
        btn.style.background = active ? 'var(--accent,#e8a04a)' : 'transparent';
        btn.style.color = active ? 'var(--bg-0,#0f0d0a)' : 'var(--text-2,#8a7a6a)';
        btn.style.borderBottom = active ? '2px solid var(--accent,#e8a04a)' : '2px solid transparent';
      }
      if (content) content.style.display = active ? 'flex' : 'none';
    });
  }

  function buildRascunho() {
    var h = '<div id="extras-content-rascunho" style="display:none;flex-direction:column;flex:1;overflow:hidden;">';
    h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 16px;border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;">';
    h += '<span style="font-size:12px;color:var(--text-2,#8a7a6a);">Salvo automaticamente &bull; persiste entre sess&otilde;es</span>';
    h += '<div style="display:flex;gap:8px;">';
    h += '<button onclick="FerramentasExtras.copiarRascunho()" style="padding:5px 12px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:6px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;">&#128203; Copiar</button>';
    h += '<button onclick="FerramentasExtras.limparRascunho()" style="padding:5px 12px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:6px;font-size:12px;color:var(--text-1,#c8b89a);cursor:pointer;">&#128465; Limpar</button>';
    h += '</div></div>';
    h += '<textarea id="rascunho-textarea" placeholder="Anote aqui qualquer coisa... ideias, cálculos, lembretes. Tudo é salvo automaticamente." oninput="FerramentasExtras.salvarRascunho()" style="flex:1;background:var(--bg-1,#120f0c);border:none;padding:20px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;resize:none;line-height:1.7;font-family:var(--font-body,sans-serif);"></textarea>';
    h += '</div>';
    return h;
  }

  function salvarRascunho() {
    var ta = document.getElementById('rascunho-textarea');
    if (!ta) return;
    rascunhoTexto = ta.value;
    localStorage.setItem('studysync_rascunho', rascunhoTexto);
  }

  function copiarRascunho() {
    var ta = document.getElementById('rascunho-textarea');
    if (!ta || !ta.value.trim()) return;
    navigator.clipboard.writeText(ta.value).then(function() {
      if (typeof App !== 'undefined') App.toast('Rascunho copiado!', 'success');
    });
  }

  function limparRascunho() {
    if (!confirm('Apagar todo o rascunho?')) return;
    var ta = document.getElementById('rascunho-textarea');
    if (ta) ta.value = '';
    rascunhoTexto = '';
    localStorage.removeItem('studysync_rascunho');
  }


  function buildCalc() {
    var h = '<div id="extras-content-calc" style="display:none;flex-direction:row;flex:1;overflow:hidden;">';

    
    h += '<div style="flex:1;display:flex;flex-direction:column;padding:16px;gap:10px;">';

    h += '<div style="background:var(--bg-0,#0f0d0a);border:1px solid var(--border,#3a3228);border-radius:12px;padding:14px 18px;text-align:right;">';
    h += '<div id="calc-expressao" style="font-size:12px;color:var(--text-2,#8a7a6a);min-height:18px;font-family:monospace;word-break:break-all;"></div>';
    h += '<div id="calc-display" style="font-size:32px;font-weight:700;color:var(--text-0,#f0e8df);font-family:monospace;word-break:break-all;">0</div>';
    h += '</div>';

    h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">';
    var btns = [
      ['sin(', 'SIN', 'sci'], ['cos(', 'COS', 'sci'], ['tan(', 'TAN', 'sci'], ['log(', 'LOG', 'sci'], ['ln(', 'LN', 'sci'],
      ['(', '(', 'op'], [')', ')', 'op'], ['Math.PI', 'π', 'sci'], ['Math.E', 'e', 'sci'], ['**', 'xʸ', 'op'],
      ['Math.sqrt(', '√', 'sci'], ['Math.abs(', '|x|', 'sci'], ['%', '%', 'op'], ['1/', '1/x', 'sci'], ['C', 'C', 'clear'],
    ];
    btns.forEach(function(b) {
      h += calcBtn(b[0], b[1], b[2]);
    });
    h += '</div>';

    
    h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;">';
    var nums = [
      ['7','7','num'],['8','8','num'],['9','9','num'],['/','÷','op'],
      ['4','4','num'],['5','5','num'],['6','6','num'],['*','×','op'],
      ['1','1','num'],['2','2','num'],['3','3','num'],['-','-','op'],
      ['0','0','num'],['.','.','num'],['⌫','⌫','del'],['+','+','op'],
      ['=','=','eq'],
    ];
    nums.forEach(function(b) {
      if (b[0] === '=') {
        h += '<button onclick="FerramentasExtras.calcInput(\'=\')" style="grid-column:span 4;padding:14px;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border:none;border-radius:10px;font-size:18px;font-weight:700;cursor:pointer;">=</button>';
      } else {
        h += calcBtn(b[0], b[1], b[2]);
      }
    });
    h += '</div>';
    h += '</div>';


    h += '<div style="width:180px;border-left:1px solid var(--border,#3a3228);display:flex;flex-direction:column;overflow:hidden;">';
    h += '<div style="padding:12px 14px;font-size:11px;font-weight:600;color:var(--text-2,#8a7a6a);text-transform:uppercase;letter-spacing:.08em;border-bottom:1px solid var(--border,#3a3228);display:flex;justify-content:space-between;align-items:center;">Hist&oacute;rico<button onclick="FerramentasExtras.limparHistorico()" style="background:none;border:none;color:var(--text-3,#5a4a3a);cursor:pointer;font-size:11px;">limpar</button></div>';
    h += '<div id="calc-historico" style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px;font-size:12px;font-family:monospace;color:var(--text-1,#c8b89a);"></div>';
    h += '</div>';

    h += '</div>';
    return h;
  }

  function calcBtn(val, label, tipo) {
    var bg = tipo === 'num' ? 'var(--bg-3,#211d18)' : tipo === 'op' ? 'var(--bg-4,#2a2218)' : tipo === 'sci' ? 'rgba(122,158,126,0.15)' : tipo === 'clear' ? 'rgba(224,112,96,0.2)' : tipo === 'del' ? 'rgba(232,160,74,0.15)' : 'var(--bg-3)';
    var color = tipo === 'clear' ? '#e07060' : tipo === 'del' ? 'var(--accent,#e8a04a)' : 'var(--text-0,#f0e8df)';
    return '<button onclick="FerramentasExtras.calcInput(\'' + val.replace(/'/g, "\\'") + '\')" style="padding:10px 4px;background:' + bg + ';color:' + color + ';border:1px solid var(--border,#3a3228);border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:opacity 0.1s;" onmouseover="this.style.opacity=\'0.75\'" onmouseout="this.style.opacity=\'1\'">' + label + '</button>';
  }

  function calcInput(val) {
    var display = document.getElementById('calc-display');
    var exprEl = document.getElementById('calc-expressao');

    if (val === 'C') {
      calcExpressao = '';
      calcDisplay = '0';
    } else if (val === '⌫') {
      calcExpressao = calcExpressao.slice(0, -1);
      calcDisplay = calcExpressao || '0';
    } else if (val === '=') {
      if (!calcExpressao) return;
      try {
        var expr = calcExpressao
          .replace(/Math\.PI/g, Math.PI)
          .replace(/Math\.E/g, Math.E)
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/Math\.sqrt\(/g, 'Math.sqrt(')
          .replace(/Math\.abs\(/g, 'Math.abs(')
          .replace(/1\//g, '1/');
        var resultado = Function('"use strict"; return (' + expr + ')')();
        resultado = Math.round(resultado * 1e10) / 1e10;
      
        calcHistorico.unshift(calcExpressao + ' = ' + resultado);
        if (calcHistorico.length > 20) calcHistorico.pop();
        renderHistorico();
        if (exprEl) exprEl.textContent = calcExpressao + ' =';
        calcExpressao = String(resultado);
        calcDisplay = String(resultado);
      } catch(e) {
        calcDisplay = 'Erro';
        calcExpressao = '';
      }
    } else {
      if (calcDisplay === 'Erro') { calcExpressao = ''; }
      calcExpressao += val;
      calcDisplay = calcExpressao;
      if (exprEl) exprEl.textContent = '';
    }

    if (display) display.textContent = calcDisplay;
  }

  function renderHistorico() {
    var el = document.getElementById('calc-historico');
    if (!el) return;
    el.innerHTML = calcHistorico.map(function(h) {
      return '<div style="padding:4px 6px;background:var(--bg-3,#211d18);border-radius:4px;cursor:pointer;word-break:break-all;" onclick="FerramentasExtras.usarHistorico(\'' + h.split(' = ')[1] + '\')">' + h + '</div>';
    }).join('');
  }

  function usarHistorico(val) {
    calcExpressao = val;
    calcDisplay = val;
    var display = document.getElementById('calc-display');
    if (display) display.textContent = val;
    var exprEl = document.getElementById('calc-expressao');
    if (exprEl) exprEl.textContent = '';
  }

  function limparHistorico() {
    calcHistorico = [];
    renderHistorico();
  }

  function buildFormulas() {
    var materias = Object.keys(FORMULAS);
    var h = '<div id="extras-content-formulas" style="display:none;flex-direction:column;flex:1;overflow:hidden;">';

    h += '<div style="padding:12px 16px;border-bottom:1px solid var(--border,#3a3228);background:var(--bg-3,#211d18);flex-shrink:0;display:flex;gap:10px;align-items:center;">';
    h += '<select id="formulas-materia" onchange="FerramentasExtras.renderFormulas()" style="flex:1;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:8px;padding:9px 12px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;">';
    materias.forEach(function(m) {
      h += '<option value="' + m + '">' + m + '</option>';
    });
    h += '</select>';
    h += '<input id="formulas-busca" type="text" placeholder="Buscar fórmula..." oninput="FerramentasExtras.renderFormulas()" style="flex:1;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:8px;padding:9px 12px;font-size:14px;color:var(--text-0,#f0e8df);outline:none;" />';
    h += '</div>';

    h += '<div id="formulas-lista" style="flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px;"></div>';
    h += '</div>';
    return h;
  }

  function renderFormulas() {
    var materia = (document.getElementById('formulas-materia') || {}).value || 'Matemática';
    var busca = ((document.getElementById('formulas-busca') || {}).value || '').toLowerCase();
    var lista = document.getElementById('formulas-lista');
    if (!lista) return;

    var items = FORMULAS[materia] || [];
    if (busca) {
      items = items.filter(function(f) {
        return f.nome.toLowerCase().includes(busca) || f.formula.toLowerCase().includes(busca);
      });
    }

    if (items.length === 0) {
      lista.innerHTML = '<div style="text-align:center;color:var(--text-2,#8a7a6a);padding:40px;font-size:14px;">Nenhuma fórmula encontrada.</div>';
      return;
    }

    lista.innerHTML = items.map(function(f) {
      var h = '<div style="background:var(--bg-3,#211d18);border:1px solid var(--border,#3a3228);border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:14px;">';
      h += '<div style="flex:1;">';
      h += '<div style="font-size:13px;font-weight:600;color:var(--text-0,#f0e8df);margin-bottom:4px;">' + f.nome + '</div>';
      h += '<div style="font-size:15px;font-family:monospace;color:var(--accent,#e8a04a);font-weight:500;">' + f.formula + '</div>';
      if (f.desc) h += '<div style="font-size:11px;color:var(--text-2,#8a7a6a);margin-top:3px;">' + f.desc + '</div>';
      h += '</div>';
      h += '<button onclick="navigator.clipboard.writeText(\'' + f.formula.replace(/'/g, "\\'") + '\').then(function(){if(typeof App!==\'undefined\')App.toast(\'Copiado!\',\'success\')})" style="padding:6px 10px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:6px;font-size:11px;color:var(--text-2,#8a7a6a);cursor:pointer;flex-shrink:0;">&#128203;</button>';
      h += '</div>';
      return h;
    }).join('');
  }

 
  function addBotaoFlutuante() {
    console.log('FerramentasExtras: Tentando adicionar botão flutuante FAB.');
    if (document.getElementById('extras-fab')) return;
    var fab = document.createElement('div');
    fab.id = 'extras-fab';
    fab.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9000;display:flex;flex-direction:column;gap:8px;align-items:flex-end;';

    var btn = document.createElement('button');
    btn.style.cssText = 'width:52px;height:52px;border-radius:50%;background:var(--accent,#e8a04a);color:var(--bg-0,#0f0d0a);border:none;cursor:pointer;font-size:22px;box-shadow:0 4px 20px rgba(232,160,74,0.4);display:flex;align-items:center;justify-content:center;transition:transform 0.2s;';
    btn.innerHTML = '&#128295;';
    btn.title = 'Ferramentas Rápidas';
    btn.onmouseover = function() { btn.style.transform = 'scale(1.1)'; };
    btn.onmouseout = function() { btn.style.transform = 'scale(1)'; };

    var menu = document.createElement('div');
    menu.id = 'extras-fab-menu';
    menu.style.cssText = 'display:none;flex-direction:column;gap:6px;align-items:flex-end;'; 
    menu.innerHTML =
      '<button onclick="FerramentasExtras.openPanel(\'rascunho\')" style="padding:8px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:20px;color:var(--text-0,#f0e8df);font-size:13px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);">&#9997; Rascunho</button>' +
      '<button onclick="FerramentasExtras.openPanel(\'calc\')" style="padding:8px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:20px;color:var(--text-0,#f0e8df);font-size:13px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);">&#129518; Calculadora</button>' +
      '<button onclick="FerramentasExtras.openPanel(\'formulas\')" style="padding:8px 14px;background:var(--bg-2,#1a1612);border:1px solid var(--border,#3a3228);border-radius:20px;color:var(--text-0,#f0e8df);font-size:13px;cursor:pointer;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);">&#128218; F&oacute;rmulas</button>';
    console.log('FerramentasExtras: #extras-fab-menu innerHTML set.');
    console.log('FerramentasExtras: #extras-fab-menu appended to #extras-fab.');

    var menuAberto = false;
    btn.onclick = function() {
      menuAberto = !menuAberto;
      menu.style.display = menuAberto ? 'flex' : 'none';
      btn.style.transform = menuAberto ? 'rotate(45deg) scale(1.1)' : 'scale(1)';
    };

    fab.appendChild(menu);
    fab.appendChild(btn);
    document.body.appendChild(fab);

   
    const updateVisibility = () => {
      const login = document.getElementById('screen-login');
      const signup = document.getElementById('auth-sub-signup-container');
      
      const shouldHide = (login && login.classList.contains('active')) || 
                         (signup && signup.classList.contains('visible'));

    
      fab.style.setProperty('display', shouldHide ? 'none' : 'flex', 'important');
    };

  
    const observer = new MutationObserver(() => updateVisibility());
    observer.observe(document.body, { attributes: true, subtree: true });
    
    updateVisibility();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addBotaoFlutuante);
  } else {
    addBotaoFlutuante();
  }

  return {
    openPanel: openPanel,
    closePanel: closePanel,
    switchAba: switchAba,
    salvarRascunho: salvarRascunho,
    copiarRascunho: copiarRascunho,
    limparRascunho: limparRascunho,
    calcInput: calcInput,
    usarHistorico: usarHistorico,
    limparHistorico: limparHistorico,
    renderFormulas: renderFormulas,
  };
})();

window.FerramentasExtras = FerramentasExtras;
