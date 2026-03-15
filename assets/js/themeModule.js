(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
  
  function initWidget() {
    if (document.getElementById('theme-widget')) return;
    
    const widget = document.createElement('div');
    widget.id = 'theme-widget';
    
    widget.innerHTML = `
      <div class="widget-header">
        <span>🎨 Theme Customizer</span>
        <button id="theme-widget-close" aria-label="Close">✕</button>
      </div>
      <div class="selector-group">
        <label for="theme-base">Base</label>
        <select id="theme-base">
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>
      </div>
      <div class="selector-group">
        <label for="theme-effect">Effect</label>
        <select id="theme-effect">
          <option value="default">Default</option>
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
    
    const baseSelect = document.getElementById('theme-base');
    const effectSelect = document.getElementById('theme-effect');
    const closeBtn = document.getElementById('theme-widget-close');
    const resetBtn = document.getElementById('theme-widget-reset');
    const htmlEl = document.documentElement;
    
    function getThemeClass(base, effect) {
      return `theme-${effect}-${base}`;
    }
    
    function applyTheme() {
      const base = baseSelect.value;
      const effect = effectSelect.value;
      const themeClass = getThemeClass(base, effect);
      
      const classes = htmlEl.className.split(' ').filter(c => !c.startsWith('theme-'));
      htmlEl.className = classes.join(' ');
      htmlEl.classList.add(themeClass);
    }
    
    baseSelect.addEventListener('change', applyTheme);
    effectSelect.addEventListener('change', applyTheme);
    
    closeBtn.addEventListener('click', () => {
      widget.classList.add('hidden');
    });
    
    resetBtn.addEventListener('click', () => {
      baseSelect.value = 'dark';
      effectSelect.value = 'default';
      applyTheme();
    });
    
    function loadSaved() {
      try {
        const savedBase = localStorage.getItem('theme-widget-base');
        const savedEffect = localStorage.getItem('theme-widget-effect');
        if (savedBase && (savedBase === 'dark' || savedBase === 'light')) {
          baseSelect.value = savedBase;
        }
        if (savedEffect && ['default', 'glass', 'cyberpunk', 'minimal', 'vintage'].includes(savedEffect)) {
          effectSelect.value = savedEffect;
        }
        applyTheme();
      } catch (e) {}
    }
    
    function saveSettings() {
      try {
        localStorage.setItem('theme-widget-base', baseSelect.value);
        localStorage.setItem('theme-widget-effect', effectSelect.value);
      } catch (e) {}
    }
    
    baseSelect.addEventListener('change', saveSettings);
    effectSelect.addEventListener('change', saveSettings);
    
    loadSaved();
    
    // Draggable functionality (positioning still requires JS)
    let isDragging = false;
    let offsetX, offsetY;
    const header = widget.querySelector('.widget-header');
    
    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      offsetX = e.clientX - widget.offsetLeft;
      offsetY = e.clientY - widget.offsetTop;
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
    });
  }
})();