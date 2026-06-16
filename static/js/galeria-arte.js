
const GaleriaArte = (() => {
    const MODAL_ID = 'modal-galeria-arte';
    const API_URL  = 'https://collectionapi.metmuseum.org/public/collection/v1';

    let _state = {
        currentId: null,
        annos:     {},
        scale: 1, tx: 0, ty: 0,
        dragging:  false,
        dragStart: { x: 0, y: 0 },
        posStart:  { x: 0, y: 0 }
    };

 
    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    
    function abrir() {
        document.getElementById(MODAL_ID)?.remove();
        _injectStyles();

        const modal = document.createElement('div');
        modal.id = MODAL_ID;
        modal.style.cssText = 'position:fixed;inset:0;z-index:100020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.7);backdrop-filter:blur(4px)';
        modal.innerHTML = `
        <div class="ga-box">
          <div class="ga-head">
            <div>
              <div class="ga-head-title">Galeria de Arte</div>
              <div class="ga-head-sub">The Metropolitan Museum of Art — acervo público</div>
            </div>
            <div class="ga-search-bar">
              <input id="ga-q" type="text" placeholder="Artista, obra, época..." value="Van Gogh"
                onkeydown="if(event.key==='Enter')GaleriaArte.pesquisar(this.value)">
              <button onclick="GaleriaArte.pesquisar(document.getElementById('ga-q').value)">Buscar</button>
            </div>
            <button class="ga-close-btn" onclick="GaleriaArte.fechar()">✕</button>
          </div>

          <div class="ga-filters">
            ${['Van Gogh','Monet','Rembrandt','Picasso','Renoir','Rafael','Da Vinci','Michelangelo',
               'Frida Kahlo','Caravaggio','Vermeer','Degas','Cézanne','Gauguin','Klimt','Hokusai','Warhol','Kandinsky']
              .map((a,i) => `<span class="ga-tag${i===0?' active':''}" onclick="GaleriaArte._quick(this,'${a}')">${a}</span>`)
              .join('')}
          </div>

          <div class="ga-body" id="ga-body">
         
            <div class="ga-grid-wrap" id="ga-gallery">
              <div class="ga-loading-state"><div class="ga-spinner"></div><span>Carregando obras...</span></div>
            </div>

      
            <div class="ga-viewer" id="ga-viewer">
              <div class="ga-img-wrap" id="ga-imgwrap">
                <div class="ga-img-move" id="ga-imgmove">
                  <img id="ga-bigimg" src="" alt="">
                </div>
                <div class="ga-vnav">
                  <button class="ga-vbtn" onclick="GaleriaArte.voltarParaGaleria()">← Galeria</button>
                </div>
                <div class="ga-zoom-ctrl">
                  <button class="ga-zbtn" onclick="GaleriaArte._zoom(1.3)">+</button>
                  <button class="ga-zbtn" onclick="GaleriaArte._zoom(1/1.3)">−</button>
                  <button class="ga-zbtn" onclick="GaleriaArte._resetZoom()" style="font-size:11px">⟳</button>
                </div>
                <div class="ga-zoom-lbl" id="ga-zoom-lbl">100%</div>
              </div>
              <div class="ga-sidebar">
                <div class="ga-sb-head">
                  <div class="ga-sb-title"  id="ga-stitle">—</div>
                  <div class="ga-sb-artist" id="ga-sartist">—</div>
                  <span class="ga-badge" id="ga-sdept"></span>
                </div>
                <div class="ga-sb-meta" id="ga-smeta"></div>
                <div class="ga-sb-desc"  id="ga-sdesc"></div>
                <div class="ga-anno-sec">
                  <h4 class="ga-anno-h">Anotações</h4>
                  <div class="ga-anno-inp-row">
                    <input id="ga-anno-inp" type="text" placeholder="Adicionar nota..."
                      onkeydown="if(event.key==='Enter')GaleriaArte._addAnno()">
                    <button onclick="GaleriaArte._addAnno()">+</button>
                  </div>
                  <div id="ga-anno-list"></div>
                </div>
              </div>
            </div>
          </div>
        </div>`;

        document.body.appendChild(modal);
        _bindDrag();
        pesquisar('Van Gogh');
    }

  
    async function pesquisar(query) {
        const g = document.getElementById('ga-gallery');
        if (!g) return;
        g.innerHTML = '<div class="ga-loading-state"><div class="ga-spinner"></div><span>Buscando obras...</span></div>';

        try {
            
            const r = await fetch(
                `${API_URL}/search?q=${encodeURIComponent(query)}&hasImages=true&isPublicDomain=true`
            );
            const d = await r.json();

            if (!d.objectIDs || !d.objectIDs.length) {
                g.innerHTML = '<div class="ga-empty">Nenhuma obra encontrada com imagem disponível.</div>';
                return;
            }

   
            const ids   = d.objectIDs.slice(0, 24);
            const works = await Promise.all(
                ids.map(id =>
                    fetch(`${API_URL}/objects/${id}`)
                        .then(r => r.json())
                        .catch(() => null)
                )
            );

            
            const items = works.filter(w => w && w.primaryImageSmall);

            if (!items.length) {
                g.innerHTML = '<div class="ga-empty">Nenhuma obra encontrada com imagem disponível.</div>';
                return;
            }

            g.innerHTML = '<div class="ga-grid">' + items.map(w => `
              <div class="ga-card" onclick="GaleriaArte.abrirObra(${w.objectID})">
                <img class="ga-card-img"
                     src="${_esc(w.primaryImageSmall)}"
                     loading="lazy"
                     onerror="this.outerHTML='<div class=ga-no-img>Sem imagem</div>'">
                <div class="ga-card-info">
                  <div class="ga-card-title" title="${_esc(w.title)}">${_esc(w.title)}</div>
                  <div class="ga-card-artist">${_esc(w.artistDisplayName || 'Artista desconhecido')}</div>
                  <div class="ga-card-date">${_esc(w.objectDate || '')}</div>
                </div>
              </div>`).join('') + '</div>';

        } catch (e) {
            g.innerHTML = '<div class="ga-empty">Erro ao conectar com o acervo do museu.</div>';
        }
    }

    async function abrirObra(id) {
        _state.currentId = id;
        document.getElementById('ga-gallery').style.display = 'none';
        const viewer = document.getElementById('ga-viewer');
        viewer.style.display = 'flex';

        ['ga-stitle','ga-sartist','ga-sdept','ga-sdesc'].forEach(el => {
            document.getElementById(el).textContent = el === 'ga-stitle' ? 'Carregando...' : '';
        });
        document.getElementById('ga-smeta').innerHTML     = '';
        document.getElementById('ga-anno-list').innerHTML = '';
        document.getElementById('ga-bigimg').src          = '';

        try {
            const r = await fetch(`${API_URL}/objects/${id}`);
            const w = await r.json();

            document.getElementById('ga-stitle').textContent  = w.title || 'Sem título';
            document.getElementById('ga-sartist').textContent = w.artistDisplayName || 'Artista desconhecido';
            document.getElementById('ga-sdept').textContent   = w.department || '';
            document.getElementById('ga-sdesc').textContent   =
                w.medium ? `Técnica: ${w.medium}` : 'Sem descrição disponível.';

            const meta = [
                ['Data',       w.objectDate],
                ['Cultura',    w.culture],
                ['Período',    w.period],
                ['Dimensões',  w.dimensions],
                ['Museu',      w.repository || 'The Met'],
                ['Nº acesso',  w.accessionNumber]
            ].filter(([, v]) => v);

            document.getElementById('ga-smeta').innerHTML = meta.map(([l, v]) => `
              <div class="ga-meta-row">
                <span class="ga-meta-lbl">${_esc(l)}</span>
                <span class="ga-meta-val">${_esc(v)}</span>
              </div>`).join('');

            const img = document.getElementById('ga-bigimg');
            img.src = w.primaryImage || w.primaryImageSmall;
            img.onerror = () => {
                if (w.primaryImageSmall && img.src !== w.primaryImageSmall) {
                    img.src = w.primaryImageSmall;
                }
            };
            img.onload = () => { _resetZoom(); };

            _loadAnnos(id);
        } catch (e) {
            document.getElementById('ga-stitle').textContent = 'Erro ao carregar obra.';
        }
    }

    
    function voltarParaGaleria() {
        document.getElementById('ga-gallery').style.display = '';
        document.getElementById('ga-viewer').style.display  = 'none';
        _state.currentId = null;
    }

    function fechar() {
        document.getElementById(MODAL_ID)?.remove();
    }

   
    function _quick(el, q) {
        document.querySelectorAll('#' + MODAL_ID + ' .ga-tag').forEach(t => t.classList.remove('active'));
        el.classList.add('active');
        document.getElementById('ga-q').value = q;
        pesquisar(q);
    }

    function _applyTransform() {
        document.getElementById('ga-imgmove').style.transform =
            `translate(${_state.tx}px,${_state.ty}px) scale(${_state.scale})`;
    }
    function _zoom(f) {
        _state.scale = Math.min(8, Math.max(0.2, _state.scale * f));
        _applyTransform();
        document.getElementById('ga-zoom-lbl').textContent = Math.round(_state.scale * 100) + '%';
    }
    function _resetZoom() {
        _state.scale = 1; _state.tx = 0; _state.ty = 0;
        _applyTransform();
        const lbl = document.getElementById('ga-zoom-lbl');
        if (lbl) lbl.textContent = '100%';
    }

    function _bindDrag() {
        const wrap = document.getElementById('ga-imgwrap');
        if (!wrap) return;

        wrap.addEventListener('mousedown', e => {
            _state.dragging  = true;
            _state.dragStart = { x: e.clientX, y: e.clientY };
            _state.posStart  = { x: _state.tx, y: _state.ty };
            wrap.style.cursor = 'grabbing';
            e.preventDefault();
        });
        window.addEventListener('mousemove', e => {
            if (!_state.dragging) return;
            _state.tx = _state.posStart.x + (e.clientX - _state.dragStart.x);
            _state.ty = _state.posStart.y + (e.clientY - _state.dragStart.y);
            _applyTransform();
        });
        window.addEventListener('mouseup', () => {
            _state.dragging = false;
            if (wrap) wrap.style.cursor = 'grab';
        });
        wrap.addEventListener('wheel', e => {
            e.preventDefault();
            const f    = e.deltaY < 0 ? 1.15 : 1 / 1.15;
            const rect = wrap.getBoundingClientRect();
            const mx   = e.clientX - rect.left;
            const my   = e.clientY - rect.top;
            _state.tx    = mx - (mx - _state.tx) * f;
            _state.ty    = my - (my - _state.ty) * f;
            _state.scale = Math.min(8, Math.max(0.2, _state.scale * f));
            _applyTransform();
            document.getElementById('ga-zoom-lbl').textContent = Math.round(_state.scale * 100) + '%';
        }, { passive: false });

        wrap.addEventListener('touchstart', e => {
            if (e.touches.length !== 1) return;
            _state.dragging  = true;
            _state.dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            _state.posStart  = { x: _state.tx, y: _state.ty };
        }, { passive: true });
        wrap.addEventListener('touchmove', e => {
            if (!_state.dragging || e.touches.length !== 1) return;
            _state.tx = _state.posStart.x + (e.touches[0].clientX - _state.dragStart.x);
            _state.ty = _state.posStart.y + (e.touches[0].clientY - _state.dragStart.y);
            _applyTransform();
        }, { passive: true });
        wrap.addEventListener('touchend', () => { _state.dragging = false; });
    }

   
    function _loadAnnos(id) {
        try { _state.annos[id] = JSON.parse(localStorage.getItem('ga_a_' + id) || '[]'); }
        catch { _state.annos[id] = []; }
        _renderAnnos(id);
    }
    function _renderAnnos(id) {
        const list = document.getElementById('ga-anno-list');
        if (!list) return;
        const items = _state.annos[id] || [];
        list.innerHTML = items.length
            ? items.map(a => `
              <div class="ga-anno-item">
                <p>${_esc(a.text)}</p>
                <small>${_esc(a.date)}</small>
              </div>`).join('')
            : '<div class="ga-anno-empty">Nenhuma anotação ainda.</div>';
    }
    function _addAnno() {
        const inp = document.getElementById('ga-anno-inp');
        const txt = inp?.value.trim();
        const id  = _state.currentId;
        if (!txt || !id) return;
        if (!_state.annos[id]) _state.annos[id] = [];
        _state.annos[id].push({ text: txt, date: new Date().toLocaleDateString('pt-BR') });
        try { localStorage.setItem('ga_a_' + id, JSON.stringify(_state.annos[id])); } catch {}
        inp.value = '';
        _renderAnnos(id);
    }


    function _injectStyles() {
        if (document.getElementById('ga-styles')) return;
        const s = document.createElement('style');
        s.id = 'ga-styles';
        s.textContent = `
        .ga-box{width:96vw;max-width:1200px;height:90vh;background:var(--bg-1,#111);border-radius:20px;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border,#333)}
        .ga-head{padding:14px 20px;border-bottom:1px solid var(--border,#333);display:flex;align-items:center;gap:14px;background:var(--bg-2,#161616);flex-wrap:wrap}
        .ga-head-title{font-size:15px;font-weight:600;color:var(--text-0,#fff)}
        .ga-head-sub{font-size:11px;color:var(--text-3,#666);margin-top:2px}
        .ga-search-bar{flex:1;display:flex;gap:8px;max-width:360px;min-width:200px}
        .ga-search-bar input{flex:1;padding:7px 12px;border:1px solid var(--border,#333);border-radius:8px;background:var(--bg-3,#1a1a1a);color:var(--text-0,#fff);font-size:13px;outline:none}
        .ga-search-bar input:focus{border-color:var(--accent,#e8a04a)}
        .ga-search-bar button{padding:7px 14px;border:1px solid var(--border,#333);border-radius:8px;background:var(--bg-3,#1a1a1a);color:var(--text-0,#fff);cursor:pointer;font-size:12px}
        .ga-search-bar button:hover{background:var(--bg-4,#222);border-color:var(--accent,#e8a04a)}
        .ga-close-btn{margin-left:auto;background:none;border:none;color:var(--text-2,#aaa);font-size:20px;cursor:pointer;line-height:1;padding:4px 8px}
        .ga-close-btn:hover{color:var(--text-0,#fff)}
        .ga-filters{padding:8px 20px;border-bottom:1px solid var(--border,#333);display:flex;gap:6px;flex-wrap:wrap;background:var(--bg-2,#161616)}
        .ga-tag{padding:4px 11px;border-radius:20px;border:1px solid var(--border,#333);font-size:12px;cursor:pointer;color:var(--text-2,#aaa);background:transparent;transition:.15s}
        .ga-tag:hover,.ga-tag.active{background:rgba(232,160,74,.15);color:var(--accent,#e8a04a);border-color:var(--accent,#e8a04a)}
        .ga-body{flex:1;overflow:hidden;position:relative;display:flex}
        .ga-grid-wrap{flex:1;padding:20px;overflow-y:auto;min-height:0}
        .ga-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
        .ga-card{border-radius:12px;border:1px solid var(--border,#2a2a2a);overflow:hidden;cursor:pointer;transition:.2s;background:var(--bg-2,#161616)}
        .ga-card:hover{transform:translateY(-4px);border-color:var(--accent,#e8a04a)}
        .ga-card-img{width:100%;height:160px;object-fit:cover;display:block;background:var(--bg-3,#1a1a1a)}
        .ga-no-img{width:100%;height:160px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--text-3,#555);background:var(--bg-3,#1a1a1a)}
        .ga-card-info{padding:10px 12px}
        .ga-card-title{font-size:12px;font-weight:500;color:var(--text-0,#eee);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ga-card-artist{font-size:11px;color:var(--text-3,#777);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .ga-card-date{font-size:10px;color:var(--text-3,#555);margin-top:2px}
        .ga-viewer{display:none;position:absolute;inset:0;flex-direction:row}
        .ga-img-wrap{flex:1;position:relative;overflow:hidden;background:#000;cursor:grab}
        .ga-img-move{position:absolute;transform-origin:0 0;user-select:none;pointer-events:none}
        .ga-img-move img{display:block;max-width:none}
        .ga-vnav{position:absolute;top:12px;left:12px;z-index:10}
        .ga-vbtn{padding:7px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.75);color:#fff;cursor:pointer;font-size:12px;backdrop-filter:blur(4px)}
        .ga-vbtn:hover{background:rgba(0,0,0,.95)}
        .ga-zoom-ctrl{position:absolute;bottom:16px;right:16px;display:flex;flex-direction:column;gap:4px;z-index:10}
        .ga-zbtn{width:36px;height:36px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.75);color:#fff;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}
        .ga-zbtn:hover{background:rgba(0,0,0,.95)}
        .ga-zoom-lbl{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,.65);color:#fff;padding:4px 10px;border-radius:20px;font-size:11px;pointer-events:none;z-index:10}
        .ga-sidebar{width:280px;border-left:1px solid var(--border,#222);display:flex;flex-direction:column;overflow-y:auto;background:var(--bg-1,#111)}
        .ga-sb-head{padding:16px 16px 12px;border-bottom:1px solid var(--border,#222)}
        .ga-sb-title{font-size:14px;font-weight:600;color:var(--text-0,#eee);margin-bottom:4px}
        .ga-sb-artist{font-size:12px;color:var(--text-2,#999)}
        .ga-badge{display:inline-block;padding:3px 8px;border-radius:20px;font-size:10px;background:rgba(232,160,74,.12);color:var(--accent,#e8a04a);margin-top:6px;border:1px solid rgba(232,160,74,.2)}
        .ga-sb-meta{display:flex;flex-direction:column;gap:7px;padding:14px 16px;border-bottom:1px solid var(--border,#222)}
        .ga-meta-row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
        .ga-meta-lbl{font-size:11px;color:var(--text-3,#666);flex-shrink:0}
        .ga-meta-val{font-size:11px;color:var(--text-2,#aaa);text-align:right}
        .ga-sb-desc{padding:14px 16px;font-size:12px;color:var(--text-2,#aaa);line-height:1.6}
        .ga-anno-sec{padding:14px 16px;border-top:1px solid var(--border,#222);margin-top:auto}
        .ga-anno-h{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-3,#555);margin-bottom:10px}
        .ga-anno-inp-row{display:flex;gap:6px;margin-bottom:10px}
        .ga-anno-inp-row input{flex:1;padding:6px 10px;border:1px solid var(--border,#333);border-radius:8px;background:var(--bg-3,#1a1a1a);color:var(--text-0,#eee);font-size:12px;outline:none}
        .ga-anno-inp-row input:focus{border-color:var(--accent,#e8a04a)}
        .ga-anno-inp-row button{padding:6px 11px;border:1px solid var(--border,#333);border-radius:8px;background:var(--bg-3,#1a1a1a);color:var(--text-0,#eee);cursor:pointer;font-size:14px}
        .ga-anno-inp-row button:hover{border-color:var(--accent,#e8a04a)}
        .ga-anno-item{padding:9px;border-radius:8px;border:1px solid var(--border,#222);margin-bottom:6px;background:var(--bg-2,#161616)}
        .ga-anno-item p{font-size:12px;color:var(--text-0,#eee)}
        .ga-anno-item small{font-size:10px;color:var(--text-3,#555)}
        .ga-anno-empty{font-size:11px;color:var(--text-3,#555)}
        .ga-loading-state{display:flex;align-items:center;justify-content:center;min-height:400px;flex-direction:column;gap:12px;color:var(--text-3,#555);font-size:13px}
        .ga-spinner{width:30px;height:30px;border:2px solid var(--border,#333);border-top-color:var(--text-2,#aaa);border-radius:50%;animation:ga-spin .8s linear infinite}
        @keyframes ga-spin{to{transform:rotate(360deg)}}
        .ga-empty{display:flex;align-items:center;justify-content:center;min-height:400px;color:var(--text-3,#555);font-size:13px}
        `;
        document.head.appendChild(s);
    }

    return {
        abrir,
        fechar,
        pesquisar,
        abrirObra,
        voltarParaGaleria,
        _quick,
        _zoom,
        _resetZoom,
        _addAnno
    };
})();

window.GaleriaArte = GaleriaArte;