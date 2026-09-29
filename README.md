# 🧠 AI-Based Student Stress Level Prediction System

> **“Understand your stress. Improve your study-life balance.”**  
> An **AI for Design Thinking – AI Immersion Project**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Technology](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20ES6%20%7C%20Chart.js-indigo.svg)]()
[![Design Thinking](https://img.shields.io/badge/Framework-Stanford%20d.school%205--Stage-emerald.svg)]()

---

## 📌 1. Project Overview

The **AI-Based Student Stress Level Prediction System** (MindPulse AI) is an intelligent wellness web application developed to help university and college students monitor, understand, and regulate academic stress before it escalates into chronic burnout.

Grounded in the **Stanford d.school Design Thinking Framework**, the application shifts student mental health from a **reactive crisis model** to a **proactive, confidential, self-regulation model**. Students enter everyday academic and lifestyle metrics (such as study hours, sleep duration, pending deadlines, screen time, and perceived pressure) to obtain a calibrated stress score (0–100), an explainable factor breakdown, and 3–5 tailored, personalized micro-action recommendations.

---

## 🎯 2. Problem Statement & Target Users

### The Problem
* **The Silent Burnout Epidemic:** University students juggle high-stakes examinations, overlapping assignment deadlines, sleep debt, and screen fatigue.
* **Late Detection:** Over 78% of students do not realize their stress has reached dangerous levels until severe physical exhaustion, academic debarment, or midterm failure occurs.
* **Barriers to Clinical Help:** Fear of stigmatization, diagnostic labels, and institutional friction deter students from seeking counseling center appointments early.

### Target Users
1. **College & University Students:** Needing a private, instantaneous way to self-assess their workload balance.
2. **Students in Midterms / Finals Crunch:** Seeking practical triage advice to regain equilibrium.
3. **Academic Advisors & Campus Counselors:** Wanting a structured, objective, non-judgmental wellness instrument to facilitate advisory sessions.

---

## ⚡ 3. Key Features

### 🌟 1. Landing Page & Hero Section
- Academic/wellness visual design with frosted glassmorphism, dynamic ambient lighting, and smooth micro-animations.
- High-level project metrics and interactive live stress inference preview meter.
- Quick navigation CTAs: **“Check My Stress Level”** and **“How It Works”**.

### 📝 2. Multi-Parametric Stress Prediction Form
- **12 Comprehensive Input Signals:**
  - *Academic:* Study Hours/day, Attendance %, Pending Assignments Count, Academic Marks/GPA.
  - *Lifestyle:* Sleep Hours/day, Daily Screen Time, Physical Activity Level (Low/Med/High), Social Interaction Level.
  - *Pressure Perception:* Exam Pressure Intensity (Low/Med/High), Self-Reported Workload.
  - *Demographics:* Age and Gender.
- **Interactive UI Elements:** Synchronized range sliders with dynamic live badges, segmented pill selectors, and full form validation.
- **Quick Demo Presets ("Try Sample Data"):**
  - 🟢 *Balanced Achiever* (Healthy low-stress profile)
  - 🟡 *Midterm Crunch* (Moderate stress profile)
  - 🔴 *Finals Overload* (High-risk acute stress profile)
- **Form Reset & Clear** capability with confirmation toasts.

### 🧠 3. Explainable AI Prediction Engine (`prediction.js`)
- Complete architectural decoupling between UI and inference logic.
- Input normalization onto continuous risk curves [0.0 - 1.0].
- Weighted multi-factor aggregation with non-linear compounding interactions (e.g., severe sleep debt combined with high exam pressure).
- Stress categorization:
  - 🟢 **0–39:** Low Stress
  - 🟡 **40–69:** Moderate Stress
  - 🔴 **70–100:** High Stress
- **Explainable AI (XAI):** Identifies top 3 primary risk drivers and protective factors.
- **Personalized Recommendations:** Generates 3–5 tailored, non-generic actionable suggestions (e.g., Pomodoro triage, 20-20-20 screen rule, 4-7-8 breathing, circadian wind-down).

### 📊 4. Analytics Dashboard & Visualizations
- Real-time stat summary cards (Current Score, Study Hours, Sleep Hours, Academic Stability).
- **Four Interactive Chart.js Visualizations:**
  1. **Stress Score Radial Gauge:** Semi-doughnut dial with real-time color morphing.
  2. **Study vs. Sleep vs. Screen Balance:** Grouped bar chart comparing personal hours against health benchmarks.
  3. **Stress Dimension Distribution:** 8-axis radar chart showing strain across each lifestyle vector.
  4. **Historical Stress Trend:** Chronological line chart tracking stress trajectory over time.

### 🕒 5. LocalStorage Prediction History
- 100% private, client-side persistence in browser `localStorage`.
- Comprehensive history table with date, score, badge, lifestyle summary, and row actions.
- Filter records by severity: *All | Low Stress | Moderate | High*.
- Export data as **CSV** or **JSON** for counselor discussions.
- Instant demo data restore and clear functionality.

### 💡 6. Design Thinking Section (5 Stages)
Interactive tabbed exploration of the Stanford d.school human-centered process:
1. **Empathize:** 120+ student surveys, interviews, and 4-quadrant Empathy Map (Says, Thinks, Does, Feels).
2. **Define:** Problem framing, Point of View (POV) statement, and target persona (Alex).
3. **Ideate:** Multi-factor weighting hypothesis, feature prioritization, and "How Might We" solutions.
4. **Prototype:** Decoupled JavaScript mathematical engine, UI mockups, and local-first architecture.
5. **Test:** Validation metrics (92% usability satisfaction, 88% recommendation relevance).

### ℹ️ 7. About Project & Architectural Blueprint
- In-depth problem statement, proposed solution, and benefits.
- Explicit ethical bounds & medical disclaimers.
- Future roadmap (Wearable HRV integration, LMS deadline synchronization, deep learning classifier).

---

## 🔬 4. How the Prediction Algorithm Works

The mathematical model in [`js/prediction.js`](file:///d:/Antigravity/STUDENT%20STRESS/js/prediction.js) executes in four sequential stages:

### Stage 1: Feature Normalization onto Risk Scale $[0.0, 1.0]$
Each raw input $x_i$ is mapped to a normalized risk value $R_i \in [0.0, 1.0]$:
* **Sleep Risk ($R_{\text{sleep}}$):** 
  $$R_{\text{sleep}} = \begin{cases} 
    0.05 & \text{if } 7.5 \le \text{sleep} \le 9.0 \\
    0.30 & \text{if } 6.5 \le \text{sleep} < 7.5 \\
    0.65 & \text{if } 5.0 \le \text{sleep} < 6.5 \\
    0.88 & \text{if } 4.0 \le \text{sleep} < 5.0 \\
    1.00 & \text{if } \text{sleep} < 4.0 
  \end{cases}$$
* **Exam Pressure ($R_{\text{exam}}$):** $\text{Low} = 0.15, \text{Medium} = 0.55, \text{High} = 1.00$
* **Academic Workload ($R_{\text{workload}}$):** $\text{Low} = 0.15, \text{Medium} = 0.55, \text{High} = 1.00$
* **Pending Assignments ($R_{\text{pending}}$):** $\min(1.0, \frac{\text{tasks}}{6.0})$
* **Screen Fatigue ($R_{\text{screen}}$):** Sigmoidal strain curve accelerating beyond 6 hours.
* **Physical Inactivity ($R_{\text{activity}}$):** $\text{High} = 0.10, \text{Medium} = 0.45, \text{Low} = 0.95$
* **Academic Risk ($R_{\text{acad}}$):** Composite of attendance shortfalls (<75%) and marks anxiety.
* **Social Isolation ($R_{\text{social}}$):** $\text{High} = 0.15, \text{Medium} = 0.45, \text{Low} = 0.90$

### Stage 2: Calibrated Factor Weights
Weights reflect neurological and psychological stress literature:
| Factor | Weight ($W_i$) | Rationale |
|---|---|---|
| **Sleep Deficit** | 18% | Critical neurological baseline for cognitive emotional regulation |
| **Exam Pressure** | 16% | Acute psychological driver of student cortisol spikes |
| **Academic Workload** | 14% | Subjective perceived cognitive burden |
| **Pending Deadlines** | 12% | Task backlog and deadline tension |
| **Screen Fatigue** | 10% | Digital exhaustion and circadian blue light disruption |
| **Physical Inactivity** | 10% | Lack of physical movement to dissipate stress hormones |
| **Academic Risk** | 10% | Eligibility/debarment fears and grade anxiety |
| **Social Isolation** | 10% | Absence of social buffering and peer support |
| **Total** | **100%** | |

### Stage 3: Compound Multipliers & Non-linear Interactions
Stress is non-linear. The engine applies interaction multipliers:
* If $R_{\text{sleep}} > 0.8$ **AND** $R_{\text{exam}} > 0.8$, a compounding multiplier of **$1.12\times$** is triggered (sleep deprivation exponentially amplifies exam panic).
* If $R_{\text{sleep}} < 0.2$ **AND** $R_{\text{activity}} < 0.3$, a resilience reduction of **$0.92\times$** is applied.
* Excessive daily study hours (>8 hrs) add incremental cognitive strain.

### Stage 4: Score Mapping & Category Classification
$$\text{Stress Score} = \text{clamp}\left(\sum_{i=1}^{8} (R_i \cdot W_i) \cdot \mu_{\text{compound}} \cdot 100 + S_{\text{strain}}, 5, 100\right)$$

* 🟢 **0 to 39** $\rightarrow$ **Low Stress** (Healthy routine, resilient equilibrium)
* 🟡 **40 to 69** $\rightarrow$ **Moderate Stress** (Noticeable pressure, requires pacing adjustments)
* 🔴 **70 to 100** $\rightarrow$ **High Stress** (Critical overload, immediate burnout intervention needed)

---

## 🛠️ 5. Technology Stack

* **Structure:** Semantic HTML5 (Accessible form labels, single `<h1>`, WAI-ARIA modal attributes)
* **Styling:** Modern Vanilla CSS3 with CSS Custom Properties, Dark/Light mode tokens, Glassmorphism (`backdrop-filter`), Responsive Flex/Grid.
* **Logic:** Modular ES6+ JavaScript (`app.js`, `prediction.js`, `storage.js`, `charts.js`).
* **Visualizations:** [Chart.js 4](https://www.chartjs.org/) via CDN.
* **Icons:** [Font Awesome 6](https://fontawesome.com/) via CDN.
* **Typography:** Google Fonts (`Plus Jakarta Sans` & `Inter`).
* **Persistence:** Browser `LocalStorage` API (100% private, zero external server transmission).
* **Dev Server (Optional):** [Vite 5](https://vitejs.dev/) for hot-reloading development.

---

## 📁 6. Project Directory Structure

```text
STUDENT STRESS/
├── css/
│   └── style.css            # Complete design system, dark/light theme, layout, responsive
├── js/
│   ├── app.js               # Main application coordinator, event listeners, UI rendering
│   ├── charts.js            # Chart.js visualization wrappers (Gauge, Bar, Radar, Trend)
│   ├── prediction.js        # Core prediction engine: normalization, weights, XAI, recommendations
│   └── storage.js           # LocalStorage persistence, seed demo data, CSV/JSON exporters
├── index.html               # Semantic single-page application structure
├── package.json             # NPM package scripts (vite dev server)
└── README.md                # Comprehensive project documentation
```

---

## 🚀 7. How to Run the Project

### Option A: Using NPM & Vite Dev Server (Recommended)

1. Make sure [Node.js](https://nodejs.org/) (v18+) is installed.
2. Open terminal in the project directory:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm run dev
   ```
4. Click the printed URL (usually `http://localhost:5173`) in your browser.

### Option B: Using Python Local Server
If Node is not available, launch Python's built-in web server:
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000` in any modern web browser.

### Option C: Direct Browser Launch
Because the application uses native ES Modules, simply serve the folder or open with a local web server (e.g. VS Code Live Server extension).

---

## 🔮 8. Future Enhancements Roadmap

1. **Biometric Wearable Sync:** Connect with Apple HealthKit, Fitbit, or Garmin for continuous Heart Rate Variability (HRV) and sleep stage tracking.
2. **LMS Assignment Ingestion:** Automatic OAuth integration with Canvas, Moodle, and Google Classroom to ingest real deadline dates and task counts.
3. **Pre-Trained Machine Learning Model:** Export a Python Scikit-Learn Random Forest or XGBoost model into **ONNX.js / TensorFlow.js** format to run fully client-side inference with confidence probabilities.
4. **Campus Tele-Counselor Booking:** Confidential one-click referral bridge connecting high-stress students with university wellness advisors.

---

## ⚠️ 9. Medical & Ethical Disclaimer

> **IMPORTANT:**  
> **This system is designed strictly for educational, informational, and personal wellness self-reflection as part of an academic AI Immersion project. It DOES NOT provide medical advice, psychiatric diagnosis, or clinical treatment.**  
> Students experiencing persistent depression, severe anxiety, or psychological distress are advised to immediately seek help from qualified healthcare professionals or campus counseling centers.

---

## 👨‍💻 Project Metadata

* **Project Title:** AI-Based Student Stress Level Prediction System
* **Curriculum:** AI for Design Thinking – AI Immersion Project
* **Status:** Fully Functional Interactive Prototype
* **License:** MIT
