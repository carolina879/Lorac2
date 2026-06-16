

const PlotadorFuncoes = (() => {
  const MODAL_ID = 'modal-plotador-funcoes';

 
  let state = {
    funcoes: [
      { expr: 'x^2 - 4', cor: '#4ade80',  ativa: true,  label: 'f(x)' },
      { expr: '',         cor: '#60a5fa',  ativa: false, label: 'g(x)' },
      { expr: '',         cor: '#f97316',  ativa: false, label: 'h(x)' },
      { expr: '',         cor: '#f472b6',  ativa: false, label: 'p(x)' },
    ],
    view: { xMin: -8, xMax: 8, yMin: -6, yMax: 6 },
    mostrarDerivada: false,
    mostrarRaizes: true,
    mostrarGrade: true,
    arrastar: null,
    canvas: null,
    ctx: null,
  };

  const BIBLIOTECA = {
    '2º Grau': [
      { expr: 'x^2',               nome: 'Parábola básica' },
      { expr: 'x^2 - 4',           nome: 'Raízes em ±2' },
      { expr: '-x^2 + 4*x - 3',    nome: 'Concavidade baixo' },
      { expr: '2*x^2 - 3*x - 2',   nome: 'Coef. a=2' },
      { expr: 'x^2 + 2*x + 1',     nome: 'Trinômio perfeito' },
    ],
    'Trigonométricas': [
      { expr: 'sin(x)',             nome: 'Seno' },
      { expr: 'cos(x)',             nome: 'Cosseno' },
      { expr: 'tan(x)',             nome: 'Tangente' },
      { expr: '2*sin(3*x)',         nome: 'Seno ampliado' },
      { expr: 'sin(x)*cos(x)',      nome: 'Sen·Cos' },
    ],
    'Exponenciais': [
      { expr: '2^x',               nome: 'Base 2' },
      { expr: 'exp(x)',            nome: 'eˣ (base e)' },
      { expr: 'exp(-x)',           nome: 'e⁻ˣ (decaimento)' },
      { expr: '2^(-x^2)',          nome: 'Gaussiana' },
    ],
    'Logarítmicas': [
      { expr: 'log(x)',            nome: 'log₁₀(x)' },
      { expr: 'ln(x)',             nome: 'ln(x)' },
      { expr: 'log(x^2+1)',        nome: 'log(x²+1)' },
    ],
    'Módulo / Raiz': [
      { expr: 'abs(x)',            nome: '|x|' },
      { expr: 'abs(x-2)-1',       nome: '|x-2|-1' },
      { expr: 'sqrt(x)',           nome: '√x' },
      { expr: 'sqrt(4-x^2)',       nome: '½ círculo' },
    ],
    'Racionais': [
      { expr: '1/x',              nome: 'Hipérbole' },
      { expr: '1/(x^2+1)',        nome: 'Lorenziana' },
      { expr: 'x/(x-1)',          nome: 'Racional simples' },
    ],
    'Polinomiais': [
      { expr: 'x^3',              nome: 'Cúbica' },
      { expr: 'x^3 - 3*x',       nome: 'Cúbica c/ máx/mín' },
      { expr: 'x^4 - 4*x^2',     nome: 'Quártica' },
      { expr: '(x-1)*(x+2)*(x-3)',nome: '3 raízes' },
    ],
  };

  function _parse(expr) {
    if (!expr || expr.trim() === '') return null;
    try {
      let e = expr.trim()
        .replace(/\^/g, '**')
        .replace(/(\d)(x)/g, '$1*x')
        .replace(/\)(x)/g, ')*x')
        .replace(/(\d)\(/g, '$1*(')
        .replace(/\bln\b/g, 'Math.log')
        .replace(/\blog\b/g, '_log10')
        .replace(/\bsin\b/g, 'Math.sin')
        .replace(/\bcos\b/g, 'Math.cos')
        .replace(/\btan\b/g, 'Math.tan')
        .replace(/\babs\b/g, 'Math.abs')
        .replace(/\bsqrt\b/g, 'Math.sqrt')
        .replace(/\bexp\b/g, 'Math.exp')
        .replace(/\bpi\b/g, 'Math.PI')
        .replace(/\basin\b/g, 'Math.asin')
        .replace(/\bacos\b/g, 'Math.acos')
        .replace(/\batan\b/g, 'Math.atan')
        .replace(/\bceil\b/g, 'Math.ceil')
        .replace(/\bfloor\b/g, 'Math.floor');

      const testStr = e.replace(/Math\.[a-z]+/g, '').replace(/_log10/g, '').replace(/x/g, '');
      if (/[a-wyzA-WYZ_$]/.test(testStr)) return null;

      const log10fn = (v) => Math.log10(Math.abs(v) || 1e-10);
      const fn = new Function('x', '_log10', `"use strict"; try { return (${e}); } catch(e){ return NaN; }`);
      
      fn(1, log10fn);
      return (x) => {
        try {
          const v = fn(x, log10fn);
          return isFinite(v) ? v : NaN;
        } catch { return NaN; }
      };
    } catch { return null; }
  }

 
  function _encontrarRaizes(fn) {
    if (!fn) return [];
    const raizes = [];
    const { xMin, xMax } = state.view;
    const N = 2000;
    const step = (xMax - xMin) / N;
    let prev = fn(xMin);
    for (let i = 1; i <= N; i++) {
      const x = xMin + i * step;
      const cur = fn(x);
      if (isNaN(prev) || isNaN(cur)) { prev = cur; continue; }
      if (prev * cur < 0) {
        let a = x - step, b = x, fa = prev;
        for (let j = 0; j < 50; j++) {
          const m = (a + b) / 2, fm = fn(m);
          if (isNaN(fm)) break;
          if (Math.abs(fm) < 1e-10) { a = b = m; break; }
          if (fa * fm < 0) { b = m; } else { a = m; fa = fm; }
        }
        const root = (a + b) / 2;
        if (!raizes.some(r => Math.abs(r - root) < 0.01)) raizes.push(root);
      }
      prev = cur;
    }
    return raizes;
  }

  function _encontrarVertice(fn) {
    if (!fn) return null;
    const { xMin, xMax } = state.view;
    const N = 1000;
    const step = (xMax - xMin) / N;
    let bestMin = { x: null, y: Infinity };
    let bestMax = { x: null, y: -Infinity };
    for (let i = 0; i <= N; i++) {
      const x = xMin + i * step;
      const y = fn(x);
      if (isNaN(y)) continue;
      if (y < bestMin.y) { bestMin = { x, y }; }
      if (y > bestMax.y) { bestMax = { x, y }; }
    }
    
    const range = bestMax.y - bestMin.y;
    if (range < 0.1) return null;
    const useMax = Math.abs(bestMax.y) > Math.abs(bestMin.y) * 1.5;
    const vert = useMax ? bestMax : bestMin;
    if (vert.x === null) return null;

    let lo = Math.max(xMin, vert.x - step * 5), hi = Math.min(xMax, vert.x + step * 5);
    for (let j = 0; j < 60; j++) {
      const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3;
      const f1 = fn(m1), f2 = fn(m2);
      if (useMax) { if (f1 > f2) hi = m2; else lo = m1; }
      else        { if (f1 < f2) hi = m2; else lo = m1; }
    }
    const xOpt = (lo + hi) / 2;
    const h = 1e-5;
    const d2 = (fn(xOpt + h) - 2 * fn(xOpt) + fn(xOpt - h)) / (h * h);
    return { x: xOpt, y: fn(xOpt), tipo: d2 > 0 ? 'mín' : 'máx' };
  }

  function _derivada(fn, x) {
    const h = 1e-6;
    return (fn(x + h) - fn(x - h)) / (2 * h);
  }

 
  function _toCanvas(x, y) {
    const c = state.canvas;
    const { xMin, xMax, yMin, yMax } = state.view;
    return {
      cx: ((x - xMin) / (xMax - xMin)) * c.width,
      cy: c.height - ((y - yMin) / (yMax - yMin)) * c.height,
    };
  }

  function _fromCanvas(cx, cy) {
    const c = state.canvas;
    const { xMin, xMax, yMin, yMax } = state.view;
    return {
      x: (cx / c.width)  * (xMax - xMin) + xMin,
      y: (1 - cy / c.height) * (yMax - yMin) + yMin,
    };
  }

  function _niceStep(raw) {
    const p = Math.pow(10, Math.floor(Math.log10(Math.abs(raw) || 1)));
    const f = raw / p;
    if (f < 1.5) return p;
    if (f < 3.5) return 2 * p;
    if (f < 7.5) return 5 * p;
    return 10 * p;
  }

  function _fmt(v) {
    if (Math.abs(v) < 1e-9) return '0';
    if (Math.abs(v) >= 10000 || (Math.abs(v) < 0.001 && v !== 0)) return v.toExponential(2);
    return parseFloat(v.toFixed(4)).toString();
  }

 
  function _draw() {
    const canvas = state.canvas;
    if (!canvas) return;
    const ctx = state.ctx;
    const W = canvas.width, H = canvas.height;
    const { xMin, xMax, yMin, yMax } = state.view;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, W, H);

    const xStep = _niceStep((xMax - xMin) / 8);
    const yStep = _niceStep((yMax - yMin) / 6);
    const xStart = Math.ceil(xMin / xStep) * xStep;
    const yStart = Math.ceil(yMin / yStep) * yStep;


    if (state.mostrarGrade) {
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      for (let x = xStart; x <= xMax + xStep * 0.01; x += xStep) {
        const { cx } = _toCanvas(x, 0);
        ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();
      }
      for (let y = yStart; y <= yMax + yStep * 0.01; y += yStep) {
        const { cy } = _toCanvas(0, y);
        ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
      }
    }

    const orig = _toCanvas(0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    if (orig.cy >= 0 && orig.cy <= H) {
      ctx.beginPath(); ctx.moveTo(0, orig.cy); ctx.lineTo(W, orig.cy); ctx.stroke();
    }
    if (orig.cx >= 0 && orig.cx <= W) {
      ctx.beginPath(); ctx.moveTo(orig.cx, 0); ctx.lineTo(orig.cx, H); ctx.stroke();
    }


    ctx.font = '10px DM Mono, monospace';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    for (let x = xStart; x <= xMax + xStep * 0.01; x += xStep) {
      if (Math.abs(x) < xStep * 0.05) continue;
      const { cx, cy } = _toCanvas(x, 0);
      const labelY = Math.min(H - 4, Math.max(14, cy + 14));
      ctx.fillText(_fmt(x), cx, labelY);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(cx - 0.5, cy - 3, 1, 6);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
    }
    ctx.textAlign = 'right';
    for (let y = yStart; y <= yMax + yStep * 0.01; y += yStep) {
      if (Math.abs(y) < yStep * 0.05) continue;
      const { cx, cy } = _toCanvas(0, y);
      const labelX = Math.min(W - 4, Math.max(26, cx - 4));
      ctx.fillText(_fmt(y), labelX, cy + 3);
    }

    const N = W * 2;
    state.funcoes.forEach(({ expr, cor, ativa }) => {
      if (!ativa || !expr.trim()) return;
      const fn = _parse(expr);
      if (!fn) return;

      
      _drawCurve(ctx, fn, cor, 2.5, W, H, N, false);

      
      if (state.mostrarDerivada) {
        ctx.setLineDash([5, 4]);
        _drawCurve(ctx, (x) => _derivada(fn, x), cor + '80', 1.5, W, H, N, false);
        ctx.setLineDash([]);
      }

   
      if (state.mostrarRaizes) {
        const raizes = _encontrarRaizes(fn);
        raizes.forEach(rx => {
          const { cx, cy } = _toCanvas(rx, 0);
          if (cx < -10 || cx > W + 10) return;
          ctx.shadowBlur = 14; ctx.shadowColor = cor;
          ctx.fillStyle = cor;
          ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#020617';
          ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = cor;
          ctx.font = 'bold 10px DM Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(_fmt(rx), cx, cy - 11);
        });

      
        const vert = _encontrarVertice(fn);
        if (vert) {
          const { cx, cy } = _toCanvas(vert.x, vert.y);
          if (cx >= 0 && cx <= W && cy >= 0 && cy <= H) {
            ctx.shadowBlur = 16; ctx.shadowColor = cor;
            ctx.fillStyle = cor;
            ctx.beginPath(); ctx.arc(cx, cy, 7, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#020617';
            ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = cor;
            ctx.font = 'bold 10px DM Mono, monospace';
            ctx.textAlign = 'left';
            ctx.fillText(`${vert.tipo}(${_fmt(vert.x)}, ${_fmt(vert.y)})`, cx + 10, cy - 6);
          }
        }
      }
    });


    if (orig.cx >= 0 && orig.cx <= W && orig.cy >= 0 && orig.cy <= H) {
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath(); ctx.arc(orig.cx, orig.cy, 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px DM Mono'; ctx.textAlign = 'left';
      ctx.fillText('O', orig.cx + 4, orig.cy - 4);
    }
  }

  function _drawCurve(ctx, fn, cor, lw, W, H, N, dash) {
    const { xMin, xMax, yMin, yMax } = state.view;
    ctx.strokeStyle = cor;
    ctx.lineWidth = lw;
    ctx.shadowBlur = lw > 2 ? 8 : 0;
    ctx.shadowColor = cor;
    ctx.beginPath();
    let penDown = false;
    let prevY = NaN;
    for (let i = 0; i <= N; i++) {
      const x = xMin + (i / N) * (xMax - xMin);
      const y = fn(x);
      if (isNaN(y) || !isFinite(y)) { penDown = false; prevY = NaN; continue; }
      if (!isNaN(prevY) && Math.abs(y - prevY) > (yMax - yMin) * 0.75) {
        penDown = false;
      }
      const { cx, cy } = _toCanvas(x, y);
      if (!penDown) { ctx.moveTo(cx, cy); penDown = true; }
      else ctx.lineTo(cx, cy);
      prevY = y;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }


  function abrir() {
    document.getElementById(MODAL_ID)?.remove();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText = `
      position:fixed;inset:0;z-index:100015;
      background:rgba(3,6,16,0.97);
      display:flex;align-items:center;justify-content:center;
      backdrop-filter:blur(14px);
      animation:pfFadeIn 0.3s ease;
      font-family:'DM Sans',sans-serif;
    `;

    modal.innerHTML = `
      <style>
        @keyframes pfFadeIn { from{opacity:0;transform:scale(0.97)} to{opacity:1;transform:scale(1)} }
        #pf-box {
          width:96vw;max-width:1320px;height:92vh;
          background:linear-gradient(140deg,#060d1e 0%,#0b1426 100%);
          border:1px solid rgba(255,255,255,0.07);
          border-radius:20px;display:flex;flex-direction:column;overflow:hidden;
          box-shadow:0 60px 140px rgba(0,0,0,0.95),0 0 0 1px rgba(255,255,255,0.02) inset;
        }
        .pf-header {
          padding:13px 20px;
          background:linear-gradient(90deg,rgba(74,222,128,0.06),transparent 60%);
          border-bottom:1px solid rgba(255,255,255,0.05);
          display:flex;align-items:center;justify-content:space-between;flex-shrink:0;
        }
        .pf-body { flex:1;display:flex;overflow:hidden;min-height:0; }


        .pf-sidebar {
          width:285px;flex-shrink:0;
          background:rgba(0,0,0,0.18);
          border-right:1px solid rgba(255,255,255,0.05);
          display:flex;flex-direction:column;
        }
        .pf-stabs {
          display:flex;border-bottom:1px solid rgba(255,255,255,0.05);flex-shrink:0;
        }
        .pf-stab {
          flex:1;padding:10px 4px;border:none;background:transparent;
          color:#3d4f6a;cursor:pointer;font-size:11px;font-weight:700;
          letter-spacing:0.3px;transition:0.2s;border-bottom:2px solid transparent;
        }
        .pf-stab.active { color:#4ade80;border-bottom-color:#4ade80; }
        .pf-stab:hover:not(.active) { color:#64748b; }
        .pf-sidebar-body { flex:1;overflow-y:auto;padding:14px;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.08) transparent; }

        .pf-main { flex:1;display:flex;flex-direction:column;min-width:0; }
        .pf-canvas-wrap { flex:1;position:relative;cursor:crosshair;overflow:hidden; }
        #pf-canvas { width:100%;height:100%;display:block; }
        .pf-toolbar {
          padding:9px 16px;border-top:1px solid rgba(255,255,255,0.05);
          display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex-shrink:0;
          background:rgba(0,0,0,0.12);
        }

        .pf-toggle {
          display:flex;align-items:center;gap:5px;cursor:pointer;
          font-size:11px;color:#3d4f6a;font-weight:600;user-select:none;
          padding:5px 9px;border-radius:7px;transition:0.2s;
          border:1px solid transparent;
        }
        .pf-toggle:hover { color:#64748b;background:rgba(255,255,255,0.03); }
        .pf-toggle.on { color:#4ade80;border-color:rgba(74,222,128,0.18);background:rgba(74,222,128,0.05); }
        .pf-tog-dot { width:9px;height:9px;border-radius:50%;border:1.5px solid currentColor;flex-shrink:0;transition:0.2s; }
        .pf-tog-dot.on { background:currentColor; }


        .pf-zbtn {
          background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);
          color:#94a3b8;width:29px;height:29px;border-radius:7px;cursor:pointer;
          font-size:15px;display:flex;align-items:center;justify-content:center;transition:0.2s;
        }
        .pf-zbtn:hover { background:rgba(255,255,255,0.1);color:#e2e8f0; }

  
        .pf-fn-row {
          display:flex;align-items:center;gap:8px;
          padding:9px 11px;border-radius:10px;
          background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.055);
          margin-bottom:7px;transition:0.2s;
        }
        .pf-fn-row:focus-within { border-color:rgba(74,222,128,0.22);background:rgba(74,222,128,0.035); }
        .pf-fn-dot { width:11px;height:11px;border-radius:50%;flex-shrink:0;cursor:pointer;transition:0.2s; }
        .pf-fn-dot.off { opacity:0.3; }
        .pf-fn-label { font-size:11px;color:#3d4f6a;font-weight:700;font-family:'DM Mono',monospace;flex-shrink:0; }
        .pf-fn-input {
          flex:1;background:transparent;border:none;outline:none;
          color:#e2e8f0;font-size:13px;font-family:'DM Mono',monospace;min-width:0;
        }
        .pf-fn-input::placeholder { color:#243040; }
        .pf-fn-err { border-color:rgba(239,68,68,0.3) !important; }
        .pf-fn-clr { background:transparent;border:none;color:#243040;cursor:pointer;font-size:15px;padding:0 2px;transition:0.2s; }
        .pf-fn-clr:hover { color:#64748b; }

  
        .pf-lbl { font-size:10px;color:#3d4f6a;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:8px; }

        .pf-lib-cat { margin-bottom:14px; }
        .pf-lib-item {
          display:flex;justify-content:space-between;align-items:center;
          padding:6px 10px;border-radius:7px;cursor:pointer;
          background:rgba(255,255,255,0.02);border:1px solid transparent;
          margin-bottom:3px;transition:0.15s;
        }
        .pf-lib-item:hover { background:rgba(74,222,128,0.07);border-color:rgba(74,222,128,0.12); }
        .pf-lib-expr { font-family:'DM Mono',monospace;font-size:11px;color:#7a9ab8; }
        .pf-lib-nome { font-size:10px;color:#3d4f6a; }

        
        .pf-arow {
          display:flex;justify-content:space-between;padding:5px 0;
          border-bottom:1px solid rgba(255,255,255,0.04);font-size:11px;
        }
        .pf-albl { color:#4a6080; }
        .pf-aval { color:#4ade80;font-family:'DM Mono',monospace; }

       
        .pf-tbl { width:100%;border-collapse:collapse;font-size:11px; }
        .pf-tbl th { color:#3d4f6a;font-weight:700;text-align:right;padding:4px 8px;border-bottom:1px solid rgba(255,255,255,0.06); }
        .pf-tbl td { text-align:right;padding:4px 8px;font-family:'DM Mono',monospace;border-bottom:1px solid rgba(255,255,255,0.03); }
        .pf-tbl tr:hover td { background:rgba(255,255,255,0.025); }

        .pf-view-inp {
          width:100%;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);
          border-radius:6px;padding:5px 8px;color:#e2e8f0;font-size:12px;
          font-family:'DM Mono',monospace;outline:none;box-sizing:border-box;
        }
        .pf-view-inp:focus { border-color:rgba(74,222,128,0.25); }


        #pf-coord {
          position:absolute;bottom:10px;right:10px;
          background:rgba(0,0,0,0.72);border:1px solid rgba(255,255,255,0.07);
          border-radius:7px;padding:5px 12px;font-family:'DM Mono',monospace;
          font-size:10px;color:#64748b;pointer-events:none;backdrop-filter:blur(8px);
        }

        .pf-btn {
          width:100%;padding:8px;background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.07);border-radius:8px;
          color:#64748b;font-size:11px;font-weight:700;cursor:pointer;transition:0.2s;
        }
        .pf-btn:hover { background:rgba(255,255,255,0.08);color:#94a3b8; }
        .pf-btn-green {
          background:rgba(74,222,128,0.07);border-color:rgba(74,222,128,0.15);
          color:#4ade80;
        }
        .pf-btn-green:hover { background:rgba(74,222,128,0.14); }
      </style>

      <div id="pf-box">

        <div class="pf-header">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#4ade80,#22d3ee);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">📈</div>
            <div>
              <div style="font-size:16px;font-weight:700;color:#f1f5f9;font-family:'DM Serif Display',serif;">Plotador de Funções</div>
              <div style="font-size:10px;color:#3d4f6a;margin-top:1px;">Scroll = zoom · Arrastar = pan · Biblioteca = inserir exemplos</div>
            </div>
          </div>
          <button onclick="PlotadorFuncoes.fechar()" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);color:#64748b;padding:7px 14px;border-radius:8px;cursor:pointer;font-size:13px;transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.09)'" onmouseout="this.style.background='rgba(255,255,255,0.04)'">✕ Fechar</button>
        </div>

       
        <div class="pf-body">
          
          <div class="pf-sidebar">
            <div class="pf-stabs">
              <button class="pf-stab active" id="pftab-funcoes"    onclick="PlotadorFuncoes._setSTAB('funcoes')">Funções</button>
              <button class="pf-stab"         id="pftab-biblioteca" onclick="PlotadorFuncoes._setSTAB('biblioteca')">Biblioteca</button>
              <button class="pf-stab"         id="pftab-analise"    onclick="PlotadorFuncoes._setSTAB('analise')">Análise</button>
            </div>
            <div class="pf-sidebar-body" id="pf-sb-body"></div>
          </div>


          <div class="pf-main">
            <div class="pf-canvas-wrap" id="pf-canvas-wrap">
              <canvas id="pf-canvas"></canvas>
              <div id="pf-coord">x: 0.000 · y: 0.000</div>
            </div>
            <div class="pf-toolbar">
              <button class="pf-zbtn" onclick="PlotadorFuncoes._zoom(0.72)" title="Zoom In">＋</button>
              <button class="pf-zbtn" onclick="PlotadorFuncoes._zoom(1.38)" title="Zoom Out">－</button>
              <button class="pf-zbtn" onclick="PlotadorFuncoes._resetView()" title="Reset" style="font-size:12px;">⌂</button>
              <div style="width:1px;height:18px;background:rgba(255,255,255,0.06);margin:0 2px;"></div>
              <div class="pf-toggle on" id="tog-grade"   onclick="PlotadorFuncoes._toggle('mostrarGrade')">   <span class="pf-tog-dot on" id="tdot-grade"></span>   Grade</div>
              <div class="pf-toggle on" id="tog-raizes"  onclick="PlotadorFuncoes._toggle('mostrarRaizes')">  <span class="pf-tog-dot on" id="tdot-raizes"></span>  Raízes/Vértice</div>
              <div class="pf-toggle"    id="tog-deriv"   onclick="PlotadorFuncoes._toggle('mostrarDerivada')"><span class="pf-tog-dot"    id="tdot-deriv"></span>   f'(x) Derivada</div>
              <div style="flex:1;"></div>
              <div id="pf-view-label" style="font-size:10px;color:#243040;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    _setupCanvas();
    _setSTAB('funcoes');
    _updateViewLabel();
  }

  function _setupCanvas() {
    const canvas = document.getElementById('pf-canvas');
    const wrap   = document.getElementById('pf-canvas-wrap');
    if (!canvas || !wrap) return;
    state.canvas = canvas;
    state.ctx    = canvas.getContext('2d');

    function resize() {
      canvas.width  = wrap.clientWidth;
      canvas.height = wrap.clientHeight;
      _draw();
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    canvas.addEventListener('mousedown', e => {
      state.arrastar = { x: e.clientX, y: e.clientY, view: { ...state.view } };
    });
    canvas.addEventListener('mousemove', e => {
      const { x, y } = _fromCanvas(e.offsetX, e.offsetY);
      const coord = document.getElementById('pf-coord');
      if (coord) coord.textContent = `x: ${x.toFixed(3)} · y: ${y.toFixed(3)}`;
      if (state.arrastar) {
        const dx = e.clientX - state.arrastar.x;
        const dy = e.clientY - state.arrastar.y;
        const v  = state.arrastar.view;
        const rx = (v.xMax - v.xMin) / canvas.width;
        const ry = (v.yMax - v.yMin) / canvas.height;
        state.view = {
          xMin: v.xMin - dx * rx, xMax: v.xMax - dx * rx,
          yMin: v.yMin + dy * ry, yMax: v.yMax + dy * ry,
        };
        _draw(); _updateViewLabel();
      }
    });
    ['mouseup','mouseleave'].forEach(ev => canvas.addEventListener(ev, () => { state.arrastar = null; }));

    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const fator = e.deltaY > 0 ? 1.12 : 0.89;
      const { x, y } = _fromCanvas(e.offsetX, e.offsetY);
      const { xMin, xMax, yMin, yMax } = state.view;
      state.view = {
        xMin: x + (xMin - x) * fator, xMax: x + (xMax - x) * fator,
        yMin: y + (yMin - y) * fator, yMax: y + (yMax - y) * fator,
      };
      _draw(); _updateViewLabel();
    }, { passive: false });


    let lastTouchDist = null;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1)
        state.arrastar = { x: e.touches[0].clientX, y: e.touches[0].clientY, view: { ...state.view } };
      else if (e.touches.length === 2)
        lastTouchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 1 && state.arrastar) {
        const dx = e.touches[0].clientX - state.arrastar.x;
        const dy = e.touches[0].clientY - state.arrastar.y;
        const v  = state.arrastar.view;
        const rx = (v.xMax - v.xMin) / canvas.width;
        const ry = (v.yMax - v.yMin) / canvas.height;
        state.view = {
          xMin: v.xMin - dx * rx, xMax: v.xMax - dx * rx,
          yMin: v.yMin + dy * ry, yMax: v.yMax + dy * ry,
        };
        _draw();
      } else if (e.touches.length === 2 && lastTouchDist) {
        const dist  = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        _zoom(lastTouchDist / dist);
        lastTouchDist = dist;
      }
    }, { passive: false });
    canvas.addEventListener('touchend', () => { state.arrastar = null; lastTouchDist = null; });
  }


  function _setSTAB(tab) {
    document.querySelectorAll('.pf-stab').forEach(b => b.classList.toggle('active', b.id === `pftab-${tab}`));
    const body = document.getElementById('pf-sb-body');
    if (!body) return;

    if (tab === 'funcoes') {
      body.innerHTML = `
        <div class="pf-lbl" style="margin-bottom:10px;">Funções ativas</div>
        ${state.funcoes.map((f, i) => `
          <div class="pf-fn-row" id="pffnrow-${i}">
            <div class="pf-fn-dot ${f.ativa?'':'off'}" id="pffndot-${i}"
              style="background:${f.cor};box-shadow:0 0 7px ${f.cor}70;"
              onclick="PlotadorFuncoes._toggleFn(${i})" title="Ativar/desativar"></div>
            <span class="pf-fn-label">${f.label} =</span>
            <input class="pf-fn-input" id="pf-fn-${i}"
              placeholder="${i===0?'ex: sin(x)':i===1?'ex: x^2-1':i===2?'ex: cos(x)':'ex: tan(x/2)'}"
              value="${f.expr}"
              oninput="PlotadorFuncoes._updateExpr(${i}, this.value)"
              onkeydown="if(event.key==='Enter'){ PlotadorFuncoes._draw(); this.blur(); }">
            <button class="pf-fn-clr" onclick="PlotadorFuncoes._clearFn(${i})" title="Limpar">×</button>
          </div>
        `).join('')}

        <div style="height:1px;background:rgba(255,255,255,0.04);margin:14px 0;"></div>
        <div class="pf-lbl" style="margin-bottom:8px;">Janela de visualização</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px;">
          ${[['xMin','x mín'],['xMax','x máx'],['yMin','y mín'],['yMax','y máx']].map(([k,l]) => `
            <div>
              <div style="font-size:9px;color:#3d4f6a;margin-bottom:3px;">${l}</div>
              <input type="number" class="pf-view-inp" value="${state.view[k]}" step="1"
                onchange="PlotadorFuncoes._setView('${k}', +this.value)">
            </div>
          `).join('')}
        </div>
        <button class="pf-btn" onclick="PlotadorFuncoes._resetView()">↺ Resetar visualização</button>
      `;
    } else if (tab === 'biblioteca') {
      body.innerHTML = Object.entries(BIBLIOTECA).map(([cat, itens]) => `
        <div class="pf-lib-cat">
          <div class="pf-lbl">${cat}</div>
          ${itens.map(it => `
            <div class="pf-lib-item" onclick="PlotadorFuncoes._addFromLib('${it.expr.replace(/'/g,"\\'")}')">
              <span class="pf-lib-expr">${it.expr}</span>
              <span class="pf-lib-nome">${it.nome} ＋</span>
            </div>
          `).join('')}
        </div>
      `).join('');
    } else if (tab === 'analise') {
      body.innerHTML = _buildAnalise();
    }
  }

  function _buildAnalise() {
    const ativa = state.funcoes.find(f => f.ativa && f.expr.trim());
    if (!ativa) return `<div style="color:#3d4f6a;font-size:12px;text-align:center;padding:24px 0;line-height:1.6;">Insira ao menos uma função<br>para ver a análise.</div>`;
    const fn = _parse(ativa.expr);
    if (!fn) return `<div style="color:#ef4444;font-size:11px;padding:10px;">Expressão inválida: <code>${ativa.expr}</code></div>`;

    const raizes = _encontrarRaizes(fn);
    const vert   = _encontrarVertice(fn);
    const y0     = fn(0);
    const dy0    = _derivada(fn, 0);
    const dy1    = _derivada(fn, 1);

    const xs = [-4,-3,-2,-1,0,1,2,3,4];
    return `
      <div class="pf-lbl">Análise: <span style="color:${ativa.cor};">${ativa.label}(x) = ${ativa.expr}</span></div>
      <div style="margin-bottom:16px;">
        <div class="pf-arow"><span class="pf-albl">Zeros (raízes)</span><span class="pf-aval">${raizes.length?raizes.map(_fmt).join(', '):'—'}</span></div>
        ${vert?`<div class="pf-arow"><span class="pf-albl">Ponto crítico</span><span class="pf-aval">${vert.tipo}: (${_fmt(vert.x)}, ${_fmt(vert.y)})</span></div>`:''}
        <div class="pf-arow"><span class="pf-albl">f(0) · y-intercept</span><span class="pf-aval">${isNaN(y0)?'—':_fmt(y0)}</span></div>
        <div class="pf-arow"><span class="pf-albl">f'(0) · decl. em x=0</span><span class="pf-aval">${isNaN(dy0)?'—':_fmt(dy0)}</span></div>
        <div class="pf-arow" style="border:none;"><span class="pf-albl">f'(1) · decl. em x=1</span><span class="pf-aval">${isNaN(dy1)?'—':_fmt(dy1)}</span></div>
      </div>
      <div class="pf-lbl" style="margin-bottom:6px;">Tabela de valores</div>
      <table class="pf-tbl">
        <thead><tr><th>x</th><th style="color:${ativa.cor};">${ativa.label}(x)</th></tr></thead>
        <tbody>
          ${xs.map(x => { const y = fn(x); return `<tr><td style="color:#64748b;">${_fmt(x)}</td><td style="color:${ativa.cor};">${isNaN(y)?'—':_fmt(y)}</td></tr>`; }).join('')}
        </tbody>
      </table>
      <button class="pf-btn pf-btn-green" style="margin-top:12px;" onclick="PlotadorFuncoes._setSTAB('analise')">↺ Atualizar</button>
    `;
  }

  function _updateExpr(i, val) {
    state.funcoes[i].expr = val;
    state.funcoes[i].ativa = val.trim() !== '';
    
    const row = document.getElementById(`pffnrow-${i}`);
    if (row) {
      const valid = val.trim() === '' || _parse(val) !== null;
      row.classList.toggle('pf-fn-err', !valid);
    }
    _draw();
  }

  function _clearFn(i) {
    state.funcoes[i].expr = '';
    state.funcoes[i].ativa = false;
    const el = document.getElementById(`pf-fn-${i}`);
    if (el) el.value = '';
    const row = document.getElementById(`pffnrow-${i}`);
    if (row) row.classList.remove('pf-fn-err');
    _draw();
  }

  function _toggleFn(i) {
    if (state.funcoes[i].expr.trim()) {
      state.funcoes[i].ativa = !state.funcoes[i].ativa;
      const dot = document.getElementById(`pffndot-${i}`);
      if (dot) dot.classList.toggle('off', !state.funcoes[i].ativa);
      _draw();
    }
  }

  function _addFromLib(expr) {

    let idx = state.funcoes.findIndex(f => !f.expr.trim());
    if (idx < 0) idx = state.funcoes.findIndex(f => !f.ativa);
    if (idx < 0) idx = 0;
    state.funcoes[idx].expr  = expr;
    state.funcoes[idx].ativa = true;
    _setSTAB('funcoes');
    _draw();
    setTimeout(() => {
      const el = document.getElementById(`pf-fn-${idx}`);
      if (el) { el.value = expr; el.focus(); }
    }, 50);
  }

  function _toggle(key) {
    state[key] = !state[key];
    const keyMap = { mostrarGrade: 'grade', mostrarRaizes: 'raizes', mostrarDerivada: 'deriv' };
    const suffix = keyMap[key];
    const tog  = document.getElementById(`tog-${suffix}`);
    const dot  = document.getElementById(`tdot-${suffix}`);
    if (tog) tog.classList.toggle('on', state[key]);
    if (dot) { dot.classList.toggle('on', state[key]); }
    _draw();
  }

  function _zoom(fator) {
    const { xMin, xMax, yMin, yMax } = state.view;
    const cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2;
    const hw = (xMax - xMin) / 2 * fator;
    const hh = (yMax - yMin) / 2 * fator;
    state.view = { xMin: cx - hw, xMax: cx + hw, yMin: cy - hh, yMax: cy + hh };
    _draw(); _updateViewLabel();
  }

  function _resetView() {
    state.view = { xMin: -8, xMax: 8, yMin: -6, yMax: 6 };
    _draw(); _updateViewLabel();
    _setSTAB('funcoes');
  }

  function _setView(key, val) {
    if (!isNaN(val)) { state.view[key] = val; _draw(); _updateViewLabel(); }
  }

  function _updateViewLabel() {
    const el = document.getElementById('pf-view-label');
    if (el) {
      const { xMin, xMax, yMin, yMax } = state.view;
      el.textContent = `[${_fmt(xMin)}, ${_fmt(xMax)}] × [${_fmt(yMin)}, ${_fmt(yMax)}]`;
    }
  }

  function fechar() {
    document.getElementById(MODAL_ID)?.remove();
  }

  (function injetarNoMundo() {
    function add() {
      const menus = document.querySelectorAll('.mt-dropdown-content:not(.pf-injected)');
      if (!menus.length) return;
      menus.forEach(menu => {
        menu.classList.add('pf-injected');

        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--border,#3a3228);margin:4px 10px;opacity:0.3;';

        const btn = document.createElement('button');
        btn.innerHTML = '📈 Plotador de Funções';
        btn.onclick = e => {
          e.stopPropagation();
          menu.classList.remove('show');
          PlotadorFuncoes.abrir();
        };

        const dashBtn = Array.from(menu.querySelectorAll('button')).find(b => b.innerText.includes('Dashboard'));
        if (dashBtn) {
          menu.insertBefore(sep, dashBtn);
          menu.insertBefore(btn, dashBtn);
        } else {
          menu.appendChild(sep);
          menu.appendChild(btn);
        }
      });
    }
    const obs = new MutationObserver(add);
    obs.observe(document.body, { childList: true, subtree: true });
    add();
  })();

  return {
    abrir, fechar,
    _setSTAB, _updateExpr, _clearFn, _toggleFn, _addFromLib,
    _toggle, _zoom, _resetView, _setView, _draw,
  };
})();

window.PlotadorFuncoes = PlotadorFuncoes;
