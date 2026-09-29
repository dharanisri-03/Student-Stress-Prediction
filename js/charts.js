/**
 * Charts Module: charts.js
 * Renders interactive Chart.js visualizations for the Student Stress Dashboard
 */

let gaugeChartInstance = null;
let balanceChartInstance = null;
let radarChartInstance = null;
let trendChartInstance = null;

/**
 * Helper to get current theme colors
 */
function getThemeColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    textColor: isDark ? '#cbd5e1' : '#475569',
    mutedColor: isDark ? '#64748b' : '#94a3b8',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    cardBg: isDark ? '#1e293b' : '#ffffff',
    accentTeal: '#0d9488',
    accentIndigo: '#6366f1',
    accentAmber: '#f59e0b',
    accentRose: '#ef4444',
    accentEmerald: '#10b981'
  };
}

/**
 * 1. Stress Score Gauge Chart (Doughnut style meter)
 */
export function renderGaugeChart(canvasId, score, categoryColor) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (gaugeChartInstance) {
    gaugeChartInstance.destroy();
  }

  const remaining = Math.max(0, 100 - score);
  const theme = getThemeColors();

  gaugeChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Stress Score', 'Remaining Headroom'],
      datasets: [
        {
          data: [score, remaining],
          backgroundColor: [
            categoryColor || theme.accentTeal,
            theme.gridColor
          ],
          borderWidth: 0,
          circumference: 260,
          rotation: 230,
          borderRadius: [10, 0],
          cutout: '80%'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateScale: true,
        animateRotate: true,
        duration: 1200
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataIndex === 0) return ` Current Score: ${score}/100`;
              return ` Margin: ${remaining}/100`;
            }
          }
        }
      }
    }
  });

  return gaugeChartInstance;
}

/**
 * 2. Study vs. Sleep vs. Screen Time Balance Chart (Bar Chart)
 */
export function renderBalanceChart(canvasId, inputs) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (balanceChartInstance) {
    balanceChartInstance.destroy();
  }

  const theme = getThemeColors();
  const studyHours = parseFloat(inputs?.studyHours) || 4;
  const sleepHours = parseFloat(inputs?.sleepHours) || 7;
  const screenTime = parseFloat(inputs?.screenTime) || 5;

  // Recommended benchmarks
  const benchmarks = [
    { label: 'Sleep Hours', user: sleepHours, recommended: 8, optimalRange: '7 - 9 hrs' },
    { label: 'Study Hours', user: studyHours, recommended: 4.5, optimalRange: '3 - 6 hrs' },
    { label: 'Screen Time', user: screenTime, recommended: 4, optimalRange: '< 5 hrs' }
  ];

  balanceChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: benchmarks.map(b => b.label),
      datasets: [
        {
          label: 'Your Current Daily Hours',
          data: benchmarks.map(b => b.user),
          backgroundColor: [
            sleepHours < 6 ? theme.accentRose : (sleepHours < 7 ? theme.accentAmber : theme.accentEmerald),
            studyHours > 8 ? theme.accentAmber : theme.accentIndigo,
            screenTime > 7 ? theme.accentRose : (screenTime > 5 ? theme.accentAmber : theme.accentTeal)
          ],
          borderRadius: 8,
          barPercentage: 0.55
        },
        {
          label: 'Recommended Benchmark',
          data: benchmarks.map(b => b.recommended),
          backgroundColor: theme.gridColor,
          borderColor: theme.mutedColor,
          borderWidth: 1,
          borderDash: [4, 4],
          borderRadius: 8,
          barPercentage: 0.55
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 14,
          title: {
            display: true,
            text: 'Hours / Day',
            color: theme.textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' }
          },
          grid: { color: theme.gridColor },
          ticks: { color: theme.mutedColor }
        },
        x: {
          grid: { display: false },
          ticks: { color: theme.textColor, font: { weight: '600' } }
        }
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: theme.textColor,
            boxWidth: 14,
            usePointStyle: true,
            font: { family: "'Plus Jakarta Sans', sans-serif" }
          }
        },
        tooltip: {
          callbacks: {
            afterBody: function(contexts) {
              const idx = contexts[0]?.dataIndex;
              if (idx !== undefined && benchmarks[idx]) {
                return `Healthy target: ${benchmarks[idx].optimalRange}`;
              }
            }
          }
        }
      }
    }
  });

  return balanceChartInstance;
}

/**
 * 3. Factor Contribution Radar / Polar Area Chart
 */
export function renderFactorRadarChart(canvasId, factorBreakdown) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (radarChartInstance) {
    radarChartInstance.destroy();
  }

  const theme = getThemeColors();
  const factors = factorBreakdown || [];

  radarChartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: factors.map(f => f.name),
      datasets: [
        {
          label: 'Stress Strain Index (%)',
          data: factors.map(f => f.score),
          backgroundColor: 'rgba(99, 102, 241, 0.25)',
          borderColor: '#6366f1',
          borderWidth: 2,
          pointBackgroundColor: factors.map(f => f.score > 65 ? '#ef4444' : (f.score > 40 ? '#f59e0b' : '#10b981')),
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: theme.gridColor },
          grid: { color: theme.gridColor },
          suggestedMin: 0,
          suggestedMax: 100,
          pointLabels: {
            color: theme.textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 11, weight: '600' }
          },
          ticks: {
            backdropColor: 'transparent',
            color: theme.mutedColor,
            stepSize: 25,
            showLabelBackdrop: false
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Strain Contribution: ${ctx.raw}% (${factors[ctx.dataIndex]?.impact})`
          }
        }
      }
    }
  });

  return radarChartInstance;
}

/**
 * 4. Historical Stress Trend Chart (Line chart over past predictions)
 */
export function renderTrendChart(canvasId, history) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  const theme = getThemeColors();
  // Reverse to show chronological left to right
  const records = [...(history || [])].reverse().slice(-10);

  if (records.length === 0) {
    return;
  }

  trendChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: records.map(r => {
        const d = new Date(r.timestamp);
        return isNaN(d) ? r.formattedDate : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }),
      datasets: [
        {
          label: 'Stress Score',
          data: records.map(r => r.stressScore),
          borderColor: '#0d9488',
          backgroundColor: 'rgba(13, 148, 136, 0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: records.map(r => r.categoryColor || '#0d9488'),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: theme.gridColor },
          ticks: {
            color: theme.mutedColor,
            callback: value => `${value}`
          },
          title: {
            display: true,
            text: 'Score (0 - 100)',
            color: theme.textColor,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12, weight: '600' }
          }
        },
        x: {
          grid: { display: false },
          ticks: { color: theme.textColor, font: { weight: '600' } }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => records[items[0].dataIndex]?.formattedDate || items[0].label,
            label: (ctx) => {
              const rec = records[ctx.dataIndex];
              return ` Stress Score: ${rec.stressScore}/100 (${rec.categoryLabel})`;
            }
          }
        }
      }
    }
  });

  return trendChartInstance;
}

/**
 * Updates charts on theme toggle or resize
 */
export function refreshAllCharts(lastPrediction, history) {
  if (lastPrediction) {
    renderGaugeChart('dashboardGaugeCanvas', lastPrediction.stressScore, lastPrediction.categoryColor);
    renderGaugeChart('modalGaugeCanvas', lastPrediction.stressScore, lastPrediction.categoryColor);
    renderBalanceChart('dashboardBalanceCanvas', lastPrediction.inputs);
    renderFactorRadarChart('dashboardRadarCanvas', lastPrediction.factorBreakdown);
  }
  if (history && history.length > 0) {
    renderTrendChart('dashboardTrendCanvas', history);
  }
}
