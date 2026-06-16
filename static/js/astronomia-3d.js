

const Astronomia3D = (() => {
  const MODAL_ID = 'modal-astronomia-3d';

  const SOL = {
    nome: 'Sol', tipo: 'estrela',
    cor: '#FDB813', corBrilho: '#FF8C00',
    raio: 4.2,
    massa: '1,989 × 10³⁰ kg',
    diametro: '1.391.000 km',
    temperatura: '5.778 K (superfície)',
    idade: '4,6 bilhões de anos',
    curiosidades: [
      'O Sol representa 99,86% da massa total do Sistema Solar.',
      'A luz do Sol leva 8 minutos e 20 segundos para chegar à Terra.',
      'No núcleo, a temperatura chega a 15 milhões de graus Celsius.',
    ],
  };

  const PLANETAS = [
    {
      nome: 'Mercúrio', id: 'mercurio',
      distancia: 9, velocidade: 4.74, raio: 0.38,
      inclinacao: 7, excentricidade: 0.21,
      cor: '#9E9E9E', corSecundaria: '#757575',
      massa: '3,285 × 10²³ kg',
      diametro: '4.879 km',
      satelites: 0,
      distanciaSol: '57,9 milhões de km',
      periodoOrbital: '88 dias terrestres',
      temperatura: '-180°C a 430°C',
      curiosidades: [
        'Mercúrio não tem atmosfera significativa.',
        'Um dia em Mercúrio dura 59 dias terrestres.',
        'É o planeta com maior variação de temperatura do Sistema Solar.',
      ],
    },
    {
      nome: 'Vênus', id: 'venus',
      distancia: 13, velocidade: 3.50, raio: 0.95,
      inclinacao: 3.4, excentricidade: 0.007,
      cor: '#E8B86D', corSecundaria: '#C47A2B',
      massa: '4,867 × 10²⁴ kg',
      diametro: '12.104 km',
      satelites: 0,
      distanciaSol: '108,2 milhões de km',
      periodoOrbital: '225 dias terrestres',
      temperatura: '465°C (média)',
      curiosidades: [
        'Vênus gira no sentido horário, ao contrário dos outros planetas.',
        'Um dia em Vênus é mais longo que um ano venusiano.',
        'A pressão atmosférica é 90 vezes maior que a da Terra.',
      ],
    },
    {
      nome: 'Terra', id: 'terra',
      distancia: 18, velocidade: 2.98, raio: 1.0,
      inclinacao: 0, excentricidade: 0.017,
      cor: '#4B9CD3', corSecundaria: '#228B22',
      corTerceira: '#8B7355',
      massa: '5,972 × 10²⁴ kg',
      diametro: '12.742 km',
      satelites: 1,
      distanciaSol: '149,6 milhões de km (1 UA)',
      periodoOrbital: '365,25 dias',
      temperatura: '-88°C a 58°C',
      curiosidades: [
        'A Terra é o único planeta conhecido com vida.',
        '71% da superfície é coberta por água líquida.',
        'O campo magnético protege a vida das radiações solares.',
      ],
      lua: { nome: 'Lua', distancia: 2.2, velocidade: 12, raio: 0.27, cor: '#AAAAAA' },
    },
    {
      nome: 'Marte', id: 'marte',
      distancia: 25, velocidade: 2.41, raio: 0.53,
      inclinacao: 1.85, excentricidade: 0.093,
      cor: '#CD4A1A', corSecundaria: '#8B2500',
      massa: '6,39 × 10²³ kg',
      diametro: '6.779 km',
      satelites: 2,
      distanciaSol: '227,9 milhões de km',
      periodoOrbital: '687 dias terrestres',
      temperatura: '-125°C a 20°C',
      curiosidades: [
        'Marte tem o maior vulcão do Sistema Solar: Olympus Mons (22 km de altura).',
        'Um dia marciano (sol) dura 24h 37min.',
        'Os rovers da NASA já confirmaram que Marte teve água líquida.',
      ],
    },
    {
      nome: 'Júpiter', id: 'jupiter',
      distancia: 40, velocidade: 1.31, raio: 2.8,
      inclinacao: 1.3, excentricidade: 0.049,
      cor: '#C88B3A', corSecundaria: '#8B5A00',
      corTerceira: '#F4A460',
      massa: '1,898 × 10²⁷ kg',
      diametro: '139.820 km',
      satelites: 95,
      distanciaSol: '778,5 milhões de km',
      periodoOrbital: '11,9 anos terrestres',
      temperatura: '-110°C (topo das nuvens)',
      curiosidades: [
        'A Grande Mancha Vermelha é uma tempestade que dura há mais de 350 anos.',
        'Júpiter tem mais do dobro da massa de todos os outros planetas juntos.',
        'Io, sua lua, é o corpo mais vulcanicamente ativo do Sistema Solar.',
      ],
    },
    {
      nome: 'Saturno', id: 'saturno',
      distancia: 58, velocidade: 0.97, raio: 2.3,
      inclinacao: 2.49, excentricidade: 0.057,
      cor: '#E4C07A', corSecundaria: '#C8A860',
      massa: '5,683 × 10²⁶ kg',
      diametro: '116.460 km',
      satelites: 146,
      distanciaSol: '1,43 bilhões de km',
      periodoOrbital: '29,5 anos terrestres',
      temperatura: '-140°C (topo das nuvens)',
      aneis: true,
      curiosidades: [
        'Os anéis de Saturno têm 270.000 km de diâmetro, mas apenas 1 km de espessura.',
        'Saturno é o planeta menos denso — flutuaria na água.',
        'Titã, sua maior lua, tem atmosfera mais densa que a da Terra.',
      ],
    },
    {
      nome: 'Urano', id: 'urano',
      distancia: 74, velocidade: 0.68, raio: 1.6,
      inclinacao: 0.77, excentricidade: 0.046,
      cor: '#7DE8E8', corSecundaria: '#40C0C0',
      massa: '8,681 × 10²⁵ kg',
      diametro: '50.724 km',
      satelites: 28,
      distanciaSol: '2,87 bilhões de km',
      periodoOrbital: '84 anos terrestres',
      temperatura: '-195°C (média)',
      curiosidades: [
        'Urano gira de lado — seu eixo é inclinado 98° em relação à órbita.',
        'Suas estações duram 21 anos terrestres cada.',
        'Urano emite menos calor interno que os outros gigantes gasosos.',
      ],
    },
    {
      nome: 'Netuno', id: 'netuno',
      distancia: 90, velocidade: 0.54, raio: 1.55,
      inclinacao: 1.77, excentricidade: 0.01,
      cor: '#3F54BA', corSecundaria: '#1A237E',
      massa: '1,024 × 10²⁶ kg',
      diametro: '49.244 km',
      satelites: 16,
      distanciaSol: '4,5 bilhões de km',
      periodoOrbital: '165 anos terrestres',
      temperatura: '-200°C (média)',
      curiosidades: [
        'Os ventos em Netuno chegam a 2.100 km/h, os mais rápidos do Sistema Solar.',
        'Netuno foi descoberto matematicamente antes de ser observado.',
        'Tritão, sua maior lua, orbita em sentido retrógrado.',
      ],
    },
  ];

  let _three = {
    scene: null, camera: null, renderer: null,
    animFrame: null, planetas: [], sol: null,
    raycaster: null, mouse: null,
    dragging: false, lastMouse: { x: 0, y: 0 },
    phi: Math.PI / 4, theta: 0, radius: 120,
    targetRadius: 120,
    focusPlanet: null, focusOffset: 0,
  };
  let _vel = 1.0;
  let _paused = false;
  let _selected = null;
  let _t = 0;

 
  
  function abrir() {
    document.getElementById(MODAL_ID)?.remove();
    _reset();
    _injectStyles();

    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.style.cssText = `
      position:fixed; inset:0; z-index:100005;
      background:#000; display:flex; flex-direction:column;
      font-family:'DM Sans',sans-serif;
    `;

    modal.innerHTML = `
     
      <div class="ast-topbar">
        <div class="ast-logo">🪐 <span>Sistema Solar 3D</span></div>
        <div class="ast-controls">
          <div class="ast-ctrl-group">
            <label class="ast-lbl">Velocidade</label>
            <input type="range" class="ast-slider" id="ast-vel" min="0" max="5" step="0.1" value="1"
              oninput="Astronomia3D._setVel(this.value)">
            <span class="ast-vel-val" id="ast-vel-val">1×</span>
          </div>
          <button class="ast-btn" id="ast-pause-btn" onclick="Astronomia3D._togglePause()">⏸ Pausar</button>
          <button class="ast-btn" onclick="Astronomia3D._resetCam()">🎯 Resetar Câmera</button>
          <button class="ast-btn ast-btn-close" onclick="Astronomia3D.fechar()">✕</button>
        </div>
      </div>

     
      <div class="ast-main">
        
        <canvas id="ast-canvas" class="ast-canvas"></canvas>

    
        <div class="ast-lista">
          <div class="ast-lista-item ast-sol-item" onclick="Astronomia3D._selectBody('sol')">
            <span class="ast-lista-dot" style="background:#FDB813;box-shadow:0 0 8px #FDB813"></span>
            Sol
          </div>
          ${PLANETAS.map(p => `
            <div class="ast-lista-item" id="ast-li-${p.id}" onclick="Astronomia3D._selectBody('${p.id}')">
              <span class="ast-lista-dot" style="background:${p.cor}"></span>
              ${p.nome}
              ${p.satelites > 0 ? `<span class="ast-sat-badge">${p.satelites}🌙</span>` : ''}
            </div>
          `).join('')}
        </div>

       
        <div class="ast-info" id="ast-info">
          <div class="ast-info-hint">
            <div style="font-size:32px;margin-bottom:12px">🌌</div>
            <p>Clique em um planeta<br>para ver seus dados</p>
            <p style="color:#333;font-size:11px;margin-top:12px">Arraste para girar · Scroll para zoom</p>
          </div>
        </div>
      </div>

     
      <div class="ast-footer">
        <span>🖱 Arrastar: girar câmera</span>
        <span>⚙ Scroll: zoom</span>
        <span>👆 Clique no planeta: info</span>
        <span>🎯 Duplo clique: focar planeta</span>
      </div>
    `;

    document.body.appendChild(modal);
    _initThree();
  }

  function fechar() {
    if (_three.animFrame) cancelAnimationFrame(_three.animFrame);
    if (_three.renderer) _three.renderer.dispose();
    document.getElementById(MODAL_ID)?.remove();
    _reset();
  }

  function _reset() {
    _three = {
      scene: null, camera: null, renderer: null,
      animFrame: null, planetas: [], sol: null,
      raycaster: null, mouse: null,
      dragging: false, lastMouse: { x: 0, y: 0 },
      phi: Math.PI / 4, theta: 0, radius: 120,
      targetRadius: 120,
      focusPlanet: null, focusOffset: 0,
    };
    _vel = 1.0; _paused = false; _selected = null; _t = 0;
  }

  
  function _initThree() {
    if (!window.THREE) { console.error('Three.js não carregado'); return; }
    const THREE = window.THREE;
    const canvas = document.getElementById('ast-canvas');
    const W = canvas.offsetWidth, H = canvas.offsetHeight;

    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000005);
    _three.scene = scene;

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 5000);
    _three.camera = camera;
    _updateCamPos();

    
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    _three.renderer = renderer;

    
    _three.raycaster = new THREE.Raycaster();
    _three.mouse = new THREE.Vector2();

 
    _addStars(THREE, scene);

    _addSol(THREE, scene);

    PLANETAS.forEach(p => _addPlaneta(THREE, scene, p));

 
    const luz = new THREE.PointLight(0xFFFAE0, 3, 0, 1.5);
    scene.add(luz);
    const ambient = new THREE.AmbientLight(0x111122, 0.8);
    scene.add(ambient);

    _addEvents(canvas);

    _animate();
  }

  function _addStars(THREE, scene) {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 2000;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true });
    scene.add(new THREE.Points(geo, mat));
  }

  function _addSol(THREE, scene) {
    const geo = new THREE.SphereGeometry(SOL.raio, 32, 32);
    const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color(SOL.cor) });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { tipo: 'sol' };
    scene.add(mesh);
    _three.sol = mesh;

    const glowGeo = new THREE.SphereGeometry(SOL.raio * 1.4, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FF6600'), transparent: true, opacity: 0.12, side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeo, glowMat));

    const g2 = new THREE.SphereGeometry(SOL.raio * 2.0, 32, 32);
    const m2 = new THREE.MeshBasicMaterial({ color: new THREE.Color('#FF4400'), transparent: true, opacity: 0.04, side: THREE.BackSide });
    scene.add(new THREE.Mesh(g2, m2));
  }

  function _addPlaneta(THREE, scene, dados) {

    const orbitaPts = [];
    const segs = 128;
    for (let i = 0; i <= segs; i++) {
      const ang = (i / segs) * Math.PI * 2;
      orbitaPts.push(new THREE.Vector3(
        Math.cos(ang) * dados.distancia,
        0,
        Math.sin(ang) * dados.distancia
      ));
    }
    const orbitaGeo = new THREE.BufferGeometry().setFromPoints(orbitaPts);
    const orbitaMat = new THREE.LineBasicMaterial({ color: new THREE.Color(dados.cor), transparent: true, opacity: 0.15 });
    scene.add(new THREE.Line(orbitaGeo, orbitaMat));

  
    const geo = new THREE.SphereGeometry(dados.raio, 32, 32);
    const mat = _makePlanetMaterial(THREE, dados);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.userData = { id: dados.id, tipo: 'planeta' };


    if (dados.aneis) {
      const ringGeo = new THREE.RingGeometry(dados.raio * 1.5, dados.raio * 2.8, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#C8A860'), transparent: true, opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.5;
      mesh.add(ring);
    }

    scene.add(mesh);

    let luaMesh = null;
    if (dados.lua) {
      const lg = new THREE.SphereGeometry(dados.lua.raio, 16, 16);
      const lm = new THREE.MeshLambertMaterial({ color: new THREE.Color(dados.lua.cor) });
      luaMesh = new THREE.Mesh(lg, lm);
      luaMesh.userData = { tipo: 'lua' };
      scene.add(luaMesh);
    }

    _three.planetas.push({ dados, mesh, luaMesh, angulo: Math.random() * Math.PI * 2 });
  }

  function _makePlanetMaterial(THREE, dados) {
   
    const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(dados.cor) });
    return mat;
  }

 
  function _animate() {
    _three.animFrame = requestAnimationFrame(_animate);
    const THREE = window.THREE;
    if (!THREE || !_three.renderer) return;

    if (!_paused) {
      _t += 0.01 * _vel;

    
      if (_three.sol) _three.sol.rotation.y += 0.002 * _vel;


      _three.planetas.forEach(obj => {
        obj.angulo += (obj.dados.velocidade * 0.001) * _vel;
        const x = Math.cos(obj.angulo) * obj.dados.distancia;
        const z = Math.sin(obj.angulo) * obj.dados.distancia;
        const y = Math.sin(obj.angulo * 0.5) * obj.dados.inclinacao * 0.08;
        obj.mesh.position.set(x, y, z);
        obj.mesh.rotation.y += 0.01 * _vel;

     
        if (obj.luaMesh) {
          const la = _t * obj.dados.lua.velocidade * 0.1;
          obj.luaMesh.position.set(
            x + Math.cos(la) * obj.dados.lua.distancia,
            y,
            z + Math.sin(la) * obj.dados.lua.distancia
          );
        }
      });
    }


    if (_three.focusPlanet) {
      _focusFollow();
    } else {
      _three.targetRadius += (_three.radius - _three.targetRadius) * 0.08;
      _updateCamPos();
    }

    _three.renderer.render(_three.scene, _three.camera);
  }

  function _updateCamPos() {
    if (!_three.camera) return;
    const r = _three.targetRadius;
    _three.camera.position.set(
      r * Math.sin(_three.phi) * Math.cos(_three.theta),
      r * Math.cos(_three.phi),
      r * Math.sin(_three.phi) * Math.sin(_three.theta)
    );
    _three.camera.lookAt(0, 0, 0);
  }

  function _focusFollow() {
    const obj = _three.planetas.find(p => p.dados.id === _three.focusPlanet);
    if (!obj || !_three.camera) return;
    _three.focusOffset += 0.005 * _vel;
    const pos = obj.mesh.position;
    const dist = obj.dados.raio * 6;
    _three.camera.position.set(
      pos.x + dist * Math.cos(_three.focusOffset),
      pos.y + dist * 0.5,
      pos.z + dist * Math.sin(_three.focusOffset)
    );
    _three.camera.lookAt(pos);
  }

  
  function _addEvents(canvas) {
    
    canvas.addEventListener('mousedown', e => {
      _three.dragging = true;
      _three.lastMouse = { x: e.clientX, y: e.clientY };
      _three.focusPlanet = null;
    });
    canvas.addEventListener('mousemove', e => {
      if (!_three.dragging) return;
      const dx = e.clientX - _three.lastMouse.x;
      const dy = e.clientY - _three.lastMouse.y;
      _three.theta -= dx * 0.005;
      _three.phi = Math.max(0.1, Math.min(Math.PI - 0.1, _three.phi + dy * 0.005));
      _three.lastMouse = { x: e.clientX, y: e.clientY };
    });
    canvas.addEventListener('mouseup', () => { _three.dragging = false; });
    canvas.addEventListener('mouseleave', () => { _three.dragging = false; });


    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      _three.radius = Math.max(15, Math.min(300, _three.radius + e.deltaY * 0.15));
      _three.targetRadius = _three.radius;
    }, { passive: false });

   
    canvas.addEventListener('click', e => {
      if (!_three.raycaster || !_three.camera) return;
      const rect = canvas.getBoundingClientRect();
      _three.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _three.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _three.raycaster.setFromCamera(_three.mouse, _three.camera);

      const meshes = [_three.sol, ..._three.planetas.map(p => p.mesh)].filter(Boolean);
      const hits = _three.raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) {
        const obj = hits[0].object;
        const uid = obj.userData.id || obj.userData.tipo;
        _selectBody(uid === 'sol' ? 'sol' : obj.userData.id);
      }
    });


    canvas.addEventListener('dblclick', e => {
      if (!_three.raycaster || !_three.camera) return;
      const rect = canvas.getBoundingClientRect();
      _three.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _three.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _three.raycaster.setFromCamera(_three.mouse, _three.camera);
      const meshes = _three.planetas.map(p => p.mesh).filter(Boolean);
      const hits = _three.raycaster.intersectObjects(meshes, true);
      if (hits.length > 0) {
        const id = hits[0].object.userData.id;
        if (id) {
          _three.focusPlanet = id;
          _three.focusOffset = 0;
        }
      }
    });


    window.addEventListener('resize', _onResize);

   
    let lastTouchDist = null;
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        _three.dragging = true;
        _three.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        if (lastTouchDist !== null) {
          _three.radius = Math.max(15, Math.min(300, _three.radius - (d - lastTouchDist) * 0.4));
          _three.targetRadius = _three.radius;
        }
        lastTouchDist = d;
      } else if (e.touches.length === 1 && _three.dragging) {
        const dx = e.touches[0].clientX - _three.lastMouse.x;
        const dy = e.touches[0].clientY - _three.lastMouse.y;
        _three.theta -= dx * 0.005;
        _three.phi = Math.max(0.1, Math.min(Math.PI - 0.1, _three.phi + dy * 0.005));
        _three.lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: false });
    canvas.addEventListener('touchend', () => { _three.dragging = false; lastTouchDist = null; });
  }

  function _onResize() {
    const canvas = document.getElementById('ast-canvas');
    if (!canvas || !_three.renderer || !_three.camera) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    _three.renderer.setSize(W, H);
    _three.camera.aspect = W / H;
    _three.camera.updateProjectionMatrix();
  }

  function _selectBody(id) {
    _selected = id;

    
    document.querySelectorAll('.ast-lista-item').forEach(el => el.classList.remove('ativo'));
    const li = document.getElementById(`ast-li-${id}`);
    if (li) li.classList.add('ativo');
    if (id === 'sol') document.querySelector('.ast-sol-item')?.classList.add('ativo');

    const info = document.getElementById('ast-info');
    if (!info) return;

    if (id === 'sol') {
      info.innerHTML = _renderInfoSol();
    } else {
      const p = PLANETAS.find(p => p.id === id);
      if (p) info.innerHTML = _renderInfoPlaneta(p);
    }
  }

  function _renderInfoSol() {
    return `
      <div class="ast-info-body">
        <div class="ast-info-icon" style="color:#FDB813;text-shadow:0 0 20px #FDB813">☀️</div>
        <h3 class="ast-info-nome" style="color:#FDB813">${SOL.nome}</h3>
        <span class="ast-info-tipo">Estrela · Tipo G (Anã Amarela)</span>
        <div class="ast-info-dados">
          <div class="ast-dado"><span class="ast-dado-l">Massa</span><span class="ast-dado-v">${SOL.massa}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Diâmetro</span><span class="ast-dado-v">${SOL.diametro}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Temperatura</span><span class="ast-dado-v">${SOL.temperatura}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Idade</span><span class="ast-dado-v">${SOL.idade}</span></div>
        </div>
        <div class="ast-curio">
          <h4>💡 Curiosidades</h4>
          ${SOL.curiosidades.map(c => `<p>${c}</p>`).join('')}
        </div>
      </div>
    `;
  }

  function _renderInfoPlaneta(p) {
    return `
      <div class="ast-info-body">
        <div class="ast-info-icon">${_getPlanetEmoji(p.id)}</div>
        <h3 class="ast-info-nome" style="color:${p.cor}">${p.nome}</h3>
        <span class="ast-info-tipo">Planeta · ${_getTipo(p)}</span>

        <div class="ast-size-bar">
          <div class="ast-size-fill" style="width:${(p.raio / 2.8) * 100}%; background:${p.cor}"></div>
        </div>
        <p class="ast-size-label">Tamanho relativo a Júpiter</p>

        <div class="ast-info-dados">
          <div class="ast-dado"><span class="ast-dado-l">Massa</span><span class="ast-dado-v">${p.massa}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Diâmetro</span><span class="ast-dado-v">${p.diametro}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Satélites</span><span class="ast-dado-v">${p.satelites === 0 ? 'Nenhum' : p.satelites + ' luas'}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Dist. do Sol</span><span class="ast-dado-v">${p.distanciaSol}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Período Orbital</span><span class="ast-dado-v">${p.periodoOrbital}</span></div>
          <div class="ast-dado"><span class="ast-dado-l">Temperatura</span><span class="ast-dado-v">${p.temperatura}</span></div>
        </div>

        <div class="ast-curio">
          <h4>💡 Curiosidades</h4>
          ${p.curiosidades.map(c => `<p>${c}</p>`).join('')}
        </div>

        <button class="ast-focar-btn" style="border-color:${p.cor};color:${p.cor}"
          onclick="Astronomia3D._focarPlaneta('${p.id}')">
          🔭 Focar em ${p.nome}
        </button>
      </div>
    `;
  }

  function _focarPlaneta(id) {
    _three.focusPlanet = id;
    _three.focusOffset = 0;
  }

  function _getPlanetEmoji(id) {
    const map = { mercurio:'☿', venus:'♀', terra:'🌍', marte:'🔴', jupiter:'🟠', saturno:'🪐', urano:'🔵', netuno:'💙' };
    return map[id] || '🪐';
  }

  function _getTipo(p) {
    if (['mercurio','venus','terra','marte'].includes(p.id)) return 'Rochoso Terrestre';
    if (['jupiter','saturno'].includes(p.id)) return 'Gigante Gasoso';
    return 'Gigante de Gelo';
  }


  function _setVel(v) {
    _vel = parseFloat(v);
    const el = document.getElementById('ast-vel-val');
    if (el) el.textContent = _vel.toFixed(1) + '×';
  }

  function _togglePause() {
    _paused = !_paused;
    const btn = document.getElementById('ast-pause-btn');
    if (btn) btn.textContent = _paused ? '▶ Retomar' : '⏸ Pausar';
  }

  function _resetCam() {
    _three.focusPlanet = null;
    _three.phi = Math.PI / 4;
    _three.theta = 0;
    _three.radius = 120;
    _three.targetRadius = 120;
  }

 
  function _injectStyles() {
    if (document.getElementById('ast-styles')) return;
    const s = document.createElement('style');
    s.id = 'ast-styles';
    s.textContent = `
      #modal-astronomia-3d * { box-sizing:border-box; }

     
      .ast-topbar {
        display:flex; align-items:center; justify-content:space-between;
        padding:10px 20px; background:rgba(0,0,0,0.9);
        border-bottom:1px solid #111; z-index:2; flex-shrink:0;
      }
      .ast-logo { color:#FDB813; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px; }
      .ast-logo span { color:#e8e8e8; font-weight:400; font-size:14px; }
      .ast-controls { display:flex; align-items:center; gap:12px; }
      .ast-ctrl-group { display:flex; align-items:center; gap:8px; }
      .ast-lbl { font-size:11px; color:#666; white-space:nowrap; }
      .ast-slider { width:100px; accent-color:#FDB813; cursor:pointer; }
      .ast-vel-val { font-size:12px; color:#FDB813; width:28px; }
      .ast-btn {
        background:#111; border:1px solid #222; color:#aaa;
        padding:6px 12px; border-radius:8px; cursor:pointer; font-size:12px;
        font-family:inherit; transition:all 0.2s; white-space:nowrap;
      }
      .ast-btn:hover { background:#1a1a1a; color:#eee; border-color:#444; }
      .ast-btn-close { color:#666; }
      .ast-btn-close:hover { color:#ff5555; border-color:#ff5555; }

     
      .ast-main { flex:1; position:relative; overflow:hidden; }
      .ast-canvas { width:100%; height:100%; display:block; cursor:grab; }
      .ast-canvas:active { cursor:grabbing; }

    
      .ast-lista {
        position:absolute; left:0; top:0; bottom:0;
        width:160px; background:rgba(0,0,0,0.75); border-right:1px solid #111;
        overflow-y:auto; padding:8px 0; backdrop-filter:blur(8px);
      }
      .ast-lista::-webkit-scrollbar { width:3px; }
      .ast-lista::-webkit-scrollbar-thumb { background:#222; }
      .ast-lista-item {
        display:flex; align-items:center; gap:10px;
        padding:9px 14px; cursor:pointer; font-size:12px; color:#888;
        transition:all 0.15s; border-left:2px solid transparent;
      }
      .ast-lista-item:hover { background:rgba(255,255,255,0.04); color:#ccc; }
      .ast-lista-item.ativo { background:rgba(255,255,255,0.06); color:#fff; border-left-color:#FDB813; }
      .ast-lista-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
      .ast-sat-badge { margin-left:auto; font-size:10px; color:#555; }


      .ast-info {
        position:absolute; right:0; top:0; bottom:0;
        width:280px; background:rgba(0,0,0,0.82); border-left:1px solid #111;
        overflow-y:auto; backdrop-filter:blur(8px);
      }
      .ast-info::-webkit-scrollbar { width:3px; }
      .ast-info::-webkit-scrollbar-thumb { background:#222; }
      .ast-info-hint { padding:40px 20px; text-align:center; color:#444; font-size:13px; line-height:1.7; }
      .ast-info-body { padding:20px 16px 32px; }
      .ast-info-icon { font-size:42px; text-align:center; display:block; margin-bottom:8px; }
      .ast-info-nome { margin:0 0 4px; font-size:20px; font-weight:700; font-family:'DM Serif Display',serif; text-align:center; }
      .ast-info-tipo { display:block; text-align:center; font-size:11px; color:#555; margin-bottom:14px; }
      .ast-size-bar { height:5px; background:#111; border-radius:3px; margin-bottom:4px; overflow:hidden; }
      .ast-size-fill { height:100%; border-radius:3px; transition:width 0.6s ease; }
      .ast-size-label { font-size:10px; color:#444; margin:0 0 14px; }
      .ast-info-dados { display:flex; flex-direction:column; gap:6px; margin-bottom:14px; }
      .ast-dado { display:flex; justify-content:space-between; align-items:baseline; padding:5px 8px; background:#0a0a0a; border-radius:6px; }
      .ast-dado-l { font-size:11px; color:#555; }
      .ast-dado-v { font-size:11px; color:#ccc; text-align:right; max-width:60%; }
      .ast-curio h4 { font-size:11px; color:#555; text-transform:uppercase; letter-spacing:0.5px; margin:0 0 8px; font-weight:600; }
      .ast-curio p { font-size:11px; color:#777; line-height:1.6; margin:0 0 6px; padding:6px 8px; background:#0a0a0a; border-radius:6px; border-left:2px solid #1e1e1e; }
      .ast-focar-btn {
        width:100%; margin-top:14px; padding:10px; background:transparent;
        border:1px solid; border-radius:8px; cursor:pointer; font-size:12px;
        font-family:inherit; font-weight:600; transition:all 0.2s;
      }
      .ast-focar-btn:hover { opacity:0.8; background:rgba(255,255,255,0.04); }

    
      .ast-footer {
        display:flex; gap:20px; align-items:center; justify-content:center;
        padding:8px 20px; background:rgba(0,0,0,0.9); border-top:1px solid #111;
        font-size:11px; color:#333; flex-shrink:0; flex-wrap:wrap;
      }

      @media (max-width:700px) {
        .ast-lista { width:110px; }
        .ast-info { width:200px; }
        .ast-controls { gap:6px; }
        .ast-ctrl-group { display:none; }
      }
    `;
    document.head.appendChild(s);
  }

  (function injetarAstronomia() {
    function add() {
      const menus = document.querySelectorAll('.mt-dropdown-content:not(.ast-processed)');
      if (!menus.length) return;
      menus.forEach(menu => {
        menu.classList.add('ast-processed');

        const sep = document.createElement('div');
        sep.style.cssText = 'height:1px;background:var(--border,#3a3228);margin:4px 10px;opacity:0.3;';

        const btn = document.createElement('button');
        btn.innerHTML = '🪐 Sistema Solar 3D';
        btn.onclick = (e) => {
          e.stopPropagation();
          menu.classList.remove('show');
          Astronomia3D.abrir();
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

 
  return { abrir, fechar, _setVel, _togglePause, _resetCam, _selectBody, _focarPlaneta };
})();

window.Astronomia3D = Astronomia3D;
