(function() {
'use strict';

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap');
@font-face { font-family: 'OpenDyslexic'; src: url('https://cdn.jsdelivr.net/npm/opendyslexic@1.0.3/OpenDyslexic-Regular.otf'); }

#biblioteca-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  background: #0a0806;
  display: none;
  opacity: 0;
  transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1);
  font-family: 'DM Sans', system-ui, sans-serif;
  overflow: hidden;
}
#biblioteca-overlay.bib-focus-mode .bib-header,
#biblioteca-overlay.bib-focus-mode .bib-reader-topbar,
#biblioteca-overlay.bib-focus-mode .bib-page-footer,
#biblioteca-overlay.bib-focus-mode .bib-left-zone,
#biblioteca-overlay.bib-focus-mode .bib-right-zone,
#biblioteca-overlay.bib-focus-mode .bib-ai-panel,
#biblioteca-overlay.bib-focus-mode .bib-highlights-panel,
#biblioteca-overlay.bib-focus-mode .bib-toc-panel,
#biblioteca-overlay.bib-focus-mode .bib-settings-panel {
  display: none !important;
}
#biblioteca-overlay.visible { display: flex; flex-direction: column; }
#biblioteca-overlay.active { opacity: 1; }

.bib-bg-grain {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 256px;
  opacity: 0.5;
}
.bib-tag {
  font-size: 9px;
  padding: 2px 6px;
  background: rgba(232,160,74,0.1);
  color: #e8a04a;
  border: 1px solid rgba(232,160,74,0.2);
  border-radius: 4px;
}
.bib-input-style { background:rgba(30,26,21,0.8);border:1px solid rgba(255,220,170,0.07);border-radius:10px;padding:11px 16px;color:#f0e8de;font-family:"DM Sans",sans-serif;font-size:13px;font-weight:300;outline:none; }
.bib-particles {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.bib-particle {
  position: absolute;
  width: 2px; height: 2px;
  background: rgba(232,160,74,0.4);
  border-radius: 50%;
  animation: bib-particle-float linear infinite;
}
@keyframes bib-particle-float {
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-10vh) rotate(720deg); opacity: 0; }
}

.bib-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 56px;
  background: rgba(10,8,6,0.9);
  border-bottom: 1px solid rgba(232,160,74,0.08);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}
.bib-header-left { display: flex; align-items: center; gap: 16px; }
.bib-header-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 16px;
  color: #e8a04a;
  letter-spacing: 0.03em;
  font-style: italic;
}
.bib-header-brand svg { opacity: 0.9; }

.bib-header-tabs {
  display: flex;
  gap: 2px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,220,170,0.06);
  border-radius: 10px;
  padding: 3px;
}
.bib-tab {
  background: none;
  border: none;
  color: rgba(184,168,154,0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  padding: 6px 14px;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
}
.bib-tab.active {
  background: rgba(232,160,74,0.12);
  color: #e8a04a;
  border: 1px solid rgba(232,160,74,0.2);
}
.bib-tab:hover:not(.active) { color: rgba(184,168,154,0.9); }

.bib-header-right { display: flex; align-items: center; gap: 10px; }

.bib-btn-upload {
  display: flex; align-items: center; gap: 7px;
  background: linear-gradient(135deg, #e8a04a 0%, #f0ad55 100%);
  color: #0a0806;
  border: none;
  border-radius: 10px;
  padding: 8px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  box-shadow: 0 4px 15px rgba(232,160,74,0.25);
}
.bib-btn-upload:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(232,160,74,0.4); }

.bib-btn-icon {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,220,170,0.08);
  color: rgba(184,168,154,0.7);
  width: 36px; height: 36px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bib-btn-icon:hover { background: rgba(232,160,74,0.1); border-color: rgba(232,160,74,0.2); color: #e8a04a; }

.bib-body {
  position: relative;
  z-index: 1;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.bib-shelf-screen {
  position: absolute;
  inset: 0;
  overflow-y: auto;
  padding: 40px 48px 60px;
  display: none;
  flex-direction: column;
  gap: 48px;
}
.bib-shelf-screen.active { display: flex; }
.bib-shelf-screen::-webkit-scrollbar { width: 4px; }
.bib-shelf-screen::-webkit-scrollbar-track { background: transparent; }
.bib-shelf-screen::-webkit-scrollbar-thumb { background: rgba(232,160,74,0.2); border-radius: 2px; }

.bib-shelf-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}
.bib-shelf-hero-text h1 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 52px;
  font-style: italic;
  color: #f0e8de;
  letter-spacing: -0.5px;
  line-height: 1.05;
  margin-bottom: 8px;
}
.bib-shelf-hero-text h1 span { color: #e8a04a; }
.bib-shelf-hero-text p {
  color: rgba(184,168,154,0.6);
  font-size: 14px;
  font-weight: 300;
}

.bib-search-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(30,26,21,0.8);
  border: 1px solid rgba(255,220,170,0.07);
  border-radius: 12px;
  padding: 11px 16px;
  width: 280px;
  transition: border-color 0.2s ease;
}
.bib-search-bar:focus-within { border-color: rgba(232,160,74,0.25); }
.bib-search-bar svg { color: rgba(184,168,154,0.4); flex-shrink: 0; }
.bib-search-bar input {
  background: none; border: none; outline: none;
  color: #f0e8de; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 300; flex: 1;
}
.bib-search-bar input::placeholder { color: rgba(122,110,101,0.6); }

.bib-section-label {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.bib-section-label h2 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 20px;
  font-style: italic;
  color: rgba(240,232,222,0.85);
  font-weight: 400;
}
.bib-section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(232,160,74,0.15) 0%, transparent 100%);
}
.bib-section-count {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(122,110,101,0.7);
  letter-spacing: 0.08em;
}

.bib-drop-zone {
  border: 2px dashed rgba(232,160,74,0.2);
  border-radius: 20px;
  padding: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(232,160,74,0.02);
  position: relative;
  overflow: hidden;
}
.bib-drop-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(232,160,74,0.06) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.bib-drop-zone:hover { border-color: rgba(232,160,74,0.4); }
.bib-drop-zone:hover::before { opacity: 1; }
.bib-drop-zone.dragging { border-color: #e8a04a; background: rgba(232,160,74,0.05); }
.bib-drop-zone.dragging::before { opacity: 1; }
.bib-drop-icon {
  width: 64px; height: 64px;
  background: rgba(232,160,74,0.1);
  border: 1px solid rgba(232,160,74,0.2);
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.bib-drop-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 18px; font-style: italic;
  color: #f0e8de;
}
.bib-drop-sub { color: rgba(122,110,101,0.7); font-size: 13px; font-weight: 300; }
.bib-drop-formats { display: flex; gap: 8px; margin-top: 4px; }
.bib-format-badge {
  background: rgba(232,160,74,0.08);
  border: 1px solid rgba(232,160,74,0.15);
  border-radius: 6px;
  padding: 3px 10px;
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(232,160,74,0.8);
  letter-spacing: 0.08em;
}

.bib-books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px;
}

.bib-book-card {
  cursor: pointer;
  position: relative;
  group: true;
}
.bib-book-cover-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 6px 12px 12px 6px;
  overflow: hidden;
  box-shadow: -4px 4px 20px rgba(0,0,0,0.7), inset -3px 0 8px rgba(0,0,0,0.4);
  transition: all 0.4s cubic-bezier(0.34,1.56,0.64,1);
  transform-style: preserve-3d;
}
.bib-book-card:hover .bib-book-cover-wrap {
  transform: translateY(-8px) rotateY(-5deg) scale(1.03);
  box-shadow: -8px 16px 40px rgba(0,0,0,0.8), 0 0 40px rgba(232,160,74,0.12), inset -3px 0 8px rgba(0,0,0,0.5);
}
.bib-book-cover {
  width: 100%; height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  gap: 8px;
  text-align: center;
  position: relative;
}
.bib-book-cover::after {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 8px;
  background: rgba(0,0,0,0.35);
  border-right: 1px solid rgba(255,255,255,0.05);
}
.bib-book-cover-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 15px;
  font-style: italic;
  color: rgba(255,255,255,0.95);
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  z-index: 1;
  position: relative;
}
.bib-book-cover-author {
  font-family: 'DM Sans', sans-serif;
  font-size: 10px;
  font-weight: 300;
  color: rgba(255,255,255,0.65);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  z-index: 1;
  position: relative;
}
.bib-book-cover-icon {
  font-size: 28px;
  margin-bottom: 4px;
  z-index: 1;
  position: relative;
}
.bib-book-spine {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 8px;
  background: rgba(0,0,0,0.4);
  border-right: 1px solid rgba(255,255,255,0.04);
}
.bib-book-progress-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(0,0,0,0.3);
}
.bib-book-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e8a04a, #f0ad55);
  transition: width 0.5s ease;
}
.bib-book-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 6px 12px 12px 6px;
}
.bib-book-card:hover .bib-book-overlay { opacity: 1; }
.bib-book-open-btn {
  background: linear-gradient(135deg, #e8a04a, #f0ad55);
  color: #0a0806;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.bib-book-open-btn:hover { transform: scale(1.05); }
.bib-book-del-btn {
  background: rgba(192,57,43,0.2);
  border: 1px solid rgba(192,57,43,0.3);
  color: rgba(255,100,80,0.9);
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.bib-book-del-btn:hover { background: rgba(192,57,43,0.35); }

.bib-book-meta { padding: 10px 0 0; }
.bib-book-name {
  font-size: 13px;
  font-weight: 500;
  color: rgba(240,232,222,0.85);
  line-height: 1.3;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.bib-book-info {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bib-book-pages {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(122,110,101,0.7);
  letter-spacing: 0.05em;
}
.bib-book-progress-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: #e8a04a;
  opacity: 0.6;
}
.bib-book-progress-pct {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(232,160,74,0.7);
}

.bib-empty-state {
  grid-column: 1/-1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  gap: 12px;
  text-align: center;
  color: rgba(122,110,101,0.6);
}
.bib-empty-state svg { opacity: 0.3; margin-bottom: 8px; }
.bib-empty-state h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 20px;
  font-style: italic;
  color: rgba(184,168,154,0.5);
  font-weight: 400;
}
.bib-empty-state p { font-size: 13px; font-weight: 300; }

#bib-file-input { display: none; }

.bib-reader-screen {
  position: absolute;
  inset: 0;
  display: none;
  flex-direction: column;
  background: #0a0806;
  overflow: hidden;
  z-index: 2;
}
.bib-reader-screen.active { display: flex; }

.bib-reader-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 52px;
  background: rgba(10,8,6,0.95);
  border-bottom: 1px solid rgba(255,220,170,0.05);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
  z-index: 100;
  position: relative;
}
.bib-reader-topbar-left { display: flex; align-items: center; gap: 12px; }
.bib-reader-back {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.07);
  color: rgba(184,168,154,0.7);
  width: 34px; height: 34px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bib-reader-back:hover { background: rgba(232,160,74,0.1); border-color: rgba(232,160,74,0.2); color: #e8a04a; }
.bib-reader-book-info {}
.bib-reader-book-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 14px;
  font-style: italic;
  color: rgba(240,232,222,0.9);
}
.bib-reader-book-chapter {
  font-size: 11px;
  color: rgba(122,110,101,0.7);
  font-weight: 300;
  margin-top: 1px;
}
.bib-reader-topbar-center {
  display: flex;
  align-items: center;
  gap: 6px;
}
.bib-page-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,220,170,0.06);
  border-radius: 10px;
  padding: 4px 8px;
}
.bib-page-btn {
  background: none; border: none;
  color: rgba(184,168,154,0.6);
  width: 28px; height: 28px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bib-page-btn:hover { background: rgba(232,160,74,0.1); color: #e8a04a; }
.bib-page-btn:disabled { opacity: 0.3; cursor: default; }
.bib-page-btn:disabled:hover { background: none; color: rgba(184,168,154,0.6); }
.bib-page-indicator {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: rgba(184,168,154,0.8);
  letter-spacing: 0.05em;
  min-width: 80px;
  text-align: center;
}
.bib-reader-topbar-right { display: flex; align-items: center; gap: 6px; }

.bib-settings-btn, .bib-toc-btn, .bib-ai-btn, .bib-bookmark-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.07);
  color: rgba(184,168,154,0.6);
  height: 34px;
  border-radius: 9px;
  padding: 0 11px;
  display: flex; align-items: center; gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
}
.bib-settings-btn:hover, .bib-toc-btn:hover, .bib-ai-btn:hover, .bib-bookmark-btn:hover {
  background: rgba(232,160,74,0.1);
  border-color: rgba(232,160,74,0.2);
  color: #e8a04a;
}
.bib-ai-btn { color: rgba(122,168,100,0.8); border-color: rgba(122,168,100,0.1); }
.bib-ai-btn:hover { background: rgba(122,168,100,0.1); border-color: rgba(122,168,100,0.25); color: #8fc870; }

.bib-progress-track {
  height: 2px;
  background: rgba(255,255,255,0.04);
  flex-shrink: 0;
  position: relative;
}
.bib-progress-fill-bar {
  height: 100%;
  background: linear-gradient(90deg, rgba(232,160,74,0.6), rgba(232,160,74,0.9));
  transition: width 0.5s ease;
  position: relative;
}
.bib-progress-fill-bar::after {
  content: '';
  position: absolute;
  right: -1px; top: -2px;
  width: 5px; height: 5px;
  background: #e8a04a;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(232,160,74,0.8);
}

.bib-reader-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.bib-toc-panel {
  width: 260px;
  flex-shrink: 0;
  background: rgba(10,8,6,0.97);
  border-right: 1px solid rgba(255,220,170,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transform: translateX(-100%);
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  position: absolute;
  left: 0; top: 0; bottom: 0;
  z-index: 50;
  backdrop-filter: blur(20px);
}
.bib-toc-panel.open { transform: translateX(0); }
.bib-toc-header {
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,220,170,0.05);
  flex-shrink: 0;
}
.bib-toc-header h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 14px;
  font-style: italic;
  color: rgba(240,232,222,0.8);
  font-weight: 400;
}
.bib-toc-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.bib-toc-list::-webkit-scrollbar { width: 3px; }
.bib-toc-list::-webkit-scrollbar-thumb { background: rgba(232,160,74,0.2); border-radius: 2px; }
.bib-toc-item {
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(184,168,154,0.6);
  font-size: 12px;
  font-weight: 300;
  line-height: 1.4;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.bib-toc-item:hover { background: rgba(232,160,74,0.06); color: rgba(240,232,222,0.8); }
.bib-toc-item.active { background: rgba(232,160,74,0.1); color: #e8a04a; }
.bib-toc-num {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(232,160,74,0.5);
  margin-top: 1px;
  flex-shrink: 0;
  letter-spacing: 0.05em;
}

.bib-settings-panel {
  width: 280px;
  flex-shrink: 0;
  background: rgba(10,8,6,0.97);
  border-left: 1px solid rgba(255,220,170,0.06);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  position: absolute;
  right: 0; top: 0; bottom: 0;
  z-index: 50;
  backdrop-filter: blur(20px);
}
.bib-settings-panel.open { transform: translateX(0); }
.bib-settings-panel::-webkit-scrollbar { width: 3px; }
.bib-settings-panel::-webkit-scrollbar-thumb { background: rgba(232,160,74,0.2); border-radius: 2px; }

.bib-settings-group {
  padding: 16px 18px;
  border-bottom: 1px solid rgba(255,220,170,0.04);
}
.bib-settings-group-title {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(122,110,101,0.6);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.bib-setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.bib-setting-label {
  font-size: 12px;
  color: rgba(184,168,154,0.7);
  font-weight: 300;
}
.bib-setting-value {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(232,160,74,0.8);
}
.bib-stepper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,220,170,0.07);
  border-radius: 8px;
  padding: 2px;
}
.bib-stepper-btn {
  background: none; border: none;
  color: rgba(184,168,154,0.7);
  width: 26px; height: 26px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}
.bib-stepper-btn:hover { background: rgba(232,160,74,0.1); color: #e8a04a; }
.bib-stepper-val {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: rgba(240,232,222,0.8);
  min-width: 30px;
  text-align: center;
}

.bib-theme-row { display: flex; gap: 6px; flex-wrap: wrap; }
.bib-theme-btn {
  border-radius: 8px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
}
.bib-theme-btn.active { border-color: rgba(232,160,74,0.5) !important; }

.bib-font-row { display: flex; gap: 6px; flex-direction: column; }
.bib-font-btn {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,220,170,0.06);
  color: rgba(184,168,154,0.7);
  border-radius: 7px;
  padding: 7px 12px;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}
.bib-font-btn:hover { background: rgba(232,160,74,0.06); color: rgba(240,232,222,0.8); }
.bib-font-btn.active { background: rgba(232,160,74,0.1); border-color: rgba(232,160,74,0.25); color: #e8a04a; }

.bib-slider-wrap { padding: 4px 0; }
.bib-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 3px;
  background: rgba(255,255,255,0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}
.bib-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #e8a04a;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(232,160,74,0.5);
}

.bib-reading-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
  overflow: hidden;
  position: relative;
}

.bib-page-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 720px;
  height: calc(100% - 40px);
  transition: max-width 0.4s ease;
  perspective: 1500px;
}
.bib-page-container.two-page {
  max-width: 1400px;
}
.bib-page-container {
  perspective: 1500px;
}

.bib-page-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
}

.bib-page-flip-area {
  position: relative;
  width: 100%;
  max-width: 660px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: max-width 0.4s ease;
}

.bib-page {
  position: absolute;
  width: 100%;
  max-width: 660px;
  height: 100%;
  background: var(--page-bg, #f5f0e8);
  border-radius: 4px 12px 12px 4px;
  box-shadow: 0 8px 60px rgba(0,0,0,0.4), -4px 0 20px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), left 0.6s, width 0.6s, max-width 0.4s ease;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  will-change: transform;
}
.two-page .bib-page {
  max-width: 1400px;
  border-radius: 4px;
  box-shadow: 0 8px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,0,0,0.1);
}
.two-page .bib-page-flip-area {
  max-width: 1400px;
}
.bib-page-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 40px 44px 20px;
  min-width: 0;
}
#bib-page-second-inner {
  border-left: 1px solid rgba(0,0,0,0.12) !important;
}
.two-page .bib-page-body {
  gap: 0;
}
.two-page .bib-page-content {
  padding-right: 6px;
}

.bib-page-left {
  right: 50%;
  border-radius: 12px 4px 4px 12px;
  transform-origin: right center;
  margin-right: 2px;
}
.bib-page-right {
  left: 50%;
  border-radius: 4px 12px 12px 4px;
  transform-origin: left center;
  margin-left: 2px;
}
.bib-page-content {
  height: 100%;
  overflow-y: auto !important;
  scrollbar-width: thin;
  scrollbar-color: rgba(0,0,0,0.15) transparent;
  -ms-overflow-style: auto;
  line-height: 1.8;
  font-size: var(--reader-font-size, 16px);
  font-family: var(--reader-font, 'Crimson Pro');
  color: var(--page-text, #2a2018);
  padding-right: 4px;
}
.bib-page-content::-webkit-scrollbar { width: 5px; }
.bib-page-content::-webkit-scrollbar-track { background: transparent; }
.bib-page-content::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
.bib-page::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 36px;
  background: linear-gradient(90deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.04) 60%, transparent 100%);
  pointer-events: none;
  z-index: 2;
  border-radius: 4px 0 0 4px;
}
.bib-page::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 24px;
  background: linear-gradient(270deg, rgba(0,0,0,0.05) 0%, transparent 100%);
  pointer-events: none;
  z-index: 2;
}
.bib-page.flip-out {
  animation: bib-flip-out 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
}
.bib-page.flip-in {
  animation: bib-flip-in 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
}
.bib-page.flip-out-prev {
  animation: bib-flip-out-prev 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
}
.bib-page.flip-in-prev {
  animation: bib-flip-in-prev 0.65s cubic-bezier(0.4,0,0.2,1) forwards;
}

@keyframes bib-flip-out {
  0% { transform: rotateY(0deg); box-shadow: 0 8px 60px rgba(0,0,0,0.6), -4px 0 20px rgba(0,0,0,0.3); }
  50% { transform: rotateY(-90deg); box-shadow: 0 20px 80px rgba(0,0,0,0.8); }
  100% { transform: rotateY(-180deg); box-shadow: none; opacity: 0; }
}
@keyframes bib-flip-in {
  0% { transform: rotateY(180deg); opacity: 0; }
  50% { transform: rotateY(90deg); opacity: 1; box-shadow: 0 20px 80px rgba(0,0,0,0.8); }
  100% { transform: rotateY(0deg); box-shadow: 0 8px 60px rgba(0,0,0,0.6), -4px 0 20px rgba(0,0,0,0.3); }
}
@keyframes bib-flip-out-prev {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(180deg); opacity: 0; }
}
@keyframes bib-flip-in-prev {
  0% { transform: rotateY(-180deg); opacity: 0; }
  50% { transform: rotateY(-90deg); opacity: 1; }
  100% { transform: rotateY(0deg); }
}


.bib-page-content h1, .bib-page-content h2, .bib-page-content h3 {
  font-family: 'DM Serif Display', Georgia, serif;
  font-style: italic;
  color: var(--page-heading, #1a1008);
  margin-bottom: 1em;
  margin-top: 1.5em;
  line-height: 1.2;
}
.bib-page-content h1 { font-size: 1.8em; }
.bib-page-content h2 { font-size: 1.4em; }
.bib-page-content h3 { font-size: 1.1em; }
.bib-page-content p { margin-bottom: 1.1em; text-align: justify; }
.bib-page-content img { max-width: 100%; border-radius: 6px; margin: 16px 0; }
.bib-page-content .highlight {
  background: linear-gradient(120deg, rgba(232,160,74,0.35) 0%, rgba(240,180,80,0.25) 100%);
  border-radius: 3px;
  padding: 1px 3px;
  cursor: pointer;
  border-bottom: 2px solid rgba(232,160,74,0.5);
  transition: background 0.2s ease;
  position: relative;
}
.bib-page-content .highlight:hover {
  background: linear-gradient(120deg, rgba(232,160,74,0.55) 0%, rgba(240,180,80,0.45) 100%);
}
.bib-page-content .highlight.has-note::after {
  content: '📝';
  font-size: 10px;
  position: absolute;
  top: -8px;
  right: -4px;
  line-height: 1;
}
.bib-page-content ::selection {
  background: rgba(232,160,74,0.4);
  color: inherit;
}

.bib-page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 56px 14px;
  border-top: 1px solid rgba(0,0,0,0.06);
  flex-shrink: 0;
}
.bib-page-num {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(0,0,0,0.3);
  letter-spacing: 0.08em;
}
.bib-page-chapter-name {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 11px;
  font-style: italic;
  color: rgba(0,0,0,0.25);
}
.bib-page-time-left {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(0,0,0,0.25);
}

.bib-left-zone, .bib-right-zone {
  position: absolute;
  top: 0; bottom: 0;
  width: 60px;
  z-index: 20;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bib-left-zone { left: 0; }
.bib-right-zone { right: 0; }
.bib-zone-arrow {
  width: 36px; height: 36px;
  background: rgba(10,8,6,0.6);
  border: 1px solid rgba(255,220,170,0.1);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: rgba(232,160,74,0.7);
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
}
.bib-left-zone:hover .bib-zone-arrow,
.bib-right-zone:hover .bib-zone-arrow { opacity: 1; }

.bib-ai-panel {
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 320px;
  background: rgba(16,13,10,0.97);
  border: 1px solid rgba(122,168,100,0.15);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(122,168,100,0.05);
  display: none;
  flex-direction: column;
  max-height: 420px;
  z-index: 100;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transform: translateY(16px);
  opacity: 0;
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.bib-ai-panel.open {
  display: flex;
  transform: translateY(0);
  opacity: 1;
}
.bib-ai-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid rgba(122,168,100,0.1);
  flex-shrink: 0;
}
.bib-ai-panel-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 14px;
  font-style: italic;
  color: rgba(143,200,112,0.9);
}
.bib-ai-panel-title svg { opacity: 0.8; }
.bib-ai-close {
  background: none; border: none;
  color: rgba(184,168,154,0.5);
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 4px;
  transition: color 0.2s ease;
}
.bib-ai-close:hover { color: rgba(184,168,154,0.9); }
.bib-ai-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(122,168,100,0.07);
  flex-shrink: 0;
}
.bib-ai-action {
  background: rgba(122,168,100,0.07);
  border: 1px solid rgba(122,168,100,0.12);
  color: rgba(143,200,112,0.8);
  border-radius: 7px;
  padding: 5px 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 4px;
}
.bib-ai-action:hover { background: rgba(122,168,100,0.14); border-color: rgba(122,168,100,0.25); color: #8fc870; }
.bib-ai-response {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  font-size: 13px;
  color: rgba(184,168,154,0.8);
  font-weight: 300;
  line-height: 1.65;
  min-height: 80px;
}
.bib-ai-response::-webkit-scrollbar { width: 3px; }
.bib-ai-response::-webkit-scrollbar-thumb { background: rgba(122,168,100,0.2); border-radius: 2px; }
.bib-ai-thinking {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(122,168,100,0.6);
  font-size: 12px;
}
.bib-ai-dot {
  width: 6px; height: 6px;
  background: rgba(122,168,100,0.6);
  border-radius: 50%;
  animation: bib-ai-pulse 1.2s ease infinite;
}
.bib-ai-dot:nth-child(2) { animation-delay: 0.2s; }
.bib-ai-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes bib-ai-pulse {
  0%,60%,100% { transform: scale(1); opacity: 0.4; }
  30% { transform: scale(1.4); opacity: 1; }
}

.bib-highlights-panel {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: rgba(10,8,6,0.97);
  border-top: 1px solid rgba(255,220,170,0.08);
  padding: 16px 24px;
  transform: translateY(100%);
  transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
  z-index: 80;
  max-height: 280px;
  overflow-y: auto;
  backdrop-filter: blur(20px);
}
.bib-highlights-panel.open { transform: translateY(0); }
.bib-highlights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.bib-highlights-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 14px;
  font-style: italic;
  color: rgba(240,232,222,0.8);
  font-weight: 400;
}
.bib-highlight-items { display: flex; flex-direction: column; gap: 8px; }
.bib-highlight-item {
  background: rgba(232,160,74,0.06);
  border: 1px solid rgba(232,160,74,0.12);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}
.bib-hi-text {
  flex: 1;
  font-size: 12px;
  color: rgba(184,168,154,0.8);
  font-weight: 300;
  font-style: italic;
  line-height: 1.5;
}
.bib-hi-page {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(232,160,74,0.5);
  flex-shrink: 0;
}

.bib-selection-menu {
  position: fixed;
  background: rgba(16,13,10,0.98);
  border: 1px solid rgba(232,160,74,0.25);
  border-radius: 12px;
  padding: 6px;
  display: none;
  gap: 2px;
  z-index: 99980;
  box-shadow: 0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,160,74,0.08);
  backdrop-filter: blur(20px);
  animation: bib-menu-pop 0.15s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes bib-menu-pop {
  from { transform: translateY(6px) scale(0.95); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
.bib-selection-menu.visible { display: flex; }
.bib-sel-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.07);
  color: rgba(184,168,154,0.9);
  border-radius: 8px;
  padding: 7px 13px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'DM Sans', sans-serif;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  letter-spacing: 0.01em;
}
.bib-sel-btn:hover { background: rgba(232,160,74,0.14); border-color: rgba(232,160,74,0.25); color: #e8a04a; transform: translateY(-1px); }
.bib-sel-btn.green:hover { background: rgba(122,168,100,0.14); border-color: rgba(122,168,100,0.25); color: #8fc870; transform: translateY(-1px); }

.bib-note-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 99990;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}
.bib-note-modal-backdrop.open {
  opacity: 1;
  pointer-events: all;
}
.bib-note-modal {
  background: #1a1410;
  border: 1px solid rgba(232,160,74,0.2);
  border-radius: 18px;
  padding: 0;
  width: 480px;
  max-width: calc(100vw - 48px);
  box-shadow: 0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(232,160,74,0.06);
  transform: translateY(20px) scale(0.97);
  transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1);
  overflow: hidden;
}
.bib-note-modal-backdrop.open .bib-note-modal {
  transform: translateY(0) scale(1);
}
.bib-note-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,220,170,0.06);
}
.bib-note-modal-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 15px;
  font-style: italic;
  color: #e8a04a;
  display: flex;
  align-items: center;
  gap: 8px;
}
.bib-note-modal-close {
  background: none; border: none;
  color: rgba(184,168,154,0.5);
  cursor: pointer;
  font-size: 18px;
  padding: 2px 6px;
  border-radius: 5px;
  transition: color 0.2s;
  line-height: 1;
}
.bib-note-modal-close:hover { color: rgba(184,168,154,0.9); }
.bib-note-modal-selected {
  margin: 14px 20px;
  background: rgba(232,160,74,0.07);
  border-left: 3px solid rgba(232,160,74,0.4);
  border-radius: 0 8px 8px 0;
  padding: 10px 14px;
  font-family: 'Crimson Pro', Georgia, serif;
  font-style: italic;
  font-size: 14px;
  color: rgba(240,232,222,0.7);
  line-height: 1.5;
  max-height: 80px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
.bib-note-modal-label {
  padding: 0 20px 8px;
  font-size: 11px;
  color: rgba(122,110,101,0.7);
  font-family: 'DM Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.bib-note-modal-textarea {
  display: block;
  width: calc(100% - 40px);
  margin: 0 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.1);
  border-radius: 10px;
  padding: 12px 14px;
  color: rgba(240,232,222,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 300;
  line-height: 1.6;
  resize: vertical;
  min-height: 90px;
  max-height: 200px;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}
.bib-note-modal-textarea:focus {
  border-color: rgba(232,160,74,0.3);
  background: rgba(232,160,74,0.04);
}
.bib-note-modal-textarea::placeholder { color: rgba(122,110,101,0.5); }
.bib-note-modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 14px 20px 18px;
  margin-top: 12px;
}
.bib-note-modal-cancel {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.08);
  color: rgba(184,168,154,0.6);
  border-radius: 9px;
  padding: 9px 18px;
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bib-note-modal-cancel:hover { background: rgba(255,255,255,0.07); color: rgba(184,168,154,0.9); }
.bib-note-modal-save {
  background: linear-gradient(135deg, #e8a04a, #f0ad55);
  border: none;
  color: #0a0806;
  border-radius: 9px;
  padding: 9px 22px;
  font-size: 13px;
  font-weight: 700;
  font-family: 'DM Sans', sans-serif;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
}
.bib-note-modal-save:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(232,160,74,0.35); }

.bib-toast {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(16,13,10,0.95);
  border: 1px solid rgba(232,160,74,0.2);
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  color: rgba(240,232,222,0.9);
  z-index: 99999;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
  pointer-events: none;
  backdrop-filter: blur(16px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  font-family: 'DM Sans', sans-serif;
  font-weight: 300;
}
.bib-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

.bib-cinema-enter {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: #0a0806;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 0;
}
.bib-cinema-enter.active {
  animation: bib-cinema 1s ease forwards;
}
.bib-cinema-book {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.bib-cinema-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 32px;
  font-style: italic;
  color: rgba(240,232,222,0.9);
  text-shadow: 0 0 40px rgba(232,160,74,0.4);
}
.bib-cinema-glow {
  width: 80px; height: 2px;
  background: linear-gradient(90deg, transparent, #e8a04a, transparent);
  animation: bib-glow-expand 0.8s ease 0.2s forwards;
  transform: scaleX(0);
}
@keyframes bib-glow-expand { to { transform: scaleX(1); } }
@keyframes bib-cinema {
  0% { opacity: 1; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
}



.bib-search-global-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,220,170,0.08);
  color: rgba(184,168,154,0.7);
  height: 32px;
  padding: 0 12px;
  border-radius: 9px;
  display: flex; align-items: center; gap: 7px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.bib-search-global-btn:hover { background: rgba(232,160,74,0.1); border-color: rgba(232,160,74,0.2); color: #e8a04a; }
.bib-search-global-btn.active { background: rgba(232,160,74,0.12); border-color: rgba(232,160,74,0.25); color: #e8a04a; }

.bib-search-panel {
  position: absolute;
  top: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: 620px;
  max-width: calc(100vw - 40px);
  background: #111009;
  border: 1px solid rgba(232,160,74,0.15);
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,160,74,0.05);
  z-index: 9999;
  display: none;
  flex-direction: column;
  overflow: hidden;
  animation: bibSearchSlide 0.2s cubic-bezier(0.34,1.56,0.64,1);
}
.bib-search-panel.open { display: flex; }
@keyframes bibSearchSlide {
  from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
}

.bib-search-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid rgba(255,220,170,0.06);
}
.bib-search-input-row svg { color: rgba(184,168,154,0.4); flex-shrink: 0; }
.bib-search-input-row input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #f0e8de;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 300;
}
.bib-search-input-row input::placeholder { color: rgba(122,110,101,0.5); }

.bib-search-stats {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: rgba(184,168,154,0.4);
  white-space: nowrap;
  flex-shrink: 0;
}
.bib-search-stats.has-results { color: #e8a04a; }

.bib-search-nav-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px 0 0;
  flex-shrink: 0;
}
.bib-search-nav-btn {
  background: none;
  border: none;
  color: rgba(184,168,154,0.5);
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.bib-search-nav-btn:hover:not(:disabled) { background: rgba(232,160,74,0.1); color: #e8a04a; }
.bib-search-nav-btn:disabled { opacity: 0.2; cursor: not-allowed; }

.bib-search-results {
  max-height: 320px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(232,160,74,0.15) transparent;
}
.bib-search-results::-webkit-scrollbar { width: 4px; }
.bib-search-results::-webkit-scrollbar-thumb { background: rgba(232,160,74,0.15); border-radius: 2px; }

.bib-search-result-item {
  padding: 11px 18px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255,220,170,0.04);
  transition: background 0.15s;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.bib-search-result-item:hover { background: rgba(232,160,74,0.06); }
.bib-search-result-item.active { background: rgba(232,160,74,0.1); }

.bib-search-result-page {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(232,160,74,0.6);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.bib-search-result-preview {
  font-family: 'Crimson Pro', Georgia, serif;
  font-size: 14px;
  color: rgba(240,232,222,0.75);
  line-height: 1.5;
}
.bib-search-result-preview mark {
  background: rgba(232,160,74,0.3);
  color: #f0c070;
  border-radius: 2px;
  padding: 0 2px;
}

.bib-search-empty {
  padding: 32px 20px;
  text-align: center;
  color: rgba(122,110,101,0.5);
  font-size: 13px;
  font-family: 'DM Sans', sans-serif;
}


.bib-page-content mark.bib-hl {
  background: rgba(232,160,74,0.28);
  color: inherit;
  border-radius: 2px;
  padding: 0 1px;
}
.bib-page-content mark.bib-hl.bib-hl-current {
  background: rgba(232,160,74,0.55);
  color: #1a1208;
  font-weight: 600;
  box-shadow: 0 0 0 2px rgba(232,160,74,0.4);
}


.bib-timer-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.08);
  color: rgba(184,168,154,0.7);
  height: 34px;
  border-radius: 9px;
  padding: 0 11px;
  display: flex; align-items: center; gap: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  position: relative;
}
.bib-timer-btn:hover { background: rgba(232,160,74,0.1); border-color: rgba(232,160,74,0.2); color: #e8a04a; }
.bib-timer-btn.active { background: rgba(232,160,74,0.12); border-color: rgba(232,160,74,0.3); color: #e8a04a; }
.bib-timer-btn.paused { background: rgba(255,160,50,0.08); border-color: rgba(255,160,50,0.25); color: rgba(255,190,80,0.9); }

.bib-timer-panel {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: rgba(14,11,8,0.97);
  border: 1px solid rgba(255,220,170,0.1);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,160,74,0.05);
  backdrop-filter: blur(24px);
  z-index: 200;
  display: none;
  flex-direction: column;
  gap: 16px;
  animation: bib-panel-appear 0.25s cubic-bezier(0.16,1,0.3,1);
}
.bib-timer-panel.open { display: flex; }
@keyframes bib-panel-appear {
  from { opacity: 0; transform: translateY(-8px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.bib-timer-panel-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 14px;
  font-style: italic;
  color: rgba(240,232,222,0.9);
  font-weight: 400;
  display: flex;
  align-items: center;
  gap: 8px;
}
.bib-timer-panel-title svg { color: #e8a04a; }

.bib-timer-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.bib-timer-preset {
  flex: 1;
  min-width: 48px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.07);
  color: rgba(184,168,154,0.7);
  border-radius: 8px;
  padding: 7px 4px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}
.bib-timer-preset:hover { background: rgba(232,160,74,0.08); color: rgba(232,160,74,0.9); border-color: rgba(232,160,74,0.2); }
.bib-timer-preset.active { background: rgba(232,160,74,0.14); color: #e8a04a; border-color: rgba(232,160,74,0.35); }

.bib-timer-custom-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.bib-timer-custom-input {
  background: rgba(30,26,21,0.8);
  border: 1px solid rgba(255,220,170,0.08);
  border-radius: 8px;
  padding: 7px 10px;
  color: #f0e8de;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  width: 64px;
  outline: none;
  text-align: center;
  transition: border-color 0.2s ease;
}
.bib-timer-custom-input:focus { border-color: rgba(232,160,74,0.3); }
.bib-timer-custom-label {
  font-size: 12px;
  color: rgba(122,110,101,0.7);
  font-weight: 300;
}


.bib-timer-ring-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
}
.bib-timer-ring-svg {
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 8px rgba(232,160,74,0.25));
}
.bib-timer-ring-bg {
  fill: none;
  stroke: rgba(255,255,255,0.06);
  stroke-width: 5;
}
.bib-timer-ring-fill {
  fill: none;
  stroke: url(#bib-timer-grad);
  stroke-width: 5;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}
.bib-timer-ring-text {
  font-family: 'DM Mono', monospace;
  font-size: 22px;
  font-weight: 300;
  color: rgba(240,232,222,0.95);
  letter-spacing: 0.05em;
  text-align: center;
  line-height: 1;
}
.bib-timer-ring-sub {
  font-size: 11px;
  color: rgba(122,110,101,0.6);
  font-weight: 300;
  letter-spacing: 0.04em;
  text-align: center;
}

.bib-timer-actions {
  display: flex;
  gap: 8px;
}
.bib-timer-action-btn {
  flex: 1;
  border-radius: 9px;
  padding: 9px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
.bib-timer-start-btn {
  background: linear-gradient(135deg, #e8a04a 0%, #f0ad55 100%);
  color: #0a0806;
  box-shadow: 0 3px 12px rgba(232,160,74,0.25);
}
.bib-timer-start-btn:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(232,160,74,0.4); }
.bib-timer-pause-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,220,170,0.1);
  color: rgba(184,168,154,0.8);
}
.bib-timer-pause-btn:hover { background: rgba(232,160,74,0.08); border-color: rgba(232,160,74,0.2); color: #e8a04a; }
.bib-timer-stop-btn {
  background: rgba(192,57,43,0.12);
  border: 1px solid rgba(192,57,43,0.2);
  color: rgba(220,100,80,0.8);
}
.bib-timer-stop-btn:hover { background: rgba(192,57,43,0.22); border-color: rgba(192,57,43,0.35); }


.bib-timer-progress-bar {
  position: absolute;
  bottom: -2px; left: 0;
  height: 2px;
  width: 0%;
  background: linear-gradient(90deg, rgba(232,160,74,0.5), #e8a04a);
  transition: width 1s linear;
  z-index: 101;
  border-radius: 0 2px 2px 0;
}
.bib-timer-progress-bar::after {
  content: '';
  position: absolute;
  right: -1px; top: -2px;
  width: 5px; height: 5px;
  background: #e8a04a;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(232,160,74,0.9);
}


.bib-timer-alert {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(20px);
  background: rgba(14,11,8,0.96);
  border: 1px solid rgba(232,160,74,0.3);
  border-radius: 14px;
  padding: 14px 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: rgba(240,232,222,0.9);
  box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,160,74,0.08);
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
}
.bib-timer-alert.show { opacity: 1; transform: translateX(-50%) translateY(0); }
.bib-timer-alert svg { color: #e8a04a; flex-shrink: 0; }


.bib-timer-done-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10,8,6,0.88);
  z-index: 300;
  display: none;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(8px);
  animation: bib-done-fade 0.5s ease;
}
.bib-timer-done-overlay.show { display: flex; }
@keyframes bib-done-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.bib-timer-done-card {
  background: rgba(14,11,8,0.97);
  border: 1px solid rgba(232,160,74,0.15);
  border-radius: 24px;
  padding: 40px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;
  max-width: 400px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(232,160,74,0.06);
  animation: bib-done-card 0.5s cubic-bezier(0.16,1,0.3,1) 0.1s both;
}
@keyframes bib-done-card {
  from { opacity: 0; transform: translateY(24px) scale(0.95); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
.bib-timer-done-icon {
  width: 72px; height: 72px;
  background: rgba(232,160,74,0.1);
  border: 1px solid rgba(232,160,74,0.2);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 32px;
  margin-bottom: 4px;
}
.bib-timer-done-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 26px;
  font-style: italic;
  color: #f0e8de;
  font-weight: 400;
}
.bib-timer-done-sub {
  font-size: 14px;
  color: rgba(184,168,154,0.6);
  font-weight: 300;
  line-height: 1.5;
}
.bib-timer-done-stats {
  display: flex;
  gap: 24px;
  margin: 8px 0;
}
.bib-timer-done-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.bib-timer-done-stat-val {
  font-family: 'DM Mono', monospace;
  font-size: 24px;
  color: #e8a04a;
  font-weight: 300;
}
.bib-timer-done-stat-label {
  font-size: 11px;
  color: rgba(122,110,101,0.6);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.bib-timer-done-actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.bib-timer-done-continue {
  background: linear-gradient(135deg, #e8a04a 0%, #f0ad55 100%);
  color: #0a0806;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bib-timer-done-continue:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(232,160,74,0.35); }
.bib-timer-done-close {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,220,170,0.08);
  color: rgba(184,168,154,0.7);
  border-radius: 10px;
  padding: 10px 18px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.bib-timer-done-close:hover { background: rgba(232,160,74,0.06); color: rgba(240,232,222,0.8); }

@media (max-width: 900px) {
  .bib-shelf-screen { padding: 24px 20px 40px; }
  .bib-shelf-hero { flex-direction: column; align-items: flex-start; gap: 16px; }
  .bib-shelf-hero-text h1 { font-size: 36px; }
  .bib-search-bar { width: 100%; }
  .bib-books-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 16px; }
  .bib-reading-area { padding: 0 16px; }
  .bib-page-inner { padding: 28px 28px 20px; }
  .bib-page-footer { padding: 8px 28px 10px; }
  .bib-toc-panel { width: 220px; }
  .bib-settings-panel { width: 100%; top: 52px; border-radius: 0; }
  .bib-ai-panel { right: 10px; bottom: 10px; width: calc(100% - 20px); }
  .bib-left-zone, .bib-right-zone { width: 40px; }
  .bib-header-tabs { display: none; }
}
`;

const COVER_PALETTES = [
  { bg: 'linear-gradient(135deg, #1a0e05 0%, #3d1f0a 50%, #6b3a15 100%)', accent: '#e8a04a' },
  { bg: 'linear-gradient(135deg, #080f1a 0%, #0d2035 50%, #163352 100%)', accent: '#5da0d0' },
  { bg: 'linear-gradient(135deg, #0d0f0a 0%, #1a2910 50%, #2d4520 100%)', accent: '#7ab05a' },
  { bg: 'linear-gradient(135deg, #1a0a10 0%, #380f1e 50%, #5c1830 100%)', accent: '#c05070' },
  { bg: 'linear-gradient(135deg, #100808 0%, #2a1212 50%, #451c1c 100%)', accent: '#d06040' },
  { bg: 'linear-gradient(135deg, #0a0a0f 0%, #14143a 50%, #1f1f5a 100%)', accent: '#8080e0' },
  { bg: 'linear-gradient(135deg, #0d0d08 0%, #2a2010 50%, #4a3818 100%)', accent: '#c8a060' },
  { bg: 'linear-gradient(135deg, #08100d 0%, #102818 50%, #184020 100%)', accent: '#60c880' },
];

const THEMES = {
  warm: { pageBg: '#f5f0e8', pageText: '#2a2018', pageHeading: '#1a1008', name: 'Creme Quente' },
  sepia: { pageBg: '#f0e6d2', pageText: '#3d2c1a', pageHeading: '#2a1c0d', name: 'Sépia' },
  paper: { pageBg: '#fafaf8', pageText: '#1a1a1a', pageHeading: '#0a0a0a', name: 'Papel' },
  dark: { pageBg: '#16120f', pageText: '#c8b8a0', pageHeading: '#e0d0b8', name: 'Noite' },
  midnight: { pageBg: '#0d0f14', pageText: '#a0b0c8', pageHeading: '#c0d0e0', name: 'Meia-Noite' },
};

const FONTS = [
  { name: 'Crimson Pro', label: 'Crimson — Clássica' },
  { name: 'Source Serif 4', label: 'Source Serif — Limpa' },
  { name: 'Libre Baskerville', label: 'Baskerville — Elegante' },
  { name: 'Georgia', label: 'Georgia — Clássica Web' },
  { name: 'DM Serif Display', label: 'DM Serif — Moderna' },
  { name: 'OpenDyslexic', label: 'OpenDyslexic — Acessível' },
];

let state = {
  books: [],
  currentBook: null,
  currentPage: 0,
  pages: [],
  fontSize: 16,
  theme: 'warm',
  fontFamily: 'Crimson Pro',
  lineHeight: 1.8,
  brightness: 100,
  twoPageMode: false,
  dailyGoal: 0,
  pagesReadToday: 0,
  lastReadDate: null,
  highlights: {},
  bookmarks: {},
  tocOpen: false,
  settingsOpen: false,
  aiPanelOpen: false,
  highlightsPanelOpen: false,
  isAnimating: false,
  dragStart: null,
  totalWords: 0,
  estimatedWPM: 200, // Average reading speed
  pomodoroInterval: null,
  searchResults: [],
  currentSearchIndex: -1,
  lastSearchQuery: '',
  _lastSelection: null,
  _pendingNotePageIdx: 0,
  ttsActive: false,
  speechSynth: window.speechSynthesis,
  speechUtterance: null,
  timerDurationSec: 600,  
  timerRemainingSecAtStart: 600,
  timerElapsed: 0,
  timerInterval: null,
  timerRunning: false,
  timerPaused: false,
  timerPanelOpen: false,
  timerPageStart: 0,
  timerAlertFired: false,
};

function loadState() {
  try {
    const saved = localStorage.getItem('lorac_bib_state');
    if (saved) {
      const s = JSON.parse(saved);
      state.books = s.books || [];
      state.highlights = s.highlights || {};
      state.bookmarks = s.bookmarks || {};
      state.fontSize = s.fontSize || 16;
      state.dailyGoal = s.dailyGoal || 0;
      state.pagesReadToday = s.pagesReadToday || 0;
      state.lastReadDate = s.lastReadDate || null;
      state.totalWords = s.totalWords || 0;
      state.twoPageMode = s.twoPageMode || false;
      state.theme = s.theme || 'warm';
      state.fontFamily = s.fontFamily || 'Crimson Pro';

      
      const today = new Date().toDateString();
      if (state.lastReadDate !== today) {
        state.pagesReadToday = 0;
        state.lastReadDate = today;
      }
    }
   
    state.books.forEach(book => {
      if (book.content && !book.totalWords) book.totalWords = book.content.split(/\s+/).filter(Boolean).length;
    });
  } catch(e) {}
}

function saveState() {
  try {
    localStorage.setItem('lorac_bib_state', JSON.stringify({
      books: state.books.map(b => ({ ...b, content: b.content?.substring(0, 5000) })),
      highlights: state.highlights,
      bookmarks: state.bookmarks,
      fontSize: state.fontSize,
      dailyGoal: state.dailyGoal,
      pagesReadToday: state.pagesReadToday,
      lastReadDate: state.lastReadDate,
      twoPageMode: state.twoPageMode,
      theme: state.theme,
      fontFamily: state.fontFamily,
    }));
    localStorage.setItem('lorac_bib_books', JSON.stringify(state.books.map(b => ({
      id: b.id, title: b.title, author: b.author, format: b.format,
      totalPages: b.totalPages, currentPage: b.currentPage,
      paletteIdx: b.paletteIdx, emoji: b.emoji, addedAt: b.addedAt,
    }))));
  } catch(e) {}
}

function saveBooksContent() {
  try {
    state.books.forEach(b => {
      if (b.content) {
        localStorage.setItem(`lorac_bib_content_${b.id}`, b.content);
      }
      if (b.pdfData) {
        localStorage.setItem(`lorac_bib_pdf_${b.id}`, b.pdfData);
      }
    });
  } catch(e) {}
}

function loadBookContent(book) {
  if (!book.content) {
    const saved = localStorage.getItem(`lorac_bib_content_${book.id}`);
    if (saved) book.content = saved;
  }
  if (!book.pdfData) {
    const saved = localStorage.getItem(`lorac_bib_pdf_${book.id}`);
    if (saved) book.pdfData = saved;
  }
}

function uid() {
  return Math.random().toString(36).substr(2, 9);
}

function injectStyles() {
  if (document.getElementById('bib-styles')) return;
  const s = document.createElement('style');
  s.id = 'bib-styles';
  s.textContent = CSS;
  document.head.appendChild(s);
}

function createOverlay() {
  if (document.getElementById('biblioteca-overlay')) return;
  const el = document.createElement('div');
  el.id = 'biblioteca-overlay';
  el.innerHTML = buildHTML();
  document.body.appendChild(el);
  bindEvents();
  createParticles();
}

function buildHTML() {
  return `
<div class="bib-bg-grain"></div>
<div class="bib-particles" id="bib-particles"></div>

<div class="bib-header">
  <div class="bib-header-left">
    <div class="bib-header-brand">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      Biblioteca
    </div>
    <div class="bib-header-tabs">
      <button class="bib-tab active" onclick="BibliotecaVirtual.switchTab('shelf')">Estante</button>
      <button class="bib-tab" onclick="BibliotecaVirtual.switchTab('recent')">Recentes</button>
      <button class="bib-tab" onclick="BibliotecaVirtual.switchTab('highlights')">Marcações</button>
    </div>
  </div>
  <div class="bib-header-right">
    <button class="bib-btn-upload" onclick="document.getElementById('bib-file-input').click()">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      Importar Livro
    </button>
    <button class="bib-btn-icon" onclick="BibliotecaVirtual.close()" title="Fechar biblioteca">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</div>

<input type="file" id="bib-file-input" accept=".pdf,.epub,.txt,.md" multiple />

<div class="bib-body">
  <div class="bib-shelf-screen" id="bib-shelf-screen">
    <div class="bib-shelf-hero">
      <div class="bib-shelf-hero-text">
        <h1>Sua <span>Biblioteca</span><br>Pessoal</h1>
        <p>Leia, anote, aprenda — tudo em um só lugar</p>
      </div>
      <div class="bib-search-bar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="text" placeholder="Buscar livros..." id="bib-search-input" oninput="BibliotecaVirtual.filterBooks(this.value)"/>
      </div>
    </div>

    <div id="bib-drop-section">
      <div class="bib-section-label">
        <h2>Importar</h2>
        <div class="bib-section-line"></div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 20px;">
        <div class="bib-drop-zone" id="bib-drop-zone" onclick="document.getElementById('bib-file-input').click()">
          <div class="bib-drop-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e8a04a" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
          </div>
          <p class="bib-drop-title">Arraste seus livros aqui</p>
          <p class="bib-drop-sub">ou clique para escolher arquivos</p>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 10px; align-items: center;">
            <label class="bib-setting-label" style="flex-shrink:0">Capa:</label>
            <input type="text" id="bib-custom-emoji" value="📚" maxlength="2" class="bib-input-style" style="width: 50px; text-align: center;" />
            <input type="color" id="bib-custom-color" value="#e8a04a" style="width: 40px; height: 35px; border: none; background: none; cursor: pointer;" />
          </div>
          <input type="text" id="bib-book-tags" placeholder="Tags (separadas por vírgula)" class="bib-input-style" />
          <div style="display: flex; gap: 10px; align-items: center;">
            <label class="bib-setting-label" style="flex-shrink:0">Meta:</label>
            <input type="number" id="bib-daily-goal-input" placeholder="Páginas/dia" class="bib-input-style" onchange="BibliotecaVirtual.setDailyGoal(this.value)" />
          </div>
        </div>
      </div>
    </div>

    <div id="bib-books-section">
      <div class="bib-section-label">
        <h2>Minha Estante</h2>
        <div class="bib-section-line"></div>
        <span class="bib-section-count" id="bib-count">0 livros</span>
      </div>
      <div class="bib-books-grid" id="bib-books-grid"></div>
    </div>
  </div>
  <div class="bib-reader-screen" id="bib-reader-screen">
    <div class="bib-reader-topbar">
      <div class="bib-reader-topbar-left">
        <button class="bib-reader-back" onclick="BibliotecaVirtual.closeReader()" title="Voltar à estante">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div class="bib-reader-book-info">
          <div class="bib-reader-book-title" id="bib-reader-title">—</div>
          <div class="bib-reader-book-chapter" id="bib-reader-chapter">—</div>
        </div>
      </div>
      <div class="bib-reader-topbar-center">
        <div class="bib-page-nav">
          <button class="bib-page-btn" id="bib-btn-prev" onclick="BibliotecaVirtual.prevPage()" title="Página anterior">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span class="bib-page-indicator" id="bib-page-indicator">— / —</span>
          <button class="bib-page-btn" id="bib-btn-next" onclick="BibliotecaVirtual.nextPage()" title="Próxima página">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div class="bib-reader-topbar-right">
        <button class="bib-bookmark-btn" onclick="BibliotecaVirtual.toggleBookmark()" id="bib-bookmark-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Marcar
        </button>
        <button class="bib-search-global-btn" onclick="BibliotecaVirtual.toggleSearchPanel()" id="bib-search-global-btn" title="Buscar no livro (Ctrl+F)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Buscar
        </button>
          <button class="bib-settings-btn" onclick="BibliotecaVirtual.toggleTwoPageMode()" id="bib-twopage-btn">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Duas Páginas
          </button>
        <button class="bib-toc-btn" onclick="BibliotecaVirtual.toggleToc()" id="bib-toc-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="16" y2="18"/></svg>
          Índice
        </button>
        <button class="bib-settings-btn" onclick="BibliotecaVirtual.toggleSettings()" id="bib-settings-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Aparência
        </button>
        <button class="bib-settings-btn" onclick="BibliotecaVirtual.showShortcutsModal()" id="bib-shortcuts-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M9 10l-2 2 2 2M15 10l2 2-2 2"/></svg>
          Atalhos
        </button>
        <button class="bib-ai-btn" onclick="BibliotecaVirtual.toggleAI()" id="bib-ai-toggle">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
          IA
        </button>
        <button class="bib-settings-btn" onclick="BibliotecaVirtual.toggleFocusMode()" id="bib-focus-mode-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 6v6l4 2"/></svg>
          Foco
        </button>
        <button class="bib-settings-btn" onclick="BibliotecaVirtual.toggleTTS()" id="bib-tts-btn" title="Ouvir texto (Leitura em voz alta)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 10 0 0 1 0 7.07"/></svg>
          Ouvir
        </button>
        <div style="position:relative">
          <button class="bib-timer-btn" onclick="BibliotecaVirtual.toggleTimerPanel()" id="bib-timer-btn" title="Leitura por tempo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="bib-timer-btn-label">Timer</span>
          </button>
          <div class="bib-timer-panel" id="bib-timer-panel">
            <div class="bib-timer-panel-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Leitura por Tempo
            </div>
            <div>
              <div style="font-size:11px;color:rgba(122,110,101,0.6);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:8px;font-family:'DM Mono',monospace;">Durac&atilde;o</div>
              <div class="bib-timer-presets" id="bib-timer-presets">
                <button class="bib-timer-preset" onclick="BibliotecaVirtual.setTimerPreset(5)">5 min</button>
                <button class="bib-timer-preset active" onclick="BibliotecaVirtual.setTimerPreset(10)">10 min</button>
                <button class="bib-timer-preset" onclick="BibliotecaVirtual.setTimerPreset(15)">15 min</button>
                <button class="bib-timer-preset" onclick="BibliotecaVirtual.setTimerPreset(20)">20 min</button>
                <button class="bib-timer-preset" onclick="BibliotecaVirtual.setTimerPreset(30)">30 min</button>
              </div>
              <div class="bib-timer-custom-row" style="margin-top:10px;">
                <input type="number" class="bib-timer-custom-input" id="bib-timer-custom" min="1" max="120" value="10" oninput="BibliotecaVirtual.setTimerCustom(this.value)" />
                <span class="bib-timer-custom-label">minutos personalizados</span>
              </div>
            </div>
            <div class="bib-timer-ring-wrap" id="bib-timer-ring-wrap" style="display:none;">
              <svg class="bib-timer-ring-svg" width="100" height="100" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="bib-timer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="rgba(232,160,74,0.7)"/>
                    <stop offset="100%" stop-color="#e8a04a"/>
                  </linearGradient>
                </defs>
                <circle class="bib-timer-ring-bg" cx="50" cy="50" r="42"/>
                <circle class="bib-timer-ring-fill" cx="50" cy="50" r="42" id="bib-timer-ring-fill"
                  stroke-dasharray="263.9" stroke-dashoffset="0"/>
              </svg>
              <div class="bib-timer-ring-text" id="bib-timer-ring-text">00:00</div>
              <div class="bib-timer-ring-sub" id="bib-timer-ring-sub">pronto para iniciar</div>
            </div>
            <div class="bib-timer-actions" id="bib-timer-actions">
              <button class="bib-timer-action-btn bib-timer-start-btn" id="bib-timer-start-btn" onclick="BibliotecaVirtual.startTimer()">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Iniciar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bib-progress-track" style="position:relative;">
      <div class="bib-progress-fill-bar" id="bib-progress-bar" style="width:0%"></div>
      <div class="bib-timer-progress-bar" id="bib-timer-progress-bar" style="width:0%;display:none;"></div>
    </div>
    
    <div class="bib-timer-done-overlay" id="bib-timer-done-overlay">
      <div class="bib-timer-done-card">
        <div class="bib-timer-done-icon">&#9200;</div>
        <div class="bib-timer-done-title">Sess&atilde;o conclu&iacute;da!</div>
        <div class="bib-timer-done-sub" id="bib-timer-done-sub">Voc&ecirc; completou sua sess&atilde;o de leitura.</div>
        <div class="bib-timer-done-stats">
          <div class="bib-timer-done-stat">
            <div class="bib-timer-done-stat-val" id="bib-done-minutes">0</div>
            <div class="bib-timer-done-stat-label">Minutos</div>
          </div>
          <div class="bib-timer-done-stat">
            <div class="bib-timer-done-stat-val" id="bib-done-pages">0</div>
            <div class="bib-timer-done-stat-label">P&aacute;ginas</div>
          </div>
        </div>
        <div class="bib-timer-done-actions">
          <button class="bib-timer-done-continue" onclick="BibliotecaVirtual.timerContinue()">Continuar Lendo</button>
          <button class="bib-timer-done-close" onclick="BibliotecaVirtual.timerClose()">Encerrar</button>
        </div>
      </div>
    </div>

    <div class="bib-search-panel" id="bib-search-panel">
      <div class="bib-search-input-row">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input type="text" id="bib-search-global-input" placeholder="Buscar no livro..." oninput="BibliotecaVirtual.runSearch(this.value)" onkeydown="BibliotecaVirtual.searchKeyNav(event)" autocomplete="off" spellcheck="false"/>
        <span class="bib-search-stats" id="bib-search-stats"></span>
        <div class="bib-search-nav-row">
          <button class="bib-search-nav-btn" id="bib-search-prev-btn" onclick="BibliotecaVirtual.searchNav(-1)" title="Resultado anterior" disabled>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button class="bib-search-nav-btn" id="bib-search-next-btn" onclick="BibliotecaVirtual.searchNav(1)" title="Próximo resultado" disabled>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="bib-search-nav-btn" onclick="BibliotecaVirtual.closeSearchPanel()" title="Fechar">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="bib-search-results" id="bib-search-results"></div>
    </div>

    <div class="bib-reader-main" id="bib-reader-main">
      <div class="bib-toc-panel" id="bib-toc-panel">
        <div class="bib-toc-header">
          <h3>Índice de Capítulos</h3>
        </div>
        <div class="bib-toc-list" id="bib-toc-list"></div>
      </div>

      <div class="bib-reading-area" id="bib-reading-area">
        <div class="bib-left-zone" onclick="BibliotecaVirtual.prevPage()">
          <div class="bib-zone-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </div>
        </div>
        <div class="bib-page-container" id="bib-page-container">
          <div class="bib-page-flip-area" id="bib-flip-area">
            <div class="bib-page" id="bib-page-main">
              <div class="bib-page-body" id="bib-page-body">
                <div class="bib-page-inner">
                  <div class="bib-page-content" id="bib-page-content"></div>
                </div>
                <div class="bib-page-inner" id="bib-page-second-inner" style="display:none; border-left:1px solid rgba(0,0,0,0.06)">
                  <div class="bib-page-content" id="bib-page-content-second"></div>
                </div>
              </div>
              <div class="bib-page-footer">
                <span class="bib-page-num" id="bib-page-foot-num">1</span>
                <span class="bib-page-chapter-name" id="bib-page-foot-chapter">—</span>
                <span id="bib-page-wpm" class="bib-page-wpm"></span>
                <span id="bib-pomodoro-timer" class="bib-pomodoro-timer" style="display:none; margin: 0 10px;"></span>
                <span class="bib-page-time-left" id="bib-page-time-left">— min restantes</span>
              </div>
            </div>
          </div>
        </div>
        <div class="bib-right-zone" onclick="BibliotecaVirtual.nextPage()">
          <div class="bib-zone-arrow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </div>
        </div>

        <div class="bib-ai-panel" id="bib-ai-panel">
          <div class="bib-ai-panel-header">
            <div class="bib-ai-panel-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M8 12h8M12 8l4 4-4 4"/></svg>
              Assistente de Leitura
            </div>
            <button class="bib-ai-close" onclick="BibliotecaVirtual.toggleAI()">✕</button>
          </div>
          <div class="bib-ai-actions">
            <button class="bib-ai-action" onclick="BibliotecaVirtual.aiAction('summarize')">📝 Resumir página</button>
            <button class="bib-ai-action" onclick="BibliotecaVirtual.aiAction('explain')">🔍 Explicar trecho</button>
            <button class="bib-ai-action" onclick="BibliotecaVirtual.aiAction('flashcards')">🃏 Flashcards</button>
            <button class="bib-ai-action" onclick="BibliotecaVirtual.aiAction('quiz')">❓ Quiz do capítulo</button>
            <button class="bib-ai-action" onclick="BibliotecaVirtual.aiAction('highlights')">✨ Pontos chave</button>
          </div>
          <div class="bib-ai-response" id="bib-ai-response">
            <span style="color:rgba(122,110,101,0.5);font-style:italic;font-size:12px;">Selecione uma ação acima para começar</span>
          </div>
        </div>

        <div class="bib-highlights-panel" id="bib-highlights-panel">
          <div class="bib-highlights-header">
            <span class="bib-highlights-title">Minhas Marcações</span>
          <button class="bib-ai-action" onclick="BibliotecaVirtual.exportHighlights()" style="margin-left:auto; margin-right:10px">📤 Exportar (.md)</button>
            <button class="bib-ai-close" onclick="BibliotecaVirtual.toggleHighlightsPanel()">✕</button>
          </div>
          <div class="bib-highlight-items" id="bib-highlight-items"></div>
        </div>
      </div>

      <div class="bib-settings-panel" id="bib-settings-panel">
        <div class="bib-settings-group">
          <div class="bib-settings-group-title">Tamanho da fonte</div>
          <div class="bib-setting-row">
            <span class="bib-setting-label">Tamanho</span>
            <div class="bib-stepper">
              <button class="bib-stepper-btn" onclick="BibliotecaVirtual.changeFontSize(-1)">−</button>
              <span class="bib-stepper-val" id="bib-font-size-val">16px</span>
              <button class="bib-stepper-btn" onclick="BibliotecaVirtual.changeFontSize(1)">+</button>
            </div>
          </div>
        </div>

        <div class="bib-settings-group">
          <div class="bib-settings-group-title">Tema de leitura</div>
          <div class="bib-theme-row" id="bib-theme-row"></div>
        </div>

        <div class="bib-settings-group">
          <div class="bib-settings-group-title">Tipografia</div>
          <div class="bib-font-row" id="bib-font-row"></div>
        </div>

        <div class="bib-settings-group">
          <div class="bib-settings-group-title">Espaçamento entre linhas</div>
          <div class="bib-slider-wrap">
            <input type="range" class="bib-slider" min="1.4" max="2.4" step="0.1" value="1.8"
              id="bib-line-height-slider"
              oninput="BibliotecaVirtual.changeLineHeight(this.value)"/>
          </div>
          <div class="bib-setting-row" style="margin-top:6px;margin-bottom:0">
            <span class="bib-setting-label">Valor atual</span>
            <span class="bib-setting-value" id="bib-lh-val">1.8×</span>
          </div>
        </div>

        <div class="bib-settings-group">
          <div class="bib-settings-group-title">Brilho</div>
          <div class="bib-slider-wrap">
            <input type="range" class="bib-slider" min="50" max="120" step="5" value="100"
              id="bib-brightness-slider"
              oninput="BibliotecaVirtual.changeBrightness(this.value)"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="bib-selection-menu" id="bib-selection-menu">
  <button class="bib-sel-btn" onmousedown="event.preventDefault()" onclick="BibliotecaVirtual.highlightSelection()">🖊 Grifar</button>
  <button class="bib-sel-btn" onmousedown="event.preventDefault()" onclick="BibliotecaVirtual.noteSelection()">📝 Nota</button>
  <button class="bib-sel-btn green" onmousedown="event.preventDefault()" onclick="BibliotecaVirtual.explainSelection()">🔍 Explicar</button>
</div>

<div class="bib-note-modal-backdrop" id="bib-note-modal-backdrop">
  <div class="bib-note-modal">
    <div class="bib-note-modal-header">
      <div class="bib-note-modal-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        Adicionar Nota
      </div>
      <button class="bib-note-modal-close" onclick="BibliotecaVirtual.closeNoteModal()">✕</button>
    </div>
    <div class="bib-note-modal-selected" id="bib-note-preview"></div>
    <div class="bib-note-modal-label">Sua nota sobre este trecho</div>
    <textarea class="bib-note-modal-textarea" id="bib-note-textarea" placeholder="Escreva sua reflexão, comentário ou resumo..."></textarea>
    <div class="bib-note-modal-footer">
      <button class="bib-note-modal-cancel" onclick="BibliotecaVirtual.closeNoteModal()">Cancelar</button>
      <button class="bib-note-modal-save" onclick="BibliotecaVirtual.saveNoteModal()">Salvar nota</button>
    </div>
  </div>
</div>

<div class="bib-toast" id="bib-toast"></div>
<div class="bib-cinema-enter" id="bib-cinema-enter">
  <div class="bib-cinema-book">
    <div class="bib-cinema-glow"></div>
    <div class="bib-cinema-title" id="bib-cinema-title"></div>
    <div class="bib-cinema-glow"></div>
  </div>
</div>
`;
}

function createParticles() {
  const container = document.getElementById('bib-particles');
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const p = document.createElement('div');
    p.className = 'bib-particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${1 + Math.random() * 2}px;
      height: ${1 + Math.random() * 2}px;
      animation-duration: ${8 + Math.random() * 15}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${0.2 + Math.random() * 0.4};
    `;
    container.appendChild(p);
  }
}

function buildSettingsUI() {
  const themeRow = document.getElementById('bib-theme-row');
  if (themeRow) {
    themeRow.innerHTML = Object.entries(THEMES).map(([key, t]) => `
      <button class="bib-theme-btn ${state.theme === key ? 'active' : ''}"
        onclick="BibliotecaVirtual.setTheme('${key}')"
        style="background:${t.pageBg};color:${t.pageText};border-color:${state.theme===key?'rgba(232,160,74,0.5)':'transparent'}">
        ${t.name}
      </button>
    `).join('');
  }

  const fontRow = document.getElementById('bib-font-row');
  if (fontRow) {
    fontRow.innerHTML = FONTS.map(f => `
      <button class="bib-font-btn ${state.fontFamily === f.name ? 'active' : ''}"
        onclick="BibliotecaVirtual.setFont('${f.name}')"
        style="font-family:'${f.name}',serif">
        ${f.label}
      </button>
    `).join('');
  }
}

function bindEvents() {
  const fileInput = document.getElementById('bib-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      Array.from(e.target.files).forEach(f => loadFile(f));
      e.target.value = '';
    });
  }

  const dropZone = document.getElementById('bib-drop-zone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragging'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragging');
      Array.from(e.dataTransfer.files).forEach(f => loadFile(f));
    });
  }

  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchend', onTouchEnd);

  const flipArea = document.getElementById('bib-flip-area');
  if (flipArea) {
    flipArea.addEventListener('touchstart', (e) => {
      state.dragStart = e.touches[0].clientX;
    }, { passive: true });
    flipArea.addEventListener('touchend', (e) => {
      if (state.dragStart === null) return;
      const dx = e.changedTouches[0].clientX - state.dragStart;
      state.dragStart = null;
      if (Math.abs(dx) > 50) {
        dx < 0 ? nextPage() : prevPage();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('biblioteca-overlay');
    if (!overlay || !overlay.classList.contains('active')) return;
    const readerActive = document.getElementById('bib-reader-screen')?.classList.contains('active');
    if (!readerActive) return;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); nextPage(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); prevPage(); }
    if (e.key === 'Escape') {
      const searchOpen = document.getElementById('bib-search-panel')?.classList.contains('open');
      if (searchOpen) { closeSearchPanel(); return; }
      closeReader();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); toggleSearchPanel(); return; }
    if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.metaKey) toggleSearchPanel();
    if (e.key.toLowerCase() === 'm') toggleBookmark();
    if (e.key.toLowerCase() === 'n') toggleToc();
    if (e.key.toLowerCase() === 's') toggleSettings();
    if (e.key.toLowerCase() === 'd') toggleTwoPageMode();
    if (e.key === '?' || e.key.toLowerCase() === 'h') showShortcutsModal();
  });
}

function onMouseUp(e) {
  const sel = window.getSelection();
  const menu = document.getElementById('bib-selection-menu');
  if (!menu) return;

  
  if (e && e.target && menu.contains(e.target)) return;

  if (!sel || sel.isCollapsed || !sel.toString().trim()) {
    menu.classList.remove('visible');
    return;
  }

  const anchorNode = sel.anchorNode;
  const content = document.getElementById('bib-page-content');
  const secondContent = document.getElementById('bib-page-content-second');
  
  const insideMain = content && content.contains(anchorNode);
  const insideSecond = secondContent && secondContent.contains(anchorNode);

  if (!insideMain && !insideSecond) {
    menu.classList.remove('visible');
    return;
  }

  state._lastSelection = {
    text: sel.toString(),
    pageIdx: insideSecond ? state.currentPage + 1 : state.currentPage
  };

  const readerScreen = document.getElementById('bib-reader-screen');
  if (!readerScreen || !readerScreen.classList.contains('active')) return;
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  menu.classList.add('visible');
 
  requestAnimationFrame(() => {
    const menuW = menu.offsetWidth || 220;
    const menuH = menu.offsetHeight || 44;
    const margin = 8;
    let top = rect.top - menuH - 10;
    let left = rect.left + rect.width / 2 - menuW / 2;
    if (top < margin) top = rect.bottom + 10;
    if (left < margin) left = margin;
    if (left + menuW > window.innerWidth - margin) left = window.innerWidth - menuW - margin;
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';
  });
}

function onTouchEnd(e) {
  setTimeout(() => onMouseUp(e), 50);
}

async function loadFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['pdf', 'epub', 'txt', 'md'].includes(ext)) {
    showToast('Formato não suportado. Use PDF, EPUB, TXT ou MD.');
    return;
  }
  showToast('Carregando livro...');

  const book = {
    id: uid(),
    title: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
    author: 'Autor Desconhecido',
    format: ext,
    currentPage: 0,
    totalPages: 0,
    addedAt: Date.now(),

    emoji: document.getElementById('bib-custom-emoji')?.value || ['📚','📖','📝','🎓','✨','🔬','🌍','🎭'][Math.floor(Math.random() * 8)],
    paletteIdx: Math.floor(Math.random() * COVER_PALETTES.length),
    customColor: document.getElementById('bib-custom-color')?.value || null,
    tags: (document.getElementById('bib-book-tags')?.value || '').split(',').map(t => t.trim()).filter(Boolean),
  };

  if (book.customColor) {
    book.paletteIdx = -1; 
  }

  try {
    if (ext === 'txt' || ext === 'md') {
      const text = await readAsText(file);
      book.content = text;
      book.pages = paginateText(text);
      book.totalPages = book.pages.length;
      book.toc = buildTOC(book.pages);
    } else if (ext === 'pdf') {
      const ab = await readAsArrayBuffer(file);
      const base64 = arrayBufferToBase64(ab);
      book.pdfData = base64;
      book.content = await extractPDFText(ab, book);
      book.pages = paginateText(book.content);
      book.totalPages = book.pages.length;
      book.toc = buildTOC(book.pages);
    } else if (ext === 'epub') {
      const ab = await readAsArrayBuffer(file);
      book.content = await parseEPUB(ab, book);
      book.pages = paginateText(book.content);
      book.totalPages = book.pages.length;
      book.totalWords = book.content.split(/\s+/).filter(Boolean).length;
      book.toc = buildTOC(book.pages);
    }

    state.books.unshift(book);
    localStorage.setItem(`lorac_bib_content_${book.id}`, book.content || '');
    saveState();
    renderShelf();
    showToast(`"${book.title}" adicionado à biblioteca!`);
  } catch(e) {
    console.error(e);
    showToast('Erro ao carregar o livro. Tente novamente.');
  }
}

function readAsText(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsText(file, 'UTF-8');
  });
}

function readAsArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function extractPDFText(arrayBuffer, book) {
  if (!window.pdfjsLib) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    await new Promise(r => { script.onload = r; document.head.appendChild(script); });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }
  const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  const numPages = pdf.numPages;
  for (let i = 1; i <= Math.min(numPages, 300); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(s => s.str).join(' ');
    fullText += pageText + '\n\n';
  }
  if (!fullText.trim()) fullText = `[Documento PDF carregado: ${book.title}]\n\nEste PDF contém ${numPages} páginas. O conteúdo pode ser de natureza visual ou protegido.`;
  return fullText;
}

async function parseEPUB(arrayBuffer, book) {
  if (!window.JSZip) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    await new Promise(r => { script.onload = r; document.head.appendChild(script); });
  }
  const zip = await JSZip.loadAsync(arrayBuffer);
  let text = '';
  const files = Object.keys(zip.files).filter(f => f.endsWith('.html') || f.endsWith('.xhtml') || f.endsWith('.htm'));
  files.sort();
  for (const fname of files.slice(0, 50)) {
    const content = await zip.files[fname].async('string');
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    doc.querySelectorAll('script, style, nav').forEach(e => e.remove());
    text += doc.body ? doc.body.innerText + '\n\n' : '';
  }
  if (text.trim().length < 100) {
    for (const fname of Object.keys(zip.files)) {
      if (fname.endsWith('.opf')) {
        const content = await zip.files[fname].async('string');
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/xml');
        const title = doc.querySelector('title');
        const creator = doc.querySelector('creator');
        if (title) book.title = title.textContent;
        if (creator) book.author = creator.textContent;
      }
    }
  }
  return text || `[EPUB carregado: ${book.title}]`;
}

function paginateText(text) {
  const CHARS_PER_PAGE = 1800;
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim());
  const pages = [];
  let current = '';

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    if (current.length + trimmed.length > CHARS_PER_PAGE && current.length > 0) {
      pages.push(current.trim());
      current = trimmed + '\n\n';
    } else {
      current += trimmed + '\n\n';
    }
  }
  if (current.trim()) pages.push(current.trim());
  if (pages.length === 0) pages.push(text);
  return pages;
}

function buildTOC(pages) {
  const chapters = [];
  const headingRe = /^(#{1,3}\s+.+|[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕ][A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕ\s]{4,})/m;
  for (let i = 0; i < pages.length; i++) {
    const match = pages[i].match(headingRe);
    if (match) {
      chapters.push({ title: match[0].replace(/^#+\s+/, '').trim().substring(0, 60), page: i });
    }
  }
  if (chapters.length === 0) {
    const chunkSize = Math.max(1, Math.floor(pages.length / 10));
    for (let i = 0; i < pages.length; i += chunkSize) {
      chapters.push({ title: `Seção ${Math.floor(i / chunkSize) + 1}`, page: i });
    }
  }
  return chapters;
}

function formatPageHTML(rawText) {
  let html = '';
  const lines = rawText.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('### ')) html += `<h3>${escHtml(t.slice(4))}</h3>`;
    else if (t.startsWith('## ')) html += `<h2>${escHtml(t.slice(3))}</h2>`;
    else if (t.startsWith('# ')) html += `<h1>${escHtml(t.slice(2))}</h1>`;
    else if (/^[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕ][A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕ\s]{4,}$/.test(t)) html += `<h2>${escHtml(t)}</h2>`;
    else html += `<p>${escHtml(t)}</p>`;
  }
  return html || '<p style="color:rgba(0,0,0,0.3);font-style:italic;text-align:center;">Página em branco</p>';
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderShelf() {
  const grid = document.getElementById('bib-books-grid');
  const count = document.getElementById('bib-count');
  const shelfScreen = document.getElementById('bib-shelf-screen');
  if (!grid) return;

  const q = (document.getElementById('bib-search-input')?.value || '').toLowerCase();
  const filtered = q ? state.books.filter(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)) : state.books;

  if (count) count.textContent = `${filtered.length} livro${filtered.length !== 1 ? 's' : ''}`;

  // Render Daily Goal if active
  const existingGoal = document.querySelector('.bib-goal-progress');
  if (existingGoal) existingGoal.remove();
  
  if (state.dailyGoal > 0 && shelfScreen) {
    const goalPct = Math.min(100, Math.round((state.pagesReadToday / state.dailyGoal) * 100));
    const goalHtml = `
      <div class="bib-goal-progress">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <span style="font-size:12px; font-weight:600; color:var(--text-1)">📅 Meta Diária: ${state.pagesReadToday} / ${state.dailyGoal} páginas</span>
          <span style="font-family: 'DM Mono', monospace; font-size:12px; color:var(--accent)">${goalPct}%</span>
        </div>
        <div style="height:6px; background:rgba(255,255,255,0.05); border-radius:10px; overflow:hidden;">
          <div style="height:100%; background:var(--accent); width:${goalPct}%"></div>
        </div>
      </div>
    `;
    document.getElementById('bib-shelf-hero')?.insertAdjacentHTML('afterend', goalHtml);
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="bib-empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <h3>Estante vazia</h3>
        <p>Importe seus livros para começar a ler</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(book => {
    const palette = COVER_PALETTES[book.paletteIdx || 0];
    const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    return `
    <div class="bib-book-card" data-id="${book.id}"
         data-custom-emoji="${book.customEmoji || ''}"
         data-custom-color="${book.customColor || palette?.accent || ''}"
         data-tags="${book.tags?.join(',') || ''}">
      <div class="bib-book-cover-wrap" onclick="BibliotecaVirtual.openBook('${book.id}')">
        <div class="bib-book-cover" style="background:${book.customColor ? 'linear-gradient(135deg, #1a1612 0%, '+book.customColor+'22 100%)' : palette.bg}">
          <div class="bib-book-spine"></div>
          <div class="bib-book-cover-icon">${book.emoji}</div>
          <div class="bib-book-cover-title">${escHtml(book.title)}</div>
          ${book.author !== 'Autor Desconhecido' ? `<div class="bib-book-cover-author">${escHtml(book.author)}</div>` : ''}
          <div class="bib-book-progress-bar">
            <div class="bib-book-progress-fill" style="width:${progress}%; background:${book.customColor || palette.accent}"></div>
          </div>
        </div>
        <div class="bib-book-overlay">
          <button class="bib-book-open-btn">Abrir Livro</button>
          <button class="bib-book-del-btn" onclick="event.stopPropagation();BibliotecaVirtual.deleteBook('${book.id}')">Remover</button>
        </div>
      </div>
      <div class="bib-book-meta">
        <div class="bib-book-name" title="${escHtml(book.title)}">${escHtml(book.title)}</div>
        <div class="bib-book-info">
          <span class="bib-book-pages">${book.totalPages} pág.</span>
          ${progress > 0 ? `<div class="bib-book-progress-dot"></div><span class="bib-book-progress-pct">${progress}%</span>` : ''}
        </div>
        ${book.tags && book.tags.length > 0 ? `
          <div class="bib-book-tags" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 8px; justify-content: center;">
            ${book.tags.map(tag => `<span class="bib-tag">${escHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>`;
  }).join('');
}

function openBook(id) {
  const book = state.books.find(b => b.id === id);
  if (!book) return;
  loadBookContent(book);

  if (!book.pages || book.pages.length === 0) {
    if (book.content) {
      book.pages = paginateText(book.content);
      book.totalPages = book.pages.length;
      book.toc = buildTOC(book.pages);
    }
  }

  state.currentBook = book;
  state.currentPage = book.currentPage || 0;
  state.pages = book.pages || ['Conteúdo não disponível'];
  
  
  const savedScroll = localStorage.getItem(`lorac_bib_scroll_${book.id}_${state.currentPage}`);
  if (savedScroll) {
    setTimeout(() => {
      const content = document.getElementById('bib-page-content');
      if (content) content.scrollTop = parseFloat(savedScroll);
    }, 500);
  }

  const cinemaEl = document.getElementById('bib-cinema-enter');
  const cinemaTitle = document.getElementById('bib-cinema-title');
  if (cinemaEl && cinemaTitle) {
    cinemaTitle.textContent = book.title;
    cinemaEl.classList.add('active');
    
    if (!book.totalWords && book.content) {
      book.totalWords = book.content.split(/\s+/).filter(Boolean).length;
    }
    setTimeout(() => cinemaEl.classList.remove('active'), 1000);
  }

  playPageSound();

  setTimeout(() => {
    document.getElementById('bib-shelf-screen')?.classList.remove('active');
    const readerScreen = document.getElementById('bib-reader-screen');
    if (readerScreen) {
      readerScreen.classList.add('active');
      readerScreen.style.display = 'flex';
    }

    document.getElementById('bib-reader-title').textContent = book.title;
    applyTheme();
    applyFont();
    renderReader();
    if (state.pomodoroInterval) clearInterval(state.pomodoroInterval);
    state.pomodoroInterval = setInterval(updatePomodoroTimer, 1000);
    updateReadingStats();
    highlightSearchResultsOnPage();
    buildTOCPanel();
    buildSettingsUI();
  }, 300);
}

function closeReader() {
  if (state.currentBook) {
    state.currentBook.currentPage = state.currentPage;
    saveState();
    
    
    const content = document.getElementById('bib-page-content');
    if (content) {
      localStorage.setItem(`lorac_bib_scroll_${state.currentBook.id}_${state.currentPage}`, content.scrollTop);
    }
  }
  document.getElementById('bib-reader-screen')?.classList.remove('active');
  document.getElementById('bib-shelf-screen')?.classList.add('active');
  state.currentBook = null;
  stopTTS();
  state.tocOpen = false;
  state.settingsOpen = false;
  state.aiPanelOpen = false;
  document.getElementById('bib-toc-panel')?.classList.remove('open');
  if (state.pomodoroInterval) clearInterval(state.pomodoroInterval);
  state.pomodoroInterval = null;
  document.getElementById('bib-settings-panel')?.classList.remove('open');
  const aiPanel = document.getElementById('bib-ai-panel');
  if (aiPanel) { aiPanel.style.display = 'none'; }
  renderShelf();
}

function renderReader() {
  if (!state.currentBook || !state.pages.length) return;

  const theme = THEMES[state.theme];
  const page = document.getElementById('bib-page-main');
  const content = document.getElementById('bib-page-content');
  const indicator = document.getElementById('bib-page-indicator');
  const progressBar = document.getElementById('bib-progress-bar');
  const footNum = document.getElementById('bib-page-foot-num');
  const footChapter = document.getElementById('bib-page-foot-chapter');
  const timeLeft = document.getElementById('bib-page-time-left');
  const chapterEl = document.getElementById('bib-reader-chapter');
  const container = document.getElementById('bib-page-container');
  const secondInner = document.getElementById('bib-page-second-inner');

  if (!page || !content) return;

  page.style.setProperty('--page-bg', theme.pageBg);
  page.style.setProperty('--page-text', theme.pageText);
  page.style.setProperty('--page-heading', theme.pageHeading);

 
  container.classList.toggle('two-page', state.twoPageMode);

  
  const firstInner = content.closest('.bib-page-inner');
  if (firstInner) {
    firstInner.style.flex = '1';
    firstInner.style.minWidth = '0';
    firstInner.style.overflow = 'hidden';
  }

  const pageText = state.pages[state.currentPage] || '';
  content.innerHTML = applyHighlights(formatPageHTML(pageText), state.currentPage);
  content.style.fontSize = state.fontSize + 'px';
  content.style.fontFamily = `'${state.fontFamily}', Georgia, serif`;
  content.style.lineHeight = state.lineHeight;
  content.style.color = theme.pageText;

  if (state.twoPageMode && state.currentPage + 1 < state.pages.length) {
    secondInner.style.display = 'flex';
    secondInner.style.flex = '1';
    secondInner.style.minWidth = '0';
    secondInner.style.overflow = 'hidden';
    const secondContent = document.getElementById('bib-page-content-second');
    const secondText = state.pages[state.currentPage + 1] || '';
    secondContent.innerHTML = applyHighlights(formatPageHTML(secondText), state.currentPage + 1);
    secondContent.style.fontSize = state.fontSize + 'px';
    secondContent.style.fontFamily = `'${state.fontFamily}', Georgia, serif`;
    secondContent.style.lineHeight = state.lineHeight;
    secondContent.style.color = theme.pageText;
  } else {
    secondInner.style.display = 'none';
  }

  const savedScroll = localStorage.getItem(`lorac_bib_scroll_${state.currentBook.id}_${state.currentPage}`);
  if (savedScroll) content.scrollTop = parseFloat(savedScroll);
  else content.scrollTop = 0;

  const total = state.pages.length;
  const cur = state.currentPage + 1;
  if (indicator) indicator.textContent = `${cur} / ${total}`;
  if (progressBar) progressBar.style.width = ((state.currentPage / Math.max(1, total - 1)) * 100) + '%';
  if (footNum) {
    footNum.textContent = (state.twoPageMode && cur < total) ? `${cur}-${cur+1}` : cur;
  }

  const chapterTitle = getCurrentChapter();
  if (chapterEl) chapterEl.textContent = chapterTitle;
  if (footChapter) footChapter.textContent = chapterTitle;

  const pagesLeft = total - cur;
  const minsLeft = Math.ceil(pagesLeft * 1.5);
  if (timeLeft) timeLeft.textContent = minsLeft > 1 ? `~${minsLeft} min restantes` : 'Última página';

  const prevBtn = document.getElementById('bib-btn-prev');
  const nextBtn = document.getElementById('bib-btn-next');
  if (prevBtn) prevBtn.disabled = state.currentPage === 0;
  if (nextBtn) nextBtn.disabled = state.currentPage >= total - 1;

  const bId = state.currentBook?.id;
  const bookmarks = state.bookmarks[bId] || [];
  const bmBtn = document.getElementById('bib-bookmark-btn');
  if (bmBtn) {
    const isBookmarked = bookmarks.includes(state.currentPage);
    bmBtn.style.color = isBookmarked ? '#e8a04a' : '';
    bmBtn.style.borderColor = isBookmarked ? 'rgba(232,160,74,0.3)' : '';
  }

  
  if (document.getElementById('bib-search-panel')?.classList.contains('open') && searchState.query) {
    setTimeout(() => highlightSearchResultsOnPage(), 60);
  }
}

function getCurrentChapter() {
  if (!state.currentBook?.toc?.length) return '';
  let chapter = state.currentBook.toc[0].title;
  for (const c of state.currentBook.toc) {
    if (c.page <= state.currentPage) chapter = c.title;
    else break;
  }
  return chapter;
}

function applyHighlights(html, pageIdx) {
  const bId = state.currentBook?.id;
  if (!bId) return html;
  const hl = (state.highlights[bId] || {})[pageIdx] || [];
  let result = html;
  for (const h of hl) {
    const escaped = escHtml(h.text);
    const hasNote = h.note && h.note.trim().length > 0;
    const noteAttr = hasNote ? ` title="${escHtml(h.note)}"` : '';
    const noteClass = hasNote ? ' has-note' : '';
    result = result.replace(
      new RegExp(escaped.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      `<span class="highlight${noteClass}"${noteAttr}>${escaped}</span>`
    );
  }
  return result;
}

function animatePage(direction) {
  if (state.isAnimating) return false;
  state.isAnimating = true;
  const page = document.getElementById('bib-page-main');
  if (!page) { state.isAnimating = false; return false; }

  const animClass = direction === 'next' ? 'flip-out' : 'flip-out-prev';
  const inAnimClass = direction === 'next' ? 'flip-in' : 'flip-in-prev';

  page.classList.add(animClass);
  playPageSound();

  setTimeout(() => {
    page.classList.remove(animClass);
    if (direction === 'next') {
      const step = state.twoPageMode ? 2 : 1;
      if (state.currentPage + step < state.pages.length) {
        state.currentPage += step;
        state.pagesReadToday += step;
      }
    } else {
      if (state.currentPage > 0) state.currentPage--;
    }
    renderReader();
    page.classList.add(inAnimClass);
    setTimeout(() => {
      page.classList.remove(inAnimClass);
      state.isAnimating = false;
      if (state.currentBook) {
        if (state.lastReadDate !== new Date().toDateString()) {
          state.lastReadDate = new Date().toDateString();
        }
        state.currentBook.currentPage = state.currentPage;
        saveState();
      }
    }, 650);
  }, 325);
  return true;
}

function nextPage() {
  if (state.currentPage >= state.pages.length - 1) return;
  if (state.twoPageMode && state.currentPage >= state.pages.length - 2) return;
  animatePage('next');
}

function prevPage() {
  if (state.currentPage <= 0) return;
  const step = state.twoPageMode ? 2 : 1;
  state.currentPage = Math.max(0, state.currentPage - step);
  renderReader();
  playPageSound();
}

function toggleTwoPageMode() {
  state.twoPageMode = !state.twoPageMode;
  document.getElementById('bib-twopage-btn')?.classList.toggle('active', state.twoPageMode);
  renderReader();
  saveState();
}

function playPageSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch(e) {}
}

function applyTheme() {
  const theme = THEMES[state.theme];
  const page = document.getElementById('bib-page-main');
  if (!page || !theme) return;
  page.style.setProperty('--page-bg', theme.pageBg);
  page.style.setProperty('--page-text', theme.pageText);
  page.style.setProperty('--page-heading', theme.pageHeading);
  page.style.background = theme.pageBg;
}

function applyFont() {
  const content = document.getElementById('bib-page-content');
  if (content) content.style.fontFamily = `'${state.fontFamily}', Georgia, serif`;
}


function buildTOCPanel() {
  const list = document.getElementById('bib-toc-list');
  if (!list || !state.currentBook?.toc) return;
  list.innerHTML = state.currentBook.toc.map((ch, i) => `
    <div class="bib-toc-item ${ch.page === state.currentPage ? 'active' : ''}"
      onclick="BibliotecaVirtual.goToPage(${ch.page})">
      <span class="bib-toc-num">${String(i + 1).padStart(2, '0')}</span>
      <span>${escHtml(ch.title)}</span>
    </div>
  `).join('');
}

function goToPage(page) {
  if (page < 0 || page >= state.pages.length) return;
  state.currentPage = page;
  if (state.currentBook) state.currentBook.currentPage = page;
  renderReader();
  buildTOCPanel();
  saveState();
  toggleToc();
}

function toggleToc() {
  state.tocOpen = !state.tocOpen;
  document.getElementById('bib-toc-panel')?.classList.toggle('open', state.tocOpen);
  document.getElementById('bib-toc-btn')?.classList.toggle('active', state.tocOpen);
}

function toggleSettings() {
  state.settingsOpen = !state.settingsOpen;
  document.getElementById('bib-settings-panel')?.classList.toggle('open', state.settingsOpen);
  document.getElementById('bib-settings-btn')?.classList.toggle('active', state.settingsOpen);
}

function toggleAI() {
  state.aiPanelOpen = !state.aiPanelOpen;
  const panel = document.getElementById('bib-ai-panel');
  if (!panel) return;
  if (state.aiPanelOpen) {
    panel.style.display = 'flex';
    requestAnimationFrame(() => panel.classList.add('open'));
  } else {
    panel.classList.remove('open');
    setTimeout(() => { panel.style.display = 'none'; }, 350);
  }
  document.getElementById('bib-ai-toggle')?.classList.toggle('active', state.aiPanelOpen);
}

function toggleBookmark() {
  if (!state.currentBook) return;
  const bId = state.currentBook.id;
  if (!state.bookmarks[bId]) state.bookmarks[bId] = [];
  const idx = state.bookmarks[bId].indexOf(state.currentPage);
  if (idx === -1) {
    state.bookmarks[bId].push(state.currentPage);
    showToast('Marcador adicionado');
  } else {
    state.bookmarks[bId].splice(idx, 1);
    showToast('Marcador removido');
  }
  saveState();
  renderReader();
}

function toggleHighlightsPanel() {
  state.highlightsPanelOpen = !state.highlightsPanelOpen;
  document.getElementById('bib-highlights-panel')?.classList.toggle('open', state.highlightsPanelOpen);
  if (state.highlightsPanelOpen) renderHighlightsPanel();
}

function renderHighlightsPanel() {
  const container = document.getElementById('bib-highlight-items');
  if (!container || !state.currentBook) return;
  const bId = state.currentBook.id;
  const all = state.highlights[bId] || {};
  const items = Object.entries(all).flatMap(([pg, hl]) => hl.map(h => ({ ...h, page: parseInt(pg) })));
  if (!items.length) {
    container.innerHTML = '<p style="color:rgba(122,110,101,0.5);font-size:12px;font-style:italic">Nenhuma marcação ainda</p>';
    return;
  }
  container.innerHTML = items.map(h => `
    <div class="bib-highlight-item" onclick="BibliotecaVirtual.goToPage(${h.page});BibliotecaVirtual.toggleHighlightsPanel()">
      <div style="flex:1;min-width:0">
        <span class="bib-hi-text">"${escHtml(h.text.substring(0, 120))}${h.text.length > 120 ? '...' : ''}"</span>
        ${h.note ? `<div style="margin-top:5px;font-size:11px;color:rgba(184,168,154,0.6);font-family:'DM Sans',sans-serif;font-style:normal;line-height:1.4">📝 ${escHtml(h.note)}</div>` : ''}
      </div>
      <span class="bib-hi-page">p.${h.page + 1}</span>
    </div>
  `).join('');
}

function highlightSelection() {
  const selection = state._lastSelection;
  if (!selection || !selection.text.trim() || !state.currentBook) return;
  
  const text = selection.text.trim();
  const pageIdx = selection.pageIdx;
  const bId = state.currentBook.id;
  
  if (!state.highlights[bId]) state.highlights[bId] = {};
  if (!state.highlights[bId][pageIdx]) state.highlights[bId][pageIdx] = [];
  state.highlights[bId][pageIdx].push({ text, note: '', at: Date.now() });
  
  window.getSelection()?.removeAllRanges();
  document.getElementById('bib-selection-menu')?.classList.remove('visible');
  saveState();
  renderReader();
  showToast('Texto grifado');
}

function noteSelection() {
  const selection = state._lastSelection;
  if (!selection || !selection.text.trim()) return;
  const text = selection.text.trim();
  document.getElementById('bib-selection-menu')?.classList.remove('visible');
  
  
  state._pendingNoteText = text;
  state._pendingNoteSelection = selection.text;
  state._pendingNotePageIdx = selection.pageIdx;
  
  
  const preview = document.getElementById('bib-note-preview');
  const textarea = document.getElementById('bib-note-textarea');
  const backdrop = document.getElementById('bib-note-modal-backdrop');
  
  if (preview) preview.textContent = `"${text.substring(0, 200)}${text.length > 200 ? '...' : ''}"`;
  if (textarea) { textarea.value = ''; }
  if (backdrop) {
    backdrop.classList.add('open');
    setTimeout(() => textarea?.focus(), 300);
  }
  window.getSelection()?.removeAllRanges();
}

function closeNoteModal() {
  const backdrop = document.getElementById('bib-note-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
  state._pendingNoteText = null;
}

function saveNoteModal() {
  const textarea = document.getElementById('bib-note-textarea');
  const note = textarea?.value?.trim() || '';
  const text = state._pendingNoteText;
  if (!text) { closeNoteModal(); return; }
  
  const bId = state.currentBook?.id;
  if (!bId) { closeNoteModal(); return; }
  const pageIdx = state._pendingNotePageIdx;
  if (!state.highlights[bId]) state.highlights[bId] = {};
  if (!state.highlights[bId][pageIdx]) state.highlights[bId][pageIdx] = [];
  state.highlights[bId][pageIdx].push({ text, note, at: Date.now() });
  closeNoteModal();
  saveState();
  renderReader();
  showToast(note ? 'Nota adicionada ✓' : 'Texto grifado ✓');
}

function explainSelection() {
  const selection = state._lastSelection;
  if (!selection || !selection.text.trim()) return;
  const text = selection.text.trim();
  window.getSelection()?.removeAllRanges();
  document.getElementById('bib-selection-menu')?.classList.remove('visible');
  if (!state.aiPanelOpen) toggleAI();
  callAI(`Explique de forma clara e didática o seguinte trecho:\n\n"${text}"`);
}

function exportHighlights(format = 'md') {
  if (!state.currentBook) return;
  const bId = state.currentBook.id;
  const bookHl = state.highlights[bId] || {};
  
  let content = `# Notas e Grifos: ${state.currentBook.title}\n\n`;
  
  const sortedPages = Object.keys(bookHl).sort((a, b) => parseInt(a) - parseInt(b));
  
  sortedPages.forEach(pageIdx => {
    content += `## Página ${parseInt(pageIdx) + 1}\n\n`;
    bookHl[pageIdx].forEach(h => {
      content += `> ${h.text}\n\n`;
      if (h.note) content += `**Nota:** ${h.note}\n\n`;
      content += `---\n\n`;
    });
  });
  
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.currentBook.title.replace(/\s+/g, '_')}_notas.${format}`;
  a.click();
  showToast('Exportação concluída');
}

function showShortcutsModal() {
  const html = `
    <h2 class="modal-title">⌨️ Atalhos de Teclado</h2>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:15px;">
      <div class="shortcut-item"><span>→</span> Avançar Página</div>
      <div class="shortcut-item"><span>←</span> Voltar Página</div>
      <div class="shortcut-item"><span>M</span> Marcar Favorito</div>
      <div class="shortcut-item"><span>N</span> Abrir Índice</div>
      <div class="shortcut-item"><span>S</span> Aparência</div>
      <div class="shortcut-item"><span>D</span> Modo 2 Páginas</div>
      <div class="shortcut-item"><span>ESC</span> Sair do Leitor</div>
    </div>
    <style>
      .shortcut-item { display:flex; align-items:center; gap:10px; color:var(--text-1); font-size:13px; }
      .shortcut-item span { background:var(--bg-3); border:1px solid var(--border); padding:2px 6px; border-radius:4px; font-family:monospace; min-width:24px; text-align:center; color:var(--accent); }
    </style>
  `;
  const app = window.App || (typeof App !== 'undefined' ? App : null);
  if (app && typeof app.openModal === 'function') {
    app.openModal(html);
  } else {
    console.warn("App.openModal não disponível. Usando fallback de alerta.");
   
    alert("Atalhos de Teclado:\n→ Avançar Página\n← Voltar Página\nM Marcar Favorito\nN Abrir Índice\nS Aparência\nD Modo 2 Páginas\nESC Sair do Leitor");
  }
}

function setDailyGoal(val) {
  state.dailyGoal = parseInt(val) || 0;
  saveState();
  renderShelf();
}

async function aiAction(action) {
  const pageText = state.pages[state.currentPage] || '';
  const bookTitle = state.currentBook?.title || 'livro';
  let prompt = '';
  switch(action) {
    case 'summarize':
      prompt = `Faça um resumo conciso e claro desta página do livro "${bookTitle}":\n\n${pageText.substring(0, 2000)}`;
      break;
    case 'explain':
      prompt = `Explique de forma didática os conceitos principais desta página do livro "${bookTitle}":\n\n${pageText.substring(0, 2000)}`;
      break;
    case 'flashcards':
      prompt = `Crie 5 flashcards de estudo (pergunta e resposta) com base nesta página do livro "${bookTitle}":\n\n${pageText.substring(0, 2000)}\n\nFormato: Q: [pergunta] | R: [resposta]`;
      break;
    case 'quiz':
      prompt = `Crie um quiz de 4 questões de múltipla escolha com base nesta página do livro "${bookTitle}":\n\n${pageText.substring(0, 2000)}`;
      break;
    case 'highlights':
      prompt = `Liste os 5 pontos mais importantes desta página do livro "${bookTitle}" de forma clara e objetiva:\n\n${pageText.substring(0, 2000)}`;
      break;
  }
  await callAI(prompt);
}

async function callAI(prompt) {
  const responseEl = document.getElementById('bib-ai-response');
  if (!responseEl) return;
  responseEl.innerHTML = `<div class="bib-ai-thinking">
    <div class="bib-ai-dot"></div>
    <div class="bib-ai-dot"></div>
    <div class="bib-ai-dot"></div>
    <span style="margin-left:4px">Analisando...</span>
  </div>`;
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: prompt,
        context: 'Você é um assistente educacional especializado em leitura e estudo. Seja conciso, claro e pedagógico. Responda sempre em português.'
      })
    });
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    const text = data.response || '';
    responseEl.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
  } catch(e) {
    responseEl.innerHTML = '<p style="color:rgba(201,106,74,0.8);font-size:12px">Erro ao conectar com a IA. Verifique sua conexão.</p>';
  }
}

function changeFontSize(delta) {
  state.fontSize = Math.min(24, Math.max(12, state.fontSize + delta));
  const val = document.getElementById('bib-font-size-val');
  if (val) val.textContent = state.fontSize + 'px';
  const content = document.getElementById('bib-page-content');
  if (content) content.style.fontSize = state.fontSize + 'px';
  saveState();
}

function setTheme(theme) {
  state.theme = theme;
  applyTheme();
  buildSettingsUI();
  renderReader();
  saveState();
}

function setFont(font) {
  state.fontFamily = font;
  applyFont();
  buildSettingsUI();
  renderReader();
  saveState();
}

function changeLineHeight(val) {
  state.lineHeight = parseFloat(val);
  const content = document.getElementById('bib-page-content');
  if (content) content.style.lineHeight = state.lineHeight;
  const lhVal = document.getElementById('bib-lh-val');
  if (lhVal) lhVal.textContent = state.lineHeight.toFixed(1) + '×';
}

function changeBrightness(val) {
  state.brightness = parseInt(val);
  const page = document.getElementById('bib-page-main');
  if (page) page.style.filter = `brightness(${state.brightness}%)`;
  saveState();
}

function deleteBook(id) {
  if (!confirm('Remover este livro da biblioteca?')) return;
  state.books = state.books.filter(b => b.id !== id);
  localStorage.removeItem(`lorac_bib_content_${id}`);
  localStorage.removeItem(`lorac_bib_pdf_${id}`);
  delete state.highlights[id];
  delete state.bookmarks[id];
  saveState();
  renderShelf();
  showToast('Livro removido');
}

function filterBooks(query) {
  renderShelf();
}

function switchTab(tab) {
  document.querySelectorAll('.bib-tab').forEach((t, i) => {
    t.classList.toggle('active', ['shelf','recent','highlights'][i] === tab);
  });
  const shelf = document.getElementById('bib-shelf-screen');
  if (!shelf) return;

  if (tab === 'shelf') {
    const drop = document.getElementById('bib-drop-section');
    const booksSection = document.getElementById('bib-books-section');
    if (drop) drop.style.display = '';
    if (booksSection) booksSection.style.display = '';
    renderShelf();
  } else if (tab === 'recent') {
    renderRecentTab();
  } else if (tab === 'highlights') {
    renderHighlightsTab();
  }
}

function renderRecentTab() {
  const shelf = document.getElementById('bib-shelf-screen');
  if (!shelf) return;
  const sorted = [...state.books].sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0)).slice(0, 12);
  const grid = document.getElementById('bib-books-grid');
  const drop = document.getElementById('bib-drop-section');
  if (drop) drop.style.display = 'none';
  const countEl = document.getElementById('bib-count');
  if (countEl) countEl.textContent = `${sorted.length} recentes`;
  if (!grid) return;
  if (sorted.length === 0) {
    grid.innerHTML = `<div class="bib-empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      <h3>Nenhuma leitura recente</h3><p>Seus livros recentes aparecerão aqui</p></div>`;
    return;
  }
  grid.innerHTML = sorted.map(book => {
    const palette = COVER_PALETTES[book.paletteIdx || 0];
    const progress = book.totalPages > 0 ? Math.round((book.currentPage / book.totalPages) * 100) : 0;
    const date = book.addedAt ? new Date(book.addedAt).toLocaleDateString('pt-BR') : '';
    return `<div class="bib-book-card" data-id="${book.id}">
      <div class="bib-book-cover-wrap" onclick="BibliotecaVirtual.openBook('${book.id}')">
        <div class="bib-book-cover" style="background:${palette.bg}">
          <div class="bib-book-spine"></div>
          <div class="bib-book-cover-icon">${book.emoji}</div>
          <div class="bib-book-cover-title">${escHtml(book.title)}</div>
          <div class="bib-book-progress-bar"><div class="bib-book-progress-fill" style="width:${progress}%"></div></div>
        </div>
        <div class="bib-book-overlay">
          <button class="bib-book-open-btn">Continuar Lendo</button>
          <span style="font-size:10px;color:rgba(184,168,154,0.5);font-family:'DM Mono',monospace">${date}</span>
        </div>
      </div>
      <div class="bib-book-meta">
        <div class="bib-book-name" title="${escHtml(book.title)}">${escHtml(book.title)}</div>
        <div class="bib-book-info">
          <span class="bib-book-pages">${progress}% lido</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderHighlightsTab() {
  const shelf = document.getElementById('bib-shelf-screen');
  if (!shelf) return;
  const drop = document.getElementById('bib-drop-section');
  if (drop) drop.style.display = 'none';
  const countEl = document.getElementById('bib-count');

  const allHighlights = [];
  for (const [bookId, pages] of Object.entries(state.highlights)) {
    const book = state.books.find(b => b.id === bookId);
    if (!book) continue;
    for (const [pageIdx, items] of Object.entries(pages)) {
      for (const h of items) {
        allHighlights.push({ ...h, bookId, bookTitle: book.title, bookEmoji: book.emoji, page: parseInt(pageIdx), palette: COVER_PALETTES[book.paletteIdx || 0] });
      }
    }
  }
  allHighlights.sort((a, b) => (b.at || 0) - (a.at || 0));

  if (countEl) countEl.textContent = `${allHighlights.length} marcações`;
  const grid = document.getElementById('bib-books-grid');
  if (!grid) return;

  if (!allHighlights.length) {
    grid.innerHTML = `<div class="bib-empty-state" style="grid-column:1/-1">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <h3>Nenhuma marcação</h3><p>Selecione texto durante a leitura para grifar</p></div>`;
    return;
  }

  grid.innerHTML = `<div style="grid-column:1/-1;display:flex;flex-direction:column;gap:10px">
    ${allHighlights.map(h => `
      <div style="background:rgba(232,160,74,0.05);border:1px solid rgba(232,160,74,0.1);border-radius:12px;padding:14px 16px;cursor:pointer;transition:all 0.2s ease;display:flex;gap:14px;align-items:flex-start"
        onclick="BibliotecaVirtual.openBook('${h.bookId}');setTimeout(()=>BibliotecaVirtual.goToPageDirect(${h.page}),400)"
        onmouseover="this.style.background='rgba(232,160,74,0.09)'" onmouseout="this.style.background='rgba(232,160,74,0.05)'">
        <div style="font-size:22px;flex-shrink:0;margin-top:2px">${h.bookEmoji}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Crimson Pro',Georgia,serif;font-style:italic;font-size:15px;color:rgba(240,232,222,0.85);line-height:1.5;margin-bottom:6px">
            "${escHtml((h.text||'').substring(0,200))}${(h.text||'').length>200?'…':''}"
          </div>
          ${h.note ? `<div style="font-size:11px;color:rgba(184,168,154,0.5);font-weight:300;margin-bottom:4px">📝 ${escHtml(h.note)}</div>` : ''}
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:11px;color:rgba(232,160,74,0.6);font-family:'DM Mono',monospace">${escHtml(h.bookTitle)}</span>
            <span style="font-size:10px;color:rgba(122,110,101,0.5);font-family:'DM Mono',monospace">p.${h.page+1}</span>
          </div>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function showToast(msg) {
  const toast = document.getElementById('bib-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2800);
}

function open() {
  loadState();
  injectStyles();
  createOverlay();
  renderShelf();
  buildSettingsUI();
  const overlay = document.getElementById('biblioteca-overlay');
  if (!overlay) return;
  overlay.classList.add('visible');
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('active')));
  document.getElementById('bib-shelf-screen')?.classList.add('active');
  document.getElementById('bib-reader-screen')?.classList.remove('active');
}

function goToPageDirect(page) {
  if (page < 0 || page >= state.pages.length) return;
  state.currentPage = page;
  if (state.currentBook) state.currentBook.currentPage = page;
  highlightSearchResultsOnPage();
  renderReader();
  buildTOCPanel();
  saveState();
}

function close() {
  if (state.currentBook) {
    state.currentBook.currentPage = state.currentPage;
    saveState();
  }
  const overlay = document.getElementById('biblioteca-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
  setTimeout(() => overlay.classList.remove('visible'), 600);
}

function toggleFocusMode() {
  const overlay = document.getElementById('biblioteca-overlay');
  if (!overlay) return;
  const isActive = overlay.classList.toggle('bib-focus-mode');
  const btn = document.getElementById('bib-focus-mode-btn');
  if (btn) {
    btn.title = isActive ? 'Sair do modo foco' : 'Modo foco';
    btn.style.color = isActive ? '#e8a04a' : '';
  }
}


const searchState = {
  query: '',
  results: [],     
  current: -1,     
};

function toggleSearchPanel() {
  const panel = document.getElementById('bib-search-panel');
  const btn   = document.getElementById('bib-search-global-btn');
  if (!panel) return;
  const isOpen = panel.classList.toggle('open');
  btn && btn.classList.toggle('active', isOpen);
  if (isOpen) {
    setTimeout(() => document.getElementById('bib-search-global-input')?.focus(), 80);
  } else {
    clearSearchHighlights();
    searchState.query = '';
    searchState.results = [];
    searchState.current = -1;
  }
}

function closeSearchPanel() {
  const panel = document.getElementById('bib-search-panel');
  const btn   = document.getElementById('bib-search-global-btn');
  panel?.classList.remove('open');
  btn?.classList.remove('active');
  clearSearchHighlights();
  searchState.query = '';
  searchState.results = [];
  searchState.current = -1;
}

function runSearch(query) {
  searchState.query = query.trim();
  searchState.results = [];
  searchState.current = -1;

  const statsEl   = document.getElementById('bib-search-stats');
  const resultsEl = document.getElementById('bib-search-results');
  const prevBtn   = document.getElementById('bib-search-prev-btn');
  const nextBtn   = document.getElementById('bib-search-next-btn');

  if (!searchState.query || searchState.query.length < 2) {
    if (statsEl)   { statsEl.textContent = ''; statsEl.className = 'bib-search-stats'; }
    if (resultsEl)  resultsEl.innerHTML = '';
    if (prevBtn)    prevBtn.disabled = true;
    if (nextBtn)    nextBtn.disabled = true;
    clearSearchHighlights();
    return;
  }

  const q = searchState.query.toLowerCase();

  (state.pages || []).forEach((pageText, pageIdx) => {
    const text = typeof pageText === 'string' ? pageText : (pageText.text || '');
    const lower = text.toLowerCase();
    let pos = 0;
    while (true) {
      const found = lower.indexOf(q, pos);
      if (found === -1) break;
      
      const start   = Math.max(0, found - 40);
      const end     = Math.min(text.length, found + q.length + 40);
      const before  = (start > 0 ? '…' : '') + escHtml(text.slice(start, found));
      const match   = escHtml(text.slice(found, found + q.length));
      const after   = escHtml(text.slice(found + q.length, end)) + (end < text.length ? '…' : '');
      searchState.results.push({
        pageIdx,
        matchIdx: searchState.results.length,
        contextText: before + '<mark>' + match + '</mark>' + after,
      });
      pos = found + q.length;
    }
  });

  const total = searchState.results.length;

  if (statsEl) {
    statsEl.textContent = total === 0 ? 'sem resultados' : `${total} resultado${total !== 1 ? 's' : ''}`;
    statsEl.className = 'bib-search-stats' + (total > 0 ? ' has-results' : '');
  }

  if (prevBtn) prevBtn.disabled = total === 0;
  if (nextBtn) nextBtn.disabled = total === 0;

  if (!resultsEl) return;

  if (total === 0) {
    resultsEl.innerHTML = `<div class="bib-search-empty">Nenhuma ocorrência encontrada</div>`;
    clearSearchHighlights();
    return;
  }

  
  const byPage = {};
  searchState.results.forEach(r => {
    if (!byPage[r.pageIdx]) byPage[r.pageIdx] = [];
    byPage[r.pageIdx].push(r);
  });

  resultsEl.innerHTML = Object.entries(byPage).map(([pageIdx, hits]) => {
    return hits.map((r, i) => `
      <div class="bib-search-result-item" data-match="${r.matchIdx}" onclick="BibliotecaVirtual.jumpToResult(${r.matchIdx})">
        <div class="bib-search-result-page">Página ${parseInt(pageIdx) + 1}</div>
        <div class="bib-search-result-preview">${r.contextText}</div>
      </div>
    `).join('');
  }).join('');

 
  if (total > 0) jumpToResult(0);
}

function jumpToResult(matchIdx) {
  if (!searchState.results.length) return;
  searchState.current = matchIdx;

  const r = searchState.results[matchIdx];
  if (r === undefined) return;


  document.querySelectorAll('.bib-search-result-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.dataset.match) === matchIdx);
  });
  
  const activeItem = document.querySelector(`.bib-search-result-item[data-match="${matchIdx}"]`);
  activeItem?.scrollIntoView({ block: 'nearest' });

 
  const statsEl = document.getElementById('bib-search-stats');
  if (statsEl) {
    statsEl.textContent = `${matchIdx + 1} / ${searchState.results.length}`;
    statsEl.className = 'bib-search-stats has-results';
  }

  
  goToPage(r.pageIdx);

  
  setTimeout(() => highlightSearchResultsOnPage(), 80);
}

function searchNav(dir) {
  const total = searchState.results.length;
  if (total === 0) return;
  const next = ((searchState.current + dir) + total) % total;
  jumpToResult(next);
}

function searchKeyNav(e) {
  if (e.key === 'Enter') {
    e.shiftKey ? searchNav(-1) : searchNav(1);
  } else if (e.key === 'Escape') {
    closeSearchPanel();
  }
}

function highlightSearchResultsOnPage() {
  const contentEl = document.getElementById('bib-page-content');
  if (!contentEl || !searchState.query) return;

  const q = searchState.query;
  const qLower = q.toLowerCase();
  const currentResult = searchState.results[searchState.current];

  
  function walkAndHighlight(node, isCurrent) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const lower = text.toLowerCase();
      const idx = lower.indexOf(qLower);
      if (idx === -1) return null;

      const frag = document.createDocumentFragment();
      let pos = 0;
      let occurrenceCount = 0;
      while (true) {
        const found = lower.indexOf(qLower, pos);
        if (found === -1) break;
        if (found > pos) frag.appendChild(document.createTextNode(text.slice(pos, found)));
        const mark = document.createElement('mark');
        mark.className = 'bib-hl';
        mark.textContent = text.slice(found, found + q.length);
        frag.appendChild(mark);
        pos = found + q.length;
        occurrenceCount++;
      }
      if (pos < text.length) frag.appendChild(document.createTextNode(text.slice(pos)));
      return frag;
    }
    if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'MARK') {
      const children = Array.from(node.childNodes);
      children.forEach(child => {
        const replacement = walkAndHighlight(child, isCurrent);
        if (replacement) node.replaceChild(replacement, child);
      });
    }
    return null;
  }

  
  clearSearchHighlights();

  walkAndHighlight(contentEl, true);

 
  if (currentResult && currentResult.pageIdx === state.currentPage) {
    const allMarks = contentEl.querySelectorAll('mark.bib-hl');
    
    let occurrenceOnPage = 0;
    for (let i = 0; i < searchState.current; i++) {
      if (searchState.results[i].pageIdx === state.currentPage) occurrenceOnPage++;
    }
    if (allMarks[occurrenceOnPage]) {
      allMarks[occurrenceOnPage].classList.add('bib-hl-current');
      allMarks[occurrenceOnPage].scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
}

function clearSearchHighlights() {
  const contentEl = document.getElementById('bib-page-content');
  if (!contentEl) return;
  contentEl.querySelectorAll('mark.bib-hl').forEach(mark => {
    const parent = mark.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(mark.textContent), mark);
      parent.normalize();
    }
  });
}


function searchInBook(query) { runSearch(query); }



const TIMER_CIRCUMFERENCE = 263.9; // 2π × 42

function toggleTimerPanel() {
  state.timerPanelOpen = !state.timerPanelOpen;
  const panel = document.getElementById('bib-timer-panel');
  const btn   = document.getElementById('bib-timer-btn');
  if (!panel) return;
  if (state.timerPanelOpen) {
    panel.classList.add('open');
    btn?.classList.add('active');
  
    if (state.timerRunning || state.timerPaused) {
      document.getElementById('bib-timer-ring-wrap').style.display = 'flex';
    }
  } else {
    panel.classList.remove('open');
    if (!state.timerRunning && !state.timerPaused) btn?.classList.remove('active');
  }
 
  setTimeout(() => {
    if (state.timerPanelOpen) {
      document.addEventListener('click', timerPanelOutsideClick, { once: true });
    }
  }, 10);
}

function timerPanelOutsideClick(e) {
  const panel = document.getElementById('bib-timer-panel');
  const btn   = document.getElementById('bib-timer-btn');
  if (panel && !panel.contains(e.target) && !btn?.contains(e.target)) {
    panel.classList.remove('open');
    state.timerPanelOpen = false;
    if (!state.timerRunning && !state.timerPaused) btn?.classList.remove('active');
  }
}

function setTimerPreset(minutes) {
  if (state.timerRunning) return; // don't change while running
  state.timerDurationSec = minutes * 60;
  state.timerRemainingSecAtStart = state.timerDurationSec;
  const custom = document.getElementById('bib-timer-custom');
  if (custom) custom.value = minutes;
 
  document.querySelectorAll('.bib-timer-preset').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.textContent) === minutes);
  });
  updateTimerDisplay(state.timerDurationSec, state.timerDurationSec);
}

function setTimerCustom(val) {
  const minutes = Math.max(1, Math.min(120, parseInt(val) || 1));
  state.timerDurationSec = minutes * 60;
  state.timerRemainingSecAtStart = state.timerDurationSec;
  
  document.querySelectorAll('.bib-timer-preset').forEach(btn => btn.classList.remove('active'));
  updateTimerDisplay(state.timerDurationSec, state.timerDurationSec);
}

function startTimer() {
  if (state.timerRunning) return;
  if (state.timerPaused) {
    
    state.timerRunning = true;
    state.timerPaused = false;
    runTimerTick();
    updateTimerButtons();
    document.getElementById('bib-timer-btn')?.classList.add('active');
    document.getElementById('bib-timer-btn')?.classList.remove('paused');
    return;
  }
  
  state.timerElapsed = 0;
  state.timerRemainingSecAtStart = state.timerDurationSec;
  state.timerRunning = true;
  state.timerPaused = false;
  state.timerPageStart = state.currentPage;
  state.timerAlertFired = false;

 
  const ringWrap = document.getElementById('bib-timer-ring-wrap');
  if (ringWrap) ringWrap.style.display = 'flex';

  
  const tpb = document.getElementById('bib-timer-progress-bar');
  if (tpb) tpb.style.display = 'block';

  updateTimerDisplay(state.timerDurationSec, state.timerDurationSec);
  updateTimerButtons();

  const btn = document.getElementById('bib-timer-btn');
  if (btn) { btn.classList.add('active'); btn.classList.remove('paused'); }

  runTimerTick();
}

function runTimerTick() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (!state.timerRunning) { clearInterval(state.timerInterval); return; }
    state.timerElapsed++;
    const remaining = state.timerDurationSec - state.timerElapsed;

    updateTimerDisplay(remaining, state.timerDurationSec);
    updateTimerProgressBar(state.timerElapsed, state.timerDurationSec);
    updateTimerBtnLabel(remaining);

    
    if (!state.timerAlertFired && remaining === 60) {
      state.timerAlertFired = true;
      showTimerAlert('⏰ Falta 1 minuto para o fim da sessão!');
    }

    if (remaining <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      state.timerRunning = false;
      finishTimer();
    }
  }, 1000);
}

function pauseTimer() {
  if (!state.timerRunning) return;
  state.timerRunning = false;
  state.timerPaused = true;
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  updateTimerButtons();
  const btn = document.getElementById('bib-timer-btn');
  if (btn) { btn.classList.add('paused'); btn.classList.remove('active'); }
  const sub = document.getElementById('bib-timer-ring-sub');
  if (sub) sub.textContent = 'pausado';
}

function stopTimer() {
  state.timerRunning = false;
  state.timerPaused = false;
  if (state.timerInterval) { clearInterval(state.timerInterval); state.timerInterval = null; }
  state.timerElapsed = 0;

  const ringWrap = document.getElementById('bib-timer-ring-wrap');
  if (ringWrap) ringWrap.style.display = 'none';
  const tpb = document.getElementById('bib-timer-progress-bar');
  if (tpb) { tpb.style.display = 'none'; tpb.style.width = '0%'; }

  updateTimerDisplay(state.timerDurationSec, state.timerDurationSec);
  updateTimerButtons();

  const btn = document.getElementById('bib-timer-btn');
  if (btn) { btn.classList.remove('active'); btn.classList.remove('paused'); }
  const label = document.getElementById('bib-timer-btn-label');
  if (label) label.textContent = 'Timer';
}

function finishTimer() {
  const pages = state.currentPage - state.timerPageStart;
  const minutes = Math.floor(state.timerElapsed / 60);

  
  const doneMin = document.getElementById('bib-done-minutes');
  const donePg  = document.getElementById('bib-done-pages');
  const doneSub = document.getElementById('bib-timer-done-sub');
  if (doneMin) doneMin.textContent = minutes;
  if (donePg)  donePg.textContent  = Math.max(0, pages);
  if (doneSub) doneSub.textContent = `Sessão de ${minutes} minuto${minutes !== 1 ? 's' : ''} concluída. Excelente foco!`;

  document.getElementById('bib-timer-done-overlay')?.classList.add('show');

  
  const btn = document.getElementById('bib-timer-btn');
  if (btn) { btn.classList.remove('active'); btn.classList.remove('paused'); }
  const label = document.getElementById('bib-timer-btn-label');
  if (label) label.textContent = 'Timer';

  const tpb = document.getElementById('bib-timer-progress-bar');
  if (tpb) { tpb.style.width = '100%'; }

  
  playTimerDoneSound();
}

function timerContinue() {
  document.getElementById('bib-timer-done-overlay')?.classList.remove('show');
  stopTimer();
}

function timerClose() {
  document.getElementById('bib-timer-done-overlay')?.classList.remove('show');
  stopTimer();
}

function updateTimerDisplay(remaining, total) {
  const mins = Math.floor(Math.max(0, remaining) / 60);
  const secs = Math.max(0, remaining) % 60;
  const text = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
  const el = document.getElementById('bib-timer-ring-text');
  if (el) el.textContent = text;


  const fill = document.getElementById('bib-timer-ring-fill');
  if (fill) {
    const pct = total > 0 ? Math.max(0, remaining) / total : 1;
    fill.style.strokeDashoffset = TIMER_CIRCUMFERENCE * (1 - pct);
  }


  const sub = document.getElementById('bib-timer-ring-sub');
  if (sub && state.timerRunning) {
    const pages = state.currentPage - state.timerPageStart;
    sub.textContent = pages > 0 ? `${pages} página${pages !== 1 ? 's' : ''} lida${pages !== 1 ? 's' : ''}` : 'lendo...';
  }
}

function updateTimerProgressBar(elapsed, total) {
  const tpb = document.getElementById('bib-timer-progress-bar');
  if (!tpb) return;
  const pct = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  tpb.style.width = pct + '%';
}

function updateTimerBtnLabel(remaining) {
  const label = document.getElementById('bib-timer-btn-label');
  if (!label) return;
  const mins = Math.floor(Math.max(0, remaining) / 60);
  const secs = Math.max(0, remaining) % 60;
  label.textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function updateTimerButtons() {
  const actionsEl = document.getElementById('bib-timer-actions');
  if (!actionsEl) return;
  if (state.timerRunning) {
    actionsEl.innerHTML = `
      <button class="bib-timer-action-btn bib-timer-pause-btn" onclick="BibliotecaVirtual.pauseTimer()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Pausar
      </button>
      <button class="bib-timer-action-btn bib-timer-stop-btn" onclick="BibliotecaVirtual.stopTimer()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        Parar
      </button>`;
  } else if (state.timerPaused) {
    actionsEl.innerHTML = `
      <button class="bib-timer-action-btn bib-timer-start-btn" onclick="BibliotecaVirtual.startTimer()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Retomar
      </button>
      <button class="bib-timer-action-btn bib-timer-stop-btn" onclick="BibliotecaVirtual.stopTimer()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
        Parar
      </button>`;
  } else {
    actionsEl.innerHTML = `
      <button class="bib-timer-action-btn bib-timer-start-btn" id="bib-timer-start-btn" onclick="BibliotecaVirtual.startTimer()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Iniciar
      </button>`;
  }
}

function showTimerAlert(msg) {
  let el = document.getElementById('bib-timer-alert-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'bib-timer-alert-toast';
    el.className = 'bib-timer-alert';
    el.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span></span>`;
    document.body.appendChild(el);
  }
  el.querySelector('span').textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function playTimerDoneSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.45);
    });
  } catch(e) {}
}

window.BibliotecaVirtual = {
  open, close,
  abrir: open,
  fechar: close,
  openBook, closeReader, deleteBook,
  nextPage, prevPage, goToPage, goToPageDirect,
  toggleToc, toggleSettings, toggleAI, toggleBookmark, toggleHighlightsPanel,
  switchTab, filterBooks,
  setTheme, setFont,
  setDailyGoal,
  toggleTwoPageMode,
  showShortcutsModal,
  exportHighlights,
  changeFontSize, changeLineHeight, changeBrightness,
  highlightSelection, noteSelection, explainSelection,
  closeNoteModal, saveNoteModal,
  aiAction,
  _formatSize: (b) => (b < 1024 * 1024) ? (b / 1024).toFixed(1) + ' KB' : (b / (1024 * 1024)).toFixed(1) + ' MB',
  toggleFocusMode, searchInBook,
  toggleSearchPanel, closeSearchPanel, runSearch,
  jumpToResult, searchNav, searchKeyNav,
  highlightSearchResultsOnPage, clearSearchHighlights,
  toggleTTS, stopTTS,
  toggleTimerPanel, setTimerPreset, setTimerCustom,
  startTimer, pauseTimer, stopTimer,
  timerContinue, timerClose,
};

function toggleTTS() {
  if (state.ttsActive) {
    stopTTS();
  } else {
    startTTS();
  }
}

function startTTS() {
  const content = document.getElementById('bib-page-content');
  if (!content || !state.speechSynth) return;

  state.ttsActive = true;
  const btn = document.getElementById('bib-tts-btn');
  if (btn) { btn.style.color = '#e8a04a'; btn.style.borderColor = 'rgba(232,160,74,0.3)'; }

  const text = content.innerText;
  state.speechUtterance = new SpeechSynthesisUtterance(text);
  state.speechUtterance.lang = 'pt-BR';
  state.speechUtterance.onend = () => stopTTS();
  
  state.speechSynth.cancel();
  state.speechSynth.speak(state.speechUtterance);
  showToast('Iniciando leitura em voz alta');
}

function stopTTS() {
  state.ttsActive = false;
  if (state.speechSynth) state.speechSynth.cancel();
  const btn = document.getElementById('bib-tts-btn');
  if (btn) { btn.style.color = ''; btn.style.borderColor = ''; }
}

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  injectStyles();
});

})();