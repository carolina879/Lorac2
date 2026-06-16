const DigitalReader = (() => {
  const MODAL_ID = 'digital-reader-modal';
  const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const EPUBJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/epub.js/0.3.93/epub.min.js';

  let _state = {
    book: null,
    currentPage: 0,
    totalPages: 0,
    readerMode: 'default',
    fontSize: 16,
    fontFamily: 'var(--font-body)',
    brightness: 100,
    zoom: 1,
    fullscreen: false,
    highlights: {},
    notes: {},
    bookmarks: {},
    readerInstance: null,
    fileType: null,
    loading: false,
    pageTurning: false,
    turnAnimation: 'slide',
    estimatedTime: '—',
    readingSpeed: 200,
    lastReadTime: Date.now(),
  };

  function _esc(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function _toast(msg, type = 'info') {
    if (typeof App !== 'undefined' && App.toast) {
      App.toast(msg, type);
    } else {
      console.log(`[Toast ${type.toUpperCase()}]: ${msg}`);
    }
  }

  function _loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function _loadStyle(href) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  function _renderModalShell() {
    return `
      <div id="${MODAL_ID}" class="dr-overlay">
        <div class="dr-modal">
          <div class="dr-header">
            <div class="dr-header-left">
              <button class="dr-btn-icon" onclick="DigitalReader.fechar()">✕</button>
              <span class="dr-book-title" id="dr-book-title"></span>
            </div>
            <div class="dr-header-right">
              <button class="dr-btn-icon" onclick="DigitalReader.toggleFullscreen()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3m-18 0v3a2 2 0 0 0 2 2h3"/></svg>
              </button>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('settings')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V15h.09z"/></svg>
              </button>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('ai')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </button>
            </div>
          </div>
          <div class="dr-content-area">
            <div class="dr-page-container" id="dr-page-left"></div>
            <div class="dr-page-container" id="dr-page-right"></div>
            <div class="dr-page-turn-overlay dr-page-turn-left" id="dr-page-turn-left"></div>
            <div class="dr-page-turn-overlay dr-page-turn-right" id="dr-page-turn-right"></div>
            
            <div id="dr-welcome-screen" class="dr-welcome-overlay" style="display:none">
              <div class="dr-welcome-card">
                <div class="dr-welcome-icon">📖</div>
                <h3>Sua Biblioteca Digital</h3>
                <p>Arraste um PDF, EPUB ou arquivo de texto para começar a leitura ou selecione abaixo.</p>
                <button class="dr-ai-btn" onclick="document.getElementById('dr-upload-input').click()">Selecionar Arquivo</button>
                <input type="file" id="dr-upload-input" hidden accept=".pdf,.epub,.txt" onchange="DigitalReader.abrir(this.files[0])">
              </div>
            </div>
          </div>
          <div class="dr-footer">
            <div class="dr-progress-bar-wrap">
              <div class="dr-progress-bar" id="dr-progress-bar"></div>
            </div>
            <span class="dr-page-info" id="dr-page-info"></span>
            <span class="dr-time-info" id="dr-time-info"></span>
          </div>
          <div class="dr-sidebar dr-sidebar-settings" id="dr-sidebar-settings">
            <div class="dr-sidebar-header">
              <h3>Configurações de Leitura</h3>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('settings')">✕</button>
            </div>
            <div class="dr-sidebar-content">
              <div class="dr-setting-group">
                <h4>Modo de Leitura</h4>
                <div class="dr-option-buttons">
                  <button class="dr-option-btn" data-mode="default" onclick="DigitalReader.setReaderMode('default')">Padrão</button>
                  <button class="dr-option-btn" data-mode="sepia" onclick="DigitalReader.setReaderMode('sepia')">Sépia</button>
                  <button class="dr-option-btn" data-mode="dark" onclick="DigitalReader.setReaderMode('dark')">Escuro</button>
                </div>
              </div>
              <div class="dr-setting-group">
                <h4>Tamanho da Fonte</h4>
                <input type="range" min="12" max="24" value="${_state.fontSize}" oninput="DigitalReader.setFontSize(this.value)">
                <span>${_state.fontSize}px</span>
              </div>
              <div class="dr-setting-group">
                <h4>Fonte</h4>
                <select onchange="DigitalReader.setFontFamily(this.value)">
                  <option value="var(--font-body)">Padrão</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
              <div class="dr-setting-group">
                <h4>Brilho</h4>
                <input type="range" min="50" max="150" value="${_state.brightness}" oninput="DigitalReader.setBrightness(this.value)">
                <span>${_state.brightness}%</span>
              </div>
              <div class="dr-setting-group">
                <h4>Zoom</h4>
                <input type="range" min="0.5" max="2" step="0.1" value="${_state.zoom}" oninput="DigitalReader.setZoom(this.value)">
                <span>${Math.round(_state.zoom * 100)}%</span>
              </div>
            </div>
          </div>
          <div class="dr-sidebar dr-sidebar-ai" id="dr-sidebar-ai">
            <div class="dr-sidebar-header">
              <h3>IA Educacional</h3>
              <button class="dr-btn-icon" onclick="DigitalReader.toggleSidebar('ai')">✕</button>
            </div>
            <div class="dr-sidebar-content">
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('summarize')">Resumir Página</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('explain')">Explicar Trecho</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('flashcards')">Gerar Flashcards</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('quiz')">Criar Quiz do Capítulo</button>
              <button class="dr-ai-btn" onclick="DigitalReader.callAI('highlights')">Destacar Pontos Importantes</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function _renderLoading() {
    return `
      <div class="dr-loading-overlay">
        <div class="dr-spinner"></div>
        <p>Carregando livro...</p>
      </div>
    `;
  }

  function _updateUI() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    document.getElementById('dr-book-title').textContent = _state.book?.title || 'Livro Digital';
    document.getElementById('dr-page-info').textContent = `Página ${_state.currentPage + 1} de ${_state.totalPages}`;
    document.getElementById('dr-time-info').textContent = `~${_state.estimatedTime} restantes`;

    const progressBar = document.getElementById('dr-progress-bar');
    if (progressBar) {
      const progress = _state.totalPages > 0 ? (_state.currentPage / _state.totalPages) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }

    modal.classList.remove('dr-mode-default', 'dr-mode-sepia', 'dr-mode-dark');
    modal.classList.add(`dr-mode-${_state.readerMode}`);

    modal.style.setProperty('--dr-brightness', `${_state.brightness}%`);

    modal.style.setProperty('--dr-font-size', `${_state.fontSize}px`);

    modal.style.setProperty('--dr-font-family', _state.fontFamily);

    document.getElementById('dr-page-left').style.transform = `scale(${_state.zoom})`;
    document.getElementById('dr-page-right').style.transform = `scale(${_state.zoom})`;

    document.querySelectorAll('.dr-option-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === _state.readerMode);
    });
    document.querySelector('input[type="range"][oninput*="setFontSize"]').value = _state.fontSize;
    document.querySelector('input[type="range"][oninput*="setBrightness"]').value = _state.brightness;
    document.querySelector('input[type="range"][oninput*="setZoom"]').value = _state.zoom;
    document.querySelector('select[onchange*="setFontFamily"]').value = _state.fontFamily;
  }

  async function abrir(bookFile = null) {
    if (_state.loading) {
      _toast('Já carregando um livro...', 'info');
      return;
    }

    _state.loading = !!bookFile;
    _state.book = {
      id: `book_${Date.now()}`,
      title: bookFile?.name || 'Livro Digital',
      type: bookFile?.type || null,
      data: null,
      currentPage: 0,
      totalPages: 0,
      metadata: {},
    };
    _state.fileType = bookFile?.type || null;

    const modal = document.createElement('div');
    modal.innerHTML = _renderModalShell();
    document.body.appendChild(modal.firstElementChild);
    _injectStyles();

    if (!bookFile) {
      document.getElementById('dr-welcome-screen').style.display = 'flex';
      _updateUI();
      return;
    }

    _updateUI();

    document.getElementById(MODAL_ID).innerHTML += _renderLoading();

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        _state.book.data = e.target.result;
        await _loadBookContent();
        _state.loading = false;
        document.querySelector('.dr-loading-overlay').remove();
        _updateUI();
        _loadProgress();
        _renderPages();
        _setupPageTurnEvents();
      };
      reader.readAsArrayBuffer(bookFile);
    } catch (error) {
      _toast(`Erro ao ler arquivo: ${error.message}`, 'error');
      console.error('Erro ao ler arquivo:', error);
      fechar();
    }
  }

  async function _loadBookContent() {
    if (_state.fileType.includes('pdf')) {
      await _loadScript(PDFJS_CDN);
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      const pdf = await pdfjsLib.getDocument({ data: _state.book.data }).promise;
      _state.readerInstance = pdf;
      _state.totalPages = pdf.numPages;
    } else if (_state.fileType.includes('epub') || _state.fileType.includes('opf')) {
      await _loadScript(EPUBJS_CDN);
      const book = Epub(_state.book.data);
      _state.readerInstance = book;
      await book.ready;
      const rendition = book.renderTo(document.getElementById('dr-page-left'), {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        manager: 'continuous',
        snap: true,
        spread: 'always',
      });
      await rendition.display();
      _state.totalPages = book.navigation.toc.length;
      _state.readerInstance.rendition = rendition;
      rendition.on('relocated', (location) => {
        const cfi = location.start.cfi;
        const chapterIndex = book.navigation.toc.findIndex(item => cfi.startsWith(item.cfi));
        _state.currentPage = chapterIndex !== -1 ? chapterIndex : 0;
        _saveProgress();
        _updateUI();
      });
    } else if (_state.fileType.includes('text')) {
      const text = new TextDecoder().decode(_state.book.data);
      _state.book.data = text;
      _paginateText(text);
    } else {
      _toast('Formato de arquivo não suportado.', 'error');
      fechar();
    }
  }

  async function _renderPages() {
    if (_state.fileType.includes('pdf')) {
      const pageLeftEl = document.getElementById('dr-page-left');
      const pageRightEl = document.getElementById('dr-page-right');
      pageLeftEl.innerHTML = '';
      pageRightEl.innerHTML = '';

      const renderPdfPage = async (pageNumber, targetElement) => {
        if (pageNumber < 1 || pageNumber > _state.totalPages) return;
        const page = await _state.readerInstance.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        targetElement.appendChild(canvas);
        await page.render({ canvasContext: context, viewport: viewport }).promise;
      };

      await renderPdfPage(_state.currentPage + 1, pageLeftEl);
      if (_state.currentPage + 2 <= _state.totalPages) {
        await renderPdfPage(_state.currentPage + 2, pageRightEl);
      }
    } else if (_state.fileType.includes('epub')) {

    } else if (_state.fileType.includes('text')) {
      const pageLeftEl = document.getElementById('dr-page-left');
      const pageRightEl = document.getElementById('dr-page-right');
      pageLeftEl.innerHTML = `<div class="dr-text-page">${_state.book.data.pages[_state.currentPage]}</div>`;
      pageRightEl.innerHTML = `<div class="dr-text-page">${_state.book.data.pages[_state.currentPage + 1] || ''}</div>`;
    }
    _updateUI();
    _saveProgress();
  }

  function _paginateText(text) {
    const words = text.split(/\s+/);
    const pages = [];
    let currentPageWords = [];
    let currentPageLength = 0;
    const maxPageLength = 1500;

    words.forEach(word => {
      if (currentPageLength + word.length + 1 > maxPageLength) {
        pages.push(currentPageWords.join(' '));
        currentPageWords = [word];
        currentPageLength = word.length;
      } else {
        currentPageWords.push(word);
        currentPageLength += word.length + 1;
      }
    });
    if (currentPageWords.length > 0) {
      pages.push(currentPageWords.join(' '));
    }
    _state.book.data = { text: text, pages: pages };
    _state.totalPages = pages.length;
    _state.estimatedTime = Math.ceil(words.length / _state.readingSpeed);
  }

  function _setupPageTurnEvents() {
    const contentArea = document.querySelector('.dr-content-area');
    if (!contentArea) return;

    let startX = 0;
    let isDragging = false;

    const handlePageTurn = (direction) => {
      if (_state.pageTurning) return;
      _state.pageTurning = true;
      _playSound('page_turn');

      const pageLeft = document.getElementById('dr-page-left');
      const pageRight = document.getElementById('dr-page-right');

      if (direction === 'next') {
        if (_state.currentPage + 2 >= _state.totalPages) {
          _state.pageTurning = false;
          return;
        }
        pageLeft.classList.add('dr-page-turn-left-anim');
        pageRight.classList.add('dr-page-turn-right-anim');
      } else {
        if (_state.currentPage === 0) {
          _state.pageTurning = false;
          return;
        }
        pageLeft.classList.add('dr-page-turn-left-anim-reverse');
        pageRight.classList.add('dr-page-turn-right-anim-reverse');
      }

      const onAnimationEnd = () => {
        pageLeft.classList.remove('dr-page-turn-left-anim', 'dr-page-turn-left-anim-reverse');
        pageRight.classList.remove('dr-page-turn-right-anim', 'dr-page-turn-right-anim-reverse');
        if (direction === 'next') {
          _state.currentPage += 2;
        } else {
          _state.currentPage -= 2;
        }
        _renderPages();
        _state.pageTurning = false;
        pageLeft.removeEventListener('animationend', onAnimationEnd);
        pageRight.removeEventListener('animationend', onAnimationEnd);
      };

      pageLeft.addEventListener('animationend', onAnimationEnd);
      pageRight.addEventListener('animationend', onAnimationEnd);
    };

    contentArea.addEventListener('click', (e) => {
      if (_state.pageTurning) return;
      const rect = contentArea.getBoundingClientRect();
      if (e.clientX < rect.left + rect.width / 2) {
        _turnPage('prev');
      } else {
        _turnPage('next');
      }
    });

    contentArea.addEventListener('mousedown', (e) => {
      if (_state.pageTurning) return;
      isDragging = true;
      startX = e.clientX;
      contentArea.style.cursor = 'grabbing';
    });

    contentArea.addEventListener('mousemove', (e) => {
      if (!isDragging || _state.pageTurning) return;
      const diffX = e.clientX - startX;
    });

    contentArea.addEventListener('mouseup', (e) => {
      if (!isDragging || _state.pageTurning) return;
      isDragging = false;
      contentArea.style.cursor = 'grab';
      const diffX = e.clientX - startX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          _turnPage('prev');
        } else {
          _turnPage('next');
        }
      }
    });

    contentArea.addEventListener('mouseleave', () => {
      isDragging = false;
      contentArea.style.cursor = 'grab';
    });

    contentArea.addEventListener('touchstart', (e) => {
      if (_state.pageTurning) return;
      isDragging = true;
      startX = e.touches[0].clientX;
    }, { passive: true });

    contentArea.addEventListener('touchmove', (e) => {
      if (!isDragging || _state.pageTurning) return;
      if (Math.abs(e.touches[0].clientX - startX) > 10) {
        e.preventDefault();
      }
    }, { passive: false });

    contentArea.addEventListener('touchend', (e) => {
      if (!isDragging || _state.pageTurning) return;
      isDragging = false;
      const diffX = e.changedTouches[0].clientX - startX;
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          _turnPage('prev');
        } else {
          _turnPage('next');
        }
      }
    });
  }

  function _turnPage(direction) {
    if (_state.fileType.includes('epub')) {
      if (direction === 'next') {
        _state.readerInstance.rendition.next();
      } else {
        _state.readerInstance.rendition.prev();
      }
      _playSound('page_turn');
      return;
    }

    if (_state.pageTurning) return;
    _state.pageTurning = true;
    _playSound('page_turn');

    const pageLeftEl = document.getElementById('dr-page-left');
    const pageRightEl = document.getElementById('dr-page-right');
    const turnLeftOverlay = document.getElementById('dr-page-turn-left');
    const turnRightOverlay = document.getElementById('dr-page-turn-right');

    const onAnimationEnd = () => {
      pageLeftEl.classList.remove('dr-page-turn-anim-left', 'dr-page-turn-anim-left-reverse');
      pageRightEl.classList.remove('dr-page-turn-anim-right', 'dr-page-turn-anim-right-reverse');
      turnLeftOverlay.classList.remove('dr-page-turn-overlay-active');
      turnRightOverlay.classList.remove('dr-page-turn-overlay-active');

      if (direction === 'next') {
        _state.currentPage += 2;
      } else {
        _state.currentPage -= 2;
      }
      _state.currentPage = Math.max(0, Math.min(_state.currentPage, _state.totalPages - (_state.totalPages % 2 === 0 ? 2 : 1)));
      _renderPages();
      _state.pageTurning = false;

      pageLeftEl.removeEventListener('animationend', onAnimationEnd);
      pageRightEl.removeEventListener('animationend', onAnimationEnd);
    };

    pageLeftEl.addEventListener('animationend', onAnimationEnd);
    pageRightEl.addEventListener('animationend', onAnimationEnd);

    if (direction === 'next') {
      if (_state.currentPage + 2 >= _state.totalPages) {
        _state.pageTurning = false;
        return;
      }
      pageLeftEl.classList.add('dr-page-turn-anim-left');
      pageRightEl.classList.add('dr-page-turn-anim-right');
      turnRightOverlay.classList.add('dr-page-turn-overlay-active');
    } else {
      if (_state.currentPage === 0) {
        _state.pageTurning = false;
        return;
      }
      pageLeftEl.classList.add('dr-page-turn-anim-left-reverse');
      pageRightEl.classList.add('dr-page-turn-anim-right-reverse');
      turnLeftOverlay.classList.add('dr-page-turn-overlay-active');
    }
  }

  function _saveProgress() {
    if (!_state.book || !_state.book.id) return;
    const progress = {
      currentPage: _state.currentPage,
      timestamp: Date.now(),
    };
    localStorage.setItem(`dr_progress_${_state.book.id}`, JSON.stringify(progress));
  }

  function _loadProgress() {
    if (!_state.book || !_state.book.id) return;
    const savedProgress = localStorage.getItem(`dr_progress_${_state.book.id}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      _state.currentPage = progress.currentPage;
    }
  }

  function _playSound(effect) {
    const audio = new Audio();
    if (effect === 'page_turn') {
      audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-page-turn-1100.mp3';
      audio.volume = 0.3;
    }
    audio.play().catch(() => {});
  }

  function fechar() {
    _saveProgress();
    const modal = document.getElementById(MODAL_ID);
    if (modal) modal.remove();
    _state = {
      book: null, currentPage: 0, totalPages: 0, readerMode: 'default',
      fontSize: 16, fontFamily: 'var(--font-body)', brightness: 100, zoom: 1,
      fullscreen: false, highlights: {}, notes: {}, bookmarks: {},
      readerInstance: null, fileType: null, loading: false, pageTurning: false,
      turnAnimation: 'slide', estimatedTime: '—', readingSpeed: 200, lastReadTime: Date.now(),
    };
    document.body.classList.remove('dr-fullscreen');
  }

  function toggleFullscreen() {
    _state.fullscreen = !_state.fullscreen;
    document.body.classList.toggle('dr-fullscreen', _state.fullscreen);
  }

  function toggleSidebar(type) {
    const settingsSidebar = document.getElementById('dr-sidebar-settings');
    const aiSidebar = document.getElementById('dr-sidebar-ai');

    if (type === 'settings') {
      settingsSidebar.classList.toggle('active');
      aiSidebar.classList.remove('active');
    } else if (type === 'ai') {
      aiSidebar.classList.toggle('active');
      settingsSidebar.classList.remove('active');
    }
  }

  function setReaderMode(mode) {
    _state.readerMode = mode;
    _updateUI();
  }

  function setFontSize(size) {
    _state.fontSize = parseInt(size);
    _updateUI();
  }

  function setFontFamily(family) {
    _state.fontFamily = family;
    _updateUI();
  }

  function setBrightness(value) {
    _state.brightness = parseInt(value);
    _updateUI();
  }

  function setZoom(value) {
    _state.zoom = parseFloat(value);
    _updateUI();
  }

  async function callAI(action) {
    const currentPageContent = _getCurrentPageContent();
    if (!currentPageContent) {
      _toast('Nenhum conteúdo na página para analisar.', 'error');
      return;
    }

    let prompt = '';
    let context = 'Você é um assistente educacional focado em leitura digital.';

    switch (action) {
      case 'summarize':
        prompt = `Resuma o seguinte conteúdo da página de um livro: "${currentPageContent}"`;
        break;
      case 'explain':
        const selectedText = window.getSelection().toString();
        if (selectedText) {
          prompt = `Explique o trecho selecionado: "${selectedText}" no contexto da página: "${currentPageContent}"`;
        } else {
          prompt = `Explique os conceitos chave da página: "${currentPageContent}"`;
        }
        break;
      case 'flashcards':
        prompt = `Gere 3 flashcards (pergunta/resposta) com base no conteúdo da página: "${currentPageContent}"`;
        context = 'Você é um gerador de flashcards para estudo.';
        break;
      case 'quiz':
        prompt = `Crie 3 perguntas de múltipla escolha com base no conteúdo da página: "${currentPageContent}"`;
        context = 'Você é um criador de quizzes para livros.';
        break;
      case 'highlights':
        prompt = `Destacar os 5 pontos mais importantes do conteúdo da página: "${currentPageContent}"`;
        break;
      default:
        _toast('Ação de IA desconhecida.', 'error');
        return;
    }

    _toast('🤖 IA está processando...', 'info');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt, context: context })
      });
      
      if (!res.ok) throw new Error('Falha na API');
      
      const data = await res.json();
      const response = data.response || 'Sem resposta.';
      
      App.openModal(`
        <h2 class="modal-title">🤖 Insight da IA</h2>
        <div style="font-size:14px; line-height:1.6; color:var(--text-1); white-space:pre-wrap;">${response}</div>
        <button class="btn-primary" style="width:100%; margin-top:20px" onclick="App.closeModal()">Entendido</button>
      `);
      
    } catch (error) {
      _toast(`Erro na chamada da IA: ${error.message}`, 'error');
      console.error('Erro na chamada da IA:', error);
    }
  }

  function _getCurrentPageContent() {
    if (_state.fileType.includes('pdf')) {
      const selectedText = window.getSelection().toString();
      if (selectedText) return selectedText;
      return 'Conteúdo PDF (selecione um trecho para análise mais precisa)';
    } else if (_state.fileType.includes('epub')) {
      const iframe = document.querySelector('#dr-page-left iframe');
      if (iframe && iframe.contentDocument) {
        return iframe.contentDocument.body.innerText;
      }
      return 'Conteúdo EPUB';
    } else if (_state.fileType.includes('text')) {
      return _state.book.data.pages[_state.currentPage];
    }
    return '';
  }

  function _setupMarkingEvents() {
    const contentArea = document.querySelector('.dr-content-area');
    if (!contentArea) return;

    contentArea.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        _showMarkingToolbar(e.clientX, e.clientY, selectedText, selection);
      } else {
        _hideMarkingToolbar();
      }
    });
  }

  function _showMarkingToolbar(x, y, text, selection) {
    let toolbar = document.getElementById('dr-marking-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'dr-marking-toolbar';
      toolbar.className = 'dr-marking-toolbar';
      toolbar.innerHTML = `
        <button onclick="DigitalReader.addHighlight('yellow')">Grifar</button>
        <button onclick="DigitalReader.addNote()">Nota</button>
        <button onclick="DigitalReader.addBookmark()">Bookmark</button>
      `;
      document.body.appendChild(toolbar);
    }
    toolbar.style.left = `${x}px`;
    toolbar.style.top = `${y - 40}px`;
    toolbar.style.display = 'flex';

    _state.currentSelection = { text, selection };
  }

  function _hideMarkingToolbar() {
    const toolbar = document.getElementById('dr-marking-toolbar');
    if (toolbar) toolbar.style.display = 'none';
    _state.currentSelection = null;
  }

  function addHighlight(color) {
    if (!_state.currentSelection || !_state.book) return;
    const { text, selection } = _state.currentSelection;
    const page = _state.currentPage;

    if (!_state.highlights[page]) _state.highlights[page] = [];
    _state.highlights[page].push({ text, color, range: _getSelectionRange(selection) });
    _applyHighlightsToPage(page);
    _hideMarkingToolbar();
    _toast('Texto grifado!', 'success');
  }

  function addNote() {
    if (!_state.currentSelection || !_state.book) return;
    const { text, selection } = _state.currentSelection;
    const page = _state.currentPage;
    const noteContent = prompt('Adicionar nota:', text);
    if (noteContent) {
      if (!_state.notes[page]) _state.notes[page] = [];
      _state.notes[page].push({ text, note: noteContent, range: _getSelectionRange(selection) });
      _hideMarkingToolbar();
      _toast('Nota adicionada!', 'success');
    }
  }

  function addBookmark() {
    if (!_state.book) return;
    const page = _state.currentPage;
    _state.bookmarks[page] = true;
    _toast(`Página ${page + 1} marcada!`, 'success');
    _hideMarkingToolbar();
  }

  function _getSelectionRange(selection) {
    const range = selection.getRangeAt(0);
    return {
      startContainerPath: _getNodePath(range.startContainer),
      startOffset: range.startOffset,
      endContainerPath: _getNodePath(range.endContainer),
      endOffset: range.endOffset,
    };
  }

  function _getNodePath(node) {
    const path = [];
    let current = node;
    while (current && current !== document.body && current !== document.getElementById('dr-page-left') && current !== document.getElementById('dr-page-right')) {
      let sibling = current.previousSibling;
      let index = 0;
      while (sibling) {
        if (sibling.nodeType === 1 && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      path.unshift(`${current.nodeName.toLowerCase()}[${index}]`);
      current = current.parentNode;
    }
    return path.join('>');
  }

  function _applyHighlightsToPage(page) {
    console.log(`Applying highlights for page ${page}:`, _state.highlights[page]);
  }

  function _injectStyles() {
    if (document.getElementById('digital-reader-styles')) return;
    const style = document.createElement('style');
    style.id = 'digital-reader-styles';
    style.textContent = `
      .dr-overlay {
        position: fixed; inset: 0; z-index: 99999;
        background: var(--bg-0, #0f0d0a);
        display: flex; align-items: center; justify-content: center;
        animation: dr-fade-in 0.4s ease-out forwards;
        font-family: var(--font-body, 'DM Sans', sans-serif);
        color: var(--text-0, #f0e8df);
        --dr-brightness: 100%;
        --dr-font-size: 16px;
        --dr-font-family: var(--font-body);
      }
      @keyframes dr-fade-in {
        from { opacity: 0; transform: scale(0.98) translateY(10px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }

      body.dr-fullscreen .dr-modal {
        width: 100vw; height: 100vh;
        border-radius: 0;
        box-shadow: none;
      }
      body.dr-fullscreen .dr-header,
      body.dr-fullscreen .dr-footer {
        background: rgba(var(--bg-rgb-0), 0.8);
        backdrop-filter: blur(8px);
      }

      .dr-mode-sepia .dr-modal {
        background: #fbf0d9;
        color: #5a4a3a;
      }
      .dr-mode-dark .dr-modal {
        background: #1a1a1a;
        color: #e0e0e0;
      }
      .dr-mode-sepia .dr-header, .dr-mode-sepia .dr-footer { background: rgba(251, 240, 217, 0.8); color: #5a4a3a; }
      .dr-mode-dark .dr-header, .dr-mode-dark .dr-footer { background: rgba(26, 26, 26, 0.8); color: #e0e0e0; }

      .dr-modal {
        width: 95vw; max-width: 1200px;
        height: 90vh; max-height: 800px;
        background: var(--bg-0, #0f0d0a);
        border-radius: 18px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        display: flex; flex-direction: column;
        overflow: hidden;
        position: relative;
        filter: brightness(var(--dr-brightness));
        transition: all 0.3s ease;
      }

      .dr-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 20px;
        background: var(--bg-0, #0f0d0a);
        border-bottom: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
        transition: background 0.3s ease;
      }
      .dr-header-left, .dr-header-right { display: flex; align-items: center; gap: 10px; }
      .dr-btn-icon {
        background: none; border: none; color: var(--text-2, #8a7a6a);
        font-size: 20px; cursor: pointer; padding: 6px; border-radius: 8px;
        transition: all 0.2s;
      }
      .dr-btn-icon:hover { background: var(--bg-2, #1a1612); color: var(--text-0, #f0e8df); }
      .dr-book-title {
        font-size: 16px; font-weight: 600; color: var(--text-0, #f0e8df);
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        max-width: 300px;
      }

      .dr-content-area {
        flex: 1; display: flex;
        position: relative;
        overflow: hidden;
        cursor: grab;
      }
      .dr-page-container {
        flex: 1;
        padding: 20px;
        display: flex; flex-direction: column; justify-content: center; align-items: center;
        position: relative;
        overflow: hidden;
        background: var(--bg-1, #151210);
        border-right: 1px solid var(--border, #3a3228);
        font-size: var(--dr-font-size);
        font-family: var(--dr-font-family);
        line-height: 1.6;
        transition: transform 0.3s ease-out;
      }
      .dr-page-container:last-child { border-right: none; }
      .dr-text-page {
        max-width: 600px;
        text-align: justify;
        user-select: text;
      }
      .dr-page-container canvas {
        max-width: 100%; max-height: 100%;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      }
      .dr-page-container iframe {
        width: 100%; height: 100%; border: none;
        background: transparent;
      }

      .dr-page-turn-overlay {
        position: absolute; inset: 0;
        background: rgba(0,0,0,0.5);
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .dr-page-turn-overlay.dr-page-turn-overlay-active {
        opacity: 1;
      }

      .dr-page-turn-anim-left {
        animation: dr-page-flip-left 0.6s ease-in-out forwards;
        transform-origin: right center;
      }
      .dr-page-turn-anim-right {
        animation: dr-page-flip-right 0.6s ease-in-out forwards;
        transform-origin: left center;
      }
      .dr-page-turn-anim-left-reverse {
        animation: dr-page-flip-left-reverse 0.6s ease-in-out forwards;
        transform-origin: right center;
      }
      .dr-page-turn-anim-right-reverse {
        animation: dr-page-flip-right-reverse 0.6s ease-in-out forwards;
        transform-origin: left center;
      }

      @keyframes dr-page-flip-left {
        0% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
        50% { transform: rotateY(-90deg) translateX(-50%); box-shadow: -10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(-180deg) translateX(-100%); box-shadow: -20px 0 60px rgba(0,0,0,0.8); }
      }
      @keyframes dr-page-flip-right {
        0% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
        50% { transform: rotateY(90deg) translateX(50%); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(180deg) translateX(100%); box-shadow: 20px 0 60px rgba(0,0,0,0.8); }
      }
      @keyframes dr-page-flip-left-reverse {
        0% { transform: rotateY(-180deg) translateX(-100%); box-shadow: -20px 0 60px rgba(0,0,0,0.8); }
        50% { transform: rotateY(-90deg) translateX(-50%); box-shadow: -10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }
      @keyframes dr-page-flip-right-reverse {
        0% { transform: rotateY(180deg) translateX(100%); box-shadow: 20px 0 60px rgba(0,0,0,0.8); }
        50% { transform: rotateY(90deg) translateX(50%); box-shadow: 10px 0 30px rgba(0,0,0,0.5); }
        100% { transform: rotateY(0deg) translateX(0); box-shadow: 0 0 0 rgba(0,0,0,0); }
      }

      .dr-footer {
        display: flex; justify-content: space-between; align-items: center;
        padding: 10px 20px;
        background: var(--bg-0, #0f0d0a);
        border-top: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
        font-size: 12px; color: var(--text-2, #8a7a6a);
        transition: background 0.3s ease;
      }
      .dr-progress-bar-wrap {
        flex: 1; height: 6px; background: var(--bg-2, #1a1612);
        border-radius: 3px; overflow: hidden; margin-right: 10px;
      }
      .dr-progress-bar {
        height: 100%; width: 0%; background: var(--accent, #e8a04a);
        border-radius: 3px; transition: width 0.3s ease;
      }

      .dr-sidebar {
        position: absolute; top: 0; bottom: 0; right: 0;
        width: 300px;
        background: var(--bg-0, #0f0d0a);
        border-left: 1px solid var(--border, #3a3228);
        box-shadow: -10px 0 30px rgba(0,0,0,0.5);
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        display: flex; flex-direction: column;
        z-index: 100;
      }
      .dr-sidebar.active { transform: translateX(0); }
      .dr-sidebar-header {
        display: flex; justify-content: space-between; align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid var(--border, #3a3228);
        flex-shrink: 0;
      }
      .dr-sidebar-header h3 {
        font-size: 16px; font-weight: 600; color: var(--text-0, #f0e8df);
        margin: 0;
      }
      .dr-sidebar-content { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 15px; }

      .dr-setting-group { display: flex; flex-direction: column; gap: 8px; }
      .dr-setting-group h4 { font-size: 14px; color: var(--text-1, #c8b89a); margin: 0; }
      .dr-option-buttons { display: flex; gap: 8px; }
      .dr-option-btn {
        flex: 1; padding: 8px 12px; border-radius: 8px;
        background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
        color: var(--text-2, #8a7a6a); font-size: 12px; cursor: pointer;
        transition: all 0.2s;
      }
      .dr-option-btn.active {
        background: var(--accent, #e8a04a); color: var(--bg-0, #0f0d0a);
        border-color: var(--accent, #e8a04a);
      }
      .dr-setting-group input[type="range"] {
        width: 100%; accent-color: var(--accent, #e8a04a);
      }
      .dr-setting-group select {
        width: 100%; padding: 8px 12px; border-radius: 8px;
        background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
        color: var(--text-0, #f0e8df); font-size: 13px; outline: none;
      }

      .dr-ai-btn {
        width: 100%; padding: 12px; border-radius: 10px;
        background: var(--bg-2, #1a1612); border: 1px solid var(--border, #3a3228);
        color: var(--text-0, #f0e8df); font-size: 14px; font-weight: 500;
        cursor: pointer; transition: all 0.2s;
      }
      .dr-ai-btn:hover { background: var(--accent-light, rgba(232,160,74,0.1)); border-color: var(--accent, #e8a04a); color: var(--accent, #e8a04a); }

      .dr-loading-overlay {
        position: absolute; inset: 0;
        background: rgba(var(--bg-rgb-0), 0.95);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 15px;
        color: var(--text-1, #c8b89a);
        font-size: 16px;
        z-index: 101;
      }
      .dr-spinner {
        width: 40px; height: 40px; border-radius: 50%;
        border: 4px solid rgba(var(--text-rgb-1), 0.2);
        border-top-color: var(--accent, #e8a04a);
        animation: dr-spin 1s linear infinite;
      }
      @keyframes dr-spin { to { transform: rotate(360deg); } }

      .dr-marking-toolbar {
        position: absolute;
        background: var(--bg-2, #1a1612);
        border: 1px solid var(--border, #3a3228);
        border-radius: 8px;
        padding: 5px;
        display: none;
        gap: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        z-index: 102;
      }
      .dr-marking-toolbar button {
        background: none; border: none; color: var(--text-0, #f0e8df);
        padding: 5px 10px; border-radius: 6px;
        font-size: 12px; cursor: pointer;
        transition: background 0.2s;
      }
      .dr-marking-toolbar button:hover { background: var(--bg-3, #211d18); }

      @media (max-width: 768px) {
        .dr-modal {
          width: 100vw; height: 100vh;
          border-radius: 0;
          max-width: none; max-height: none;
        }
        .dr-header, .dr-footer {
          padding: 10px 15px;
        }
        .dr-book-title {
          max-width: 150px;
          font-size: 14px;
        }
        .dr-page-container {
          padding: 15px;
        }
        .dr-sidebar {
          width: 100%;
          border-left: none;
          box-shadow: none;
        }
        .dr-content-area {
          flex-direction: column;
        }
        .dr-page-container:first-child { border-right: none; border-bottom: 1px solid var(--border); }
        .dr-page-turn-anim-left, .dr-page-turn-anim-right,
        .dr-page-turn-anim-left-reverse, .dr-page-turn-anim-right-reverse {
          animation: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  return {
    abrir,
    fechar,
    toggleFullscreen,
    toggleSidebar,
    setReaderMode,
    setFontSize,
    setFontFamily,
    setBrightness,
    setZoom,
    _turnPage,
    callAI,
    addHighlight,
    addNote,
    addBookmark,
  };
})();

window.DigitalReader = DigitalReader;
window.BibliotecaVirtual = DigitalReader;

(function() {
  if (typeof MateriaModal === 'undefined') return;

  const originalSalvar = MateriaModal.salvar;

  MateriaModal.salvar = function() {
    const nome = document.getElementById('mat-nome')?.value.trim();
    const icon = document.getElementById('mat-icon-display')?.textContent || '📚';
    const turmaId = window.__currentTurmaId__;

    if (!nome) {
      MateriaModal._showErr('Digite o nome da matéria.');
      document.getElementById('mat-nome')?.focus();
      return;
    }

    const errEl = document.getElementById('mat-err');
    if (errEl) errEl.style.display = 'none';

    const materia = {
      id: 'mat_' + Date.now(),
      name: nome,
      icon,
      createdAt: new Date().toISOString(),
      arquivos: [],
      textos: [],
    };

    if (MateriaModal._s.tab === 'arquivo') {
      if (!MateriaModal._s.file) {
        MateriaModal._showErr('Selecione um arquivo para enviar.');
        return;
      }
      const desc = document.getElementById('mat-arquivo-desc')?.value.trim() || '';
      materia.arquivos.push({
        id: 'arq_' + Date.now(),
        name: MateriaModal._s.file.name,
        size: MateriaModal._s.file.size,
        data: MateriaModal._s.fileData,
        desc,
        type: MateriaModal._s.file.type,
        ...MateriaModal.extInfo(MateriaModal._s.file.name),
      });
    } else {
      const conteudo = document.getElementById('mat-texto-conteudo')?.value.trim();
      if (!conteudo) {
        MateriaModal._showErr('Escreva algum conteúdo para a matéria.');
        return;
      }
      materia.textos.push({
        id: 'txt_' + Date.now(),
        conteudo,
        createdAt: new Date().toISOString(),
      });
    }

    if (!turmaId) {
      MateriaModal._showErr('Turma não identificada. Tente novamente.');
      return;
    }
    if (!MateriaModal._localMaterias[turmaId]) MateriaModal._localMaterias[turmaId] = [];
    MateriaModal._localMaterias[turmaId].push(materia);

    try {
      const container = document.getElementById('turma-tab-materias');
      if (container) {
        container.innerHTML = MateriaModal._renderMateriasTab(turmaId);
      }
    } catch (err) {
      console.warn('MateriaModal: Não foi possível re-renderizar tab:', err);
    }

    MateriaModal.fechar();
    MateriaModal.toast('✅ Matéria publicada com sucesso!', 'success');
  };

  const originalAbrirMateria = MateriaModal.abrirMateria;
  MateriaModal.abrirMateria = function(materiaId) {
    const turmaId = window.__currentTurmaId__;
    if (!turmaId) return;
    const materias = MateriaModal._localMaterias[turmaId] || [];
    const m = materias.find(x => x.id === materiaId);
    if (!m) return;

    if (m.arquivos && m.arquivos.length > 0) {
      const file = m.arquivos[0];
      const byteCharacters = atob(file.data.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: file.type });
      const bookFile = new File([blob], file.name, { type: file.type });
      DigitalReader.abrir(bookFile);
    } else if (m.textos && m.textos.length > 0) {
      const textContent = m.textos[0].conteudo;
      const textBlob = new Blob([textContent], { type: 'text/plain' });
      const bookFile = new File([textBlob], `${m.name}.txt`, { type: 'text/plain' });
      DigitalReader.abrir(bookFile);
    } else {
      originalAbrirMateria(materiaId);
    }
  };

  const originalRenderMateriasTab = MateriaModal._renderMateriasTab;
  MateriaModal._renderMateriasTab = function(turmaId) {
    const originalHtml = originalRenderMateriasTab(turmaId);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHtml;

    tempDiv.querySelectorAll('.materia-card-new').forEach(card => {
      const materiaId = card.getAttribute('onclick').match(/'([^']+)'/)[1];
      const m = MateriaModal._localMaterias[turmaId].find(x => x.id === materiaId);

      if ((m.arquivos && m.arquivos.length > 0) || (m.textos && m.textos.length > 0)) {
        const openButton = document.createElement('button');
        openButton.textContent = 'Abrir no Leitor';
        openButton.className = 'dr-open-reader-btn';
        openButton.onclick = (e) => {
          e.stopPropagation();
          MateriaModal.abrirMateria(materiaId);
        };
        card.appendChild(openButton);
      }
    });
    return tempDiv.innerHTML;
  };

  const readerButtonStyles = document.createElement('style');
  readerButtonStyles.textContent = `
    .dr-open-reader-btn {
      background: var(--accent, #e8a04a);
      color: var(--bg-0, #0f0d0a);
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      transition: opacity 0.2s;
    }
    .dr-open-reader-btn:hover {
      opacity: 0.9;
    }
  `;
  document.head.appendChild(readerButtonStyles);

})();