var UIModule = (function(DataModule, ChartModule) {
    // Private state
    let sheets = [
        { name: 'Sheet 1', xDim: DataModule.getCurrentDataset().dimensions[0], yMeas: DataModule.getCurrentDataset().measures[0], colorBy: 'none', type: 'bar' }
    ];
    let currentSheetIndex = 0;
    let selectedPill = null;

    // DOM elements (cached)
    const dimPills = document.getElementById('dimensionPills');
    const measPills = document.getElementById('measurePills');
    const columnShelf = document.getElementById('column-shelf');
    const rowShelf = document.getElementById('row-shelf');
    const colorSpan = document.getElementById('colorValue');
    const sheetNameSpan = document.getElementById('sheetName');
    const xSelect = document.getElementById('xAxisSelect');
    const ySelect = document.getElementById('yAxisSelect');
    const colorSelect = document.getElementById('colorSelect');
    const datasetNameSpan = document.getElementById('datasetName');

    // Helper: update shelves text
    function updateShelves() {
        const sheet = sheets[currentSheetIndex];
        columnShelf.innerHTML = `<i class="fas fa-tag"></i> ${sheet.xDim}`;
        rowShelf.innerHTML = `<i class="fas fa-chart-line"></i> ${sheet.yMeas}`;
        colorSpan.innerText = sheet.colorBy === 'none' ? 'none' : sheet.colorBy;
        sheetNameSpan.innerText = sheet.name;
    }

    // Helper: sync dropdowns from current sheet
    function syncDropdowns() {
        const sheet = sheets[currentSheetIndex];
        xSelect.value = sheet.xDim;
        ySelect.value = sheet.yMeas;
        colorSelect.value = sheet.colorBy;
    }

    // Save current dropdown values to sheet
    function saveCurrentToSheet() {
        const sheet = sheets[currentSheetIndex];
        sheet.xDim = xSelect.value;
        sheet.yMeas = ySelect.value;
        sheet.colorBy = colorSelect.value;
        sheet.type = ChartModule.getType();
    }

    // Render chart and update UI
    function refreshChart() {
        ChartModule.render(sheets[currentSheetIndex]);
        updateShelves();
        syncDropdowns();
        clearSelectedPill();
    }

    // Pill selection
    function clearSelectedPill() {
        if (selectedPill) {
            selectedPill.element.classList.remove('selected');
            selectedPill = null;
        }
    }
    function selectPill(element, type, field) {
        if (selectedPill && selectedPill.element === element) {
            // same pill: we keep selected (no action)
            return;
        }
        if (selectedPill) selectedPill.element.classList.remove('selected');
        element.classList.add('selected');
        selectedPill = { element, type, field };

        // Auto-assign based on type (immediate update)
        if (type === 'dimension') {
            xSelect.value = field;
        } else if (type === 'measure') {
            ySelect.value = field;
        }
        saveCurrentToSheet();
        refreshChart();
    }

    // Assignment functions for shelves (override)
    function assignToColumn() {
        if (!selectedPill || selectedPill.type !== 'dimension') return;
        xSelect.value = selectedPill.field;
        saveCurrentToSheet();
        refreshChart();
        clearSelectedPill();
    }
    function assignToRow() {
        if (!selectedPill || selectedPill.type !== 'measure') return;
        ySelect.value = selectedPill.field;
        saveCurrentToSheet();
        refreshChart();
        clearSelectedPill();
    }
    function assignToColor() {
        if (!selectedPill || selectedPill.type !== 'dimension') return;
        colorSelect.value = selectedPill.field;
        saveCurrentToSheet();
        refreshChart();
        clearSelectedPill();
    }

    // Populate pills and dropdowns based on current dataset
    function buildUIForDataset() {
        const ds = DataModule.getCurrentDataset();
        datasetNameSpan.innerText = ds.name;

        // Dimensions
        dimPills.innerHTML = '';
        ds.dimensions.forEach(dim => {
            const pill = document.createElement('span');
            pill.className = 'pill';
            pill.setAttribute('data-type', 'dimension');
            pill.setAttribute('data-field', dim);
            pill.innerHTML = `<i class="fas fa-tag"></i>${dim}`;
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPill(pill, 'dimension', dim);
            });
            dimPills.appendChild(pill);
        });

        // Measures
        measPills.innerHTML = '';
        ds.measures.forEach(meas => {
            const pill = document.createElement('span');
            pill.className = 'pill measure';
            pill.setAttribute('data-type', 'measure');
            pill.setAttribute('data-field', meas);
            pill.innerHTML = `<i class="fas fa-chart-line"></i>${meas}`;
            pill.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPill(pill, 'measure', meas);
            });
            measPills.appendChild(pill);
        });

        // Dropdowns
        xSelect.innerHTML = '';
        ds.dimensions.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d; opt.textContent = d;
            xSelect.appendChild(opt);
        });
        ySelect.innerHTML = '';
        ds.measures.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m; opt.textContent = m;
            ySelect.appendChild(opt);
        });
        colorSelect.innerHTML = '<option value="none">None</option>';
        ds.colorDimensions.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c; opt.textContent = c;
            colorSelect.appendChild(opt);
        });

        // Reset sheets
        sheets = [{ name: 'Sheet 1', xDim: ds.dimensions[0], yMeas: ds.measures[0], colorBy: 'none', type: 'bar' }];
        currentSheetIndex = 0;
        ChartModule.setType('bar');
        refreshChart();
        updateSheetTabs();
    }

    // Sheet tabs management
    function updateSheetTabs() {
        const sheetBar = document.getElementById('sheetBar');
        const addBtn = document.getElementById('addSheetTab');
        while (sheetBar.children.length > 1) {
            sheetBar.removeChild(sheetBar.firstChild);
        }
        sheets.forEach((sheet, idx) => {
            const tab = document.createElement('div');
            tab.className = 'sheet-tab' + (idx === currentSheetIndex ? ' active' : '');
            tab.setAttribute('data-sheet-index', idx);
            tab.innerHTML = `<i class="fas fa-chart-pie"></i> ${sheet.name}`;
            tab.addEventListener('click', () => switchSheet(idx));
            sheetBar.insertBefore(tab, addBtn);
        });
    }

    function switchSheet(index) {
        if (index >= sheets.length) return;
        currentSheetIndex = index;
        const sheet = sheets[index];
        xSelect.value = sheet.xDim;
        ySelect.value = sheet.yMeas;
        colorSelect.value = sheet.colorBy;
        ChartModule.setType(sheet.type);
        refreshChart();
        updateSheetTabs();
    }

    function addNewSheet() {
        const ds = DataModule.getCurrentDataset();
        const newIdx = sheets.length;
        sheets.push({
            name: `Sheet ${newIdx+1}`,
            xDim: ds.dimensions[0],
            yMeas: ds.measures[0],
            colorBy: 'none',
            type: 'bar'
        });
        switchSheet(newIdx);
        updateSheetTabs();
    }

    // Public API
    return {
        init: function() {
            // Build initial UI
            buildUIForDataset();

            // Event listeners
            document.getElementById('columnShelf').addEventListener('click', assignToColumn);
            document.getElementById('rowShelf').addEventListener('click', assignToRow);
            document.getElementById('colorMark').addEventListener('click', assignToColor);
            document.getElementById('sizeMark').addEventListener('click', () => alert('Size (demo)'));
            document.getElementById('labelMark').addEventListener('click', () => alert('Label (demo)'));

            xSelect.addEventListener('change', () => { saveCurrentToSheet(); refreshChart(); });
            ySelect.addEventListener('change', () => { saveCurrentToSheet(); refreshChart(); });
            colorSelect.addEventListener('change', () => { saveCurrentToSheet(); refreshChart(); });

            document.getElementById('barBtn').addEventListener('click', () => {
                ChartModule.setType('bar');
                sheets[currentSheetIndex].type = 'bar';
                refreshChart();
            });
            document.getElementById('lineBtn').addEventListener('click', () => {
                ChartModule.setType('line');
                sheets[currentSheetIndex].type = 'line';
                refreshChart();
            });
            document.getElementById('pieBtn').addEventListener('click', () => {
                ChartModule.setType('pie');
                sheets[currentSheetIndex].type = 'pie';
                refreshChart();
            });

            // Dataset selector
            document.getElementById('datasetSelector').addEventListener('change', (e) => {
                if (DataModule.switchDataset(e.target.value)) {
                    buildUIForDataset();
                }
            });

            // Menu (hamburger)
            const menuIcon = document.getElementById('menuIcon');
            const menuDropdown = document.getElementById('menuDropdown');
            menuIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                menuDropdown.classList.toggle('show');
            });
            document.addEventListener('click', (e) => {
                if (!menuIcon.contains(e.target) && !menuDropdown.contains(e.target)) {
                    menuDropdown.classList.remove('show');
                }
            });

            // Sheet menu items
            document.querySelectorAll('.menu-item[data-sheet]').forEach(item => {
                item.addEventListener('click', () => {
                    const idx = parseInt(item.dataset.sheet, 10);
                    if (idx < sheets.length) switchSheet(idx);
                    menuDropdown.classList.remove('show');
                });
            });
            document.getElementById('newSheetBtn').addEventListener('click', () => {
                addNewSheet();
                menuDropdown.classList.remove('show');
            });

            // Add sheet via tab bar
            document.getElementById('addSheetTab').addEventListener('click', addNewSheet);

            // Toolbar icons
            document.getElementById('searchIcon').addEventListener('click', () => alert('🔍 search'));
            document.getElementById('undoIcon').addEventListener('click', () => alert('↩️ undo'));
            document.getElementById('shareIcon').addEventListener('click', () => alert('📤 share'));
        }
    };
})(DataModule, ChartModule);

// Initialize the app
UIModule.init();