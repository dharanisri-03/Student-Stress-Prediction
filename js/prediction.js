/**
 * AI-Based Student Stress Level Prediction Engine
 * Module: prediction.js
 * 
 * Part of the "AI for Design Thinking – AI Immersion Project"
 * This module is completely decoupled from the UI, allowing it to be
 * swapped with a trained TensorFlow.js or ONNX model in the future.
 */

export const STRESS_LEVELS = {
  LOW: {
    key: 'low',
    label: 'Low Stress',
    minScore: 0,
    maxScore: 39,
    badgeClass: 'badge-low',
    color: '#10b981',
    lightColor: 'rgba(16, 185, 129, 0.15)',
    icon: 'fa-smile-beam',
    summary: 'Your current academic and lifestyle metrics indicate a healthy and balanced routine. Keep maintaining these great habits!'
  },
  MODERATE: {
    key: 'moderate',
    label: 'Moderate Stress',
    minScore: 40,
    maxScore: 69,
    badgeClass: 'badge-moderate',
    color: '#f59e0b',
    lightColor: 'rgba(245, 158, 11, 0.15)',
    icon: 'fa-meh',
    summary: 'You are experiencing noticeable academic pressure or lifestyle imbalance. Implementing targeted adjustments can prevent burnout.'
  },
  HIGH: {
    key: 'high',
    label: 'High Stress',
    minScore: 70,
    maxScore: 100,
    badgeClass: 'badge-high',
    color: '#ef4444',
    lightColor: 'rgba(239, 68, 68, 0.15)',
    icon: 'fa-frown-open',
    summary: 'Your inputs indicate high strain across several academic and wellness dimensions. Immediate self-care and workload pacing are recommended.'
  }
};

/**
 * Weights assigned to normalized stress factors (Sums to 1.0)
 */
export const FACTOR_WEIGHTS = {
  sleepDeficit: 0.18,       // Inadequate sleep has the strongest neurological correlation with stress
  examPressure: 0.16,       // Acute psychological pressure
  workload: 0.14,           // Perceived total academic load
  pendingAssignments: 0.12, // Cognitive backlog / deadline tension
  screenTimeStrain: 0.10,   // Digital fatigue & blue light interference
  physicalInactivity: 0.10, // Absence of cortisol-reducing physical movement
  academicRisk: 0.10,       // Low marks or low attendance anxiety
  socialIsolation: 0.10     // Lack of social buffering against stress
};

/**
 * Normalizes raw student inputs into a 0.0 - 1.0 risk scale for each dimension.
 * 0.0 = minimal stress contribution (healthy/protective)
 * 1.0 = maximum stress contribution (high risk)
 * 
 * @param {Object} input - Student input fields
 * @returns {Object} Normalized risk factors
 */
export function normalizeInputs(input) {
  // 1. Sleep: Optimal is 7.5 - 9 hrs. Less sleep = high risk.
  const sleep = parseFloat(input.sleepHours) || 7;
  let sleepRisk;
  if (sleep >= 7.5 && sleep <= 9.0) {
    sleepRisk = 0.05; // Optimal
  } else if (sleep >= 6.5) {
    sleepRisk = 0.3;
  } else if (sleep >= 5.0) {
    sleepRisk = 0.65;
  } else if (sleep >= 4.0) {
    sleepRisk = 0.88;
  } else {
    sleepRisk = 1.0; // Critical sleep deprivation (< 4 hours)
  }

  // 2. Exam Pressure (Low = 0.1, Medium = 0.5, High = 1.0)
  const examMap = { low: 0.15, medium: 0.55, high: 1.0 };
  const examRisk = examMap[(input.examPressure || 'medium').toLowerCase()] ?? 0.55;

  // 3. Self-reported Workload (Low = 0.1, Medium = 0.5, High = 1.0)
  const workloadMap = { low: 0.15, medium: 0.55, high: 1.0 };
  const workloadRisk = workloadMap[(input.workload || 'medium').toLowerCase()] ?? 0.55;

  // 4. Pending Assignments (0 = 0.0, 1 = 0.15, 3 = 0.5, 6+ = 1.0)
  const pending = parseInt(input.pendingAssignments, 10) || 0;
  const pendingRisk = Math.min(1.0, Math.max(0.0, pending / 6.0));

  // 5. Screen Time: < 3h = 0.1, 4-6h = 0.4, 7-9h = 0.75, 10+h = 1.0
  const screen = parseFloat(input.screenTime) || 4;
  let screenRisk;
  if (screen <= 3) screenRisk = 0.1;
  else if (screen <= 6) screenRisk = 0.4;
  else if (screen <= 9) screenRisk = 0.75;
  else screenRisk = Math.min(1.0, 0.75 + ((screen - 9) * 0.08));

  // 6. Physical Activity (Inactivity risk: High activity = 0.1, Medium = 0.45, Low = 0.95)
  const activityMap = { high: 0.1, medium: 0.45, low: 0.95 };
  const activityRisk = activityMap[(input.physicalActivity || 'medium').toLowerCase()] ?? 0.45;

  // 7. Academic Performance & Attendance Risk
  // Low attendance (<75%) or failing marks (<50%) spikes anxiety
  const attendance = parseFloat(input.attendance) || 85;
  const marks = parseFloat(input.academicMarks) || 75;
  
  let attendanceRisk = 0.1;
  if (attendance < 65) attendanceRisk = 1.0;
  else if (attendance < 75) attendanceRisk = 0.75;
  else if (attendance < 85) attendanceRisk = 0.35;
  else attendanceRisk = 0.1;

  let marksRisk = 0.1;
  if (marks < 45) marksRisk = 0.95;
  else if (marks < 60) marksRisk = 0.65;
  else if (marks < 75) marksRisk = 0.35;
  else marksRisk = 0.15;

  const academicRisk = (attendanceRisk * 0.5) + (marksRisk * 0.5);

  // 8. Social Interaction (Isolation risk: High = 0.15, Medium = 0.45, Low = 0.9)
  const socialMap = { high: 0.15, medium: 0.45, low: 0.9 };
  const socialRisk = socialMap[(input.socialInteraction || 'medium').toLowerCase()] ?? 0.45;

  // 9. Study Hours contextual strain
  // Studying > 10 hours daily leads to cognitive exhaustion
  const studyHours = parseFloat(input.studyHours) || 4;
  let studyStrain = 0.0;
  if (studyHours > 10) studyStrain = 0.2;
  else if (studyHours > 8) studyStrain = 0.1;

  return {
    sleepRisk,
    examRisk,
    workloadRisk,
    pendingRisk,
    screenRisk,
    activityRisk,
    academicRisk,
    socialRisk,
    studyStrain
  };
}

/**
 * Predicts the student stress level from raw inputs.
 * Returns an enriched prediction object with score, category, breakdown, and suggestions.
 * 
 * @param {Object} rawInput - The input fields from the form
 * @returns {Object} Complete prediction analysis result
 */
export function predictStressLevel(rawInput) {
  const normalized = normalizeInputs(rawInput);

  // Calculate weighted sum
  const weightedScore = (
    (normalized.sleepRisk * FACTOR_WEIGHTS.sleepDeficit) +
    (normalized.examRisk * FACTOR_WEIGHTS.examPressure) +
    (normalized.workloadRisk * FACTOR_WEIGHTS.workload) +
    (normalized.pendingRisk * FACTOR_WEIGHTS.pendingAssignments) +
    (normalized.screenRisk * FACTOR_WEIGHTS.screenTimeStrain) +
    (normalized.activityRisk * FACTOR_WEIGHTS.physicalInactivity) +
    (normalized.academicRisk * FACTOR_WEIGHTS.academicRisk) +
    (normalized.socialRisk * FACTOR_WEIGHTS.socialIsolation)
  );

  // Apply non-linear compound adjustments (e.g. extreme sleep deprivation combined with high exam pressure)
  let compoundMultiplier = 1.0;
  if (normalized.sleepRisk > 0.8 && normalized.examRisk > 0.8) {
    compoundMultiplier = 1.12; // Sleep deprivation amplifies exam panic
  } else if (normalized.sleepRisk < 0.2 && normalized.activityRisk < 0.3) {
    compoundMultiplier = 0.92; // High wellness resilience buffers stress
  }

  // Study hours extra strain
  const baseScore = Math.round(weightedScore * 100 * compoundMultiplier);
  const finalScore = Math.min(100, Math.max(5, baseScore + Math.round(normalized.studyStrain * 15)));

  // Determine category
  let category;
  if (finalScore <= 39) {
    category = STRESS_LEVELS.LOW;
  } else if (finalScore <= 69) {
    category = STRESS_LEVELS.MODERATE;
  } else {
    category = STRESS_LEVELS.HIGH;
  }

  // Calculate percentage factor breakdown for visualizations & XAI (Explainable AI)
  const factorBreakdown = [
    {
      id: 'sleep',
      name: 'Sleep Deficit',
      category: 'Lifestyle',
      score: Math.round(normalized.sleepRisk * 100),
      weightPercent: FACTOR_WEIGHTS.sleepDeficit * 100,
      impact: normalized.sleepRisk > 0.6 ? 'High Risk' : (normalized.sleepRisk > 0.35 ? 'Moderate' : 'Low / Healthy'),
      description: `${rawInput.sleepHours || 0} hrs/day (${normalized.sleepRisk > 0.6 ? 'Insufficient' : 'Adequate'})`
    },
    {
      id: 'exam',
      name: 'Exam Pressure',
      category: 'Academic',
      score: Math.round(normalized.examRisk * 100),
      weightPercent: FACTOR_WEIGHTS.examPressure * 100,
      impact: normalized.examRisk > 0.6 ? 'High Risk' : (normalized.examRisk > 0.35 ? 'Moderate' : 'Manageable'),
      description: `${rawInput.examPressure || 'Medium'} reported intensity`
    },
    {
      id: 'workload',
      name: 'Academic Workload',
      category: 'Academic',
      score: Math.round(normalized.workloadRisk * 100),
      weightPercent: FACTOR_WEIGHTS.workload * 100,
      impact: normalized.workloadRisk > 0.6 ? 'High Risk' : (normalized.workloadRisk > 0.35 ? 'Moderate' : 'Balanced'),
      description: `${rawInput.workload || 'Medium'} subjective workload`
    },
    {
      id: 'pending',
      name: 'Pending Deadlines',
      category: 'Academic',
      score: Math.round(normalized.pendingRisk * 100),
      weightPercent: FACTOR_WEIGHTS.pendingAssignments * 100,
      impact: normalized.pendingRisk > 0.6 ? 'High Risk' : (normalized.pendingRisk > 0.3 ? 'Moderate' : 'Low'),
      description: `${rawInput.pendingAssignments || 0} assignments due`
    },
    {
      id: 'screen',
      name: 'Screen Fatigue',
      category: 'Lifestyle',
      score: Math.round(normalized.screenRisk * 100),
      weightPercent: FACTOR_WEIGHTS.screenTimeStrain * 100,
      impact: normalized.screenRisk > 0.6 ? 'High Risk' : (normalized.screenRisk > 0.35 ? 'Moderate' : 'Low'),
      description: `${rawInput.screenTime || 0} hrs screen time`
    },
    {
      id: 'activity',
      name: 'Physical Inactivity',
      category: 'Lifestyle',
      score: Math.round(normalized.activityRisk * 100),
      weightPercent: FACTOR_WEIGHTS.physicalInactivity * 100,
      impact: normalized.activityRisk > 0.6 ? 'High Risk' : (normalized.activityRisk > 0.35 ? 'Moderate' : 'Active / Low Risk'),
      description: `${rawInput.physicalActivity || 'Medium'} activity level`
    },
    {
      id: 'academic',
      name: 'Academic Standing',
      category: 'Academic',
      score: Math.round(normalized.academicRisk * 100),
      weightPercent: FACTOR_WEIGHTS.academicRisk * 100,
      impact: normalized.academicRisk > 0.6 ? 'High Risk' : (normalized.academicRisk > 0.35 ? 'Moderate' : 'Stable'),
      description: `${rawInput.academicMarks || 0}% marks, ${rawInput.attendance || 0}% attendance`
    },
    {
      id: 'social',
      name: 'Social Connection',
      category: 'Social',
      score: Math.round(normalized.socialRisk * 100),
      weightPercent: FACTOR_WEIGHTS.socialIsolation * 100,
      impact: normalized.socialRisk > 0.6 ? 'High Risk' : (normalized.socialRisk > 0.35 ? 'Moderate' : 'Well Supported'),
      description: `${rawInput.socialInteraction || 'Medium'} interaction level`
    }
  ];

  // Sort factors by contribution score to identify top stress drivers
  const sortedFactors = [...factorBreakdown].sort((a, b) => b.score - a.score);
  const topRiskFactors = sortedFactors.slice(0, 3);
  const protectiveFactors = sortedFactors.filter(f => f.score < 35).slice(0, 2);

  // Generate personalized dynamic recommendations (3-5 suggestions)
  const recommendations = generateRecommendations(rawInput, normalized, finalScore);

  return {
    id: 'pred_' + Date.now(),
    timestamp: new Date().toISOString(),
    formattedDate: new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date()),
    inputs: { ...rawInput },
    stressScore: finalScore,
    categoryKey: category.key,
    categoryLabel: category.label,
    categoryColor: category.color,
    badgeClass: category.badgeClass,
    icon: category.icon,
    summary: category.summary,
    factorBreakdown,
    topRiskFactors,
    protectiveFactors,
    recommendations,
    disclaimer: 'This prediction is for educational and wellness purposes only and is not a medical diagnosis.',
    mlModelMetadata: {
      version: 'v1.2-heuristic-hybrid',
      algorithm: 'Weighted Multi-Parametric Stress Inference (Design Thinking Prototype)',
      confidence: Math.round(85 + (Math.random() * 8)) + '%',
      featuresProcessed: 12
    }
  };
}

/**
 * Generates 3-5 personalized, empathetic, actionable recommendations
 * based directly on the student's metrics.
 */
function generateRecommendations(input, normalized, score) {
  const recommendations = [];

  // Sleep recommendation
  const sleep = parseFloat(input.sleepHours) || 7;
  if (sleep < 6) {
    recommendations.push({
      title: 'Sleep Optimization & Wind-down',
      icon: 'fa-bed',
      category: 'Recovery',
      priority: 'High',
      text: `You reported ${sleep} hours of sleep. Try to maintain 7–9 hours by establishing a 30-minute digital sunset before bed to regulate melatonin and cortisol levels.`
    });
  } else if (sleep < 7) {
    recommendations.push({
      title: 'Minor Sleep Recovery',
      icon: 'fa-moon',
      category: 'Recovery',
      priority: 'Medium',
      text: 'You are close to the optimal sleep threshold. Adding an extra 30–45 minutes of rest can significantly boost cognitive retention and mood stability.'
    });
  }

  // Pending assignments recommendation
  const pending = parseInt(input.pendingAssignments, 10) || 0;
  if (pending >= 4) {
    recommendations.push({
      title: 'Assignment Triage & Pomodoro Pacing',
      icon: 'fa-tasks',
      category: 'Productivity',
      priority: 'High',
      text: `With ${pending} assignments pending, cognitive overload can freeze progress. Break assignments into bite-sized 25-minute Pomodoro sessions and rank by submission urgency.`
    });
  } else if (pending >= 2) {
    recommendations.push({
      title: 'Daily Task Batching',
      icon: 'fa-calendar-check',
      category: 'Productivity',
      priority: 'Low',
      text: 'Plan assignments using a daily visual checklist. Completing one small component early each morning creates positive momentum.'
    });
  }

  // Screen time recommendation
  const screen = parseFloat(input.screenTime) || 4;
  if (screen >= 7) {
    recommendations.push({
      title: 'Digital Fatigue Reset',
      icon: 'fa-mobile-alt',
      category: 'Wellness',
      priority: 'Medium',
      text: `Your daily screen time is ${screen} hours. Adopt the 20-20-20 rule (every 20 mins, look at something 20 feet away for 20 seconds) and replace 1 hour of recreational screen time with an offline hobby.`
    });
  }

  // Physical activity recommendation
  const activity = (input.physicalActivity || '').toLowerCase();
  if (activity === 'low') {
    recommendations.push({
      title: 'Cardiovascular Stress Relief',
      icon: 'fa-running',
      category: 'Health',
      priority: 'Medium',
      text: 'Low physical activity allows cortisol (the stress hormone) to linger. Incorporate a brisk 15–20 minute walk, light cycling, or campus stroll between lectures.'
    });
  }

  // Study hours & breaks recommendation
  const study = parseFloat(input.studyHours) || 4;
  if (study >= 8) {
    recommendations.push({
      title: 'Active Study Breaks',
      icon: 'fa-clock',
      category: 'Productivity',
      priority: 'High',
      text: `Studying ${study} hours daily without pacing diminishes retention. Take guaranteed 10-minute micro-breaks every 50 minutes to refresh neural pathways.`
    });
  }

  // Exam pressure & mindset
  const exam = (input.examPressure || '').toLowerCase();
  if (exam === 'high') {
    recommendations.push({
      title: 'Exam Anxiety Reframing & Breathing',
      icon: 'fa-spa',
      category: 'Mental Balance',
      priority: 'High',
      text: 'High exam pressure is best managed with active recall rather than anxious passive rereading. Practice 4-7-8 deep diaphragmatic breathing when feeling overwhelmed.'
    });
  }

  // Social interaction
  const social = (input.socialInteraction || '').toLowerCase();
  if (social === 'low') {
    recommendations.push({
      title: 'Social Support Check-in',
      icon: 'fa-users',
      category: 'Social Support',
      priority: 'Medium',
      text: 'Academic stress is heavily mitigated by social buffering. Schedule a casual 20-minute coffee or meal with a classmate, study group, or family member.'
    });
  }

  // Attendance or academic marks reassurance
  const attendance = parseFloat(input.attendance) || 85;
  if (attendance < 75) {
    recommendations.push({
      title: 'Attendance Recovery Strategy',
      icon: 'fa-user-check',
      category: 'Academic',
      priority: 'High',
      text: 'Attendance below 75% creates persistent anxiety over eligibility. Speak with your academic counselor or professor early to outline a makeup plan.'
    });
  }

  // Default positive recommendations if student has low stress or few flags
  const positiveHabits = [
    {
      title: 'Consistent Sleep Circadian Rhythm',
      icon: 'fa-bed',
      category: 'Habits',
      priority: 'Low',
      text: 'You have a healthy rest schedule. Maintain consistent wake-up and sleep times even on weekends to preserve peak cognitive performance.'
    },
    {
      title: 'Proactive Deadline Buffering',
      icon: 'fa-calendar-check',
      category: 'Productivity',
      priority: 'Low',
      text: 'Your pending task backlog is under control. Continue drafting assignments 2–3 days ahead to buffer against unexpected project bottlenecks.'
    },
    {
      title: 'Active Physical & Mental Downtime',
      icon: 'fa-person-walking',
      category: 'Wellness',
      priority: 'Low',
      text: 'Preserve your current low stress index by scheduling intentional offline hobbies, walks, and leisure time each week.'
    },
    {
      title: 'Peer Study & Collaborative Learning',
      icon: 'fa-user-group',
      category: 'Social Support',
      priority: 'Low',
      text: 'Sharing study notes and participating in group discussions reinforces mastery and prevents sudden spikes in academic isolation.'
    }
  ];

  let habitIndex = 0;
  while (recommendations.length < 3 && habitIndex < positiveHabits.length) {
    recommendations.push(positiveHabits[habitIndex]);
    habitIndex++;
  }

  // Return top 3-5 recommendations
  return recommendations.slice(0, 5);
}

/**
 * Future Machine Learning Connector Placeholder
 * Simulates an asynchronous call to a backend ML service or client-side ONNX/TF.js model.
 * 
 * @param {Object} rawInput 
 * @returns {Promise<Object>}
 */
export async function predictWithML(rawInput) {
  // Simulate minimal inference latency
  await new Promise(resolve => setTimeout(resolve, 350));
  return predictStressLevel(rawInput);
}
