var ChartModule = (function(DataModule) {
  // Private
  let currentChart = null;
  let currentChartType = 'bar';
  const ctx = document.getElementById('tableauChart').getContext('2d');
  
  // Public API
  return {
    render: function(sheet) {
      const chartData = DataModule.getChartData(sheet.xDim, sheet.yMeas, sheet.colorBy);
      if (currentChart) currentChart.destroy();
      
      const config = {
        type: sheet.type,
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: (sheet.colorBy !== 'none' && chartData.datasets.length > 1), labels: { color: '#ccc', font: { size: 8 } } },
            tooltip: { backgroundColor: '#2d3f4d' }
          },
          scales: sheet.type !== 'pie' ? {
            x: { ticks: { color: '#aaa', maxRotation: 30 }, grid: { color: '#3a4b55' } },
            y: { ticks: { color: '#aaa' }, grid: { color: '#3a4b55' } }
          } : {}
        }
      };
      currentChart = new Chart(ctx, config);
    },
    setType: function(type) {
      currentChartType = type;
      return currentChartType;
    },
    getType: function() {
      return currentChartType;
    }
  };
})(DataModule);