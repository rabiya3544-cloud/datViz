var UIModule = (function(DataModule, ChartModule) {
    // Private state: sheets organised by dataset key
    let sheetsByDataset = {};
    let currentDatasetKey = 'superstore';
    let currentDataset = DataModule.getCurrentDataset();

    let sheets = [];
    let currentSheetIndex = 0;
    let draggedPill = null;          // pill currently held for drag & drop

    // DOM elements
    const dimPills = document.getElementById('dimensionPills');
    const measPills = document.getElementById('measurePills');
    const columnShelf = document.getElementById('column-shelf');
    const rowShelf = document.getElementById('row-shelf');
    const colorSpan = document.getElementById('colorValue');
    const sizeSpan = document.getElementById('sizeValue');
    const labelSpan = document.getElementById('labelValue');
    const sheetNameSpan = document.getElementById('sheetName');
    const xSelect = document.getElementById('xAxisSelect');
    const ySelect = document.getElementById('yAxisSelect');
    const colorSelect = document.getElementById('colorSelect');
    const datasetNameSpan = document.getElementById('datasetName');
    const expandBtn = document.getElementById('expandChartBtn');
    const chartModal = document.getElementById('chartModal');
    const modalContent = document.getElementById('modalContent');
    const mainChartCard = document.getElementById('mainChartCard');

    let originalParent = null;
    let originalNextSibling = null;

    // --- Expand / Collapse ---
    function expandChart() {
        // Store original position
        originalParent = mainChartCard.parentNode;
        originalNextSibling = mainChartCard.nextSibling;

        // Detach and move to modal
        modalContent.appendChild(mainChartCard);
        chartModal.style.display = 'flex';
        expandBtn.classList.remove('fa-expand-alt');
        expandBtn.classList.add('fa-compress-alt');

        // Trigger chart resize after a short delay to let DOM settle
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    function collapseChart() {
        if (!originalParent) return;

        // Move back to original position
        if (originalNextSibling) {
            originalParent.insertBefore(mainChartCard, originalNextSibling);
        } else {
            originalParent.appendChild(mainChartCard);
        }
        chartModal.style.display = 'none';
        expandBtn.classList.remove('fa-compress-alt');
        expandBtn.classList.add('fa-expand-alt');

        // Trigger resize
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }

    // --- Active pill management ---
    function updateActivePills() {
        const sheet = sheets[currentSheetIndex];
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));

        const dimPill = Array.from(dimPills.children).find(
            p => p.dataset.field === sheet.xDim
        );
        if (dimPill) dimPill.classList.add('selected');

        const measPill = Array.from(measPills.children).find(
            p => p.dataset.field === sheet.yMeas
        );
        if (measPill) measPill.classList.add('selected');
    }

    // --- Drag state management ---
    function clearDraggedPill() {
        if (draggedPill) {
            draggedPill.classList.remove('dragged');
            draggedPill = null;
        }
    }

    function setDraggedPill(element) {
        clearDraggedPill();
        element.classList.add('dragged');
        draggedPill = element;
    }

    // Update shelves text
    function updateShelves() {
        const sheet = sheets[currentSheetIndex];
        columnShelf.innerHTML = `<i class="fas fa-tag"></i> ${sheet.xDim}`;
        rowShelf.innerHTML = `<i class="fas fa-chart-line"></i> ${sheet.yMeas}`;
        colorSpan.innerText = sheet.colorBy === 'none' ? 'none' : sheet.colorBy;
        sizeSpan.innerText = sheet.yMeas;
        labelSpan.innerText = sheet.xDim;
        sheetNameSpan.innerText = sheet.name;
    }

    // Sync dropdowns
    function syncDropdowns() {
        const sheet = sheets[currentSheetIndex];
        xSelect.value = sheet.xDim;
        ySelect.value = sheet.yMeas;
        colorSelect.value = sheet.colorBy;
    }

    // Save current dropdowns to sheet
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
        updateActivePills();
    }

    // Pill click handler
    function onPillClick(e, element, type, field) {
        e.stopPropagation();

        if (draggedPill === element) return;

        setDraggedPill(element);

        if (type === 'dimension') {
            xSelect.value = field;
        } else if (type === 'measure') {
            ySelect.value = field;
        }
        saveCurrentToSheet();
        refreshChart();
    }

    // Shelf drop handlers
    function assignToColumn() {
        if (!draggedPill || draggedPill.dataset.type !== 'dimension') return;
        xSelect.value = draggedPill.dataset.field;
        saveCurrentToSheet();
        refreshChart();
        clearDraggedPill();
    }
    function assignToRow() {
        if (!draggedPill || draggedPill.dataset.type !== 'measure') return;
        ySelect.value = draggedPill.dataset.field;
        saveCurrentToSheet();
        refreshChart();
        clearDraggedPill();
    }
    function assignToColor() {
        if (!draggedPill || draggedPill.dataset.type !== 'dimension') return;
        colorSelect.value = draggedPill.dataset.field;
        saveCurrentToSheet();
        refreshChart();
        clearDraggedPill();
    }

    // Save current dataset's sheets
    function saveCurrentDatasetState() {
        if (!sheetsByDataset[currentDatasetKey]) {
            sheetsByDataset[currentDatasetKey] = { sheets: [], currentIndex: 0 };
        }
        sheetsByDataset[currentDatasetKey].sheets = sheets.slice();
        sheetsByDataset[currentDatasetKey].currentIndex = currentSheetIndex;
    }

    // Load a dataset's sheets
    function loadDatasetState(key) {
        if (!sheetsByDataset[key]) {
            const ds = DataModule.getCurrentDataset();
            const defaultSheets = [{
                name: 'Sheet 1',
                xDim: ds.dimensions[0],
                yMeas: ds.measures[0],
                colorBy: 'none',
                type: 'bar'
            }];
            sheetsByDataset[key] = { sheets: defaultSheets, currentIndex: 0 };
        }
        sheets = sheetsByDataset[key].sheets;
        currentSheetIndex = sheetsByDataset[key].currentIndex;
    }

    // Build UI for current dataset
    function buildUIForDataset() {
        const ds = DataModule.getCurrentDataset();
        datasetNameSpan.innerText = ds.name;

        // Dimensions pills
        dimPills.innerHTML = '';
        ds.dimensions.forEach(dim => {
            const pill = document.createElement('span');
            pill.className = 'pill';
            pill.setAttribute('data-type', 'dimension');
            pill.setAttribute('data-field', dim);
            pill.innerHTML = `<i class="fas fa-tag"></i>${dim}`;
            pill.addEventListener('click', (e) => onPillClick(e, pill, 'dimension', dim));
            dimPills.appendChild(pill);
        });

        // Measures pills
        measPills.innerHTML = '';
        ds.measures.forEach(meas => {
            const pill = document.createElement('span');
            pill.className = 'pill measure';
            pill.setAttribute('data-type', 'measure');
            pill.setAttribute('data-field', meas);
            pill.innerHTML = `<i class="fas fa-chart-line"></i>${meas}`;
            pill.addEventListener('click', (e) => onPillClick(e, pill, 'measure', meas));
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

        if (sheets.length > 0) {
            xSelect.value = sheets[currentSheetIndex].xDim;
            ySelect.value = sheets[currentSheetIndex].yMeas;
            colorSelect.value = sheets[currentSheetIndex].colorBy;
            ChartModule.setType(sheets[currentSheetIndex].type);
        } else {
            xSelect.value = ds.dimensions[0];
            ySelect.value = ds.measures[0];
            colorSelect.value = 'none';
            ChartModule.setType('bar');
        }

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
        clearDraggedPill();
        // Close modal if open
        if (chartModal.style.display === 'flex') collapseChart();
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
            loadDatasetState(currentDatasetKey);
            buildUIForDataset();

            // Expand button
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (chartModal.style.display === 'flex') {
                    collapseChart();
                } else {
                    expandChart();
                }
            });

            // Close modal when clicking outside the modal content
            chartModal.addEventListener('click', (e) => {
                if (e.target === chartModal) {
                    collapseChart();
                }
            });

            // Shelf click listeners
            document.getElementById('columnShelf').addEventListener('click', assignToColumn);
            document.getElementById('rowShelf').addEventListener('click', assignToRow);
            document.getElementById('colorMark').addEventListener('click', assignToColor);
            document.getElementById('sizeMark').addEventListener('click', () => alert('Size encoding – demo (not implemented)'));
            document.getElementById('labelMark').addEventListener('click', () => alert('Label – demo'));

            // Dropdown change listeners
            xSelect.addEventListener('change', () => { saveCurrentToSheet(); refreshChart(); });
            ySelect.addEventListener('change', () => { saveCurrentToSheet(); refreshChart(); });
            colorSelect.addEventListener('change', () => { saveCurrentToSheet(); refreshChart(); });

            // Chart type buttons
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
                const newKey = e.target.value;
                if (newKey === currentDatasetKey) return;

                // Close modal if open
                if (chartModal.style.display === 'flex') collapseChart();

                saveCurrentDatasetState();

                if (DataModule.switchDataset(newKey)) {
                    currentDatasetKey = newKey;
                    loadDatasetState(currentDatasetKey);
                    buildUIForDataset();
                }
                clearDraggedPill();
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

// Initialize
UIModule.init();