

const EducacaoFinanceira = (() => {
    const MODAL_ID = 'modal-educacao-financeira';
    const EXCHANGE_API = 'https://api.exchangerate-api.com/v4/latest/BRL';

    let _state = {
        aba: 'simulador',
        cotacoes: {},
        marketData: [],
        gastos: [],
        metaEconomia: 500,
        renda: 0,
        timer: null,
        tutorHistory: []
    };

   
    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.className = 'ex-modal-overlay ef-overlay';
        modal.innerHTML = `
            <div class="ef-box">
                <div class="ef-header">
                    <div class="ef-title">
                        <div class="ef-icon-wrap"><span class="ef-icon">💰</span></div>
                        <div>
                            <h2>Educação Financeira</h2>
                            <p>Simulador · Mercado · Gastos · Aprender</p>
                        </div>
                    </div>
                    <button class="ef-close" onclick="EducacaoFinanceira.fechar()" title="Fechar">✕</button>
                </div>

                <div class="ef-tabs">
                    <button class="ef-tab active" id="tab-sim"  onclick="EducacaoFinanceira.setTab('simulador')">📈 Investimentos</button>
                    <button class="ef-tab"        id="tab-mkt"  onclick="EducacaoFinanceira.setTab('mercado')">🌐 Mercado</button>
                    <button class="ef-tab"        id="tab-plan" onclick="EducacaoFinanceira.setTab('planilha')">💳 Gastos</button>
                    <button class="ef-tab"        id="tab-aula" onclick="EducacaoFinanceira.setTab('aula')">🤖 Tutor IA</button>
                </div>

                <div class="ef-main" id="ef-main-content"></div>
            </div>
        `;

        document.body.appendChild(modal);
        setTab('simulador');
    }

    function fechar() {
        clearInterval(_state.timer);
        document.getElementById(MODAL_ID)?.remove();
    }

   
    function setTab(aba) {
        _state.aba = aba;
        document.querySelectorAll('.ef-tab').forEach(t => t.classList.remove('active'));
        const tabMap = { simulador: 'tab-sim', mercado: 'tab-mkt', planilha: 'tab-plan', aula: 'tab-aula' };
        document.getElementById(tabMap[aba])?.classList.add('active');

        const content = document.getElementById('ef-main-content');
        if (aba === 'simulador')  _renderSimulador(content);
        else if (aba === 'aula') _renderAula(content);
        else if (aba === 'mercado') { _renderMercado(content); carregarCotacoes(); }
        else _renderPlanilha(content);
    }

    
    function _renderSimulador(container) {
        container.innerHTML = `
            <div class="ef-sim-container">
                <div class="ef-inputs">
                    <div class="ef-field">
                        <label>Aporte Inicial (R$)</label>
                        <input type="number" id="ef-p" value="1000" min="0" oninput="EducacaoFinanceira.calcular()">
                    </div>
                    <div class="ef-field">
                        <label>Aporte Mensal (R$)</label>
                        <input type="number" id="ef-pmt" value="200" min="0" oninput="EducacaoFinanceira.calcular()">
                    </div>
                    <div class="ef-field">
                        <label>Taxa de Juros (% ao ano)</label>
                        <input type="number" id="ef-r" value="12" step="0.1" oninput="EducacaoFinanceira.calcular()">
                    </div>
                    <div class="ef-field">
                        <label>Período (Anos)</label>
                        <input type="number" id="ef-t" value="10" min="1" max="40" oninput="EducacaoFinanceira.calcular()">
                    </div>

                    <div class="ef-preset-label">Presets rápidos</div>
                    <div class="ef-presets">
                        <button onclick="EducacaoFinanceira.aplicarPreset(500,100,10,5)">Conservador</button>
                        <button onclick="EducacaoFinanceira.aplicarPreset(2000,300,12,10)">Moderado</button>
                        <button onclick="EducacaoFinanceira.aplicarPreset(5000,800,15,20)">Agressivo</button>
                    </div>

                    <div class="ef-summary" id="ef-summary"></div>
                </div>

                <div class="ef-chart-area">
                    <div class="ef-chart-header">
                        <span class="ef-chart-title">Evolução do Patrimônio</span>
                        <div class="ef-chart-legend">
                            <span><span class="ef-dot accent"></span>Patrimônio</span>
                            <span><span class="ef-dot white"></span>Investido</span>
                        </div>
                    </div>
                    <div class="ef-chart-wrap">
                        <svg id="ef-svg-chart" viewBox="0 0 500 220" preserveAspectRatio="none"></svg>
                    </div>
                    <div id="ef-milestones" class="ef-milestones"></div>
                </div>
            </div>
        `;
        calcular();
    }

    function aplicarPreset(p, pmt, r, t) {
        document.getElementById('ef-p').value = p;
        document.getElementById('ef-pmt').value = pmt;
        document.getElementById('ef-r').value = r;
        document.getElementById('ef-t').value = t;
        calcular();
    }

    function calcular() {
        const P   = parseFloat(document.getElementById('ef-p')?.value)   || 0;
        const PMT = parseFloat(document.getElementById('ef-pmt')?.value) || 0;
        const r   = (parseFloat(document.getElementById('ef-r')?.value)  || 0) / 100 / 12;
        const anos = parseInt(document.getElementById('ef-t')?.value)    || 1;
        const t   = anos * 12;

        let total = P;
        let investido = P;
        const pontos = [{ total, investido }];

        for (let i = 1; i <= t; i++) {
            total = (total * (1 + r)) + PMT;
            investido += PMT;
            pontos.push({ total, investido });
        }

        const juros = total - investido;
        const multiplicador = (investido > 0) ? (total / investido).toFixed(2) : '—';

        // Marcos importantes
        const milestones = [
            { label: '1 ano', idx: 12 },
            { label: `${Math.floor(anos / 2)} anos`, idx: Math.floor(anos / 2) * 12 },
            { label: `${anos} anos`, idx: t }
        ].filter(m => m.idx > 0 && m.idx <= t);

        document.getElementById('ef-summary').innerHTML = `
            <div class="ef-res-card">
                <div class="ef-res-top">
                    <div class="ef-res-label">Patrimônio Final Estimado</div>
                    <div class="ef-res-val">${_fmt(total)}</div>
                </div>
                <div class="ef-res-grid">
                    <div class="ef-res-item">
                        <span class="ef-res-icon">📦</span>
                        <div><small>Total Investido</small><b>${_fmt(investido)}</b></div>
                    </div>
                    <div class="ef-res-item">
                        <span class="ef-res-icon">✨</span>
                        <div><small>Rendimento</small><b style="color:#7abc8a">+${_fmt(juros)}</b></div>
                    </div>
                    <div class="ef-res-item">
                        <span class="ef-res-icon">🚀</span>
                        <div><small>Multiplicador</small><b style="color:var(--accent)">${multiplicador}×</b></div>
                    </div>
                    <div class="ef-res-item">
                        <span class="ef-res-icon">📅</span>
                        <div><small>Renda Mensal (4%a)</small><b>${_fmt(total * 0.04 / 12)}</b></div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('ef-milestones').innerHTML = milestones.map(m => `
            <div class="ef-milestone">
                <span class="ef-milestone-label">${m.label}</span>
                <span class="ef-milestone-val">${_fmt(pontos[m.idx]?.total || 0)}</span>
            </div>
        `).join('');

        _drawChart(pontos);
    }

    function _drawChart(pontos) {
        const svg = document.getElementById('ef-svg-chart');
        if (!svg || pontos.length < 2) return;
        const maxVal = Math.max(...pontos.map(p => p.total));
        const W = 500, H = 220, PAD = 10;
        const scaleX = i => PAD + (i / (pontos.length - 1)) * (W - PAD * 2);
        const scaleY = v => H - PAD - (v / maxVal) * (H - PAD * 2);

       
        let pathTotal = `M ${scaleX(0)},${scaleY(pontos[0].total)}`;
        pontos.forEach((p, i) => { pathTotal += ` L ${scaleX(i)},${scaleY(p.total)}`; });
        const fillTotal = pathTotal + ` L ${scaleX(pontos.length - 1)},${H} L ${scaleX(0)},${H} Z`;

      
        let pathInv = `M ${scaleX(0)},${scaleY(pontos[0].investido)}`;
        pontos.forEach((p, i) => { pathInv += ` L ${scaleX(i)},${scaleY(p.investido)}`; });

    
        const gridLines = [0.25, 0.5, 0.75, 1].map(f =>
            `<line x1="${PAD}" x2="${W - PAD}" y1="${scaleY(maxVal * f)}" y2="${scaleY(maxVal * f)}" stroke="rgba(255,255,255,0.06)" stroke-width="1" />`
        ).join('');

        svg.innerHTML = `
            <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
                    <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
                </linearGradient>
            </defs>
            ${gridLines}
            <path d="${fillTotal}" fill="url(#cg)"/>
            <path d="${pathTotal}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="${pathInv}" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="1.5" stroke-dasharray="5,3"/>
        `;
    }


    function _renderMercado(container) {
        container.innerHTML = `
            <div class="ef-market-wrap">
                <div class="ef-market-toolbar">
                    <span class="ef-lbl">📡 Monitor de Ativos Globais</span>
                    <div class="ef-search-box">
                        <span>🔍</span>
                        <input type="text" id="ef-mkt-search" placeholder="Filtrar ativo..." oninput="EducacaoFinanceira._filterMarket(this.value)" />
                    </div>
                </div>
                <div id="ef-market-list" class="ef-market-grid">
                    <div class="ef-loading-state">
                        <div class="ef-spinner"></div>
                        <p>Sincronizando cotações…</p>
                    </div>
                </div>
            </div>
        `;
    }

    async function carregarCotacoes() {
        if (_state.aba !== 'mercado') return;
        try {
            const res  = await fetch(EXCHANGE_API);
            const data = await res.json();
            const rates = data.rates;

            const assets = [
                { id: 'USD', nome: 'Dólar Americano',   icon: '🇺🇸', cat: 'Moeda',  color: '#60a5fa' },
                { id: 'EUR', nome: 'Euro',               icon: '🇪🇺', cat: 'Moeda',  color: '#a78bfa' },
                { id: 'GBP', nome: 'Libra Esterlina',   icon: '🇬🇧', cat: 'Moeda',  color: '#34d399' },
                { id: 'JPY', nome: 'Iene Japonês',       icon: '🇯🇵', cat: 'Moeda',  color: '#fb7185' },
                { id: 'CHF', nome: 'Franco Suíço',       icon: '🇨🇭', cat: 'Moeda',  color: '#f472b6' },
                { id: 'CAD', nome: 'Dólar Canadense',   icon: '🇨🇦', cat: 'Moeda',  color: '#38bdf8' },
                { id: 'ARS', nome: 'Peso Argentino',    icon: '🇦🇷', cat: 'Moeda',  color: '#fbbf24' },
                { id: 'BTC', nome: 'Bitcoin',           icon: '₿',   cat: 'Cripto', color: '#f59e0b' },
                { id: 'ETH', nome: 'Ethereum',          icon: 'Ξ',   cat: 'Cripto', color: '#8b5cf6' },
                { id: 'XRP', nome: 'XRP',               icon: '✕',   cat: 'Cripto', color: '#06b6d4' },
            ];

            _state.marketData = assets.map(a => {
                const rate = rates[a.id];
                const val  = rate ? (1 / rate) : 0;
                const change = parseFloat((Math.random() * 6 - 3).toFixed(2));
                return { ...a, val, change };
            });

            _renderMarketList(_state.marketData);
        } catch {
            const list = document.getElementById('ef-market-list');
            if (list) list.innerHTML = '<p class="ef-error-msg">⚠️ Erro ao carregar cotações. Tente novamente.</p>';
        }
    }

    function _renderMarketList(data) {
        const list = document.getElementById('ef-market-list');
        if (!list) return;
        if (!data.length) {
            list.innerHTML = '<p class="ef-error-msg">Nenhum ativo encontrado.</p>';
            return;
        }

        list.innerHTML = data.map(a => {
            const isUp = a.change >= 0;
            // Mini sparkline aleatório mas coerente com direção
            const spark = Array.from({ length: 8 }, (_, i) => {
                const base = 15 - i * (isUp ? -1.5 : 1.5);
                return Math.max(2, Math.min(28, base + (Math.random() * 6 - 3)));
            });
            const sx = i => (i / 7) * 50;
            let sparkPath = `M ${sx(0)},${spark[0]}`;
            spark.forEach((y, i) => { sparkPath += ` L ${sx(i)},${y}`; });

            const valDisplay = a.val > 1000
                ? a.val.toLocaleString('pt-BR', { maximumFractionDigits: 0 })
                : a.val < 0.01
                ? a.val.toFixed(6)
                : a.val.toFixed(4);

            return `
                <div class="ef-coin-card" style="--card-accent:${a.color}">
                    <div class="ef-coin-row-top">
                        <div class="ef-coin-brand">
                            <span class="ef-coin-icon">${a.icon}</span>
                            <span class="ef-coin-cat" style="color:${a.color}">${a.cat}</span>
                        </div>
                        <svg class="ef-coin-spark" width="50" height="30" viewBox="0 0 50 30">
                            <path d="${sparkPath}" fill="none" stroke="${isUp ? '#4ade80' : '#f87171'}" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <div class="ef-coin-name">${a.nome}</div>
                    <div class="ef-coin-val">R$ ${valDisplay}</div>
                    <div class="ef-coin-footer">
                        <span class="ef-coin-id">${a.id}/BRL</span>
                        <span class="ef-coin-change ${isUp ? 'up' : 'down'}">
                            ${isUp ? '▲' : '▼'} ${Math.abs(a.change)}%
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function _filterMarket(query) {
        const q = query.toLowerCase();
        const filtered = (_state.marketData || []).filter(a =>
            a.nome.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)
        );
        _renderMarketList(filtered);
    }

 
    function _renderPlanilha(container) {
        _state.gastos = _loadGastos();
        const uid = window.App?.state?.user?.id || 'guest';
        _state.metaEconomia = parseFloat(localStorage.getItem('ef_meta_' + uid) || '2000');
        _state.renda = parseFloat(localStorage.getItem('ef_renda_' + uid) || '0');

        const total = _state.gastos.reduce((acc, g) => acc + g.valor, 0);
        const pctMeta = _state.metaEconomia > 0 ? Math.min(100, (total / _state.metaEconomia) * 100) : 0;
        const saldo = _state.renda - total;

      
        const cats = {};
        _state.gastos.forEach(g => { cats[g.cat] = (cats[g.cat] || 0) + g.valor; });

        container.innerHTML = `
            <div class="ef-plan-wrap">
                <div class="ef-plan-stats">
                    <div class="ef-stat-card">
                        <div class="ef-stat-icon">💸</div>
                        <div><small>Total Gasto</small><b>${_fmt(total)}</b></div>
                    </div>
                    <div class="ef-stat-card">
                        <div class="ef-stat-icon">💵</div>
                        <div>
                            <small>Renda Mensal</small>
                            <div style="display:flex;align-items:center;gap:6px">
                                <b>R$</b>
                                <input type="number" class="ef-inline-input" value="${_state.renda}" onchange="EducacaoFinanceira.salvarRenda(this.value)" placeholder="0,00"/>
                            </div>
                        </div>
                    </div>
                    <div class="ef-stat-card">
                        <div class="ef-stat-icon">${saldo >= 0 ? '✅' : '🚨'}</div>
                        <div><small>Saldo</small><b style="color:${saldo >= 0 ? '#4ade80' : '#f87171'}">${_fmt(saldo)}</b></div>
                    </div>
                    <div class="ef-stat-card">
                        <div class="ef-stat-icon">🎯</div>
                        <div>
                            <small>Meta de Gasto</small>
                            <div style="display:flex;align-items:center;gap:6px">
                                <b>R$</b>
                                <input type="number" class="ef-inline-input" value="${_state.metaEconomia}" onchange="EducacaoFinanceira.salvarMeta(this.value)" placeholder="0,00"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ef-budget-bar-wrap">
                    <div class="ef-budget-bar-header">
                        <span>Orçamento utilizado</span>
                        <span style="color:${pctMeta > 90 ? '#f87171' : 'var(--accent)'}; font-family:monospace;">${pctMeta.toFixed(1)}%</span>
                    </div>
                    <div class="ef-bar-bg">
                        <div class="ef-bar-fill" style="width:${pctMeta}%;background:${pctMeta > 90 ? '#f87171' : pctMeta > 70 ? '#fbbf24' : '#4ade80'}"></div>
                    </div>
                </div>

                <div class="ef-plan-body">
                    <div class="ef-chart-col">
                        <div class="ef-sec-label">Distribuição de Gastos</div>
                        <div id="ef-pie-container" style="position:relative;display:flex;align-items:center;justify-content:center;">
                            <svg id="ef-svg-pie" width="150" height="150" viewBox="0 0 42 42"></svg>
                            <div id="ef-pie-center" style="position:absolute;text-align:center;">
                                <div style="font-size:8px;color:var(--text-3);text-transform:uppercase;letter-spacing:1px">Média</div>
                                <div style="font-size:16px;font-weight:800;font-family:monospace;color:#fff">${_state.gastos.length ? 'R$ ' + (total / _state.gastos.length).toFixed(0) : '—'}</div>
                            </div>
                        </div>
                        <div id="ef-pie-legend" style="margin-top:12px"></div>
                    </div>
                    <div class="ef-list-col">
                        <div class="ef-plan-form">
                            <input type="text" id="ef-g-desc" placeholder="Descrição (ex: Livros)" />
                            <input type="text" id="ef-g-cat" placeholder="Categoria (ex: Educação)" />
                            <input type="number" id="ef-g-val" step="0.01" placeholder="R$ 0,00" />
                            <button class="ef-btn-add" onclick="EducacaoFinanceira.adicionarGasto()">＋ Adicionar</button>
                        </div>
                        <div id="ef-plan-list" class="ef-expenses-list">
                            ${_state.gastos.length
                                ? [..._state.gastos].reverse().map(g => `
                                    <div class="ef-plan-item">
                                        <span class="ef-plan-icon">${_getIconForCategory(g.cat)}</span>
                                        <div class="ef-plan-info">
                                            <div class="ef-plan-desc">${_esc(g.desc)}</div>
                                            <div class="ef-plan-cat">${_esc(g.cat)}</div>
                                        </div>
                                        <div class="ef-plan-val">${_fmt(g.valor)}</div>
                                        <button class="ef-g-del" onclick="EducacaoFinanceira.removerGasto(${g.id})" title="Remover">✕</button>
                                    </div>
                                `).join('')
                                : '<div class="ef-empty-msg">Nenhum gasto registrado. Adicione acima! 👆</div>'
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        _renderGraficoCategorias();
    }

    function adicionarGasto() {
        const desc = document.getElementById('ef-g-desc')?.value.trim();
        const val  = parseFloat(document.getElementById('ef-g-val')?.value);
        const cat  = (document.getElementById('ef-g-cat')?.value.trim() || 'Outros');
        if (!desc || isNaN(val) || val <= 0) {
            _shake('ef-g-desc');
            return;
        }
        const catFormatted = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
        _state.gastos.push({ id: Date.now(), desc, valor: val, cat: catFormatted });
        _saveGastos();
        _renderPlanilha(document.getElementById('ef-main-content'));
    }

    function removerGasto(id) {
        _state.gastos = _state.gastos.filter(g => g.id !== id);
        _saveGastos();
        _renderPlanilha(document.getElementById('ef-main-content'));
    }

    function salvarMeta(val) {
        const v = parseFloat(val) || 500;
        const uid = window.App?.state?.user?.id || 'guest';
        localStorage.setItem('ef_meta_' + uid, v);
        _renderPlanilha(document.getElementById('ef-main-content'));
    }

    function salvarRenda(val) {
        const v = parseFloat(val) || 0;
        const uid = window.App?.state?.user?.id || 'guest';
        _state.renda = v;
        localStorage.setItem('ef_renda_' + uid, v);
        _renderPlanilha(document.getElementById('ef-main-content'));
    }

    function _loadGastos() {
        const uid = window.App?.state?.user?.id || 'guest';
        try { return JSON.parse(localStorage.getItem('ef_gastos_' + uid) || '[]'); } catch { return []; }
    }

    function _saveGastos() {
        const uid = window.App?.state?.user?.id || 'guest';
        localStorage.setItem('ef_gastos_' + uid, JSON.stringify(_state.gastos));
    }

    function _renderGraficoCategorias() {
        const svg    = document.getElementById('ef-svg-pie');
        const legend = document.getElementById('ef-pie-legend');
        if (!svg || !_state.gastos.length) {
            if (svg) svg.innerHTML = `<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(255,255,255,0.07)" stroke-width="6"/>`;
            return;
        }
        const cats = {};
        _state.gastos.forEach(g => cats[g.cat] = (cats[g.cat] || 0) + g.valor);
        const total = Object.values(cats).reduce((a, b) => a + b, 0);
        let offset = 0;
        let svgHtml = '';
        let legendHtml = '';

        Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([cat, val]) => {
            const pct   = (val / total) * 100;
            const dash  = `${pct} ${100 - pct}`;
            const color = _getCategoryColor(cat);
            svgHtml += `<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="${color}" stroke-width="6" stroke-dasharray="${dash}" stroke-dashoffset="${100 - offset + 25}" stroke-linecap="round"></circle>`;
            legendHtml += `<div class="ef-leg-item"><span class="ef-leg-dot" style="background:${color}"></span><span>${_esc(cat)}</span><b>${Math.round(pct)}%</b></div>`;
            offset += pct;
        });

        svg.innerHTML = svgHtml;
        if (legend) legend.innerHTML = legendHtml;
    }

    const LESSONS = {
        intro: {
            title: "🏁 Introdução aos Investimentos",
            content: "Investir é colocar seu dinheiro para trabalhar para você. O primeiro passo é criar sua <b>Reserva de Emergência</b>: pelo menos 6 meses de gastos guardados em ativos de alta liquidez. Sem essa base, qualquer imprevisto pode forçar você a vender investimentos no pior momento.",
            prompt: "Explique o conceito de Reserva de Emergência para um estudante iniciante e por que ela é o primeiro passo antes de qualquer investimento."
        },
        rendafixa: {
            title: "🛡️ Renda Fixa: O Porto Seguro",
            content: "Na renda fixa você 'empresta' dinheiro ao Governo ou a bancos em troca de juros previsíveis. Exemplos: <b>Tesouro Direto</b>, CDB, LCI e LCA. Ideal para a reserva de emergência e objetivos de curto/médio prazo.",
            prompt: "Explique como funciona a Renda Fixa no Brasil: diferença entre títulos prefixados, pós-fixados e indexados ao IPCA, de forma simples para um estudante."
        },
        rendavariavel: {
            title: "🎢 Renda Variável: Riscos e Ganhos",
            content: "Ações e Fundos Imobiliários (FIIs) permitem que você seja sócio de negócios reais. O retorno não é garantido e oscila diariamente, mas o potencial de crescimento e os <b>dividendos mensais</b> fazem valer para o longo prazo.",
            prompt: "Explique o que são ações e FIIs e como um jovem estudante pode começar a receber dividendos mensais com segurança e pouco capital."
        },
        juros_compostos: {
            title: "🔄 Juros Compostos: A Mágica do Tempo",
            content: "Einstein teria chamado os juros compostos de 'a oitava maravilha do mundo'. Juros compostos são juros sobre juros — quanto mais cedo você começa, maior o efeito multiplicador ao longo dos anos.",
            prompt: "Explique juros compostos com exemplos numéricos práticos e mostre por que começar a investir cedo faz uma diferença enorme no longo prazo."
        },
        estrategia: {
            title: "🎯 Estratégia e Diversificação",
            content: "A regra de ouro: <i>não coloque todos os ovos na mesma cesta</i>. Uma boa carteira distribui recursos entre diferentes classes de ativos e setores, protegendo o patrimônio contra crises pontuais.",
            prompt: "Dê um roteiro prático de como um jovem estudante pode montar uma carteira diversificada do zero, com pouco dinheiro, combinando renda fixa e variável."
        }
    };

    function _renderAula(container) {
      
        const historyHtml = _state.tutorHistory.map(m =>
            `<div class="ef-tutor-msg ${m.role === 'user' ? 'user' : 'bot'}">${m.role === 'user' ? _esc(m.content) : m.content}</div>`
        ).join('');

        container.innerHTML = `
            <div class="ef-lesson-wrap">
                <div class="ef-lesson-sidebar">
                    <div class="ef-sec-label">📚 Trilha de Aprendizado</div>
                    <div class="ef-lesson-list">
                        ${Object.entries(LESSONS).map(([key, l]) => `
                            <button class="ef-lesson-item" onclick="EducacaoFinanceira._loadLesson('${key}', this)">${l.title}</button>
                        `).join('')}
                    </div>
                </div>
                <div class="ef-lesson-main">
                    <div id="ef-lesson-content" class="ef-lesson-text">
                        <h3>Bem-vindo ao Tutor Financeiro 🤖</h3>
                        <p>Escolha um módulo ao lado para estudar ou use o chat abaixo para tirar qualquer dúvida sobre finanças, investimentos e mercado.</p>
                    </div>

                    <div class="ef-tutor-box">
                        <div class="ef-tutor-header">
                            <span class="ef-sec-label">💬 Tutor Financeiro IA</span>
                            <button class="ef-clear-btn" onclick="EducacaoFinanceira._clearChat()" title="Limpar conversa">🗑 Limpar</button>
                        </div>
                        <div id="ef-tutor-chat" class="ef-tutor-messages">
                            ${historyHtml || '<div class="ef-tutor-msg bot">Olá! Sou seu mentor financeiro pessoal 💰 Posso explicar conceitos, simular cenários ou tirar qualquer dúvida sobre investimentos. O que você gostaria de aprender hoje?</div>'}
                        </div>
                        <div class="ef-tutor-suggestions" id="ef-suggestions">
                            <button onclick="EducacaoFinanceira._askFinancialTutor('O que é a Taxa Selic e como ela afeta meus investimentos?')">Taxa Selic</button>
                            <button onclick="EducacaoFinanceira._askFinancialTutor('Como declarar investimentos no Imposto de Renda?')">IR em investimentos</button>
                            <button onclick="EducacaoFinanceira._askFinancialTutor('Qual a diferença entre CDI e IPCA?')">CDI vs IPCA</button>
                            <button onclick="EducacaoFinanceira._askFinancialTutor('Como funciona o Tesouro Selic?')">Tesouro Selic</button>
                        </div>
                        <div class="ef-tutor-input-wrap">
                            <input type="text" id="ef-tutor-input" placeholder="Pergunte qualquer coisa sobre finanças..." onkeydown="if(event.key==='Enter' && !event.shiftKey){ event.preventDefault(); EducacaoFinanceira._askFinancialTutor(); }" />
                            <button id="ef-send-btn" onclick="EducacaoFinanceira._askFinancialTutor()">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const chat = document.getElementById('ef-tutor-chat');
            if (chat) chat.scrollTop = chat.scrollHeight;
        }, 50);
    }

    function _loadLesson(key, btn) {
        const lesson = LESSONS[key];
        if (!lesson) return;
        document.querySelectorAll('.ef-lesson-item').forEach(b => b.classList.remove('active'));
        btn?.classList.add('active');

        const el = document.getElementById('ef-lesson-content');
        if (!el) return;
        el.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.content}</p>
            <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;">
                <button class="ef-btn-lesson" onclick="EducacaoFinanceira._askFinancialTutor('${lesson.prompt.replace(/'/g, "\\'")}')">
                    🔍 Aprofundar com IA
                </button>
            </div>
        `;
    }

    function _clearChat() {
        _state.tutorHistory = [];
        const chat = document.getElementById('ef-tutor-chat');
        if (chat) chat.innerHTML = '<div class="ef-tutor-msg bot">Conversa reiniciada. Como posso ajudar? 💰</div>';
    }

    async function _askFinancialTutor(customPrompt = null) {
        const input = document.getElementById('ef-tutor-input');
        const query = customPrompt || input?.value.trim();
        if (!query) return;

        const chat    = document.getElementById('ef-tutor-chat');
        const sendBtn = document.getElementById('ef-send-btn');
        if (!chat) return;
        if (input)   input.value = '';
        if (sendBtn) sendBtn.disabled = true;

       
        const sugg = document.getElementById('ef-suggestions');
        if (sugg) sugg.style.display = 'none';

       
        const userMsg = document.createElement('div');
        userMsg.className = 'ef-tutor-msg user';
        userMsg.textContent = query;
        chat.appendChild(userMsg);
        chat.scrollTop = chat.scrollHeight;

        const botMsg = document.createElement('div');
        botMsg.className = 'ef-tutor-msg bot typing';
        botMsg.innerHTML = '<span></span><span></span><span></span>';
        chat.appendChild(botMsg);
        chat.scrollTop = chat.scrollHeight;

        
        _state.tutorHistory.push({ role: 'user', content: query });

        try {
        
            const historicoTexto = _state.tutorHistory.slice(-8)
                .map(m => `${m.role === 'user' ? 'Aluno' : 'Tutor'}: ${m.content}`)
                .join('\n');

            const mensagemCompleta = historicoTexto
                ? `Histórico da conversa:\n${historicoTexto}\n\nNova pergunta do Aluno: ${query}`
                : query;

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: mensagemCompleta,
                    context: 'Você é um Tutor de Educação Financeira para estudantes brasileiros. Explique conceitos de forma simples e motivadora, com exemplos do cotidiano (R$, CDI, Selic, Tesouro Direto). Incentive bons hábitos financeiros. NÃO recomende ativos específicos. Use quebras de linha. Responda em português.'
                })
            });

            if (!res.ok) throw new Error(`Erro ${res.status}`);
            const data = await res.json();
            const reply = (data.response || '').trim() || 'Não obtive resposta. Tente novamente.';

            
            botMsg.className = 'ef-tutor-msg bot';
            botMsg.innerHTML = _formatMdBasic(reply);

          
            _state.tutorHistory.push({ role: 'assistant', content: reply });

        } catch (e) {
            botMsg.className = 'ef-tutor-msg bot error';
            botMsg.textContent = '⚠️ Erro de conexão. Verifique sua internet e tente novamente.';
           
            _state.tutorHistory.pop();
        }

        chat.scrollTop = chat.scrollHeight;
        if (sendBtn) sendBtn.disabled = false;
    }

    
    function _fmt(val) {
        return 'R$ ' + (val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function _esc(s) {
        const d = document.createElement('div');
        d.textContent = String(s);
        return d.innerHTML;
    }

    function _shake(id) {
        const el = document.getElementById(id);
        if (!el) return;
        el.style.animation = 'ef-shake 0.3s ease';
        setTimeout(() => el.style.animation = '', 300);
    }

    function _formatMdBasic(text) {
        return text
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            .replace(/`(.+?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    function _getIconForCategory(cat) {
        const map = {
            'estudos': '📚', 'educação': '📚', 'livros': '📚',
            'comida': '🍕', 'alimentação': '🍕', 'restaurante': '🍽️',
            'transporte': '🚌', 'uber': '🚗', 'combustível': '⛽',
            'lazer': '🎮', 'entretenimento': '🎬', 'streaming': '📺',
            'saúde': '🏥', 'farmácia': '💊', 'academia': '🏋️',
            'casa': '🏠', 'aluguel': '🏠', 'moradia': '🏠',
            'mercado': '🛒', 'supermercado': '🛒',
            'assinatura': '💳', 'software': '💻',
            'roupas': '👕', 'vestuário': '👕',
            'outros': '💰'
        };
        return map[cat.toLowerCase()] || '💰';
    }

    function _getCategoryColor(cat) {
        const colors = {
            'Educação': '#60a5fa', 'Alimentação': '#f87171', 'Transporte': '#fbbf24',
            'Lazer': '#c084fc', 'Saúde': '#34d399', 'Casa': '#fb923c', 'Mercado': '#38bdf8',
            'Assinatura': '#a78bfa', 'Roupas': '#f472b6', 'Outros': '#94a3b8'
        };
        if (colors[cat]) return colors[cat];
        let hash = 0;
        for (let i = 0; i < cat.length; i++) hash = cat.charCodeAt(i) + ((hash << 5) - hash);
        return `hsl(${Math.abs(hash % 360)}, 65%, 65%)`;
    }

    function _injectStyles() {
        if (document.getElementById('ef-styles')) return;
        const style = document.createElement('style');
        style.id = 'ef-styles';
        style.textContent = `

.ef-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 16px; animation: ef-fade-in 0.2s ease; }
@keyframes ef-fade-in { from { opacity: 0; } to { opacity: 1; } }

.ef-box {
    width: min(920px, 96vw);
    height: min(700px, 92vh);
    background: linear-gradient(160deg, #0f1117 0%, #0c0e18 100%);
    border-radius: 24px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset;
    animation: ef-slide-up 0.25s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes ef-slide-up { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }


.ef-header { padding: 20px 28px; border-bottom: 1px solid rgba(255,255,255,0.07); display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; background: rgba(255,255,255,0.02); }
.ef-title { display: flex; gap: 14px; align-items: center; }
.ef-icon-wrap { width: 48px; height: 48px; background: linear-gradient(135deg, rgba(232,160,74,0.2), rgba(232,160,74,0.05)); border: 1px solid rgba(232,160,74,0.3); border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.ef-icon { font-size: 24px; }
.ef-title h2 { margin: 0; font-size: 20px; color: #fff; font-family: 'DM Serif Display', serif; letter-spacing: -0.3px; }
.ef-title p  { margin: 2px 0 0; font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 0.05em; }
.ef-close { background: rgba(255,255,255,0.07); border: none; color: rgba(255,255,255,0.5); font-size: 18px; cursor: pointer; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.ef-close:hover { background: rgba(255,255,255,0.12); color: #fff; }


.ef-tabs { display: flex; background: rgba(0,0,0,0.4); padding: 8px 16px; gap: 6px; flex-shrink: 0; }
.ef-tab { flex: 1; padding: 10px 6px; border: none; background: transparent; color: rgba(255,255,255,0.4); cursor: pointer; border-radius: 10px; font-weight: 600; font-size: 13px; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); white-space: nowrap; }
.ef-tab:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
.ef-tab.active { background: var(--accent,#e8a04a); color: #000; box-shadow: 0 4px 16px rgba(232,160,74,0.35); }


.ef-main { flex: 1; overflow-y: auto; padding: 24px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.1) transparent; }
.ef-main::-webkit-scrollbar { width: 5px; }
.ef-main::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }


.ef-sim-container { display: grid; grid-template-columns: 260px 1fr; gap: 24px; height: 100%; }
.ef-field { margin-bottom: 14px; }
.ef-field label { display: block; font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
.ef-field input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 11px 14px; color: #fff; outline: none; font-size: 15px; font-weight: 600; font-family: monospace; transition: border-color 0.2s; box-sizing: border-box; }
.ef-field input:focus { border-color: var(--accent,#e8a04a); }

.ef-preset-label { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
.ef-presets { display: flex; gap: 6px; margin-bottom: 16px; }
.ef-presets button { flex: 1; padding: 7px 4px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: rgba(255,255,255,0.5); font-size: 11px; cursor: pointer; transition: all 0.2s; }
.ef-presets button:hover { background: rgba(232,160,74,0.12); border-color: rgba(232,160,74,0.3); color: var(--accent); }

.ef-res-card { background: rgba(232,160,74,0.07); padding: 16px; border-radius: 14px; border: 1px solid rgba(232,160,74,0.2); }
.ef-res-top { margin-bottom: 14px; }
.ef-res-label { font-size: 10px; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.ef-res-val { font-size: 22px; font-weight: 800; color: var(--accent,#e8a04a); font-family: monospace; }
.ef-res-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ef-res-item { display: flex; align-items: center; gap: 8px; }
.ef-res-icon { font-size: 18px; }
.ef-res-item small { display: block; font-size: 9px; color: rgba(255,255,255,0.35); text-transform: uppercase; margin-bottom: 2px; }
.ef-res-item b { display: block; font-size: 13px; color: #fff; font-family: monospace; }

.ef-chart-area { display: flex; flex-direction: column; gap: 14px; }
.ef-chart-header { display: flex; justify-content: space-between; align-items: center; }
.ef-chart-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em; }
.ef-chart-legend { display: flex; gap: 12px; font-size: 11px; color: rgba(255,255,255,0.4); align-items: center; }
.ef-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; margin-right: 4px; }
.ef-dot.accent { background: var(--accent,#e8a04a); }
.ef-dot.white { background: rgba(255,255,255,0.3); }
.ef-chart-wrap { background: rgba(0,0,0,0.3); border-radius: 14px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden; height: 200px; }
#ef-svg-chart { width: 100%; height: 100%; }

.ef-milestones { display: flex; gap: 10px; }
.ef-milestone { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 10px; text-align: center; }
.ef-milestone-label { display: block; font-size: 9px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
.ef-milestone-val { font-size: 13px; font-weight: 700; color: var(--accent,#e8a04a); font-family: monospace; }


.ef-market-wrap { display: flex; flex-direction: column; gap: 16px; }
.ef-market-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.ef-lbl { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.06em; }
.ef-search-box { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 8px 14px; }
.ef-search-box input { background: none; border: none; outline: none; color: #fff; font-size: 13px; width: 180px; }

.ef-market-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(165px, 1fr)); gap: 12px; }

.ef-coin-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    padding: 16px;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    transition: all 0.2s;
    cursor: default;
}
.ef-coin-card:hover { background: rgba(255,255,255,0.06); border-color: var(--card-accent,rgba(255,255,255,0.15)); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
.ef-coin-row-top { display: flex; justify-content: space-between; align-items: flex-start; }
.ef-coin-brand { display: flex; flex-direction: column; gap: 4px; }
.ef-coin-icon { font-size: 22px; }
.ef-coin-cat { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
.ef-coin-spark { display: block; }
.ef-coin-name { font-size: 12px; color: rgba(255,255,255,0.55); font-weight: 500; }
.ef-coin-val { font-size: 18px; font-weight: 800; color: #fff; font-family: monospace; }
.ef-coin-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
.ef-coin-id { font-size: 9px; color: rgba(255,255,255,0.25); font-family: monospace; }
.ef-coin-change { font-size: 12px; font-weight: 700; font-family: monospace; padding: 2px 8px; border-radius: 6px; }
.ef-coin-change.up   { color: #4ade80; background: rgba(74,222,128,0.1); }
.ef-coin-change.down { color: #f87171; background: rgba(248,113,113,0.1); }

.ef-loading-state { grid-column: 1/-1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 0; color: rgba(255,255,255,0.35); gap: 16px; }
.ef-error-msg { grid-column: 1/-1; text-align: center; padding: 40px; font-size: 14px; color: rgba(255,255,255,0.35); }


.ef-plan-wrap { display: flex; flex-direction: column; gap: 16px; }
.ef-plan-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; }
.ef-stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; }
.ef-stat-icon { font-size: 22px; flex-shrink: 0; }
.ef-stat-card small { display: block; font-size: 9px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 3px; }
.ef-stat-card b { font-size: 16px; color: #fff; font-family: monospace; font-weight: 700; }
.ef-inline-input { background: none; border: none; border-bottom: 1px solid rgba(255,255,255,0.2); outline: none; color: #fff; font-family: monospace; font-weight: 700; font-size: 16px; width: 90px; }

.ef-budget-bar-wrap { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 14px 16px; }
.ef-budget-bar-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 12px; color: rgba(255,255,255,0.5); font-weight: 600; }
.ef-bar-bg { background: rgba(255,255,255,0.06); border-radius: 6px; height: 8px; overflow: hidden; }
.ef-bar-fill { height: 100%; border-radius: 6px; transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1); }

.ef-plan-body { display: grid; grid-template-columns: 200px 1fr; gap: 20px; }
.ef-chart-col { }
.ef-list-col { display: flex; flex-direction: column; gap: 12px; }

.ef-sec-label { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px; }

.ef-plan-form { display: flex; gap: 8px; flex-wrap: wrap; }
.ef-plan-form input { flex: 1; min-width: 100px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 12px; color: #fff; outline: none; font-size: 13px; }
.ef-plan-form input:focus { border-color: var(--accent); }
.ef-btn-add { padding: 10px 18px; background: var(--accent,#e8a04a); color: #000; border: none; border-radius: 10px; font-weight: 700; font-size: 13px; cursor: pointer; white-space: nowrap; transition: opacity 0.2s; }
.ef-btn-add:hover { opacity: 0.85; }

.ef-expenses-list { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
.ef-plan-item { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 10px 14px; }
.ef-plan-icon { font-size: 20px; flex-shrink: 0; }
.ef-plan-info { flex: 1; }
.ef-plan-desc { font-size: 13px; font-weight: 600; color: #fff; }
.ef-plan-cat  { font-size: 10px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 1px; }
.ef-plan-val  { font-family: monospace; font-weight: 700; color: var(--accent,#e8a04a); font-size: 14px; }
.ef-g-del { background: none; border: none; color: rgba(255,255,255,0.2); font-size: 14px; cursor: pointer; padding: 4px 6px; border-radius: 6px; transition: all 0.2s; }
.ef-g-del:hover { background: rgba(248,113,113,0.15); color: #f87171; }
.ef-empty-msg { text-align: center; padding: 24px; color: rgba(255,255,255,0.3); font-size: 13px; }

.ef-leg-item { display: flex; align-items: center; gap: 8px; font-size: 11px; color: rgba(255,255,255,0.55); margin-bottom: 6px; }
.ef-leg-dot { width: 10px; height: 10px; border-radius: 3px; flex-shrink: 0; }
.ef-leg-item span { flex: 1; }
.ef-leg-item b { font-family: monospace; }

.ef-lesson-wrap { display: grid; grid-template-columns: 200px 1fr; gap: 20px; height: 100%; }
.ef-lesson-sidebar { }
.ef-lesson-list { display: flex; flex-direction: column; gap: 6px; }
.ef-lesson-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); padding: 11px 14px; border-radius: 10px; color: rgba(255,255,255,0.55); cursor: pointer; text-align: left; font-size: 12px; font-weight: 600; transition: all 0.2s; }
.ef-lesson-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
.ef-lesson-item.active { background: rgba(232,160,74,0.12); border-color: rgba(232,160,74,0.3); color: var(--accent,#e8a04a); }
.ef-lesson-main { display: flex; flex-direction: column; gap: 14px; overflow: hidden; }

.ef-lesson-text { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; flex-shrink: 0; }
.ef-lesson-text h3 { margin: 0 0 10px; font-family: 'DM Serif Display', serif; font-size: 18px; color: #fff; }
.ef-lesson-text p  { margin: 0; font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.7); }
.ef-btn-lesson { padding: 9px 16px; background: rgba(232,160,74,0.12); border: 1px solid rgba(232,160,74,0.3); border-radius: 10px; color: var(--accent,#e8a04a); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.ef-btn-lesson:hover { background: rgba(232,160,74,0.2); }

.ef-tutor-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; display: flex; flex-direction: column; flex: 1; overflow: hidden; }
.ef-tutor-header { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); flex-shrink: 0; }
.ef-clear-btn { background: none; border: none; color: rgba(255,255,255,0.3); font-size: 12px; cursor: pointer; transition: color 0.2s; }
.ef-clear-btn:hover { color: #f87171; }

.ef-tutor-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.08) transparent; }
.ef-tutor-msg { max-width: 85%; padding: 12px 16px; border-radius: 14px; font-size: 13px; line-height: 1.6; }
.ef-tutor-msg.user { background: var(--accent,#e8a04a); color: #000; align-self: flex-end; border-radius: 14px 14px 4px 14px; font-weight: 600; }
.ef-tutor-msg.bot  { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.85); align-self: flex-start; border-radius: 14px 14px 14px 4px; }
.ef-tutor-msg.error { background: rgba(248,113,113,0.1); color: #f87171; }
.ef-tutor-msg.bot code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; }


.ef-tutor-msg.typing { display: flex; align-items: center; gap: 5px; padding: 14px 18px; }
.ef-tutor-msg.typing span { width: 8px; height: 8px; background: rgba(255,255,255,0.4); border-radius: 50%; animation: ef-bounce 1.2s infinite; }
.ef-tutor-msg.typing span:nth-child(2) { animation-delay: 0.2s; }
.ef-tutor-msg.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes ef-bounce { 0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; } 40% { transform: scale(1.2); opacity: 1; } }

.ef-tutor-suggestions { padding: 0 16px 12px; display: flex; flex-wrap: wrap; gap: 8px; flex-shrink: 0; }
.ef-tutor-suggestions button { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 6px 12px; color: rgba(255,255,255,0.5); font-size: 11px; cursor: pointer; transition: all 0.2s; }
.ef-tutor-suggestions button:hover { background: rgba(232,160,74,0.1); border-color: rgba(232,160,74,0.3); color: var(--accent); }

.ef-tutor-input-wrap { display: flex; gap: 10px; padding: 14px 16px; border-top: 1px solid rgba(255,255,255,0.07); flex-shrink: 0; }
#ef-tutor-input { flex: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; color: #fff; outline: none; font-size: 13px; }
#ef-tutor-input:focus { border-color: rgba(232,160,74,0.4); }
#ef-send-btn { width: 44px; height: 44px; background: var(--accent,#e8a04a); border: none; border-radius: 12px; color: #000; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
#ef-send-btn:hover { opacity: 0.85; transform: scale(1.05); }
#ef-send-btn:disabled { opacity: 0.4; transform: none; cursor: not-allowed; }


.ef-spinner { width: 36px; height: 36px; border: 3px solid rgba(255,255,255,0.06); border-top-color: var(--accent,#e8a04a); border-radius: 50%; animation: ef-spin 0.7s linear infinite; }
@keyframes ef-spin { to { transform: rotate(360deg); } }


@keyframes ef-shake { 0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)} }

@media (max-width: 640px) {
    .ef-sim-container { grid-template-columns: 1fr; }
    .ef-plan-body { grid-template-columns: 1fr; }
    .ef-lesson-wrap { grid-template-columns: 1fr; }
    .ef-lesson-sidebar { display: flex; flex-wrap: wrap; gap: 6px; flex-direction: row; }
    .ef-lesson-list { flex-direction: row; flex-wrap: wrap; }
    .ef-res-grid { grid-template-columns: 1fr 1fr; }
}
        `;
        document.head.appendChild(style);
    }

 
    return {
        abrir, fechar, setTab, calcular, aplicarPreset,
        _filterMarket, carregarCotacoes,
        adicionarGasto, removerGasto, salvarMeta, salvarRenda,
        _loadLesson, _askFinancialTutor, _clearChat
    };
})();

window.EducacaoFinanceira = EducacaoFinanceira;