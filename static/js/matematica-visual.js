
const GeometriaInterativa = (() => {
  const MODAL_ID = 'modal-geometria-3d';

  let state = {
    modo: '3d',
    solido: 'cubo',
    cor: '#e8a04a',
    wireframe: false,
    animar: true,
  
    scene: null, camera: null, renderer: null, mesh: null, animFrame: null,
  
    vertices2d: [],
    isDragging: -1,
    shape2d: 'triangulo',

    mostrarPlano: true,
    mostrarEixos: true,
  };

  const SOLIDOS = {
 
    triangulo:     { label: '▲ Triângulo',      tipo: '2d', icon: '▲' },
    quadrado:      { label: '■ Quadrilátero',   tipo: '2d', icon: '■' },
    pentagono:     { label: '⬠ Pentágono',      tipo: '2d', icon: '⬠' },
    hexagono:      { label: '⬡ Hexágono',       tipo: '2d', icon: '⬡' },
    circulo:       { label: '● Círculo',        tipo: '2d', icon: '●' },

    cubo:          { label: '■ Cubo',           tipo: '3d', icon: '◧' },
    esfera:        { label: '● Esfera',         tipo: '3d', icon: '●' },
    cilindro:      { label: '⬭ Cilindro',       tipo: '3d', icon: '⬭' },
    cone:          { label: '△ Cone',           tipo: '3d', icon: '△' },
    piramide:      { label: '△ Pirâmide',       tipo: '3d', icon: '△' },
    toroide:       { label: '◎ Toróide',        tipo: '3d', icon: '◎' },
    prismaTriang:  { label: '▱ Prisma Triang.', tipo: '3d', icon: '▱' },
    tetraedro:     { label: '◈ Tetraedro',      tipo: '3d', icon: '◈' },
    octaedro:      { label: '◈ Octaedro',       tipo: '3d', icon: '◈' },
    dodecaedro:    { label: '◈ Dodecaedro',     tipo: '3d', icon: '◈' },
    icosaedro:     { label: '◈ Icosaedro',      tipo: '3d', icon: '◈' },
  };

  function abrir() {
    document.getElementById(MODAL_ID)?.remove();
    _injectStyles();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'ex-modal-overlay';
    modal.style.cssText = 'z-index:100004; display:flex; align-items:center; justify-content:center;';

    modal.innerHTML = `
      <div class="geo3d-box">
        <div class="geo3d-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:22px;">📐</span>
            <span class="geo3d-title">Geometria Interativa</span>
          </div>
          <button class="geo3d-close" onclick="GeometriaInterativa.fechar()">✕</button>
        </div>

        <div class="geo3d-layout">
        
          <div class="geo3d-sidebar">

            <div class="geo3d-section-label">Modo</div>
            <div class="geo3d-toggle">
              <button id="btn-modo-2d" class="geo3d-toggle-btn" onclick="GeometriaInterativa.setModo('2d')">2D</button>
              <button id="btn-modo-3d" class="geo3d-toggle-btn active" onclick="GeometriaInterativa.setModo('3d')">3D</button>
            </div>

            <div class="geo3d-section-label" style="margin-top:14px;">Forma</div>
            <div id="geo3d-shape-list" class="geo3d-shape-list"></div>

            <div id="geo3d-controls-3d">
              <div class="geo3d-section-label" style="margin-top:14px;">Cor</div>
              <div class="geo3d-color-row">
                <input type="color" id="geo3d-color" value="#e8a04a" onchange="GeometriaInterativa.setCor(this.value)" style="width:36px;height:32px;border:none;background:none;cursor:pointer;padding:0;" />
                <div class="geo3d-color-presets">
                  <div class="geo3d-swatch" style="background:#e8a04a" onclick="GeometriaInterativa.setCor('#e8a04a')"></div>
                  <div class="geo3d-swatch" style="background:#5d9de8" onclick="GeometriaInterativa.setCor('#5d9de8')"></div>
                  <div class="geo3d-swatch" style="background:#7dcb7d" onclick="GeometriaInterativa.setCor('#7dcb7d')"></div>
                  <div class="geo3d-swatch" style="background:#d97ab8" onclick="GeometriaInterativa.setCor('#d97ab8')"></div>
                  <div class="geo3d-swatch" style="background:#e06c6c" onclick="GeometriaInterativa.setCor('#e06c6c')"></div>
                  <div class="geo3d-swatch" style="background:#a889e8" onclick="GeometriaInterativa.setCor('#a889e8')"></div>
                </div>
              </div>

              <div class="geo3d-section-label" style="margin-top:14px;">Opções</div>
              <label class="geo3d-check">
                <input type="checkbox" id="chk-wireframe" onchange="GeometriaInterativa.toggleWireframe(this.checked)" />
                Wireframe
              </label>
              <label class="geo3d-check">
                <input type="checkbox" id="chk-animar" checked onchange="GeometriaInterativa.toggleAnimar(this.checked)" />
                Rotação automática
              </label>
              <label class="geo3d-check">
                <input type="checkbox" id="chk-plano" checked onchange="GeometriaInterativa.togglePlano(this.checked)" />
                Mostrar plano
              </label>
              <label class="geo3d-check">
                <input type="checkbox" id="chk-eixos" checked onchange="GeometriaInterativa.toggleEixos(this.checked)" />
                Mostrar eixos XYZ
              </label>
            </div>

          </div>

   
          <div class="geo3d-main">
            <div id="geo3d-canvas-wrap" style="width:100%;height:100%;position:relative;">
              <canvas id="geo3d-canvas" style="width:100%;height:100%;display:block;border-radius:12px;"></canvas>
              <div id="geo3d-label-xyz" class="geo3d-xyz-labels">
                <span class="geo3d-xyz-x">X</span>
                <span class="geo3d-xyz-y">Y</span>
                <span class="geo3d-xyz-z">Z</span>
              </div>
            </div>
            <!-- SVG 2D (oculto inicialmente) -->
            <div id="geo3d-svg-wrap" style="width:100%;height:100%;display:none;position:relative;background:#0d0d0d;border-radius:12px;overflow:hidden;">
              <svg id="geo2d-svg" width="100%" height="100%" style="cursor:crosshair;"></svg>
              <div id="geo2d-stats" class="geo3d-stats-overlay">
                <div style="color:var(--accent);font-weight:700;font-size:13px;margin-bottom:6px;">Cálculos:</div>
                <div id="stat2d-perimetro" style="color:var(--text-1);font-size:12px;"></div>
                <div id="stat2d-area" style="color:var(--text-1);font-size:12px;"></div>
                <div id="stat2d-extra" style="color:var(--text-2);font-size:11px;margin-top:4px;"></div>
              </div>
            </div>
          </div>


          <div class="geo3d-info">
            <div class="geo3d-section-label">Fórmulas</div>
            <div id="geo3d-formulas" class="geo3d-formula-box">
              Selecione uma forma para ver as fórmulas.
            </div>
            <div class="geo3d-section-label" style="margin-top:14px;">Medidas</div>
            <div id="geo3d-medidas" class="geo3d-medidas-box">
              <div class="geo3d-medida-row">
                <label class="geo3d-medida-label">Tamanho</label>
                <input type="range" id="slide-size" min="0.5" max="3" step="0.1" value="1.5" onchange="GeometriaInterativa.setTamanho(this.value)" style="width:100%;" />
                <span id="slide-size-val" class="geo3d-medida-val">1.5</span>
              </div>
              <div id="geo3d-dims" style="margin-top:8px; font-size:12px; color:var(--text-2); line-height:1.8;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    _populateShapeList();
    _initThree();
    setSolido('cubo');
  }

  function fechar() {
    if (state.animFrame) cancelAnimationFrame(state.animFrame);
    if (state.renderer) state.renderer.dispose();
    state.renderer = null; state.scene = null; state.camera = null; state.mesh = null;
    document.getElementById(MODAL_ID)?.remove();
  }

  function _populateShapeList() {
    const container = document.getElementById('geo3d-shape-list');
    if (!container) return;
    container.innerHTML = '';

    const groups = { '2D': [], '3D': [] };
    Object.entries(SOLIDOS).forEach(([k, v]) => {
      groups[v.tipo === '2d' ? '2D' : '3D'].push({ k, v });
    });

    ['2D', '3D'].forEach(g => {
      const lbl = document.createElement('div');
      lbl.style.cssText = 'font-size:10px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:1px;padding:4px 2px 2px;';
      lbl.textContent = g;
      container.appendChild(lbl);

      groups[g].forEach(({ k, v }) => {
        const btn = document.createElement('button');
        btn.id = `shp-${k}`;
        btn.className = 'geo3d-shape-btn';
        btn.textContent = v.label;
        btn.onclick = () => setSolido(k);
        container.appendChild(btn);
      });
    });
  }

  
  function setModo(modo) {
    state.modo = modo;
    document.getElementById('btn-modo-2d')?.classList.toggle('active', modo === '2d');
    document.getElementById('btn-modo-3d')?.classList.toggle('active', modo === '3d');
    document.getElementById('geo3d-canvas-wrap').style.display = modo === '3d' ? 'block' : 'none';
    document.getElementById('geo3d-svg-wrap').style.display = modo === '2d' ? 'block' : 'none';
    document.getElementById('geo3d-controls-3d').style.display = modo === '3d' ? 'block' : 'none';
    document.getElementById('geo3d-label-xyz').style.display = modo === '3d' ? 'flex' : 'none';

    const atual = SOLIDOS[state.solido];
    if (modo === '2d' && atual?.tipo === '3d') setSolido('triangulo');
    else if (modo === '3d' && atual?.tipo === '2d') setSolido('cubo');
    else setSolido(state.solido);
  }

  function setSolido(nome) {
    state.solido = nome;

    document.querySelectorAll('.geo3d-shape-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`shp-${nome}`)?.classList.add('active');

    const info = SOLIDOS[nome];
    if (!info) return;

    if (info.tipo === '2d') {
      if (state.modo === '3d') setModo('2d');
      _init2D(nome);
    } else {
      if (state.modo === '2d') setModo('3d');
      _buildMesh(nome);
    }
    _updateFormulas(nome);
  }

  function _initThree() {
    if (!window.THREE) { console.warn('Three.js não encontrado'); return; }

    const canvas = document.getElementById('geo3d-canvas');
    const wrap = document.getElementById('geo3d-canvas-wrap');
    if (!canvas || !wrap) return;

    const W = wrap.clientWidth || 500;
    const H = wrap.clientHeight || 400;

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0d0d0d);

    state.camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    state.camera.position.set(4, 3, 5);
    state.camera.lookAt(0, 0, 0);

    state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    state.renderer.setSize(W, H);
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    state.renderer.shadowMap.enabled = true;

    
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    state.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 8, 5);
    dirLight.castShadow = true;
    state.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x88aaff, 0.3);
    fillLight.position.set(-4, -2, -3);
    state.scene.add(fillLight);

    _buildPlano();
    _buildEixos();

   
    _initOrbitControls(canvas);

 
    _animate();
  }

  function _buildPlano() {
    if (state._planoObj) { state.scene.remove(state._planoObj); state._planoObj = null; }
    const grid = new THREE.GridHelper(10, 20, 0x333333, 0x222222);
    grid.position.y = -1.5;
    state._planoObj = grid;
    state.scene.add(grid);
  }

  function _buildEixos() {
    if (state._eixosObj) { state.scene.remove(state._eixosObj); state._eixosObj = null; }
    const axes = new THREE.AxesHelper(3);
    axes.position.y = -1.5;
    state._eixosObj = axes;
    state.scene.add(axes);
  }

  function _buildMesh(nome) {
    if (!state.scene || !window.THREE) return;
    if (state.mesh) { state.scene.remove(state.mesh); state.mesh = null; }
    if (state._wireObj) { state.scene.remove(state._wireObj); state._wireObj = null; }

    const s = parseFloat(document.getElementById('slide-size')?.value || 1.5);
    let geo;

    switch (nome) {
      case 'cubo':         geo = new THREE.BoxGeometry(s, s, s); break;
      case 'esfera':       geo = new THREE.SphereGeometry(s * 0.6, 64, 32); break;
      case 'cilindro':     geo = new THREE.CylinderGeometry(s * 0.5, s * 0.5, s * 1.2, 64); break;
      case 'cone':         geo = new THREE.ConeGeometry(s * 0.6, s * 1.3, 64); break;
      case 'piramide':     geo = new THREE.ConeGeometry(s * 0.7, s * 1.2, 4); break;
      case 'toroide':      geo = new THREE.TorusGeometry(s * 0.5, s * 0.2, 32, 128); break;
      case 'prismaTriang': geo = new THREE.CylinderGeometry(s * 0.6, s * 0.6, s * 1.2, 3); break;
      case 'tetraedro':    geo = new THREE.TetrahedronGeometry(s * 0.8); break;
      case 'octaedro':     geo = new THREE.OctahedronGeometry(s * 0.8); break;
      case 'dodecaedro':   geo = new THREE.DodecahedronGeometry(s * 0.8); break;
      case 'icosaedro':    geo = new THREE.IcosahedronGeometry(s * 0.8); break;
      default:             geo = new THREE.BoxGeometry(s, s, s);
    }

    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(state.cor),
      shininess: 60,
      wireframe: state.wireframe,
    });

    state.mesh = new THREE.Mesh(geo, mat);
    state.mesh.castShadow = true;
    state.mesh.position.y = 0;
    state.scene.add(state.mesh);

    if (!state.wireframe) {
      const wGeo = geo.clone();
      const wMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.06 });
      state._wireObj = new THREE.Mesh(wGeo, wMat);
      state.scene.add(state._wireObj);
    }

    _updateDims(nome, s);
  }

  function _animate() {
    if (!state.renderer || !state.scene || !state.camera) return;
    state.animFrame = requestAnimationFrame(_animate);
    if (state.animar && state.mesh) {
      state.mesh.rotation.y += 0.008;
      state.mesh.rotation.x += 0.003;
      if (state._wireObj) {
        state._wireObj.rotation.y = state.mesh.rotation.y;
        state._wireObj.rotation.x = state.mesh.rotation.x;
      }
    }
    state.renderer.render(state.scene, state.camera);
  }

  
  function _initOrbitControls(canvas) {
    let drag = false, lastX = 0, lastY = 0;
    let spherical = { theta: Math.PI / 4, phi: Math.PI / 3, radius: 7 };

    function updateCamera() {
      if (!state.camera) return;
      state.camera.position.set(
        spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta),
        spherical.radius * Math.cos(spherical.phi),
        spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
      );
      state.camera.lookAt(0, 0, 0);
    }

    canvas.addEventListener('mousedown', e => { drag = true; lastX = e.clientX; lastY = e.clientY; state.animar = false; document.getElementById('chk-animar') && (document.getElementById('chk-animar').checked = false); });
    window.addEventListener('mousemove', e => {
      if (!drag) return;
      const dx = (e.clientX - lastX) * 0.01;
      const dy = (e.clientY - lastY) * 0.01;
      spherical.theta -= dx;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy));
      lastX = e.clientX; lastY = e.clientY;
      updateCamera();
    });
    window.addEventListener('mouseup', () => { drag = false; });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      spherical.radius = Math.max(2, Math.min(15, spherical.radius + e.deltaY * 0.01));
      updateCamera();
    }, { passive: false });


    let lastTouchX = 0, lastTouchY = 0;
    canvas.addEventListener('touchstart', e => { if (e.touches.length === 1) { drag = true; lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY; } });
    canvas.addEventListener('touchmove', e => {
      if (!drag || e.touches.length !== 1) return;
      e.preventDefault();
      const dx = (e.touches[0].clientX - lastTouchX) * 0.015;
      const dy = (e.touches[0].clientY - lastTouchY) * 0.015;
      spherical.theta -= dx; spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi + dy));
      lastTouchX = e.touches[0].clientX; lastTouchY = e.touches[0].clientY;
      updateCamera();
    }, { passive: false });
    canvas.addEventListener('touchend', () => { drag = false; });

    updateCamera();
  }

  
  function setCor(cor) {
    state.cor = cor;
    document.getElementById('geo3d-color') && (document.getElementById('geo3d-color').value = cor);
    if (state.mesh) state.mesh.material.color.set(new THREE.Color(cor));
  }

  function toggleWireframe(v) {
    state.wireframe = v;
    _buildMesh(state.solido);
  }

  function toggleAnimar(v) {
    state.animar = v;
  }

  function togglePlano(v) {
    state.mostrarPlano = v;
    if (state._planoObj) state._planoObj.visible = v;
  }

  function toggleEixos(v) {
    state.mostrarEixos = v;
    if (state._eixosObj) state._eixosObj.visible = v;
  }

  function setTamanho(v) {
    document.getElementById('slide-size-val') && (document.getElementById('slide-size-val').textContent = parseFloat(v).toFixed(1));
    if (SOLIDOS[state.solido]?.tipo === '3d') _buildMesh(state.solido);
    else _init2D(state.solido);
  }

  
  function _updateDims(nome, s) {
    const el = document.getElementById('geo3d-dims');
    if (!el) return;
    const r = (v) => v.toFixed(2);
    const pi = Math.PI;
    let html = '';
    switch (nome) {
      case 'cubo':         html = `Aresta: ${r(s)}<br>Volume: ${r(s**3)}<br>Sup. Total: ${r(6*s**2)}`; break;
      case 'esfera':       { const R = s*0.6; html = `Raio: ${r(R)}<br>Volume: ${r(4/3*pi*R**3)}<br>Área: ${r(4*pi*R**2)}`; break; }
      case 'cilindro':     { const R2 = s*0.5, H = s*1.2; html = `Raio: ${r(R2)} | Alt: ${r(H)}<br>Volume: ${r(pi*R2**2*H)}<br>Área: ${r(2*pi*R2*H + 2*pi*R2**2)}`; break; }
      case 'cone':         { const R3 = s*0.6, H3 = s*1.3, g = Math.sqrt(R3**2+H3**2); html = `Raio: ${r(R3)} | Alt: ${r(H3)}<br>Geratriz: ${r(g)}<br>Volume: ${r(pi*R3**2*H3/3)}`; break; }
      case 'piramide':     { const b = s*0.7*Math.sqrt(2), H4 = s*1.2; html = `Base: ${r(b)} | Alt: ${r(H4)}<br>Volume: ${r(b**2*H4/3)}`; break; }
      case 'toroide':      { const R5 = s*0.5, r5 = s*0.2; html = `R maior: ${r(R5)} | r menor: ${r(r5)}<br>Volume: ${r(2*pi**2*R5*r5**2)}<br>Área: ${r(4*pi**2*R5*r5)}`; break; }
      case 'tetraedro':    { const a = s*0.8*Math.sqrt(8); html = `Aresta: ${r(a)}<br>Volume: ${r(a**3/(6*Math.sqrt(2)))}<br>Faces: 4`; break; }
      case 'octaedro':     { const a2 = s*0.8*Math.sqrt(2); html = `Aresta: ${r(a2)}<br>Volume: ${r(Math.sqrt(2)/3*a2**3)}<br>Faces: 8`; break; }
      case 'dodecaedro':   html = `Faces: 12 (pentágonos)<br>Vértices: 20 | Arestas: 30`; break;
      case 'icosaedro':    html = `Faces: 20 (triângulos)<br>Vértices: 12 | Arestas: 30`; break;
      default: html = '';
    }
    el.innerHTML = html;
  }


  function _init2D(nome) {
    const svg = document.getElementById('geo2d-svg');
    if (!svg) return;
    svg.innerHTML = '';

    const wrap = document.getElementById('geo3d-svg-wrap');
    const W = wrap?.clientWidth || 500;
    const H = wrap?.clientHeight || 400;
    const cx = W / 2, cy = H / 2;
    const s = parseFloat(document.getElementById('slide-size')?.value || 1.5) * 80;

    let verts = [];
    if (nome === 'circulo') {
      state.shape2d = 'circulo';
      _draw2DCircle(svg, cx, cy, s, W, H);
      return;
    }

    const sides = { triangulo: 3, quadrado: 4, pentagono: 5, hexagono: 6 }[nome] || 3;
    state.shape2d = nome;

    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI / sides) - Math.PI / 2;
      verts.push({ x: cx + s * Math.cos(angle), y: cy + s * Math.sin(angle) });
    }
    state.vertices2d = verts;

    _draw2D();
    _init2DEvents(svg);
  }

  function _draw2DCircle(svg, cx, cy, r, W, H) {

    _draw2DGrid(svg, W, H);
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', cx); circle.setAttribute('cy', cy);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', `${state.cor}33`);
    circle.setAttribute('stroke', state.cor); circle.setAttribute('stroke-width', '2');
    svg.appendChild(circle);

    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', cx + r); line.setAttribute('y2', cy);
    line.setAttribute('stroke', '#ffffff88'); line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', cx + r/2); text.setAttribute('y', cy - 8);
    text.setAttribute('fill', '#ffffff88'); text.setAttribute('font-size', '11');
    text.textContent = 'r';
    svg.appendChild(text);

    const area = (Math.PI * r * r).toFixed(1);
    const perim = (2 * Math.PI * r).toFixed(1);
    document.getElementById('stat2d-perimetro').textContent = `Circunferência: ${perim} u`;
    document.getElementById('stat2d-area').textContent = `Área: ${area} u²`;
    document.getElementById('stat2d-extra').textContent = `Raio: ${r.toFixed(1)} u  |  Diâm: ${(2*r).toFixed(1)} u`;
  }

  function _draw2DGrid(svg, W, H) {
    const step = 40;
    for (let x = 0; x < W; x += step) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', x); l.setAttribute('y1', 0); l.setAttribute('x2', x); l.setAttribute('y2', H);
      l.setAttribute('stroke', '#ffffff0d'); l.setAttribute('stroke-width', '1');
      svg.appendChild(l);
    }
    for (let y = 0; y < H; y += step) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('x1', 0); l.setAttribute('y1', y); l.setAttribute('x2', W); l.setAttribute('y2', y);
      l.setAttribute('stroke', '#ffffff0d'); l.setAttribute('stroke-width', '1');
      svg.appendChild(l);
    }

    const ax = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ax.setAttribute('x1', 0); ax.setAttribute('y1', H/2); ax.setAttribute('x2', W); ax.setAttribute('y2', H/2);
    ax.setAttribute('stroke', '#ffffff22'); ax.setAttribute('stroke-width', '1');
    svg.appendChild(ax);
    const ay = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    ay.setAttribute('x1', W/2); ay.setAttribute('y1', 0); ay.setAttribute('x2', W/2); ay.setAttribute('y2', H);
    ay.setAttribute('stroke', '#ffffff22'); ay.setAttribute('stroke-width', '1');
    svg.appendChild(ay);
  }

  function _draw2D() {
    const svg = document.getElementById('geo2d-svg');
    if (!svg) return;
    svg.innerHTML = '';

    const wrap = document.getElementById('geo3d-svg-wrap');
    const W = wrap?.clientWidth || 500;
    const H = wrap?.clientHeight || 400;
    _draw2DGrid(svg, W, H);

    const pts = state.vertices2d;
    if (!pts.length) return;

   
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', pts.map(v => `${v.x},${v.y}`).join(' '));
    polygon.setAttribute('fill', `${state.cor}33`);
    polygon.setAttribute('stroke', state.cor);
    polygon.setAttribute('stroke-width', '2.5');
    svg.appendChild(polygon);

  
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      const d = Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y).toFixed(1);
      const mx = (pts[i].x + pts[j].x) / 2;
      const my = (pts[i].y + pts[j].y) / 2;
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', mx + 6); text.setAttribute('y', my - 4);
      text.setAttribute('fill', '#ffffff66'); text.setAttribute('font-size', '10');
      text.textContent = `${d}u`;
      svg.appendChild(text);
    }


    pts.forEach((v, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', v.x); circle.setAttribute('cy', v.y); circle.setAttribute('r', '9');
      circle.setAttribute('fill', 'white'); circle.setAttribute('stroke', state.cor); circle.setAttribute('stroke-width', '2.5');
      circle.setAttribute('style', 'cursor:move;');
      svg.appendChild(circle);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', v.x + 13); label.setAttribute('y', v.y - 13);
      label.setAttribute('fill', '#ffffff99'); label.setAttribute('font-size', '10');
      label.textContent = `${String.fromCharCode(65 + i)} (${Math.round(v.x)},${Math.round(v.y)})`;
      svg.appendChild(label);
    });


    let area = 0, perim = 0;
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length;
      area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
      perim += Math.hypot(pts[j].x - pts[i].x, pts[j].y - pts[i].y);
    }
    area = Math.abs(area) / 2;
    document.getElementById('stat2d-perimetro').textContent = `Perímetro: ${perim.toFixed(1)} u`;
    document.getElementById('stat2d-area').textContent = `Área: ${area.toFixed(1)} u²`;
    document.getElementById('stat2d-extra').textContent = `${pts.length} vértices  |  Arraste os pontos`;
  }

  function _init2DEvents(svg) {
    svg.addEventListener('mousedown', e => {
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left, py = e.clientY - rect.top;
      state.vertices2d.forEach((v, i) => {
        if (Math.hypot(v.x - px, v.y - py) < 15) state.isDragging = i;
      });
    });
    window.addEventListener('mousemove', e => {
      if (state.isDragging === -1) return;
      const rect = svg.getBoundingClientRect();
      state.vertices2d[state.isDragging].x = e.clientX - rect.left;
      state.vertices2d[state.isDragging].y = e.clientY - rect.top;
      _draw2D();
    });
    window.addEventListener('mouseup', () => { state.isDragging = -1; });
  }

  
  function _updateFormulas(nome) {
    const el = document.getElementById('geo3d-formulas');
    if (!el) return;
    const formulas = {
      triangulo:     `<b>Área:</b> (b × h) / 2<br><b>Perímetro:</b> a + b + c<br><b>Pitágoras:</b> a²+b²=c²`,
      quadrado:      `<b>Área:</b> L²<br><b>Perímetro:</b> 4L<br><b>Diagonal:</b> L√2`,
      pentagono:     `<b>Área:</b> (P × a) / 2<br><b>Ângulo int:</b> 108°<br><b>Soma ang:</b> 540°`,
      hexagono:      `<b>Área:</b> (3√3 × L²) / 2<br><b>Perímetro:</b> 6L<br><b>Ângulo int:</b> 120°`,
      circulo:       `<b>Área:</b> π × r²<br><b>Circunf:</b> 2 × π × r<br><b>Diâmetro:</b> 2r`,
      cubo:          `<b>Volume:</b> a³<br><b>Sup. Total:</b> 6a²<br><b>Diagonal:</b> a√3`,
      esfera:        `<b>Volume:</b> (4/3)πr³<br><b>Área:</b> 4πr²`,
      cilindro:      `<b>Volume:</b> πr²h<br><b>Área Total:</b> 2πr(r+h)<br><b>Área Lateral:</b> 2πrh`,
      cone:          `<b>Volume:</b> (1/3)πr²h<br><b>Área Total:</b> πr(r+g)<br><b>Geratriz:</b> √(r²+h²)`,
      piramide:      `<b>Volume:</b> (1/3) × B × h<br><b>Área Total:</b> B + (P×a)/2`,
      toroide:       `<b>Volume:</b> 2π²Rr²<br><b>Área:</b> 4π²Rr`,
      prismaTriang:  `<b>Volume:</b> A_base × h<br><b>Área:</b> 2·A_base + P·h`,
      tetraedro:     `<b>Volume:</b> a³/(6√2)<br><b>Área:</b> a²√3<br><b>Faces:</b> 4 triângulos`,
      octaedro:      `<b>Volume:</b> (√2/3)a³<br><b>Faces:</b> 8 triângulos`,
      dodecaedro:    `<b>Faces:</b> 12 pentágonos<br><b>Volume:</b> ≈ 7.66a³`,
      icosaedro:     `<b>Faces:</b> 20 triângulos<br><b>Volume:</b> (5φ²/6)a³`,
    };
    el.innerHTML = formulas[nome] || '—';
  }

  
  function _injectStyles() {
    if (document.getElementById('geo3d-styles')) return;
    const s = document.createElement('style');
    s.id = 'geo3d-styles';
    s.textContent = `
      .geo3d-box {
        width: 92vw; max-width: 1100px; height: 86vh;
        background: var(--bg-2, #1a1612); border-radius: 20px;
        display: flex; flex-direction: column; overflow: hidden;
        border: 1px solid var(--border, #3a3228);
        box-shadow: 0 24px 80px rgba(0,0,0,.7);
      }
      .geo3d-header {
        padding: 14px 20px; border-bottom: 1px solid var(--border, #3a3228);
        display: flex; justify-content: space-between; align-items: center;
        background: var(--bg-1, #120f0b);
      }
      .geo3d-title { font-size: 16px; font-weight: 700; color: var(--text-0, #f0e6d3); }
      .geo3d-close { background: none; border: none; color: var(--text-2, #8a7a6a); font-size: 22px; cursor: pointer; padding: 2px 6px; border-radius: 6px; }
      .geo3d-close:hover { background: var(--bg-3, #211d18); color: var(--text-0); }
      .geo3d-layout {
        flex: 1; display: grid; overflow: hidden;
        grid-template-columns: 180px 1fr 180px;
        gap: 0;
      }
      .geo3d-sidebar {
        background: var(--bg-1, #120f0b); border-right: 1px solid var(--border, #3a3228);
        padding: 14px 10px; overflow-y: auto; display: flex; flex-direction: column; gap: 2px;
      }
      .geo3d-info {
        background: var(--bg-1, #120f0b); border-left: 1px solid var(--border, #3a3228);
        padding: 14px 12px; overflow-y: auto;
      }
      .geo3d-main { background: #0d0d0d; overflow: hidden; position: relative; }
      .geo3d-section-label {
        font-size: 10px; font-weight: 700; color: var(--text-3, #5a4a3a);
        text-transform: uppercase; letter-spacing: 1px; padding: 4px 2px 2px;
      }
      .geo3d-toggle { display: flex; gap: 4px; }
      .geo3d-toggle-btn {
        flex: 1; padding: 6px 0; border-radius: 8px; border: 1px solid var(--border, #3a3228);
        background: none; color: var(--text-2, #8a7a6a); font-size: 12px; font-weight: 600; cursor: pointer;
        transition: all 0.15s;
      }
      .geo3d-toggle-btn.active {
        background: var(--accent, #e8a04a); color: #1a0f00; border-color: var(--accent, #e8a04a);
      }
      .geo3d-shape-list { display: flex; flex-direction: column; gap: 2px; }
      .geo3d-shape-btn {
        text-align: left; padding: 7px 10px; background: none; border: none;
        color: var(--text-2, #8a7a6a); font-size: 12px; cursor: pointer;
        border-radius: 8px; transition: all 0.15s;
      }
      .geo3d-shape-btn:hover { background: var(--bg-3, #211d18); color: var(--text-0); }
      .geo3d-shape-btn.active {
        background: color-mix(in srgb, var(--accent,#e8a04a) 18%, transparent);
        color: var(--accent, #e8a04a); font-weight: 600;
      }
      .geo3d-color-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
      .geo3d-color-presets { display: flex; flex-wrap: wrap; gap: 5px; }
      .geo3d-swatch {
        width: 18px; height: 18px; border-radius: 50%; cursor: pointer;
        border: 2px solid transparent; transition: border-color 0.15s;
      }
      .geo3d-swatch:hover { border-color: white; }
      .geo3d-check {
        display: flex; align-items: center; gap: 7px; font-size: 12px;
        color: var(--text-2, #8a7a6a); cursor: pointer; padding: 4px 0;
      }
      .geo3d-check input { accent-color: var(--accent, #e8a04a); }
      .geo3d-xyz-labels {
        position: absolute; bottom: 14px; left: 14px; display: flex; gap: 8px;
      }
      .geo3d-xyz-x { font-size: 12px; font-weight: 700; color: #e07070; }
      .geo3d-xyz-y { font-size: 12px; font-weight: 700; color: #70e070; }
      .geo3d-xyz-z { font-size: 12px; font-weight: 700; color: #7090e8; }
      .geo3d-stats-overlay {
        position: absolute; bottom: 14px; left: 14px;
        background: rgba(0,0,0,.75); backdrop-filter: blur(4px);
        padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border, #3a3228);
        pointer-events: none;
      }
      .geo3d-formula-box {
        background: var(--bg-3, #211d18); border-radius: 10px; padding: 12px;
        font-size: 12px; color: var(--text-1, #c8b89a); line-height: 1.9;
        border: 1px solid var(--border, #3a3228);
      }
      .geo3d-formula-box b { color: var(--accent, #e8a04a); }
      .geo3d-medidas-box { display: flex; flex-direction: column; gap: 6px; }
      .geo3d-medida-row { display: flex; flex-direction: column; gap: 4px; }
      .geo3d-medida-label { font-size: 11px; color: var(--text-3, #5a4a3a); }
      .geo3d-medida-val { font-size: 12px; color: var(--accent, #e8a04a); text-align: right; }
      #geo3d-dims { color: var(--text-2, #8a7a6a); font-size: 12px; line-height: 1.8; }
      #geo3d-dims b { color: var(--accent, #e8a04a); }
    `;
    document.head.appendChild(s);
  }

  return {
    abrir, fechar, setModo, setSolido, setCor,
    toggleWireframe, toggleAnimar, togglePlano, toggleEixos, setTamanho
  };
})();


(function injetarGeometria3D() {
  function add() {
    const menus = document.querySelectorAll('.mt-dropdown-content:not(.geo3d-processed)');
    if (!menus.length) return;
    menus.forEach(menu => {
      menu.classList.add('geo3d-processed');

      const sep = document.createElement('div');
      sep.style.cssText = 'height:1px;background:var(--border,#3a3228);margin:4px 10px;opacity:0.3;';

      const btn = document.createElement('button');
      btn.innerHTML = '📐 Geometria 3D';
      btn.onclick = (e) => {
        e.stopPropagation();
        menu.classList.remove('show');
        GeometriaInterativa.abrir();
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
  const obs = new MutationObserver(() => add());
  obs.observe(document.body, { childList: true, subtree: true });
  add();
})();

window.GeometriaInterativa = GeometriaInterativa;