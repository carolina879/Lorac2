

const GeologiaTectonica = (() => {
    const MODAL_ID = 'modal-geologia-tectonica';
    const USGS_API = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
    const PLATES_API = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

    const PLACAS_META = {
        'NA': { cor: '#a0e8c4', mov: { x: -0.4, y: 0.1 }, desc: 'Placa Norte-Americana: Abrange a América do Norte e Groenlândia.' },
        'SA': { cor: '#f472b6', mov: { x: -0.8, y: 0 },   desc: 'Placa Sul-Americana: Colide com Nazca criando os Andes.' },
        'AF': { cor: '#fbbf24', mov: { x: 0.5, y: 0.2 },  desc: 'Placa Africana: Afasta-se da América do Sul no Atlântico.' },
        'EU': { cor: '#c084fc', mov: { x: 0.2, y: -0.1 }, desc: 'Placa Eurasiática: Abrange a maior parte da Europa e Ásia.' },
        'PA': { cor: '#60a5fa', mov: { x: -1.0, y: -0.5 }, desc: 'Placa do Pacífico: Forma o cinturão de fogo do Pacífico.' },
        'IN': { cor: '#f87171', mov: { x: 0.3, y: -1.2 }, desc: 'Placa Indiana: Empurra a Ásia formando o Himalaia.' },
        'AU': { cor: '#60a5fa', mov: { x: 0.8, y: -0.8 }, desc: 'Placa Australiana: Abrange a Austrália e oceanos vizinhos.' },
        'AN': { cor: '#f1f5f9', mov: { x: 0, y: 0.1 },    desc: 'Placa Antártica: Cobre o continente gelado no polo sul.' },
        'NZ': { cor: '#fb923c', mov: { x: 1.2, y: 0 },   desc: 'Placa de Nazca: Placa oceânica em subducção sob a América do Sul.' },
        'CO': { cor: '#7dd3fc', mov: { x: 0.8, y: 0.4 },  desc: 'Placa de Cocos: Placa oceânica na América Central.' },
        'PH': { cor: '#f472b6', mov: { x: -1.2, y: 0.2 }, desc: 'Placa das Filipinas: Zona de intensa atividade vulcânica.' },
        'AR': { cor: '#facc15', mov: { x: 0.2, y: 0.6 },  desc: 'Placa Arábica: Afasta-se da África criando o Mar Vermelho.' },
        'SC': { cor: '#a78bfa', mov: { x: 0.5, y: -0.1 }, desc: 'Placa de Scotia: Localizada entre a América do Sul e Antártica.' },
        'CA': { cor: '#fb7185', mov: { x: 0.4, y: 0.2 },  desc: 'Placa do Caribe: Zona de compressão entre as Américas.' }
    };

    let _state = {
        animando: false,
        mostrarTerremotos: true,
        terremotos: [],
        placas: [],
        offset: 0
    };

    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'ex-modal-overlay gt-overlay';
        modal.innerHTML = `
            <div class="gt-box">
                <div class="gt-header">
                    <div class="gt-title">
                        <span class="gt-icon">🌋</span>
                        <div>
                            <h2>Geodinâmica Global</h2>
                            <p>Monitoramento sísmico e deriva continental</p>
                        </div>
                    </div>
                    <button class="gt-close" onclick="GeologiaTectonica.fechar()">✕</button>
                </div>

                <div class="gt-main">
                    <div class="gt-toolbar-top">
                        <div class="gt-stat-pill">📡 Monitoramento: <span id="gt-status-text">Live</span></div>
                        <div class="gt-stat-pill">🕒 Escala Temporal: <span>1M anos/seg</span></div>
                        <div class="gt-stat-pill">🌀 Camada: <span>Limites de Placas</span></div>
                    </div>

                    <div class="gt-map-container" id="gt-map-container">
                        <!-- O Mapa será injetado aqui -->
                        <svg id="gt-svg-map" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
                            <rect width="800" height="400" fill="#0f172a" />
                            <g id="gt-plates-group"></g>
                            <g id="gt-quakes-group"></g>
                        </svg>
                        
                        <div id="gt-compass">N</div>

                        <div class="gt-legend">
                            <div class="gt-legend-item"><span style="background:var(--accent)"></span> Movimento Relativo</div>
                            <div class="gt-legend-item"><span class="gt-legend-pulse"></span> Atividade Sísmica (24h)</div>
                        </div>
                    </div>

                    <div class="gt-sidebar">
                        <div class="gt-info-card" id="gt-info-card">
                            <h3>Exploração Tectônica</h3>
                            <p>O planeta está em constante mudança. Ative a simulação para visualizar a deriva das placas ou clique nos círculos pulsantes para ver dados reais de terremotos capturados pela rede USGS.</p>
                        </div>

                        <div class="gt-controls">
                            <button class="gt-btn-primary" id="gt-anim-btn" onclick="GeologiaTectonica.toggleAnimacao()">
                                ▶️ Simular Deriva
                            </button>
                            <div class="gt-divider-h"></div>
                        </div>

                        <div class="gt-quakes-list">
                            <h4>Últimos Terremotos (M4.5+)</h4>
                            <div id="gt-list-inner">Carregando dados do USGS...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        _carregarDadosPlacas();
        carregarTerremotos();
    }

    async function _carregarDadosPlacas() {
        const group = document.getElementById('gt-plates-group');
        if (!group) return;
        group.innerHTML = '<text x="400" y="200" fill="white" text-anchor="middle">Sincronizando modelos geográficos...</text>';

        try {
            const res = await fetch(PLATES_API);
            const data = await res.json();
            
            _state.placas = data.features.map(f => {
                const code = f.properties.Code;
                const meta = PLACAS_META[code] || { cor: '#64748b', mov: { x: 0.1, y: 0.1 }, desc: 'Placa tectônica menor.' };
                return {
                    id: code,
                    nome: f.properties.PlateName,
                    path: _projectGeoJSON(f.geometry),
                    ...meta
                };
            });

            group.innerHTML = _state.placas.map(p => `
                <g id="group-${p.id}" style="transition: transform 0.5s ease-out">
                    <path d="${p.path}" fill="${p.cor}" fill-opacity="0.25" stroke="${p.cor}" stroke-width="1.5" 
                          class="gt-plate-path" style="filter: drop-shadow(0 0 8px ${p.cor}66);"
                          onclick="GeologiaTectonica.detalharPlaca('${p.id}')">
                        <title>${p.nome}</title>
                    </path>
                </g>
            `).join('');
        } catch (e) {
            group.innerHTML = '<text x="400" y="200" fill="#f87171" text-anchor="middle">Falha na API: Limites geográficos indisponíveis.</text>';
        }
    }

    function _projectGeoJSON(geom) {
        const project = (coords) => coords.map((ring, rIdx) => 
            ring.map((pt, i) => {
                const x = (pt[0] + 180) * (800 / 360);
                const y = (90 - pt[1]) * (400 / 180);
                return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)},${y.toFixed(1)}`;
            }).join(' ') + ' Z'
        ).join(' ');

        if (geom.type === 'Polygon') return project(geom.coordinates);
        if (geom.type === 'MultiPolygon') return geom.coordinates.map(poly => project(poly)).join(' ');
        return '';
    }

    async function carregarTerremotos() {
      
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        defs.innerHTML = `
            <marker id="arrowhead-gt" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="white" />
            </marker>
        `;
        document.getElementById('gt-svg-map').prepend(defs);
        const list = document.getElementById('gt-list-inner');
        const group = document.getElementById('gt-quakes-group');
        if (list) list.innerHTML = 'Buscando dados...';
        
        try {
            const res = await fetch(USGS_API);
            const data = await res.json();
            _state.terremotos = data.features.filter(f => f.properties.mag > 4.0).slice(0, 15);
            
            if (list) {
                list.innerHTML = _state.terremotos.map((q, i) => `
                    <div class="gt-quake-item" onclick="GeologiaTectonica.focarQuake(${i})">
                        <div class="gt-quake-mag">M ${q.properties.mag.toFixed(1)}</div>
                        <div class="gt-quake-info">
                            <div class="gt-quake-place">${q.properties.place}</div>
                            <div class="gt-quake-time">${new Date(q.properties.time).toLocaleTimeString()}</div>
                        </div>
                    </div>
                `).join('');
            }

            if (group) {
                group.innerHTML = _state.terremotos.map(q => {
                    const x = (q.geometry.coordinates[0] + 180) * (800 / 360);
                    const y = (90 - q.geometry.coordinates[1]) * (400 / 180);
                    const size = q.properties.mag * 1.8;
                    return `<g class="gt-quake-dot">
                        <circle cx="${x}" cy="${y}" r="${size}" fill="#ef4444" fill-opacity="0.6" />
                        <circle cx="${x}" cy="${y}" r="${size}" fill="none" stroke="#ef4444" stroke-width="1" class="gt-quake-pulse" />
                    </g>`;
                }).join('');
            }
        } catch (e) {
            if (list) list.innerHTML = 'Erro ao carregar dados em tempo real.';
        }
    }

    function toggleAnimacao() {
        _state.animando = !_state.animando;
        const btn = document.getElementById('gt-anim-btn');
        
        btn.textContent = _state.animando ? '⏸️ Parar Simulação' : '▶️ Simular Deriva';
        
        if (_state.animando) _loop();
        else _resetPosicoes();
    }

    function _loop() {
        if (!_state.animando) return;
        _state.offset += 0.2;
        
        _state.placas.forEach(p => {
          const el = document.getElementById(`group-${p.id}`);
          if (el) {
           
            const moveX = Math.sin(_state.offset * 0.05) * p.mov.x * 10;
            const moveY = Math.sin(_state.offset * 0.05) * p.mov.y * 10;
            el.setAttribute('transform', `translate(${moveX}, ${moveY})`);
            
       
            el.style.filter = Math.abs(moveX) > 5 ? 'drop-shadow(0 0 2px rgba(255,255,255,0.1))' : 'none';
          }
        });
        requestAnimationFrame(_loop);
    }

    function detalharPlaca(id) {
        const placa = _state.placas.find(p => p.id === id);
        const info = document.getElementById('gt-info-card');
        if (!info || !placa) return;

        info.innerHTML = `
            <h3 style="color:${placa.cor}">${placa.nome}</h3>
            <p>${placa.desc}</p>
            <div style="margin-top:10px; font-size:12px; color:var(--text-3)">
                Vetor de Movimento: [X: ${placa.mov.x}, Y: ${placa.mov.y}]
            </div>
        `;
    }

    function focarQuake(idx) {
        const q = _state.terremotos[idx];
        const info = document.getElementById('gt-info-card');
        if (!info || !q) return;

        info.innerHTML = `
            <h3 style="color:#ef4444">⚠️ Evento Sísmico</h3>
            <p><strong>Magnitude:</strong> ${q.properties.mag.toFixed(1)} Richter</p>
            <p><strong>Local:</strong> ${q.properties.place}</p>
            <p><strong>Profundidade:</strong> ${q.geometry.coordinates[2]} km</p>
            <div class="gt-divider-h" style="margin:10px 0"></div>
            <p style="font-size:11px; color:var(--text-3)">Ocorrido em: ${new Date(q.properties.time).toLocaleString()}</p>
        `;
    }

    function _resetPosicoes() { document.querySelectorAll('[id^="group-"]').forEach(el => el.setAttribute('transform', 'translate(0,0)')); }

    function fechar() {
        _state.animando = false;
        document.getElementById(MODAL_ID)?.remove();
    }

    function _injectStyles() {
        if (document.getElementById('gt-styles')) return;
        const style = document.createElement('style');
        style.id = 'gt-styles';
        style.textContent = `
            .gt-box {
                width: min(1000px, 95vw);
                height: min(750px, 92vh);
                background: rgba(15, 17, 26, 0.98);
                border-radius: 20px;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                box-shadow: var(--shadow-lg);
            }
            .gt-header {
                padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08);
                display: flex; justify-content: space-between; align-items: center;
            }
            .gt-title { display: flex; gap: 15px; align-items: center; }
            .gt-title h2 { margin: 0; font-size: 20px; color: #fff; font-family:'DM Serif Display',serif; }
            .gt-title p { margin: 2px 0 0; font-size: 12px; color: rgba(255,255,255,0.4); text-transform:uppercase; letter-spacing:1px; }
            .gt-icon { font-size: 32px; }
            .gt-close { background: none; border: none; color: #fff; opacity:0.4; font-size: 24px; cursor: pointer; }
            
            .gt-main { flex: 1; display: flex; overflow: hidden; }
            .gt-map-container { flex: 1; position: relative; background: #020617; overflow:hidden; }
            #gt-svg-map { width: 100%; height: 100%; }
            .gt-plate-path { cursor: pointer; transition: 0.3s; }
            .gt-plate-path:hover { fill-opacity: 0.4; stroke-width: 3.5px; filter: drop-shadow(0 0 15px currentColor); }

            .gt-toolbar-top { position:absolute; top:15px; left:15px; display:flex; gap:10px; z-index:5; }
            .gt-stat-pill { background:rgba(0,0,0,0.6); padding:4px 12px; border-radius:20px; font-size:10px; color:#fff; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(4px); }
            #gt-compass { position:absolute; top:15px; right:15px; width:30px; height:30px; border:1px solid #fff; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#fff; font-size:12px; font-weight:bold; }
            
            .gt-sidebar { width: 320px; background: rgba(0,0,0,0.2); border-left: 1px solid rgba(255,255,255,0.08); padding: 20px; display: flex; flex-direction: column; gap: 20px; }
            .gt-btn-primary { background: var(--accent); color: var(--bg-0); border: none; padding: 12px; border-radius: 10px; font-weight: 600; cursor: pointer; }
            
            .gt-info-card { background: rgba(255,255,255,0.03); padding: 18px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
            .gt-info-card h3 { margin: 0 0 10px; font-size: 15px; color:var(--accent); }
            .gt-info-card p { margin: 0; font-size: 13px; color: rgba(255,255,255,0.6); line-height: 1.6; }
            
            .gt-quakes-list { flex: 1; overflow-y: auto; padding-right:5px; }
            .gt-quakes-list h4 { margin: 0 0 15px; font-size: 11px; text-transform: uppercase; color: #ef4444; letter-spacing: 1px; font-weight:700; }
            .gt-quake-item { display:flex; gap:12px; padding:12px; border-radius:12px; background:rgba(255,255,255,0.02); margin-bottom:8px; cursor:pointer; border:1px solid transparent; transition:0.2s; }
            .gt-quake-item:hover { background:rgba(255,255,255,0.05); border-color:rgba(239,68,68,0.3); }
            .gt-quake-mag { width:36px; height:36px; border-radius:8px; background:rgba(239,68,68,0.2); color:#ef4444; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:11px; }
            .gt-quake-place { font-size:12px; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:200px; }
            .gt-quake-time { font-size:10px; color:rgba(255,255,255,0.3); margin-top:2px; }
            
            .gt-legend { position: absolute; bottom: 20px; left: 20px; background: rgba(0,0,0,0.6); padding: 10px; border-radius: 8px; backdrop-filter: blur(4px); }
            .gt-legend-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #fff; margin-bottom: 5px; }
            .gt-legend-item span { width: 12px; height: 12px; display: block; }
            .gt-legend-pulse { width: 12px; height: 12px; border-radius:50%; border:1px solid #ef4444; animation: gt-pulse 1.5s infinite; }

            .gt-quake-pulse { animation: gt-pulse 2s infinite; transform-origin: center; }
            @keyframes gt-pulse { 0% { transform: scale(1); opacity: 0.8; } 100% { transform: scale(2.5); opacity: 0; } }
            .gt-divider-h { height:1px; background:rgba(255,255,255,0.08); width:100%; }
            
            .gt-quakes-list::-webkit-scrollbar { width: 4px; }
            .gt-quakes-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        `;
        document.head.appendChild(style);
    }

    return { abrir, fechar, toggleAnimacao, carregarTerremotos, detalharPlaca, focarQuake };
})();

window.GeologiaTectonica = GeologiaTectonica;