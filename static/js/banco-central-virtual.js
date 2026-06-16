const BancoCentralVirtual = (() => {
    const MODAL_ID = 'modal-banco-central-virtual';
    const MAX_ANOS = 10;

    const EVENTOS = [
        { id: 'crise_energia', nome: '⚡ Crise de Energia', descricao: 'Choque no preço do petróleo afeta a produção nacional.', efeito: { inflacao: +2.5, crescimento: -1.2, desemprego: +1.0 }, dificuldade: 0 },
        { id: 'pandemia', nome: '🦠 Pandemia', descricao: 'Uma doença se espalha, paralisando setores da economia.', efeito: { crescimento: -3.0, desemprego: +3.5, inflacao: +1.5 }, dificuldade: 1 },
        { id: 'boom_tech', nome: '💻 Boom Tecnológico', descricao: 'Inovações impulsionam produtividade e emprego no país.', efeito: { crescimento: +2.0, desemprego: -1.5, inflacao: -0.5 }, dificuldade: 0 },
        { id: 'seca', nome: '🌵 Seca Severa', descricao: 'Colheitas fracas elevam preços de alimentos.', efeito: { inflacao: +1.8, crescimento: -0.8 }, dificuldade: 0 },
        { id: 'eleicoes', nome: '🗳️ Pressão Eleitoral', descricao: 'O Congresso exige mais gastos públicos antes das eleições.', efeito: { dividaPublica: +5, desemprego: -0.8 }, dificuldade: 0 },
        { id: 'crise_externa', nome: '🌍 Crise Financeira Global', descricao: 'Mercados internacionais em turbulência afetam exportações.', efeito: { crescimento: -2.0, inflacao: +1.2, desemprego: +1.8 }, dificuldade: 0 },
        { id: 'investimento_estrangeiro', nome: '🏗️ Influxo de Investimentos', descricao: 'Empresas estrangeiras anunciam grandes projetos no país.', efeito: { crescimento: +1.8, desemprego: -1.2 }, dificuldade: 0 },
        { id: 'greve_geral', nome: '✊ Greve Geral', descricao: 'Trabalhadores paralisam setor industrial por semanas.', efeito: { crescimento: -1.0, desemprego: +0.5, inflacao: +0.8 }, dificuldade: 0 },
        { id: 'hiperinflacao', nome: '🔥 Espiral Inflacionária', descricao: 'Expectativas descontroladas alimentam mais inflação.', efeito: { inflacao: +3.5, crescimento: -1.5 }, dificuldade: 2 },
        { id: 'descoberta_mineral', nome: '⛏️ Descoberta Mineral', descricao: 'Vastos depósitos de minerais raros são descobertos.', efeito: { crescimento: +2.5, dividaPublica: -3 }, dificuldade: 0 },
    ];

    const DIFICULDADES = {
        facil:  { label: '😊 Fácil',   volatilidade: 0.4, eventoChance: 0.2 },
        medio:  { label: '😐 Médio',   volatilidade: 0.8, eventoChance: 0.4 },
        dificil:{ label: '😤 Difícil', volatilidade: 1.4, eventoChance: 0.65 },
    };

    let _state = {
        fase: 'intro',
        anoAtual: 0,
        dificuldade: 'medio',
        politicas: { juros: 5.0, cambio: 1.0, fiscal: 0 },
        economia: { inflacao: 3.0, desemprego: 8.0, crescimento: 2.0, dividaPublica: 60.0 },
        historicoEconomico: [],
        eventoAtual: null,
        carregando: false,
    };

    
    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();
        _resetState();
        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'bcv-overlay';
        modal.innerHTML = `
            <div class="bcv-box" id="bcv-box">
                <div class="bcv-header">
                    <div class="bcv-header-left">
                        <div class="bcv-header-icon">🏦</div>
                        <div>
                            <h2 class="bcv-header-title">Banco Central Virtual</h2>
                            <p class="bcv-header-sub">Gerencie a economia de um país fictício</p>
                        </div>
                    </div>
                    <button class="bcv-close-btn" onclick="BancoCentralVirtual.fechar()" title="Fechar">✕</button>
                </div>
                <div class="bcv-body" id="bcv-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        _renderIntro();
    }

    function fechar() { document.getElementById(MODAL_ID)?.remove(); }

    function _resetState() {
        _state = {
            fase: 'intro', anoAtual: 0, dificuldade: _state?.dificuldade || 'medio',
            politicas: { juros: 5.0, cambio: 1.0, fiscal: 0 },
            economia: { inflacao: 3.0, desemprego: 8.0, crescimento: 2.0, dividaPublica: 60.0 },
            historicoEconomico: [], eventoAtual: null, carregando: false,
        };
    }

    
    function _renderIntro() {
        _state.fase = 'intro';
        const body = document.getElementById('bcv-body');
        if (!body) return;
        body.innerHTML = `
            <div class="bcv-intro-wrap">
                <div class="bcv-intro-card">
                    <div class="bcv-intro-icon">💡</div>
                    <h3>Bem-vindo ao Banco Central Virtual!</h3>
                    <p>Você é o presidente do Banco Central. Gerencie a economia por <strong>${MAX_ANOS} anos</strong> equilibrando inflação, emprego, crescimento e dívida pública — e enfrente eventos imprevistos!</p>
                    <div class="bcv-controls-tips">
                        <div class="bcv-tip">
                            <span class="bcv-tip-icon">💰</span>
                            <div>
                                <strong>Taxa de Juros</strong>
                                <p>Alta = desinflaciona mas trava a economia. Baixa = aquece mas inflaciona.</p>
                            </div>
                        </div>
                        <div class="bcv-tip">
                            <span class="bcv-tip-icon">💱</span>
                            <div>
                                <strong>Câmbio</strong>
                                <p>Moeda fraca favorece exportações mas encarece importações. Moeda forte é o oposto.</p>
                            </div>
                        </div>
                        <div class="bcv-tip">
                            <span class="bcv-tip-icon">📊</span>
                            <div>
                                <strong>Política Fiscal</strong>
                                <p>Corte = controla dívida, mas aumenta desemprego. Estímulo = crescimento, mais dívida.</p>
                            </div>
                        </div>
                        <div class="bcv-tip">
                            <span class="bcv-tip-icon">⚠️</span>
                            <div>
                                <strong>Eventos Aleatórios</strong>
                                <p>Crises, pandemias ou booms surgem a qualquer momento. Adapte sua política!</p>
                            </div>
                        </div>
                    </div>

                    <div class="bcv-diff-section">
                        <p class="bcv-diff-label">Escolha a dificuldade:</p>
                        <div class="bcv-diff-btns">
                            <button class="bcv-diff-btn ${_state.dificuldade==='facil'?'active':''}" onclick="BancoCentralVirtual._setDiff('facil')">😊 Fácil</button>
                            <button class="bcv-diff-btn ${_state.dificuldade==='medio'?'active':''}" onclick="BancoCentralVirtual._setDiff('medio')">😐 Médio</button>
                            <button class="bcv-diff-btn ${_state.dificuldade==='dificil'?'active':''}" onclick="BancoCentralVirtual._setDiff('dificil')">😤 Difícil</button>
                        </div>
                    </div>

                    <button class="bcv-btn-primary" onclick="BancoCentralVirtual.iniciarSimulacao()">▶ Iniciar Simulação</button>
                </div>
            </div>
        `;
    }

    function _setDiff(d) {
        _state.dificuldade = d;
        document.querySelectorAll('.bcv-diff-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.bcv-diff-btn').forEach(b => { if (b.textContent.includes(DIFICULDADES[d].label.slice(3))) b.classList.add('active'); });
    }

    
    function iniciarSimulacao() {
        const diff = _state.dificuldade;
        _resetState();
        _state.dificuldade = diff;
        _state.fase = 'simulacao';
        _state.anoAtual = 1;
        _state.historicoEconomico.push({ ano: 0, ..._state.economia, ..._state.politicas, evento: null });
        _renderSimulacaoArena();
        _updateEconomicIndicators();
    }

    function _renderSimulacaoArena() {
        const body = document.getElementById('bcv-body');
        if (!body) return;
        body.innerHTML = `
            <div class="bcv-sim-wrap">
                <!-- Header de indicadores -->
                <div class="bcv-sim-header">
                    <div class="bcv-year-pill">
                        <span>Ano</span>
                        <span id="bcv-ano-atual" class="bcv-year-num">${_state.anoAtual}</span>
                        <span>/ ${MAX_ANOS}</span>
                    </div>
                    <div class="bcv-diff-badge">${DIFICULDADES[_state.dificuldade].label}</div>
                    <div class="bcv-economic-grid">
                        ${_metricCard('inflacao','📈','Inflação','bcv-inflacao','bcv-bar-inf','#ff6b6b')}
                        ${_metricCard('desemprego','👥','Desemprego','bcv-desemprego','bcv-bar-des','#ff8c42')}
                        ${_metricCard('crescimento','📊','PIB','bcv-crescimento','bcv-bar-cresc','#51cf66')}
                        ${_metricCard('dividaPublica','📉','Dívida/PIB','bcv-divida','bcv-bar-div','#ffd43b')}
                    </div>
                </div>

                <!-- Evento -->
                <div id="bcv-evento-area" style="display:none"></div>

                <!-- Gráfico Mini -->
                <div class="bcv-chart-wrap">
                    <p class="bcv-chart-title">📉 Histórico dos Indicadores</p>
                    <canvas id="bcv-chart" height="100"></canvas>
                </div>

                <!-- Controles -->
                <div class="bcv-controls-area">
                    <div class="bcv-policy-card">
                        <h4>💰 Taxa de Juros</h4>
                        <input type="range" id="bcv-juros" min="0" max="20" step="0.5" value="${_state.politicas.juros}"
                            oninput="document.getElementById('bcv-juros-val').textContent=this.value+'%'; BancoCentralVirtual._setPolitica('juros', parseFloat(this.value))">
                        <div class="bcv-slider-row">
                            <span class="bcv-slider-label">0%</span>
                            <span class="bcv-slider-val" id="bcv-juros-val">${_state.politicas.juros}%</span>
                            <span class="bcv-slider-label">20%</span>
                        </div>
                        <p class="bcv-hint">↑ Menos inflação, + desemprego &nbsp;|&nbsp; ↓ Mais crescimento, + inflação</p>
                    </div>

                    <div class="bcv-policy-card">
                        <h4>💱 Taxa de Câmbio</h4>
                        <input type="range" id="bcv-cambio" min="0.5" max="3.0" step="0.1" value="${_state.politicas.cambio}"
                            oninput="document.getElementById('bcv-cambio-val').textContent='1:'+parseFloat(this.value).toFixed(1); BancoCentralVirtual._setPolitica('cambio', parseFloat(this.value))">
                        <div class="bcv-slider-row">
                            <span class="bcv-slider-label">Forte</span>
                            <span class="bcv-slider-val" id="bcv-cambio-val">1:${_state.politicas.cambio.toFixed(1)}</span>
                            <span class="bcv-slider-label">Fraco</span>
                        </div>
                        <p class="bcv-hint">↓ Exportações ↑, Inflação ↑ &nbsp;|&nbsp; ↑ Importações ↑, Inflação ↓</p>
                    </div>

                    <div class="bcv-policy-card">
                        <h4>📊 Política Fiscal</h4>
                        <div class="bcv-fiscal-btns">
                            <button class="bcv-fiscal-opt ${_state.politicas.fiscal===-1?'active':''}" onclick="BancoCentralVirtual._setFiscal(-1)">
                                <span>📉</span><strong>Corte</strong><small>↓ Dívida, ↑ Desemprego</small>
                            </button>
                            <button class="bcv-fiscal-opt ${_state.politicas.fiscal===0?'active':''}" onclick="BancoCentralVirtual._setFiscal(0)">
                                <span>➡️</span><strong>Neutro</strong><small>Estável</small>
                            </button>
                            <button class="bcv-fiscal-opt ${_state.politicas.fiscal===1?'active':''}" onclick="BancoCentralVirtual._setFiscal(1)">
                                <span>📈</span><strong>Estímulo</strong><small>↑ Crescimento, ↑ Dívida</small>
                            </button>
                        </div>
                    </div>
                </div>

                <button class="bcv-btn-primary" id="bcv-avancar-btn" onclick="BancoCentralVirtual.avancarAno()">
                    ▶ Avançar Ano
                </button>
            </div>
        `;
        _drawChart();
    }

    function _metricCard(id, icon, label, valId, barId, color) {
        return `
        <div class="bcv-eco-item" id="bcv-eco-${id}">
            <div class="bcv-eco-label">${icon} ${label}</div>
            <div class="bcv-eco-value" id="${valId}">--</div>
            <div class="bcv-eco-bar"><div class="bcv-bar" id="${barId}" style="background:${color};width:0%"></div></div>
            <div class="bcv-eco-delta" id="bcv-delta-${id}"></div>
        </div>`;
    }

    function _setPolitica(nome, valor) { _state.politicas[nome] = valor; }

    function _setFiscal(v) {
        _state.politicas.fiscal = v;
        document.querySelectorAll('.bcv-fiscal-opt').forEach((b, i) => {
            b.classList.toggle('active', i - 1 === v);
        });
    }

    
    function _updateEconomicIndicators(prev) {
        const eco = _state.economia;
        const fields = [
            { id: 'bcv-inflacao',  bar: 'bcv-bar-inf',  val: eco.inflacao,     max: 20,  key: 'inflacao',     warn: v => v > 6 || v < 1 },
            { id: 'bcv-desemprego',bar: 'bcv-bar-des',  val: eco.desemprego,   max: 25,  key: 'desemprego',   warn: v => v > 12 },
            { id: 'bcv-crescimento',bar:'bcv-bar-cresc', val: eco.crescimento,  max: 8,   key: 'crescimento',  warn: v => v < 0 },
            { id: 'bcv-divida',    bar: 'bcv-bar-div',  val: eco.dividaPublica,max: 120, key: 'dividaPublica',warn: v => v > 90 },
        ];
        fields.forEach(f => {
            const el = document.getElementById(f.id);
            const bar = document.getElementById(f.bar);
            const delta = document.getElementById('bcv-delta-' + f.key);
            if (!el) return;
            el.textContent = `${f.val.toFixed(1)}%`;
            el.style.color = f.warn(f.val) ? '#ff6b6b' : '#64c8ff';
            if (bar) bar.style.width = Math.min(Math.abs(f.val) / f.max * 100, 100) + '%';
            if (delta && prev) {
                const d = f.val - prev[f.key];
                delta.textContent = (d >= 0 ? '▲ +' : '▼ ') + d.toFixed(1) + '%';
                delta.style.color = d >= 0 ? '#ff8888' : '#88ff99';
            }
        });
        document.getElementById('bcv-ano-atual').textContent = _state.anoAtual;
        const btn = document.getElementById('bcv-avancar-btn');
        if (btn) btn.textContent = _state.anoAtual >= MAX_ANOS ? '🏁 Ver Resultados Finais' : `▶ Avançar Ano (${_state.anoAtual}/${MAX_ANOS})`;
    }

    
    function _drawChart() {
        const canvas = document.getElementById('bcv-chart');
        if (!canvas || _state.historicoEconomico.length < 2) return;
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.parentElement.clientWidth - 40 || 600;
        canvas.height = 110;
        const hist = _state.historicoEconomico.slice(1);
        if (!hist.length) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const series = [
            { key: 'inflacao',    color: '#ff6b6b', label: 'Inflação' },
            { key: 'desemprego',  color: '#ff8c42', label: 'Desemprego' },
            { key: 'crescimento', color: '#51cf66', label: 'PIB' },
        ];

        const allVals = hist.flatMap(h => series.map(s => h[s.key]));
        const minV = Math.min(...allVals) - 1;
        const maxV = Math.max(...allVals) + 1;
        const pad = { l: 30, r: 10, t: 10, b: 20 };
        const W = canvas.width - pad.l - pad.r;
        const H = canvas.height - pad.t - pad.b;

        const xPos = i => pad.l + (i / (hist.length - 1 || 1)) * W;
        const yPos = v => pad.t + H - ((v - minV) / (maxV - minV)) * H;

        
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        [0, 0.25, 0.5, 0.75, 1].forEach(t => {
            const y = pad.t + t * H;
            ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + W, y); ctx.stroke();
        });

        
        series.forEach(s => {
            ctx.beginPath();
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            hist.forEach((h, i) => {
                const x = xPos(i), y = yPos(h[s.key]);
                i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            });
            ctx.stroke();
            
            const last = hist[hist.length - 1];
            ctx.beginPath();
            ctx.fillStyle = s.color;
            ctx.arc(xPos(hist.length - 1), yPos(last[s.key]), 4, 0, Math.PI * 2);
            ctx.fill();
        });

        
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        hist.forEach((h, i) => {
            if (i % 2 === 0 || i === hist.length - 1)
                ctx.fillText(`A${h.ano}`, xPos(i), canvas.height - 4);
        });

        
        ctx.textAlign = 'left';
        ctx.font = '10px sans-serif';
        series.forEach((s, i) => {
            ctx.fillStyle = s.color;
            ctx.fillRect(pad.l + i * 80, 2, 10, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.5)';
            ctx.fillText(s.label, pad.l + i * 80 + 13, 10);
        });
    }

    
    function avancarAno() {
        if (_state.carregando) return;
        if (_state.anoAtual >= MAX_ANOS) { _renderResultados(); return; }

        _state.carregando = true;
        const btn = document.getElementById('bcv-avancar-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '<span class="bcv-spinner"></span> Simulando...'; }

        
        const diff = DIFICULDADES[_state.dificuldade];
        let evento = null;
        if (Math.random() < diff.eventoChance) {
            const pool = EVENTOS.filter(e => e.dificuldade <= (diff.eventoChance > 0.5 ? 2 : 1));
            evento = pool[Math.floor(Math.random() * pool.length)];
        }

        setTimeout(() => {
            const prev = { ..._state.economia };
            const j = _state.politicas.juros;
            const c = _state.politicas.cambio;
            const f = _state.politicas.fiscal;
            const v = diff.volatilidade;

            
            let inf  = Math.max(0.3,  prev.inflacao    * 0.6 + 3.0 + (10 - j) * 0.18 + (c - 1.0) * 1.8 + f * 0.7 + (Math.random() - 0.5) * v);
            let des  = Math.max(2.0,  prev.desemprego  * 0.7 + 8.0 - (10 - j) * 0.09 - f * 1.1   - (c - 1.0) * 0.3 + (Math.random() - 0.5) * v);
            let pib  = Math.max(-4.0, prev.crescimento * 0.4 + 1.5 + (10 - j) * 0.07 + f * 0.55  - (inf > 6 ? 0.5 : 0) + (Math.random() - 0.5) * v * 0.7);
            let div  = Math.min(160,  prev.dividaPublica * 1.01 + f * 2.5 + (j > 10 ? 1 : 0) - pib * 0.4 + (Math.random() - 0.5) * v * 0.5);

            
            if (evento) {
                if (evento.efeito.inflacao)     inf += evento.efeito.inflacao;
                if (evento.efeito.desemprego)   des += evento.efeito.desemprego;
                if (evento.efeito.crescimento)  pib += evento.efeito.crescimento;
                if (evento.efeito.dividaPublica)div += evento.efeito.dividaPublica;
            }

            _state.economia = {
                inflacao: Math.max(0.1, inf),
                desemprego: Math.max(1.5, des),
                crescimento: pib,
                dividaPublica: Math.max(10, div),
            };

            _state.anoAtual++;
            _state.eventoAtual = evento;
            _state.historicoEconomico.push({ ano: _state.anoAtual, ..._state.economia, ..._state.politicas, evento: evento?.id || null });

            _updateEconomicIndicators(prev);
            _drawChart();

            if (evento) _showEvento(evento);

            _state.carregando = false;
            if (btn) { btn.disabled = false; btn.textContent = _state.anoAtual >= MAX_ANOS ? '🏁 Ver Resultados Finais' : `▶ Avançar Ano (${_state.anoAtual}/${MAX_ANOS})`; }

        }, 700);
    }

    function _showEvento(evento) {
        const area = document.getElementById('bcv-evento-area');
        if (!area) return;
        area.style.display = 'block';
        area.innerHTML = `
            <div class="bcv-evento-banner">
                <div class="bcv-evento-icon">⚡</div>
                <div class="bcv-evento-content">
                    <strong>${evento.nome}</strong>
                    <p>${evento.descricao}</p>
                    <div class="bcv-evento-efts">
                        ${Object.entries(evento.efeito).map(([k,v]) => `
                            <span class="bcv-eft-tag ${v > 0 ? 'neg' : 'pos'}">
                                ${_keyLabel(k)} ${v > 0 ? '+' : ''}${v}%
                            </span>`).join('')}
                    </div>
                </div>
                <button class="bcv-evento-close" onclick="document.getElementById('bcv-evento-area').style.display='none'">✕</button>
            </div>
        `;
        setTimeout(() => { if (area) area.style.display = 'none'; }, 6000);
    }

    function _keyLabel(k) {
        return { inflacao: 'Inflação', desemprego: 'Desemprego', crescimento: 'PIB', dividaPublica: 'Dívida' }[k] || k;
    }

    
    function _renderResultados() {
        _state.fase = 'resultados';
        const body = document.getElementById('bcv-body');
        if (!body) return;

        const hist = _state.historicoEconomico.slice(1);
        const ultimo = hist[hist.length - 1];

        
        const avgInf  = hist.reduce((s, h) => s + h.inflacao, 0) / hist.length;
        const avgDes  = hist.reduce((s, h) => s + h.desemprego, 0) / hist.length;
        const avgPIB  = hist.reduce((s, h) => s + h.crescimento, 0) / hist.length;
        const avgDiv  = hist.reduce((s, h) => s + h.dividaPublica, 0) / hist.length;

        const scoreInf  = Math.max(0, 25 - Math.abs(avgInf - 2.5) * 4);
        const scoreDes  = Math.max(0, 25 - Math.abs(avgDes - 5) * 2.5);
        const scorePIB  = Math.max(0, 25 + avgPIB * 4);
        const scoreDiv  = Math.max(0, 25 - Math.max(0, avgDiv - 60) * 0.3);
        const score = scoreInf + scoreDes + scorePIB + scoreDiv;

        let avaliacao, emoji, classe;
        if (score >= 80)      { avaliacao = 'Gestão exemplar! Você dominou os instrumentos de política econômica como um verdadeiro mestre. O país prosperou sob seu comando.'; emoji = '🏆'; classe = 'gold'; }
        else if (score >= 60) { avaliacao = 'Boa gestão! Você manteve a economia razoavelmente saudável, mesmo diante dos desafios. Ainda há espaço para otimizar.'; emoji = '🥈'; classe = 'silver'; }
        else if (score >= 40) { avaliacao = 'Gestão regular. A economia sobreviveu, mas poderia ter sido melhor. Revise suas estratégias de política monetária.'; emoji = '🥉'; classe = 'bronze'; }
        else                  { avaliacao = 'Economia em crise! As decisões de política econômica criaram desequilíbrios graves. Tente novamente com uma estratégia diferente.'; emoji = '⚠️'; classe = 'bad'; }

        const tableRows = hist.map((h, i) => `
            <tr class="${h.evento ? 'bcv-row-evento' : ''}">
                <td>${h.ano}</td>
                <td style="color:${h.inflacao > 6 ? '#ff6b6b' : 'inherit'}">${h.inflacao.toFixed(1)}%</td>
                <td style="color:${h.desemprego > 12 ? '#ff8c42' : 'inherit'}">${h.desemprego.toFixed(1)}%</td>
                <td style="color:${h.crescimento < 0 ? '#ff6b6b' : '#51cf66'}">${h.crescimento >= 0 ? '+' : ''}${h.crescimento.toFixed(1)}%</td>
                <td style="color:${h.dividaPublica > 90 ? '#ffd43b' : 'inherit'}">${h.dividaPublica.toFixed(1)}%</td>
                <td>${h.juros.toFixed(1)}%</td>
                <td>1:${h.cambio.toFixed(1)}</td>
                <td>${h.fiscal === -1 ? '📉' : h.fiscal === 0 ? '➡️' : '📈'}</td>
                <td>${h.evento ? (EVENTOS.find(e=>e.id===h.evento)?.nome || h.evento) : '—'}</td>
            </tr>
        `).join('');

        body.innerHTML = `
            <div class="bcv-resultados-wrap">
                <div class="bcv-resultados-card bcv-res-${classe}">
                    <div class="bcv-resultados-icon">${emoji}</div>
                    <h3>Simulação Finalizada!</h3>
                    <p class="bcv-avaliacao">${avaliacao}</p>

                    <div class="bcv-score-grid">
                        <div class="bcv-score-item"><span>Controle Inflação</span><strong>${scoreInf.toFixed(0)}/25</strong></div>
                        <div class="bcv-score-item"><span>Controle Desemprego</span><strong>${scoreDes.toFixed(0)}/25</strong></div>
                        <div class="bcv-score-item"><span>Crescimento PIB</span><strong>${scorePIB.toFixed(0)}/25</strong></div>
                        <div class="bcv-score-item"><span>Dívida Pública</span><strong>${scoreDiv.toFixed(0)}/25</strong></div>
                    </div>
                    <div class="bcv-score-display">Pontuação Final: <span class="bcv-score-val">${score.toFixed(0)}</span><span style="color:rgba(255,255,255,0.4);font-size:16px"> / 100</span></div>

                    <div class="bcv-stats-summary">
                        <div class="bcv-stat"><span>Inflação Média</span><strong>${avgInf.toFixed(1)}%</strong></div>
                        <div class="bcv-stat"><span>Desemprego Médio</span><strong>${avgDes.toFixed(1)}%</strong></div>
                        <div class="bcv-stat"><span>PIB Médio</span><strong>${avgPIB >= 0 ? '+' : ''}${avgPIB.toFixed(1)}%</strong></div>
                        <div class="bcv-stat"><span>Dívida Final</span><strong>${ultimo.dividaPublica.toFixed(1)}%</strong></div>
                    </div>

                    <h4>📊 Histórico Detalhado</h4>
                    <div class="bcv-table-wrap">
                        <table>
                            <thead><tr><th>Ano</th><th>Inflação</th><th>Desemprego</th><th>PIB</th><th>Dívida</th><th>Juros</th><th>Câmbio</th><th>Fiscal</th><th>Evento</th></tr></thead>
                            <tbody>${tableRows}</tbody>
                        </table>
                    </div>
                    <div class="bcv-resultados-actions">
                        <button class="bcv-btn-secondary" onclick="BancoCentralVirtual.fechar()">Fechar</button>
                        <button class="bcv-btn-primary" onclick="BancoCentralVirtual.iniciarSimulacao()">🔄 Jogar Novamente</button>
                    </div>
                </div>
            </div>
        `;
    }

    
    function _injectStyles() {
        if (document.getElementById('bcv-styles')) return;
        const style = document.createElement('style');
        style.id = 'bcv-styles';
        style.textContent = `

.bcv-overlay {
    position: fixed; inset: 0; z-index: 10000;
    background: rgba(4,8,20,0.92);
    backdrop-filter: blur(14px);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
    animation: bcv-fade 0.25s ease;
}
@keyframes bcv-fade { from { opacity: 0; } to { opacity: 1; } }

.bcv-box {
    width: min(1050px, 96vw); height: min(800px, 96vh);
    background: linear-gradient(160deg, #07101f 0%, #0b1628 60%, #060d1c 100%);
    border-radius: 24px; overflow: hidden;
    display: flex; flex-direction: column;
    border: 1px solid rgba(80,180,255,0.15);
    box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(60,150,255,0.08), inset 0 1px 0 rgba(255,255,255,0.04);
    animation: bcv-rise 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes bcv-rise { from { opacity:0; transform:translateY(30px) scale(0.96); } to { opacity:1; transform:none; } }

.bcv-header {
    padding: 18px 26px; border-bottom: 1px solid rgba(80,180,255,0.1);
    display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;
    background: rgba(255,255,255,0.015);
}
.bcv-header-left { display: flex; align-items: center; gap: 14px; }
.bcv-header-icon { font-size: 30px; animation: bcv-pulse 3s ease-in-out infinite; }
@keyframes bcv-pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.08); } }
.bcv-header-title { margin: 0; font-size: 20px; color: #e8f4ff; font-weight: 700; letter-spacing: -0.3px; }
.bcv-header-sub { margin: 3px 0 0; font-size: 11px; color: rgba(100,180,255,0.5); letter-spacing: 0.05em; text-transform: uppercase; }
.bcv-close-btn {
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07);
    color: rgba(255,255,255,0.35); font-size: 18px; cursor: pointer;
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s ease; flex-shrink: 0;
}
.bcv-close-btn:hover { background: rgba(255,80,80,0.15); color: #ff6b6b; border-color: rgba(255,80,80,0.25); }

.bcv-body { flex: 1; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(80,180,255,0.2) transparent; }
.bcv-body::-webkit-scrollbar { width: 6px; }
.bcv-body::-webkit-scrollbar-thumb { background: rgba(80,180,255,0.2); border-radius: 4px; }

.bcv-intro-wrap { padding: 36px 28px; display: flex; justify-content: center; }
.bcv-intro-card {
    background: rgba(80,180,255,0.04);
    border: 1px solid rgba(80,180,255,0.18);
    border-radius: 20px; padding: 34px; max-width: 680px; width: 100%;
    box-shadow: 0 16px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}
.bcv-intro-icon { font-size: 46px; margin-bottom: 14px; display: block; }
.bcv-intro-card h3 { margin: 0 0 12px; color: #e8f4ff; font-size: 22px; font-weight: 700; }
.bcv-intro-card p { margin: 0 0 16px; color: rgba(220,235,255,0.65); font-size: 14.5px; line-height: 1.7; }
.bcv-intro-card strong { color: #64c8ff; }

.bcv-controls-tips { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 20px 0; background: rgba(0,0,0,0.25); padding: 16px; border-radius: 14px; }
.bcv-tip { display: flex; gap: 10px; align-items: flex-start; }
.bcv-tip-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.bcv-tip strong { color: #64c8ff; display: block; margin-bottom: 3px; font-size: 13px; }
.bcv-tip p { margin: 0; color: rgba(200,220,255,0.55); font-size: 12px; line-height: 1.5; }

.bcv-diff-section { margin: 20px 0; text-align: center; }
.bcv-diff-label { color: rgba(200,220,255,0.55); font-size: 13px; margin-bottom: 10px; }
.bcv-diff-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
.bcv-diff-btn {
    padding: 9px 22px; background: rgba(255,255,255,0.04); border: 1px solid rgba(80,180,255,0.15);
    border-radius: 30px; color: rgba(200,220,255,0.6); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.bcv-diff-btn:hover { background: rgba(80,180,255,0.1); border-color: rgba(80,180,255,0.3); color: #a8d8ff; }
.bcv-diff-btn.active { background: rgba(80,180,255,0.15); border-color: rgba(80,180,255,0.5); color: #64c8ff; box-shadow: 0 0 14px rgba(80,180,255,0.2); }

.bcv-sim-wrap { padding: 26px 28px; display: flex; flex-direction: column; gap: 22px; }
.bcv-sim-header { display: flex; flex-direction: column; gap: 16px; }

.bcv-year-pill {
    display: flex; align-items: baseline; justify-content: center; gap: 6px;
    color: rgba(200,220,255,0.5); font-size: 14px; font-weight: 600;
}
.bcv-year-num { font-size: 34px; font-weight: 800; color: #64c8ff; line-height: 1; }
.bcv-diff-badge {
    text-align: center; font-size: 12px; color: rgba(200,220,255,0.4);
    letter-spacing: 0.06em; text-transform: uppercase; margin-top: -10px;
}

.bcv-economic-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.bcv-eco-item {
    background: rgba(80,180,255,0.05);
    border: 1px solid rgba(80,180,255,0.12); border-radius: 14px; padding: 16px;
    transition: all 0.3s ease;
}
.bcv-eco-item:hover { border-color: rgba(80,180,255,0.3); background: rgba(80,180,255,0.09); }
.bcv-eco-label { font-size: 11px; color: rgba(200,220,255,0.4); text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 7px; }
.bcv-eco-value { font-size: 24px; font-weight: 700; color: #64c8ff; font-family: 'DM Mono', 'Courier New', monospace; margin-bottom: 9px; transition: color 0.4s; }
.bcv-eco-bar { height: 4px; background: rgba(255,255,255,0.07); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
.bcv-bar { height: 100%; border-radius: 3px; transition: width 0.7s cubic-bezier(0.34,1.56,0.64,1); }
.bcv-eco-delta { font-size: 11px; font-weight: 600; min-height: 14px; transition: color 0.4s; }

.bcv-evento-banner {
    background: linear-gradient(135deg, rgba(255,180,30,0.12), rgba(255,100,50,0.08));
    border: 1px solid rgba(255,180,30,0.3); border-radius: 14px;
    padding: 16px 18px; display: flex; align-items: flex-start; gap: 14px;
    animation: bcv-slide-in 0.4s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes bcv-slide-in { from { opacity:0; transform:translateY(-12px); } to { opacity:1; transform:none; } }
.bcv-evento-icon { font-size: 28px; flex-shrink: 0; animation: bcv-shake 0.5s ease; }
@keyframes bcv-shake { 0%,100%{transform:rotate(0);} 25%{transform:rotate(-8deg);} 75%{transform:rotate(8deg);} }
.bcv-evento-content { flex: 1; }
.bcv-evento-content strong { color: #ffd43b; font-size: 15px; display: block; margin-bottom: 4px; }
.bcv-evento-content p { margin: 0 0 10px; color: rgba(255,220,150,0.75); font-size: 13px; line-height: 1.5; }
.bcv-evento-efts { display: flex; flex-wrap: wrap; gap: 6px; }
.bcv-eft-tag {
    padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700;
}
.bcv-eft-tag.neg { background: rgba(255,100,100,0.2); color: #ff8888; border: 1px solid rgba(255,100,100,0.2); }
.bcv-eft-tag.pos { background: rgba(80,220,130,0.2); color: #70ee9c; border: 1px solid rgba(80,220,130,0.2); }
.bcv-evento-close {
    background: none; border: none; color: rgba(255,200,100,0.4); font-size: 18px;
    cursor: pointer; flex-shrink: 0; padding: 0 4px; line-height: 1;
    transition: color 0.2s;
}
.bcv-evento-close:hover { color: #ffd43b; }

.bcv-chart-wrap {
    background: rgba(0,0,0,0.25); border: 1px solid rgba(80,180,255,0.08);
    border-radius: 14px; padding: 14px 16px;
}
.bcv-chart-title { margin: 0 0 10px; font-size: 12px; color: rgba(180,210,255,0.45); text-transform: uppercase; letter-spacing: 0.07em; }
#bcv-chart { display: block; width: 100%; }

.bcv-controls-area { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.bcv-policy-card {
    background: rgba(80,180,255,0.04);
    border: 1px solid rgba(80,180,255,0.12); border-radius: 16px; padding: 20px;
    transition: border-color 0.3s;
}
.bcv-policy-card:hover { border-color: rgba(80,180,255,0.28); }
.bcv-policy-card h4 { font-size: 14px; color: #cce4ff; margin: 0 0 14px; font-weight: 700; }
.bcv-policy-card input[type="range"] {
    width: 100%; height: 5px; background: rgba(80,180,255,0.15); border-radius: 3px;
    -webkit-appearance: none; appearance: none; margin-bottom: 8px; cursor: pointer;
}
.bcv-policy-card input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg, #64c8ff, #a78bfa); cursor: pointer;
    border: 2.5px solid #fff; box-shadow: 0 2px 10px rgba(100,200,255,0.4); transition: all 0.2s;
}
.bcv-policy-card input[type="range"]::-moz-range-thumb {
    width: 20px; height: 20px; border-radius: 50%;
    background: linear-gradient(135deg, #64c8ff, #a78bfa); cursor: pointer;
    border: 2.5px solid #fff; box-shadow: 0 2px 10px rgba(100,200,255,0.4);
}
.bcv-slider-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.bcv-slider-label { font-size: 11px; color: rgba(180,210,255,0.35); }
.bcv-slider-val { font-size: 17px; font-weight: 700; color: #64c8ff; font-family: 'DM Mono', monospace; }
.bcv-hint { font-size: 11.5px; color: rgba(130,180,255,0.5); line-height: 1.5; margin: 0; }

.bcv-fiscal-btns { display: flex; gap: 8px; }
.bcv-fiscal-opt {
    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
    padding: 12px 6px; background: rgba(255,255,255,0.03); border: 1px solid rgba(80,180,255,0.1);
    border-radius: 12px; cursor: pointer; transition: all 0.2s; color: rgba(200,220,255,0.5);
}
.bcv-fiscal-opt span { font-size: 20px; }
.bcv-fiscal-opt strong { font-size: 12px; color: rgba(200,220,255,0.7); font-weight: 700; }
.bcv-fiscal-opt small { font-size: 10px; color: rgba(180,210,255,0.35); text-align: center; line-height: 1.3; }
.bcv-fiscal-opt:hover { background: rgba(80,180,255,0.08); border-color: rgba(80,180,255,0.25); }
.bcv-fiscal-opt.active { background: rgba(80,180,255,0.14); border-color: rgba(80,180,255,0.45); box-shadow: 0 0 14px rgba(80,180,255,0.15); }
.bcv-fiscal-opt.active strong { color: #64c8ff; }

.bcv-btn-primary {
    padding: 13px 32px; background: linear-gradient(135deg, #3b9eff, #7b5cfa);
    border: none; border-radius: 13px; color: #fff; font-size: 14.5px; font-weight: 700;
    cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; gap: 8px;
    margin: 0 auto; box-shadow: 0 6px 18px rgba(59,158,255,0.3);
}
.bcv-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(59,158,255,0.45); }
.bcv-btn-primary:active { transform: translateY(0); }
.bcv-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
.bcv-btn-secondary {
    padding: 11px 26px; background: rgba(255,255,255,0.05); border: 1px solid rgba(80,180,255,0.2);
    border-radius: 12px; color: rgba(200,220,255,0.65); font-size: 13.5px; font-weight: 600;
    cursor: pointer; transition: all 0.25s;
}
.bcv-btn-secondary:hover { background: rgba(80,180,255,0.1); border-color: rgba(80,180,255,0.4); color: #90d0ff; }

.bcv-spinner {
    display: inline-block; width: 14px; height: 14px;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
    border-radius: 50%; animation: bcv-spin 0.6s linear infinite;
}
@keyframes bcv-spin { to { transform: rotate(360deg); } }

.bcv-resultados-wrap { padding: 32px 24px; display: flex; justify-content: center; }
.bcv-resultados-card {
    background: rgba(80,180,255,0.05);
    border: 1px solid rgba(80,180,255,0.2); border-radius: 22px; padding: 32px;
    max-width: 820px; width: 100%; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}
.bcv-res-gold  { border-color: rgba(255,215,0,0.3); background: rgba(255,215,0,0.05); }
.bcv-res-silver{ border-color: rgba(180,200,220,0.25); }
.bcv-res-bronze{ border-color: rgba(180,130,80,0.25); }
.bcv-res-bad   { border-color: rgba(255,100,100,0.2); background: rgba(255,80,80,0.04); }

.bcv-resultados-icon { font-size: 52px; margin-bottom: 14px; display: block; animation: bcv-bounce 0.8s ease; }
@keyframes bcv-bounce { 0%,100%{transform:translateY(0);} 40%{transform:translateY(-12px);} }
.bcv-resultados-card h3 { margin: 0 0 10px; color: #e8f4ff; font-size: 24px; font-weight: 700; }
.bcv-avaliacao { color: rgba(210,230,255,0.7); font-size: 14.5px; line-height: 1.7; max-width: 600px; margin: 0 auto 20px; }

.bcv-score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
.bcv-score-item {
    background: rgba(80,180,255,0.07); border: 1px solid rgba(80,180,255,0.12);
    border-radius: 12px; padding: 12px 8px;
    display: flex; flex-direction: column; gap: 4px;
}
.bcv-score-item span { font-size: 11px; color: rgba(180,210,255,0.45); text-transform: uppercase; letter-spacing: 0.05em; }
.bcv-score-item strong { font-size: 20px; color: #64c8ff; font-family: 'DM Mono', monospace; }

.bcv-score-display {
    font-size: 16px; font-weight: 700; color: rgba(200,225,255,0.65);
    background: rgba(80,180,255,0.08); border: 1px solid rgba(80,180,255,0.15);
    border-radius: 12px; padding: 12px; margin: 14px 0;
}
.bcv-score-val { color: #50e8c8; font-size: 28px; font-family: 'DM Mono', monospace; }

.bcv-stats-summary { display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin: 14px 0 20px; }
.bcv-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bcv-stat span { font-size: 11px; color: rgba(180,210,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
.bcv-stat strong { font-size: 18px; color: #a8d4ff; font-family: 'DM Mono', monospace; }

.bcv-resultados-card h4 { font-size: 14px; color: #cce4ff; margin: 20px 0 12px; font-weight: 700; text-align: left; }
.bcv-table-wrap {
    max-height: 260px; overflow-y: auto; background: rgba(0,0,0,0.3);
    border: 1px solid rgba(80,180,255,0.1); border-radius: 12px; margin-bottom: 22px;
    scrollbar-width: thin; scrollbar-color: rgba(80,180,255,0.2) transparent;
}
.bcv-table-wrap::-webkit-scrollbar { width: 5px; }
.bcv-table-wrap::-webkit-scrollbar-thumb { background: rgba(80,180,255,0.2); border-radius: 3px; }
.bcv-table-wrap table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.bcv-table-wrap th {
    padding: 10px 8px; text-align: left; background: rgba(80,180,255,0.1);
    color: #64c8ff; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em;
    position: sticky; top: 0;
}
.bcv-table-wrap td { padding: 9px 8px; border-bottom: 1px solid rgba(80,180,255,0.05); color: rgba(200,220,255,0.65); font-family: 'DM Mono', monospace; font-size: 12px; }
.bcv-table-wrap tr:hover { background: rgba(80,180,255,0.05); }
.bcv-row-evento td:last-child { color: #ffd43b; font-size: 11px; }

.bcv-resultados-actions { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }

@media (max-width: 768px) {
    .bcv-box { height: auto; max-height: 96vh; }
    .bcv-sim-wrap, .bcv-intro-wrap, .bcv-resultados-wrap { padding: 18px; }
    .bcv-economic-grid { grid-template-columns: 1fr 1fr; }
    .bcv-controls-area { grid-template-columns: 1fr; }
    .bcv-score-grid { grid-template-columns: 1fr 1fr; }
    .bcv-stats-summary { gap: 14px; }
}
@media (max-width: 500px) {
    .bcv-economic-grid { grid-template-columns: 1fr; }
    .bcv-score-grid { grid-template-columns: 1fr 1fr; }
    .bcv-fiscal-btns { flex-direction: column; }
}
        `;
        document.head.appendChild(style);
    }

    return { abrir, fechar, iniciarSimulacao, avancarAno, _setPolitica, _setFiscal, _setDiff };
})();

window.BancoCentralVirtual = BancoCentralVirtual;