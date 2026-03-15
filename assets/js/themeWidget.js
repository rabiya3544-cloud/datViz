/**
 * Theme Widget
 * Injects a floating widget with two selectors to switch between base themes and effect themes.
 * Assumes the host page includes the CSS with all theme definitions (dark, light, glass, cyberpunk, minimal, vintage).
 */
(function() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
  
  function initWidget() {
    // Avoid duplicate widget
    if (document.getElementById('theme-widget')) return;
    
    // Create widget container
    const widget = document.createElement('div');
    widget.id = 'theme-widget';
    widget.setAttribute('aria-label', 'Theme selector widget');
    
    // Add styles for the widget
    const style = document.createElement('style');
    style.textContent = `
      #theme-widget {
        position: fixed;
        bottom: 20px;
        left: 0px;
        background: rgba(30, 30, 40, 0.9);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 12px;
        padding: 16px;
        color: white;
        font-family: 'Segoe UI', Roboto, system-ui, sans-serif;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 9999;
        width: 100px;
        transition: opacity 0.2s;
      }
      #theme-widget.hidden {
        opacity: 0;
        pointer-events: none;
      }
      #theme-widget .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        font-weight: 600;
        font-size: 0.9rem;
        color: #ddd;
      }
      #theme-widget .widget-header button {
        background: none;
        border: none;
        color: #aaa;
        cursor: pointer;
        font-size: 1.2rem;
        line-height: 1;
        padding: 0 4px;
      }
      #theme-widget .widget-header button:hover {
        color: white;
      }
      #theme-widget .selector-group {
        margin-bottom: 12px;
      }
      #theme-widget label {
        display: block;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #aaa;
        margin-bottom: 4px;
      }
      #theme-widget select {
        width: 100%;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.2);
        color: white;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 0.85rem;
        outline: none;
        cursor: pointer;
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>');
        background-repeat: no-repeat;
        background-position: right 10px center;
      }
      #theme-widget select option {
        background: #1e1e2a;
        color: white;
      }
      #theme-widget .footer {
        margin-top: 8px;
        font-size: 0.7rem;
        color: #888;
        text-align: center;
      }
      #theme-widget .footer button {
        background: none;
        border: 1px solid #444;
        color: #ccc;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.7rem;
      }
      #theme-widget .footer button:hover {
        background: #333;
      }
    `;
    document.head.appendChild(style);
    
    // Build widget HTML
    widget.innerHTML = `
      <div class="widget-header">
        <span>🎨 Theme Customizer</span>
        <button id="theme-widget-close" aria-label="Close">✕</button>
      </div>
      <div class="selector-group">
        <label for="theme-base">Base Style</label>
        <select id="theme-base">
          <option value="dark">Dark (default)</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div class="selector-group">
        <label for="theme-effect">Effect Theme</label>
        <select id="theme-effect">
          <option value="none">None</option>
          <option value="glass">Glass</option>
          <option value="cyberpunk">Cyberpunk</option>
          <option value="minimal">Minimal</option>
          <option value="vintage">Vintage</option>
        </select>
      </div>
      <div class="footer">
        <button id="theme-widget-reset">Reset to default</button>
      </div>
    `;
    
    document.body.appendChild(widget);
    
    // Get elements
    const baseSelect = document.getElementById('theme-base');
    const effectSelect = document.getElementById('theme-effect');
    const closeBtn = document.getElementById('theme-widget-close');
    const resetBtn = document.getElementById('theme-widget-reset');
    const htmlEl = document.documentElement;
    
    // Current classes
    let currentBase = 'dark'; // default (no class)
    let currentEffect = 'none';
    
    // Helper to apply classes
    function applyThemes() {
      // Remove all possible classes
      htmlEl.classList.remove('light', 'glass', 'cyberpunk', 'minimal', 'vintage');
      
      // Apply base if dark (no class) or light
      if (currentBase === 'light') {
        htmlEl.classList.add('light');
      }
      
      // Apply effect if not none
      if (currentEffect !== 'none') {
        htmlEl.classList.add(currentEffect);
      }
    }
    
    // Base change
    baseSelect.addEventListener('change', (e) => {
      currentBase = e.target.value;
      applyThemes();
    });
    
    // Effect change
    effectSelect.addEventListener('change', (e) => {
      currentEffect = e.target.value;
      applyThemes();
    });
    
    // Close widget
    closeBtn.addEventListener('click', () => {
      widget.classList.add('hidden');
    });
    
    // Reset to defaults
    resetBtn.addEventListener('click', () => {
      baseSelect.value = 'dark';
      effectSelect.value = 'none';
      currentBase = 'dark';
      currentEffect = 'none';
      applyThemes();
    });
    
    // Optional: Load from localStorage (bonus)
    function loadSaved() {
      try {
        const savedBase = localStorage.getItem('theme-widget-base');
        const savedEffect = localStorage.getItem('theme-widget-effect');
        if (savedBase && (savedBase === 'dark' || savedBase === 'light')) {
          baseSelect.value = savedBase;
          currentBase = savedBase;
        }
        if (savedEffect && ['none', 'glass', 'cyberpunk', 'minimal', 'vintage'].includes(savedEffect)) {
          effectSelect.value = savedEffect;
          currentEffect = savedEffect;
        }
        applyThemes();
      } catch (e) {}
    }
    
    function saveSettings() {
      try {
        localStorage.setItem('theme-widget-base', currentBase);
        localStorage.setItem('theme-widget-effect', currentEffect);
      } catch (e) {}
    }
    
    // Save on change
    baseSelect.addEventListener('change', saveSettings);
    effectSelect.addEventListener('change', saveSettings);
    
    // Initial load
    loadSaved();
    
    // Make widget draggable (optional)
    let isDragging = false;
    let offsetX, offsetY;
    
    const header = widget.querySelector('.widget-header');
    header.style.cursor = 'grab';
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      offsetX = e.clientX - widget.offsetLeft;
      offsetY = e.clientY - widget.offsetTop;
      header.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      widget.style.left = (e.clientX - offsetX) + 'px';
      widget.style.top = (e.clientY - offsetY) + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
      header.style.cursor = 'grab';
    });
  }
})();