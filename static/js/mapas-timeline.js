const MapasTimeline = (() => {
  const MODAL_ID = 'modal-mapas-interativos';

  const CURIOSIDADES = {
    'BRA': 'Único país das Américas que fala português e dono da maior biodiversidade do planeta.',
    'USA': 'Berço de inovações que mudaram o mundo, como a internet e o GPS.',
    'CHN': 'Civilização milenar que inventou o papel, a pólvora e a bússola.',
    'FRA': 'Destino turístico número 1 do mundo, famoso pela Torre Eiffel e pelo Museu do Louvre.',
    'JPN': 'Líder mundial em tecnologia robótica e preservação de tradições milenares.',
    'DEU': 'Conhecida como a "Terra dos Poetas e Pensadores" e potência da engenharia.',
    'ITA': 'Berço do Renascimento e detentora do maior número de sites da UNESCO no mundo.',
    'PRT': 'Nação de grandes navegadores que expandiram as fronteiras do mundo conhecido.',
    'ARG': 'Lar do tango, das Cataratas do Iguaçu (lado sul) e de vinhos premiados.',
    'RUS': 'O maior país da Terra, abrangendo 11 fusos horários diferentes.'
  };

  const UF_CURIOSIDADES = {
    'AC': 'O Acre foi o último estado a ser incorporado ao território brasileiro.',
    'AL': 'Alagoas é famosa por suas praias de águas cristalinas, como Maragogi.',
    'AM': 'O Amazonas possui a maior floresta tropical do mundo.',
    'AP': 'O Amapá é o estado mais preservado do Brasil.',
    'BA': 'A Bahia foi o primeiro ponto de chegada dos portugueses.',
    'CE': 'O Ceará é famoso por suas dunas e jangadas em Jericoacoara.',
    'DF': 'Brasília, no DF, foi construída em apenas 41 meses.',
    'ES': 'O Espírito Santo é famoso por suas praias e montanhas.',
    'GO': 'Goiás é rico em águas termais e biodiversidade do Cerrado.',
    'MA': 'O Maranhão abriga os Lençóis Maranhenses.',
    'MG': 'Minas Gerais é famosa por sua culinária e cidades históricas.',
    'MS': 'Mato Grosso do Sul abriga a maior parte do Pantanal.',
    'MT': 'Mato Grosso é o gigante do agronegócio no Brasil.',
    'PA': 'O Pará é o berço do Açaí e do Círio de Nazaré.',
    'PB': 'A Paraíba possui o ponto mais oriental das Américas.',
    'PE': 'Pernambuco é a terra do Frevo e do Galo da Madrugada.',
    'PI': 'O Piauí tem o único delta em mar aberto das Américas.',
    'PR': 'O Paraná abriga as Cataratas do Iguaçu.',
    'RJ': 'O Rio de Janeiro é famoso pelo Cristo Redentor e Copacabana.',
    'RN': 'O Rio Grande do Norte tem o maior cajueiro do mundo.',
    'RO': 'Rondônia se destaca pela produção de café e madeira.',
    'RR': 'Roraima possui o majestoso Monte Roraima.',
    'RS': 'O Rio Grande do Sul é a terra dos Pampas e do Churrasco.',
    'SC': 'Santa Catarina é famosa por seu litoral e influência europeia.',
    'SE': 'Sergipe é o menor estado do Brasil em território.',
    'SP': 'São Paulo é o maior centro financeiro da América Latina.',
    'TO': 'Tocantins é o estado mais novo do Brasil, criado em 1988.'
  };

  const WORLD_BIOMES_DATA = {
    'Tundra': { nome: 'Tundra', car: 'Clima polar, solo congelado (permafrost).', desc: 'Localizada no extremo norte do globo. Vegetação composta por musgos e liquens adaptados ao frio extremo.', markers: [[71.29, -156.78], [69.44, 147.19], [70, -100], [65, -40], [70, 30], [72, 100]] },
    'Taiga': { nome: 'Taiga (Floresta Boreal)', car: 'Clima subártico, predominância de coníferas (pinheiros).', desc: 'Maior bioma terrestre do mundo, atravessando Alasca, Canadá e Rússia. Solo pobre em nutrientes.', markers: [[60.5, -115.0], [62.0, 129.7], [55, -100], [60, -60], [58, 40], [55, 100]] },
    'FlorestaTemperada': { nome: 'Floresta Temperada', car: 'Quatro estações bem definidas, árvores caducifólias.', desc: 'Presente na Europa e América do Norte. As árvores perdem as folhas no outono para sobreviver ao inverno.', markers: [[48.8, 12.5], [40.0, -77.0], [35, 105], [45, 15], [35, 140]] },
    'FlorestaTropical': { nome: 'Floresta Tropical', car: 'Clima quente e úmido, biodiversidade altíssima.', desc: 'Regiões equatoriais. Possui vegetação estratificada e chuvas abundantes o ano todo.', markers: [[-3.1, -60.0], [0.0, 25.0], [-1, 110], [15, -90], [10, 78]] },
    'Savana': { nome: 'Savana', car: 'Clima tropical com estação seca, gramíneas e árvores esparsas.', desc: 'Comum na África e América do Sul. Adaptada a incêndios sazonais e longas secas.', markers: [[-15.0, 20.0], [-13.0, -45.0], [-20, 130], [10, -5], [-10, 35]] },
    'Deserto': { nome: 'Deserto', car: 'Baixa pluviosidade, temperaturas extremas (dia/noite).', desc: 'Pode ser quente (Saara) ou frio (Gobi). Vegetação xerófila com raízes profundas ou reserva de água.', markers: [[23.0, 12.0], [42.0, 105.0], [-25, 120], [35, -115], [-23, -70]] },
    'Pradaria': { nome: 'Pradaria / Estepe', car: 'Campos temperados, solo rico em matéria orgânica.', desc: 'Presente nas planícies centrais dos EUA e na Eurásia. Clima com chuvas moderadas.', markers: [[40.0, -100.0], [-32.0, -55.0], [45, 70], [-25, 25], [50, 30]] }
  };

  const BIOMAS_DATA = {
    'Amazonia': { nome: 'Amazônia', area: '4,1 milhões km²', car: 'Maior floresta tropical do mundo, clima equatorial.', desc: 'Domínio das águas e da floresta latifoliada. Crucial para a regulação climática global.', coord: [-3.46, -62.21] },
    'Cerrado': { nome: 'Cerrado', area: '2 milhões km²', car: 'Savana brasileira, árvores de troncos tortuosos.', desc: 'Considerado o berço das águas do Brasil por abrigar nascentes de importantes bacias hidrográficas.', coord: [-15.77, -47.92] },
    'MataAtlantica': { nome: 'Mata Atlântica', area: '1,1 milhão km²', car: 'Altamente fragmentada, clima tropical úmido.', desc: 'Um dos biomas mais ricos em biodiversidade e, infelizmente, um dos mais ameaçados do mundo.', coord: [-22.90, -43.17] },
    'Caatinga': { nome: 'Caatinga', area: '844 mil km²', car: 'Bioma exclusivamente brasileiro, clima semiárido.', desc: 'Vegetação adaptada à escassez de água, como cactáceas e árvores que perdem folhas na seca.', coord: [-8.71, -39.31] },
    'Pampa': { nome: 'Pampa', area: '176 mil km²', car: 'Campos com relevo plano e vegetação rasteira.', desc: 'Restrito ao Rio Grande do Sul no Brasil, é ideal para a pecuária devido às suas pastagens naturais.', coord: [-30.03, -51.21] },
    'Pantanal': { nome: 'Pantanal', area: '150 mil km²', car: 'Maior planície alagável do mundo.', desc: 'Reserva da Biosfera da UNESCO. Caracteriza-se pelo ciclo de cheias e secas que renova o ecossistema.', coord: [-18.0, -56.5] }
  };

  const TIMELINE_EVENTS = [
    { ano: '1500', titulo: 'Chegada dos Portugueses', desc: 'Pedro Álvares Cabral chega ao litoral baiano.' },
    { ano: '1822', titulo: 'Independência do Brasil', desc: 'D. Pedro I proclama o Grito do Ipiranga em São Paulo.' },
    { ano: '1888', titulo: 'Abolição da Escravidão', desc: 'Princesa Isabel assina a Lei Áurea.' },
    { ano: '1889', titulo: 'Proclamação da República', desc: 'Marechal Deodoro da Fonseca encerra o Império.' },
    { ano: '1930', titulo: 'Revolução de 30', desc: 'Getúlio Vargas assume o governo.' },
    { ano: '1960', titulo: 'Inauguração de Brasília', desc: 'A nova capital federal é fundada no Planalto Central.' },
    { ano: '1988', titulo: 'Constituição Cidadã', desc: 'Promulgação da atual Constituição brasileira.' }
  ];

  async function abrir(tipo) {
    document.getElementById(MODAL_ID)?.remove();
    const modal = document.createElement('div');
    modal.id = MODAL_ID;
    modal.className = 'ex-modal-overlay';
    modal.style.zIndex = '100002';
    
    let content = '';
    if (tipo === 'world') content = _renderWorldMap();
    else if (tipo === 'brazil') content = _renderBrazilMap();
    else if (tipo === 'timeline') content = _renderTimeline();

    modal.innerHTML = `
      <div class="ex-modal-box ex-modal-large" style="max-width: 900px; height: 85vh; background: var(--bg-2); border-radius: 20px; display: flex; flex-direction: column; overflow: hidden;">
        <div class="ex-modal-header" style="padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin:0; color: var(--text-0);">${tipo === 'world' ? '🌍 Mundo: Países e Biomas' : tipo === 'brazil' ? '🇧🇷 Brasil: Estados e Biomas' : '⏳ Linha do Tempo'}</h3>
          <button class="ex-modal-close" onclick="MapasTimeline.fechar()" style="background: none; border: none; color: var(--text-2); font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <div class="ex-modal-body" style="flex: 1; overflow-y: auto; padding: 20px; background: var(--bg-1);">
          ${content}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    _injectStyles();

    if (tipo === 'world' || tipo === 'brazil') {
      await _loadLeafletLib();
      if (tipo === 'world') setTimeout(() => MapasTimeline.toggleMapMode('paises', 'world'), 50);
      else if (tipo === 'brazil') setTimeout(() => MapasTimeline.toggleMapMode('estados', 'brazil'), 50);
    }
  }

  async function _loadLeafletLib() {
    if (window.L) return;
    console.log('MapasTimeline: Carregando Leaflet via Blob para contornar bloqueios de storage...');
    const CDN = 'https://unpkg.com/leaflet@1.9.4/dist/';
    
    try {
      const [jsResp, cssResp] = await Promise.all([
        fetch(CDN + 'leaflet.js'),
        fetch(CDN + 'leaflet.css')
      ]);
      
      const jsText = await jsResp.text();
      const cssText = await cssResp.text();

      if (!document.getElementById('leaflet-css-blob')) {
        const style = document.createElement('style');
        style.id = 'leaflet-css-blob';
        style.textContent = cssText;
        document.head.appendChild(style);
      }

      const blob = new Blob([jsText], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      await new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = url; s.onload = resolve;
        document.head.appendChild(s);
      });
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Erro crítico ao carregar Leaflet:', e);
    }
  }

  function fechar() {
    document.getElementById(MODAL_ID)?.remove();
  }

  async function _initLeafletMap() {
    const container = document.getElementById('world-map-leaflet');
    if (!container || typeof L === 'undefined') return;

    const map = L.map('world-map-leaflet', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        minZoom: 2
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    try {
      const response = await fetch('https://raw.githubusercontent.com/datasets/geo-boundaries-world-110m/master/countries.geojson');
      const geoData = await response.json();

      L.geoJSON(geoData, {
        style: {
          fillColor: 'var(--accent)',
          weight: 1,
          opacity: 0.5,
          color: 'var(--border)',
          fillOpacity: 0.1
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => {
              e.target.setStyle({ fillOpacity: 0.4 });
            },
            mouseout: (e) => {
              e.target.setStyle({ fillOpacity: 0.1 });
            },
            click: (e) => {
              const props = feature.properties;
              const code = props.iso_a3 || props.ISO_A3 || props.adm0_a3 || props.ADM0_A3 || props.id || props.ISO_A2;
              if (code && code !== "-99") {
                MapasTimeline.showInfo(code, props.name || props.NAME);
              }
            }
          });
        }
      }).addTo(map);
    } catch (e) {
      console.error('Erro ao carregar GeoJSON:', e);
    }
  }

  async function _initLeafletBrazilMap() {
    const container = document.getElementById('brazil-leaflet-map');
    if (!container || typeof L === 'undefined') return;

    const map = L.map('brazil-leaflet-map', {
        center: [-14.5, -54.5],
        zoom: 4,
        zoomControl: false,
        minZoom: 3
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    try {
      const response = await fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson');
      const geoData = await response.json();

      L.geoJSON(geoData, {
        style: {
          fillColor: 'var(--accent)',
          weight: 1.5,
          opacity: 0.6,
          color: 'var(--border)',
          fillOpacity: 0.1
        },
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => { e.target.setStyle({ fillOpacity: 0.4 }); },
            mouseout: (e) => { e.target.setStyle({ fillOpacity: 0.1 }); },
            click: (e) => {
              const props = feature.properties;
              const code = props.sigla || props.SIGLA || props.id || props.UF_05 || feature.id;
              if (code) {
                MapasTimeline.showBrazilInfo(code, props.name || props.NAME || props.NM_ESTADO);
              }
            }
          });
        }
      }).addTo(map);
    } catch (e) {
      console.error('Erro ao carregar GeoJSON Brasil:', e);
    }
  }

  function _renderWorldMap() {
    return `
      <div class="map-container mt-modal-world" style="height:100%; display:flex; flex-direction:column; padding:0;">
        <div class="map-tabs" style="padding: 10px; flex-shrink:0;">
          <button class="m-tab active" data-mode="paises" onclick="MapasTimeline.toggleMapMode('paises', 'world')">🗺️ Países</button>
          <button class="m-tab" data-mode="biomas" onclick="MapasTimeline.toggleMapMode('biomas', 'world')">🌿 Biomas</button>
        </div>
        <div id="world-content" style="flex:1; width:100%; min-height:400px; overflow:hidden;"></div>
        <div id="map-info-box" class="map-info-card" style="display:none; margin-top: 20px;"></div>
      </div>
    `;
  }

  function _renderBrazilMap() {
    return `
      <div class="map-container mt-modal-brazil" style="height:100%; display:flex; flex-direction:column; padding:0;">
        <div class="map-tabs" style="padding: 10px; flex-shrink:0;">
          <button class="m-tab active" data-mode="estados" onclick="MapasTimeline.toggleMapMode('estados', 'brazil')">🗺️ Estados</button>
          <button class="m-tab" data-mode="biomas" onclick="MapasTimeline.toggleMapMode('biomas', 'brazil')">🌿 Biomas</button>
        </div>
        <div id="brazil-content" style="flex:1; width:100%; min-height:400px; overflow:hidden;"></div>
        <div id="biome-info-box" class="map-info-card" style="display:none; margin-top: 10px;"></div>
      </div>
    `;
  }

  async function _initLeafletBrazilBiomesMap() {
    const container = document.getElementById('brazil-content');
    if (!container || typeof L === 'undefined') return;

    container.innerHTML = `<div id="brazil-biomes-leaflet" style="width:100%; height:100%; min-height:400px; background:#111; border-radius:12px;"></div>`;

    const map = L.map('brazil-biomes-leaflet', {
        center: [-14.5, -54.5],
        zoom: 4,
        zoomControl: false,
        minZoom: 3
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(map);

    const biomeIcon = (color) => L.divIcon({
      className: 'map-marker-pulse',
      html: `<div style="background:${color}; width:16px; height:16px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 12px ${color};"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const colors = {
      'Amazonia': '#2d5a27', 'Cerrado': '#c4a45a', 'MataAtlantica': '#7a9e7e',
      'Caatinga': '#d4a44a', 'Pantanal': '#6aba8a', 'Pampa': '#8aca6a'
    };

    Object.keys(BIOMAS_DATA).forEach(id => {
      const biome = BIOMAS_DATA[id];
      if (biome.coord) {
        L.marker(biome.coord, { icon: biomeIcon(colors[id] || 'var(--accent)') })
         .addTo(map)
         .on('click', () => MapasTimeline.showBiome(id, false));
      }
    });
  }

  async function _initLeafletWorldBiomesMap() {
    const container = document.getElementById('world-biomes-leaflet');
    if (!container || typeof L === 'undefined') return;

    const map = L.map('world-biomes-leaflet', {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
        minZoom: 2
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const biomeIcon = (color) => L.divIcon({
      className: 'map-marker-pulse',
      html: `<div style="background:${color}; width:14px; height:14px; border-radius:50%; border:2px solid #fff; box-shadow:0 0 10px ${color};"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    const colors = {
      'Tundra': '#a0c4e8', 'Taiga': '#2d5a27', 'FlorestaTemperada': '#7a9e7e',
      'FlorestaTropical': '#1e4d1a', 'Savana': '#d4a44a', 'Deserto': '#c4a45a', 'Pradaria': '#8aca6a'
    };

    Object.keys(WORLD_BIOMES_DATA).forEach(id => {
      const biome = WORLD_BIOMES_DATA[id];
      if (biome.markers) {
        biome.markers.forEach(coord => {
          L.marker(coord, { icon: biomeIcon(colors[id] || 'var(--accent)') })
           .addTo(map)
           .on('click', () => MapasTimeline.showBiome(id, true));
        });
      }
    });
  }

  function _renderTimeline() {
    return `
      <div class="timeline-container" style="position: relative; width: 100%; min-height: 400px;">
        <div class="timeline-line" style="position: absolute; top: 50%; left: 5%; right: 5%; height: 3px; background: var(--bg-4); border-radius: 2px;"></div>
        <div class="timeline-items" style="position: relative; display: flex; justify-content: space-between; padding: 0 5%;">
          ${TIMELINE_EVENTS.map((ev, i) => `
            <div class="timeline-item" style="text-align: center; cursor: pointer; flex: 1;" onclick="MapasTimeline.showEvent(${i})">
              <div class="timeline-dot" style="width: 16px; height: 16px; background: var(--bg-4); border: 3px solid var(--bg-1); border-radius: 50%; margin: 0 auto 10px auto; transition: all 0.2s;"></div>
              <div class="timeline-year" style="font-family: var(--font-mono); font-size: 13px; font-weight: 700; color: var(--accent);">${ev.ano}</div>
              <div class="timeline-title" style="font-size: 11px; color: var(--text-2); margin-top: 4px;">${ev.titulo}</div>
            </div>
          `).join('')}
        </div>
        <div id="timeline-detail" class="timeline-detail-box" style="margin-top: 40px; background: var(--bg-3); border-radius: 16px; padding: 20px; text-align: center; border: 1px solid var(--border); color: var(--text-2);">Clique em um evento acima.</div>
      </div>
    `;
  }

  async function showBrazilInfo(sigla, ufName) {
    sigla = String(sigla || '');
    const box = document.getElementById('biome-info-box');
    if (!box) return;

    box.style.display = 'block';
    box.innerHTML = `<div style="text-align:center;padding:10px;"><span style="animation:spin 1s linear infinite;display:inline-block;">⏳</span> Buscando detalhes de ${ufName}...</div>`;

    let apiData = null;
    try {
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${sigla}`);
      if (res.ok) apiData = await res.json();
    } catch (e) {
      console.warn('MapasTimeline: Falha ao buscar dados do IBGE.', e);
    }

    const finalData = {
      nome: apiData?.nome || ufName || sigla,
      regiao: apiData?.regiao?.nome || '—',
      id: apiData?.id || '—',
      offline: !apiData
    };

    const ufSigla = apiData?.sigla || sigla;
    const curiosity = UF_CURIOSIDADES[ufSigla] || 'Um estado vibrante com cultura e história únicas.';

    box.innerHTML = `
      <div style="animation: bqFadeIn 0.3s ease;">
        <div>
          <h4 style="color: var(--accent); margin: 0 0 10px; font-size:20px;">${finalData.nome} (${ufSigla})</h4>
          <p style="margin:4px 0;"><strong>Região:</strong> ${finalData.regiao}</p>
          <p style="margin:4px 0;"><strong>ID IBGE:</strong> ${finalData.id}</p>
          ${finalData.offline ? '<p style="font-size:11px; color:var(--text-3); margin-top:4px;">⚠️ Dados em modo offline</p>' : ''}
          <div style="background:var(--bg-3); padding:12px; border-radius:10px; border-left:4px solid var(--accent); margin-top:15px;">
            <p style="font-style: italic; color: var(--text-1); margin:0;">💡 ${curiosity}</p>
          </div>
          <button class="btn-primary small" style="margin-top:10px; width:100%; border:none; padding:8px; border-radius:8px; cursor:pointer;" onclick="window.open('https://www.ibge.gov.br/cidades-e-estados/${ufSigla.toLowerCase()}.html', '_blank')">Ver perfil completo no IBGE ↗</button>
        </div>
      </div>
    `;
  }

  async function showInfo(countryCode, countryName) {
    const box = document.getElementById('map-info-box');
    if (!box) return;

    box.style.display = 'block';
    box.innerHTML = `<div style="text-align:center;padding:10px;"><span style="animation:spin 1s linear infinite;display:inline-block;">⏳</span> Buscando detalhes de ${countryName}...</div>`;

    let country = null;
    try {
      const res = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
      if (res.ok) {
        const data = await res.json();
        country = data[0];
      }
    } catch (e) {
      console.warn('MapasTimeline: Falha ao buscar país.', e);
    }

    if (!country) {
      const curiosity = CURIOSIDADES[countryCode] || 'Um país com história rica e diversidade cultural única.';
      box.innerHTML = `
        <div style="animation: bqFadeIn 0.3s ease;">
          <div>
            <h4 style="color: var(--accent); margin: 0 0 10px; font-size:20px;">${countryName}</h4>
            <p style="color:var(--text-3); font-size:12px;">⚠️ Detalhes indisponíveis no momento (Modo Offline)</p>
            <div style="background:var(--bg-3); padding:12px; border-radius:10px; border-left:4px solid var(--accent); margin-top:15px;">
              <p style="font-style: italic; color: var(--text-1); margin:0;">💡 ${curiosity}</p>
            </div>
          </div>
        </div>`;
      return;
    }

    const curiosity = CURIOSIDADES[country.cca3] || 'Um país com história rica e diversidade cultural única.';
    const nativeName = country.name.nativeName ? Object.values(country.name.nativeName)[0].common : country.name.common;

    box.innerHTML = `
      <div style="animation: bqFadeIn 0.3s ease;">
        <div>
          <h4 style="color: var(--accent); margin: 0 0 10px; font-size:20px;">${country.translations.por?.common || country.name.common}</h4>
          <p style="margin:4px 0;"><strong>Nome Nativo:</strong> ${nativeName}</p>
          <p style="margin:4px 0;"><strong>Capital:</strong> ${country.capital ? country.capital[0] : '—'}</p>
          <p style="margin:4px 0;"><strong>População:</strong> ${country.population.toLocaleString('pt-BR')} habitantes</p>
          <p style="margin:4px 0;"><strong>Região:</strong> ${country.region} (${country.subregion || '—'})</p>
          <p style="margin:4px 0;"><strong>Moeda:</strong> ${Object.values(country.currencies || {}).map(c => c.name + ' (' + c.symbol + ')').join(', ')}</p>
          <div style="background:var(--bg-3); padding:12px; border-radius:10px; border-left:4px solid var(--accent); margin-top:15px;">
            <p style="font-style: italic; color: var(--text-1); margin:0;">💡 ${curiosity}</p>
          </div>
        </div>
      </div>
    `;
  }

  function showBiome(id, isWorld = false) {
    const data = isWorld ? WORLD_BIOMES_DATA[id] : BIOMAS_DATA[id];
    const boxId = isWorld ? 'map-info-box' : 'biome-info-box';
    const box = document.getElementById(boxId);
    if (!data || !box) return;

    box.style.display = 'block';
    box.innerHTML = `
      <h4 style="color: var(--accent); margin-bottom: 12px;">Bioma: ${data.nome}</h4>
      ${data.area ? `<p><strong>Área aprox:</strong> ${data.area}</p>` : ''}
      <p><strong>Características:</strong> ${data.car}</p>
      <p style="margin-top:8px; font-size:13.5px; color:var(--text-1); line-height:1.6;">${data.desc || ''}</p>
    `;
  }

  function showEvent(idx) {
    const ev = TIMELINE_EVENTS[idx];
    const box = document.getElementById('timeline-detail');
    if (!ev || !box) return;
    box.innerHTML = `<h3 style="color: var(--text-0); margin-bottom: 12px;">${ev.ano} — ${ev.titulo}</h3><p>${ev.desc}</p>`;
    box.classList.add('active');
  }

  function toggleMapMode(mode, target = 'brazil') {
    const isBrazil = target === 'brazil';
    const containerId = isBrazil ? 'brazil-content' : 'world-content';
    const infoBoxId = isBrazil ? 'biome-info-box' : 'map-info-box';
    const container = document.getElementById(containerId);
    if (!container) return;
    
    document.querySelectorAll(`.mt-modal-${target} .m-tab`).forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
    });

    document.getElementById(infoBoxId).style.display = 'none';

    if (isBrazil) {
      if (mode === 'estados') {
        container.innerHTML = `<div id="brazil-leaflet-map" style="width:100%; height:100%; min-height:400px; background:#111; border-radius:12px;"></div>`;
        setTimeout(_initLeafletBrazilMap, 50);
      } else {
        setTimeout(_initLeafletBrazilBiomesMap, 50);
      }
    } else {
      if (mode === 'paises') {
        container.innerHTML = `<div id="world-map-leaflet" style="width:100%; height:100%; min-height:400px; background:#111; border-radius:12px;"></div>`;
        setTimeout(_initLeafletMap, 50);
      } else {
        container.innerHTML = `<div id="world-biomes-leaflet" style="width:100%; height:100%; min-height:400px; background:#111; border-radius:12px;"></div>`;
        setTimeout(_initLeafletWorldBiomesMap, 50);
      }
    }
  }

  function _injectStyles() {
    if (document.getElementById('map-timeline-styles')) return;
    const s = document.createElement('style');
    s.id = 'map-timeline-styles';
    s.textContent = `
      .land { cursor: pointer; transition: opacity 0.2s, filter 0.2s; filter: grayscale(0.2); }
      .land:hover { opacity: 0.8; filter: grayscale(0); }
      
      .map-info-card {
        background: var(--bg-2);
        border: 1px solid var(--border);
        border-radius: 12px;
        padding: 18px;
        animation: bqFadeIn 0.3s ease;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }
      .map-info-card h4 { font-family: var(--font-display); color: var(--accent); margin-bottom: 8px; font-size: 18px; }
      .map-info-card p { font-size: 14px; line-height: 1.5; color: var(--text-1); }

      .biome { transition: transform 0.2s; cursor: pointer; }
      .biome:hover { filter: brightness(1.2); transform: scale(1.02); }

      .map-tabs { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; }
      .m-tab { background: var(--bg-3); border: 1px solid var(--border); color: var(--text-2); padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.2s; }
      .m-tab.active { background: var(--accent); color: var(--bg-0); border-color: var(--accent); }

      .timeline-dot { transition: all 0.2s; }
      .timeline-item:hover .timeline-dot { background: var(--accent); transform: scale(1.3); }

      .map-marker-pulse { transition: transform 0.2s; cursor: pointer; }
      .map-marker-pulse:hover { transform: scale(1.4); z-index: 1000 !important; }
    `;
    document.head.appendChild(s);
  }

  return { abrir, fechar, showInfo, showBiome, showEvent, toggleMapMode, showBrazilInfo };
})();

(function injetarNoNav() {
  function add() {
    const navs = document.querySelectorAll('.header-nav');
    if (!navs.length) {
      setTimeout(add, 500);
      return;
    }

    if (typeof App === 'undefined') {
      console.log('MapasTimeline: App object not yet defined. Retrying in 200ms.');
      return setTimeout(add, 200);
    }

    navs.forEach(nav => {
      if (nav.querySelector('.mt-nav-dropdown')) return;

      const dashboardBtn = Array.from(nav.querySelectorAll('.nav-btn')).find(btn => 
        btn.getAttribute('onclick')?.toLowerCase().includes('showdashboard') || 
        btn.innerText.toLowerCase().includes('dashboard')
      );

      const dropdown = document.createElement('div');
      console.log('MapasTimeline: Dashboard button found:', !!dashboardBtn);
      dropdown.className = 'mt-nav-dropdown';
      dropdown.style.position = 'relative';
      dropdown.style.display = 'inline-block';

      dropdown.innerHTML = `
        <button class="nav-btn" onclick="this.nextElementSibling.classList.toggle('show')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:5px">
            <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
          Mundo
        </button>
        <div class="mt-dropdown-content">
          <div class="mt-dropdown-label">Sociedade & Geografia</div>
          <button onclick="MapasTimeline.abrir('world')">🌍 Mundo: Países e Biomas</button>
          <button onclick="MapasTimeline.abrir('brazil')">🇧🇷 Brasil: Estados e Biomas</button>
          <button onclick="LinhaDoTempoBrasil.abrir(); this.parentElement.classList.remove('show')">🇧🇷 Linha do Tempo do Brasil</button>
          <button onclick="MapasTimeline.abrir('timeline')">⏳ Linha do Tempo</button>
          <button onclick="DebateIA.abrir()">⚔️ Debate com IA</button>
          <button onclick="GaleriaArte.abrir()">🎨 Galeria de Arte</button>
          <button onclick="GeologiaTectonica.abrir()">🌋 Placas Tectônicas</button>
          <button onclick="EducacaoFinanceira.abrir()">💰 Finanças & Mercado</button>
          <button onclick="PrimeirosSocorros.abrir(); this.parentElement.classList.remove('show')">🚑 Primeiros Socorros</button>
          <button onclick="ViagemTempo.abrir(); this.parentElement.classList.remove('show')">⏳ Viagem no Tempo</button>
          <button onclick="window.location.href='tiktok.html'; this.parentElement.classList.remove('show')">📱 TikTok (EduShorts)</button>
          <div class="mt-dropdown-sep"></div>
          <div class="mt-dropdown-label">Tecnologia & Hardware</div>
          <button onclick="PCBuilderMundo.abrir()">🖥️ Montagem de PC</button>
          <button onclick="AlgoritmosVisual.abrir(); this.parentElement.classList.remove('show')">💻 Visualizador de Algoritmos</button>
          <button onclick="event.stopPropagation(); abrirFisica('circuitos'); this.parentElement.classList.remove('show')">⚡ Simulador de Circuitos</button>
          <div class="mt-dropdown-sep"></div>
          <div class="mt-dropdown-label">Ciências & Laboratórios</div>
          <button onclick="App.showDashboard()">📊 Dashboard</button>
          <button onclick="event.stopPropagation();abrirQuimica('laboratorio')">⚗️ Lab de Reações</button>
          <button onclick="event.stopPropagation();abrirQuimica('moleculas')">🧬 Moléculas 3D</button>
          <button onclick="event.stopPropagation();abrirQuimica('builder')">🔬 Construtor 3D</button>
          <button onclick="event.stopPropagation(); abrirFisica(); this.parentElement.classList.remove('show')">⚛️ Física Interativa</button>
          <button onclick="CienciasVida.abrir(); this.parentElement.classList.remove('show')">🧬 Ciências da Vida PRO</button>
          <button onclick="Astronomia3D.abrir(); this.parentElement.classList.remove('show')">🪐 Sistema Solar 3D</button>
          <div class="mt-dropdown-sep"></div>
          <div class="mt-dropdown-label">Matemática & Lógica</div>
          <button onclick="PlotadorFuncoes.abrir(); this.parentElement.classList.remove('show')">📈 Plotador de Funções</button>
          <button onclick="GeometriaInterativa.abrir(); this.parentElement.classList.remove('show')">📐 Geometria 3D</button>
          <button onclick="EnsinaQueAprende.abrir(); this.parentElement.classList.remove('show')">🧠 Ensina que Aprende</button>
        </div>
      `;

      if (dashboardBtn) {
        console.log('MapasTimeline: Replacing Dashboard button.');
        nav.replaceChild(dropdown, dashboardBtn);
      } else {
        console.log('MapasTimeline: Dashboard button not found, appending dropdown.');
        nav.appendChild(dropdown);
      }
    });

    if (!document.getElementById('mt-nav-styles')) {
      const s = document.createElement('style');
      s.id = 'mt-nav-styles';
      s.textContent = `
        .mt-dropdown-content {
          display: none; position: absolute; top: 110%; left: 0;
          background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
          border-radius: 12px; min-width: 180px; z-index: 10000;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5); padding: 8px; margin-top: 5px;
          pointer-events: auto;
          max-height: 80vh;
          overflow-y: auto; blur(12px);
          background: rgba(26, 22, 18, 0.95);
          border: 1px solid rgba(255, 220, 170, 0.15);
          min-width: 220px;
        }
        .mt-dropdown-content::-webkit-scrollbar { width: 5px; }
        .mt-dropdown-content::-webkit-scrollbar-track { background: transparent; }
        .mt-dropdown-content::-webkit-scrollbar-thumb { background: var(--accent, #e8a04a); border-radius: 3px; }

        .mt-dropdown-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-3, #5a4e44);
          padding: 8px 12px 4px;
          font-weight: 700;
        }

        .mt-dropdown-sep {
          height: 1px;
          background: rgba(255, 220, 170, 0.08);
          margin: 4px 8px;
        }

        .mt-dropdown-content.show { display: flex; flex-direction: column; gap: 2px; }
        .mt-dropdown-content button {
          background: none; border: none; padding: 10px 14px; text-align: left;
          color: var(--text-1, #c8b89a); cursor: pointer; border-radius: 8px;
          font-size: 13px; transition: background 0.2s;
        }
        .mt-nav-dropdown .nav-btn.active {
           color: var(--accent);
           border-bottom: 2px solid var(--accent);
        }
        .mt-dropdown-content button:hover { background: var(--bg-3, #211d18); color: var(--accent); }
        .mt-nav-dropdown { display: inline-flex; align-items: center; } /* Ensure proper alignment in nav */
      `;
      document.head.appendChild(s);
    }
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.mt-nav-dropdown')) {
      document.querySelectorAll('.mt-dropdown-content.show').forEach(el => el.classList.remove('show'));
    }
  });

  const observer = new MutationObserver((mutationsList, observer) => {
    add();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  add();
})();

window.MapasTimeline = MapasTimeline;