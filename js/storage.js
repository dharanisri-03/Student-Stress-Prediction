/**
 * Storage Manager Module: storage.js
 * Handles LocalStorage persistence for prediction history and sample demo data
 */

const STORAGE_KEY = 'mindpulse_student_stress_history';
const SETTINGS_KEY = 'mindpulse_app_settings';

// Realistic sample history to pre-populate for demo if first time
const SEED_HISTORY = [
  {
    id: 'seed_1',
    timestamp: '2026-09-10T14:30:00.000Z',
    formattedDate: '10 Sep 2026, 02:30 PM',
    stressScore: 76,
    categoryKey: 'high',
    categoryLabel: 'High Stress',
    categoryColor: '#ef4444',
    badgeClass: 'badge-high',
    icon: 'fa-frown-open',
    inputs: {
      age: 20,
      gender: 'female',
      studyHours: 8.5,
      sleepHours: 4.5,
      screenTime: 9.0,
      attendance: 72,
      pendingAssignments: 6,
      academicMarks: 64,
      examPressure: 'High',
      physicalActivity: 'Low',
      socialInteraction: 'Low',
      workload: 'High'
    },
    summary: 'High strain across sleep deficit, heavy assignment backlog, and acute exam pressure.'
  },
  {
    id: 'seed_2',
    timestamp: '2026-09-18T10:15:00.000Z',
    formattedDate: '18 Sep 2026, 10:15 AM',
    stressScore: 48,
    categoryKey: 'moderate',
    categoryLabel: 'Moderate Stress',
    categoryColor: '#f59e0b',
    badgeClass: 'badge-moderate',
    icon: 'fa-meh',
    inputs: {
      age: 21,
      gender: 'male',
      studyHours: 5.5,
      sleepHours: 6.5,
      screenTime: 6.0,
      attendance: 84,
      pendingAssignments: 3,
      academicMarks: 76,
      examPressure: 'Medium',
      physicalActivity: 'Medium',
      socialInteraction: 'Medium',
      workload: 'Medium'
    },
    summary: 'Moderate stress with manageable workload but room for sleep optimization.'
  },
  {
    id: 'seed_3',
    timestamp: '2026-09-25T09:00:00.000Z',
    formattedDate: '25 Sep 2026, 09:00 AM',
    stressScore: 28,
    categoryKey: 'low',
    categoryLabel: 'Low Stress',
    categoryColor: '#10b981',
    badgeClass: 'badge-low',
    icon: 'fa-smile-beam',
    inputs: {
      age: 20,
      gender: 'female',
      studyHours: 4.0,
      sleepHours: 8.0,
      screenTime: 3.5,
      attendance: 92,
      pendingAssignments: 1,
      academicMarks: 86,
      examPressure: 'Low',
      physicalActivity: 'High',
      socialInteraction: 'High',
      workload: 'Low'
    },
    summary: 'Excellent lifestyle balance with ample sleep, physical exercise, and manageable deadlines.'
  }
];

export const DEMO_PRESETS = {
  balanced: {
    name: 'Balanced Achiever',
    badge: 'Low Stress Sample',
    badgeClass: 'badge-low',
    data: {
      age: 20,
      gender: 'female',
      studyHours: 4.0,
      sleepHours: 8.0,
      screenTime: 3.5,
      attendance: 92,
      pendingAssignments: 1,
      academicMarks: 85,
      examPressure: 'Low',
      physicalActivity: 'High',
      socialInteraction: 'High',
      workload: 'Low'
    }
  },
  moderate: {
    name: 'Midterm Crunch Student',
    badge: 'Moderate Stress Sample',
    badgeClass: 'badge-moderate',
    data: {
      age: 21,
      gender: 'male',
      studyHours: 6.5,
      sleepHours: 6.0,
      screenTime: 6.5,
      attendance: 80,
      pendingAssignments: 3,
      academicMarks: 74,
      examPressure: 'Medium',
      physicalActivity: 'Medium',
      socialInteraction: 'Medium',
      workload: 'Medium'
    }
  },
  overwhelmed: {
    name: 'Finals Overload Student',
    badge: 'High Stress Sample',
    badgeClass: 'badge-high',
    data: {
      age: 22,
      gender: 'female',
      studyHours: 9.5,
      sleepHours: 4.5,
      screenTime: 9.0,
      attendance: 68,
      pendingAssignments: 7,
      academicMarks: 62,
      examPressure: 'High',
      physicalActivity: 'Low',
      socialInteraction: 'Low',
      workload: 'High'
    }
  }
};

/**
 * Retrieves all prediction history records from LocalStorage.
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic data for demonstration
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HISTORY));
      return [...SEED_HISTORY];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load history from LocalStorage:', e);
    return [...SEED_HISTORY];
  }
}

/**
 * Saves a new prediction to LocalStorage.
 */
export function savePrediction(prediction) {
  try {
    const current = getHistory();
    // Prepend to show latest first
    const updated = [prediction, ...current.filter(p => p.id !== prediction.id)].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save prediction to LocalStorage:', e);
    return [];
  }
}

/**
 * Deletes a specific prediction by ID.
 */
export function deletePrediction(id) {
  try {
    const current = getHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to delete prediction:', e);
    return [];
  }
}

/**
 * Clears all prediction history.
 */
export function clearAllHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  } catch (e) {
    console.error('Failed to clear history:', e);
    return [];
  }
}

/**
 * Restores sample seed data.
 */
export function restoreSeedHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_HISTORY));
    return [...SEED_HISTORY];
  } catch (e) {
    return [];
  }
}

/**
 * Exports history array as CSV file download.
 */
export function exportHistoryAsCSV() {
  const history = getHistory();
  if (!history.length) return false;

  const headers = [
    'ID', 'Date', 'Stress Score', 'Category',
    'Study Hours', 'Sleep Hours', 'Screen Time',
    'Attendance %', 'Pending Assignments', 'Academic Marks %',
    'Exam Pressure', 'Physical Activity', 'Social Interaction', 'Workload'
  ];

  const rows = history.map(h => [
    `"${h.id}"`,
    `"${h.formattedDate || h.timestamp}"`,
    h.stressScore,
    `"${h.categoryLabel}"`,
    h.inputs?.studyHours ?? '',
    h.inputs?.sleepHours ?? '',
    h.inputs?.screenTime ?? '',
    h.inputs?.attendance ?? '',
    h.inputs?.pendingAssignments ?? '',
    h.inputs?.academicMarks ?? '',
    `"${h.inputs?.examPressure ?? ''}"`,
    `"${h.inputs?.physicalActivity ?? ''}"`,
    `"${h.inputs?.socialInteraction ?? ''}"`,
    `"${h.inputs?.workload ?? ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `student_stress_history_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

/**
 * Exports history array as JSON file download.
 */
export function exportHistoryAsJSON() {
  const history = getHistory();
  if (!history.length) return false;

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `student_stress_history_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  return true;
}

/**
 * Theme & App Settings
 */
export function getSavedTheme() {
  return localStorage.getItem('mindpulse_theme') || 'light';
}

export function saveTheme(theme) {
  localStorage.setItem('mindpulse_theme', theme);
}
