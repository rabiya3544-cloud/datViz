var DataModule = (function() {
  // Private datasets
  const datasets = {
    superstore: {
      name: 'Superstore',
      dimensions: ['Category', 'Region', 'Segment'],
      measures: ['Sales', 'Profit', 'Quantity'],
      dimensionValues: {
        Category: ['Furniture', 'Office Supplies', 'Technology'],
        Region: ['East', 'Central', 'West', 'South'],
        Segment: ['Consumer', 'Corporate', 'Home Office']
      },
      measureData: {
        Sales: {
          'Furniture': [4200, 3100, 5100, 2800],
          'Office Supplies': [3800, 4200, 4700, 3300],
          'Technology': [6900, 5400, 8100, 4900]
        },
        Profit: {
          'Furniture': [520, 410, 680, 320],
          'Office Supplies': [720, 840, 930, 610],
          'Technology': [1220, 980, 1510, 870]
        },
        Quantity: {
          'Furniture': [18, 12, 24, 10],
          'Office Supplies': [32, 28, 36, 22],
          'Technology': [15, 12, 21, 11]
        }
      },
      colorDimensions: ['Region', 'Segment']
    },
    tiktok: {
      name: 'TikTok Analytics',
      dimensions: ['User', 'PostType', 'Day'],
      measures: ['Likes', 'Shares', 'Comments'],
      dimensionValues: {
        User: ['User1', 'User2', 'User3', 'User4', 'User5', 'User6', 'User7', 'User8', 'User9', 'User10'],
        PostType: ['Video', 'Image', 'Carousel'],
        Day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      measureData: {
        Likes: {
          'User1': [320, 150, 80],
          'User2': [450, 220, 130],
          'User3': [210, 340, 95],
          'User4': [560, 280, 170],
          'User5': [390, 410, 200],
          'User6': [610, 330, 140],
          'User7': [275, 190, 210],
          'User8': [480, 260, 115],
          'User9': [525, 305, 185],
          'User10': [440, 370, 155]
        },
        Shares: {
          'User1': [45, 22, 13],
          'User2': [67, 35, 21],
          'User3': [31, 51, 14],
          'User4': [84, 42, 26],
          'User5': [58, 62, 30],
          'User6': [92, 50, 21],
          'User7': [41, 28, 32],
          'User8': [72, 39, 17],
          'User9': [79, 46, 28],
          'User10': [66, 56, 23]
        },
        Comments: {
          'User1': [12, 8, 4],
          'User2': [19, 11, 7],
          'User3': [8, 15, 5],
          'User4': [23, 13, 9],
          'User5': [16, 18, 10],
          'User6': [27, 14, 6],
          'User7': [11, 9, 12],
          'User8': [20, 12, 5],
          'User9': [22, 14, 10],
          'User10': [18, 16, 8]
        }
      },
      colorDimensions: ['PostType', 'Day']
    }
  };
  
  let currentDatasetKey = 'superstore';
  let currentDataset = datasets.superstore;
  
  // Public API
  return {
    getCurrentDataset: function() { return currentDataset; },
    getDatasetKeys: function() { return Object.keys(datasets); },
    switchDataset: function(key) {
      if (datasets[key] && key !== currentDatasetKey) {
        currentDatasetKey = key;
        currentDataset = datasets[key];
        return true;
      }
      return false;
    },
    getChartData: function(dimName, measureName, colorBy) {
      const ds = currentDataset;
      const labels = ds.dimensionValues[dimName] || [];
      let datasetsArr = [];
      
      if (colorBy === 'none' || (ds.colorDimensions.includes(colorBy) && dimName === colorBy)) {
        const dataPoints = labels.map(label => {
          if (ds.measureData[measureName] && ds.measureData[measureName][label]) {
            return ds.measureData[measureName][label].reduce((a, b) => a + b, 0);
          }
          return 0;
        });
        datasetsArr = [{
          label: measureName,
          data: dataPoints,
          backgroundColor: '#4f9fd4',
          borderRadius: 6
        }];
      } else if (ds.colorDimensions.includes(colorBy)) {
        const colorCategories = ds.dimensionValues[colorBy] || [];
        datasetsArr = colorCategories.map((cat, idx) => {
          const hue = (idx * 60) % 360;
          const color = `hsla(${hue}, 70%, 60%, 0.8)`;
          const dataPoints = labels.map(label => {
            if (ds.measureData[measureName] && ds.measureData[measureName][label]) {
              const arr = ds.measureData[measureName][label];
              return arr.length > idx ? arr[idx] : Math.round((arr[0] || 100) * (0.3 + 0.2 * idx));
            }
            return Math.round(50 + idx * 20 + label.length * 10);
          });
          return { label: cat, data: dataPoints, backgroundColor: color, borderRadius: 6 };
        });
      } else {
        const dataPoints = labels.map(() => Math.floor(Math.random() * 500) + 100);
        datasetsArr = [{
          label: measureName,
          data: dataPoints,
          backgroundColor: '#4f9fd4',
          borderRadius: 6
        }];
      }
      return { labels, datasets: datasetsArr };
    }
  };
})();