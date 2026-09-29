/**
 * Main Application Controller: app.js
 * AI-Based Student Stress Level Prediction System
 * AI for Design Thinking – AI Immersion Project
 */

import { predictStressLevel, STRESS_LEVELS } from './prediction.js';
import {
  getHistory,
  savePrediction,
  deletePrediction,
  clearAllHistory,
  restoreSeedHistory,
  exportHistoryAsCSV,
  exportHistoryAsJSON,
  getSavedTheme,
  saveTheme,
  DEMO_PRESETS
} from './storage.js';
import {
  renderGaugeChart,
  renderBalanceChart,
  renderFactorRadarChart,
  renderTrendChart,
  refreshAllCharts
} from './charts.js';

// Application State
let currentPrediction = null;
let currentHistoryFilter = 'all';

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initFormControls();
  initSamplePresets();
  initFormSubmission();
  initModalActions();
  initHistorySection();
  initDesignThinkingTabs();

  // Load initial history and dashboard
  const history = getHistory();
  if (history && history.length > 0) {
    // Populate dashboard with the most recent assessment
    const latest = history[0];
    updateDashboardUI(latest);
    renderHistoryTable(history, currentHistoryFilter);
  } else {
    // If somehow empty, generate a baseline
    renderHistoryTable([], currentHistoryFilter);
  }
});

/* ==========================================================================
   1. Theme Management (Light / Dark Mode)
   ========================================================================== */
function initTheme() {
  const savedTheme = getSavedTheme();
  applyTheme(savedTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'light';
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      saveTheme(nextTheme);
      showToast(`Switched to ${nextTheme} mode`, 'info');

      // Refresh Chart.js colors to adapt to new theme
      const history = getHistory();
      refreshAllCharts(currentPrediction || history[0], history);
    });
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) {
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
      icon.style.color = '#f59e0b';
    } else {
      icon.className = 'fa-solid fa-moon';
      icon.style.color = '';
    }
  }
}

/* ==========================================================================
   2. Navigation & Mobile Menu
   ========================================================================== */
function initNavigation() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navbar = document.getElementById('mainNavbar');
  const navLinks = document.querySelectorAll('.nav-item a');

  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      navbar.classList.toggle('mobile-nav-active');
    });
  }

  // Active state on click / scroll
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      navbar.classList.remove('mobile-nav-active');
    });
  });

  // Highlight nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   3. Form Slider Badges & Controls
   ========================================================================== */
function initFormControls() {
  const sliders = [
    { inputId: 'studyHours', badgeId: 'studyHoursVal', suffix: ' hrs' },
    { inputId: 'sleepHours', badgeId: 'sleepHoursVal', suffix: ' hrs' },
    { inputId: 'screenTime', badgeId: 'screenTimeVal', suffix: ' hrs' },
    { inputId: 'attendance', badgeId: 'attendanceVal', suffix: '%' },
    { inputId: 'pendingAssignments', badgeId: 'pendingAssignmentsVal', suffix: ' tasks' },
    { inputId: 'academicMarks', badgeId: 'academicMarksVal', suffix: '%' }
  ];

  sliders.forEach(s => {
    const el = document.getElementById(s.inputId);
    const badge = document.getElementById(s.badgeId);
    if (el && badge) {
      el.addEventListener('input', () => {
        badge.textContent = `${el.value}${s.suffix}`;
      });
    }
  });

  // Reset Button
  const resetBtn = document.getElementById('formResetBtn');
  const form = document.getElementById('stressAssessmentForm');
  if (resetBtn && form) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      // Restore default badges
      sliders.forEach(s => {
        const el = document.getElementById(s.inputId);
        const badge = document.getElementById(s.badgeId);
        if (el && badge) {
          badge.textContent = `${el.value}${s.suffix}`;
        }
      });
      // Clear errors
      document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));
      showToast('Form fields reset to default values', 'info');
    });
  }
}

/* ==========================================================================
   4. Quick Demo Presets ("Try Sample Data")
   ========================================================================== */
function initSamplePresets() {
  const btnBalanced = document.getElementById('presetBalancedBtn');
  const btnModerate = document.getElementById('presetModerateBtn');
  const btnOverwhelmed = document.getElementById('presetOverwhelmedBtn');

  if (btnBalanced) {
    btnBalanced.addEventListener('click', () => applyPreset(DEMO_PRESETS.balanced));
  }
  if (btnModerate) {
    btnModerate.addEventListener('click', () => applyPreset(DEMO_PRESETS.moderate));
  }
  if (btnOverwhelmed) {
    btnOverwhelmed.addEventListener('click', () => applyPreset(DEMO_PRESETS.overwhelmed));
  }
}

function applyPreset(preset) {
  if (!preset || !preset.data) return;
  const data = preset.data;

  // Study hours
  setRangeValue('studyHours', 'studyHoursVal', data.studyHours, ' hrs');
  // Sleep hours
  setRangeValue('sleepHours', 'sleepHoursVal', data.sleepHours, ' hrs');
  // Screen time
  setRangeValue('screenTime', 'screenTimeVal', data.screenTime, ' hrs');
  // Attendance
  setRangeValue('attendance', 'attendanceVal', data.attendance, '%');
  // Pending assignments
  setRangeValue('pendingAssignments', 'pendingAssignmentsVal', data.pendingAssignments, ' tasks');
  // Academic marks
  setRangeValue('academicMarks', 'academicMarksVal', data.academicMarks, '%');

  // Age & Gender
  const ageInput = document.getElementById('age');
  if (ageInput) ageInput.value = data.age;
  const genderInput = document.getElementById('gender');
  if (genderInput) genderInput.value = data.gender;

  // Radio button groups
  setRadioValue('examPressure', data.examPressure);
  setRadioValue('physicalActivity', data.physicalActivity);
  setRadioValue('socialInteraction', data.socialInteraction);
  setRadioValue('workload', data.workload);

  // Clear errors
  document.querySelectorAll('.form-group').forEach(g => g.classList.remove('has-error'));

  showToast(`Loaded sample scenario: "${preset.name}"`, 'success');
}

function setRangeValue(id, badgeId, value, suffix) {
  const input = document.getElementById(id);
  const badge = document.getElementById(badgeId);
  if (input) input.value = value;
  if (badge) badge.textContent = `${value}${suffix}`;
}

function setRadioValue(name, value) {
  const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
}

/* ==========================================================================
   5. Form Validation & Submission
   ========================================================================== */
function initFormSubmission() {
  const form = document.getElementById('stressAssessmentForm');
  const submitBtn = document.getElementById('predictSubmitBtn');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validation
    const ageInput = document.getElementById('age');
    const age = parseInt(ageInput.value, 10);
    let hasError = false;

    if (isNaN(age) || age < 15 || age > 60) {
      document.getElementById('groupAge')?.classList.add('has-error');
      hasError = true;
    } else {
      document.getElementById('groupAge')?.classList.remove('has-error');
    }

    if (hasError) {
      showToast('Please fix the errors in the form before proceeding.', 'warning');
      return;
    }

    // Button loading animation
    if (submitBtn) {
      const origHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Analyzing with AI...`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;

        // Process prediction
        executePrediction();
      }, 450);
    } else {
      executePrediction();
    }
  });
}

function getFormData() {
  const form = document.getElementById('stressAssessmentForm');
  const formData = new FormData(form);

  return {
    age: parseInt(formData.get('age'), 10) || 20,
    gender: formData.get('gender') || 'female',
    studyHours: parseFloat(formData.get('studyHours')) || 4.0,
    sleepHours: parseFloat(formData.get('sleepHours')) || 7.0,
    screenTime: parseFloat(formData.get('screenTime')) || 5.0,
    attendance: parseFloat(formData.get('attendance')) || 85,
    pendingAssignments: parseInt(formData.get('pendingAssignments'), 10) || 0,
    academicMarks: parseFloat(formData.get('academicMarks')) || 75,
    examPressure: formData.get('examPressure') || 'Medium',
    physicalActivity: formData.get('physicalActivity') || 'Medium',
    socialInteraction: formData.get('socialInteraction') || 'Medium',
    workload: formData.get('workload') || 'Medium'
  };
}

function executePrediction() {
  const inputs = getFormData();
  const prediction = predictStressLevel(inputs);
  currentPrediction = prediction;

  // Persist to LocalStorage
  savePrediction(prediction);

  // Update UI components
  showResultModal(prediction);
  updateDashboardUI(prediction);

  const history = getHistory();
  renderHistoryTable(history, currentHistoryFilter);
  renderTrendChart('dashboardTrendCanvas', history);

  showToast(`Prediction complete: ${prediction.categoryLabel} (${prediction.stressScore}/100)`, 'success');
}

/* ==========================================================================
   6. Result Modal & Rendering
   ========================================================================== */
function initModalActions() {
  const modal = document.getElementById('predictionResultModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const closeActionBtn = document.getElementById('modalCloseActionBtn');
  const goDashboardBtn = document.getElementById('modalGoDashboardBtn');
  const printBtn = document.getElementById('modalPrintBtn');

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeActionBtn) closeActionBtn.addEventListener('click', closeModal);
  if (goDashboardBtn) goDashboardBtn.addEventListener('click', closeModal);

  // Close on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Print Summary button
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }
}

function showResultModal(prediction) {
  const modal = document.getElementById('predictionResultModal');
  if (!modal) return;

  // Score & Category
  const scoreDisplay = document.getElementById('modalScoreDisplay');
  const categoryTitle = document.getElementById('modalCategoryTitle');
  const categoryBadge = document.getElementById('modalCategoryBadge');
  const summaryText = document.getElementById('modalSummaryText');
  const heroCard = document.getElementById('modalResultHeroCard');

  if (scoreDisplay) scoreDisplay.textContent = prediction.stressScore;
  if (categoryTitle) {
    categoryTitle.innerHTML = `<i class="fa-solid ${prediction.icon}"></i> ${prediction.categoryLabel}`;
    categoryTitle.style.color = prediction.categoryColor;
  }
  if (categoryBadge) {
    categoryBadge.className = `badge ${prediction.badgeClass}`;
    categoryBadge.textContent = `${prediction.categoryLabel} Risk`;
  }
  if (summaryText) summaryText.textContent = prediction.summary;

  // Apply card styling class
  if (heroCard) {
    heroCard.className = `result-hero-card result-${prediction.categoryKey}`;
  }

  // Render Gauge Chart in Modal
  renderGaugeChart('modalGaugeCanvas', prediction.stressScore, prediction.categoryColor);

  // Render Factor Breakdown Grid
  const factorsContainer = document.getElementById('modalFactorsContainer');
  if (factorsContainer) {
    factorsContainer.innerHTML = prediction.factorBreakdown.map(factor => `
      <div class="factor-progress-item">
        <div class="factor-progress-head">
          <span>${factor.name}</span>
          <span class="factor-score-num" style="color: ${factor.score > 60 ? '#ef4444' : (factor.score > 35 ? '#f59e0b' : '#10b981')};">
            ${factor.score}% (${factor.impact})
          </span>
        </div>
        <div class="factor-bar-bg">
          <div class="factor-bar-fill" style="width: ${factor.score}%; background: ${factor.score > 60 ? '#ef4444' : (factor.score > 35 ? '#f59e0b' : '#10b981')};"></div>
        </div>
        <div class="factor-detail-sub">${factor.description}</div>
      </div>
    `).join('');
  }

  // Render Recommendations List
  const recsList = document.getElementById('modalRecsList');
  if (recsList) {
    recsList.innerHTML = prediction.recommendations.map(rec => `
      <div class="rec-item-card">
        <div class="rec-icon-box">
          <i class="fa-solid ${rec.icon}"></i>
        </div>
        <div class="rec-content">
          <div class="rec-content-header">
            <span class="rec-title">${rec.title}</span>
            <span class="badge ${rec.priority === 'High' ? 'badge-high' : (rec.priority === 'Medium' ? 'badge-moderate' : 'badge-low')}">
              ${rec.priority} Priority
            </span>
          </div>
          <p class="rec-desc">${rec.text}</p>
        </div>
      </div>
    `).join('');
  }

  // Open modal
  modal.classList.add('active');
}

/* ==========================================================================
   7. Dashboard Analytics UI
   ========================================================================== */
function updateDashboardUI(prediction) {
  if (!prediction) return;

  // Stat Cards
  const statScore = document.getElementById('dashStatScore');
  const statCategory = document.getElementById('dashStatCategory');
  const statStudy = document.getElementById('dashStatStudy');
  const statSleep = document.getElementById('dashStatSleep');
  const statAcademic = document.getElementById('dashStatAcademic');
  const gaugeBadge = document.getElementById('dashGaugeBadge');

  if (statScore) statScore.textContent = `${prediction.stressScore} / 100`;
  if (statCategory) {
    statCategory.textContent = `${prediction.categoryLabel}`;
    statCategory.style.color = prediction.categoryColor;
  }
  if (statStudy) statStudy.textContent = `${prediction.inputs?.studyHours ?? 4} hrs`;
  if (statSleep) statSleep.textContent = `${prediction.inputs?.sleepHours ?? 7} hrs`;
  if (statAcademic) statAcademic.textContent = `${prediction.inputs?.academicMarks ?? 75}% marks`;

  if (gaugeBadge) {
    gaugeBadge.className = `badge ${prediction.badgeClass}`;
    gaugeBadge.textContent = prediction.categoryLabel;
  }

  // Render All Dashboard Charts
  renderGaugeChart('dashboardGaugeCanvas', prediction.stressScore, prediction.categoryColor);
  renderBalanceChart('dashboardBalanceCanvas', prediction.inputs);
  renderFactorRadarChart('dashboardRadarCanvas', prediction.factorBreakdown);

  // Update Hero section preview meter as well
  const heroDisplayScore = document.getElementById('heroDisplayScore');
  const heroDisplayCaption = document.getElementById('heroDisplayCaption');
  const heroPreviewBadge = document.getElementById('heroPreviewBadge');
  if (heroDisplayScore) heroDisplayScore.textContent = prediction.stressScore;
  if (heroDisplayCaption) {
    heroDisplayCaption.textContent = prediction.categoryLabel;
    heroDisplayCaption.style.color = prediction.categoryColor;
  }
  if (heroPreviewBadge) {
    heroPreviewBadge.className = `badge ${prediction.badgeClass}`;
    heroPreviewBadge.textContent = `${prediction.categoryLabel} Level`;
  }
}

/* ==========================================================================
   8. Prediction History Section
   ========================================================================== */
function initHistorySection() {
  // Filter buttons
  const filterBtns = document.querySelectorAll('.history-filter-group .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHistoryFilter = btn.getAttribute('data-filter') || 'all';
      renderHistoryTable(getHistory(), currentHistoryFilter);
    });
  });

  // Export CSV
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', () => {
      const success = exportHistoryAsCSV();
      if (success) showToast('Prediction history exported as CSV', 'success');
      else showToast('No history records to export.', 'warning');
    });
  }

  // Export JSON
  const exportJsonBtn = document.getElementById('exportJsonBtn');
  if (exportJsonBtn) {
    exportJsonBtn.addEventListener('click', () => {
      const success = exportHistoryAsJSON();
      if (success) showToast('Prediction history exported as JSON', 'success');
      else showToast('No history records to export.', 'warning');
    });
  }

  // Restore Seed Demo Data
  const restoreSeedsBtn = document.getElementById('restoreSeedsBtn');
  if (restoreSeedsBtn) {
    restoreSeedsBtn.addEventListener('click', () => {
      const restored = restoreSeedHistory();
      renderHistoryTable(restored, currentHistoryFilter);
      if (restored.length > 0) {
        updateDashboardUI(restored[0]);
        renderTrendChart('dashboardTrendCanvas', restored);
      }
      showToast('Sample demonstration history restored', 'success');
    });
  }

  // Clear All History
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all prediction history?')) {
        clearAllHistory();
        renderHistoryTable([], currentHistoryFilter);
        renderTrendChart('dashboardTrendCanvas', []);
        showToast('All prediction history cleared', 'info');
      }
    });
  }
}

function renderHistoryTable(history, filter = 'all') {
  const tableBody = document.getElementById('historyTableBody');
  const emptyState = document.getElementById('emptyHistoryState');
  const table = document.getElementById('historyTable');

  if (!tableBody) return;

  let filtered = history || [];
  if (filter !== 'all') {
    filtered = filtered.filter(item => item.categoryKey === filter);
  }

  if (filtered.length === 0) {
    tableBody.innerHTML = '';
    if (table) table.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (table) table.style.display = 'table';
  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = filtered.map(item => `
    <tr data-id="${item.id}">
      <td>
        <strong>${item.formattedDate || new Date(item.timestamp).toLocaleDateString()}</strong>
      </td>
      <td>
        <span style="font-family: var(--font-heading); font-size: 1.15rem; font-weight: 800; color: ${item.categoryColor};">
          ${item.stressScore}
        </span>
        <span style="color: var(--text-muted); font-size: 0.8rem;">/ 100</span>
      </td>
      <td>
        <span class="badge ${item.badgeClass}">
          <i class="fa-solid ${item.icon || 'fa-circle'}"></i> ${item.categoryLabel}
        </span>
      </td>
      <td>
        <span style="font-size: 0.88rem;">
          <i class="fa-solid fa-book-open" title="Study"></i> ${item.inputs?.studyHours ?? 0}h &bull; 
          <i class="fa-solid fa-bed" title="Sleep"></i> ${item.inputs?.sleepHours ?? 0}h
        </span>
      </td>
      <td>
        <span style="font-size: 0.88rem;">
          ${item.inputs?.pendingAssignments ?? 0} tasks &bull; ${item.inputs?.examPressure ?? 'N/A'} pressure
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.4rem;">
          <button type="button" class="btn btn-secondary btn-sm action-view-btn" data-id="${item.id}" title="View details">
            <i class="fa-solid fa-eye"></i> View
          </button>
          <button type="button" class="btn btn-secondary btn-sm action-delete-btn" data-id="${item.id}" title="Delete record" style="color: var(--status-high);">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  // Row Action Event Listeners
  tableBody.querySelectorAll('.action-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const item = history.find(h => h.id === id);
      if (item) {
        currentPrediction = item;
        showResultModal(item);
        updateDashboardUI(item);
      }
    });
  });

  tableBody.querySelectorAll('.action-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const updated = deletePrediction(id);
      renderHistoryTable(updated, currentHistoryFilter);
      renderTrendChart('dashboardTrendCanvas', updated);
      showToast('Assessment record deleted', 'info');
    });
  });
}

/* ==========================================================================
   9. Design Thinking Section Tabs
   ========================================================================== */
function initDesignThinkingTabs() {
  const tabs = document.querySelectorAll('#dtTabsContainer .dt-stage-tab');
  const panels = document.querySelectorAll('.dt-stage-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const stage = tab.getAttribute('data-stage');
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const activePanel = document.getElementById(`dt-panel-${stage}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   10. Toast Notification Helper
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let icon = 'fa-info-circle';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
