# TN FITNESS TRACKER

A modern, responsive, full-featured **Fitness Tracker & Workout Planner Web Application** built with semantic HTML5, modern CSS3, and Vanilla JavaScript.

---

## 🌟 Key Features

### 1. Authentication (Login & Register)
- **Sticky Navigation Bar**: Dynamic state showing `Login` / `Register` buttons when logged out, or `User Chip (Avatar + Name)` + `Logout` button when logged in.
- **Register Modal**: Full Name, Email, Password, Confirm Password, Fitness Goal selection, full validation, and persistent `localStorage` user accounts.
- **Login Modal**: Email, Password, instant credential validation, and "Forgot Password" recovery flow.
- **Demo Account Pre-Seeded**: `demo@fitness.app` / `fitness123` (`Nithin Inti`).

### 2. Interactive Fitness Calendar
- **Full Month Navigation**: Month & Year title with `< Previous Month`, `Next Month >`, and quick `Today` jump buttons.
- **Date Selection**: Click any date cell to view and manage scheduled activities.
- **Visual Workout Indicators**:
  - 🟠 Orange dots for scheduled workouts.
  - 🟢 Emerald dots and border accents for completed workouts.
- **Workout Item Management**:
  - Checkbox toggle to mark workouts as **Completed** (instantly updates streaks and dashboard totals).
  - Delete button to remove workouts.
  - "+ Schedule Workout" modal for any selected date (Title, Category, Date, Duration min, Calories burned).

### 3. Comprehensive Fitness Dashboard
- **Personalized Welcome Greeting**: Displays the logged-in user's name and daily readiness score.
- **Live Clock & Date Banner**: Real-time local digital clock and formatted date.
- **Core Metric Cards**:
  - **Daily Steps**: Progress bar, remaining steps to goal, and `+1,000` quick increment button.
  - **Calories Burned**: Total burn tracking based on daily basal activity and completed workouts.
  - **Workout Duration**: Total minutes exercised today with a direct link to the timer.
  - **Water Intake**: Hydration tracker synced with the 8-glass visual logger.
- **Live Heart-Rate Monitor**:
  - Animated pulsing cardiac indicator and simulated live BPM fluctuations.
  - Resting BPM, Peak BPM, and Cardio Zone status.

### 4. 7 Workout Training Categories
Each category includes target stats, estimated burn rate, and quick actions:
1. 🏃 **Running** (Cardio & Stamina · 450 kcal/hr · High Intensity)
2. 🚴 **Cycling** (Leg Endurance & VO2 · 520 kcal/hr · Moderate-High)
3. 🏋️ **Strength Training** (Hypertrophy & Power · 380 kcal/hr · High Intensity)
4. 🧘 **Yoga** (Flexibility & Mind-Body · 180 kcal/hr · Low-Moderate)
5. 🤸 **Stretching** (Mobility & Recovery · 140 kcal/hr · Low Intensity)
6. 🏊 **Swimming** (Full-Body Conditioning · 500 kcal/hr · High Intensity)
7. 🚶 **Walking** (Daily Habit & Active Recovery · 220 kcal/hr · Gentle)

- **⚡ Start**: Launches the Focus Workout Timer modal with preset duration.
- **📅 Schedule**: Pre-fills the Add Workout modal with category defaults and opens calendar scheduling.

### 5. Workout Focus Timer
- Full-screen focus dialog with large digital countdown (MM:SS).
- Start, Pause, and Reset controls.
- Preset duration selectors (15m, 30m, 45m, 60m).
- **Web Audio API Synth Chimes**: Plays a custom 4-tone celebration chime upon timer completion with automatic logging.

### 6. Progress Analytics & Dynamic Chart
- **Canvas-Powered Activity Volume Chart**: Visualizes weekly/monthly step trends and workout frequency.
- **Interactive Water Tracker**: 8 clickable glasses, streak tracker, and quick "+1 Glass" / "Reset" controls.
- **Automatic BMI Calculator**: Real-time BMI score, category badge (Healthy, Underweight, Overweight, High Range), and tailored fitness recommendations.

### 7. Profile & Fitness Goals
- Customizable user details (Full Name, Age, Height, Weight, Fitness Goal, Activity Level).
- Customizable daily target thresholds (Steps goal, Water goal, Calorie target, Workout minutes).

### 8. Theme Customization & Local-First Storage
- Toggle between **Dark Mode** and **Light Mode** (saved in `localStorage`).
- Zero backend or external build tools required — runs instantly in any browser.

---

## 🚀 How to Run Locally

### Option 1: Open Directly in Browser
- Double-click `index.html` in File Explorer, or right-click `index.html` > **Open with** > **Google Chrome** / **Microsoft Edge**.

### Option 2: Run via VS Code / Antigravity IDE
- Press **`F5`** or click **Run and Debug** to launch `index.html`.

### Option 3: Run via Local HTTP Server
```powershell
python -m http.server 8080
```
Then navigate to `http://localhost:8080` in your web browser.

---

## 📁 File Structure

```text
FitnessTracker/
├── index.html         # Semantic HTML5 layout and modal dialogs
├── style.css          # Design system, glassmorphic styles, themes, responsive CSS
├── script.js          # Auth, calendar engine, timer, metrics, and storage logic
├── .vscode/
│   └── launch.json    # IDE browser launch configuration
└── README.md          # Project documentation
```
